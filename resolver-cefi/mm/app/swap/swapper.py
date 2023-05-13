import asyncio
import json
import logging
from typing import Any

from aioredis import Redis
from eth_abi import encode as abi_encode
from eth_keys import keys  # type: ignore
from hexbytes import HexBytes
from rlp import encode as rlp_encode  # type: ignore
from web3.auto import w3

from app.blockchain.beacon import get_receipts_by_block
from app.blockchain.beacon import get_slot_by_block_number
from app.blockchain.beacon import get_state_by_slot
from app.blockchain.node import ContractCallParams
from app.blockchain.node import Node
from app.blockchain.node import NodeProviderException
from app.config import cfg
from app.gas_price.estimate import gas_price_estimate
from app.model.ins import Order
from app.utils.http.client import HttpClient

from .abi import ABI


logger = logging.getLogger(__name__)

TxId = str
Proof = str
Receipt = dict[str, Any]

CONTRACT = w3.eth.contract(abi=ABI)

FINAL_GAS_OVERHEAD = 100_000
EIP1559_CHAINS = ('1', '137', '5')


RECOMENDED_CONFIRMATIONS = {
    '137': 1,
    '1': 1,
    '100': 1,
    '250': 1,
    '5': 1,
}

BLOCK_TIMES = {
    '137': 1,
    '1': 12,
    '100': 5,
    '250': 1,
    '5': 12,
}

SEND_TOPIC = '0x23164bf06272e7181c46edaa1489d6e021bab6e2ee7972b9662b467774dc4957'
RECEIVE_TOPIC = '0xebd49f22611487a9df09f5dfbcabfa4aa714bf6c3859fa6d901fba02e205f71f'


class SwapperException(Exception):
    pass


class SendTransactionException(SwapperException):
    pass


class TransactionFailedInBlockchain(SwapperException):
    pass


class ByteEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:  # pylint: disable=inconsistent-return-statements
        if isinstance(o, bytes):
            return '0x' + o.hex()
        if isinstance(o, HexBytes):
            return o.hex()
        super().default(o)


class SwapperSignature(keys.Signature):
    @property
    def vs_bytes(self) -> bytes:
        vs = (self.v << 255) | self.s
        return w3.to_bytes(vs)

    @property
    def r_bytes(self) -> bytes:
        return w3.to_bytes(self.r)

    @property
    def v(self) -> int:
        return self._v

    @v.setter
    def v(self, value: int) -> None:
        self._v = value % 27


class Swapper:
    def __init__(self, http: HttpClient, redis: Redis, chain_id: str) -> None:
        self.node = Node(chain_id, http)
        self._http = http
        self._redis = redis
        self.chain_id = chain_id
        self.swapper = cfg.contract.swapper_addresses[chain_id]

    def tuple_from_order(self, order: Order) -> tuple[Any, ...]:
        order_tuple = (
            w3.to_checksum_address(order.from_actor),
            int(order.from_chain),
            w3.to_checksum_address(order.from_token),
            int(order.from_amount),
            w3.to_checksum_address(order.to_actor),
            int(order.to_chain),
            w3.to_checksum_address(order.to_token),
            int(order.to_amount),
            int(order.collateral_chain),
            0,
            # int(order.collateral_amount),
            int(order.collateral_unlocked),
            int(order.deadline),
            int(order.nonce),
        )
        return order_tuple

    async def receive_order_asset(
        self, order: Order, signature: str, permit_transaction: str | None
    ) -> tuple[Receipt, TxId]:
        sig = SwapperSignature(signature_bytes=bytes.fromhex(signature[2:]))
        logger.info('Attempt to form receive order asset function with %s order', order.json())
        data = CONTRACT.encodeABI(
            'receiveOrderAsset',
            [
                self.tuple_from_order(order),
                sig.r_bytes,
                sig.vs_bytes,
            ],
        )
        if permit_transaction:
            data = CONTRACT.encodeABI(
                'multicall',
                [
                    [
                        bytes.fromhex(permit_transaction[2:]),
                        bytes.fromhex(data[2:]),
                    ]
                ],
            )
        txid = await self.send_transaction(data)
        logs = await self.wait_for_transaction_to_confirm(txid)
        return logs, txid

    async def send_order_asset(self, order: Order) -> tuple[Receipt, TxId]:
        data = CONTRACT.encodeABI(
            'sendOrderAsset',
            [
                self.tuple_from_order(order),
            ],
        )
        txid = await self.send_transaction(data)
        logs = await self.wait_for_transaction_to_confirm(txid)
        return logs, txid

    async def get_event_proof(self, receipt: Receipt, topic: str) -> str:
        # pylint: disable=too-many-locals
        block_number = receipt['blockNumber']
        slot = await get_slot_by_block_number(self._http, self.chain_id, block_number)
        slot_number = int(slot['data']['message']['slot'])  # type: ignore
        receipts_root = slot['data']['message']['body']['execution_payload']['receipts_root']  # type: ignore
        state = await get_state_by_slot(self._http, self.chain_id, slot_number)
        receipts = await get_receipts_by_block(self._http, self.chain_id, block_number)
        tx_index = receipt['transactionIndex']
        tx_index_rlp_encoded = rlp_encode(tx_index)
        result = await self._http.post(
            f'{cfg.proof.url}/api/v0/proofs',
            json={
                'state': state,
                'block': json.dumps(slot, cls=ByteEncoder),
                'receipts': json.dumps(receipts, cls=ByteEncoder),
                'txIndex': '0x' + tx_index_rlp_encoded.hex(),
                'chain': self.chain_id,
            },
        )
        receipt_proof = [bytes.fromhex(pr[2:]) for pr in result['receiptProof']]
        receipts_root_proof = [bytes.fromhex(pr[2:]) for pr in result['receiptsRootProof']]
        # struct EventProof {
        #     uint64 srcSlot;
        #     uint64 txSlot;
        #     bytes32[] receiptsRootProof;
        #     bytes32 receiptsRoot;
        #     bytes[] receiptProof;
        #     bytes txIndexRLPEncoded;
        #     uint256 logIndex;
        # }
        log_index = next(k for k, l in enumerate(receipt['logs']) if l['topics'][0].hex() == topic)
        proof = abi_encode(
            ('(uint64,uint64,bytes32[],bytes32,bytes[],bytes,uint256)',),
            (
                (
                    slot_number,
                    slot_number,
                    receipts_root_proof,
                    bytes.fromhex(receipts_root[2:]),
                    receipt_proof,
                    tx_index_rlp_encoded,
                    log_index,
                ),
            ),
        )
        return '0x' + proof.hex()

    async def confirm_order_asset_send(self, order: Order, proof: str) -> TxId:
        data = CONTRACT.encodeABI(
            'confirmOrderAssetSend',
            [self.tuple_from_order(order), bytes.fromhex(proof[2:])],
        )
        txid = await self.send_transaction(data)
        return txid

    async def get_send_proof(
        self,
        receipt: Receipt,
    ) -> str:
        return await self.get_event_proof(receipt, SEND_TOPIC)

    async def wait_for_transaction_to_confirm(self, txid: TxId) -> Receipt:
        while True:
            sleep_time = BLOCK_TIMES.get(self.chain_id, 1)
            logger.info('Awaiting tx %s - sleeping for %s', txid, sleep_time)
            await asyncio.sleep(sleep_time)
            try:
                tx = await self.node.get_transaction(txid)
            except NodeProviderException as e:
                logger.error('Tx %s not found yet - %s', txid, str(e))
                continue
            if not tx['blockNumber']:
                logger.error('Tx %s does not have block number yet', txid)
                continue

            block, receipt = await asyncio.gather(self.node.get_block_number(), self.node.get_transaction_receipt(txid))
            confirmations = RECOMENDED_CONFIRMATIONS.get(self.chain_id, 2)
            if not bool(receipt['status']):
                raise TransactionFailedInBlockchain(f'Tx {txid} failed')

            current_confirms = block - int(tx['blockNumber'])
            if current_confirms < confirmations:
                logger.error('Tx %s does not have enough confirms yet (%s/%s)', txid, current_confirms, confirmations)
                continue
            logger.info('Tx %s reached enough confirms! (%s/%s)', txid, current_confirms, confirmations)
            return receipt

    async def estimate_gas_price(self) -> int:
        gp = await gas_price_estimate(self._http, self._redis, self.chain_id)
        return gp.avg

    async def send_transaction(self, data: str) -> TxId:
        estimate_gas_params = ContractCallParams(
            from_address=cfg.maker.address, contract_address=self.swapper, data=data, value=None
        )
        try:
            gas = await self.node.estimate_gas(estimate_gas_params)
        except NodeProviderException as e:
            logger.error('Reverted: %s', data)
            raise SendTransactionException(str(e)) from e
        gas += FINAL_GAS_OVERHEAD
        nonce = await self.node.get_transaction_count(cfg.maker.address)
        gas_price = await self.estimate_gas_price()
        if self.chain_id in EIP1559_CHAINS:
            max_priority = await self.node.max_priority_fee()
            tx = {
                'type': '0x2',
                'nonce': nonce,
                'to': w3.to_checksum_address(self.swapper),
                'value': 0,
                'gas': gas,
                'chainId': int(self.chain_id),
                'maxFeePerGas': gas_price,
                'maxPriorityFeePerGas': int(max_priority),
                'data': data,
            }
        else:
            tx = {
                'nonce': nonce,
                'to': w3.to_checksum_address(self.swapper),
                'value': 0,
                'gas': gas,
                'chainId': int(self.chain_id),
                'gasPrice': gas_price,
                'data': data,
            }
        signed_tx = w3.eth.account.sign_transaction(tx, cfg.maker.private_key)
        logger.info(signed_tx)
        txid = await self.node.send_raw_transaction(signed_tx.rawTransaction)
        return txid

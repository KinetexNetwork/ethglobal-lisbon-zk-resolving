from fastapi import APIRouter
from fastapi import Depends

from app.blockchain.permit import encode_permit_struct
from app.blockchain.permit2 import encode_permit2_struct
from app.config import cfg
from app.model.ins import PermitMode
from app.model.ins import TokenAmount
from app.model.outs import PermitData
from app.model.outs import PermitTransaction
from app.model.outs import TokenAmountStr
from app.swap.permit import permit
from app.swap.permit import permit_dai
from app.swap.permit import permit_uniswap
from app.utils.constants import MAX_UINT256_VALUE
from app.utils.http.client import HttpClient
from app.utils.http.client import get_http_client


router = APIRouter()

DAI_TOKENS: dict[str, str] = {}


@router.get(
    '/api/v0/permit/data',
    tags=['Permit'],
    summary='Get permit data',
    description='Returns token permit data to sign',
    operation_id='get_permit_data',
    response_model=PermitData,
)
async def get_permit_data(
    chain_id: str,
    token_address: str,
    user_address: str,
    mode: PermitMode = PermitMode.PERMIT,
    amount: TokenAmount | None = None,
    http: HttpClient = Depends(get_http_client),
) -> PermitData:
    contract_address = cfg.contract.swapper_addresses[chain_id]
    if mode == PermitMode.PERMIT:
        data, deadline = await encode_permit_struct(
            http,
            user_address,
            token_address,
            contract_address,
            chain_id,
            amount,
        )
    else:
        assert amount
        data, deadline = encode_permit2_struct(
            user_address,
            token_address,
            contract_address,
            chain_id,
            amount,
        )
    return PermitData(
        chain_id=chain_id,
        token_address=token_address,
        user_address=user_address,
        amount=TokenAmountStr(amount) if amount is not None else None,
        deadline=deadline,
        permit_data=data,
        mode=mode,
    )


@router.get(
    '/api/v0/permit/transaction',
    tags=['Permit'],
    summary='Gets permit transaction',
    description='Returns tokens permit signature',
    operation_id='get_permit_transaction',
    response_model=PermitTransaction,
)
async def get_permit_transaction(
    chain_id: str,
    token_address: str,
    user_address: str,
    deadline: TokenAmount,
    permit_signature: str,
    amount: TokenAmount | None = None,
    mode: PermitMode = PermitMode.PERMIT,
) -> PermitTransaction:
    if mode == PermitMode.PERMIT2:
        assert amount
        data = permit_uniswap(user_address, token_address, amount, deadline, permit_signature)
    elif token_address == DAI_TOKENS.get(chain_id, ''):
        data = permit_dai(user_address, token_address, True, deadline, permit_signature)
    else:
        permit_amount = amount or MAX_UINT256_VALUE
        data = permit(user_address, token_address, permit_amount, deadline, permit_signature)
    return PermitTransaction(transaction=data)

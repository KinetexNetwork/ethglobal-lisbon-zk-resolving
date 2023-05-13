import asyncio

from fastapi import APIRouter
from fastapi import Depends

from app.blockchain.allowance import check_allowance
from app.blockchain.approve import form_approve_data
from app.blockchain.permit2 import PERMIT2_ADDRESS
from app.blockchain.permit2 import PERMIT2_CHAINS
from app.config import cfg
from app.model.outs import AllowanceInfo
from app.model.outs import TokenAmountStr
from app.model.outs import TransactionData
from app.utils.http.client import HttpClient
from app.utils.http.client import get_http_client


router = APIRouter()


async def _get_permit2_allowance(
    http: HttpClient,
    chain_id: str,
    user_address: str,
    token_address: str,
) -> int | None:
    if chain_id not in PERMIT2_CHAINS:
        return None
    return await check_allowance(http, chain_id, token_address, user_address, PERMIT2_ADDRESS)


@router.get(
    '/api/v0/allowance',
    tags=['Approve'],
    summary='Get allowance',
    description='Returns token allowance',
    operation_id='get_allowance',
    response_model=AllowanceInfo,
)
async def get_allowance(
    chain_id: str,
    token_address: str,
    user_address: str,
    http: HttpClient = Depends(get_http_client),
) -> AllowanceInfo:
    contract_address = cfg.contract.swapper_addresses[chain_id]
    allowance, allowance_p2 = await asyncio.gather(
        check_allowance(http, chain_id, token_address, user_address, contract_address),
        _get_permit2_allowance(http, chain_id, user_address, token_address),
    )
    return AllowanceInfo(
        chain_id=chain_id,
        token_address=token_address,
        user_address=user_address,
        contract_address=contract_address,
        allowance=TokenAmountStr(allowance),
        allowance_p2=TokenAmountStr(allowance_p2) if allowance_p2 else None,
    )


@router.get(
    '/api/v0/approve',
    tags=['Approve'],
    summary='Get approve',
    description='Returns call data to approve token',
    operation_id='get_approve',
    response_model=TransactionData,
)
async def get_approve(
    chain_id: str,
    token_address: str,
    user_address: str,
    p2_contract: bool = False,
) -> TransactionData:
    contract_address = cfg.contract.swapper_addresses[chain_id]
    spender_address = PERMIT2_ADDRESS if p2_contract else contract_address
    approve = form_approve_data(spender_address)
    return TransactionData(
        chain_id=chain_id,
        data=approve,
        value=None,
        to_address=token_address,
        from_address=user_address,
    )

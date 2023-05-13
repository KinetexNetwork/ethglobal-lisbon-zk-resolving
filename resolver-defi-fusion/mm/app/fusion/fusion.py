

from app.utils.http.client import HttpClient
from app.config import cfg
import logging

logger = logging.getLogger(__name__)

async def get_quote(http: HttpClient, chain_id: str, from_token_address: str, to_token_address: str, from_amount: int) -> None:
    logger.info(f'{cfg.fusion.url}/api/v0/quote')
    result= await http.get(f'{cfg.fusion.url}/api/v0/quote', params={
        'chain': chain_id,
        'fromTokenAddress': from_token_address,
        'toTokenAddress': to_token_address,
        'amount': from_amount,
    }
    )
    await result['toAmount']

async def place_order(http: HttpClient, chain_id: str, from_token_address: str, to_token_address: str, from_amount: int) -> None:
    await http.post(f'{cfg.fusion.url}/api/v0/order', json={
        'chain': chain_id,
        'fromTokenAddress': from_token_address,
        'toTokenAddress': to_token_address,
        'amount': from_amount,
    }
    )

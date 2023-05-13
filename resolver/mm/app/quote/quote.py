import asyncio
import logging
from decimal import Decimal
from typing import NamedTuple

from aioredis import Redis

from app.config import cfg
from app.config.pairs import Pair as CfgPair
from app.config.pairs import Token as CfgToken
from app.gas_price.estimate import gas_price_estimate
from app.utils.convert import dec_to_int
from app.utils.convert import int_to_dec
from app.utils.http.client import HttpClient


logger = logging.getLogger(__name__)

# this fee includes price change factor
DEFAULT_MM_FEE = Decimal(0.003)  # = 0.3%
COLLATERAL_OVERHEAD = Decimal(0.1)  # = +10%
DEFAULT_RECEIVE_GAS_UNITS = 75_000
DEFAULT_SEND_GAS_UNITS = 50_000

PERMIT_GAS_UNITS = 30_000
DEFAULT_COLLATERAL_DECIMALS = 6


class Token(NamedTuple):
    chain_id: str
    address: str


eth_usdt = Token(chain_id='1', address='0xdAC17F958D2ee523a2206206994597C13D831ec7'.lower())
eth_weth = Token(chain_id='1', address='0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.lower())
gno_usdc = Token(address='0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'.lower(), chain_id='100')
gno_wbtc = Token(address='0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252'.lower(), chain_id='100')
ftm_dai = Token(address='0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E'.lower(), chain_id='250')
goerli_weth = Token(address='0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'.lower(), chain_id='5')


class TokenParams(NamedTuple):
    decimals: int
    symbol: str


SUPPORTED_TOKENS = {
    eth_usdt: TokenParams(decimals=6, symbol='USDT'),
    eth_weth: TokenParams(decimals=18, symbol='ETH'),
    gno_usdc: TokenParams(decimals=6, symbol='USDT'),
    gno_wbtc: TokenParams(decimals=8, symbol='BTC'),
    ftm_dai: TokenParams(decimals=18, symbol='DAI'),
    goerli_weth: TokenParams(decimals=18, symbol='ETH'),
}


NATIVE_SYMBOLS = {'1': 'ETH', '100': 'USDT', '250': 'FTM', '5': 'ETH'}


class OutputAmountEstimationError(Exception):
    pass


async def get_quote_amount(
    http: HttpClient, redis: Redis, from_token: Token, to_token: Token, amount: int, need_permit: bool
) -> int:
    output = await get_output_amount(http, redis, from_token, to_token, amount, need_permit)
    return int(output - output * DEFAULT_MM_FEE)


async def get_gas_fee(
    http: HttpClient, redis: Redis, token_symbol: str, chain_id: str, need_permit: bool, init_chain: bool
) -> Decimal:
    gp = await gas_price_estimate(http, redis, chain_id)
    logger.info('Got gas price for chain %s : %s', chain_id, gp.avg)

    gas_units = DEFAULT_RECEIVE_GAS_UNITS if init_chain else DEFAULT_SEND_GAS_UNITS
    if need_permit:
        gas_units += PERMIT_GAS_UNITS
    native_fee = int_to_dec(gp.avg * gas_units, 18)
    native_symbol = NATIVE_SYMBOLS[chain_id]
    if native_symbol == token_symbol:
        logger.info('Gas fee: %s', native_fee)
        return native_fee
    price = await get_binance_price(http, native_symbol, token_symbol)
    fee = native_fee * price
    logger.info('Gas fee: %s', fee)
    return fee


async def get_collateral_amount(http: HttpClient, token: Token, amount: int) -> int:
    from_params = SUPPORTED_TOKENS.get(token)
    if not from_params:
        raise OutputAmountEstimationError('Pair is not supported')
    from_dec = int_to_dec(amount, from_params.decimals)

    if from_params.symbol in ('USDC', 'DAI', 'USDT'):
        to_dec = from_dec + from_dec * COLLATERAL_OVERHEAD
        to_int = dec_to_int(to_dec, DEFAULT_COLLATERAL_DECIMALS)
        return to_int
    result = await http.get(f'https://www.binance.com/api/v3/ticker/price?symbol={from_params.symbol}USDT')
    logger.info('Got price from binance for %s->%s : %s', from_params.symbol, 'USDT', result['price'])
    to_dec = from_dec * Decimal(result['price'])
    to_int = dec_to_int(to_dec, DEFAULT_COLLATERAL_DECIMALS)
    return to_int


async def get_binance_price(http: HttpClient, from_symbol: str, to_symbol: str) -> Decimal:
    if from_symbol == to_symbol:
        return Decimal(1)
    if from_symbol == 'USDT':
        from_symbol, to_symbol = to_symbol, from_symbol
        convert_price = True
    else:
        convert_price = False
    result = await http.get(f'https://www.binance.com/api/v3/ticker/price?symbol={from_symbol}{to_symbol}')
    logger.info('Got price from binance for %s->%s : %s', from_symbol, to_symbol, result['price'])
    price = Decimal(result['price'])
    if convert_price:
        price = 1 / price
    return price


async def get_output_amount(
    http: HttpClient, redis: Redis, from_token: Token, to_token: Token, amount: int, need_permit: bool
) -> int:
    from_params = SUPPORTED_TOKENS.get(from_token)
    to_params = SUPPORTED_TOKENS.get(to_token)
    if not from_params or not to_params:
        raise OutputAmountEstimationError('Pair is not supported')
    logger.info('Getting quote for %s->%s', from_params.symbol, to_params.symbol)
    cfg_pair = CfgPair(
        from_token=CfgToken(symbol=from_params.symbol.lower(), chain_id=from_token.chain_id),
        to_token=CfgToken(symbol=to_params.symbol.lower(), chain_id=to_token.chain_id),
    )
    if cfg_pair not in cfg.pairs.pairs:
        logger.error('Pairs in cfg: %s', cfg_pair)
        raise OutputAmountEstimationError('Pair is not supported')

    price = await get_binance_price(http, from_params.symbol, to_params.symbol)
    from_dec = int_to_dec(amount, from_params.decimals)
    output_dec = from_dec * price
    first_chain_gas_fee, last_chain_gas_fee = await asyncio.gather(
        get_gas_fee(http, redis, to_params.symbol, from_token.chain_id, need_permit, init_chain=True),
        get_gas_fee(http, redis, to_params.symbol, to_token.chain_id, need_permit=False, init_chain=False),
    )
    gas_fee = first_chain_gas_fee + last_chain_gas_fee
    output_dec -= gas_fee
    return dec_to_int(output_dec, to_params.decimals)

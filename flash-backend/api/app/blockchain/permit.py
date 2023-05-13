import asyncio
import json
from enum import Enum
from time import time

from web3.auto import w3

from app.utils.http.client import HttpClient

from .constants import MAX_PERMIT_VALUE
from .constants import PERMIT_CHAIN_VIA_SALT_TYPES
from .constants import PERMIT_DAI_TYPES
from .constants import PERMIT_TYPES
from .dai import check_dai_nonce
from .name import get_name
from .nonce import check_nonce


class PermitTokenType(str, Enum):
    DEFAULT = 'default'
    CHAIN_VIA_SALT = 'chain_via_salt'
    DAI = 'dai'


EIP2612_CHAIN_VIA_SALT_TOKENS = {
    '137': [
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'.lower(),
    ]
}

DAI_TOKENS = {'137': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'.lower()}


def get_permit_token_type(token_address: str, chain_id: str) -> PermitTokenType:
    if token_address.lower() == DAI_TOKENS.get(chain_id, ''):
        return PermitTokenType.DAI
    if token_address.lower() in EIP2612_CHAIN_VIA_SALT_TOKENS.get(chain_id, []):
        return PermitTokenType.CHAIN_VIA_SALT
    return PermitTokenType.DEFAULT


def get_deadline() -> int:
    return int(time() + 60 * 60)


async def encode_permit_struct(
    http: HttpClient,
    user_address: str,
    token_address: str,
    spender_address: str,
    chain_id: str,
    amount: int | None,
) -> tuple[str, int]:
    token_type = get_permit_token_type(token_address, chain_id)
    deadline = get_deadline()
    permit_value = str(amount) if amount is not None else str(MAX_PERMIT_VALUE)
    match token_type:
        case PermitTokenType.DEFAULT:
            nonce, name = await asyncio.gather(
                check_nonce(http, chain_id, token_address, user_address), get_name(http, chain_id, token_address)
            )
            permit = PERMIT_TYPES.copy()
            message = {
                'owner': w3.to_checksum_address(user_address),
                'spender': w3.to_checksum_address(spender_address),
                'value': permit_value,
                'nonce': str(nonce),
                'deadline': str(deadline),
            }
            domain = {
                'name': name,
                'version': '1',
                'verifyingContract': w3.to_checksum_address(token_address),
                'chainId': int(chain_id),
            }
        case PermitTokenType.CHAIN_VIA_SALT:
            nonce, name = await asyncio.gather(
                check_nonce(http, chain_id, token_address, user_address), get_name(http, chain_id, token_address)
            )
            permit = PERMIT_CHAIN_VIA_SALT_TYPES.copy()
            message = {
                'owner': w3.to_checksum_address(user_address),
                'spender': w3.to_checksum_address(spender_address),
                'value': permit_value,
                'nonce': str(nonce),
                'deadline': str(deadline),
            }
            domain = {
                'name': name,
                'version': '1',
                'verifyingContract': w3.to_checksum_address(token_address),
                'salt': '0x' + int(chain_id).to_bytes(32, 'big').hex(),
            }
        case PermitTokenType.DAI:
            nonce, name = await asyncio.gather(
                check_dai_nonce(http, chain_id, token_address, user_address), get_name(http, chain_id, token_address)
            )
            permit = PERMIT_DAI_TYPES.copy()
            message = {
                'holder': w3.to_checksum_address(user_address),
                'spender': w3.to_checksum_address(spender_address),
                'nonce': str(nonce),
                'expiry': str(deadline),
                'allowed': True,  # type: ignore
            }
            domain = {
                'name': name,
                'version': '1',
                'verifyingContract': w3.to_checksum_address(token_address),
                'chainId': int(chain_id),
            }
        case _:
            assert False
    permit['message'] = message
    permit['domain'] = domain
    return (json.dumps(permit), deadline)

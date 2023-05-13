from eth_keys import keys  # type: ignore
from web3.auto import w3

from .abi import ABI


CONTRACT = w3.eth.contract(abi=ABI)


class PermitSignature(keys.Signature):
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


def permit(
    from_: str,
    token_: str,
    amount_: int,
    deadline_: int,
    signature: str,
) -> str:
    sig = PermitSignature(signature_bytes=bytes.fromhex(signature[2:]))
    data = CONTRACT.encodeABI(
        'permit',
        [
            w3.to_checksum_address(from_),
            w3.to_checksum_address(token_),
            amount_,
            deadline_,
            sig.r_bytes,
            sig.vs_bytes,
        ],
    )
    return data


def permit_dai(
    from_: str,
    token_: str,
    allowed_: bool,
    deadline_: int,
    signature: str,
) -> str:
    sig = PermitSignature(signature_bytes=bytes.fromhex(signature[2:]))
    data = CONTRACT.encodeABI(
        'permitDai',
        [
            w3.to_checksum_address(from_),
            w3.to_checksum_address(token_),
            allowed_,
            deadline_,
            sig.r_bytes,
            sig.vs_bytes,
        ],
    )
    return data


def permit_uniswap(
    from_: str,
    token_: str,
    amount_: int,
    deadline_: int,
    signature_: str,
) -> str:
    data = CONTRACT.encodeABI(
        'permitUniswap',
        [
            w3.to_checksum_address(from_),
            w3.to_checksum_address(token_),
            amount_,
            deadline_,
            bytes.fromhex(signature_),
        ],
    )
    return data

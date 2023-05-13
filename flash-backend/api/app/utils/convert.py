from decimal import Decimal


def int_to_dec(value: int, decimals: int) -> Decimal:
    return Decimal(value * 10**-decimals)


def dec_to_int(value: Decimal, decimals: int) -> int:
    return int(value * 10**decimals)


def hex_to_int(hex_str: str) -> int:
    hex_str = hex_str[2:]  # 0x
    if hex_str == '':
        return 0
    return int(hex_str, 16)

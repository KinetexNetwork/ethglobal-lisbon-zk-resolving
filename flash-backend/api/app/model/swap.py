from pydantic import BaseModel

from .outs import Swap


class CacheSwap(BaseModel):
    swap: Swap
    permit_transaction: str | None
    mm_symbol: str

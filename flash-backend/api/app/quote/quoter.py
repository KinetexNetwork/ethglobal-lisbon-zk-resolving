import asyncio
from datetime import timedelta

from aioredis import Redis

from app.config import cfg
from app.maker.maker import Maker
from app.maker.maker import MMQuote
from app.model.outs import Collateral
from app.model.outs import Quote
from app.model.outs import TokenAmountStr
from app.utils.http.client import HttpClient


DEFAULT_ORDER_TTL = timedelta(hours=2)


class QuoterException(Exception):
    pass


class Quoter:
    def __init__(self, http: HttpClient, redis: Redis) -> None:
        self._http = http
        self._redis = redis

    async def get_best_quote(
        self,
        from_chain_id: str,
        to_chain_id: str,
        from_token_address: str,
        to_token_address: str,
        amount: int,
        mms: list[Maker],
        permit: bool = False,
    ) -> tuple[Quote, Maker]:
        quote_coros = [
            mm.quote(
                self._http,
                from_chain_id,
                to_chain_id,
                from_token_address,
                to_token_address,
                amount,
                permit,
            )
            for mm in mms
        ]
        quotes: list[MMQuote] = await asyncio.gather(*quote_coros)
        quote_and_mms = [(quote, mm) for quote, mm in zip(quotes, mms) if quote]
        if not quote_and_mms:
            raise QuoterException('No quotes found')
        best_quote, best_mm = max(quote_and_mms, key=lambda x: -x[0].to_amount)
        quote = Quote(
            from_chain_id=from_chain_id,
            to_chain_id=to_chain_id,
            from_token_address=from_token_address,
            to_token_address=to_token_address,
            from_amount=TokenAmountStr(amount),
            to_amount=TokenAmountStr(best_quote.to_amount),
            eta=best_quote.eta,
            market_maker=best_mm.info,
            deadline=best_quote.deadline,
            collateral=Collateral(
                chain_id=best_quote.collateral.chain_id,
                token_address=cfg.contract.collateral_token_addresses[best_quote.collateral.chain_id],
                amount=TokenAmountStr(best_quote.collateral.amount),
            ),
        )
        return quote, best_mm

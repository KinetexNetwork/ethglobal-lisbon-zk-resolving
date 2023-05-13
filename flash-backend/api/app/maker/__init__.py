from app.config import cfg
from app.model.outs import MarketMaker

from .maker import Maker


mm0 = Maker(
    symbol='mm0',
    info=MarketMaker(address=cfg.mm_address),
    url=cfg.mm_url,
)

MARKET_MAKERS_BY_SYMBOLS = {'mm0': mm0}

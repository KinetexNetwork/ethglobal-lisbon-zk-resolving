from .health import router as health_router
from .order import router as order_router
from .price import router as price_router
from .quote import router as quote_router


all_routers = [
    health_router,
    price_router,
    order_router,
    quote_router,
]

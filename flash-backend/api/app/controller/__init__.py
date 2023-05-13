from .approve import router as approve_router
from .health import router as health_router
from .permit import router as permit_router
from .quote import router as quote_router
from .swap import router as swap_router


all_routers = [
    health_router,
    approve_router,
    permit_router,
    quote_router,
    swap_router,
]

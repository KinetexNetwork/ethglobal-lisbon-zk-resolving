import logging

from fastapi import FastAPI
from fastapi import Request
from fastapi import Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.controller import all_routers
from app.utils.redis import global_redis


logger = logging.getLogger(__name__)


class App(FastAPI):
    def __init__(self) -> None:
        logging.basicConfig(
            level=logging.INFO,
            format='%(levelname)s: %(message)s',
        )
        # init_tracer(name)

        startup_cbs = [global_redis.on_startup]
        shutdown_cbs = [global_redis.on_shutdown]
        super().__init__(
            title='MM',
            description='Market maker',
            version='v0.0.0',
            on_startup=startup_cbs,
            on_shutdown=shutdown_cbs,
        )
        for router in all_routers:
            self.include_router(router)

        @self.exception_handler(Exception)
        async def handle_exception(request: Request, exc: Exception) -> Response:  # pylint: disable=unused-argument
            return JSONResponse(
                status_code=500,
                content={'detail': 'Internal Server Error'},
            )

        self.add_middleware(GZipMiddleware)


app = App()

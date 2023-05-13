import logging

from fastapi import FastAPI
from fastapi import Request
from fastapi import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.config import cfg
from app.controller import all_routers
from app.utils.redis import global_redis


logger = logging.getLogger(__name__)


class App(FastAPI):
    def __init__(self) -> None:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s.%(msecs)03d %(levelname)s: %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S',
        )

        startup_cbs = [global_redis.on_startup]
        shutdown_cbs = [global_redis.on_shutdown]
        super().__init__(
            title='v2',
            description='v2',
            version='v0.0.0',
            on_startup=startup_cbs,
            on_shutdown=shutdown_cbs,
        )
        for router in all_routers:
            self.include_router(router)

        logger.info('CORS: %s', cfg.cors.origins)
        self.add_middleware(
            CORSMiddleware,
            allow_origins=cfg.cors.origins,
            allow_credentials=True,
            allow_methods=['*'],
            allow_headers=['*'],
        )

        @self.exception_handler(Exception)
        async def handle_exception(request: Request, exc: Exception) -> Response:  # pylint: disable=unused-argument
            return JSONResponse(
                status_code=500,
                content={'detail': 'Internal Server Error'},
            )

        self.add_middleware(GZipMiddleware)


app = App()

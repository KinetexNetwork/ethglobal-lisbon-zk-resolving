import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from typing import Awaitable
from typing import Callable
from typing import Generic
from typing import NoReturn
from typing import TypeVar


logger = logging.getLogger(__name__)


class GlobalObjectException(Exception):
    pass


_T = TypeVar('_T')
_CA = TypeVar('_CA')


class GlobalObject(Generic[_T]):
    def __init__(
        self,
        name: str,
        constructor: Callable[[_CA], Awaitable[_T | None]],
        destructor: Callable[[_T], Awaitable[None]],
        *,
        constructor_arg: _CA,
    ) -> None:
        self._name = name
        self._constructor = constructor
        self._destructor = destructor
        self._constructor_arg = constructor_arg
        self._obj: _T | None = None

    async def on_startup(self) -> None:
        if self._obj is not None:
            logger.error('Startup called for already initialized "%s" global object', self._name)
            self._raise('Double initialization')

        logger.info('Constructing "%s" global object', self._name)
        try:
            self._obj = await self._constructor(self._constructor_arg)
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.error('Error while constructing global "%s": %s', self._name, str(e))
            self._raise('Constructor fail', e)

    async def on_shutdown(self) -> None:
        if self._obj is None:
            return

        logger.info('Destructing "%s" global object', self._name)
        try:
            await self._destructor(self._obj)
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.warning('Error while destructing global "%s": %s', self._name, str(e))
        self._obj = None

    @property
    def object(self) -> _T:
        if self._obj is None:
            logger.error('Access attempt of uninitialized "%s" global object ', self._name)
            self._raise('Uninitialized access')

        return self._obj

    def _raise(self, msg: str, exc: Exception | None = None) -> NoReturn:
        raise GlobalObjectException(msg) from exc


@asynccontextmanager
async def use_global(glob: GlobalObject[_T]) -> AsyncGenerator[_T, None]:
    await glob.on_startup()
    try:
        yield glob.object
    finally:
        await glob.on_shutdown()

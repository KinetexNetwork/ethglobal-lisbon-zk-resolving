import json as jsonlib
from asyncio.exceptions import TimeoutError as AsyncTimeoutError
from contextlib import asynccontextmanager
from contextlib import contextmanager
from datetime import timedelta
from typing import Any
from typing import AsyncGenerator
from typing import Generator
from typing import Mapping
from typing import Sequence

import aiohttp

from .exc import HttpClientException


JsonType = Any  # Can be None
DataType = Any  # Can be None
HeadersType = Mapping[str, str] | None
ParamKeyType = str
ParamValueType = Any
ParamsType = Mapping[ParamKeyType, ParamValueType] | Sequence[tuple[ParamKeyType, ParamValueType]] | None
TimeoutType = timedelta | None
ContentType = str  # Lowercase


async def raise_for_status(resp: aiohttp.ClientResponse) -> None:
    if 400 <= resp.status:
        # reason should always be not None for a started response
        assert resp.reason is not None
        message = await resp.text()
        resp.release()
        raise aiohttp.ClientResponseError(
            resp.request_info, resp.history, status=resp.status, message=message, headers=resp.headers
        )


class HttpClient:
    def __init__(
        self,
        client: aiohttp.ClientSession,
    ) -> None:
        self._client = client

    async def get(
        self,
        url: str,
        params: ParamsType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
        custom_json: bool = False,
    ) -> dict[Any, Any]:
        client_timeout = self._make_client_timeout(timeout)
        client_params = self._make_client_params(params)
        with self._client_exception_wrap():
            resp = await self._client.get(
                url,
                params=client_params,
                headers=headers,
                timeout=client_timeout,
            )
            await raise_for_status(resp)

        if custom_json:
            try:
                text = await resp.text()
                data = jsonlib.loads(text)
            except jsonlib.decoder.JSONDecodeError as e:
                raise HttpClientException(f'Failed to decode custom JSON data: {text}') from e
        else:
            data = await resp.json()
        return data

    async def get_text(
        self,
        url: str,
        params: ParamsType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
    ) -> str:
        client_timeout = self._make_client_timeout(timeout)
        client_params = self._make_client_params(params)
        with self._client_exception_wrap():
            resp = await self._client.get(
                url,
                params=client_params,
                headers=headers,
                timeout=client_timeout,
            )
            await raise_for_status(resp)
        text = await resp.text()
        return text

    async def get_blob(
        self,
        url: str,
        params: ParamsType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
    ) -> tuple[bytes, ContentType]:
        client_timeout = self._make_client_timeout(timeout)
        client_params = self._make_client_params(params)
        with self._client_exception_wrap():
            resp = await self._client.get(
                url,
                params=client_params,
                headers=headers,
                timeout=client_timeout,
            )
            resp.raise_for_status()
            blob = await resp.read()
            content_type = resp.headers.get('Content-Type', '').lower()
        return blob, content_type

    async def post(
        self,
        url: str,
        json: JsonType = None,
        data: DataType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
        custom_json: bool = False,
    ) -> dict[Any, Any]:
        client_timeout = self._make_client_timeout(timeout)
        with self._client_exception_wrap():
            resp = await self._client.post(
                url,
                json=json,
                data=data,
                headers=headers,
                timeout=client_timeout,
            )
            await raise_for_status(resp)

        if custom_json:
            try:
                text = await resp.text()
                data = jsonlib.loads(text)
            except jsonlib.decoder.JSONDecodeError as e:
                raise HttpClientException(f'Failed to decode custom JSON data: {text}') from e
        else:
            data = await resp.json()
        return data

    async def patch(
        self,
        url: str,
        json: JsonType = None,
        data: DataType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
        custom_json: bool = False,
    ) -> dict[Any, Any]:
        client_timeout = self._make_client_timeout(timeout)
        with self._client_exception_wrap():
            resp = await self._client.patch(
                url,
                json=json,
                data=data,
                headers=headers,
                timeout=client_timeout,
            )
            await raise_for_status(resp)

        if custom_json:
            try:
                text = await resp.text()
                data = jsonlib.loads(text)
            except jsonlib.decoder.JSONDecodeError as e:
                raise HttpClientException(f'Failed to decode custom JSON data: {text}') from e
        else:
            data = await resp.json()
        return data

    def _make_client_timeout(
        self,
        timeout: timedelta | None,
    ) -> aiohttp.ClientTimeout | None:
        if timeout is None:
            return None

        client_timeout = aiohttp.ClientTimeout(total=timeout.total_seconds())
        return client_timeout

    def _make_client_params(
        self,
        params: ParamsType | None,
    ) -> list[tuple[str, str]] | None:
        if params is None:
            return None

        client_params: list[tuple[str, str]] = []

        def add_param(key: ParamKeyType, value: ParamValueType) -> None:
            if value is None:
                return

            param = str(key), str(value)
            client_params.append(param)

        if isinstance(params, list):
            for k, v in params:
                add_param(k, v)
        elif isinstance(params, dict):
            for k, v in params.items():
                if isinstance(v, list):
                    for vv in v:
                        add_param(k, vv)
                else:
                    add_param(k, v)

        return client_params

    @contextmanager
    def _client_exception_wrap(
        self,
    ) -> Generator[None, None, None]:
        try:
            yield
        except aiohttp.ClientResponseError as e:
            raise HttpClientException(e.message) from e
        except (aiohttp.ClientError, AsyncTimeoutError) as e:
            raise HttpClientException(str(e)) from e


@asynccontextmanager
async def http_client_ctx() -> AsyncGenerator[HttpClient, None]:
    async with aiohttp.ClientSession() as session:
        yield HttpClient(session)


async def get_http_client() -> AsyncGenerator[HttpClient, None]:
    async with http_client_ctx() as client:
        yield client

from typing import Any

from app.config.auth import AuthConfig

from .client import ContentType
from .client import DataType
from .client import HeadersType
from .client import HttpClient
from .client import JsonType
from .client import ParamsType
from .client import TimeoutType


class HttpClientWithAuth(HttpClient):
    def __init__(  # pylint: disable=super-init-not-called
        self,
        base: HttpClient,
        config: AuthConfig,
    ) -> None:
        self._base = base
        self._config = config

    async def get(
        self,
        url: str,
        params: ParamsType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
        custom_json: bool = False,
    ) -> dict[Any, Any]:
        headers = self._enrich_headers(headers)
        res = await self._base.get(url, params, headers, timeout, custom_json)
        return res

    async def get_blob(
        self,
        url: str,
        params: ParamsType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
    ) -> tuple[bytes, ContentType]:
        headers = self._enrich_headers(headers)
        res = await self._base.get_blob(url, params, headers, timeout)
        return res

    async def post(
        self,
        url: str,
        json: JsonType = None,
        data: DataType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
        custom_json: bool = False,
    ) -> dict[Any, Any]:
        headers = self._enrich_headers(headers)
        res = await self._base.post(url, json, data, headers, timeout, custom_json)
        return res

    async def patch(
        self,
        url: str,
        json: JsonType = None,
        data: DataType = None,
        headers: HeadersType = None,
        timeout: TimeoutType = None,
        custom_json: bool = False,
    ) -> dict[Any, Any]:
        headers = self._enrich_headers(headers)
        res = await self._base.patch(url, json, data, headers, timeout, custom_json)
        return res

    def _enrich_headers(
        self,
        headers: HeadersType,
    ) -> HeadersType:
        # Authentication is disabled
        if not self._config.key:
            return headers

        headers = headers or {}
        headers |= {'E-Authorization': self._config.key}
        return headers


def with_auth(
    client: HttpClient,
    config: AuthConfig,
) -> HttpClientWithAuth:
    client_with_auth = HttpClientWithAuth(client, config)
    return client_with_auth

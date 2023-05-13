import asyncio
import logging
import random
from datetime import timedelta
from decimal import Decimal
from typing import Any

from pydantic import BaseModel

from app.utils.http.client import HttpClient


logger = logging.getLogger(__name__)


class GetLatestGasInfoResult(BaseModel):
    last_block: int
    safe_gas_price: Decimal
    propose_gas_price: Decimal
    fast_gas_price: Decimal


class EtherscanApiException(Exception):
    pass


class EtherscanApiClient:
    def __init__(
        self,
        url: str,
        http_client: HttpClient,
        api_key: str,
    ) -> None:
        self._url = url
        self._http_client = http_client
        self._api_key = api_key
        self._timeout = timedelta(seconds=60)
        self._retry_attempts = 5
        self._rate_limit_delay_range = 0.2, 1.0
        self._rate_limit_delay_range_no_key = 2.0, 5.0

    async def get_latest_gas_info(
        self,
    ) -> GetLatestGasInfoResult:
        request_params = self._make_get_latest_gas_info_request_params()
        gas_info_data = await self._get(request_params)
        result = self._make_get_latest_gas_info_result(gas_info_data)
        return result

    def _make_get_latest_gas_info_request_params(
        self,
    ) -> list[tuple[str, str]]:
        request_params = [
            ('module', 'gastracker'),
            ('action', 'gasoracle'),
        ]
        return request_params

    def _make_get_latest_gas_info_result(
        self,
        gas_info_data: dict[Any, Any],
    ) -> GetLatestGasInfoResult:
        dr = gas_info_data['result']
        result = GetLatestGasInfoResult(
            last_block=int(dr['LastBlock']),
            safe_gas_price=Decimal(dr['SafeGasPrice']),
            propose_gas_price=Decimal(dr['ProposeGasPrice']),
            fast_gas_price=Decimal(dr['FastGasPrice']),
        )
        return result

    async def _get(
        self,
        params: list[tuple[str, str]],
    ) -> dict[Any, Any]:
        url = self._full_url()
        api_key = self._api_key
        if api_key is not None:
            params = [('apikey', api_key), *params]

        attempts = self._retry_attempts
        while attempts > 0:
            resp = await self._http_client.get(
                url,
                params=params,
                timeout=self._timeout,
            )
            res = resp['result']
            res = res.lower() if isinstance(res, str) else ''

            rate_limit = 'max rate limit reached' in res
            if not rate_limit:
                return resp

            # Rate limit retry attempt
            attempts -= 1
            logger.warning('Etherscan API client hit rate limit (%s), %s attempts left', self._url, attempts)
            if api_key is not None:
                min_delay, max_delay = self._rate_limit_delay_range
            else:
                min_delay, max_delay = self._rate_limit_delay_range_no_key
            delay = min_delay + random.random() * (max_delay - min_delay)
            await asyncio.sleep(delay)

        raise EtherscanApiException('Exceeded retry attempts to overcome rate limit')

    def _full_url(
        self,
    ) -> str:
        url = f'{self._url}/api'
        return url

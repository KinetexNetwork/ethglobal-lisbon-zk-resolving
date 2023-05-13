import json
from json import JSONDecodeError
from typing import Any


def _msg_to_dict(msg: str) -> dict[str, Any] | None:
    try:
        data = json.loads(msg)
    except JSONDecodeError:
        data = None
    return data


class HttpClientException(Exception):
    def __init__(self, msg: str | None = None) -> None:
        self.data = _msg_to_dict(msg) if msg else None
        super().__init__(msg)

from __future__ import annotations

from typing import Type

from .env import TEnum
from .env import env
from .env import env_bool
from .env import env_dict
from .env import env_enum
from .env import env_int
from .env import env_list


class Domain:
    def __init__(self, key: str, base: "Domain" | None = None) -> None:
        self._prefix = f"{key}_" if key else ""
        if base is not None:
            self._prefix = base._prefix + self._prefix

    def env(self, key: str, *, default: str | None = None) -> str:
        return env(self._fk(key), default=default)

    def env_enum(self, key: str, enum: Type[TEnum], *, default: TEnum | None = None) -> TEnum:
        return env_enum(self._fk(key), enum, default=default)

    def env_list(self, key: str, *, default: list[str] | None = None) -> list[str]:
        return env_list(self._fk(key), default=default)

    def env_dict(self, key: str, *, default: dict[str, str] | None = None) -> dict[str, str]:
        return env_dict(self._fk(key), default=default)

    def env_bool(self, key: str, *, default: bool | None = None) -> bool:
        return env_bool(self._fk(key), default=default)

    def env_int(self, key: str, *, default: int | None = None) -> int:
        return env_int(self._fk(key), default=default)

    def _fk(self, key: str) -> str:
        return self._prefix + key


ROOT_DOMAIN = Domain("")

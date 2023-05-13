import os
from enum import Enum
from typing import Type
from typing import TypeVar


class EnvException(Exception):
    pass


def env(key: str, *, default: str | None = None) -> str:
    if default is not None:
        return os.environ.get(key, default)

    try:
        return os.environ[key]
    except KeyError as e:
        raise EnvException(f'Environment variable "{key}" is not set') from e


TEnum = TypeVar('TEnum', bound=Enum)


def env_enum(key: str, enum: Type[TEnum], *, default: TEnum | None = None) -> TEnum:
    default_value = None if default is None else default.value
    value = env(key, default=default_value)
    try:
        return enum(value)
    except ValueError as e:
        raise EnvException(f'Environment variable "{key}" contains invalid {enum.__name__} enum value "{value}"') from e


def env_list(key: str, *, default: list[str] | None = None) -> list[str]:
    default_list = None if default is None else ','.join(default)
    value = env(key, default=default_list)
    return value.split(',')


def list_to_dict(values: list[str]) -> dict[str, str]:
    dict_values: dict[str, str] = {}
    for value in values:
        if value:
            k, v = value.split(':')
            dict_values[k] = v
    return dict_values


def env_dict(key: str, *, default: dict[str, str] | None = None) -> dict[str, str]:
    default_dict = None if default is None else ','.join([f'{k}:{v}' for k, v in default.items()])
    value = env(key, default=default_dict)
    return list_to_dict(value.split(','))


_BOOL_VALUES = {
    'true': True,
    't': True,
    'false': False,
    'f': False,
}


def env_bool(key: str, *, default: bool | None = None) -> bool:
    default_bool = None if default is None else str(default)
    value = env(key, default=default_bool)
    try:
        return _BOOL_VALUES[value.lower()]
    except KeyError as e:
        raise EnvException(f'Environment variable "{key}" contains invalid bool value "{value}"') from e


def env_int(key: str, *, default: int | None = None) -> int:
    default_int = None if default is None else str(default)
    value = env(key, default=default_int)
    try:
        return int(value)
    except ValueError as e:
        raise EnvException(f'Environment variable "{key}" contains invalid int value "{value}"') from e

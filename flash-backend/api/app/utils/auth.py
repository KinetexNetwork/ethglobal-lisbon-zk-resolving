from typing import Callable

from fastapi import Header
from fastapi import HTTPException

from app.config import cfg


AuthHeader = str | None
Authenticator = Callable[[AuthHeader], None]


def authenticator(auth_key: str) -> Authenticator:
    def authenticate(e_authorization: str | None = Header(None)) -> None:
        if not auth_key:
            return

        if e_authorization != auth_key:
            raise HTTPException(401, 'Unauthorized')

    return authenticate


authenticate = authenticator(cfg.auth.key)

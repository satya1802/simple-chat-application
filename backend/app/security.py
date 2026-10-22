"""Password hashing, JWT session issuance and the `get_current_user` dependency.

Every authenticated route -- in this router and in the conversation routes
that come later -- imports `get_current_user` from here rather than
re-implementing token verification.
"""

import os
import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RevokedToken, User

# Exposed so the register/login error messages -- and the frontend that reads
# them -- stay in lockstep with the rule actually enforced here.
PASSWORD_MIN_LENGTH = 8

JWT_ALGORITHM = "HS256"
# The platform injects a real secret in deployment; this default only keeps a
# fresh clone runnable, the same pattern `app/database.py` uses for its URL.
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Return a salted bcrypt hash; never store the password itself."""
    return _pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _pwd_context.verify(password, password_hash)


def create_access_token(user_id: uuid.UUID) -> str:
    """Sign a session JWT carrying a unique `jti` so logout can revoke it."""
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def _credentials_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def decode_token(token: str) -> dict:
    """Verify signature, issuer-free claims and expiry; fail closed on error."""
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise _credentials_error() from exc


def get_token_payload(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
) -> dict:
    """The decoded claims of the bearer token, or a 401 if it is missing or bad."""
    if credentials is None or not credentials.credentials:
        raise _credentials_error()
    return decode_token(credentials.credentials)


def get_current_user(
    payload: Annotated[dict, Depends(get_token_payload)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """The authenticated `User`, or a 401 on any verification failure.

    Checked here, not just at sign/verify time: a token that is well-formed
    and unexpired but was revoked by `/auth/logout` must still fail closed.
    """
    jti = payload.get("jti")
    sub = payload.get("sub")
    if not jti or not sub:
        raise _credentials_error()

    if db.query(RevokedToken).filter(RevokedToken.jti == jti).first() is not None:
        raise _credentials_error()

    try:
        user_id = uuid.UUID(str(sub))
    except ValueError as exc:
        raise _credentials_error() from exc

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise _credentials_error()

    return user


__all__ = [
    "PASSWORD_MIN_LENGTH",
    "create_access_token",
    "get_current_user",
    "get_token_payload",
    "hash_password",
    "verify_password",
]

"""Password hashing, JWT issuance, and the request-level auth dependency.

``passlib`` with the bcrypt scheme salts and hashes passwords so the plain text
never reaches the database. ``python-jose`` signs and verifies session tokens
with ``JWT_SECRET`` from the environment.

Logout invalidates a token by recording its ``jti`` (JWT ID) in an in-memory
revocation set. Every protected endpoint funnels through ``get_token_payload``
which rejects revoked tokens, so a logged-out token cannot be reused. The set
is process-local -- sufficient for a single-process deployment and for the
sprint; a multi-process deployment should move it to Redis (see risk note in
the task report).
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_SECRET
from app.database import get_db
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_security_scheme = HTTPBearer()

# Process-local set of revoked JWT IDs. Cleared only by a process restart.
_revoked_jtis: set[str] = set()


def hash_password(password: str) -> str:
    """Return a salted bcrypt digest of *password*."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """True when *plain* matches the bcrypt *hashed* digest."""
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    """Sign a JWT carrying the user id and a unique token id (``jti``)."""
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": user_id,
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": now + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def revoke_token(jti: str) -> None:
    """Mark *jti* as revoked so future requests bearing it are rejected."""
    _revoked_jtis.add(jti)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_token_payload(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_security_scheme)],
) -> dict[str, Any]:
    """Decode and validate the bearer JWT, rejecting revoked tokens.

    Raises 401 for any malformed, expired, or revoked token. Does not reveal
    whether the token ever existed -- the error is identical in every case.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise _unauthorized() from exc

    jti = payload.get("jti")
    if not jti or jti in _revoked_jtis:
        raise _unauthorized()
    return payload


def get_current_user(
    payload: Annotated[dict[str, Any], Depends(get_token_payload)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Resolve the JWT subject to a database row, or 401 if the user is gone."""
    user_id = payload.get("sub")
    if not user_id:
        raise _unauthorized()
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise _unauthorized()
    return user
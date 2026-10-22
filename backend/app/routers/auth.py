"""Auth routes: account creation, session login/logout.

Passwords are hashed with `passlib[bcrypt]` and never stored or returned in
plain text; sessions are `python-jose` JWTs verified by
`app.security.get_current_user`, which the conversation routes import too.
"""

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RevokedToken, User
from app.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutResponse,
    RegisterRequest,
    ResetPasswordRequest,
    StubResponse,
    UserOut,
)
from app.security import (
    create_access_token,
    get_token_payload,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    existing = db.query(User).filter(User.email == body.email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"field": "email", "message": "An account with this email already exists"},
        )

    user = User(email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(
        token=token,
        user=UserOut(id=user.id, email=user.email, created_at=user.created_at),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    user = db.query(User).filter(User.email == body.email).first()
    # Same message either way: an unknown email must not be distinguishable
    # from a wrong password.
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
        )

    token = create_access_token(user.id)
    return AuthResponse(
        token=token,
        user=UserOut(id=user.id, email=user.email, created_at=user.created_at),
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    payload: Annotated[dict, Depends(get_token_payload)],
    db: Annotated[Session, Depends(get_db)],
) -> LogoutResponse:
    jti = payload.get("jti")
    exp = payload.get("exp")
    if jti and db.query(RevokedToken).filter(RevokedToken.jti == jti).first() is None:
        expires_at = datetime.fromtimestamp(exp, tz=UTC) if exp else datetime.now(UTC)
        db.add(RevokedToken(jti=jti, expires_at=expires_at))
        db.commit()
    return LogoutResponse(ok=True)


@router.post("/forgot-password", response_model=StubResponse)
async def forgot_password(body: ForgotPasswordRequest) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="POST /auth/forgot-password")


@router.post("/reset-password", response_model=StubResponse)
async def reset_password(body: ResetPasswordRequest) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="POST /auth/reset-password")

"""Auth routes: register, login, logout, forgot-password, reset-password.

``register``, ``login`` and ``logout`` are implemented per US-001-1.
``forgot-password`` and ``reset-password`` remain stubs -- they are not in this
sprint (see US-003).
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    OkResponse,
    RegisterRequest,
    ResetPasswordRequest,
    StubResponse,
    UserPublic,
)
from app.security import (
    create_access_token,
    get_token_payload,
    hash_password,
    revoke_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

DbSession = Annotated[Session, Depends(get_db)]


def _auth_response(user: User) -> AuthResponse:
    """Build the {token, user} envelope shared by register and login."""
    token = create_access_token(user.id)
    return AuthResponse(
        token=token,
        user=UserPublic(id=user.id, email=user.email, created_at=user.created_at),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: DbSession) -> AuthResponse:
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return _auth_response(user)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: DbSession) -> AuthResponse:
    # The same error for a missing email and a wrong password -- the endpoint
    # never reveals whether the account exists.
    user = db.query(User).filter(User.email == body.email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
        )
    return _auth_response(user)


@router.post("/logout", response_model=OkResponse)
async def logout(payload: Annotated[dict, Depends(get_token_payload)]) -> OkResponse:
    jti = payload.get("jti")
    if jti:
        revoke_token(jti)
    return OkResponse()


# --------------------------------------------------------------------------- #
# Stubs -- not in this sprint (US-003 owns password reset).
# --------------------------------------------------------------------------- #


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(body: ForgotPasswordRequest) -> StubResponse:
    return StubResponse(endpoint="POST /auth/forgot-password")


@router.post("/reset-password", response_model=OkResponse)
async def reset_password(body: ResetPasswordRequest) -> StubResponse:
    return StubResponse(endpoint="POST /auth/reset-password")
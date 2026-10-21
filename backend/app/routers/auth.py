"""Auth routes: one per /auth endpoint the approved api_spec declares.

Session issuance, password hashing (`passlib[bcrypt]`) and JWT signing
(`python-jose`) are the development sprint's work. Each handler here is a
stub that returns a typed placeholder, so the path, method and request
body are fixed -- and validated by FastAPI -- before that work starts.
"""

from fastapi import APIRouter

from app.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    StubResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=StubResponse)
async def register(body: RegisterRequest) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="POST /auth/register")


@router.post("/login", response_model=StubResponse)
async def login(body: LoginRequest) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="POST /auth/login")


@router.post("/logout", response_model=StubResponse)
async def logout() -> StubResponse:
    return StubResponse(endpoint="POST /auth/logout")


@router.post("/forgot-password", response_model=StubResponse)
async def forgot_password(body: ForgotPasswordRequest) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="POST /auth/forgot-password")


@router.post("/reset-password", response_model=StubResponse)
async def reset_password(body: ResetPasswordRequest) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="POST /auth/reset-password")

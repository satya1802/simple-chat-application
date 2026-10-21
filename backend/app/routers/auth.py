"""Auth routes: register, login, logout, forgot-password, reset-password.

Every handler is a stub that returns a typed placeholder, so the service
starts, serves its OpenAPI document and passes its tests before a single
handler is implemented. The request and response models in ``app.schemas``
define the exact shapes the frontend is built against.
"""

from fastapi import APIRouter

from app.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    OkResponse,
    RegisterRequest,
    ResetPasswordRequest,
    StubResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest) -> StubResponse:
    return StubResponse(endpoint="POST /auth/register")


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest) -> StubResponse:
    return StubResponse(endpoint="POST /auth/login")


@router.post("/logout", response_model=OkResponse)
async def logout() -> StubResponse:
    return StubResponse(endpoint="POST /auth/logout")


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(body: ForgotPasswordRequest) -> StubResponse:
    return StubResponse(endpoint="POST /auth/forgot-password")


@router.post("/reset-password", response_model=OkResponse)
async def reset_password(body: ResetPasswordRequest) -> StubResponse:
    return StubResponse(endpoint="POST /auth/reset-password")

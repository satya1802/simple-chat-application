"""Auth router: register, login, logout, forgot-password, reset-password.

Every handler is a stub that raises 501 until its ticket is implemented. The
response_model declarations are already the approved shapes, so the OpenAPI
document the frontend builds against is complete from day one.
"""

from fastapi import APIRouter, HTTPException

from app.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    OkResponse,
    RegisterRequest,
    ResetPasswordRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest) -> AuthResponse:
    """Create account with email and password, return a session token."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest) -> AuthResponse:
    """Authenticate and return a session token; generic error on mismatch."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.post("/logout", response_model=OkResponse)
async def logout() -> OkResponse:
    """Invalidate the current session."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest) -> dict[str, str]:
    """Always confirm neutrally; email a single-use reset link if the account exists."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.post("/reset-password", response_model=OkResponse)
async def reset_password(body: ResetPasswordRequest) -> OkResponse:
    """Consume a valid token and set a new password."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")

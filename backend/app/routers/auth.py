"""Auth endpoints: account creation, session login/logout, password reset.

Generated from the approved API spec (one route per endpoint it declares).
Every handler here is a stub: it validates the request against the agreed
shape and returns a typed placeholder, so the service starts, the OpenAPI
document is complete, and the frontend can be built against it while the real
behaviour -- password hashing (passlib), JWT issuance/verification
(python-jose), and the SendGrid email send -- is written one ticket at a time.
Those features read OPENAI_API_KEY / SENDGRID_API_KEY at the point of use and
degrade with a clear message when a key is unset; that also belongs to the
handler that is not written yet.
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
async def register(_body: RegisterRequest) -> StubResponse:
    """auth: none. Create account with email and password, return a session token."""
    return StubResponse(endpoint="POST /auth/register")


@router.post("/login", response_model=StubResponse)
async def login(_body: LoginRequest) -> StubResponse:
    """auth: none. Authenticate and return a session token; generic error on mismatch."""
    return StubResponse(endpoint="POST /auth/login")


@router.post("/logout", response_model=StubResponse)
async def logout() -> StubResponse:
    """auth: JWT. Invalidate the current session."""
    return StubResponse(endpoint="POST /auth/logout")


@router.post("/forgot-password", response_model=StubResponse)
async def forgot_password(_body: ForgotPasswordRequest) -> StubResponse:
    """auth: none. Always confirm neutrally; email a reset link if the account exists."""
    return StubResponse(endpoint="POST /auth/forgot-password")


@router.post("/reset-password", response_model=StubResponse)
async def reset_password(_body: ResetPasswordRequest) -> StubResponse:
    """auth: none. Consume a valid token and set a new password."""
    return StubResponse(endpoint="POST /auth/reset-password")

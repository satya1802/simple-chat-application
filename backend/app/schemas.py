"""Pydantic request and response models.

One pair per entity in the approved data model, plus the request/response
bodies the api_spec declares for each endpoint, plus the placeholder every
generated route returns until it has been implemented.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.security import PASSWORD_MIN_LENGTH


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."


# --- users -------------------------------------------------------------------


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=PASSWORD_MIN_LENGTH,
        description=f"Must be at least {PASSWORD_MIN_LENGTH} characters.",
    )


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime


# --- conversations -------------------------------------------------------------


class ConversationOut(BaseModel):
    id: UUID
    title: str
    last_activity_at: datetime


class ConversationCreateResponse(BaseModel):
    id: UUID
    title: str


class ConversationRenameRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)


class ConversationRenameResponse(BaseModel):
    id: UUID
    title: str


# --- messages --------------------------------------------------------------------


class MessageOut(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime


class MessageCreateRequest(BaseModel):
    content: str = Field(min_length=1)


# --- password_reset_tokens -----------------------------------------------------------


class PasswordResetTokenOut(BaseModel):
    id: UUID
    expires_at: datetime
    used_at: datetime | None = None
    created_at: datetime


# --- /auth request and response bodies ----------------------------------------------


class RegisterRequest(UserCreate):
    pass


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class LogoutResponse(BaseModel):
    ok: bool


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=PASSWORD_MIN_LENGTH)


class ResetPasswordResponse(BaseModel):
    ok: bool

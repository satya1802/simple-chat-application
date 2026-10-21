"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."


# --- users / sessions -------------------------------------------------------


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    created_at: datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class MessageTextResponse(BaseModel):
    """The neutral confirmation `/auth/forgot-password` always returns."""

    message: str


class OkResponse(BaseModel):
    ok: bool


# --- conversations -----------------------------------------------------------


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    last_activity_at: datetime


class ConversationCreateOut(BaseModel):
    id: str
    title: str


class ConversationRenameRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)


# --- messages ----------------------------------------------------------------


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    content: str
    created_at: datetime


class MessageCreateRequest(BaseModel):
    content: str = Field(min_length=1)


# --- password reset tokens -----------------------------------------------------


class PasswordResetTokenOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    expires_at: datetime
    used_at: datetime | None = None

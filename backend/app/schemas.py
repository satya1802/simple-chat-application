"""Pydantic request and response models for the approved API spec.

One model per request and response body the spec declares. EmailStr needs
``email-validator`` (declared in requirements.txt) and rejects malformed
addresses at the boundary, so the handlers do not have to.
"""

from pydantic import BaseModel, EmailStr, Field


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."


# ---- Shared response shapes ----


class UserResponse(BaseModel):
    """The ``user`` object returned inside auth responses."""

    id: str
    email: EmailStr


class AuthResponse(BaseModel):
    """``{token, user}`` returned by register and login."""

    token: str
    user: UserResponse


class OkResponse(BaseModel):
    """``{ok}`` returned by logout, reset-password and delete."""

    ok: bool = True


class MessageResponse(BaseModel):
    """One message in a thread, as loaded by GET messages."""

    id: str
    role: str
    content: str
    created_at: str


class ConversationResponse(BaseModel):
    """One row in the conversation list, ordered by last activity."""

    id: str
    title: str
    last_activity_at: str


class ConversationDetailResponse(BaseModel):
    """``{id, title}`` returned by create and rename."""

    id: str
    title: str


# ---- Auth requests ----


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ---- Conversation / message requests ----


class MessageCreateRequest(BaseModel):
    content: str


class ConversationRenameRequest(BaseModel):
    """Rename a conversation: non-empty, at most 120 characters (varchar(120))."""

    title: str = Field(min_length=1, max_length=120)

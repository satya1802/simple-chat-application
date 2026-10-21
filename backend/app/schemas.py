"""Pydantic request and response models.

One pair per endpoint in the approved API spec, plus the placeholder every
generated route returns until it has been implemented. The shapes here are the
contract the frontend is built against, so they match the spec exactly.
"""

from __future__ import annotations

from datetime import datetime

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


# --------------------------------------------------------------------------- #
# Auth
# --------------------------------------------------------------------------- #


class UserPublic(BaseModel):
    """The user object returned to the client, never including the password hash."""

    id: str
    email: EmailStr
    created_at: datetime


class AuthResponse(BaseModel):
    """Returned by /auth/register and /auth/login: a session token and the user."""

    token: str
    user: UserPublic


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OkResponse(BaseModel):
    """A bare ``{ok: true}`` acknowledgement."""

    ok: bool = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """Neutral confirmation -- the same message whether or not the account exists."""

    message: str = "If an account exists for that email, a reset link has been sent."


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


# --------------------------------------------------------------------------- #
# Conversations
# --------------------------------------------------------------------------- #


class ConversationSummary(BaseModel):
    """A conversation row in the sidebar list, ordered by last activity."""

    id: str
    title: str
    last_activity_at: datetime


class ConversationCreateResponse(BaseModel):
    """Returned when a new conversation is created."""

    id: str
    title: str


class ConversationRenameRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)


class ConversationRenameResponse(BaseModel):
    id: str
    title: str


# --------------------------------------------------------------------------- #
# Messages
# --------------------------------------------------------------------------- #


class MessageOut(BaseModel):
    """A message in a conversation thread, in chronological order."""

    id: str
    role: str
    content: str
    created_at: datetime


class MessageCreateRequest(BaseModel):
    content: str = Field(min_length=1)

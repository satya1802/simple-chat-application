"""SQLAlchemy models for the four entities the approved data model declares.

``Base`` is bound to the engine in ``app.database`` and ``main.py`` imports
this module before it calls ``Base.metadata.create_all``, so declaring the
tables here is enough for a fresh clone to start against SQLite and for a
deployed instance to start against PostgreSQL.

The email column is ``citext`` on PostgreSQL (case-insensitive) and falls back
to a plain ``String`` on SQLite, where ``citext`` does not exist. Either way a
unique constraint keeps the address distinct per account.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    TypeDecorator,
    func,
)
from sqlalchemy.dialects.postgresql import CITEXT, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class _Citext(TypeDecorator):
    """``citext`` on PostgreSQL, ``String`` everywhere else.

    A fresh clone runs on SQLite, where ``citext`` is unavailable. The
    deployed instance runs on PostgreSQL 16, where it is -- and the approved
    data model calls for it, so the column is case-insensitive there.
    """

    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):  # type: ignore[override]
        if dialect.name == "postgresql":
            return dialect.type_descriptor(CITEXT())
        return dialect.type_descriptor(String(255))


def _uuid_pk() -> mapped_column[str]:
    """A UUID primary key.

    The value is generated in Python so the model works on SQLite, which has no
    ``gen_random_uuid``. The ``server_default`` is kept for PostgreSQL so raw
    SQL inserts still get a value.
    """
    return mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        server_default=func.gen_random_uuid(),
    )


class User(Base):
    """A registered account. Email is case-insensitive and unique."""

    __tablename__ = "users"

    id: Mapped[str] = _uuid_pk()
    email: Mapped[str] = mapped_column(_Citext(), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Conversation(Base):
    """A conversation owned by a single user. Title is capped at 120 characters."""

    __tablename__ = "conversations"

    id: Mapped[str] = _uuid_pk()
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(
        String(120), nullable=False, server_default="New conversation"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    __table_args__ = (Index("ix_conversations_user_activity", "user_id", "last_activity_at"),)


class Message(Base):
    """A single message in a conversation. ``role`` is ``user`` or ``assistant``."""

    __tablename__ = "messages"

    id: Mapped[str] = _uuid_pk()
    conversation_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    __table_args__ = (Index("ix_messages_conversation_created", "conversation_id", "created_at"),)


class PasswordResetToken(Base):
    """A single-use password-reset token for a user."""

    __tablename__ = "password_reset_tokens"

    id: Mapped[str] = _uuid_pk()
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


__all__ = ["Base", "Conversation", "Message", "PasswordResetToken", "User"]
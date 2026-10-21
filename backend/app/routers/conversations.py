"""Conversation and message routes: persistence, ownership scoping and the
streamed assistant reply.

Every route requires a valid, non-revoked session via `get_current_user`
(US-001-1), and `send_message` streams the model's reply through
`app.llm.stream_completion` (US-017-1), which itself prepends the configured
system prompt server-side -- it is never echoed back to the client.
"""

from collections.abc import AsyncIterator
from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.llm import stream_completion
from app.models import Conversation, Message, User
from app.schemas import (
    ConversationCreateResponse,
    ConversationDeleteResponse,
    ConversationOut,
    ConversationRenameRequest,
    ConversationRenameResponse,
    MessageCreateRequest,
    MessageOut,
)
from app.security import get_current_user

router = APIRouter(prefix="/conversations", tags=["conversations"])

CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[Session, Depends(get_db)]

TITLE_MAX_LENGTH = 60


def _get_owned_conversation(db: Session, conversation_id: UUID, user: User) -> Conversation:
    """The caller's `Conversation`, or a 404 if it is missing or not theirs.

    A mismatched owner must look identical to a missing conversation: no hint
    that the id exists at all.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation is None or conversation.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation


@router.get("", response_model=list[ConversationOut])
async def list_conversations(current_user: CurrentUser, db: DbSession) -> list[ConversationOut]:
    # Threads with zero messages are never returned (AC-034): an abandoned
    # new chat leaves nothing in the sidebar.
    conversations = (
        db.query(Conversation)
        .join(Message, Message.conversation_id == Conversation.id)
        .filter(Conversation.user_id == current_user.id)
        .distinct()
        .order_by(Conversation.last_activity_at.desc())
        .all()
    )
    return [
        ConversationOut(id=c.id, title=c.title, last_activity_at=c.last_activity_at)
        for c in conversations
    ]


@router.post("", response_model=ConversationCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    current_user: CurrentUser, db: DbSession
) -> ConversationCreateResponse:
    conversation = Conversation(user_id=current_user.id, title="New conversation")
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return ConversationCreateResponse(id=conversation.id, title=conversation.title)


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
async def list_messages(
    conversation_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> list[MessageOut]:
    conversation = _get_owned_conversation(db, conversation_id, current_user)
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return [
        MessageOut(id=m.id, role=m.role, content=m.content, created_at=m.created_at)
        for m in messages
    ]


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: UUID,
    body: MessageCreateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> StreamingResponse:
    conversation = _get_owned_conversation(db, conversation_id, current_user)

    is_first_message = (
        db.query(Message).filter(Message.conversation_id == conversation.id).count() == 0
    )

    user_message = Message(
        conversation_id=conversation.id, role="user", content=body.content
    )
    db.add(user_message)

    if is_first_message:
        title = body.content.strip()[:TITLE_MAX_LENGTH]
        conversation.title = title or "New conversation"

    conversation.last_activity_at = datetime.now(UTC)
    db.commit()

    # AC-032: only this conversation's own messages are sent as context.
    history = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .all()
    )
    context_messages = [{"role": m.role, "content": m.content} for m in history]

    async def generate() -> AsyncIterator[str]:
        chunks: list[str] = []
        async for delta in stream_completion(context_messages):
            chunks.append(delta)
            yield delta

        full_reply = "".join(chunks)
        assistant_message = Message(
            conversation_id=conversation.id, role="assistant", content=full_reply
        )
        db.add(assistant_message)
        conversation.last_activity_at = datetime.now(UTC)
        db.commit()

    return StreamingResponse(generate(), media_type="text/plain")


@router.patch("/{conversation_id}", response_model=ConversationRenameResponse)
async def rename_conversation(
    conversation_id: UUID,
    body: ConversationRenameRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> ConversationRenameResponse:
    conversation = _get_owned_conversation(db, conversation_id, current_user)
    conversation.title = body.title
    db.commit()
    db.refresh(conversation)
    return ConversationRenameResponse(id=conversation.id, title=conversation.title)


@router.delete("/{conversation_id}", response_model=ConversationDeleteResponse)
async def delete_conversation(
    conversation_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> ConversationDeleteResponse:
    conversation = _get_owned_conversation(db, conversation_id, current_user)
    db.delete(conversation)
    db.commit()
    return ConversationDeleteResponse(ok=True)

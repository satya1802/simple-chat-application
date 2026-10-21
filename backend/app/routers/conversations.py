"""Conversation and message routes.

``POST /conversations`` creates a conversation owned by the authenticated user.
``POST /conversations/{id}/messages`` streams the assistant's reply back as
Server-Sent Events, calling the LLM streaming service (``app.services``) with
the configured OpenAI model. The remaining handlers are stubs that return a
typed placeholder; they are implemented by their own sprint tickets.

Every route on this router is scoped to the authenticated user: a valid,
non-revoked JWT is required, enforced through the ``get_token_payload``
dependency so a logged-out token cannot reach any handler. The create and
send-message handlers additionally resolve the user row via
``get_current_user`` so the conversation is owned and accessed server-side by
the verified identity, never by a value in the request body.
"""

from collections.abc import Iterator
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Conversation, User
from app.schemas import (
    ConversationCreateResponse,
    ConversationRenameRequest,
    ConversationRenameResponse,
    ConversationSummary,
    MessageCreateRequest,
    MessageOut,
    OkResponse,
    StubResponse,
)
from app.security import get_current_user, get_token_payload
from app.services import stream_completion

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"],
    dependencies=[Depends(get_token_payload)],
)

DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=list[ConversationSummary])
async def list_conversations() -> list[StubResponse]:
    return [StubResponse(endpoint="GET /conversations")]


@router.post("", response_model=ConversationCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(user: CurrentUser, db: DbSession) -> ConversationCreateResponse:
    conversation = Conversation(user_id=user.id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return ConversationCreateResponse(id=conversation.id, title=conversation.title)


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
async def list_messages(conversation_id: str) -> list[StubResponse]:
    return [StubResponse(endpoint="GET /conversations/{id}/messages")]


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    body: MessageCreateRequest,
    user: CurrentUser,
    db: DbSession,
) -> StreamingResponse:
    """Stream the assistant's reply as Server-Sent Events.

    The conversation must belong to the authenticated user; a mismatch is a
    404 so the endpoint never reveals whether another user's conversation
    exists. The user's message is the sole conversation turn passed to the
    LLM streaming service, which prepends the configured system prompt and
    calls the configured OpenAI model. Each response token is emitted as an
    SSE ``data:`` event carrying the reply accumulated so far, so a client
    receives a progressively growing answer and the full reply is present in
    the stream body.
    """
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user.id)
        .first()
    )
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    messages = [{"role": "user", "content": body.content}]

    def event_stream() -> Iterator[str]:
        accumulated = ""
        for token in stream_completion(messages):
            accumulated += token
            yield f"data: {accumulated}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.patch("/{conversation_id}", response_model=ConversationRenameResponse)
async def rename_conversation(
    conversation_id: str, body: ConversationRenameRequest
) -> StubResponse:
    return StubResponse(endpoint="PATCH /conversations/{id}")


@router.delete("/{conversation_id}", response_model=OkResponse)
async def delete_conversation(conversation_id: str) -> StubResponse:
    return StubResponse(endpoint="DELETE /conversations/{id}")
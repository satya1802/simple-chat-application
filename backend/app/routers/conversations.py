"""Conversation and message routes: one per /conversations endpoint the
approved api_spec declares.

Ownership scoping, the OpenAI streaming proxy and the Redis daily-cap check
are the development sprint's work. Each handler here is a stub that returns
a typed placeholder, so the path, method and request body are fixed -- and
validated by FastAPI -- before that work starts. Every route requires a
valid, non-revoked session via `get_current_user` so an authenticated-only
route behaves correctly (401 once logged out) even before its real logic
lands.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.models import User
from app.schemas import ConversationRenameRequest, MessageCreateRequest, StubResponse
from app.security import get_current_user

router = APIRouter(prefix="/conversations", tags=["conversations"])

CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=StubResponse)
async def list_conversations(current_user: CurrentUser) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="GET /conversations")


@router.post("", response_model=StubResponse)
async def create_conversation(current_user: CurrentUser) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="POST /conversations")


@router.get("/{conversation_id}/messages", response_model=StubResponse)
async def list_messages(
    conversation_id: UUID,  # noqa: ARG001
    current_user: CurrentUser,  # noqa: ARG001
) -> StubResponse:
    return StubResponse(endpoint="GET /conversations/{id}/messages")


@router.post("/{conversation_id}/messages", response_model=StubResponse)
async def send_message(
    conversation_id: UUID,  # noqa: ARG001
    body: MessageCreateRequest,  # noqa: ARG001
    current_user: CurrentUser,  # noqa: ARG001
) -> StubResponse:
    # The real handler streams the assistant reply over SSE (text/event-stream)
    # after the daily-cap check; the stub returns ordinary JSON since there is
    # no behaviour yet to stream.
    return StubResponse(endpoint="POST /conversations/{id}/messages")


@router.patch("/{conversation_id}", response_model=StubResponse)
async def rename_conversation(
    conversation_id: UUID,  # noqa: ARG001
    body: ConversationRenameRequest,  # noqa: ARG001
    current_user: CurrentUser,  # noqa: ARG001
) -> StubResponse:
    return StubResponse(endpoint="PATCH /conversations/{id}")


@router.delete("/{conversation_id}", response_model=StubResponse)
async def delete_conversation(
    conversation_id: UUID,  # noqa: ARG001
    current_user: CurrentUser,  # noqa: ARG001
) -> StubResponse:
    return StubResponse(endpoint="DELETE /conversations/{id}")

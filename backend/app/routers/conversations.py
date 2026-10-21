"""Conversation and message routes: one per /conversations endpoint the
approved api_spec declares.

Ownership scoping, the OpenAI streaming proxy and the Redis daily-cap check
are the development sprint's work. Each handler here is a stub that returns
a typed placeholder, so the path, method and request body are fixed -- and
validated by FastAPI -- before that work starts.
"""

from uuid import UUID

from fastapi import APIRouter

from app.schemas import ConversationRenameRequest, MessageCreateRequest, StubResponse

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=StubResponse)
async def list_conversations() -> StubResponse:
    return StubResponse(endpoint="GET /conversations")


@router.post("", response_model=StubResponse)
async def create_conversation() -> StubResponse:
    return StubResponse(endpoint="POST /conversations")


@router.get("/{conversation_id}/messages", response_model=StubResponse)
async def list_messages(conversation_id: UUID) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="GET /conversations/{id}/messages")


@router.post("/{conversation_id}/messages", response_model=StubResponse)
async def send_message(
    conversation_id: UUID,  # noqa: ARG001
    body: MessageCreateRequest,  # noqa: ARG001
) -> StubResponse:
    # The real handler streams the assistant reply over SSE (text/event-stream)
    # after the daily-cap check; the stub returns ordinary JSON since there is
    # no behaviour yet to stream.
    return StubResponse(endpoint="POST /conversations/{id}/messages")


@router.patch("/{conversation_id}", response_model=StubResponse)
async def rename_conversation(
    conversation_id: UUID,  # noqa: ARG001
    body: ConversationRenameRequest,  # noqa: ARG001
) -> StubResponse:
    return StubResponse(endpoint="PATCH /conversations/{id}")


@router.delete("/{conversation_id}", response_model=StubResponse)
async def delete_conversation(conversation_id: UUID) -> StubResponse:  # noqa: ARG001
    return StubResponse(endpoint="DELETE /conversations/{id}")

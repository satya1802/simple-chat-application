"""Conversation and message routes.

Every handler is a stub that returns a typed placeholder, so the service
starts, serves its OpenAPI document and passes its tests before a single
handler is implemented. The request and response models in ``app.schemas``
define the exact shapes the frontend is built against.

The streaming endpoint (``POST /conversations/{id}/messages``) declares an
``text/event-stream`` response so the OpenAPI document advertises SSE; the
handler itself remains a stub until the sprint implements it.
"""

from fastapi import APIRouter

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

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationSummary])
async def list_conversations() -> list[StubResponse]:
    return [StubResponse(endpoint="GET /conversations")]


@router.post("", response_model=ConversationCreateResponse)
async def create_conversation() -> StubResponse:
    return StubResponse(endpoint="POST /conversations")


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
async def list_messages(conversation_id: str) -> list[StubResponse]:
    return [StubResponse(endpoint="GET /conversations/{id}/messages")]


@router.post("/{conversation_id}/messages", response_model=MessageOut)
async def send_message(conversation_id: str, body: MessageCreateRequest) -> StubResponse:
    return StubResponse(endpoint="POST /conversations/{id}/messages")


@router.patch("/{conversation_id}", response_model=ConversationRenameResponse)
async def rename_conversation(
    conversation_id: str, body: ConversationRenameRequest
) -> StubResponse:
    return StubResponse(endpoint="PATCH /conversations/{id}")


@router.delete("/{conversation_id}", response_model=OkResponse)
async def delete_conversation(conversation_id: str) -> StubResponse:
    return StubResponse(endpoint="DELETE /conversations/{id}")

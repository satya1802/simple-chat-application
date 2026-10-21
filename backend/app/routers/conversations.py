"""Conversation and message endpoints.

Generated from the approved API spec. Every handler here is a stub -- see
app/routers/auth.py for why that is deliberate at this stage. The real
handlers will scope every query to the JWT user (mismatched or missing
ownership returns 404/403, no data change), check the Redis daily cap before
any OpenAI call, and stream the assistant reply token-by-token over SSE.
"""

from fastapi import APIRouter

from app.schemas import ConversationRenameRequest, MessageCreateRequest, StubResponse

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=StubResponse)
async def list_conversations() -> StubResponse:
    """auth: JWT. List the signed-in user's conversations, newest activity first."""
    return StubResponse(endpoint="GET /conversations")


@router.post("", response_model=StubResponse)
async def create_conversation() -> StubResponse:
    """auth: JWT. Create a new conversation (persisted on first message)."""
    return StubResponse(endpoint="POST /conversations")


@router.get("/{conversation_id}/messages", response_model=StubResponse)
async def list_messages(conversation_id: str) -> StubResponse:
    """auth: JWT. Load a conversation's messages in chronological order."""
    return StubResponse(endpoint="GET /conversations/{id}/messages")


@router.post("/{conversation_id}/messages", response_model=StubResponse)
async def send_message(conversation_id: str, _body: MessageCreateRequest) -> StubResponse:
    """auth: JWT. Send a user message and stream the assistant reply over SSE
    after cap check. Returns text/event-stream once implemented."""
    return StubResponse(endpoint="POST /conversations/{id}/messages")


@router.patch("/{conversation_id}", response_model=StubResponse)
async def rename_conversation(
    conversation_id: str, _body: ConversationRenameRequest
) -> StubResponse:
    """auth: JWT. Rename a conversation (non-empty, max length enforced)."""
    return StubResponse(endpoint="PATCH /conversations/{id}")


@router.delete("/{conversation_id}", response_model=StubResponse)
async def delete_conversation(conversation_id: str) -> StubResponse:
    """auth: JWT. Delete a conversation and all its messages."""
    return StubResponse(endpoint="DELETE /conversations/{id}")

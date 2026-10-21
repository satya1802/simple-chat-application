"""Conversations and messages router.

Every handler is a stub that raises 501 until its ticket is implemented. The
path parameters are named ``conversation_id`` rather than ``id`` so they do
not shadow the builtin; the URL shape is unchanged. The SSE stream endpoint
declares no response_model -- its body is ``text/event-stream`` tokens, not a
JSON object, so a model would misdescribe it.
"""

from fastapi import APIRouter, HTTPException

from app.schemas import (
    ConversationDetailResponse,
    ConversationRenameRequest,
    ConversationResponse,
    MessageCreateRequest,
    MessageResponse,
    OkResponse,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
async def list_conversations() -> list[ConversationResponse]:
    """List the signed-in user's conversations, newest activity first."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.post("", response_model=ConversationDetailResponse)
async def create_conversation() -> ConversationDetailResponse:
    """Create a new conversation (persisted on first message)."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
async def list_messages(conversation_id: str) -> list[MessageResponse]:
    """Load a conversation's messages in chronological order."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.post("/{conversation_id}/messages")
async def send_message(conversation_id: str, body: MessageCreateRequest) -> None:
    """Send a user message and stream the assistant reply over SSE after cap check."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.patch("/{conversation_id}", response_model=ConversationDetailResponse)
async def rename_conversation(
    conversation_id: str, body: ConversationRenameRequest
) -> ConversationDetailResponse:
    """Rename a conversation (non-empty, max length enforced)."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")


@router.delete("/{conversation_id}", response_model=OkResponse)
async def delete_conversation(conversation_id: str) -> OkResponse:
    """Delete a conversation and all its messages."""
    raise HTTPException(status_code=501, detail="Not implemented: scaffolded endpoint.")

"""The OpenAI streaming client wrapper.

`stream_completion` is the only thing other modules call: it prepends the
configured system prompt, calls the configured model and yields plain text
deltas as they arrive, so a caller (an SSE route, in a later ticket) can
forward each delta to the browser as it is produced rather than waiting for
the whole reply.
"""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterable

from openai import AsyncOpenAI

from app.config import settings

# One client for the process; the SDK handles connection pooling and reads
# no other environment variable, so the key never leaves `app.config`.
_client = AsyncOpenAI(api_key=settings.openai_api_key)


async def stream_completion(messages: Iterable[dict[str, str]]) -> AsyncIterator[str]:
    """Stream the assistant's reply to `messages` as text deltas.

    `messages` is the conversation history as `{"role", "content"}` dicts,
    oldest first, *without* a system message -- this function prepends the
    configured system prompt as the first message on every call, so no
    caller can omit it or send a different one.
    """
    full_messages = [{"role": "system", "content": settings.system_prompt}, *messages]

    stream = await _client.chat.completions.create(
        model=settings.openai_model,
        messages=full_messages,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


__all__ = ["stream_completion"]

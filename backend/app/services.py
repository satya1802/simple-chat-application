"""Backing-service configuration and the LLM streaming service (US-017).

``OPENAI_API_KEY`` is validated at module load -- the conversation and
message-streaming features cannot function without it, so the module refuses
to import (and therefore the application refuses to start) when the key is
missing or empty. The error names the variable so an operator knows exactly
what to set.

``OPENAI_MODEL`` and ``SYSTEM_PROMPT`` are read from the environment via
``app.config`` so a restart with new values takes effect without a code change.
The system prompt defaults to a neutral, helpful instruction (see
``app.config``) and is prepended to every conversation as the first message.

The streaming function calls the configured OpenAI model with ``stream=True``
and yields each text delta as a string, suitable for Server-Sent Events. The
API key is never included in a yielded chunk, a raised error, or a log
statement -- it stays server-side.
"""

from __future__ import annotations

import os
from collections.abc import Iterator

from openai import OpenAI

from app.config import OPENAI_MODEL, SYSTEM_PROMPT

# Fail-fast validation: a missing or empty key is a fatal startup error that
# names the variable, raised before the app can accept any request. This runs
# at import time, and ``app.main`` imports this module, so the error surfaces
# before the application object is even created.
_api_key = os.getenv("OPENAI_API_KEY")
if not _api_key:
    raise RuntimeError(
        "OPENAI_API_KEY must be set in the environment -- refusing to start "
        "without an OpenAI API key."
    )

# A single client instance reused across requests. The key is read from the
# validated environment variable and stored only here, server-side.
_client = OpenAI(api_key=_api_key)

# Each backing service mapped to the environment variable that addresses it.
# The health check reports which are configured so an operator can tell at a
# glance whether the running deployment can use each feature.
SERVICES = {
    "redis": "REDIS_URL",
    "openai": "OPENAI_API_KEY",
    "sendgrid": "SENDGRID_API_KEY",
}


def configured_services() -> dict[str, bool]:
    """Each service mapped to whether its connection variable is set.

    The ``openai`` entry is the ai_provider service: its status reflects
    whether the OpenAI API key is configured, which the LLM streaming feature
    depends on.
    """
    return {name: bool(os.getenv(var)) for name, var in SERVICES.items()}


def stream_completion(
    messages: list[dict[str, str]],
    system_prompt: str | None = None,
) -> Iterator[str]:
    """Stream a chat completion from the configured OpenAI model.

    ``messages`` is the conversation history as a list of ``{role, content}``
    dicts. ``system_prompt`` overrides the configured default when provided;
    when ``None`` the value from ``SYSTEM_PROMPT`` is used. The system prompt
    is prepended to the conversation and is never yielded to or visible to the
    client on its own -- only the assistant's response tokens are yielded.

    Yields each response text delta as a string, one chunk at a time, suitable
    for Server-Sent Events. The API key is never present in any yielded chunk
    or raised exception.
    """
    prompt = system_prompt if system_prompt is not None else SYSTEM_PROMPT
    full_messages: list[dict[str, str]] = [{"role": "system", "content": prompt}]
    full_messages.extend(messages)

    stream = _client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=full_messages,
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


__all__ = ["SERVICES", "configured_services", "stream_completion"]
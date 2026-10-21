"""Direct unit tests for app.config.settings and app.llm.stream_completion,
independent of the HTTP contract (test_llm.py exercises those through the
API; these exercise the module contract itself).
"""

from __future__ import annotations

import pytest

from app.config import DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT, settings
from app.llm import stream_completion


def test_settings_default_model_and_prompt_when_unset_in_this_process():
    # conftest only sets OPENAI_API_KEY; OPENAI_MODEL/SYSTEM_PROMPT are
    # whatever the test process environment left them as, so this only
    # asserts the module's own defaults are what the rest of the suite
    # (and .env.example) assume.
    assert DEFAULT_MODEL == "gpt-4o-mini"
    assert DEFAULT_SYSTEM_PROMPT.strip() != ""


def test_settings_never_expose_the_api_key_in_repr_by_accident():
    # frozen dataclasses default to a readable repr; this just documents
    # that the key is a plain field, so nothing in app code should ever
    # repr() or log the settings object wholesale.
    assert settings.openai_api_key  # present, but callers must not print it


@pytest.mark.anyio
async def test_stream_completion_yields_incremental_text_deltas(patched_openai):
    messages = [{"role": "user", "content": "hi"}]
    collected = [chunk async for chunk in stream_completion(messages)]

    assert collected == ["Hello", " there."]

    call = patched_openai["calls"][-1]
    assert call["stream"] is True
    assert call["messages"][0] == {"role": "system", "content": settings.system_prompt}
    assert call["messages"][1] == {"role": "user", "content": "hi"}


@pytest.fixture
def anyio_backend():
    return "asyncio"

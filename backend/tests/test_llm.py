"""AC-059 / AC-060 / AC-061: the configured model and system prompt reach the
OpenAI client, and a neutral default is used when SYSTEM_PROMPT is unset.

Each case runs in its own subprocess because the model name and system
prompt are expected to be read from the environment at import/startup time
(the same timing as the OPENAI_API_KEY check in `test_config_startup.py`),
so an in-process `importlib.reload` would not reliably reproduce it. The
subprocess script patches `Completions.create` / `AsyncCompletions.create`
directly on the `openai` SDK classes -- never the network -- registers a
user, creates a conversation and sends one message through the real HTTP
contract, then prints the captured `create(...)` kwargs as JSON so this
process can assert on them without re-implementing the app's internals.

NOTE on the model env var: the packet names SYSTEM_PROMPT explicitly but
does not name the model's variable. OPENAI_MODEL is assumed as the
conventional name; if the real implementation names it differently, that is
a contract mismatch to flag against app/config.py, not this test.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent.parent

_SCRIPT = r"""
import asyncio, json, os, sys
import openai.resources.chat.completions.completions as completions_mod

captured = []

class _FakeChunk:
    def __init__(self, text):
        class D:
            content = text
        class C:
            delta = D()
        self.choices = [C()]

class _FakeStream:
    def __iter__(self):
        return iter([_FakeChunk("ok"), _FakeChunk(None)])
    def __aiter__(self):
        self._items = [_FakeChunk("ok"), _FakeChunk(None)]
        self._i = 0
        return self
    async def __anext__(self):
        if self._i >= len(self._items):
            raise StopAsyncIteration
        item = self._items[self._i]
        self._i += 1
        return item

class _FakeCompletion:
    class _Choice:
        class _Msg:
            content = "ok"
        message = _Msg()
    choices = [_Choice()]

def fake_sync_create(self, *a, **kwargs):
    captured.append(kwargs)
    return _FakeStream() if kwargs.get("stream") else _FakeCompletion()

async def fake_async_create(self, *a, **kwargs):
    captured.append(kwargs)
    return _FakeStream() if kwargs.get("stream") else _FakeCompletion()

completions_mod.Completions.create = fake_sync_create
completions_mod.AsyncCompletions.create = fake_async_create

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
email = "llm-qa-" + os.urandom(4).hex() + "@example.com"
reg = client.post(
    "/auth/register",
    json={"email": email, "password": "correct-horse-battery-staple"},
)
token = reg.json().get("token", "")
headers = {"Authorization": f"Bearer {token}"} if token else {}

convo = client.post("/conversations", headers=headers, json={})
convo_id = (convo.json() or {}).get("id")

if convo_id:
    client.post(
        f"/conversations/{convo_id}/messages", headers=headers, json={"content": "hello"}
    )
else:
    # conversation creation not yet implemented/owned by this ticket: still
    # attempt a plausible fixed id so the test surfaces "not implemented"
    # rather than crashing this harness.
    fallback_id = "00000000-0000-0000-0000-000000000000"
    client.post(
        f"/conversations/{fallback_id}/messages", headers=headers, json={"content": "hello"}
    )

print("__CAPTURED_JSON__" + json.dumps({"calls": captured, "register_status": reg.status_code}))
"""


def _run_llm_roundtrip(env_overrides: dict[str, str]) -> dict:
    env = dict(os.environ)
    env.pop("SYSTEM_PROMPT", None)
    env.pop("OPENAI_MODEL", None)
    env.update(env_overrides)
    env.setdefault("OPENAI_API_KEY", "sk-test-placeholder-not-a-real-key")

    result = subprocess.run(
        [sys.executable, "-c", _SCRIPT],
        cwd=str(_BACKEND_DIR),
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )
    marker = "__CAPTURED_JSON__"
    if marker not in result.stdout:
        raise AssertionError(
            "harness did not reach the capture point "
            f"(exit={result.returncode}) stdout={result.stdout!r} stderr={result.stderr!r}"
        )
    matching_lines = [line for line in result.stdout.splitlines() if marker in line]
    captured_line = matching_lines[-1]
    return json.loads(captured_line.split(marker, 1)[1])


def test_configured_model_and_custom_system_prompt_reach_the_openai_client():
    custom_prompt = "You are QA-Bot, a strictly factual assistant for this test only."
    data = _run_llm_roundtrip(
        {"SYSTEM_PROMPT": custom_prompt, "OPENAI_MODEL": "gpt-4o-mini-qa-test"}
    )
    calls = data["calls"]

    assert calls, (
        f"no chat completion was requested (register_status={data.get('register_status')})"
    )
    last_call = calls[-1]

    assert last_call.get("model") == "gpt-4o-mini-qa-test"
    messages = last_call.get("messages") or []
    assert messages, "expected at least a system message to be sent"
    system_messages = [m for m in messages if m.get("role") == "system"]
    assert system_messages, "expected a system-role message"
    assert system_messages[0]["content"] == custom_prompt


def test_default_neutral_prompt_is_used_when_system_prompt_is_unset():
    data = _run_llm_roundtrip({"OPENAI_MODEL": "gpt-4o-mini-qa-test"})
    calls = data["calls"]

    assert calls, (
        f"no chat completion was requested (register_status={data.get('register_status')})"
    )
    messages = calls[-1].get("messages") or []
    system_messages = [m for m in messages if m.get("role") == "system"]
    assert system_messages, "expected a default system-role message when SYSTEM_PROMPT is unset"
    assert system_messages[0]["content"].strip() != ""

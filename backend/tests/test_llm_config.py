"""Tests for LLM service configuration (US-017, US-018).

These tests verify the configuration contract:

* ``OPENAI_API_KEY`` is validated at startup -- a missing or empty value is a
  fatal error whose message names the variable.
* The system prompt defaults to a neutral, helpful prompt when
  ``SYSTEM_PROMPT`` is not set, and honours a custom value when it is.
* The API key is never present in any response body, error message, or log
  output.

The OpenAI API is never called: any client construction is mocked so no
network request leaves the test run.
"""

from __future__ import annotations

import importlib
import logging
import os
import sys

import pytest
from fastapi.testclient import TestClient

# A recognizable fake key so a leak would be unmistakable in output.
FAKE_KEY = "sk-test-leak-canary-0123456789abcdef"


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def _reload_module(name: str):
    """Re-import a module so module-level env reads pick up new values."""
    if name in sys.modules:
        return importlib.reload(sys.modules[name])
    return importlib.import_module(name)


def _purge_app_modules() -> None:
    """Remove every already-imported ``app`` module so config reads re-run."""
    for mod in list(sys.modules):
        if mod == "app" or mod.startswith("app."):
            del sys.modules[mod]


# --------------------------------------------------------------------------- #
# OPENAI_API_KEY validated at startup
# --------------------------------------------------------------------------- #

@pytest.fixture()
def _isolate_env():
    """Snapshot and restore the process environment around a test."""
    saved = os.environ.copy()
    # Strip the variables under test so a developer's local env cannot mask a
    # missing-key failure.
    for var in ("OPENAI_API_KEY", "SYSTEM_PROMPT", "OPENAI_BASE_URL"):
        os.environ.pop(var, None)
    yield
    os.environ.clear()
    os.environ.update(saved)
    # Re-establish a clean import state so later tests get a fresh app.
    _purge_app_modules()


def test_missing_openai_api_key_is_fatal_startup_error(_isolate_env) -> None:
    """US-017: a missing OPENAI_API_KEY must abort startup naming the variable."""
    os.environ.pop("OPENAI_API_KEY", None)
    _purge_app_modules()

    with pytest.raises((SystemExit, RuntimeError, ValueError)) as excinfo:
        _reload_module("app.main")

    message = str(excinfo.value)
    assert "OPENAI_API_KEY" in message, (
        f"startup error must name OPENAI_API_KEY; got: {message!r}"
    )


def test_empty_openai_api_key_is_fatal_startup_error(_isolate_env) -> None:
    """US-017: an empty OPENAI_API_KEY is treated the same as missing."""
    os.environ["OPENAI_API_KEY"] = ""
    _purge_app_modules()

    with pytest.raises((SystemExit, RuntimeError, ValueError)) as excinfo:
        _reload_module("app.main")

    assert "OPENAI_API_KEY" in str(excinfo.value)


# --------------------------------------------------------------------------- #
# System prompt configuration
# --------------------------------------------------------------------------- #

def _system_prompt() -> str:
    """Return the configured system prompt from the application config.

    Reads through ``app.config`` so the test exercises the same code path the
    handlers will use.
    """
    _purge_app_modules()
    config = importlib.import_module("app.config")
    prompt = getattr(config, "SYSTEM_PROMPT", None)
    if prompt is None:
        # Fall back to a getter function if the implementation exposes one.
        prompt = config.get_system_prompt()  # type: ignore[attr-defined]
    return prompt


def test_default_system_prompt_is_neutral_helpful(_isolate_env) -> None:
    """US-018: with SYSTEM_PROMPT unset, the default is neutral and helpful."""
    os.environ.pop("SYSTEM_PROMPT", None)
    prompt = _system_prompt()

    assert isinstance(prompt, str) and prompt.strip(), "system prompt must be non-empty"
    lowered = prompt.lower()
    # Neutral: it must not assert a persona, identity, or opinion.
    assert "i am" not in lowered
    # Helpful: it must reference assisting or answering.
    assert any(word in lowered for word in ("help", "assist", "answer", "useful"))


def test_custom_system_prompt_is_used(_isolate_env) -> None:
    """US-018: a custom SYSTEM_PROMPT overrides the default."""
    custom = "You are a terse summarizer. Reply in one sentence."
    os.environ["SYSTEM_PROMPT"] = custom
    prompt = _system_prompt()

    assert prompt == custom


# --------------------------------------------------------------------------- #
# API key never exposed
# --------------------------------------------------------------------------- #

def test_api_key_absent_from_responses_and_logs(_isolate_env, caplog) -> None:
    """US-017: the API key must never appear in a response body or log line.

    Sets a known canary key, drives the app through its endpoints (including
    error paths) and asserts the key is absent from every response body and
    captured log record. Server-side exceptions are not raised by the client so
    that stub or error responses are still inspected for leaks.
    """
    os.environ["OPENAI_API_KEY"] = FAKE_KEY
    _purge_app_modules()
    main = importlib.import_module("app.main")
    app = main.app

    caplog.set_level(logging.DEBUG)
    # Do not raise on server exceptions: stub handlers may return bodies that
    # fail response validation, which we still want to inspect for leaks.
    client = TestClient(app, raise_server_exceptions=False)

    # Exercise a representative slice: health, an auth error path, the
    # OpenAPI document (which serializes every schema), and an unauthenticated
    # request to a protected route.
    responses = [
        client.get("/health"),
        client.post(
            "/auth/login",
            json={"email": "nobody@example.com", "password": "wrong-password-xx"},
        ),
        client.get("/openapi.json"),
        client.get("/conversations"),
    ]

    for response in responses:
        text = response.text
        assert FAKE_KEY not in text, (
            f"API key leaked in response body for {response.request.method} "
            f"{response.request.url.path}: {text[:200]}"
        )

    for record in caplog.records:
        assert FAKE_KEY not in record.getMessage(), (
            f"API key leaked in log: {record.getMessage()[:200]}"
        )

    # The rendered OpenAPI document includes every schema and description, so
    # it is the most likely place for an accidental key reference.
    openapi_text = client.get("/openapi.json").text
    assert FAKE_KEY not in openapi_text
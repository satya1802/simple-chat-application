"""Shared fixtures for the auth + LLM-config test suite.

A fresh SQLite file per test session backs the app instead of the dev
database, `OPENAI_API_KEY` is set to a harmless placeholder before `app.main`
is ever imported (importing it with the key unset is itself under test, in
`test_config_startup.py`, via a subprocess so it does not poison this
process), and the OpenAI client is patched at the SDK's `Completions.create`
/ `AsyncCompletions.create` methods -- not at the constructor -- so the patch
holds regardless of when or where the application instantiates its client.
"""

from __future__ import annotations

import os
import uuid
from collections.abc import Iterator
from types import SimpleNamespace
from typing import Any

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("OPENAI_API_KEY", "sk-test-placeholder-not-a-real-key")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    future=True,
)
TestSessionLocal = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)


@pytest.fixture(scope="session")
def _app():
    """Import the real app once OPENAI_API_KEY is already set in-process."""
    from app import models  # noqa: F401 -- registers tables on Base.metadata
    from app.database import Base, get_db
    from app.main import app as fastapi_app

    Base.metadata.create_all(bind=test_engine)

    def override_get_db() -> Iterator[Any]:
        session = TestSessionLocal()
        try:
            yield session
        finally:
            session.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    return fastapi_app


@pytest.fixture
def db_session():
    """A clean set of tables for every test, independent of request order."""
    from app.database import Base

    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(_app, db_session):  # noqa: ARG001 -- db_session resets tables first
    from fastapi.testclient import TestClient

    with TestClient(_app) as c:
        yield c


@pytest.fixture
def unique_email() -> str:
    return f"qa-{uuid.uuid4().hex[:12]}@example.com"


class _FakeChunk:
    """Mimics one `ChatCompletionChunk` just enough to be iterated."""

    def __init__(self, text: str | None) -> None:
        delta = SimpleNamespace(content=text)
        self.choices = [SimpleNamespace(delta=delta)]


class _FakeStream:
    def __iter__(self):
        yield _FakeChunk("Hello")
        yield _FakeChunk(" there.")
        yield _FakeChunk(None)

    def __aiter__(self):
        self._items = [_FakeChunk("Hello"), _FakeChunk(" there."), _FakeChunk(None)]
        self._i = 0
        return self

    async def __anext__(self):
        if self._i >= len(self._items):
            raise StopAsyncIteration
        item = self._items[self._i]
        self._i += 1
        return item


class _FakeMessage:
    content = "Hello there."


class _FakeChoice:
    message = _FakeMessage()


class _FakeCompletion:
    choices = [_FakeChoice()]


@pytest.fixture
def patched_openai(monkeypatch):
    """Patches both the sync and async `chat.completions.create` methods.

    Returns the dict every captured call's kwargs lands in, keyed by call
    order ("calls" -> list), so a test can assert on `model=` and the
    `messages=` list (in particular the first, system, message) without the
    fake client ever reaching the network -- there is no API key capable of
    doing so in this process.
    """
    import openai.resources.chat.completions.completions as completions_mod

    captured: dict[str, list[dict[str, Any]]] = {"calls": []}

    def fake_sync_create(self, *args, **kwargs):  # noqa: ARG001
        captured["calls"].append(kwargs)
        if kwargs.get("stream"):
            return _FakeStream()
        return _FakeCompletion()

    async def fake_async_create(self, *args, **kwargs):  # noqa: ARG001
        captured["calls"].append(kwargs)
        if kwargs.get("stream"):
            return _FakeStream()
        return _FakeCompletion()

    monkeypatch.setattr(completions_mod.Completions, "create", fake_sync_create)
    monkeypatch.setattr(completions_mod.AsyncCompletions, "create", fake_async_create)
    return captured

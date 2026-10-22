"""Typed server-side configuration for the OpenAI integration.

Validated at import time so a missing or empty `OPENAI_API_KEY` is a fatal
startup error rather than a runtime surprise on the first chat request. Other
modules (in particular `app.llm`) import the single `settings` object from
here rather than reading `os.environ` themselves, so there is exactly one
place that defines what the server is configured to do.

Neither `OPENAI_API_KEY` nor `SYSTEM_PROMPT` is ever placed on `Settings`
fields that a response schema serialises, and nothing here logs them.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

# Documented in .env.example alongside OPENAI_API_KEY and SYSTEM_PROMPT:
# changing either and restarting the process is enough, no code change needed.
DEFAULT_MODEL = "gpt-4o-mini"

DEFAULT_SYSTEM_PROMPT = (
    "You are a helpful, neutral general-purpose assistant. Answer clearly and "
    "concisely, stay on topic, and say so plainly when you are not sure of "
    "something rather than guessing."
)


@dataclass(frozen=True)
class Settings:
    openai_api_key: str
    openai_model: str
    system_prompt: str


def _load_settings() -> Settings:
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        # Deliberately a plain RuntimeError, uncaught: importing this module
        # (which app.main does immediately) must stop the process before it
        # ever binds a port, with OPENAI_API_KEY named in the failure.
        raise RuntimeError(
            "Fatal configuration error: OPENAI_API_KEY is not set. "
            "Set OPENAI_API_KEY in the server environment before starting the app."
        )

    model = os.getenv("OPENAI_MODEL") or DEFAULT_MODEL
    system_prompt = os.getenv("SYSTEM_PROMPT") or DEFAULT_SYSTEM_PROMPT

    return Settings(openai_api_key=api_key, openai_model=model, system_prompt=system_prompt)


settings = _load_settings()

__all__ = ["DEFAULT_MODEL", "DEFAULT_SYSTEM_PROMPT", "Settings", "settings"]

"""AC-058 / AC-062: no response body or log record from the auth and chat
paths contains the raw OPENAI_API_KEY or the SYSTEM_PROMPT text.

Runs the same registration/login/chat round trip as the other suites while
capturing both HTTP response bodies and the logging output (`caplog`), then
asserts the secret values are absent from both. The OpenAI client is
patched so the call never reaches the network.
"""

from __future__ import annotations

import logging

SECRET_PROMPT = "SECRET-SYSTEM-PROMPT-MARKER-should-never-leak"


def test_responses_and_logs_never_contain_the_api_key_or_system_prompt(
    client, caplog, patched_openai, unique_email, monkeypatch
):
    monkeypatch.setenv("SYSTEM_PROMPT", SECRET_PROMPT)
    api_key = __import__("os").environ["OPENAI_API_KEY"]

    caplog.set_level(logging.DEBUG)

    password = "correct-horse-battery-staple"
    register = client.post("/auth/register", json={"email": unique_email, "password": password})
    token = (register.json() or {}).get("token", "")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    login_wrong = client.post(
        "/auth/login", json={"email": unique_email, "password": "definitely-wrong"}
    )

    convo = client.post("/conversations", headers=headers, json={})
    convo_id = (convo.json() or {}).get("id")
    message_response = None
    if convo_id:
        message_response = client.post(
            f"/conversations/{convo_id}/messages", headers=headers, json={"content": "hello"}
        )

    bodies = [register.text, login_wrong.text]
    if message_response is not None:
        bodies.append(message_response.text)

    for body in bodies:
        assert api_key not in body, "OPENAI_API_KEY leaked into a response body"
        assert SECRET_PROMPT not in body, "SYSTEM_PROMPT text leaked into a response body"

    log_text = caplog.text
    assert api_key not in log_text, "OPENAI_API_KEY leaked into a log record"
    assert SECRET_PROMPT not in log_text, "SYSTEM_PROMPT text leaked into a log record"

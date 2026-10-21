"""AC-032 .. AC-034: conversation ownership, auto-titling and context scoping.

Exercised purely through the HTTP contract (`app/routers/conversations.py`,
`app/schemas.py`) plus the `patched_openai` fixture from `conftest.py` to
inspect what the LLM client was actually sent, and `db_session` to assert no
row was mutated by a request that should have been rejected.
"""

from __future__ import annotations

import uuid

from app.models import Conversation, Message

PASSWORD = "correct-horse-battery-staple"


def _register(client, email: str) -> str:
    response = client.post("/auth/register", json={"email": email, "password": PASSWORD})
    assert response.status_code in (200, 201), response.text
    return response.json()["token"]


def _headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _create_conversation(client, token: str) -> str:
    response = client.post("/conversations", headers=_headers(token), json={})
    assert response.status_code == 201, response.text
    return response.json()["id"]


def _send_message(client, token: str, conversation_id: str, content: str):
    response = client.post(
        f"/conversations/{conversation_id}/messages",
        headers=_headers(token),
        json={"content": content},
    )
    assert response.status_code == 200, response.text
    return response


# --- AC-034: list scoping -----------------------------------------------------------


def test_list_conversations_excludes_other_users_and_empty_threads(
    client, patched_openai, unique_email
):
    token_a = _register(client, unique_email)
    token_b = _register(client, f"other-{unique_email}")

    # A's empty conversation (no message sent) must not appear in the list.
    empty_conv_id = _create_conversation(client, token_a)

    # A's non-empty conversation must appear.
    active_conv_id = _create_conversation(client, token_a)
    _send_message(client, token_a, active_conv_id, "hello from A")

    # B's own non-empty conversation must not leak into A's list.
    b_conv_id = _create_conversation(client, token_b)
    _send_message(client, token_b, b_conv_id, "hello from B")

    listing = client.get("/conversations", headers=_headers(token_a))
    assert listing.status_code == 200, listing.text
    ids = [c["id"] for c in listing.json()]

    assert active_conv_id in ids
    assert empty_conv_id not in ids
    assert b_conv_id not in ids


# --- cross-user ownership: 404 and no mutation --------------------------------------


def test_another_users_id_on_get_messages_returns_404_with_no_data_change(
    client, patched_openai, unique_email
):
    token_a = _register(client, unique_email)
    token_b = _register(client, f"other-{unique_email}")
    conv_id = _create_conversation(client, token_a)
    _send_message(client, token_a, conv_id, "owned by A")

    response = client.get(f"/conversations/{conv_id}/messages", headers=_headers(token_b))
    assert response.status_code == 404


def test_another_users_id_on_patch_returns_404_with_no_title_change(
    client, db_session, patched_openai, unique_email
):
    token_a = _register(client, unique_email)
    token_b = _register(client, f"other-{unique_email}")
    conv_id = _create_conversation(client, token_a)
    _send_message(client, token_a, conv_id, "owned by A")

    response = client.patch(
        f"/conversations/{conv_id}",
        headers=_headers(token_b),
        json={"title": "hijacked title"},
    )
    assert response.status_code == 404

    conversation = db_session.query(Conversation).filter_by(id=uuid.UUID(conv_id)).one()
    assert conversation.title != "hijacked title"


def test_another_users_id_on_delete_returns_404_with_conversation_intact(
    client, db_session, patched_openai, unique_email
):
    token_a = _register(client, unique_email)
    token_b = _register(client, f"other-{unique_email}")
    conv_id = _create_conversation(client, token_a)
    _send_message(client, token_a, conv_id, "owned by A")

    response = client.delete(f"/conversations/{conv_id}", headers=_headers(token_b))
    assert response.status_code == 404

    assert db_session.query(Conversation).filter_by(id=uuid.UUID(conv_id)).count() == 1


def test_another_users_id_on_post_messages_returns_404_with_no_message_added(
    client, db_session, patched_openai, unique_email
):
    token_a = _register(client, unique_email)
    token_b = _register(client, f"other-{unique_email}")
    conv_id = _create_conversation(client, token_a)
    _send_message(client, token_a, conv_id, "owned by A")

    before_count = db_session.query(Message).filter_by(conversation_id=uuid.UUID(conv_id)).count()

    response = client.post(
        f"/conversations/{conv_id}/messages",
        headers=_headers(token_b),
        json={"content": "intrusion attempt"},
    )
    assert response.status_code == 404

    after_count = db_session.query(Message).filter_by(conversation_id=uuid.UUID(conv_id)).count()
    assert after_count == before_count


def test_a_nonexistent_conversation_id_returns_404_for_every_route(client, unique_email):
    token = _register(client, unique_email)
    fake_id = str(uuid.uuid4())

    assert (
        client.get(f"/conversations/{fake_id}/messages", headers=_headers(token)).status_code == 404
    )
    assert (
        client.patch(
            f"/conversations/{fake_id}", headers=_headers(token), json={"title": "x"}
        ).status_code
        == 404
    )
    assert client.delete(f"/conversations/{fake_id}", headers=_headers(token)).status_code == 404
    assert (
        client.post(
            f"/conversations/{fake_id}/messages", headers=_headers(token), json={"content": "x"}
        ).status_code
        == 404
    )


# --- AC-033: automatic titling and recency ordering ---------------------------------


def test_first_message_sets_an_automatic_title(client, db_session, patched_openai, unique_email):
    token = _register(client, unique_email)
    conv_id = _create_conversation(client, token)

    first_message_text = "What is the capital of France?"
    _send_message(client, token, conv_id, first_message_text)

    conversation = db_session.query(Conversation).filter_by(id=uuid.UUID(conv_id)).one()
    assert conversation.title != "New conversation"
    assert conversation.title.strip() != ""
    assert conversation.title == first_message_text[: len(conversation.title)]


def test_second_message_does_not_change_the_title(client, db_session, patched_openai, unique_email):
    token = _register(client, unique_email)
    conv_id = _create_conversation(client, token)

    _send_message(client, token, conv_id, "first message sets the title")
    conversation_after_first = db_session.query(Conversation).filter_by(id=uuid.UUID(conv_id)).one()
    title_after_first = conversation_after_first.title

    _send_message(client, token, conv_id, "a completely different second message")
    conversation_after_second = (
        db_session.query(Conversation).filter_by(id=uuid.UUID(conv_id)).one()
    )

    assert conversation_after_second.title == title_after_first


def test_a_conversation_with_a_new_first_message_rises_to_the_top_of_the_list(
    client, patched_openai, unique_email
):
    token = _register(client, unique_email)

    conv_first = _create_conversation(client, token)
    _send_message(client, token, conv_first, "older conversation's first message")

    conv_second = _create_conversation(client, token)
    _send_message(client, token, conv_second, "newer conversation's first message")

    listing = client.get("/conversations", headers=_headers(token))
    assert listing.status_code == 200, listing.text
    ids_in_order = [c["id"] for c in listing.json()]

    assert ids_in_order[0] == conv_second
    assert conv_first in ids_in_order


# --- AC-032: only the owning thread's messages reach the LLM client -----------------


def test_only_the_threads_own_messages_are_sent_as_context_to_the_llm(
    client, patched_openai, unique_email
):
    token = _register(client, unique_email)

    conv_a = _create_conversation(client, token)
    _send_message(client, token, conv_a, "conversation A: first message")

    conv_b = _create_conversation(client, token)
    _send_message(client, token, conv_b, "conversation B: only message, must not leak into A")

    # A second message in A should only carry A's own history as context.
    _send_message(client, token, conv_a, "conversation A: second message")

    last_call = patched_openai["calls"][-1]
    messages = last_call.get("messages") or []
    contents = [m.get("content") for m in messages if m.get("role") != "system"]

    assert "conversation A: first message" in contents
    assert "conversation A: second message" in contents
    assert "conversation B: only message, must not leak into A" not in contents

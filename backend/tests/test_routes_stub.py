"""The generated auth and conversation routes.

Each is a stub -- see app/routers/auth.py -- so this only proves they are
registered, validate their declared request shape, and respond before any
handler has real behaviour. The sprint's tests replace these as each ticket
implements its route.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_every_api_spec_route_is_registered() -> None:
    paths = client.get("/openapi.json").json()["paths"]

    assert "/auth/register" in paths
    assert "/auth/login" in paths
    assert "/auth/logout" in paths
    assert "/auth/forgot-password" in paths
    assert "/auth/reset-password" in paths
    assert "/conversations" in paths
    assert "/conversations/{conversation_id}" in paths
    assert "/conversations/{conversation_id}/messages" in paths


def test_register_stub_validates_shape_and_responds() -> None:
    response = client.post(
        "/auth/register", json={"email": "demo@example.com", "password": "a-long-password"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "not_implemented"
    assert body["endpoint"] == "POST /auth/register"


def test_register_stub_rejects_malformed_email() -> None:
    response = client.post("/auth/register", json={"email": "not-an-email", "password": "x"})

    assert response.status_code == 422


def test_rename_conversation_stub_responds() -> None:
    response = client.patch("/conversations/some-id", json={"title": "New title"})

    assert response.status_code == 200
    assert response.json()["endpoint"] == "PATCH /conversations/{id}"

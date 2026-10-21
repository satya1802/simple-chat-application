"""The baseline test the scaffold ships with.

The platform installs this tree and runs `pytest` against it, so there has to
be something green to run before an agent has written anything -- otherwise the
first real ticket cannot tell a broken change from a repository that never
worked.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_reports_ok() -> None:
    """A failure here means the application does not import or does not start."""
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert set(body["services"]) == {"redis", "openai", "sendgrid"}


def test_the_openapi_document_builds() -> None:
    """Every generated route contributes to the schema, so a route whose types
    FastAPI cannot resolve fails here rather than on a user's first request."""
    response = client.get("/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/health" in paths
    # The auth and conversation routers register every approved endpoint.
    assert "/auth/register" in paths
    assert "/auth/login" in paths
    assert "/auth/logout" in paths
    assert "/auth/forgot-password" in paths
    assert "/auth/reset-password" in paths
    assert "/conversations" in paths
    assert "/conversations/{conversation_id}/messages" in paths
    assert "/conversations/{conversation_id}" in paths

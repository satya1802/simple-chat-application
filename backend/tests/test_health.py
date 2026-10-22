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
    # openai and sendgrid are keyed by the product owner before deployment, so
    # they report False here -- that is correct, not broken.
    assert set(body["services"]) == {"redis", "openai", "sendgrid"}


def test_the_openapi_document_builds() -> None:
    """Every generated route contributes to the schema, so a route whose types
    FastAPI cannot resolve fails here rather than on a user's first request."""
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert "/health" in response.json()["paths"]


def test_every_api_spec_endpoint_is_registered() -> None:
    """Each endpoint the approved api_spec declares exists as a stub route, so
    the frontend can be built against the agreed shape from the first commit."""
    paths = client.get("/openapi.json").json()["paths"]

    assert "post" in paths["/auth/register"]
    assert "post" in paths["/auth/login"]
    assert "post" in paths["/auth/logout"]
    assert "post" in paths["/auth/forgot-password"]
    assert "post" in paths["/auth/reset-password"]
    assert "get" in paths["/conversations"]
    assert "post" in paths["/conversations"]
    assert "get" in paths["/conversations/{conversation_id}/messages"]
    assert "post" in paths["/conversations/{conversation_id}/messages"]
    assert "patch" in paths["/conversations/{conversation_id}"]
    assert "delete" in paths["/conversations/{conversation_id}"]

"""The baseline tests the scaffold ships with.

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
    assert "/health" in response.json()["paths"]


# One entry per distinct path in the approved API spec. GET and POST share a
# path when they target the same resource, so the set is deduplicated by path.
EXPECTED_API_PATHS = {
    "/auth/register",
    "/auth/login",
    "/auth/logout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/conversations",
    "/conversations/{conversation_id}/messages",
    "/conversations/{conversation_id}",
}


def test_api_spec_paths_are_declared() -> None:
    """The scaffold must declare every endpoint the approved spec names, so a
    missing route is caught here before a ticket assumes it exists."""
    response = client.get("/openapi.json")

    assert response.status_code == 200
    paths = set(response.json()["paths"])
    missing = EXPECTED_API_PATHS - paths
    assert not missing, f"Missing API spec paths: {missing}"


def test_stub_endpoints_return_501() -> None:
    """A stubbed endpoint reports 501, not 500, so an unimplemented route is
    distinguishable from a handler that raised."""
    response = client.post("/auth/register", json={"email": "a@b.com", "password": "x"})
    assert response.status_code == 501

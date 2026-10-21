"""End-to-end tests for the auth endpoints.

These tests assert the full contract of US-001 (registration) and US-002
(login, logout, password hashing), driven through the FastAPI ``TestClient``
so the routing, dependency injection, Pydantic validation and database layer
are all exercised exactly as a real request would.

They follow the pattern established by ``tests/test_health.py``: a module-level
``TestClient`` plus pytest fixtures that build the schema from the SQLAlchemy
models and drop it again after each test, so no state leaks between cases.
"""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401 -- ensures tables register on the test Base
from app.database import Base, get_db
from app.main import app

# --------------------------------------------------------------------------- #
# Fixtures
# --------------------------------------------------------------------------- #

# A fresh in-memory SQLite database per test session is rebuilt per test by the
# ``db_session`` fixture below, so every case starts from a clean schema.


@pytest.fixture()
def db_engine():
    """A private in-memory SQLite engine bound to the declarative Base."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def db_session(db_engine) -> Iterator[Session]:
    """A per-test session that is rolled back and closed after each case."""
    TestingSessionLocal = sessionmaker(bind=db_engine, autoflush=False, expire_on_commit=False)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session) -> Iterator[TestClient]:
    """A TestClient whose requests use the per-test database session."""

    def _override_get_db() -> Iterator[Session]:
        try:
            yield db_session
        finally:
            # The dependency closes the session; here we let the fixture own it.
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# --------------------------------------------------------------------------- #
# Shared payload
# --------------------------------------------------------------------------- #

GOOD_EMAIL = "alice@example.com"
GOOD_PASSWORD = "correct horse battery staple"


def _register(client: TestClient, email: str = GOOD_EMAIL, password: str = GOOD_PASSWORD):
    return client.post("/auth/register", json={"email": email, "password": password})


# --------------------------------------------------------------------------- #
# Registration
# --------------------------------------------------------------------------- #


def test_register_returns_201_with_jwt(client: TestClient) -> None:
    """US-001: successful registration returns 201 and a JWT token."""
    response = _register(client)

    assert response.status_code == 201, response.text
    body = response.json()
    assert "token" in body
    token = body["token"]
    assert isinstance(token, str) and token
    # A JWT is three dot-separated base64 segments.
    assert token.count(".") == 2
    assert "user" in body
    assert body["user"]["email"] == GOOD_EMAIL


def test_duplicate_email_returns_409(client: TestClient) -> None:
    """US-001: registering an existing email returns 409 Conflict."""
    first = _register(client)
    assert first.status_code == 201

    second = _register(client)
    assert second.status_code == 409, second.text


def test_malformed_email_returns_422(client: TestClient) -> None:
    """US-001: an invalid email is rejected with 422 by Pydantic."""
    response = _register(client, email="not-an-email", password=GOOD_PASSWORD)

    assert response.status_code == 422, response.text


def test_short_password_returns_422(client: TestClient) -> None:
    """US-001: a password shorter than 8 characters is rejected with 422."""
    response = _register(client, password="short")

    assert response.status_code == 422, response.text


# --------------------------------------------------------------------------- #
# Login
# --------------------------------------------------------------------------- #


def test_login_returns_200_with_jwt(client: TestClient) -> None:
    """US-002: valid credentials return 200 and a JWT token."""
    _register(client)

    response = client.post(
        "/auth/login", json={"email": GOOD_EMAIL, "password": GOOD_PASSWORD}
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert "token" in body
    token = body["token"]
    assert isinstance(token, str) and token
    assert token.count(".") == 2
    assert body["user"]["email"] == GOOD_EMAIL


def test_login_invalid_credentials_returns_401_generic(client: TestClient) -> None:
    """US-002: invalid credentials return 401 with a generic message.

    The message must not reveal whether the email is registered, so the same
    message is returned for an unknown email and for a known email with the
    wrong password.
    """
    _register(client)

    unknown = client.post(
        "/auth/login", json={"email": "nobody@example.com", "password": GOOD_PASSWORD}
    )
    wrong_pw = client.post(
        "/auth/login", json={"email": GOOD_EMAIL, "password": "totally-wrong-pw"}
    )

    assert unknown.status_code == 401, unknown.text
    assert wrong_pw.status_code == 401, wrong_pw.text

    unknown_msg = unknown.json().get("detail") or unknown.json().get("message") or ""
    wrong_msg = wrong_pw.json().get("detail") or wrong_pw.json().get("message") or ""
    assert unknown_msg == wrong_msg, (
        "login error message must be identical regardless of whether the email exists"
    )
    # The message must not echo the email address.
    assert GOOD_EMAIL not in unknown_msg
    assert "nobody@example.com" not in unknown_msg


# --------------------------------------------------------------------------- #
# Logout
# --------------------------------------------------------------------------- #


def test_logout_invalidates_session(client: TestClient) -> None:
    """US-002: logout invalidates the token so subsequent use is rejected.

    The session is carried in the Authorization header. After logout the same
    token must no longer be accepted by an authenticated endpoint.
    """
    reg = _register(client)
    token = reg.json()["token"]
    auth_header = {"Authorization": f"Bearer {token}"}

    logout = client.post("/auth/logout", headers=auth_header)
    assert logout.status_code == 200, logout.text

    # Any authenticated endpoint should reject the old token after logout.
    # The conversations list endpoint requires auth, so it serves as the probe.
    probe = client.get("/conversations", headers=auth_header)
    assert probe.status_code == 401, (
        "old token must be rejected after logout; got "
        f"{probe.status_code}: {probe.text[:200]}"
    )


# --------------------------------------------------------------------------- #
# Password storage
# --------------------------------------------------------------------------- #


def test_password_stored_as_bcrypt_hash(
    client: TestClient, db_session: Session
) -> None:
    """US-002: the password is stored as a bcrypt hash, never plain text.

    Queries the ``User`` row directly to confirm the stored value is a bcrypt
    digest (``$2b$`` / ``$2a$`` prefix) and is not the raw password.
    """
    _register(client)

    user = db_session.query(models.User).filter_by(email=GOOD_EMAIL).one()
    stored = user.password_hash

    assert stored != GOOD_PASSWORD, "password must not be stored in plain text"
    assert stored.startswith(("$2a$", "$2b$", "$2y$")), (
        "password hash must be a bcrypt digest"
    )
    # A bcrypt hash is 60 characters.
    assert len(stored) == 60
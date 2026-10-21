"""AC-001 .. AC-005: registration, login and session rejection after logout.

Registration and login are exercised purely through the HTTP contract fixed
by `app/schemas.py` (`RegisterRequest`, `LoginRequest`, `AuthResponse`), so
these tests do not need to know how the handlers are implemented. The DB
assertions (bcrypt hash, no row on a rejected registration) go through the
same test session the app itself uses, via the `db_session` fixture.
"""

from __future__ import annotations

from app.models import User

VALID_PASSWORD = "correct-horse-battery-staple"


def _register(client, email: str, password: str = VALID_PASSWORD):
    return client.post("/auth/register", json={"email": email, "password": password})


# --- AC-001 / AC-002: registration -------------------------------------------------


def test_register_success_returns_session_and_stores_bcrypt_hash(client, db_session, unique_email):
    response = _register(client, unique_email)

    assert response.status_code in (200, 201), response.text
    body = response.json()
    assert body.get("token"), "expected a session token in the response body"
    assert body.get("user", {}).get("email") == unique_email
    # the plaintext password itself must never appear in the response
    assert VALID_PASSWORD not in response.text

    user = db_session.query(User).filter_by(email=unique_email).one()
    assert user.password_hash != VALID_PASSWORD
    assert user.password_hash.startswith(("$2a$", "$2b$", "$2y$")), (
        "password_hash does not look like a bcrypt digest"
    )


def test_register_duplicate_email_is_rejected_with_field_error_and_no_new_row(
    client, db_session, unique_email
):
    first = _register(client, unique_email)
    assert first.status_code in (200, 201), first.text

    second = _register(client, unique_email)

    assert second.status_code in (400, 409, 422), second.text
    body = second.json()
    assert "email" in str(body).lower()

    count = db_session.query(User).filter_by(email=unique_email).count()
    assert count == 1


def test_register_malformed_email_is_rejected_and_creates_no_row(client, db_session):
    response = _register(client, "not-an-email")

    assert response.status_code == 422, response.text
    locs = [tuple(e["loc"]) for e in response.json()["detail"]]
    assert any("email" in loc for loc in locs)
    assert db_session.query(User).count() == 0


def test_register_short_password_is_rejected_and_creates_no_row(client, db_session, unique_email):
    response = _register(client, unique_email, password="short1")

    assert response.status_code == 422, response.text
    locs = [tuple(e["loc"]) for e in response.json()["detail"]]
    assert any("password" in loc for loc in locs)
    assert db_session.query(User).count() == 0


# --- AC-003 / AC-004: login --------------------------------------------------------


def test_login_success_returns_session(client, unique_email):
    _register(client, unique_email)

    response = client.post("/auth/login", json={"email": unique_email, "password": VALID_PASSWORD})

    assert response.status_code == 200, response.text
    assert response.json().get("token")


def test_login_unknown_email_and_wrong_password_return_identical_generic_error(
    client, unique_email
):
    _register(client, unique_email)

    unknown = client.post(
        "/auth/login", json={"email": "nobody-here@example.com", "password": VALID_PASSWORD}
    )
    wrong_password = client.post(
        "/auth/login", json={"email": unique_email, "password": "totally-wrong-pw"}
    )

    assert unknown.status_code == wrong_password.status_code
    assert unknown.status_code in (400, 401)
    assert unknown.json() == wrong_password.json()
    assert "incorrect" in str(unknown.json()).lower()
    assert "email or password is incorrect" in str(unknown.json()).lower()


# --- AC-005: logout invalidates the session ----------------------------------------


def test_logged_out_session_is_rejected_by_a_protected_route(client, unique_email):
    register_response = _register(client, unique_email)
    token = register_response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    before = client.get("/conversations", headers=headers)
    assert before.status_code != 401, (
        "a freshly issued session should be accepted by a protected route"
    )

    logout_response = client.post("/auth/logout", headers=headers)
    assert logout_response.status_code == 200, logout_response.text

    after = client.get("/conversations", headers=headers)
    assert after.status_code == 401, (
        "the same token must be rejected once the session has been logged out"
    )

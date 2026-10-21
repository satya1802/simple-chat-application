"""Application configuration.

Settings the handlers read at the point of use, gathered in one place so a
development agent does not reinvent them per route. Every value has a default
that lets a fresh clone start with no environment set, and a deployed instance
overrides through its environment.

Service keys (``OPENAI_API_KEY``, ``SENDGRID_API_KEY``) are NOT read here --
the architecture says each feature reads its own key at the point of use and
turns itself off with a clear message when the key is empty, so the app never
fails at startup over a missing key. ``services.py`` reports which are set.

``JWT_SECRET`` is the one exception: a session-token secret with no safe
default, so the app refuses to start when it is missing rather than silently
signing tokens with a guessable value.
"""

import os

# Daily message cap per account, enforced before any OpenAI call. Over-cap
# sends return 429. The counter lives in Redis with a day-boundary expiry.
DAILY_MESSAGE_CAP = int(os.getenv("DAILY_MESSAGE_CAP", "50"))

# Conversation title bounds. The column is varchar(120); the rename endpoint
# rejects empty titles and anything past the max.
MAX_TITLE_LENGTH = 120

# JWT session tokens. The secret MUST be set in every environment; there is no
# safe default, so a missing value is a startup error rather than a silent
# security hole.
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET must be set in the environment -- refusing to start "
        "without a session-token secret."
    )
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", str(60 * 24 * 7)))  # 7 days

# Password-reset tokens. Single-use, stored as a hash, expired after this many
# minutes. The link the user receives carries the raw token; the database keeps
# only its hash.
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "60"))

# Redis key prefix for the per-account daily counter.
COUNTER_KEY_PREFIX = "daily_messages"

__all__ = [
    "COUNTER_KEY_PREFIX",
    "DAILY_MESSAGE_CAP",
    "JWT_ALGORITHM",
    "JWT_EXPIRE_MINUTES",
    "JWT_SECRET",
    "MAX_TITLE_LENGTH",
    "RESET_TOKEN_EXPIRE_MINUTES",
]
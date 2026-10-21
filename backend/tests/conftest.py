"""Test configuration.

``JWT_SECRET`` must be set before ``app.config`` is imported (it refuses to
load without one), so we set it here at collection time -- before any test
module imports ``app.main``. A throwaway test database keeps test data out of
``app.db``. ``OPENAI_API_KEY`` is likewise required at startup (validated in
``app.main``), so a placeholder is set here for the tests that do not
specifically exercise the missing-key error path.
"""

import os

os.environ.setdefault("JWT_SECRET", "test-jwt-secret-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_auth.db")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key-not-for-production")
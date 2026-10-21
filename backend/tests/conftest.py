"""Test configuration.

``JWT_SECRET`` must be set before ``app.config`` is imported (it refuses to
load without one), so we set it here at collection time -- before any test
module imports ``app.main``. A throwaway test database keeps test data out of
``app.db``.
"""

import os

os.environ.setdefault("JWT_SECRET", "test-jwt-secret-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_auth.db")
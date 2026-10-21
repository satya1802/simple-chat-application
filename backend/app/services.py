"""The backing services this application is configured to reach.

Each entry maps a service to the environment variable that addresses it. The
health check reports which of them are reachable, so an operator can tell at a
glance whether the running deployment can actually use each feature. A service
whose key is empty is reported as not configured -- the feature that needs it
turns itself off with a clear message rather than failing at startup.
"""

import os

SERVICES = {
    "redis": "REDIS_URL",
    "openai": "OPENAI_API_KEY",
    "sendgrid": "SENDGRID_API_KEY",
}


def configured_services() -> dict[str, bool]:
    """Each service mapped to whether its connection variable is set."""
    return {name: bool(os.getenv(var)) for name, var in SERVICES.items()}

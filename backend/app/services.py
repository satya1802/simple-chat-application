"""The backing services this application is configured to reach.

Each entry maps a service to the environment variable that addresses it. The
value comes from docker-compose.yml through .env.example, so the health check
reports what the running deployment can actually reach. OPENAI_API_KEY and
SENDGRID_API_KEY are read at the point of use, not here -- an unset key turns
its feature off with a clear message instead of failing startup, so this map
only reports whether the key is present, never whether it is valid.
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

"""The backing services this application is configured to reach.

Each entry maps a service to the environment variable that addresses it. The
value for `redis` comes from docker-compose.yml through .env.example, so the
health check reports what the running deployment can actually reach.
`OPENAI_API_KEY` and `SENDGRID_API_KEY` are not set by this scaffold -- the
product owner adds them before deployment -- so the handlers that need them
must read the key at the point of use and turn the feature off with a clear
message when it is empty, rather than failing at startup. This mapping is
what lets `/health` report honestly, before and after that key arrives.
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

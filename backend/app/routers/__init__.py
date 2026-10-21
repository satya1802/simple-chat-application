"""Generated routers: one per architecture component that owns endpoints.

`main.py` mounts every router in `routers` so each path in the approved
api_spec exists -- as a stub -- from the first commit.
"""

from app.routers import auth, conversations

routers = (auth.router, conversations.router)

__all__ = ["routers"]

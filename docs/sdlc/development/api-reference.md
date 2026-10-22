# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| POST | /auth/forgot-password | forgot_password | `backend/app/routers/auth.py:89` | — |
| POST | /auth/login | login | `backend/app/routers/auth.py:57` | — |
| POST | /auth/logout | logout | `backend/app/routers/auth.py:75` | — |
| POST | /auth/register | register | `backend/app/routers/auth.py:36` | — |
| POST | /auth/reset-password | reset_password | `backend/app/routers/auth.py:94` | — |
| GET | /conversations | list_conversations | `backend/app/routers/conversations.py:53` | — |
| POST | /conversations | create_conversation | `backend/app/routers/conversations.py:71` | — |
| DELETE | /conversations/{conversation_id} | delete_conversation | `backend/app/routers/conversations.py:164` | — |
| PATCH | /conversations/{conversation_id} | rename_conversation | `backend/app/routers/conversations.py:150` | — |
| GET | /conversations/{conversation_id}/messages | list_messages | `backend/app/routers/conversations.py:82` | — |
| POST | /conversations/{conversation_id}/messages | send_message | `backend/app/routers/conversations.py:101` | — |
| GET | /health | health | `backend/app/main.py:48` | Liveness probe, and the only route here that is not a stub. |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- DELETE /conversations/{id}
- GET /conversations/{id}/messages
- PATCH /conversations/{id}
- POST /conversations/{id}/messages

**Code only:**

- DELETE /conversations/{conversation_id}
- GET /conversations/{conversation_id}/messages
- PATCH /conversations/{conversation_id}
- POST /conversations/{conversation_id}/messages
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `e1d5a00`
<!-- sdlc:auto:end source -->

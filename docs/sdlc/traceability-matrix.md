# Traceability Matrix

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start legend -->
Built from recorded links, not written by a model: requirement key → plan item (`source_stable_key`) → development ticket (`stable_key`) → the ticket's test steps → the last live deployment that started after the work finished.
<!-- sdlc:auto:end legend -->

<!-- sdlc:auto:start matrix -->
| Requirement | Epic | Title | Plan items | Sprint | Design | Code | Commits | Ticket | Tests | Deployed |
|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | EPIC-001 | Self-register with email and password | US-001, US-001-T1, US-001-T2, US-001-T3, US-001-T4, US-001-T5 | 1 | POST /auth/register, api, db, users, web | backend/app/models.py, backend/app/routers/auth.py, backend/app/routers/conversations.py, backend/app/schemas.py, backend/app/security.py +15 more | 36c62e7 | delivered | not run | — |
| US-002 | EPIC-001 | Sign in and sign out | US-002, US-002-T1, US-002-T2, US-002-T3, US-002-T4, US-002-T5 | 1 | POST /auth/login, POST /auth/logout, api, db, users, web | — | 36c62e7 | delivered | not run | — |
| US-003 | EPIC-001 | Reset a forgotten password | US-003, US-003-T1, US-003-T2, US-003-T3, US-003-T4, US-003-T5 | 2 | POST /auth/forgot-password, POST /auth/reset-password, api, db, password_reset_tokens, sendgrid, users, web | — | — | not started | not run | — |
| US-004 | EPIC-001 | See only my own conversations | US-004, US-004-T1, US-004-T2, US-004-T3, US-004-T4, US-004-T5 | 2 | DELETE /conversations/{id}, GET /conversations, GET /conversations/{id}/messages, PATCH /conversations/{id}, POST /conversations/{id}/messages, api, conversations, db, messages, users, web | — | — | not started | not run | — |
| US-005 | EPIC-002 | Ask a question and receive a streamed answer | US-005, US-005-T1, US-005-T2, US-005-T3, US-005-T4, US-005-T5 | 2 | POST /conversations/{id}/messages, api, conversations, db, messages, openai, web | — | — | not started | not run | — |
| US-006 | EPIC-002 | Chat composer and running message thread | US-006, US-006-T1, US-006-T2, US-006-T3, US-006-T4 | 3 | messages, web | — | — | not started | not run | — |
| US-007 | EPIC-002 | Assistant remembers earlier turns in the same conversation | US-007, US-007-T1, US-007-T2, US-007-T3, US-007-T4 | 3 | POST /conversations/{id}/messages, api, conversations, db, messages, openai | — | — | not started | not run | — |
| US-008 | EPIC-002 | Answers rendered as formatted text with code blocks | US-008, US-008-T1, US-008-T2, US-008-T3, US-008-T4 | 4 | web | — | — | not started | not run | — |
| US-009 | EPIC-002 | Daily message cap per account | US-009, US-009-T1, US-009-T2, US-009-T3, US-009-T4, US-009-T5 | 4 | POST /conversations/{id}/messages, api, cache, db, users, web | — | — | not started | not run | — |
| US-010 | EPIC-003 | Start a new conversation | US-010, US-010-T1, US-010-T2, US-010-T3, US-010-T4 | 1 | POST /conversations, api, conversations, db, web | backend/app/routers/conversations.py, backend/app/schemas.py, backend/tests/test_conversations.py, frontend/e2e/us-010-sign-up-to-first-reply.spec.ts, frontend/src/lib/api.test.ts +3 more | 89a5106 | delivered | not run | — |
| US-011 | EPIC-003 | Browse my conversations newest-first in a sidebar | US-011, US-011-T1, US-011-T2, US-011-T3, US-011-T4 | 3 | GET /conversations, api, conversations, db, web | — | — | not started | not run | — |
| US-012 | EPIC-003 | Reopen a conversation and see its saved history | US-012, US-012-T1, US-012-T2, US-012-T3, US-012-T4 | 3 | GET /conversations/{id}/messages, api, conversations, db, messages, web | — | — | not started | not run | — |
| US-013 | EPIC-003 | Rename a conversation | US-013, US-013-T1, US-013-T2, US-013-T3 | 3 | PATCH /conversations/{id}, api, conversations, db, web | — | — | not started | not run | — |
| US-014 | EPIC-003 | Delete a conversation | US-014, US-014-T1, US-014-T2, US-014-T3 | 3 | DELETE /conversations/{id}, api, conversations, db, messages, web | — | — | not started | not run | — |
| US-015 | EPIC-004 | Use the chat on a phone | US-015, US-015-T1, US-015-T2, US-015-T3, US-015-T4 | 4 | web | — | — | not started | not run | — |
| US-016 | EPIC-004 | Consistent English-only interface | US-016, US-016-T1, US-016-T2, US-016-T3 | 4 | web | — | — | not started | not run | — |
| US-017 | EPIC-005 | Configure the hosted LLM provider | US-017, US-017-T1, US-017-T2, US-017-T3, US-017-T4 | 1 | api, openai | backend/app/config.py, backend/app/llm.py, backend/app/main.py, backend/app/routers/conversations.py, backend/tests/test_llm_unit.py +1 more | 89a5106 | delivered | not run | — |
| US-018 | EPIC-005 | Configure the assistant's system prompt | US-018, US-018-T1, US-018-T2, US-018-T3 | 1 | api, openai, web | — | 89a5106 | delivered | not run | — |
| US-019 | EPIC-005 | Set up and run the prototype from written instructions | US-019, US-019-T1, US-019-T2, US-019-T3, US-019-T4 | 4 | api, db, web | — | — | not started | not run | — |
<!-- sdlc:auto:end matrix -->

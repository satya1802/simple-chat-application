# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Stand up account registration/sign-in, LLM provider configuration, and the ability to start a conversation

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Self-register with email and password | 5 | backend-agent | — |
| ↳ US-001-T1 | Task | Build registration endpoint with validation | — | backend-agent | — |
| ↳ US-001-T2 | Task | Hash password and persist user | — | backend-agent | — |
| ↳ US-001-T3 | Task | Build sign-up form UI | — | frontend-agent | — |
| ↳ US-001-T4 | Task | Auto sign-in after registration | — | frontend-agent | — |
| ↳ US-001-T5 | Task | Test registration edge cases | — | qa-agent | — |
| US-002 | Story | Sign in and sign out | 5 | backend-agent | US-001 |
| ↳ US-002-T1 | Task | Implement login endpoint | — | backend-agent | — |
| ↳ US-002-T2 | Task | Implement logout endpoint | — | backend-agent | — |
| ↳ US-002-T3 | Task | Build sign-in page | — | frontend-agent | — |
| ↳ US-002-T4 | Task | Add route guard for unauthenticated access | — | frontend-agent | — |
| ↳ US-002-T5 | Task | Test credential failure messaging | — | qa-agent | — |
| US-010 | Story | Start a new conversation | 3 | frontend-agent | US-002 |
| ↳ US-010-T1 | Task | Implement conversation creation endpoint | — | backend-agent | — |
| ↳ US-010-T2 | Task | Build New Chat UI action | — | frontend-agent | — |
| ↳ US-010-T3 | Task | Auto-generate conversation title | — | backend-agent | — |
| ↳ US-010-T4 | Task | Avoid orphaned empty conversations | — | backend-agent | — |
| US-017 | Story | Configure the hosted LLM provider | 3 | backend-agent | — |
| ↳ US-017-T1 | Task | Add LLM configuration schema | — | backend-agent | — |
| ↳ US-017-T2 | Task | Implement fail-fast startup validation | — | backend-agent | — |
| ↳ US-017-T3 | Task | Wire configured model into OpenAI client | — | integration-agent | — |
| ↳ US-017-T4 | Task | Ensure key is never exposed | — | security-agent | — |
| US-018 | Story | Configure the assistant's system prompt | 2 | backend-agent | US-017 |
| ↳ US-018-T1 | Task | Add configurable system prompt | — | backend-agent | — |
| ↳ US-018-T2 | Task | Inject prompt into every LLM request | — | backend-agent | — |
| ↳ US-018-T3 | Task | Keep prompt hidden from end users | — | frontend-agent | — |

## Sprint 2: Sprint 2

Add password recovery, enforce per-account data isolation, and ship the core streamed chat experience

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-003 | Story | Reset a forgotten password | 5 | backend-agent | US-001, US-002 |
| ↳ US-003-T1 | Task | Create password_reset_tokens table | — | backend-agent | — |
| ↳ US-003-T2 | Task | Implement forgot-password endpoint with SendGrid send | — | integration-agent | — |
| ↳ US-003-T3 | Task | Implement reset-password endpoint | — | backend-agent | — |
| ↳ US-003-T4 | Task | Build forgot/reset password UI pages | — | frontend-agent | — |
| ↳ US-003-T5 | Task | Test expired and reused tokens | — | qa-agent | — |
| US-004 | Story | See only my own conversations | 5 | security-agent | US-002, US-010 |
| ↳ US-004-T1 | Task | Add ownership middleware to conversation/message endpoints | — | security-agent | — |
| ↳ US-004-T2 | Task | Scope all queries by authenticated user id | — | backend-agent | — |
| ↳ US-004-T3 | Task | Guard unauthenticated access to chat routes | — | frontend-agent | — |
| ↳ US-004-T4 | Task | Remove any share/export/public-link controls | — | frontend-agent | — |
| ↳ US-004-T5 | Task | Cross-account access penetration tests | — | qa-agent | — |
| US-005 | Story | Ask a question and receive a streamed answer | 8 | backend-agent | US-010, US-017 |
| ↳ US-005-T1 | Task | Implement streaming message endpoint | — | backend-agent | — |
| ↳ US-005-T2 | Task | Integrate OpenAI streaming completion call | — | integration-agent | — |
| ↳ US-005-T3 | Task | Persist completed exchange | — | backend-agent | — |
| ↳ US-005-T4 | Task | Build frontend streaming consumer | — | frontend-agent | — |
| ↳ US-005-T5 | Task | Handle stream errors and retries | — | frontend-agent | — |

## Sprint 3: Sprint 3

Deliver the full saved-conversations experience: sidebar, reopening history, in-conversation memory, rename and delete

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-006 | Story | Chat composer and running message thread | 5 | frontend-agent | US-005 |
| ↳ US-006-T1 | Task | Build chat thread component | — | frontend-agent | — |
| ↳ US-006-T2 | Task | Build auto-growing composer | — | frontend-agent | — |
| ↳ US-006-T3 | Task | Guard empty/whitespace submissions | — | frontend-agent | — |
| ↳ US-006-T4 | Task | Implement auto-scroll during streaming | — | frontend-agent | — |
| US-007 | Story | Assistant remembers earlier turns in the same conversation | 3 | backend-agent | US-005 |
| ↳ US-007-T1 | Task | Build conversation context assembler | — | backend-agent | — |
| ↳ US-007-T2 | Task | Implement context-window trimming | — | backend-agent | — |
| ↳ US-007-T3 | Task | Ensure system prompt always included | — | backend-agent | — |
| ↳ US-007-T4 | Task | Test cross-conversation memory isolation | — | qa-agent | — |
| US-011 | Story | Browse my conversations newest-first in a sidebar | 3 | frontend-agent | US-010 |
| ↳ US-011-T1 | Task | Implement conversation list endpoint ordered by activity | — | backend-agent | — |
| ↳ US-011-T2 | Task | Build sidebar list component | — | frontend-agent | — |
| ↳ US-011-T3 | Task | Build empty sidebar state | — | frontend-agent | — |
| ↳ US-011-T4 | Task | Reorder sidebar on new activity | — | frontend-agent | — |
| US-012 | Story | Reopen a conversation and see its saved history | 3 | frontend-agent | US-010, US-005 |
| ↳ US-012-T1 | Task | Implement conversation history endpoint | — | backend-agent | — |
| ↳ US-012-T2 | Task | Load and render history on selection | — | frontend-agent | — |
| ↳ US-012-T3 | Task | Highlight selected conversation | — | frontend-agent | — |
| ↳ US-012-T4 | Task | Test cross-session persistence | — | qa-agent | — |
| US-013 | Story | Rename a conversation | 2 | backend-agent | US-011 |
| ↳ US-013-T1 | Task | Implement rename endpoint with validation | — | backend-agent | — |
| ↳ US-013-T2 | Task | Build rename UI | — | frontend-agent | — |
| ↳ US-013-T3 | Task | Truncate long titles in sidebar display | — | frontend-agent | — |
| US-014 | Story | Delete a conversation | 2 | backend-agent | US-011 |
| ↳ US-014-T1 | Task | Implement delete endpoint with cascading cleanup | — | backend-agent | — |
| ↳ US-014-T2 | Task | Build delete confirmation dialog | — | frontend-agent | — |
| ↳ US-014-T3 | Task | Switch view after deletion | — | frontend-agent | — |

## Sprint 4: Sprint 4

Add the daily usage cap, formatted/code-block rendering, mobile responsiveness, and the operator setup README

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-008 | Story | Answers rendered as formatted text with code blocks | 5 | frontend-agent | US-006 |
| ↳ US-008-T1 | Task | Integrate sanitized markdown renderer | — | frontend-agent | — |
| ↳ US-008-T2 | Task | Build code block component | — | frontend-agent | — |
| ↳ US-008-T3 | Task | Handle incomplete streaming markdown | — | frontend-agent | — |
| ↳ US-008-T4 | Task | Test sanitisation against script injection | — | qa-agent | — |
| US-009 | Story | Daily message cap per account | 5 | backend-agent | US-005 |
| ↳ US-009-T1 | Task | Add Redis-backed daily counter | — | backend-agent | — |
| ↳ US-009-T2 | Task | Enforce cap before LLM call | — | backend-agent | — |
| ↳ US-009-T3 | Task | Return clear limit-reached response | — | backend-agent | — |
| ↳ US-009-T4 | Task | Surface limit message in chat UI | — | frontend-agent | — |
| ↳ US-009-T5 | Task | Make the cap operator-configurable | — | devops-agent | — |
| US-015 | Story | Use the chat on a phone | 5 | frontend-agent | US-006, US-011 |
| ↳ US-015-T1 | Task | Build responsive breakpoints | — | frontend-agent | — |
| ↳ US-015-T2 | Task | Implement collapsible mobile sidebar | — | frontend-agent | — |
| ↳ US-015-T3 | Task | Handle on-screen keyboard viewport shifts | — | frontend-agent | — |
| ↳ US-015-T4 | Task | Test responsive layouts | — | qa-agent | — |
| US-016 | Story | Consistent English-only interface | 1 | frontend-agent | US-015 |
| ↳ US-016-T1 | Task | Audit all interface and email text | — | frontend-agent | — |
| ↳ US-016-T2 | Task | Confirm no localization control exists | — | frontend-agent | — |
| ↳ US-016-T3 | Task | Test non-English browser locale load | — | qa-agent | — |
| US-019 | Story | Set up and run the prototype from written instructions | 3 | devops-agent | US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-011, US-012, US-013, US-014, US-015, US-016, US-017, US-018 |
| ↳ US-019-T1 | Task | Write setup and run instructions | — | devops-agent | — |
| ↳ US-019-T2 | Task | Document required environment variables | — | devops-agent | — |
| ↳ US-019-T3 | Task | Write deployment and limitations section | — | devops-agent | — |
| ↳ US-019-T4 | Task | Document billing status | — | devops-agent | — |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->

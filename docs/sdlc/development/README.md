# Development

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### PLAN-V2 · approved · source: plan:v2

Approved development plan, version 2, organizing the full backlog (5 epics, 20 stories, ~90 tasks) into 4 sprints.

Plan status: approved, version 2.
Sprints:
- Sprint 1 (capacity 20): goal = stand up account registration/sign-in, LLM provider configuration, and the ability to start a conversation.
- Sprint 2 (capacity 20): goal = add password recovery, enforce per-account data isolation, ship the core streamed chat experience.
- Sprint 3 (capacity 20): goal = deliver the full saved-conversations experience (sidebar, reopening history, in-conversation memory, rename/delete).
- Sprint 4 (capacity 20): goal = add the daily usage cap, formatted/code-block rendering, mobile responsiveness, operator setup README.

Backlog:
EPIC-001 Account Access and Private Data Isolation:
 - US-001 Self-register with email and password (5pts, backend-agent): registration endpoint w/ validation; hash password & persist user; sign-up form UI; auto sign-in after registration; test registration edge cases.
 - US-002 Sign in and sign out (5pts, backend-agent): login endpoint; logout endpoint; sign-in page; route guard for unauthenticated access; test credential failure messaging.
 - US-003 Reset a forgotten password (5pts, backend-agent): password_reset_tokens table; forgot-password endpoint w/ SendGrid send; reset-password endpoint; forgot/reset password UI pages; test expired/reused tokens.
 - US-004 See only my own conversations (5pts, security-agent): ownership middleware on conversation/message endpoints; scope all queries by user id; guard unauthenticated chat routes; remove share/export/public-link controls; cross-account access penetration tests.
EPIC-002 AI Chat with Streamed Answers:
 - US-005 Ask a question and receive a streamed answer (8pts, backend-agent): streaming message endpoint; OpenAI streaming completion integration; persist completed exchange; frontend streaming consumer; handle stream errors/retries.
 - US-006 Chat composer and running message thread (5pts, frontend-agent): chat thread component; auto-growing composer; guard empty/whitespace submissions; auto-scroll during streaming.
 - US-007 Assistant remembers earlier turns in the same conversation (3pts, backend-agent): conversation context assembler; context-window trimming; ensure system prompt always included; test cross-conversation memory isolation.
 - US-008 Answers rendered as formatted text with code blocks (5pts, frontend-agent): sanitized markdown renderer; code block component; handle incomplete streaming markdown; test sanitisation against script injection.
 - US-009 Daily message cap per account (5pts, backend-agent): Redis-backed daily counter; enforce cap before LLM call; clear limit-reached response; surface limit message in chat UI; make cap operator-configurable.
EPIC-003 Saved Conversations:
 - US-010 Start a new conversation (3pts, frontend-agent): conversation creation endpoint; New Chat UI action; auto-generate conversation title; avoid orphaned empty conversations.
 - US-011 Browse my conversations newest-first in a sidebar (3pts, frontend-agent): conversation list endpoint ordered by activity; sidebar list component; empty sidebar state; reorder sidebar on new activity.
 - US-012 Reopen a conversation and see its saved history (3pts, frontend-agent): conversation history endpoint; load/render history on selection; highlight selected conversation; test cross-session persistence.
 - US-013 Rename a conversation (2pts, backend-agent): rename endpoint w/ validation; rename UI; truncate long titles in sidebar display.
 - US-014 Delete a conversation (2pts, backend-agent): delete endpoint w/ cascading cleanup; delete confirmation dialog; switch view after deletion.
EPIC-004 Responsive Web Experience:
 - US-015 Use the chat on a phone (5pts, frontend-agent): responsive breakpoints; collapsible mobile sidebar; handle on-screen keyboard viewport shifts; test responsive layouts.
 - US-016 Consistent English-only interface (1pt, frontend-agent): audit interface/email text; confirm no localization control exists; test non-English browser locale load.
EPIC-005 Prototype Setup and Operation:
 - US-017 Configure the hosted LLM provider (3pts, backend-agent): LLM configuration schema; fail-fast startup validation; wire configured model into OpenAI client; ensure key never exposed.
 - US-018 Configure the assistant's system prompt (2pts, backend-agent): configurable system prompt; inject prompt into every LLM request; keep prompt hidden from end users.
 - US-019 Set up and run the prototype from written instructions (3pts, devops-agent): write setup/run instructions; document required environment variables; write deployment/limitations section; document billing status.
Unassigned-to-epic item: US-020 Move Sign out into the left navigation under Chat (2pts, frontend-agent).

**Related:** EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005, US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016, US-017, US-018, US-019, US-020

- ⚠ Plan does not explicitly state which stories/tasks are assigned to which sprint -- only sprint goal text implies likely coverage; a formal item-to-sprint mapping was not provided.

### SPRINT-1 · approved · source: plan:Sprint 1

Sprint 1 goal: stand up account registration/sign-in, LLM provider configuration, and the ability to start a conversation.

Capacity: 20 points. Goal as stated in plan: 'Stand up account registration/sign-in, LLM provider configuration, and the ability to start a conversation.' No explicit list of which backlog items were pulled into this sprint was provided; related story ids listed here are inferred from the goal wording only.

**Related:** US-001, US-002, US-017

- ⚠ No explicit sprint-item assignment given; related_ids are inferred from goal text, not confirmed by the input.

### SPRINT-2 · approved · source: plan:Sprint 2

Sprint 2 goal: add password recovery, enforce per-account data isolation, and ship the core streamed chat experience.

Capacity: 20 points. Goal as stated in plan: 'Add password recovery, enforce per-account data isolation, and ship the core streamed chat experience.' No explicit list of which backlog items were pulled into this sprint was provided; related story ids listed here are inferred from the goal wording only.

**Related:** US-003, US-004, US-005, US-006

- ⚠ No explicit sprint-item assignment given; related_ids are inferred from goal text, not confirmed by the input.

### SPRINT-3 · approved · source: plan:Sprint 3

Sprint 3 goal: deliver the full saved-conversations experience -- sidebar, reopening history, in-conversation memory, rename and delete.

Capacity: 20 points. Goal as stated in plan: 'Deliver the full saved-conversations experience: sidebar, reopening history, in-conversation memory, rename and delete.' No explicit list of which backlog items were pulled into this sprint was provided; related story ids listed here are inferred from the goal wording only.

**Related:** US-010, US-011, US-012, US-013, US-014, US-007

- ⚠ No explicit sprint-item assignment given; related_ids are inferred from goal text, not confirmed by the input.

### SPRINT-4 · approved · source: plan:Sprint 4

Sprint 4 goal: add the daily usage cap, formatted/code-block rendering, mobile responsiveness, and the operator setup README.

Capacity: 20 points. Goal as stated in plan: 'Add the daily usage cap, formatted/code-block rendering, mobile responsiveness, and the operator setup README.' No explicit list of which backlog items were pulled into this sprint was provided; related story ids listed here are inferred from the goal wording only.

**Related:** US-009, US-008, US-015, US-019

- ⚠ No explicit sprint-item assignment given; related_ids are inferred from goal text, not confirmed by the input.

### DEV-RUN-STATUS · draft · source: dev:run

Development run input is labeled 'completed' overall, but only one of the 20 planned stories (US-020) has a recorded ticket with delivery evidence.

The development run input states overall status 'completed.' The only concrete ticket record provided is for US-020 (status=delivered, with a commit hash). No ticket records, commits, statuses, or notes were provided for US-001 through US-019 or any of their associated tasks, despite the plan defining detailed work for all of them across 4 sprints.

**Related:** US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016, US-017, US-018, US-019, US-020

- ⚠ Conflict: run status is reported as 'completed' but delivery evidence exists for only 1 of 20 planned stories -- this discrepancy should be confirmed with the development/orchestration agent rather than assumed.
- ⚠ No commit, status, or test information was provided for US-001 through US-019 or their sub-tasks; these should be treated as undocumented/unknown until further input is supplied.
- ⚠ Unclear whether 'completed' refers to only the subset of work actually run in this cycle (e.g. just US-020) or to the full backlog -- input does not clarify scope of the run.

### TICKET-US-020 · approved · source: dev:US-020

Ticket for moving the Sign out control into the left navigation under Chat was delivered.

Ticket US-020 ('Move Sign out into the left navigation under Chat') is recorded with status=delivered and commit=c526d491a46909b0a7dba53d1fd53f0ee84868f0. This is the only ticket in the development run input with concrete delivery evidence.

**Related:** US-020

- ⚠ No test or review evidence accompanies this delivery record beyond the commit reference -- QA/verification status for this specific change was not provided.
<!-- sdlc:auto:end narrative -->

# Development

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### DEV-PLAN-v1 · approved · source: plan:v1

Development plan version 1 is approved, organizing all 19 stories across 5 epics into 4 sprints, each with 20-point capacity.

Sprint 1 goal: stand up account registration/sign-in, LLM provider configuration, and the ability to start a conversation (capacity 20). Sprint 2 goal: add password recovery, enforce per-account data isolation, and ship the core streamed chat experience (capacity 20). Sprint 3 goal: deliver the full saved-conversations experience -- sidebar, reopening history, in-conversation memory, rename and delete (capacity 20). Sprint 4 goal: add the daily usage cap, formatted/code-block rendering, mobile responsiveness, and the operator setup README (capacity 20). Backlog structure: EPIC-001 Account Access and Private Data Isolation (US-001..US-004), EPIC-002 AI Chat with Streamed Answers (US-005..US-009), EPIC-003 Saved Conversations (US-010..US-014), EPIC-004 Responsive Web Experience (US-015, US-016), EPIC-005 Prototype Setup and Operation (US-017..US-019).

**Related:** US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016, US-017, US-018, US-019

- ⚠ Input does not provide an explicit field mapping individual stories to a specific sprint number -- only sprint goals (free text) and a flat item list are given, so story-to-sprint assignment cannot be stated with certainty.

### DEV-RUN-2026 · draft · source: dev:run-status

The development run is reported as 'completed', but recorded ticket status is only available for 5 of the 19 planned stories.

Reported run status: completed. Tickets with recorded status: US-001 delivered (commit 36c62e7144ed8b9c50641ab4e11244aea3140cd0), US-002 delivered (commit 36c62e7144ed8b9c50641ab4e11244aea3140cd0), US-010 delivered (commit 89a5106bddea453f1c025d64a8b02204286cd2a7), US-017 delivered (commit 89a5106bddea453f1c025d64a8b02204286cd2a7), US-018 delivered (commit 89a5106bddea453f1c025d64a8b02204286cd2a7). No ticket status was provided in the input for US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-011, US-012, US-013, US-014, US-015, US-016, or US-019.

**Related:** US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-011, US-012, US-013, US-014, US-015, US-016, US-019

- ⚠ Discrepancy: the run status says 'completed' but 14 of 19 planned stories have no recorded ticket/delivery status -- unclear whether they were descoped, still in progress, or simply omitted from this report.

### US-001 · approved · source: dev:US-001

Self-registration with email and password was delivered.

Story US-001 (5 points, backend-agent) ticket status: delivered, commit 36c62e7144ed8b9c50641ab4e11244aea3140cd0. Planned tasks: build registration endpoint with validation (backend-agent); hash password and persist user (backend-agent); build sign-up form UI (frontend-agent); auto sign-in after registration (frontend-agent); test registration edge cases (qa-agent).

**Related:** US-001-T1, US-001-T2, US-001-T3, US-001-T4, US-001-T5

- ⚠ Input confirms the parent ticket was delivered but does not break out completion status per individual task (T1-T5).

### US-002 · approved · source: dev:US-002

Sign in and sign out functionality was delivered.

Story US-002 (5 points, backend-agent) ticket status: delivered, commit 36c62e7144ed8b9c50641ab4e11244aea3140cd0. Planned tasks: implement login endpoint (backend-agent); implement logout endpoint (backend-agent); build sign-in page (frontend-agent); add route guard for unauthenticated access (frontend-agent); test credential failure messaging (qa-agent).

**Related:** US-002-T1, US-002-T2, US-002-T3, US-002-T4, US-002-T5

- ⚠ Input confirms the parent ticket was delivered but does not break out completion status per individual task (T1-T5).

### US-003 · draft · source: plan:US-003

Password reset via forgotten-password flow is planned but has no reported development status.

Story US-003 (5 points, backend-agent). Planned tasks: create password_reset_tokens table (backend-agent); implement forgot-password endpoint with SendGrid send (integration-agent); implement reset-password endpoint (backend-agent); build forgot/reset password UI pages (frontend-agent); test expired and reused tokens (qa-agent).

**Related:** US-003-T1, US-003-T2, US-003-T3, US-003-T4, US-003-T5

- ⚠ No development ticket or delivery status reported for US-003, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-004 · draft · source: plan:US-004

Per-account conversation data isolation is planned but has no reported development status.

Story US-004 (5 points, security-agent). Planned tasks: add ownership middleware to conversation/message endpoints (security-agent); scope all queries by authenticated user id (backend-agent); guard unauthenticated access to chat routes (frontend-agent); remove any share/export/public-link controls (frontend-agent); cross-account access penetration tests (qa-agent).

**Related:** US-004-T1, US-004-T2, US-004-T3, US-004-T4, US-004-T5

- ⚠ No development ticket or delivery status reported for US-004, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-005 · draft · source: plan:US-005

Streamed question-and-answer chat is planned but has no reported development status.

Story US-005 (8 points, backend-agent). Planned tasks: implement streaming message endpoint (backend-agent); integrate OpenAI streaming completion call (integration-agent); persist completed exchange (backend-agent); build frontend streaming consumer (frontend-agent); handle stream errors and retries (frontend-agent).

**Related:** US-005-T1, US-005-T2, US-005-T3, US-005-T4, US-005-T5

- ⚠ No development ticket or delivery status reported for US-005, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-006 · draft · source: plan:US-006

Chat composer and running message thread is planned but has no reported development status.

Story US-006 (5 points, frontend-agent). Planned tasks: build chat thread component (frontend-agent); build auto-growing composer (frontend-agent); guard empty/whitespace submissions (frontend-agent); implement auto-scroll during streaming (frontend-agent).

**Related:** US-006-T1, US-006-T2, US-006-T3, US-006-T4

- ⚠ No development ticket or delivery status reported for US-006, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-007 · draft · source: plan:US-007

In-conversation memory of earlier turns is planned but has no reported development status.

Story US-007 (3 points, backend-agent). Planned tasks: build conversation context assembler (backend-agent); implement context-window trimming (backend-agent); ensure system prompt always included (backend-agent); test cross-conversation memory isolation (qa-agent).

**Related:** US-007-T1, US-007-T2, US-007-T3, US-007-T4

- ⚠ No development ticket or delivery status reported for US-007, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-008 · draft · source: plan:US-008

Formatted/code-block answer rendering is planned but has no reported development status.

Story US-008 (5 points, frontend-agent). Planned tasks: integrate sanitized markdown renderer (frontend-agent); build code block component (frontend-agent); handle incomplete streaming markdown (frontend-agent); test sanitisation against script injection (qa-agent).

**Related:** US-008-T1, US-008-T2, US-008-T3, US-008-T4

- ⚠ No development ticket or delivery status reported for US-008, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-009 · draft · source: plan:US-009

Daily message cap per account is planned but has no reported development status.

Story US-009 (5 points, backend-agent). Planned tasks: add Redis-backed daily counter (backend-agent); enforce cap before LLM call (backend-agent); return clear limit-reached response (backend-agent); surface limit message in chat UI (frontend-agent); make the cap operator-configurable (devops-agent).

**Related:** US-009-T1, US-009-T2, US-009-T3, US-009-T4, US-009-T5

- ⚠ No development ticket or delivery status reported for US-009, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-010 · approved · source: dev:US-010

Starting a new conversation was delivered.

Story US-010 (3 points, frontend-agent) ticket status: delivered, commit 89a5106bddea453f1c025d64a8b02204286cd2a7. Planned tasks: implement conversation creation endpoint (backend-agent); build New Chat UI action (frontend-agent); auto-generate conversation title (backend-agent); avoid orphaned empty conversations (backend-agent).

**Related:** US-010-T1, US-010-T2, US-010-T3, US-010-T4

- ⚠ Input confirms the parent ticket was delivered but does not break out completion status per individual task (T1-T4).

### US-011 · draft · source: plan:US-011

Browsing conversations newest-first in a sidebar is planned but has no reported development status.

Story US-011 (3 points, frontend-agent). Planned tasks: implement conversation list endpoint ordered by activity (backend-agent); build sidebar list component (frontend-agent); build empty sidebar state (frontend-agent); reorder sidebar on new activity (frontend-agent).

**Related:** US-011-T1, US-011-T2, US-011-T3, US-011-T4

- ⚠ No development ticket or delivery status reported for US-011, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-012 · draft · source: plan:US-012

Reopening a conversation and viewing its saved history is planned but has no reported development status.

Story US-012 (3 points, frontend-agent). Planned tasks: implement conversation history endpoint (backend-agent); load and render history on selection (frontend-agent); highlight selected conversation (frontend-agent); test cross-session persistence (qa-agent).

**Related:** US-012-T1, US-012-T2, US-012-T3, US-012-T4

- ⚠ No development ticket or delivery status reported for US-012, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-013 · draft · source: plan:US-013

Renaming a conversation is planned but has no reported development status.

Story US-013 (2 points, backend-agent). Planned tasks: implement rename endpoint with validation (backend-agent); build rename UI (frontend-agent); truncate long titles in sidebar display (frontend-agent).

**Related:** US-013-T1, US-013-T2, US-013-T3

- ⚠ No development ticket or delivery status reported for US-013, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-014 · draft · source: plan:US-014

Deleting a conversation is planned but has no reported development status.

Story US-014 (2 points, backend-agent). Planned tasks: implement delete endpoint with cascading cleanup (backend-agent); build delete confirmation dialog (frontend-agent); switch view after deletion (frontend-agent).

**Related:** US-014-T1, US-014-T2, US-014-T3

- ⚠ No development ticket or delivery status reported for US-014, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-015 · draft · source: plan:US-015

Using the chat on a phone (responsive layout) is planned but has no reported development status.

Story US-015 (5 points, frontend-agent). Planned tasks: build responsive breakpoints (frontend-agent); implement collapsible mobile sidebar (frontend-agent); handle on-screen keyboard viewport shifts (frontend-agent); test responsive layouts (qa-agent).

**Related:** US-015-T1, US-015-T2, US-015-T3, US-015-T4

- ⚠ No development ticket or delivery status reported for US-015, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-016 · draft · source: plan:US-016

Consistent English-only interface is planned but has no reported development status.

Story US-016 (1 point, frontend-agent). Planned tasks: audit all interface and email text (frontend-agent); confirm no localization control exists (frontend-agent); test non-English browser locale load (qa-agent).

**Related:** US-016-T1, US-016-T2, US-016-T3

- ⚠ No development ticket or delivery status reported for US-016, though it is in the approved plan; conflicts with the overall run status of 'completed'.

### US-017 · approved · source: dev:US-017

Hosted LLM provider configuration was delivered.

Story US-017 (3 points, backend-agent) ticket status: delivered, commit 89a5106bddea453f1c025d64a8b02204286cd2a7. Planned tasks: add LLM configuration schema (backend-agent); implement fail-fast startup validation (backend-agent); wire configured model into OpenAI client (integration-agent); ensure key is never exposed (security-agent).

**Related:** US-017-T1, US-017-T2, US-017-T3, US-017-T4

- ⚠ Input confirms the parent ticket was delivered but does not break out completion status per individual task (T1-T4).

### US-018 · approved · source: dev:US-018

Configurable assistant system prompt was delivered.

Story US-018 (2 points, backend-agent) ticket status: delivered, commit 89a5106bddea453f1c025d64a8b02204286cd2a7. Planned tasks: add configurable system prompt (backend-agent); inject prompt into every LLM request (backend-agent); keep prompt hidden from end users (frontend-agent).

**Related:** US-018-T1, US-018-T2, US-018-T3

- ⚠ Input confirms the parent ticket was delivered but does not break out completion status per individual task (T1-T3).

### US-019 · draft · source: plan:US-019

Setting up and running the prototype from written instructions is planned but has no reported development status.

Story US-019 (3 points, devops-agent). Planned tasks: write setup and run instructions (devops-agent); document required environment variables (devops-agent); write deployment and limitations section (devops-agent); document billing status (devops-agent).

**Related:** US-019-T1, US-019-T2, US-019-T3, US-019-T4

- ⚠ No development ticket or delivery status reported for US-019, though it is in the approved plan; conflicts with the overall run status of 'completed'. This story also covers the operator setup README, which is relevant to downstream deployment documentation.
<!-- sdlc:auto:end narrative -->

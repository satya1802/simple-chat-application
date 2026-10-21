# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-000 · approved · source: requirements:tech_stack_and_scope

Product owner approved an exact technology stack and service set for a lightweight prototype chat app, plus an explicit in-scope/out-of-scope capability list.

Delivery scope: lightweight. Requirements version: 1. Approved stack (design against exactly these, no substitution): Backend FastAPI 0.115 (chosen over an originally-requested Node backend because this platform builds Python backends; justified by native token streaming and the official OpenAI Python library); Cloud AWS (managed hosting, one small container each for API/web plus small managed Postgres, keeps DB/secrets/logs in one account); Database PostgreSQL 16 (fits simple user/conversation/message relational queries, supports per-account isolation and daily message counting); Frontend React 19. Runtime services: OpenAI (SaaS, OPENAI_API_KEY) for all assistant answers; Redis (container redis:7-alpine) for per-account daily message counters; SendGrid (SaaS, SENDGRID_API_KEY) for the single password-reset email. Required API keys: OPENAI_API_KEY, REDIS_URL, SENDGRID_API_KEY. Out of scope: user-to-user messaging, RAG/document upload, integration with existing company systems, native mobile apps, voice input/output, image generation, file/image attachments. In-scope capabilities: streamed token-by-token answers, chat composer with running thread, in-conversation memory, multiple saved conversations listed newest-first, new/rename/delete conversation, reloaded history, public self-registration/sign-in, per-account data isolation, formatted markdown/code rendering, mobile-responsive layout, setup/run instructions, OpenAI-hosted model answers, email+password auth with no verification/Google sign-in, operator-changeable neutral system prompt, no sharing/export/public links, chronological-only conversation list, indefinite history retention until user deletion, English-only UI.

**Related:** EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005

### REQ-EPIC-001 · approved · source: requirements:EPIC-001

Public self-service sign-up/sign-in with strict per-account data isolation; no email verification, no social login, no sharing/export in this release.

Assumptions: email+password sign-up with password-reset-only recovery (no verification, no Google sign-in); no transactional email beyond password reset; prototype-grade data handling (hashed passwords, HTTPS, scoped queries) with no formal compliance program; app is free, no billing (future monetisation assumed to be monthly Stripe subscription, STRIPE_SECRET_KEY, not built now). Stories: US-001 [critical] Self-register with email/password — account created with salted-hash password, auto sign-in, inline validation errors (AC-001, AC-002). US-002 [critical] Sign in/out — authenticated session, generic invalid-credential message, sign-out invalidates session and redirects (AC-003–AC-005). US-003 [high] Reset forgotten password — single-use time-limited reset link via email, enumeration-safe confirmation, invalid/expired link handling (AC-006–AC-008). US-004 [critical] See only my own conversations — list/endpoint scoping by owner, forbidden/not-found on cross-account access, unauthenticated redirect, no share/export/public-link controls anywhere (AC-009–AC-012).

**Related:** US-001, US-002, US-003, US-004

### REQ-EPIC-002 · approved · source: requirements:EPIC-002

Core AI chat: token-streamed OpenAI answers, composer/thread UI, in-conversation memory, sanitised markdown/code rendering, and a server-enforced daily message cap.

Assumptions: OpenAI hosted LLM (swappable), neutral default system prompt, memory scoped to a single conversation only (no cross-conversation or long-term memory), operator-configurable daily per-account cap with an as-yet-undecided limit, markdown-only rendering with no tool/function calling. Stories: US-005 [critical] Ask a question, get streamed answer — immediate user message display, incremental token rendering, persistence on completion, send-blocking during stream, plain-English error handling with retry (AC-013–AC-016). US-006 [critical] Composer and thread — chronological ordering, auto-growing composer, empty/whitespace guard, auto-scroll (AC-017–AC-020). US-007 [critical] Remembers earlier turns — prior messages sent as context, strict per-conversation isolation, oldest-message trimming when context window exceeded (AC-021–AC-023). US-008 [high] Formatted text/code blocks — sanitised markdown rendering, monospaced code blocks with copy control, HTML/script sanitisation, graceful partial-markdown rendering mid-stream (AC-024–AC-027). US-009 [high] Daily message cap — server-side pre-LLM-call rejection at cap, clear reset-time message, cap enforced even on direct API calls, operator-configurable via config with documented default (AC-028–AC-031).

**Related:** US-005, US-006, US-007, US-008, US-009

- ⚠ Exact daily message cap numeric value is an open assumption not yet decided (per AC-031); requirements defer it to operator configuration at deploy time.

### REQ-EPIC-003 · approved · source: requirements:EPIC-003

Multiple private, saved conversations per account: create, browse newest-first, reopen with full history, rename, delete — chronological list only, indefinite retention.

Assumptions: chronological-only list (no search/folders/tags/pins); indefinite retention until user deletes conversation or account; conversations private with no sharing/export/public links. Stories: US-010 [critical] Start new conversation — empty thread with focused composer, no cross-conversation context, persisted with auto-title only after first message, no orphaned empty conversations left behind (AC-032–AC-034). US-011 [critical] Sidebar browsing — newest-activity-first ordering, re-ordering on new activity, friendly empty state, no search/folder/tag/pin controls (AC-035–AC-038). US-012 [critical] Reopen conversation/history — chronological reload, scroll to latest, highlighted selection, persistence across sessions/browsers, reloaded history used as context for new messages (AC-039–AC-041). US-013 [medium] Rename conversation — inline rename, empty-title rejection, cancel/escape no-op, max-length truncation in sidebar (AC-042–AC-045). US-014 [high] Delete conversation — confirm-to-delete cascading removal, cancel preserves conversation, view switches to next-most-recent or empty state after deleting the open conversation, no auto-purge otherwise (AC-046–AC-049).

**Related:** US-010, US-011, US-012, US-013, US-014

### REQ-EPIC-004 · approved · source: requirements:EPIC-004

Single responsive React web app replacing native mobile apps, English-only interface.

Assumptions: English-only UI, no localisation; native iOS/Android explicitly out of scope, mobile delivered via responsive web. Stories: US-015 [high] Use chat on a phone — no horizontal scroll at ~375px width, sidebar collapses behind a menu, composer/messages stay visible above on-screen keyboard, desktop shows permanent sidebar (AC-050–AC-053). US-016 [low] Consistent English-only interface — all UI/errors/emails in English, no language picker, graceful handling of non-English browser locale (AC-054, AC-055).

**Related:** US-015, US-016

### REQ-EPIC-005 · approved · source: requirements:EPIC-005

Operator-facing configuration, credentials, system prompt, and setup/run documentation needed to stand up and operate the prototype.

Assumptions: OpenAI is the default/required LLM provider (OPENAI_API_KEY required, model/provider swappable); no admin dashboard, analytics, or moderation console — operator uses DB and LLM provider dashboard directly; no payments in this release (future Stripe subscription assumed only); single managed deployment, no horizontal scaling, no SLA, no formal compliance program. Stories: US-017 [critical] Configure hosted LLM provider — env-driven API key and model name, fail-fast startup error if key missing, server-side-only key handling (never exposed client-side/logs), model swap via config+restart with no code change (AC-056–AC-059). US-018 [medium] Configure system prompt — default neutral prompt, operator override via config, prompt not shown/editable in UI (AC-060–AC-062). US-019 [high] Setup/run documentation — README covering prerequisites, install/migrate/run/register/chat walkthrough, full env var list with example env file, deployment section noting single-instance limitations (no horizontal scaling, no SLA, no compliance regime, no admin dashboard/analytics), and explicit no-billing statement with future Stripe assumption (AC-063–AC-066).

**Related:** US-017, US-018, US-019
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v1  
**Delivery scope:** lightweight  
**Approved:** 2026-10-17

**Capabilities in scope:** Ask the assistant a question and get a streamed, token-by-token answer, Chat composer with the running message thread, Memory of earlier turns within the same conversation, Several saved conversations per account, listed newest-first in a sidebar, Start a new conversation, Rename a conversation, Delete a conversation, Saved message history reloaded when a conversation is reopened, Self-registration and sign-in for anyone on the internet, Each account sees only its own conversations, Answers rendered as formatted text with code blocks, Mobile-responsive chat layout, Setup and run instructions for the prototype, OpenAI hosted models generate every answer (needs OPENAI_API_KEY), Email-and-password sign-up, with no email verification or Google sign-in, A neutral, helpful general-assistant prompt the operator can change, Conversations stay private — no sharing, export or public links, Chronological conversation list only — no search, folders or favourites, Chat history kept indefinitely until the user deletes it, English-only interface

**Approved technology stack:**

| Layer | Choice | Rationale |
|---|---|---|
| backend | FastAPI | Your note said a Node back end; this platform builds Python back ends, so I've changed it to FastAPI — the closest equivalent and the only option available. Nothing in your product argues against it: FastAPI streams tokens from OpenAI to the browser natively, and the daily message cap, account sign-up and conversation CRUD are all small, standard endpoints. The official OpenAI Python library is the best-supported path to the model, so this is arguably the shorter route to a working demo. |
| cloud | AWS | You asked for managed cloud hosting and AWS is the option here. For tens of demo users it's one small container for the API, one for the web app and a small managed Postgres — cheap, and with room to grow if the demo lands. It also keeps everything (database, secrets for your OPENAI_API_KEY, logs) in one account rather than stitched across providers. |
| database | PostgreSQL | Exactly what you assumed, and it fits: users, conversations and messages are plain related records, and every query you need is 'this user's conversations' or 'this conversation's messages in order'. Postgres handles that trivially at tens of users, keeps each account's data cleanly separated, and gives you a place to count messages per day for the cap. It is also the one piece that will not need replacing if the prototype turns into a product. |
| frontend | React | — |
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start epics -->
## EPIC-001: Account Access and Private Data Isolation

Public self-service sign-up and sign-in so anyone on the internet can create an account and start chatting, with each account seeing only its own conversations.

Open assumptions carried into this epic:
- Sign-up is email + password with password reset only. Email verification and Google social sign-in are deliberately deferred as prototype-appropriate.
- No transactional email beyond the password reset message; no notifications, digests or marketing email.
- Prototype-grade data handling: no GDPR/HIPAA/SOC2 compliance programme beyond sensible basics (hashed passwords, HTTPS, scoped queries).
- The app is free. No payments, plans or billing exist in this release; if monetised later the assumed model is a monthly Stripe subscription (STRIPE_SECRET_KEY).

### US-001: Self-register with email and password

**Priority:** critical

> As a visitor on the internet, I want to create an account with my email address and a password, so that I can start chatting with the assistant straight away.

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | I am an unauthenticated visitor on the sign-up page | I submit a valid, unused email address and a password that meets the stated minimum length | an account is created, my password is stored only as a salted hash, I am signed in automatically and taken to an empty chat screen without any email verification step |
| AC-002 | I am on the sign-up page | I submit an email address that already has an account, a malformed email, or a password below the stated minimum length | no account is created and the form shows an inline English error message explaining which field is at fault, with my email retained in the form |

### US-002: Sign in and sign out

**Priority:** critical

> As a registered user, I want to sign in with my email and password and sign out when I am done, so that I can get back to my saved conversations and leave the account secure on a shared device.

| ID | Given | When | Then |
|---|---|---|---|
| AC-003 | I have a registered account | I submit my correct email and password on the sign-in page | an authenticated session is established and I land on the chat screen with my conversation sidebar populated |
| AC-004 | I am on the sign-in page | I submit an email or password that does not match an account | I remain signed out and see a single generic message such as "Email or password is incorrect" that does not reveal whether the email exists |
| AC-005 | I am signed in | I choose Sign out | my session is invalidated and any subsequent attempt to open the chat screen redirects me to the sign-in page |

### US-003: Reset a forgotten password

**Priority:** high

> As a registered user who has forgotten my password, I want to request a reset link by email and set a new password, so that I can recover access to my account without contacting anyone.

| ID | Given | When | Then |
|---|---|---|---|
| AC-006 | I am on the sign-in page and cannot remember my password | I enter my email address on the "Forgot password" form and submit | the page confirms that a reset link has been sent if the account exists, and an email containing a single-use, time-limited reset link is sent to a registered address only |
| AC-007 | I have received a valid, unexpired reset link | I open it and submit a new password that meets the minimum length | my password is updated, the reset link can no longer be reused, and I can sign in with the new password |
| AC-008 | I have a reset link that has already been used or has expired | I open it | I see an English message saying the link is no longer valid and an option to request a new one, and no password is changed |

### US-004: See only my own conversations

**Priority:** critical

> As a signed-in user, I want my conversations and messages to be visible only to me, so that my private exchanges with the assistant are not exposed to other users of the public app.

| ID | Given | When | Then |
|---|---|---|---|
| AC-009 | two separate accounts each have their own conversations | one account loads the conversation list or opens the chat screen | only conversations owned by that account are returned, and none belonging to the other account appear |
| AC-010 | I am signed in as user A | I call any conversation or message endpoint using the identifier of a conversation owned by user B, whether to read, rename, delete or post to it | the server rejects the request with a not-found or forbidden response and makes no change to user B's data |
| AC-011 | I am not signed in | I request any chat, conversation or message screen or endpoint directly by URL | I am refused access and redirected to the sign-in page, with no conversation content returned |
| AC-012 | the first release has no sharing, export or public conversation links | I view any conversation | no share, publish, public-link or export control is present anywhere in the interface |

## EPIC-002: AI Chat with Streamed Answers

The core of the product: a user types a message and receives a general-purpose AI answer streamed back token-by-token, with the assistant aware of earlier turns in the same conversation.

Open assumptions carried into this epic:
- Answers come from a hosted LLM API, OpenAI by default; the deployment needs an OPENAI_API_KEY. Model choice and provider are swappable.
- The assistant uses a neutral, helpful general-assistant system prompt; no custom persona was specified.
- Memory exists within a single conversation only, by sending prior messages as context. There is no long-term or cross-conversation memory.
- A server-side daily message cap per account limits LLM cost abuse; the exact limit is not yet set and is configurable by the operator.
- Responses render as formatted text (markdown, including code blocks). No interactive widgets and no tool or function calling by the assistant.

### US-005: Ask a question and receive a streamed answer

**Priority:** critical

> As a signed-in user, I want to type a message and watch the assistant's answer appear token-by-token, so that I get a general-purpose answer quickly and can see it is being written rather than waiting on a blank screen.

| ID | Given | When | Then |
|---|---|---|---|
| AC-013 | I am signed in with a conversation open and the composer focused | I type a question and press Send (or Enter) | my message appears immediately in the thread, the composer clears, and the assistant's reply begins rendering incrementally in the thread as tokens arrive from the hosted LLM API rather than appearing only when complete |
| AC-014 | an answer is streaming into the thread | the stream completes | the full assistant message is persisted against the conversation in the database and the composer is re-enabled for the next message |
| AC-015 | the assistant is still streaming a reply | I attempt to send another message | sending is prevented or queued until the current reply finishes, so two replies cannot interleave in the same thread |
| AC-016 | the hosted LLM API returns an error, times out, or the stream breaks part-way | the failure occurs | the thread shows a plain English error message in place of (or appended to) the partial reply, my own message remains saved, and I can retry without losing the conversation |

### US-006: Chat composer and running message thread

**Priority:** critical

> As a signed-in user, I want a message composer below a scrolling thread of my messages and the assistant's replies, so that I can follow the exchange and keep typing without losing my place.

| ID | Given | When | Then |
|---|---|---|---|
| AC-017 | a conversation with several previous turns is open | the chat screen renders | messages are shown in chronological order, oldest at the top, with user and assistant messages visually distinguished, and the view is scrolled to the newest message |
| AC-018 | I am typing in the composer | my text exceeds one line | the composer grows to show the text up to a maximum height and then scrolls internally, and Send stays reachable |
| AC-019 | the composer is empty or contains only whitespace | I press Send or Enter | nothing is sent and no empty message is added to the thread |
| AC-020 | a reply is streaming and I have not scrolled away | new tokens are appended | the thread auto-scrolls to keep the latest content in view |

### US-007: Assistant remembers earlier turns in the same conversation

**Priority:** critical

> As a signed-in user, I want the assistant to take my earlier messages in this conversation into account, so that follow-up questions like "make that shorter" work without me repeating myself.

| ID | Given | When | Then |
|---|---|---|---|
| AC-021 | I have already exchanged several turns in the open conversation | I send a follow-up that refers back to an earlier turn without restating it | the request to the LLM includes the prior messages of that conversation as context and the reply correctly resolves the reference |
| AC-022 | I have conversation A with earlier context and I open a different conversation B | I ask in B about something only mentioned in A | no messages from A are sent as context and the assistant has no knowledge of A's content, confirming memory does not cross conversations |
| AC-023 | a conversation has grown longer than the model's context window allows | I send another message | the server trims the oldest prior messages to fit the configured context limit, still sends the system prompt and the most recent turns, and the request succeeds rather than failing |

### US-008: Answers rendered as formatted text with code blocks

**Priority:** high

> As a signed-in user, I want assistant replies rendered as formatted text including code blocks, so that lists, headings and code are readable rather than appearing as raw markup.

| ID | Given | When | Then |
|---|---|---|---|
| AC-024 | the assistant returns markdown containing headings, bold text, ordered and unordered lists and links | the message renders in the thread | it displays as formatted text rather than raw markdown characters |
| AC-025 | the assistant returns a fenced code block | the message renders | the code appears in a monospaced block with preserved whitespace and a copy-to-clipboard control, and surrounding prose renders as normal text |
| AC-026 | an assistant reply contains HTML or script-like content | it is rendered | the content is sanitised and displayed as inert text so no injected markup or script executes in the browser |
| AC-027 | markdown is still arriving mid-stream and may be syntactically incomplete | partial content renders | the partial text displays without crashing the view and resolves to correct formatting once the stream completes |

### US-009: Daily message cap per account

**Priority:** high

> As a operator of the prototype, I want each account limited to a configurable number of messages per day, enforced on the server, so that open public sign-up cannot turn the prototype into an unbounded LLM cost liability.

| ID | Given | When | Then |
|---|---|---|---|
| AC-028 | a daily message cap is configured and my account has not reached it today | I send a message | the message is accepted, the assistant replies, and my counted usage for the current day increases by one |
| AC-029 | my account has reached the configured daily cap | I send another message | the server rejects the request before any call to the LLM API is made, and the chat screen shows a clear English message saying the daily limit has been reached and when it resets |
| AC-030 | the cap is enforced server-side | a request is sent directly to the message endpoint bypassing the web interface | the same limit applies and the over-limit request is still rejected |
| AC-031 | the exact daily limit has not yet been decided (open assumption) | the operator sets the limit via configuration at deployment time | the new value takes effect without a code change, and the deployed default is documented in the setup instructions |

## EPIC-003: Saved Conversations

Several saved conversations per account, listed newest-first in a sidebar, so a user can start a new one, return to an old one with its full history, rename it, or delete it.

Open assumptions carried into this epic:
- The list is chronological only. No search, folders, tagging or pinned/favourite conversations in this release.
- Chat history is retained indefinitely until the user deletes the conversation or their account; there is no automatic retention cut-off.
- Conversations are private to the owning user; no sharing, export or public links.

### US-010: Start a new conversation

**Priority:** critical

> As a signed-in user, I want to start a fresh conversation at any time, so that I can change subject without polluting the context of an existing thread.

| ID | Given | When | Then |
|---|---|---|---|
| AC-032 | I am signed in with one or more existing conversations | I click "New chat" | an empty thread opens with the composer focused and no prior messages from any other conversation are shown or sent as context |
| AC-033 | I have opened a new empty conversation | I send my first message | the conversation is persisted against my account, appears at the top of the sidebar, and is given an automatic title derived from that first message |
| AC-034 | I opened a new chat but never sent a message | I navigate away or sign out | no empty conversation is left in my sidebar |

### US-011: Browse my conversations newest-first in a sidebar

**Priority:** critical

> As a signed-in user, I want my saved conversations listed in a sidebar, most recently active first, so that I can find and resume whichever thread I was last working on.

| ID | Given | When | Then |
|---|---|---|---|
| AC-035 | I have several saved conversations with different last-activity times | the chat screen loads | the sidebar lists only my conversations, ordered by most recent activity first, each showing its title |
| AC-036 | I send or receive a message in an older conversation | the exchange completes | that conversation moves to the top of the sidebar list |
| AC-037 | I have no conversations yet | the chat screen loads | the sidebar shows a friendly empty state inviting me to start a new chat rather than an error or blank panel |
| AC-038 | this release provides a chronological list only (open assumption) | I inspect the sidebar | there is no search box, folder tree, tag control or pin/favourite action |

### US-012: Reopen a conversation and see its saved history

**Priority:** critical

> As a signed-in user, I want my full message history to reload when I reopen a conversation, so that I can pick up exactly where I left off, including after signing out and back in.

| ID | Given | When | Then |
|---|---|---|---|
| AC-039 | a conversation containing previous user and assistant messages | I select it in the sidebar | its messages load from storage in chronological order, the view scrolls to the latest message, and the selected conversation is highlighted in the sidebar |
| AC-040 | I signed out and signed back in on a different browser session | I open the same conversation | the identical message history is shown, confirming history is persisted server-side and not held only in the browser |
| AC-041 | I continue an older conversation after reopening it | I send a new message | the reloaded prior messages are included as context so the assistant's reply follows on from the earlier turns |

### US-013: Rename a conversation

**Priority:** medium

> As a signed-in user, I want to give a conversation my own title, so that I can recognise it later in the sidebar instead of relying on the auto-generated title.

| ID | Given | When | Then |
|---|---|---|---|
| AC-042 | a conversation I own is listed in the sidebar | I choose Rename, enter a new non-empty title and confirm | the new title is saved and shown immediately in the sidebar and in the conversation header |
| AC-043 | I am renaming a conversation | I submit an empty or whitespace-only title | the change is rejected with an inline message and the previous title is kept |
| AC-044 | I am renaming a conversation | I press Escape or choose Cancel | the title is unchanged |
| AC-045 | I enter a title longer than the allowed maximum length | it is saved and displayed in the sidebar | the stored value is limited to the maximum length and the sidebar truncates it visually without breaking the layout |

### US-014: Delete a conversation

**Priority:** high

> As a signed-in user, I want to delete a conversation I no longer want, so that I can clear out old or unwanted threads from my private history.

| ID | Given | When | Then |
|---|---|---|---|
| AC-046 | a conversation I own is listed in the sidebar | I choose Delete and confirm the warning that this cannot be undone | the conversation and all of its messages are removed from my account and it disappears from the sidebar |
| AC-047 | I am shown the delete confirmation | I cancel | nothing is deleted and the conversation remains in the sidebar |
| AC-048 | I delete the conversation that is currently open | the deletion completes | the view switches to the next most recent conversation, or to an empty new-chat state if none remain |
| AC-049 | history is otherwise retained indefinitely with no automatic cut-off (open assumption) | time passes without me deleting anything | my conversations remain available and are never auto-purged |

## EPIC-004: Responsive Web Experience

A single responsive React/Next.js web app that works on phone and desktop, in English only, delivered instead of native mobile apps.

Open assumptions carried into this epic:
- English-language UI only; no localisation or translation.
- Native iOS/Android apps are explicitly out of scope; mobile support is delivered through responsive web layout.

### US-015: Use the chat on a phone

**Priority:** high

> As a user on a mobile browser, I want the chat layout to adapt to a small screen, so that I can hold a usable conversation without a desktop.

| ID | Given | When | Then |
|---|---|---|---|
| AC-050 | I open the app on a viewport around 375px wide | the chat screen renders | the thread and composer fill the width with no horizontal scrolling, and the conversation sidebar is collapsed behind a menu control |
| AC-051 | the sidebar is collapsed on a small screen | I open the menu and select a conversation | the sidebar closes and the selected conversation's thread is displayed |
| AC-052 | I am on a phone with the on-screen keyboard open | I type and send a message | the composer and the latest messages remain visible above the keyboard |
| AC-053 | I open the same account on a desktop viewport | the chat screen renders | the sidebar is shown permanently alongside the thread and the same conversations and history are available |

### US-016: Consistent English-only interface

**Priority:** low

> As a user, I want all interface text, errors and emails in clear English, so that the prototype is coherent to demo without translation work.

| ID | Given | When | Then |
|---|---|---|---|
| AC-054 | the first release ships English only (open assumption) | I use any screen, validation message, empty state, error message or the password-reset email | the text is in English and no language picker or localisation control is offered |
| AC-055 | my browser is configured with a non-English preferred language | I load the app | the English interface is shown without error rather than falling back to untranslated placeholders |

## EPIC-005: Prototype Setup and Operation

What the operator needs to stand the prototype up and run it: configuration, credentials, the system prompt, and setup/run instructions.

Open assumptions carried into this epic:
- OpenAI is the default hosted LLM provider and an OPENAI_API_KEY is required; model and provider are swappable via configuration.
- No admin dashboard, usage analytics or content-moderation console in this release; the operator manages via the database and the LLM provider's dashboard.
- No payments at all in this release. If monetised later, the assumed model is a monthly Stripe subscription requiring STRIPE_SECRET_KEY; no Stripe integration is built now.
- Prototype-grade operations: a single managed deployment on managed cloud hosting with PostgreSQL, no horizontal scaling, no SLA, and no GDPR/HIPAA/SOC2 compliance work beyond sensible basic data handling.

### US-017: Configure the hosted LLM provider

**Priority:** critical

> As a operator deploying the prototype, I want to supply the LLM API credential and model name as configuration, so that the assistant can generate answers and I can swap model or provider without changing code.

| ID | Given | When | Then |
|---|---|---|---|
| AC-056 | OPENAI_API_KEY is set in the environment along with a model name | the server starts and a user sends a message | the answer is generated by the configured OpenAI model and streamed back to the browser |
| AC-057 | OPENAI_API_KEY is missing or empty | the server starts | startup fails fast with a clearly identified fatal configuration error naming the missing variable, rather than failing silently when the first user sends a message |
| AC-058 | the LLM credential is secret | the app runs | the key is read server-side only and never exposed in the browser bundle, client responses or logs |
| AC-059 | the model name is configurable (open assumption: provider and model are swappable) | the operator changes the configured model and restarts | subsequent answers are generated by the new model with no code change |

### US-018: Configure the assistant's system prompt

**Priority:** medium

> As a operator, I want the assistant's system prompt to default to a neutral, helpful general assistant and be changeable by configuration, so that the demo has sensible behaviour out of the box and I can adjust its tone without redeploying code.

| ID | Given | When | Then |
|---|---|---|---|
| AC-060 | no custom prompt has been configured (open assumption: none was specified) | a user sends a message | the request includes a default neutral, helpful general-assistant system prompt |
| AC-061 | the operator sets a custom system prompt in configuration | the server restarts and a user sends a message | the custom prompt is used in place of the default for all conversations |
| AC-062 | the system prompt is operator-controlled | a user inspects the chat screen | the prompt text is not displayed in the interface and is not editable by end users |

### US-019: Set up and run the prototype from written instructions

**Priority:** high

> As a developer or operator picking the project up, I want a README with prerequisites, configuration and run steps, so that I can get the prototype running locally and deployed for a demo without asking the original author.

| ID | Given | When | Then |
|---|---|---|---|
| AC-063 | a clean machine with the documented prerequisites installed | I follow the README setup steps in order | I can install dependencies, create and migrate the PostgreSQL schema for users, conversations and messages, start the app, register an account and receive a streamed answer |
| AC-064 | the app needs configuration | I read the README | every required environment variable is listed with its purpose and an example, including OPENAI_API_KEY, the model name, the database connection string, the session/auth secret and the daily message cap, with a matching example env file in the repository |
| AC-065 | the prototype is deployed to managed cloud hosting as a single instance | I read the README deployment section | it states the deploy steps and explicitly records the prototype limitations: no horizontal scaling, no SLA, no compliance regime beyond basic data handling, and no admin dashboard or analytics (the operator uses the database and the LLM provider dashboard) |
| AC-066 | the app is free with no payments in this release (open assumption) | I read the README | it states that no billing is implemented and notes that monetisation, if added later, is assumed to be a monthly Stripe subscription needing STRIPE_SECRET_KEY |
<!-- sdlc:auto:end epics -->

<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-10-17

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Vue
- Svelte

## Decision Outcome

Chosen option: React 19, because Approved stack. Renders the responsive sidebar-plus-thread layout and consumes the SSE stream to append tokens into the thread as they arrive.

## Consequences

A pure React SPA needs explicit routing and auth-guarded views; acceptable for a lightweight single-screen chat app.
<!-- sdlc:auto:end adr -->
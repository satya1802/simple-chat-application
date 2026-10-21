<!-- sdlc:auto:start adr -->
# ADR-0002: Use FastAPI 0.115 for Backend

Status: Accepted  
Date: 2026-10-17

## Context and Problem Statement

Which Backend technology does the project use? Decided in architecture v1.

## Considered Options

- FastAPI 0.115
- Django
- Flask

## Decision Outcome

Chosen option: FastAPI 0.115, because Approved stack. Streams OpenAI tokens to the browser natively via StreamingResponse, and the auth, CRUD and cap endpoints are small standard routes.

## Consequences

Async streaming requires care around DB session lifetimes during long-lived responses; handled by committing persisted messages after the stream closes.
<!-- sdlc:auto:end adr -->
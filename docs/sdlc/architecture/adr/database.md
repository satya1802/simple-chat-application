<!-- sdlc:auto:start adr -->
# ADR-0003: Use PostgreSQL 16 for Database

Status: Accepted  
Date: 2026-10-17

## Context and Problem Statement

Which Database technology does the project use? Decided in architecture v1.

## Considered Options

- PostgreSQL 16
- MySQL
- SQLite

## Decision Outcome

Chosen option: PostgreSQL 16, because Approved stack. Users, conversations and messages are plain related records; every query is 'this user's conversations' or 'this conversation's messages in order'.

## Consequences

Relational modelling is ideal here; no document/graph needs, so no downside at this scale.
<!-- sdlc:auto:end adr -->
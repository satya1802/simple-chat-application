<!-- sdlc:auto:start adr -->
# ADR-0004: Use AWS for Cloud

Status: Accepted  
Date: 2026-10-17

## Context and Problem Statement

Which Cloud technology does the project use? Decided in architecture v1.

## Considered Options

- AWS
- GCP
- Azure

## Decision Outcome

Chosen option: AWS, because Approved stack. One small container each for API, web and Redis plus managed RDS Postgres keeps data, secrets and logs in a single account for a tens-of-users demo.

## Consequences

Managed single-instance setup means no autoscaling or SLA, which matches the stated prototype scope.
<!-- sdlc:auto:end adr -->
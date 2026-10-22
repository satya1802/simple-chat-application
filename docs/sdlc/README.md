# Simple chat application — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
build simple chat application

**Documentation version:** v7
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v2 approved |
| [Architecture](architecture/README.md) | 7 entries |
| [Development](development/README.md) | 7 entries |
| [Testing](testing/README.md) | 1 entry |
| [Deployment](deployment/README.md) | 1 entry |
| [Maintenance](maintenance/README.md) | 1 entry |
| [Data model](architecture/data-model.md) | generated |
| [API (OpenAPI)](architecture/api/openapi.yaml) | generated |
| [Decisions (ADRs)](architecture/adr/README.md) | 4 decisions |
| [Sprint plan](development/sprint-plan.md) | 4 sprints |
| [Developer guide](development/developer-guide.md) | generated |
| [API reference](development/api-reference.md) | 12 routes |
| [Test report](testing/test-report.md) | not run yet |
| [Deployment guide](deployment/deployment-guide.md) | not deployed yet |
| [Runbook](deployment/runbook.md) | not deployed yet |
| [Release notes](deployment/release-notes.md) | 0 releases |
| [Traceability matrix](traceability-matrix.md) | 20 requirements |
| [Changelog](CHANGELOG.md) | 7 versions |
<!-- sdlc:auto:end contents -->

## Open gaps

<!-- sdlc:auto:start open-gaps -->
### Requirements

- Password minimum length is referenced in multiple ACs (AC-001, AC-002, AC-007) as 'the stated minimum length' but the actual numeric value is not given in this input.
- Minimum password length value not specified in input.
- Reset link expiry duration and password minimum length values not specified.
- Exact daily message cap value not yet decided (explicitly an open assumption per AC-031). System prompt default text content not specified beyond 'neutral, helpful general-assistant'. Model context-window trim size/strategy details not specified beyond 'configured context limit'.
- Exact context-window size / trim threshold not specified.
- Exact numeric daily message cap default not yet decided -- explicitly deferred to operator configuration at deployment (AC-031).
- Maximum title length value not specified in input.
- Exact default system prompt wording is not specified, only described as 'neutral, helpful general-assistant.'
- README itself has not been produced yet in this phase's input -- these are requirements for its content, not confirmation the document exists.

### Development

- Plan does not explicitly state which stories/tasks are assigned to which sprint -- only sprint goal text implies likely coverage; a formal item-to-sprint mapping was not provided.
- No explicit sprint-item assignment given; related_ids are inferred from goal text, not confirmed by the input.
- Conflict: run status is reported as 'completed' but delivery evidence exists for only 1 of 20 planned stories -- this discrepancy should be confirmed with the development/orchestration agent rather than assumed.
- No commit, status, or test information was provided for US-001 through US-019 or their sub-tasks; these should be treated as undocumented/unknown until further input is supplied.
- Unclear whether 'completed' refers to only the subset of work actually run in this cycle (e.g. just US-020) or to the full backlog -- input does not clarify scope of the run.
- No test or review evidence accompanies this delivery record beyond the commit reference -- QA/verification status for this specific change was not provided.

### Testing

- No testing input of any kind was provided; this entire phase is undocumented pending QA execution and reporting.

### Deployment

- No deployment record exists; cannot confirm the approved AWS topology has been provisioned or that the application has been deployed anywhere.

### Maintenance

- No maintenance input of any kind was provided; this phase cannot be documented until the application is deployed and operated.
<!-- sdlc:auto:end open-gaps -->

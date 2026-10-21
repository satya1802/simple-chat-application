# Simple chat application — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
build simple chat application

**Documentation version:** v5
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v1 approved |
| [Architecture](architecture/README.md) | 7 entries |
| [Development](development/README.md) | 21 entries |
| [Testing](testing/README.md) | 1 entry |
| [Deployment](deployment/README.md) | 1 entry |
| [Maintenance](maintenance/README.md) | 1 entry |
| [Data model](architecture/data-model.md) | generated |
| [API (OpenAPI)](architecture/api/openapi.yaml) | generated |
| [Decisions (ADRs)](architecture/adr/README.md) | 4 decisions |
| [Sprint plan](development/sprint-plan.md) | 4 sprints |
| [Developer guide](development/developer-guide.md) | generated |
| [API reference](development/api-reference.md) | 1 route |
| [Test report](testing/test-report.md) | not run yet |
| [Deployment guide](deployment/deployment-guide.md) | not deployed yet |
| [Runbook](deployment/runbook.md) | not deployed yet |
| [Release notes](deployment/release-notes.md) | 0 releases |
| [Traceability matrix](traceability-matrix.md) | 19 requirements |
| [Changelog](CHANGELOG.md) | 5 versions |
<!-- sdlc:auto:end contents -->

## Open gaps

<!-- sdlc:auto:start open-gaps -->
### Requirements

- Exact daily message cap numeric value is an open assumption not yet decided (per AC-031); requirements defer it to operator configuration at deploy time.

### Development

- Input does not provide an explicit field mapping individual stories to a specific sprint number -- only sprint goals (free text) and a flat item list are given, so story-to-sprint assignment cannot be stated with certainty.
- Discrepancy: the run status says 'completed' but 14 of 19 planned stories have no recorded ticket/delivery status -- unclear whether they were descoped, still in progress, or simply omitted from this report.
- Input confirms the parent ticket was delivered but does not break out completion status per individual task (T1-T5).
- No development ticket or delivery status reported for US-003, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-004, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-005, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-006, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-007, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-008, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-009, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- Input confirms the parent ticket was delivered but does not break out completion status per individual task (T1-T4).
- No development ticket or delivery status reported for US-011, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-012, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-013, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-014, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-015, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- No development ticket or delivery status reported for US-016, though it is in the approved plan; conflicts with the overall run status of 'completed'.
- Input confirms the parent ticket was delivered but does not break out completion status per individual task (T1-T3).
- No development ticket or delivery status reported for US-019, though it is in the approved plan; conflicts with the overall run status of 'completed'. This story also covers the operator setup README, which is relevant to downstream deployment documentation.

### Testing

- No testing input of any kind was provided; this entire phase is undocumented pending QA execution and reporting.

### Deployment

- No deployment record exists; cannot confirm the approved AWS topology has been provisioned or that the application has been deployed anywhere.

### Maintenance

- No maintenance input of any kind was provided; this phase cannot be documented until the application is deployed and operated.
<!-- sdlc:auto:end open-gaps -->

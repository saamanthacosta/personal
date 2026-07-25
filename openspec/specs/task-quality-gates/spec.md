---
tags:
  - capability/task-quality-gates
---

# task-quality-gates Specification

## Purpose
TBD - created by archiving change create-task-workflow. Update Purpose after archive.
## Requirements
### Requirement: OpenSpec and security gates run in order
The workflow SHALL apply the OpenSpec explore, proposal, and apply phases and SHALL invoke the CVE methodology at explore, proposal, apply, staged-commit, and pre-PR checkpoints.

#### Scenario: Explore records security context
- **WHEN** a new task enters exploration
- **THEN** the workflow prompts for data touched, trust boundaries, third-party trust, persistence, and privilege-escalation surface

#### Scenario: Proposal lacks security considerations
- **WHEN** the proposal or design is missing the required security section
- **THEN** the proposal gate reports a blocking finding and prevents application until corrected or explicitly handled by the methodology

#### Scenario: Apply has a blocking finding
- **WHEN** the full audit reports a CRITICAL or unoverridden HIGH finding
- **THEN** the workflow does not mark the affected task complete and pauses for remediation or an allowed override

### Requirement: Repository verification is detected rather than guessed
Before delivery, the workflow SHALL inspect project documentation and manifests for applicable lint, typecheck, test, build, and security commands, run the applicable checks, and report unavailable checks explicitly.

#### Scenario: Project scripts are available
- **WHEN** a target repository declares lint, typecheck, test, or build scripts
- **THEN** the workflow runs the applicable scripts and records their results before commit approval

#### Scenario: A required check fails
- **WHEN** a verification or security command exits non-zero
- **THEN** the workflow pauses without committing, pushing, or opening a PR and reports the failure and next decision

#### Scenario: No project test command exists
- **WHEN** the repository has no documented or declared test command
- **THEN** the workflow reports the check as unavailable and asks whether to continue, rather than inventing a command

## History

- [[../../changes/archive/2026-07-24-create-task-workflow/proposal|create-task-workflow (2026-07-24)]] — Implementation work currently depends on manually remembering several separate OpenSpec, Git, security, and PR steps.



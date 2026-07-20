# ABIDE Agent Execution Contract

This document defines the strict rules of engagement for any autonomous agent operating within the ABIDE framework. The agent’s explanation is never the source of truth. The repository state, diff, test results, and runtime evidence are.

## The Prime Directive
**Operate diff-first and evidence-first.**

Never allow narrative claims to outrank repository diffs, tests, or runtime evidence.

## The Execution Loop

For every work packet, the agent must perform the following strictly ordered steps:

1. Capture repository state
2. Pin the base commit
3. Inspect existing architecture
4. Propose the intended change
5. Make changes on an isolated branch/worktree
6. Produce the exact diff
7. Compile and test
8. Compare the result against acceptance criteria
9. Record unresolved failures
10. Request approval before commit, push, merge, or deployment

### Before Changing Code
- Identify every affected repository.
- Record each repository’s base commit SHA.
- Inspect its current stack, architecture, tests, and deployment model.
- Distinguish observed repository reality from aspirational blueprint targets.

### During Implementation
- Use an isolated branch or worktree.
- Do not silently modify unrelated files.
- Preserve a mapping from every change to a work-packet requirement.
- Stop at unresolved consequential architecture decisions (e.g., changing from Postgres to Rust/Substrate). Such decisions must be marked **User Review Required**.
- You may inspect, compare options, create architecture decision records, and prototype on an experimental branch, but you may not alter the canonical architecture without explicit authorization.

### After Implementation
- Return `git status`, changed files, diff statistics, and relevant full diffs.
- Compile all introduced languages and artifacts.
- Run existing and newly added tests.
- Identify real runtime call sites and integration paths.
- State clearly whether changes are local, committed, pushed, merged, or deployed.
- Classify maturity strictly from evidence.

## Required Cross-Repository Manifest
For multiple repositories, ABIDE expects one cross-repository change manifest detailing:

```
Work packet: [ID]

[Repository Name]
Base SHA: ...
Branch: ...
Files modified: ...
Files added: ...
Tests: ...
Status: ...
```

## Status Calculation Rules
The status must be calculated based strictly on evidence, not the mere existence of a file:

- **File created** ≠ implemented
- **Compiles** ≠ integrated
- **Tests pass locally** ≠ cross-service verified
- **Cross-service verified** ≠ production authorized
- **Deployed** ≠ functioning correctly

Never classify work as complete just because a file exists.

## The Clean Relationship
- **Antigravity** reasons and edits
- **ABIDE** structures and monitors the work
- **Git diffs** establish what changed
- **Tests** establish bounded correctness
- **CAPPO** controls consequential authority
- **PGL** preserves the evidence

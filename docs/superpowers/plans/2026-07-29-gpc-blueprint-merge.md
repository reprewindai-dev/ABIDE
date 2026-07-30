# GPC Blueprint Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the Phase 1 GPC blueprint with the actual repository state, then implement the missing canonical schema, compiler, canvas, and execution contracts without disturbing the working subsystems that already exist.

**Architecture:** This is not a greenfield build. `uacpv3` already has a real GPC UI and server surface, `veklom-byos-backend` already has GPC schema/compiler code, and `cappo-backend` already has policy/execution plumbing. Phase 1 is a blueprint merge: establish one canonical graph/trace contract, align the TypeScript and Python representations, then wire the frontend canvas and the execution boundary to that contract. Anything not already supported by the real repos stays out until the canonical path is stable.

**Tech Stack:** Python 3.11+, FastAPI, Pydantic, TypeScript, React, Zustand, Vite, local test runners, existing repo-specific compiler and execution modules.

## Global Constraints

- No code yet. Plan only until Phase 2 is explicitly opened.
- No paid APIs.
- Bearer token only for protected surfaces.
- No configuration ceremony.
- No deferred builds.
- No feature flags for incomplete features.
- On-premise / Canadian hosting for regulated tenants.
- JSON round-trip with no data loss.
- Port compatibility, cycle detection, tenant policy checks, and deterministic validation are mandatory.
- AST-first code generation replaces string-built compiler output.
- Parallel execution levels and incremental skip logic must be preserved as first-class behavior.
- The canonical trace model must include residency and compliance fields.

---

## Reality Check Before Build

The attached blueprint says the GPC pipeline is “missing.” That is not true in the repos I audited.

- `uacpv3` already exposes GPC endpoints and has a working canvas/store split.
- `veklom-byos-backend` already contains canonical GPC schema and compiler modules.
- `cappo-backend` already contains policy and execution routers.

Phase 1 therefore needs to merge, normalize, and harden what exists rather than inventing a new system from scratch.

## Scope Buckets

### Bucket A: Non-negotiable blueprint-locked items

- Canonical `GPCPipelineGraph` schema with explicit `nodes` and `edges`.
- `GPCNode` with `node_type`, `config`, `input_ports`, and `output_ports`.
- `GPCEdge` with port bindings.
- `PortType` enum containing `PANDAS_DF`, `DUCKDB_REL`, `DOCUMENTS`, `SCALAR`, and `ANY`.
- Schema validation, port compatibility, cycle detection, and tenant policy checks.
- JSON round-trip without data loss.
- Topological sort plus Python AST code generation.
- Parallel execution levels.
- Incremental execution skip logic.
- React canvas with Zustand decoupling.
- Component registry with tenant-scoped shadowing.
- Canadian compliance controls for residency and regulated-tenant routing.

### Bucket B: Valuable if frictionless

- Structured LLM intent-to-graph output.
- Glide Data Grid preview.
- ELKjs/Dagre layout support.
- Module federation for tenant custom nodes.
- Human-in-the-loop checkpoint pauses.

### Bucket C: Explicitly out of scope for Phase 1

- Mock preview surfaces.
- Decorative analytics only.
- Unsupported node types.
- Manual configuration ceremonies.
- “Coming soon” placeholders.
- Any feature that requires rewriting the already-working backend or frontend architecture wholesale.

## Files and Responsibilities

### `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\schemas.py`
Owns the canonical Python graph model, port types, node/edge validation, and trace schema.

### `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\gpc_schemas.py`
Owns compatibility aliases and any transitional schema adapters that preserve current call sites while the canonical model becomes the source of truth.

### `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\compiler.py`
Owns graph validation, topological ordering, AST-first code generation, and execution planning.

### `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\gpc_compiler.py`
Owns the higher-level compiler façade used by callers that should not reach into the lower-level implementation directly.

### `C:\Users\antho\.windsurf\veklom-byos-backend\backend\tests\test_gpc_compiler.py`
Owns backend compiler regression coverage, including graph validation, cycle detection, port compatibility, trace stability, and JSON round-trip behavior.

### `C:\Users\antho\.windsurf\uacpv3\src\types\gpc.ts`
Owns the TypeScript mirror of the canonical graph and trace contracts used by the UI.

### `C:\Users\antho\.windsurf\uacpv3\src\types\gpc_types.ts`
Owns any secondary type exports or compatibility wrappers that keep the current UI code compiling while the canonical model settles.

### `C:\Users\antho\.windsurf\uacpv3\src\stores\gpcStore.ts`
Owns the pipeline graph state, node/edge mutation actions, and compiled pipeline metadata in the canonical UI store.

### `C:\Users\antho\.windsurf\uacpv3\src\stores\gpc_stores.ts`
Owns any legacy store compatibility layer that needs to point at the canonical Zustand store without breaking current imports.

### `C:\Users\antho\.windsurf\uacpv3\src\components\gpc\GpcSurface.tsx`
Owns the main GPC authoring surface, intent input, validation feedback, and execution entry points.

### `C:\Users\antho\.windsurf\uacpv3\src\components\gpc\GpcCanvas.tsx`
Owns graph rendering, node placement, edge editing, and the visual representation of the canonical pipeline.

### `C:\Users\antho\.windsurf\uacpv3\src\hooks\useGpc.ts`
Owns the composition layer between UI state, generated graphs, validation, and execution requests.

### `C:\Users\antho\.windsurf\uacpv3\server.ts`
Owns the current GPC HTTP surface, including generate/compile/execute routes and any AST-first compiler handoff that still lives in the frontend server.

### `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\api\routers\gpc_router.py`
Owns the backend GPC execution boundary, including accept/reject logic for compiled pipelines.

### `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\api\routers\exec_router.py`
Owns execution submission, protection checks, and any explicit runtime gating.

### `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\core\capi_pipeline.py`
Owns the actual compiled pipeline orchestration path that the GPC layer must target.

### `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\services\orchestrator.py`
Owns orchestration of execution policy, approvals, and cross-step state transitions.

### `C:\Users\antho\.windsurf\cappo-backend\tests\test_exec_protection.py`
Owns execution denial regression coverage.

### `C:\Users\antho\.windsurf\cappo-backend\tests\test_eat_lifecycle.py`
Owns approval/authorization lifecycle coverage.

### `C:\Users\antho\.windsurf\cappo-backend\tests\test_payment_precedence.py`
Owns precedence coverage where monetary or access gates can override lower-priority signals.

## Task 1: Canonicalize the graph and trace contract

**Files:**
- Modify `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\schemas.py`
- Modify `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\gpc_schemas.py`
- Modify `C:\Users\antho\.windsurf\uacpv3\src\types\gpc.ts`
- Modify `C:\Users\antho\.windsurf\uacpv3\src\types\gpc_types.ts`

**Interfaces:**
- Consumes: current Python and TypeScript GPC shapes already in each repo.
- Produces: one canonical graph contract, one canonical trace contract, and compatibility wrappers for old imports.

- [ ] Confirm the exact field set for `GPCPipelineGraph`, `GPCNode`, `GPCEdge`, `PortType`, and `PipelineExecutionTrace`.
- [ ] Align the Python and TypeScript shapes so round-tripping a graph preserves all data.
- [ ] Make schema validation fail closed on missing port metadata, invalid node types, and incompatible edge bindings.
- [ ] Preserve any legacy field names only through explicit adapters, not by duplicating the canonical schema.

**Verification:**
- Run the backend compiler tests.
- Run the frontend type check.
- Confirm a serialized graph can be loaded, validated, and serialized again without data loss.

## Task 2: Replace string-built compiler output with AST-first code generation

**Files:**
- Modify `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\compiler.py`
- Modify `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\gpc_compiler.py`
- Modify `C:\Users\antho\.windsurf\veklom-byos-backend\backend\tests\test_gpc_compiler.py`
- Update any GPC caller that still depends on string-built Python emission in `uacpv3\server.ts`

**Interfaces:**
- Consumes: the canonical graph contract from Task 1.
- Produces: AST nodes, deterministic topological ordering, and a compiler surface that returns execution-ready Python without ad hoc string assembly.

- [ ] Verify the current compiler path that builds Python code as strings.
- [ ] Move node translation to AST construction.
- [ ] Preserve topological sort, parallel execution grouping, and incremental skip logic.
- [ ] Add tests for cycle rejection, invalid port bindings, and deterministic output.

**Verification:**
- Run the compiler test file directly.
- Assert identical graphs compile to identical AST-derived output.
- Assert cycles and invalid port bindings fail before execution planning.

## Task 3: Reconcile the frontend canvas, stores, and intent flow

**Files:**
- Modify `C:\Users\antho\.windsurf\uacpv3\src\components\gpc\GpcSurface.tsx`
- Modify `C:\Users\antho\.windsurf\uacpv3\src\components\gpc\GpcCanvas.tsx`
- Modify `C:\Users\antho\.windsurf\uacpv3\src\hooks\useGpc.ts`
- Modify `C:\Users\antho\.windsurf\uacpv3\src\stores\gpcStore.ts`
- Modify `C:\Users\antho\.windsurf\uacpv3\src\stores\gpc_stores.ts`
- Modify `C:\Users\antho\.windsurf\uacpv3\src\types\gpc.ts`

**Interfaces:**
- Consumes: the canonical graph and trace shapes from Task 1.
- Produces: a decoupled Zustand-backed canvas workflow that can author, validate, and submit canonical graphs.

- [ ] Verify the current UI path that is still iframe-driven or placeholder-driven.
- [ ] Keep the state split between canvas, execution, and preview stores explicit.
- [ ] Bind node creation, edge creation, and validation feedback to the canonical graph schema.
- [ ] Ensure the UI can display a compile trace without inventing a second state model.

**Verification:**
- Run the frontend build and type check.
- Open the GPC surface and verify node/edge edits update the canonical store only once.
- Confirm the UI no longer depends on a hidden placeholder surface for the core workflow.

## Task 4: Align execution and policy boundaries in `cappo-backend`

**Files:**
- Modify `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\api\routers\gpc_router.py`
- Modify `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\api\routers\exec_router.py`
- Modify `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\core\capi_pipeline.py`
- Modify `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\services\orchestrator.py`
- Update `C:\Users\antho\.windsurf\cappo-backend\tests\test_exec_protection.py`
- Update `C:\Users\antho\.windsurf\cappo-backend\tests\test_eat_lifecycle.py`
- Update `C:\Users\antho\.windsurf\cappo-backend\tests\test_payment_precedence.py`

**Interfaces:**
- Consumes: compiled graphs and trace metadata.
- Produces: an execution boundary that only accepts validated, policy-approved compiled pipelines.

- [ ] Map the current router entry points to the canonical compiled pipeline contract.
- [ ] Keep approval and execution checks separate.
- [ ] Ensure policy denial happens before execution orchestration starts.
- [ ] Make the tests cover the negative path first: invalid graph, policy denial, and rejected execution.

**Verification:**
- Run the backend execution and protection tests.
- Confirm a denied execution never reaches the pipeline orchestrator.
- Confirm a permitted execution carries the canonical trace fields through the boundary.

## Task 5: Add the residency and compliance trace surface

**Files:**
- Modify `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\schemas.py`
- Modify `C:\Users\antho\.windsurf\veklom-byos-backend\backend\gpc\compiler.py`
- Modify `C:\Users\antho\.windsurf\cappo-backend\cappo_backend\services\orchestrator.py`
- Add or update trace-related tests in both Python repos

**Interfaces:**
- Consumes: execution events, graph metadata, and policy outcomes.
- Produces: a `PipelineExecutionTrace` that records residency region, schema version, prompt version, compliance flags, row counts, token counts, duration, and error details.

- [ ] Confirm the exact trace fields required by the blueprint.
- [ ] Propagate those fields from compile time through runtime completion.
- [ ] Ensure compliance flags are derived from actual policy checks, not hardcoded labels.
- [ ] Verify trace records do not lose region or tenant data during serialization.

**Verification:**
- Add or extend trace round-trip tests.
- Confirm a trace can be exported and reloaded with no field loss.
- Confirm residency and compliance data remains attached to the execution record.

## Task 6: Decide whether `.ampln` / Amphi serialization belongs in Phase 1

**Files:**
- No file creation until the audit proves a real consumer exists.
- If needed later, create a dedicated serialization module in the backend repo only after the canonical graph contract is stable.

**Interfaces:**
- Consumes: the canonical graph model from Task 1.
- Produces: only a justified serialization layer if the repos show a real runtime need.

- [ ] Search for actual call sites that require `.ampln` or Amphi serialization.
- [ ] If no consumer exists, defer the format entirely.
- [ ] If a consumer exists, add the smallest possible adapter around the canonical graph model.

**Verification:**
- Do not ship a format with no runtime consumer.
- Do not let a serialization experiment become a second source of truth.

## Task 7: End-to-end regression and parity verification

**Files:**
- Update the Python backend tests.
- Update the frontend type check and build path.
- Add any missing integration coverage in `cappo-backend` if the current tests do not prove the boundary.

**Interfaces:**
- Consumes: the merged canonical schema, compiler, UI store, and execution boundary.
- Produces: one verified GPC path from authoring to execution with no hidden alternate state model.

- [ ] Prove a graph authored in the UI survives validation and compile.
- [ ] Prove the backend accepts the compiled artifact only when policy allows it.
- [ ] Prove trace data survives execution and serialization.
- [ ] Prove old compatibility imports still compile without being the source of truth.

**Verification:**
- Run the backend test suite relevant to GPC and execution.
- Run the frontend type check and build.
- Capture one manual smoke test of graph authoring, compile, and execution.

## Phase 1 Exit Criteria

- The blueprint’s canonical GPC contract exists in one authoritative shape and is mirrored in TypeScript without drift.
- The compiler uses AST-first generation, not string concatenation.
- The frontend canvas is decoupled from execution state and can author the canonical graph.
- `cappo-backend` accepts only validated, policy-approved compiled pipelines.
- Trace data includes the residency/compliance fields the blueprint requires.
- Any `.ampln` work is explicitly deferred unless a real consumer is found.

## Open Questions to Resolve in Phase 2

- Which existing field names in the repos must remain as adapters versus being renamed outright.
- Whether the frontend server should keep any compile logic or become a pure UI client.
- Whether the canonical graph should remain Python-authored first or move to a shared schema package later.
- Whether the blueprint’s “structured LLM intent-to-graph” lane belongs in the same phase as the deterministic compiler or after it.


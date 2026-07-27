# ProjectLearningV1 — ABIDE-native continuous learning (design)

Status: **Design only.** Nothing in this document is implemented yet. It is the
proposal for an ABIDE-native learning subsystem inspired by the
`continuous-learning-v2` (ECC) engine, adapted to ABIDE's governed,
Ollama-first, cAPI/CAPPO/PGL-connected architecture.

This document deliberately does **not** adopt the generated instincts from ABIDE
PR #2 as authoritative rules. Those are treated as untrusted candidate
observations, subject to the same evidence, review, and expiry gates as any
other learned instinct.

---

## 1. Goals and non-goals

**Goal:** let ABIDE get better at a *specific project* over time by observing
real workbench activity, proposing evidence-backed "instincts", and — only with
explicit approval — promoting durable ones into reusable guidance. Learning is
opt-in, project-scoped, revocable, and never grants execution authority.

**Non-goals:**
- Not a global model-training pipeline. Instincts are structured records, not weights.
- Not an autonomous actor. An instinct can *inform* a proposal; it can never *authorize* or *execute* anything.
- Not a cross-project memory by default. Nothing leaves a project without governed promotion.
- Not a replacement for cAPI/CAPPO/PGL. It *feeds* them; it does not bypass them.

## 2. Why adapt continuous-learning-v2 rather than rebuild

The ECC repo already contains a working loop we should reuse in spirit:
project isolation (`detect-project.sh`), an observation stream
(`observations.jsonl`), a bounded background worker (`observer-loop.sh`), a
lifecycle/resource guard (`session-guardian.sh`), a pattern-extraction policy
(`observer.md`), and a management CLI (`instinct-cli.py`) with
`status/import/export/evolve/promote/prune`, TTLs, SSRF-guarded imports, and
promotion thresholds.

What is Claude-Code-specific and must be replaced at the edges:

| ECC edge (Claude-specific)            | ABIDE-native replacement                                  |
|---------------------------------------|-----------------------------------------------------------|
| Claude PreToolUse/PostToolUse hooks   | ABIDE workbench action-event stream                       |
| `claude --model haiku` observer       | ABIDE-configured **Ollama/BYOK** observer (no cloud default) |
| XDG homunculus filesystem store       | Project-scoped ABIDE store (per workspace id)             |
| Observer writes instinct files directly | Observer emits **proposed** instinct revisions only     |
| Automatic global promotion            | **Governed** promotion request (CAPPO approval + PGL)     |

The core engine (observe → extract → propose → review → promote → prune) is
kept; only the collector, the model, the store, and the authority model change.

## 3. Data model

All records are project-scoped and stored under a per-workspace root
(`workspace-sandbox/<workspaceId>/.learning/`, git-ignored — never committed).

### 3.1 Observation
An append-only, redacted event captured from the workbench.
```jsonc
{
  "observationId": "obs_...",
  "workspaceId": "ws_...",
  "blueprintHash": "sha256:...",     // binds the observation to the project state
  "type": "user_correction | error_resolution | repeated_workflow | tool_preference",
  "summary": "user changed generated port from 3000 to 3009",
  "evidenceRefs": ["run_...", "patch_...", "receipt_..."],
  "createdAt": "ISO-8601",
  "expiresAt": "ISO-8601",           // observations expire even before becoming instincts
  "redacted": true
}
```

### 3.2 Instinct
A candidate rule derived from ≥1 observation, always evidence-backed.
```jsonc
{
  "instinctId": "inst_...",
  "workspaceId": "ws_...",
  "scope": "project",                // never "global" without governed promotion
  "statement": "In this project, generated Node services must bind PORT=3009.",
  "confidence": 0.0,                 // see scoring below
  "state": "proposed | active | contradicted | expired | revoked | promoted",
  "evidence": [{ "observationId": "obs_...", "receiptId": "pgl_..." }],
  "blueprintHash": "sha256:...",     // instinct is only valid while the project shape matches
  "grantsAuthority": false,          // MUST always be false; enforced, not advisory
  "createdAt": "ISO-8601",
  "reviewedAt": "ISO-8601 | null",
  "expiresAt": "ISO-8601"
}
```

## 4. The loop

```text
Workbench action
  → ActionEventCollector (redact secrets, detect project, append observation)
  → ObserverWorker (bounded, opt-in, Ollama/BYOK) extracts candidate instincts
  → InstinctStore writes them as state="proposed"
  → User review surface (accept / edit / reject) — nothing activates silently
  → active instincts inform future agent proposals (as context, not authority)
  → contradiction / expiry / revocation continuously prune
  → optional governed promotion (project → org) via CAPPO + PGL
```

### 4.1 Project-scoped observations
Project identity is resolved the way ECC's `detect-project.sh` does, but keyed to
the **ABIDE workspace id** (and, when connected, the blueprint hash). No global
store is written by default; a global bucket exists only as the target of an
explicitly approved promotion.

### 4.2 Evidence-backed instincts
Every instinct references at least one observation, and every observation
references concrete workbench evidence (a run id, a patch hash, a PGL receipt).
An instinct with no resolvable evidence is invalid and is pruned.

### 4.3 Confidence scoring
`confidence` is computed, not asserted, from: number of independent supporting
observations, recency (decays over time), consistency (penalized by
contradictions), and whether the supporting evidence is itself verified (a PGL
receipt counts more than an unverified note). Confidence below a floor keeps an
instinct in `proposed`; it can only reach `active` through user review, never by
score alone.

### 4.4 User-visible corrections
When a user corrects generated output (edits a proposed patch, changes a value,
rejects an operation), that correction is a first-class observation and is
surfaced back: "I noticed you changed X → Y; make this an instinct for this
project?" Users can view, edit, and delete any instinct at any time.

### 4.5 Contradiction detection
New observations that conflict with an `active` instinct move it to
`contradicted`, lower its confidence, and raise a review prompt. Two instincts
that assert incompatible statements cannot both be `active`; the conflict is
surfaced for resolution rather than silently resolved.

### 4.6 Expiry and revocation
Every observation and instinct has an `expiresAt` (default TTL, configurable).
Expired records are pruned. A user (or a governance action) can revoke any
instinct immediately; revocation is durable and logged.

### 4.7 Secret redaction
The collector runs the same class of secret-pattern scrubbing as ECC's
`observe.sh` *before* anything is persisted. Redaction is fail-closed: if a field
cannot be confidently redacted, the observation is dropped, not stored raw.

### 4.8 Opt-in retention
Learning is **off by default**. A workspace owner explicitly enables it per
project. Disabling it stops collection and (optionally) purges the project's
learning store. Installation alone never begins learning — matching ECC's
"observer disabled by default" stance.

## 5. Authority and governance boundaries

These are hard constraints, enforced in code, not conventions:

- **No learned instinct grants execution authority.** `grantsAuthority` is
  always false; the execution path ignores instincts as an authorization source.
  Instincts are injected only as *advisory context* into agent prompts/proposals.
- **No global promotion without explicit approval.** Promotion from project scope
  to org/global scope is a request, reviewed by a human and authorized by
  **CAPPO** ("ABIDE proposes; CAPPO disposes").
- **Blueprint-hash binding.** An instinct is only applied while the project's
  blueprint hash matches the one it was learned under; a material project change
  invalidates stale instincts instead of silently carrying them forward.
- **CAPPO approval for consequential adoption.** Any adoption that would change
  generated behavior beyond a single workspace routes through CAPPO.
- **PGL evidence for promotion and rejection.** Both promotion and rejection
  decisions are recorded as PGL evidence (receipt id retained on the instinct),
  so the learning history is auditable and non-repudiable.

## 6. Connected vs standalone

- **Standalone ABIDE:** learning store is local; "promotion" is limited to the
  local project→local library, with a local evidence record instead of PGL, and
  no CAPPO (the owner is the sole approver).
- **Veklom-connected ABIDE:** promotion and consequential adoption route through
  cAPI (discovery/authorization) → CAPPO (approval) → PGL (evidence). The
  observer model is still the workspace's configured Ollama/BYOK model; no cloud
  default is introduced.

## 7. Management surface (ABIDE-native, mirrors instinct-cli)

Exposed as governed workbench commands / API, not a raw shell:
`learning status`, `learning list`, `learning show <id>`, `learning accept <id>`,
`learning edit <id>`, `learning reject <id>`, `learning revoke <id>`,
`learning export`, `learning import` (SSRF-guarded, bounded, as in ECC),
`learning promote <id>` (governed), `learning prune`.

## 8. Explicitly out of scope for V1

- Real background daemon tuning (cooldowns, leases, watchdog) — port ECC's
  `session-guardian`/`observer-loop` semantics in a later iteration.
- Automatic evolution of instincts into skills/agents (`evolve`) — V1 stops at
  reviewed, project-scoped instincts.
- Treating PR #2's generated bundle as authoritative — it enters as candidate
  observations only.

## 9. First milestone to prove

1. Enable learning on one workspace (opt-in).
2. Generate code, then user-correct one value (e.g. a port).
3. Collector persists a redacted `user_correction` observation bound to the blueprint hash.
4. Observer proposes one instinct with confidence and evidence refs.
5. User accepts it; it becomes `active` and appears as advisory context on the next agent proposal — without changing any authorization.
6. Change the blueprint materially; confirm the instinct is invalidated (not silently applied).
7. Revoke it; confirm durable removal and a recorded rejection.

Only after that end-to-end path is real should evolution, background scheduling,
and governed cross-project promotion be built.

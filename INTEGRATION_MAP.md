# Apex Control Plane: SEKED Integration Map

This document establishes the precise, unambiguous, file-level structural mapping and data-flow routing between the SEKED compiler mathematical engine and the Apex Control Plane repository structure.

---

## 1. Core Architectural Paradigm

Sovereign operations within the Apex Control Plane are governed by three progressive layers:

```
[ Layer 1: Ingestion & Adapters ] ──(Normalized Signals)──> [ Layer 2: SEKED Compiler ] ──(Deterministic Directive)──> [ Layer 3: Services & Execution ]
```

*   **Layer 1 (Adapters):** Observes raw system-level signals (e.g., node network latency, pricing metrics, test validation passes, on-chain escrow events) and normalizes them into continuous metrics (0 to 9) for five canonical signals: **E, R, C, D, S**.
*   **Layer 2 (The Math Compiler):** A pure, deterministic function representing the published SEKED math standard. It takes the normalized inputs from Layer 1 and evaluates them according to state matrices to produce a strict action directive (No human self-reporting).
*   **Layer 3 (Services):** Routes functional system behavior (e.g., capability routing updates, escrow collateral locks/releases, or automated agent packet triggers) based on the deterministic directive output.

---

## 2. File-Level Repository Mapping

| Workspace Layer | File / Directory Path | Architectural Responsibility |
| :--- | :--- | :--- |
| **Layer 1: Input Ingestion** | `/src/adapters/telemetry.ts` | Listens to raw telemetry (VNP ping latencies, VABP cert status). |
| | `/src/adapters/pricing.ts` | Maps volume, rates, and escrow collateral levels from Gnomledger. |
| | `/src/adapters/system.ts` | Normalizes observed telemetry to 0–9 continuous metric scales (E, R, C, D, S). |
| **Layer 2: Compiler Math** | `/src/compiler/seked.ts` | The pure function implementation of the SEKED math standards. |
| | `/src/types.ts` | Defines the `CanonicalBlueprintV1` model and validation schema types. |
| **Layer 3: Services & Action** | `/src/services/escrow.ts` | Controls X402 escrow settlements, collateral releases, and fees. |
| | `/src/services/router.ts` | Handles dynamic capability routing or triggers emergency kill-switches. |
| | `/src/services/agentPackets.ts` | Generates and cryptographically signs agent packets based on roadmap maturity. |

---

## 3. Dynamic Data-Flow Routing Pipeline

### Step 1: Telemetry Observation & Normalization (Layer 1)
Adapters ingest real network states from standard Veklom services (`BYOS`, `CAPPO`, `Gnomledger`, `VNP`):
$$\text{Observed Latency } L \longrightarrow \text{Normalized Signal } S \in [0, 9]$$
These continuous values populate the target vector representing:
*   **E** (Execution Efficiency / Jitter)
*   **R** (Resource Reputation)
*   **C** (Compliance Drift Score)
*   **D** (Data Residency Integrity)
*   **S** (Settlement Velocity)

### Step 2: The SEKED Evaluation (Layer 2)
The normalized array is passed into the pure compiler:
```typescript
interface SekedInput {
  E: number; // Execution Jitter
  R: number; // Reputation Index
  C: number; // Compliance Score
  D: number; // Data Boundary Profile
  S: number; // Settlement Latency
}

export function compileSekedDirective(input: SekedInput): SekedDirective {
  // Pure mathematical matrix calculation (detatched from LLM generation)
  const score = (input.E * 0.2) + (input.R * 0.2) + (input.C * 0.3) + (input.D * 0.1) + (input.S * 0.2);
  
  if (score < 3.0) return "TERMINATE_AND_FREEZE";
  if (score < 5.0) return "DEGRADE_AND_WARN";
  if (score < 7.5) return "COOPERATIVE_OPTIMIZATION";
  return "SOVEREIGN_EXECUTION";
}
```

### Step 3: Deterministic Service Invocation (Layer 3)
The system receives the directive and executes deterministic actions in `/src/services/`:
*   **`TERMINATE_AND_FREEZE`**:
    *   Triggers active capability kill-switches.
    *   Locks associated X402 Escrow balances.
*   **`COOPERATIVE_OPTIMIZATION`**:
    *   Initiates adaptive routing paths to alternative VNP nodes.
    *   Re-evaluates pricing discount structures based on resource volumes.

---

## 4. Integration Integrity Rules

1.  **Strict Pure-Function Limit:** Under no circumstances should the SEKED mathematical compiler (Layer 2) invoke generative LLM prompts or reference state outside the input vector. It is a mathematical governor.
2.  **No Hand-Reported Truth:** Input metrics in Layer 1 must originate strictly from verified system telemetry or proof tokens. Self-reported metrics are forbidden in production.
3.  **Human Overrides:** Consequential decisions (such as full platform frozen state) must request Explicit Human Authorization via the Diff & Approval View in the Governance panel.

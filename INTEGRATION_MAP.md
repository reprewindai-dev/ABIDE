# Apex Control Plane: Architectural Integration Map
*System Data-Flow & Technical Layout Routing. July 2026.*

---

## 1. Core Architectural Paradigm

Sovereign operations within the Apex Control Plane are governed by three distinct layers:

```
[ Layer 1: Ingestion & Cache ] ──(Pluggable Connectors)──> [ Layer 2: SEKED & Validators ] ──(Deterministic Directives)──> [ Layer 3: Main Server & API Routes ]
```

*   **Layer 1: Ingestion, Cache & Pluggable Connectors**
    *   Ingests raw system-level signals (e.g. node network latency, metrics, signatures) and manages high-performance caching.
    *   Implements pluggable connectors to interface with real production storage, payment networks, and formal solvers.
*   **Layer 2: Pure Compiler & Schema Validators**
    *   Executes the pure mathematical scoring matrix (SEKED v4.02) and validates structured plan signatures against rigid Zod schemas.
*   **Layer 3: Main Server & API endpoints**
    *   Saves validated blueprints, exports telemetry traces, checks local model configurations, and routes functional system actions.

---

## 2. File-Level Repository Mapping

| Workspace Layer | File Path | Architectural Responsibility | Status |
| :--- | :--- | :--- | :--- |
| **Layer 1: Adapters & Connectors** | `/src/core/cache.ts` | High-performance memory and optional Redis cache with automatic fallback. | **FULLY BUILT** |
| | `/src/core/connectors.ts` | Pluggable connectors for real Postgres, X402 payment, and solver APIs. | **FULLY BUILT** |
| **Layer 2: Compiler & Contracts** | `/src/compiler/seked.ts` | Pure Fenton-Wilkinson moment-matching complexity and safety lane triage solver. | **FULLY BUILT** |
| | `/src/core/validation.ts` | Strict schema validation contracts (Zod) for Plan IR, signatures, and capabilities. | **FULLY BUILT** |
| **Layer 3: Endpoints & Routing** | `/server.ts` | Main Express server routing API calls, checking cache, and serving capabilities. | **FULLY BUILT** |
| | `/src/components/TrustLayerHub.tsx` | Front-end control panel for visualizing projection, policies, and attestations. | **FULLY BUILT** |

---

## 3. Dynamic Data-Flow Routing Pipeline

### Step 1: Telemetry Observation & Persistence (Layer 1)
Pluggable adapters in `/src/core/connectors.ts` ingest real network states or save compiled artifacts:
```typescript
// Real-world database saver inside RealWorldDBConnector
async saveBlueprint(id: string, blueprint: any): Promise<void> {
  if (process.env.DATABASE_URL) {
    // Insert Drizzle ORM insertion logic here
  }
}
```

### Step 2: Pure Math Evaluation (Layer 2)
The raw inputs are evaluated by the pure, LLM-independent math compiler in `/src/compiler/seked.ts`:
```typescript
export function compileSekedDirective(input: SekedInput): SekedDirective {
  // Pure Fenton-Wilkinson moments-matching algorithm calculations
  const score = (input.E * 0.2) + (input.R * 0.2) + (input.C * 0.3) + (input.D * 0.1) + (input.S * 0.2);
  if (score < 3.0) return "TERMINATE_AND_FREEZE";
  if (score < 5.0) return "DEGRADE_AND_WARN";
  if (score < 7.5) return "COOPERATIVE_OPTIMIZATION";
  return "SOVEREIGN_EXECUTION";
}
```

### Step 3: API Execution Routing (Layer 3)
The main Express server (`server.ts`) handles incoming requests and maps results to real-world endpoints:
*   `POST /api/realworld/db/save`: Saves active blueprint state to real-world Postgres.
*   `POST /api/realworld/x402/lock`: Locks collateral USD dynamically on live payment ledgers.
*   `POST /api/realworld/verify/z3`: Computes static invariants via Z3 constraint solvers.
*   `POST /api/realworld/verify/tla`: Model checks PlusCal states.

---

## 4. Integration Integrity Rules

1.  **Strict Pure-Function Limit:** Under no circumstances should the SEKED mathematical compiler (Layer 2) invoke generative LLM prompts or reference state outside its input arguments. It is a mathematical governor.
2.  **Explicit Connector Gateways:** All database write operations, payment settlements, and trace exports MUST flow through the singleton connector adapters (`dbConnector`, `x402Connector`, `otelExporter`) defined in `src/core/connectors.ts`. This makes the application extremely easy to maintain and scale.
3.  **Human Overrides:** Consequential decisions (such as full platform frozen state) must request Explicit Human Authorization via the Diff & Approval View in the Governance panel.

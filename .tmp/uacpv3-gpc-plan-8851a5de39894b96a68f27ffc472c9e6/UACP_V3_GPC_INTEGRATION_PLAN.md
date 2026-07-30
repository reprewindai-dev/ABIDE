# UACP V3 GPC INTEGRATION PLAN
## Complete Phase 2B inside existing UACP V3 canvas

**Status:** UACP V3 has the shell. Building the complete system inside it.

---

## CURRENT STATE

### What exists in UACP V3:
✅ `/src/components/gpc/GpcCanvas.tsx` — ReactFlow canvas (memoized, optimized)  
✅ `/src/components/gpc/GpcSurface.tsx` — Main GPC page  
✅ `/src/types/gpc_types.ts` — Complete TypeScript schema mirrors  
✅ `/src/stores/gpc_stores.ts` — Zustand store architecture (3 decoupled stores)  
✅ `src/App.tsx` — GPC tab integrated and wired  
✅ UI buttons: "Generate from Intent", "Compile", "Execute" placeholders  

### What's MISSING (to be built in Phase 2B):
🔲 `useGpc` hook — API integration  
🔲 Backend API endpoints (compile, generate, execute, test, deploy)  
🔲 Poltergeist watcher service  
🔲 Capability build queue + deduplicating builder  
🔲 Sequential verification hooks  
🔲 Test mode + preview modal  
🔲 Deploy to GitHub Actions modal  
🔲 Freshness gate integration  
🔲 PGL registration flow  
🔲 Interlink-CAPI validation

---

## ARCHITECTURE: UACP V3 + VEKLOM BACKEND

```
UACP V3 Frontend (React/TypeScript)
    │
    ├── GpcSurface.tsx (main page)
    ├── GpcCanvas.tsx (ReactFlow)
    ├── GpcTestDeployUI.tsx (NEW)
    ├── gpc_stores.ts (3 stores)
    ├── useGpc.ts hook (connects to backend)
    │
    └── GraphQL subscription (live Poltergeist status)
            │
            ↓
    
veklom-byos-backend (Python/FastAPI) — The Heavy Lifting
    │
    ├── Poltergeist Watcher Service
    │   └── Watches GPC graph changes → emits capability requirements
    │
    ├── Haunt Cache Plane (L0-L4)
    │   ├── L0: Hot cache (agent RAM)
    │   ├── L1: Warm cache (Redis/Valkey)
    │   ├── L2: Build cache (NVMe)
    │   ├── L3: Inference cache (vLLM)
    │   └── L4: Cold storage (Hetzner Object Storage)
    │
    ├── GPC Compiler
    │   └── AST-based Python generation
    │
    ├── Capability Manufacturing
    │   ├── Watcher (requirement stream)
    │   ├── Debouncer (settle requirements)
    │   ├── Priority queue (Redis)
    │   ├── Agent builders (create connectors, transforms, etc.)
    │   ├── Verification hooks (tests, RepoGate, PGL, adversarial)
    │   └── Freshness gate (pre-bind validation)
    │
    ├── Execution Sandbox
    │   └── Isolated subprocess per capability execution
    │
    └── Integration Points
        ├── gnomledger (PGL agent registration)
        ├── Interlink-CAPI (9-phase policy gate)
        └── governance checks (RepoGate, audit trail)
```

---

## BUILD SEQUENCE: 8 WEEKS

### WEEK 1-2: UACP V3 Frontend Integration
**Task:** Connect UACP V3 canvas to backend  
**Files to create:**
- `/src/hooks/useGpc.ts` — Complete API hook with error handling
- `/src/components/gpc/GpcTestDeployUI.tsx` — Test preview + GitHub export
- Update `GpcSurface.tsx` to wire all buttons and modals

**Output:**
```
User clicks "Generate from Intent"
    ↓
Hook sends POST /api/v1/gpc/generate
    ↓
Canvas updates with nodes (real or pending)
```

### WEEK 3: Backend GPC Core
**Task:** Build core GPC compiler in veklom-byos-backend  
**Files to create:**
- `backend/gpc/schemas.py` — Pydantic models
- `backend/gpc/compiler.py` — AST-based compiler
- `backend/apps/gpc/routes.py` — FastAPI endpoints:
  - `POST /api/v1/gpc/compile`
  - `POST /api/v1/gpc/generate`
  - `GET /api/v1/gpc/components`

**Output:**
```
POST /api/v1/gpc/generate
├── Input: {"user_intent": "Load CSV..."}
├── LLM: Claude + constrained decoding → GPCPipelineGraph
└── Response: {nodes[], edges[], status}
```

### WEEK 4: Execution Sandbox + Test Mode
**Task:** Run pipelines in isolated sandbox  
**Files:**
- `backend/gpc/test_executor.py` — Run on sample data
- `backend/apps/gpc/routes.py` additions:
  - `POST /api/v1/gpc/test` — DRY_RUN / SAMPLE modes
  - Streams previews via SSE

**Output:**
```
User clicks "Test on Sample Data"
    ↓
API runs compiled pipeline with 100 rows
    ↓
SSE streams node results in real-time
    ↓
"Approve & Deploy" button activates
```

### WEEK 5: GitHub Actions Deploy
**Task:** Export pipeline to GitHub workflow  
**Files:**
- `backend/gpc/github_export.py` — Generate YAML
- `backend/apps/gpc/routes.py` additions:
  - `POST /api/v1/gpc/export-github`

**Output:**
```
User clicks "Deploy to GitHub Actions"
    ↓
Dialog: "Enter repo + token"
    ↓
API generates .github/workflows/gpc-{pipeline_id}.yml
    ↓
Commits to user's GitHub repo
    ↓
GitHub Actions: compile → test → approval → deploy
```

### WEEK 6: Poltergeist Foundation
**Task:** Build capability watcher + queue  
**Files:**
- `backend/gpc/poltergeist_watcher.py` — Watch requirement stream
- `backend/gpc/haunt_cache.py` — L0-L4 cache plane
- `backend/gpc/capability_queue.py` — Deduplicating Redis queue

**Output:**
```
GPC emits capability requirement
    ↓
Watcher detects → debouncer settles (200ms)
    ↓
Redis queue → priority sort
    ↓
Single-flight lock → one build at a time
```

### WEEK 7: Agent Builders + Verification
**Task:** Manufacture missing capabilities  
**Files:**
- `backend/gpc/builders/base_builder.py` — Base class
- `backend/gpc/builders/openapi_builder.py` — OpenAPI connectors
- `backend/gpc/builders/python_builder.py` — Python transforms
- `backend/gpc/verification_hooks.py` — Tests, RepoGate, PGL, adversarial

**Output:**
```
Agent builder gets requirement "Looker connector"
    ↓
Generates code + tests + contracts
    ↓
Runs unit tests (auto-generated fixtures)
    ↓
RepoGate scans source (no hardcoded secrets)
    ↓
PGL registers capability (gnomledger API)
    ↓
All results recorded in EvidencePack
```

### WEEK 8: Freshness Gate + Interlink-CAPI
**Task:** Hard validation before binding  
**Files:**
- `backend/gpc/freshness_gate.py` — Pre-bind checks
- Integration with `backend/apps/api/routers/capi.py`

**Output:**
```
GPC compiler reaches capability node
    ↓
Freshness gate checks:
    ├── requirement_hash matches?
    ├── policy_hash matches?
    ├── all verifications passed?
    ├── PGL agent active?
    └── Interlink-CAPI approve?
    ↓
If all pass → bind node
If any fail → queue rebuild or error
```

---

## EXACT FILE TREE (What to create)

```
veklom-byos-backend/
  backend/
    gpc/
      __init__.py
      schemas.py                    (Pydantic models)
      compiler.py                   (AST compiler)
      test_executor.py              (Test mode)
      github_export.py              (GitHub Actions export)
      
      poltergeist/
        __init__.py
        watcher.py                  (Watch GPC events)
        debouncer.py                (Settle requirements)
        haunt_cache.py              (L0-L4 cache plane)
        capability_queue.py         (Dedup queue, Redis)
        
      builders/
        __init__.py
        base_builder.py             (Builder base class)
        openapi_builder.py
        python_builder.py
        graphql_builder.py
        database_builder.py
        
      verification/
        __init__.py
        hooks.py                    (Sequential verification)
        repogate.py                 (Security scan)
        pgl_registration.py         (gnomledger API)
        
      freshness_gate.py             (Pre-bind validation)
    
    apps/
      gpc/
        __init__.py
        routes.py                   (All 10 endpoints)
    
    tests/
      test_gpc_*.py                 (Complete test suite)

uacpv3/ (your frontend)
  src/
    hooks/
      useGpc.ts                     (NEW - API integration)
    
    components/
      gpc/
        GpcCanvas.tsx               (EXISTING - no changes)
        GpcSurface.tsx              (EXISTING + wire buttons)
        GpcTestDeployUI.tsx         (NEW - test/deploy modals)
    
    stores/
      gpc_stores.ts                 (EXISTING - no changes)
    
    types/
      gpc_types.ts                  (EXISTING - no changes)
```

---

## API ENDPOINTS (to implement)

### Generation
```
POST /api/v1/gpc/generate
Input: {user_intent, available_components?, data_residency_region?}
Response: {pipeline_graph, reasoning, confidence_score}
Stream: WebSocket for live status
```

### Compilation
```
POST /api/v1/gpc/compile
Input: {pipeline_id, target_node_id?}
Response: {python_code, execution_order, parallel_levels, warnings}
```

### Execution
```
POST /api/v1/gpc/execute
Input: {pipeline_id, node_id?}
Response: SSE stream of execution events
```

### Component Registry
```
GET /api/v1/gpc/components
Response: List of all available node types with schemas
```

### Test Mode (NEW)
```
POST /api/v1/gpc/test
Input: {pipeline_id, mode: "dry_run"|"sample"|"full"}
Response: SSE stream of node preview results
```

### Deploy to GitHub (NEW)
```
POST /api/v1/gpc/export-github
Input: {pipeline_id, github_repo, github_token}
Response: {workflow_url, success}
```

### Audit Trail
```
GET /api/v1/gpc/audit?pipeline_id={id}
Response: Complete execution history with evidence
```

### Poltergeist Status (NEW)
```
WebSocket /ws/gpc/poltergeist-status
Stream: Live capability build status, cache hits, etc.
```

---

## INTEGRATION POINTS (Already exist in veklom-byos-backend)

### 1. PGL (gnomledger)
```python
# After builder completes
from gnomledger import GnomledgerClient
pgl_client.create_agent(
    agent_name="looker_connector_v1",
    genome=GenomePayload(...),
    jurisdiction="CA"
)
# Returns: agent_id, certificate_id
```

### 2. Interlink-CAPI
```python
# Before GPC binds node
from backend.apps.api.routers.capi import evaluate_intent_governed
receipt = await evaluate_intent_governed(
    intent=ExecutionIntent(
        agent_id=capability.pgl_agent_id,
        pgl_id=capability.certificate_id,
        action="bind_into_pipeline",
        ...
    )
)
if not receipt.approved:
    raise PipelineBindingError(receipt.reason)
```

### 3. RepoGate (Governance)
```python
# During verification
from backend.cli.governance.checks.capi import check_capi
result = check_capi(built_source, capability_manifest)
if not result.passed:
    raise SecurityCheckFailed(result.reason)
```

### 4. Audit Logging
```python
# After every significant event
await log_audit_event(
    user_id=user_id,
    action="gpc.capability_manufactured",
    details={
        "capability_id": cap_id,
        "builder": builder_name,
        "evidence_pack_id": evidence_id,
        "pgl_agent_id": agent_id
    }
)
```

---

## SUCCESS CRITERIA

### User-Facing
- [ ] User says "Connect to Looker" → pipeline auto-generates
- [ ] Canvas shows all nodes (existing + manufactured)
- [ ] Test button works: runs on sample data, shows previews
- [ ] Deploy button works: exports GitHub Actions workflow
- [ ] No "capability missing" errors (all manufactured)
- [ ] Compile < 5s, test < 10s, export < 2s

### Technical
- [ ] Poltergeist builds connectors in < 2 seconds
- [ ] Cache hit rate > 85% for repeated requirements
- [ ] Single-flight deduplication (no duplicate builds)
- [ ] All verification hooks execute in < 500ms
- [ ] Freshness gate < 50ms latency
- [ ] 100% immutable audit trail

### Operational
- [ ] Every capability has PGL certificate
- [ ] Every build has RepoGate scan result
- [ ] Every evidence pack is cryptographically signed
- [ ] Dead builders auto-cleaned after 30s
- [ ] Build queue visible in ops console
- [ ] Metrics: success rate, cache hits, build times

---

## WHAT MAKES THIS DIFFERENT FROM OTHER PIPELINE BUILDERS

**Amphi / Looker Studio / etc:**
User picks existing nodes. No AI. No manufacturing.

**Veklom GPC inside UACP V3:**
User says what they want → LLM generates graph → missing nodes manufactured autonomously → tested → PGL-signed → deployed → all invisible to user.

**The magic:**
```
User: "Connect to Looker, show dimensions"
       ↓
GPC: Graph with Looker node
       ↓
Poltergeist: "I don't have a Looker connector"
       ↓
Agent builder: (generates connector in 2s)
       ↓
Verification: (runs tests, security scans, PGL sign in 1s)
       ↓
Canvas: "✓ Looker Connector [Connected]"
       ↓
User: (never knew it was manufactured)
```

---

## READY TO BUILD

All pieces are in place:
- ✅ UACP V3 canvas exists
- ✅ UACP V3 types exist
- ✅ UACP V3 stores exist
- ✅ veklom-byos-backend has Interlink-CAPI
- ✅ gnomledger exists (PGL)
- ✅ RepoGate governance checks exist

**Next: Build the complete Poltergeist system + integrate into UACP V3.**

**Timeline: 8 weeks for production-ready.**
**Cost: ~40-50 hours of focused engineering.**
**Deliverable: Complete GPC pipeline system inside UACP V3.**

This is the game changer.

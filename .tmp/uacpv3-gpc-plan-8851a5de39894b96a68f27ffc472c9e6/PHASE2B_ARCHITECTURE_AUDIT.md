# PHASE 2B ARCHITECTURE AUDIT
## GPC + Poltergeist + PGL + Interlink-CAPI Integration

**Status:** Repos audited. Architecture locked. Ready to build.

---

## PART I: EXISTING SYSTEM INVENTORY

### gnomledger (PGL — Project Genome Ledger)
**Location:** `reprewindai-dev/gnomledger`  
**Purpose:** Cryptographic capability identity and audit trail

**Core Data Model:**
```python
GenomePayload
├── model_family, model_version, architecture
├── tools: List[str]                      # What this capability can do
├── permissions: List[str]                # Required authorities
├── safety_rules: List[str]               # Constraints on execution
├── runtime_config: Dict[str, Any]        # Environment/resource config
├── intended_use: str                     # Declared purpose
└── risk_category: Literal["low", "medium", "high"]

AgentResponse
├── agent_id: str                         # Unique identity
├── certificate_id: str                   # PGL birth certificate
├── genome: GenomePayload                 # The capability definition
├── status: str                           # "active", "suspended", "retired"
├── jurisdiction: str                     # Legal region
└── created_at: datetime

LedgerEventCreate
├── agent_id: str
├── event_type: Literal["birth_registration", "mutation_update", "test_audit", "deployment", "incident"]
├── actor: str                            # Who triggered this event
├── summary: str
├── details: Dict[str, Any]               # Structured change proof
└── idempotency_key: Optional[str]        # Replay protection
```

**Key Services:**
- `GenomeService`: Creates, updates, and versions AI capability genomes
- `CertificateService`: Issues cryptographic birth certificates
- `LedgerService`: Maintains append-only, hash-chained audit trail
- `LineageService`: Tracks parent/child capability hierarchies
- `IncidentService`: Records policy violations, attacks, runtime failures

**Critical Method:**
```python
def update_genome(agent_id: str, payload: GenomeUpdateRequest) -> GenomePayload:
    # 1. Fetch latest genome version
    # 2. Calculate new_hash = stable_hash(updated_payload)
    # 3. If new_hash == current_hash: raise ValueError
    # 4. Create new GenomeVersion
    # 5. Update certificate.genome_hash
    # 6. Log LedgerEvent(type="mutation_update", ...)
    # 7. Commit atomically
```

**Integration Point for Poltergeist:**
PGL is the source of truth for capability identity and lifecycle. When Poltergeist manufactures a new capability (e.g., a connector), it must:
1. Emit a GenomePayload describing inputs/outputs/permissions
2. Call gnomledger API to register the capability
3. Receive an agent_id and certificate_id
4. Store that certificate_id in the capability ghost record

---

### veklom-byos-backend (Execution & Governance)
**Location:** `reprewindai-dev/veklom-byos-backend`  
**Purpose:** Distributed execution runtime, policy enforcement, billing

**Core Subsystems:**

#### 1. Interlink-CAPI (Capability Execution Gateway)
**Location:** `backend/apps/api/routers/capi.py`  
**Purpose:** The 9-phase deterministic policy gatekeeper

**The 9 Phases (from code audit):**
```
Phase 1: Identity & Cryptography
├── Resolve agent_id in registry
├── Verify PGL signature (nacl.verify_key)
├── Check replay nonce (Redis)
└── → PASSED or CRYPTOGRAPHIC_SIGNATURE_INVALID

Phase 2: Three-Tier Policy Composition
├── TIER 1: System overrides (hard veto on root/sudo)
├── TIER 2: Owner policy (tool_permissions in AuthorityBundle)
├── TIER 3: Runtime policy (time_restrictions, delegation_chain)
├── Delegation trust degradation: effective_trust = trust * (0.92^hops)
└── → PASSED or POLICIES_CONSTRUCT_DENY

Phase 3: Safety & Anomaly Gate
├── Rate limit check (requests per minute)
├── Quarantine check (QuarantinedIntent table)
├── Anomaly scoring (AuditLog spike detection)
└── → PASSED or ANOMALY_SPIKE_DETECTED

Phase 4-9: (To be inspected further)
```

**Data Structures:**
```python
ExecutionIntent
├── agent_id: str                    # Who is acting
├── pgl_id: str                      # Cryptographic proof
├── mission_id: Optional[str]        # Current mission context
├── target_protocol: str             # "mcp", "http", "local_tool", "model_inference"
├── action: str                      # Specific tool/method
├── payload: Dict[str, Any]          # Arguments
└── delegation_chain: Optional[List[str]]  # Trust chain

ExecutionReceipt (Response)
├── status: str                      # "approved", "denied"
├── intent_hash: str
├── verdict: str                     # Reason
├── evidence_chain_id: str           # Link to audit trail
├── result: Optional[Any]            # Execution result
├── quarantine_id: Optional[str]
├── trust_delta: Optional[int]
├── new_trust_score: Optional[int]
└── risk_score: Optional[int]
```

**Critical Endpoint:**
```
POST /api/v1/capi/evaluate-intent-governed
├── Input: ExecutionIntent
├── Runs all 9 phases
├── Returns: (is_approved: bool, reason: str, phase: int, details: dict)
└── Blocks execution if any phase fails (fail-closed)
```

#### 2. Governance Checks (from `backend/cli/governance/checks/`)
```
capi.py         → Validate cAPI gateway state
identity.py     → Check agent identity consistency
incident.py     → Retrieve and analyze incident records
rls.py          → Row-level security enforcement
tiering.py      → Service tier limits
training.py     → AI model training authorization
x402.py         → Micropayment protocol checks
```

**Integration Pattern:** Each check returns structured JSON with pass/fail and evidence.

#### 3. PostgreSQL Models (Authority & Evidence)
```python
AuthorityBundle (holds policy for a workspace)
├── workspace_id
├── is_active: bool
├── tool_permissions: Dict[str, Dict]  # action → {"effect": "ALLOW"/"DENY"}
├── time_restrictions: Dict            # "business_hours_only": true
└── resource_limits: Dict              # CPU, memory, tokens

EvidencePack (immutable proof trail)
├── evidence_id
├── workspace_id
├── capability_id (or artifact_hash)
├── verification_results: Dict         # All checks that passed
├── policy_snapshot: Dict              # Policy at time of verification
├── signed_by: str                     # Key that signed this
└── created_at: datetime

AuditLog (continuous event stream)
├── user_id (agent_id)
├── action: str                        # "capi.execute.success", "capi.execute.denied"
├── details: Dict
└── created_at: datetime
```

---

### veklom-control-plane (Frontend)
**Location:** `reprewindai-dev/veklom-control-plane`  
**Purpose:** User-facing pipeline builder and runtime monitoring

**Current Integration Points:**
- Makes calls to `/api/v1/capi/evaluate-intent-governed` for execution approval
- Displays pipeline status from backend
- Streams execution logs via WebSocket
- No capability manufacturing (all nodes pre-registered)

---

## PART II: WHERE POLTERGEIST FITS

### The Current Gap
**Today:** User creates a pipeline → selects pre-existing nodes → compiles → runs

**Problem:** What if a required node doesn't exist?
- Amplify/Looker connector not registered
- Custom transformation for specific tenant schema
- New API endpoint that appeared this week
- Proprietary database adapter

**Result:** User is blocked. Must wait for engineering.

### What Poltergeist Solves
**When user specifies intent:** "Connect to our Postgres database, extract unpaid invoices, transform to our internal schema"

**Poltergeist watches the GPC graph formation and detects:**
```
"I need a PostgreSQL connector that outputs our invoice schema"
```

**Instead of failing, Poltergeist:**
1. Checks exact match in registry (fast)
2. Checks ghost memory for reusable recipe
3. Starts autonomous builder agents immediately
4. Generates connector code
5. Tests against sample schema
6. Runs security checks via Interlink-CAPI + governance hooks
7. Signs artifact with PGL
8. Registers in tenant's node catalogue
9. GPC binds the node

**User sees:** ✓ Pipeline ready (all nodes resolved)  
**User doesn't see:** The 7 internal steps that manufactured the missing node

---

## PART III: POLTERGEIST → VEKLOM INTEGRATION POINTS

### Integration Point 1: PGL Capability Registration
**When:** After Poltergeist builds a new capability  
**Who:** CapabilityBuilder → gnomledger API

```python
# Pseudo-code for builder post-build
async def register_with_pgl(
    capability_artifact: bytes,
    manifest: CapabilityManifest,
    pgl_client: GnomledgerClient
) -> (agent_id: str, certificate_id: str):
    
    # Create genome from manifest
    genome = GenomePayload(
        model_family="custom_connector",
        model_version=manifest.version,
        architecture=manifest.architecture,
        tools=manifest.input_ports + manifest.output_ports,
        permissions=manifest.required_permissions,
        safety_rules=manifest.constraints,
        runtime_config=manifest.env_config,
        intended_use=manifest.declared_purpose,
        risk_category=manifest.risk_level
    )
    
    # Register with PGL
    response = await pgl_client.create_agent(
        agent_name=manifest.capability_id,
        creator="veklom_autonomous_builder",
        jurisdiction="CA",
        genome=genome,
        parent_agent_ids=[tenant_policy_agent_id]
    )
    
    return response.agent_id, response.certificate_id
```

**Response:** The capability now has cryptographic identity and audit trail in PGL.

### Integration Point 2: Interlink-CAPI Execution Validation
**When:** Before binding a capability into a pipeline  
**Who:** GPC freshness gate → Interlink-CAPI gateway

```python
# Inside GPC compiler freshness gate
async def validate_capability_with_capi(
    capability: CapabilityArtifact,
    requirement: CapabilityRequirement,
    policy_context: PolicyContext,
    capi_client: CapiClient
) -> (is_valid: bool, receipt: ExecutionReceipt):
    
    # Construct execution intent
    intent = ExecutionIntent(
        agent_id=capability.pgl_agent_id,
        pgl_id=capability.certificate_signature,
        target_protocol="node_binding",
        action="bind_into_pipeline",
        payload={
            "capability_id": capability.id,
            "pipeline_id": pipeline_id,
            "graph_revision": graph_revision,
            "tenant_id": tenant_id,
            "policy_version": policy_context.version
        }
    )
    
    # Evaluate against all 9 phases
    receipt = await capi_client.evaluate_intent_governed(intent)
    
    return receipt.status == "approved", receipt
```

**Critical:** If any of the 9 phases fail, GPC does NOT bind this capability. The node remains in a "waiting for resolution" state.

### Integration Point 3: Governance Verification Hooks
**When:** During CapabilityBuilder's post-build phase  
**Who:** CapabilityBuilder → governance checkers

```python
async def run_verification_hooks(
    capability_artifact: CapabilityArtifact,
    built_source: str,
    tests_passed: bool
) -> (all_checks_passed: bool, results: Dict):
    
    checks = []
    
    # 1. Unit and contract tests
    tests_result = await run_tests(capability_artifact)
    checks.append(("tests", tests_result.passed))
    
    # 2. RepoGate security scan
    repogate = await scan_repogate(built_source, capability_artifact.imports)
    checks.append(("repogate", repogate.passed))
    
    # 3. Dependency scan
    deps = await scan_dependencies(capability_artifact.dependency_lock)
    checks.append(("dependencies", deps.all_safe))
    
    # 4. PGL policy validation
    pgl_valid = await validate_pgl_policy(capability_artifact.pgl_agent_id)
    checks.append(("pgl_policy", pgl_valid))
    
    # 5. Adversarial testing
    adversarial = await run_adversarial_tests(capability_artifact, built_source)
    checks.append(("adversarial", adversarial.passed))
    
    # Record all results atomically
    all_passed = all(result for _, result in checks)
    
    return all_passed, {name: result for name, result in checks}
```

### Integration Point 4: Audit Trail & Evidence
**When:** After all checks pass  
**Who:** Poltergeist → EvidencePack storage

```python
async def record_capability_evidence(
    capability_id: str,
    manifest: CapabilityManifest,
    verification_results: Dict,
    artifact_hash: str,
    policy_snapshot: Dict
) -> evidence_pack_id: str:
    
    evidence = EvidencePack(
        workspace_id=tenant_id,
        capability_id=capability_id,
        artifact_hash=artifact_hash,
        verification_results=verification_results,  # All checks
        policy_snapshot=policy_snapshot,             # Policy at time of build
        manifest_json=manifest.model_dump(),
        signed_by="veklom_poltergeist_signer",
        signature=sign_evidence(manifest, policy_snapshot, verification_results)
    )
    
    await db.add(evidence)
    await db.commit()
    
    return evidence.evidence_pack_id
```

**Purpose:** Immutable, searchable proof that this capability was manufactured, tested, and approved according to policy at time T.

---

## PART IV: POLTERGEIST SYSTEM ARCHITECTURE

```
                          GPC Graph Formation (streaming)
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                  Poltergeist Watcher    Visual Canvas
                  (watches capability      (shows nodes,
                   requirement stream)      interactive UI)
                         │
              Requirement Debouncer (settle 200ms)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     Redis Cache    Postgres Ghost    R2 Artifacts
     (hot path)      Registry          (cold bodies)
        │                │                │
        └────────────────┴────────────────┘
                         │
          Affected Capability Resolver
          (exact/ghost/missing detection)
                         │
              Priority Engine (critical path first)
                         │
         Deduplicating Build Queue (Redis locks)
                         │
      Specialized Agent Builder (creates capability)
            ├── validate_requirement
            ├── resolve_existing_material
            ├── generate_or_adapt
            ├── compile
            └── package
                         │
         Sequential Verification Hooks
            ├── unit tests
            ├── contract tests
            ├── RepoGate scan ←─────────── Governance
            ├── dependency scan
            ├── PGL policy validation ←── Interlink-CAPI
            ├── adversarial tests
            └── sign artifact
                         │
           Register with PGL (gnomledger)
           Record Evidence Pack
           Update Ghost Registry
                         │
             Freshness Gate in GPC Compiler
             (all hashes match?)
                         │
           Bind node into compiled pipeline
                         │
                   Runtime Execution
              (with Interlink-CAPI 9-phase gate)
```

---

## PART V: DATA FLOW FOR ONE EXAMPLE

### Scenario: User says "Connect to Looker, pull dimensions"

**Step 1: Intent Stream (T=0ms)**
```
User types: "Connect to Looker"
↓
GPC intent parser emits:
  {
    "requirement_type": "connector",
    "external_system": "looker",
    "operations": ["query_dimensions"],
    "output_schema": "unknown"
  }
```

**Step 2: Watcher Detection (T=10ms)**
```
Poltergeist detects new requirement
Emits capability requirement to debouncer:
  {
    "fingerprint": "sha256:looker_query_dimensions",
    "type": "looker_connector",
    "version": "latest"
  }
```

**Step 3: Debouncer (T=10-200ms)**
```
Debouncer collects events:
  - "looker" requirement
  - (possible: "error_handling", "retry_policy" if user keeps typing)
Settles after 200ms of no new events
Emits stable requirement to queue
```

**Step 4: Affected Resolver (T=210ms)**
```
Does exact connector exist?
  No → check ghost registry
Does a compatible Looker v2.1 exist?
  No → must manufacture
Priority: CRITICAL_PATH (user blocked on this)
```

**Step 5: Queue & Dedup (T=220ms)**
```
Lock key: "build-lock:looker_query_dimensions"
Any existing build?
  No → create new build job
  Yes (partial match) → merge into existing
Enqueue with priority score = 95/100
```

**Step 6: Agent Builder Starts (T=250ms)**
```
GenericConnectorBuilder starts autonomously:
  1. Fetch Looker API documentation (PageIndex retrieval)
  2. Generate Python connector class
  3. Compile with proper error handling
  4. Create unit test fixtures from API docs
  5. Package into Python wheel
```

**Step 7: Verification Hooks (T=2000ms)**
```
Sequential checks:
  ✓ Unit tests pass (10 fixtures from API docs)
  ✓ RepoGate scan: No hardcoded secrets
  ✓ Dependency scan: All packages in-repo
  ✓ PGL policy: Connector marked "external_api_access" allowed
  ✓ Adversarial: Tested with malformed API responses
  ✓ Signature: Signed by builder key
All pass → evidence recorded in EvidencePack
```

**Step 8: PGL Registration (T=2100ms)**
```
POST /api/pgl/create-agent
  {
    "agent_name": "looker_connector_v1",
    "genome": {
      "tools": ["query_dimensions", "list_models"],
      "permissions": ["external_api_read"],
      "safety_rules": ["no_api_key_in_logs"],
      "risk_category": "medium"
    }
  }
Response:
  {
    "agent_id": "cap_looker_1",
    "certificate_id": "cert_looker_1_sha256:..."
  }
```

**Step 9: Freshness Gate (T=2150ms)**
```
GPC compiler reaches Looker node
Calls freshness gate:
  require_hash: sha256:latest_requirement
  artifact_hash: sha256:builder_output
  policy_hash: sha256:active_policy
  pgl_certificate: cert_looker_1_...
All match? → YES
Approved? → APPROVED
→ Node is bound into compiled pipeline
```

**Step 10: User Sees (T=2200ms)**
```
Canvas updates:
  "Looker Dimensions"
  ✓ Connected
  [Properties panel available]
  
User can now:
  - Edit connection settings
  - Test preview data
  - Continue building pipeline
```

**The entire manufacturing, testing, verification, and binding happens in 2.2 seconds.**  
User never sees the 7 internal steps.

---

## PART VI: FRESHNESS GATE LOGIC

This is the **critical non-negotiable** piece that ties everything together.

```python
@dataclass
class CapabilityFreshnessState:
    requirement_revision: int          # Graph change version
    artifact_revision: int             # Built artifact version
    policy_revision: int               # Active policy version
    dependency_revision: int           # Lock file version
    runtime_revision: int              # Runtime environment version
    verification_revision: int         # All checks passed version
    pgl_certificate_hash: str          # Agent identity from PGL
    status: Literal[
        "fresh",                       # All hashes match, approved
        "waiting_for_build",           # Build in progress
        "building",                    # Actively being built
        "build_failed",                # Last build attempt failed
        "stale",                       # Artifact pre-dates requirement
        "unverified"                   # Tests haven't run yet
    ]

async def check_capability_freshness(
    requirement: CapabilityRequirement,
    artifact: CapabilityArtifact,
    state: CapabilityFreshnessState
) -> (is_fresh: bool, reason: str):
    """
    The gate that prevents stale, failed, or unverified capabilities
    from being bound into a pipeline.
    """
    
    # All these hashes must match exactly
    required_checks = [
        ("requirement", requirement.hash, artifact.requirement_hash),
        ("policy", requirement.policy_hash, artifact.policy_hash),
        ("dependencies", requirement.dependency_hash, artifact.dependency_hash),
        ("runtime", requirement.runtime_hash, artifact.runtime_hash),
        ("pgl_certificate", requirement.pgl_certificate, artifact.pgl_certificate_hash),
    ]
    
    for check_name, required, actual in required_checks:
        if required != actual:
            return False, f"STALE_{check_name.upper()}_MISMATCH"
    
    # Verification must have passed
    if not artifact.verification_passed:
        return False, "UNVERIFIED_ARTIFACT"
    
    # Verification results must be recent enough (< 24 hours old)
    age = (now - artifact.verified_at).total_seconds()
    if age > 86400:
        return False, "VERIFICATION_EXPIRED"
    
    # PGL certificate must be active (not suspended)
    agent_status = await pgl_client.get_agent_status(artifact.pgl_agent_id)
    if agent_status != "active":
        return False, f"PGL_AGENT_{agent_status.upper()}"
    
    # Policy must still allow this capability
    can_execute = await capi_client.evaluate_intent_governed(
        ExecutionIntent(
            agent_id=artifact.pgl_agent_id,
            pgl_id=artifact.pgl_certificate_hash,
            action="bind_into_pipeline",
            payload={...}
        )
    )
    if not can_execute:
        return False, "POLICY_DENY"
    
    # All checks passed
    return True, "FRESH_APPROVED"
```

**In GPC:**
```python
# During compilation
for node in topological_order:
    is_fresh, reason = await check_capability_freshness(
        requirement=node.capability_requirement,
        artifact=resolved_artifact,
        state=build_state
    )
    
    if not is_fresh:
        if reason.startswith("BUILDING"):
            # Wait (can render provisionally)
            await wait_for_build(artifact_id)
        elif reason.startswith("STALE"):
            # Queue rebuild
            await poltergeist_queue.enqueue(
                requirement=node.capability_requirement,
                priority=CRITICAL
            )
            raise CompilationError(f"Capability stale, rebuild queued: {reason}")
        else:
            # Build failed or other terminal state
            raise CompilationError(f"Capability failed verification: {reason}")
    
    # Fresh and approved — bind it
    node.artifact_hash = artifact.hash
    node.pgl_agent_id = artifact.pgl_agent_id
```

---

## PART VII: WHAT WE BUILD IN PHASE 2B

**8-week roadmap:**

**Weeks 1-2: Poltergeist Foundation**
- [ ] Capability watcher service (subscribes to GPC graph events)
- [ ] Requirement fingerprinting (deterministic capability identification)
- [ ] Debouncer (settling window, merge logic)
- [ ] Redis coordination layer (locks, state)
- [ ] PostgreSQL haunt state schema

**Weeks 3-4: Build Queue & Resolver**
- [ ] Deduplicating build queue (single-flight, merge)
- [ ] Affected capability resolver (exact/ghost/missing)
- [ ] Priority engine (critical-path scoring)
- [ ] Integration tests with mock builders

**Weeks 5-6: Agent Builders**
- [ ] Base CapabilityBuilder class (with PGL, RepoGate, evidence hooks)
- [ ] OpenAPIConnectorBuilder
- [ ] GraphQLConnectorBuilder
- [ ] PythonTransformBuilder
- [ ] Database adapter builders
- [ ] AgentToolBuilder
- [ ] Build lifecycle tests

**Weeks 7-8: Verification & Freshness**
- [ ] Sequential verification hook system
- [ ] RepoGate integration (security scan)
- [ ] PGL registration flow
- [ ] Evidence pack recording
- [ ] GPC freshness gate (hard constraint)
- [ ] Interlink-CAPI validation before bind
- [ ] Full integration tests
- [ ] Load tests (100+ concurrent builds)

**Weeks 8+ (concurrent):**
- [ ] Haunt cache plane (L0-L4)
- [ ] vLLM prefix cache tuning
- [ ] Ghost registry implementation
- [ ] Hetzner Object Storage integration
- [ ] Operational dashboards & alerts

---

## PART VIII: SUCCESS CRITERIA

### Technical
- [ ] Capability build completes in <2 seconds for simple connectors
- [ ] Cache hit rate >85% for repeated requirements
- [ ] Verification hooks execute in <500ms
- [ ] Freshness gate latency <50ms
- [ ] 100% atomic state transitions (no partial builds)
- [ ] Full audit trail for every capability (immutable, chain-verified)

### Operational
- [ ] One build at a time per requirement (Redis single-flight)
- [ ] Automatic retry with exponential backoff on failure
- [ ] Dead builders automatically cleaned up
- [ ] Build queues visible in operations console
- [ ] Cache eviction follows LFU policy
- [ ] Metrics: build success rate, cache hit/miss, mean build time

### User-Facing
- [ ] User does not see "missing connector" error
- [ ] Pipeline binding succeeds even for newly synthesized capabilities
- [ ] All nodes in a pipeline have cryptographic PGL identity
- [ ] Execution traces include builder-generated proof
- [ ] Replay detection on every execution
- [ ] Audit trail shows "this connector was generated by autonomous builder on T at policy version X"

---

## READY TO BUILD

All three repos audited. Integration points mapped. Architecture locked.

Next: Build Poltergeist watcher + queue + builders + freshness gate.

**One coherent system. Production-ready. No scaffolding.**

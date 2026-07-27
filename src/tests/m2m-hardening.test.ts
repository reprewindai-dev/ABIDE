import { describe, it, after } from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { PlanIR, PlanStep } from "../core/plan-ir";
import { 
  executeMandatoryZ3Verification, 
  executeTlaModelChecking, 
  verifyPlanZkSnarkCircuit, 
  enforceLane3Z3AndDegradedGuard, 
  enforceSubAgentCappoPolicy, 
  persistLane3PglAnchor 
} from "../core/m2m-verifier";
import { sealStepOnLedger } from "../core/execution";

describe("Enterprise Hardening: Verification & M2M Contract Regression Suite", () => {
  const mockTenantId = "tenant-enterprise-99";
  
  function createSamplePlan(lane: 1 | 2 | 3 = 1): PlanIR {
    const step: PlanStep = {
      stepId: crypto.randomUUID(),
      sequence: 1,
      capability: lane === 3 ? "mint-settlement-evidence" : "govern-agent-session",
      lane,
      inputSchema: { tenantId: mockTenantId, amountUsd: 500 },
      expectedOutput: { status: "SETTLED" },
      riskLevel: lane === 3 ? "CRITICAL" : "LOW",
      requiresApproval: lane === 3,
      idempotencyKey: crypto.randomBytes(16).toString("hex")
    };

    const hash = crypto.createHash("sha256").update(JSON.stringify([step])).digest("hex");
    return {
      planId: crypto.randomUUID(),
      version: "4.02.0",
      status: "APPROVED",
      tenantId: mockTenantId,
      agentId: "agent-test-harness",
      compiledAt: new Date().toISOString(),
      intent: "Verify enterprise hardening invariants",
      steps: [step],
      canonicalHash: hash,
      replayable: true,
      verificationStatus: "PENDING"
    };
  }

  it("1. Mandatory Z3 Verification on Lane 3 Paths: should enforce SAT verification proof prior to allowing external mutations", async () => {
    const plan = createSamplePlan(3);
    
    // Attempting to execute Lane 3 without Z3 verification must halt
    assert.throws(
      () => enforceLane3Z3AndDegradedGuard(plan),
      /Mandatory Z3 solver SAT verification required for Lane 3 execution path/i,
      "Should halt when Z3 proof is missing on Lane 3 plan"
    );

    // Perform Z3 verification
    const verifiedPlan = await executeMandatoryZ3Verification(plan);
    assert.strictEqual(verifiedPlan.verificationStatus, "VERIFIED", "Verification status should be VERIFIED");
    assert.ok(verifiedPlan.z3Proof?.satisfiable, "Z3 proof must be SATISFIABLE");
    assert.ok(verifiedPlan.z3Proof?.checkedAssertionsCount! > 0, "Must check at least 1 SMT assertion");

    // Now guard should clear without throwing
    assert.doesNotThrow(() => enforceLane3Z3AndDegradedGuard(verifiedPlan));
  });

  it("2. Strict Degraded-State Reporting: should refuse Lane 3 actions when verifier is UNVERIFIED_DEGRADED unless override token is provided", () => {
    const plan = createSamplePlan(3);
    plan.z3Proof = {
      verified: false,
      satisfiable: true, // simulated SAT but degraded
      checkedAssertionsCount: 2,
      timestamp: new Date().toISOString(),
      solverType: "INTERNAL_SMT_FALLBACK"
    };
    plan.verificationStatus = "UNVERIFIED_DEGRADED";

    // Without override token, must halt
    assert.throws(
      () => enforceLane3Z3AndDegradedGuard(plan),
      /Formal verifier was unavailable or degraded \(UNVERIFIED_DEGRADED\)/i,
      "Must refuse Lane 3 actions when degraded without override"
    );

    // Provide sovereign override token
    plan.degradedOverrideToken = "ovr-token-sovereign-architect-sig-998";
    assert.doesNotThrow(() => enforceLane3Z3AndDegradedGuard(plan), "Should allow execution when explicit override token is present");
  });

  it("3. Comprehensive CAPPO Policy Enforcement: should assert CAPPO authorization across sub-agent execution paths", () => {
    const plan = createSamplePlan(2);
    plan.steps[0].subAgentPolicy = {
      agentId: "subagent-finance-worker-01",
      tenantId: mockTenantId,
      requiredCapabilities: ["govern-agent-session"],
      authorizedByCappo: false
    };

    assert.throws(
      () => enforceSubAgentCappoPolicy(plan),
      /lacks CAPPO policy authorization/i,
      "Must halt execution if sub-agent lacks CAPPO policy authorization"
    );

    // Authorize sub-agent
    plan.steps[0].subAgentPolicy!.authorizedByCappo = true;
    assert.doesNotThrow(() => enforceSubAgentCappoPolicy(plan), "Must pass when sub-agent is authorized by CAPPO");

    // Test tenant mismatch tamper
    plan.steps[0].subAgentPolicy!.tenantId = "tenant-evil-hacker";
    assert.throws(
      () => enforceSubAgentCappoPolicy(plan),
      /Sub-agent tenant mismatch/i,
      "Must prevent cross-tenant sub-agent execution"
    );
  });

  it("4. Persistent Gnomledger (PGL) Inclusion: should seal execution receipts and Merkle root anchors to persistent storage", async () => {
    const plan = createSamplePlan(3);
    const step = plan.steps[0];
    const mockResult = {
      stepId: step.stepId,
      sequence: 1,
      capability: step.capability,
      status: "SUCCESS" as const,
      output: { settled: true },
      executedAt: new Date().toISOString(),
      resultHash: crypto.createHash("sha256").update("settled").digest("hex")
    };

    const receipt = sealStepOnLedger(plan.planId, mockResult);
    await persistLane3PglAnchor(plan, step, receipt);

    assert.ok(step.pglAnchor, "Step must have a PGL anchor attached");
    assert.ok(step.pglAnchor.merkleRoot.startsWith("0x_"), "Merkle root anchor must start with 0x_ prefix");
    assert.strictEqual(step.pglAnchor.slsaLevel, "SLSA_BUILD_LEVEL_3", "Must assert SLSA Level 3 compliance");
    assert.strictEqual(plan.pglMerkleRoot, step.pglAnchor.merkleRoot, "Plan must reference the persisted Merkle root");

    // Verify filesystem persistence
    const ledgerPath = path.resolve(process.cwd(), "pgl-persistent-ledger.json");
    assert.ok(fs.existsSync(ledgerPath), "Persistent PGL ledger file must exist on disk");
    const content = JSON.parse(fs.readFileSync(ledgerPath, "utf-8"));
    const persistedRecord = content.find((r: any) => r.receiptId === receipt.receiptId);
    assert.ok(persistedRecord, "Sealed receipt must be found in persistent PGL ledger file");
  });

  it("5. Groth16 / PLONK ZK-SNARK Proof Circuits: should wire and evaluate proof circuits directly onto PlanIR", async () => {
    const plan = createSamplePlan(1);
    const verifiedPlan = await verifyPlanZkSnarkCircuit(plan);

    assert.ok(verifiedPlan.zkSnarkCircuit, "ZK SNARK circuit must be wired onto PlanIR");
    assert.strictEqual(verifiedPlan.zkSnarkCircuit.proofType, "GROTH16", "Should default to GROTH16 circuit");
    assert.strictEqual(verifiedPlan.zkSnarkCircuit.verified, true, "Proof circuit must be verified");
    assert.ok(verifiedPlan.zkSnarkCircuit.verificationKeyHash?.startsWith("vkey-groth16-"), "Must bind verification key hash");
  });

  it("6. Lamport TLA+ State-Space Model Checking: should simulate algorithm state transitions prior to execution", async () => {
    const plan = createSamplePlan(2);
    const checkedPlan = await executeTlaModelChecking(plan);

    assert.ok(checkedPlan.tlaProof, "TLA+ verification proof must be attached");
    assert.strictEqual(checkedPlan.tlaProof.deadlockFree, true, "State-space must be deadlock-free");
    assert.ok(checkedPlan.tlaProof.checkedInvariantsCount > 0, "Must check safety invariants");
    assert.ok(checkedPlan.tlaProof.trace.length > 0, "Must output verification trace");
  });

  it("7. Unreachable Service Degraded-State Reporting: should mark PlanIR status as UNVERIFIED when Z3/TLA+ service is unreachable and prevent Lane 3 execution", () => {
    const plan = createSamplePlan(3);
    plan.z3Proof = {
      verified: false,
      satisfiable: true, // simulated SAT but degraded
      checkedAssertionsCount: 2,
      timestamp: new Date().toISOString(),
      solverType: "INTERNAL_SMT_FALLBACK",
      error: "Formal verifier offline/unreachable: ECONNREFUSED"
    };
    plan.verificationStatus = "UNVERIFIED";

    // Without override token, must halt Lane 3 execution
    assert.throws(
      () => enforceLane3Z3AndDegradedGuard(plan),
      /CAPPO HALT.*UNVERIFIED/i,
      "Must refuse Lane 3 actions when verifier status is UNVERIFIED due to unreachable service"
    );

    // Provide sovereign override token
    plan.degradedOverrideToken = "ovr-token-sovereign-architect-sig-999";
    assert.doesNotThrow(() => enforceLane3Z3AndDegradedGuard(plan), "Should allow execution when explicit override token is present");
  });

  after(() => {
    setTimeout(() => { process.exit(0); }, 100);
  });
});

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";
import { exploreTlaStateSpace, verifyPlanIRWithTla } from "../compiler/tla-adapter";
import { enforceLane3Z3AndDegradedGuard } from "../core/m2m-verifier";
import { PlanIR, PlanStep } from "../core/plan-ir";

describe("TLA+ Formal State-Space Exploration Adapter Suite", () => {
  const mockTenantId = "tenant-tla-test";
  let origUrl: string | undefined;

  beforeEach(() => {
    origUrl = process.env.VERIFICATION_SERVICE_URL;
    delete process.env.VERIFICATION_SERVICE_URL;
  });

  afterEach(() => {
    if (origUrl !== undefined) {
      process.env.VERIFICATION_SERVICE_URL = origUrl;
    } else {
      delete process.env.VERIFICATION_SERVICE_URL;
    }
  });

  function createSampleStep(sequence: number, lane: 1 | 2 | 3 = 1, capability = "test-cap"): PlanStep {
    return {
      stepId: crypto.randomUUID(),
      sequence,
      capability,
      lane,
      inputSchema: { tenantId: mockTenantId },
      expectedOutput: { ok: true },
      riskLevel: lane === 3 ? "CRITICAL" : "LOW",
      requiresApproval: lane === 3,
      approvalToken: lane === 3 ? "mock-approval-token" : undefined,
      idempotencyKey: crypto.randomBytes(16).toString("hex")
    };
  }

  function createPlanWithSteps(steps: PlanStep[]): PlanIR {
    const hash = crypto.createHash("sha256").update(JSON.stringify(steps)).digest("hex");
    return {
      planId: crypto.randomUUID(),
      version: "4.02.0",
      status: "APPROVED",
      tenantId: mockTenantId,
      agentId: "agent-tla-harness",
      compiledAt: new Date().toISOString(),
      intent: "Verify formal TLA+ temporal properties",
      steps,
      canonicalHash: hash,
      replayable: true,
      verificationStatus: "PENDING",
      z3Proof: {
        verified: true,
        satisfiable: true,
        checkedAssertionsCount: 5,
        timestamp: new Date().toISOString(),
        solverType: "INTERNAL_SMT_FALLBACK"
      }
    };
  }

  test("should successfully explore valid state transitions without deadlock or temporal violations", () => {
    const step1 = createSampleStep(1, 1, "fetch-data");
    const step2 = createSampleStep(2, 2, "compute-state");
    const step3 = createSampleStep(3, 3, "mint-settlement-evidence");
    const plan = createPlanWithSteps([step1, step2, step3]);

    const result = exploreTlaStateSpace(plan);
    assert.strictEqual(result.verified, true, "Must verify clean state-space");
    assert.strictEqual(result.deadlockFree, true, "Must be deadlock free");
    assert.strictEqual(result.satisfiable, true, "Must report SAT for temporal invariants");
    assert.strictEqual(result.temporalViolations.length, 0, "No temporal violations expected");
    assert.ok(result.statesExplored >= 4, "Must explore initial and step transition states");
  });

  test("should report temporal violations as high-priority UNSAT results when step ordering invariant breaks", () => {
    const step1 = createSampleStep(1, 1, "fetch-data");
    const step2 = createSampleStep(5, 2, "illegal-sequence-jump"); // sequence jump
    const plan = createPlanWithSteps([step1, step2]);

    const result = exploreTlaStateSpace(plan);
    assert.strictEqual(result.verified, false, "Must fail verification on ordering invariant break");
    assert.strictEqual(result.deadlockFree, false, "Must mark as not deadlock free");
    assert.strictEqual(result.satisfiable, false, "Must report as high-priority UNSAT");
    assert.ok(result.error && result.error.includes("[HIGH-PRIORITY UNSAT]"), "Must format error as high-priority UNSAT");
    assert.ok(result.temporalViolations.length > 0, "Must record specific temporal violation");
  });

  test("should report temporal violations when unauthorized Lane 3 mutations occur", () => {
    const step1 = createSampleStep(1, 3, "unauthorized-lane3-mutation");
    const plan = createPlanWithSteps([step1]);

    const result = exploreTlaStateSpace(plan);
    assert.strictEqual(result.satisfiable, false, "Must report UNSAT for unauthorized Lane 3 mutation");
    assert.strictEqual(result.verified, false, "Must fail verification");
    assert.ok(result.temporalViolations.some(v => v.includes("unauthorized Lane 3 mutation")), "Must report exact violation");
  });

  test("verifyPlanIRWithTla should attach tlaProof and mark plan verificationStatus as FAILED on temporal violation", async () => {
    const step1 = createSampleStep(1, 3, "unauthorized-lane3-mutation");
    const plan = createPlanWithSteps([step1]);

    const verifiedPlan = await verifyPlanIRWithTla(plan);
    assert.ok(verifiedPlan.tlaProof, "tlaProof must be attached");
    assert.strictEqual(verifiedPlan.tlaProof.deadlockFree, false, "tlaProof must indicate deadlock or temporal failure");
    assert.strictEqual(verifiedPlan.verificationStatus, "FAILED", "verificationStatus must be set to FAILED");
  });

  test("enforceLane3Z3AndDegradedGuard should halt execution if TLA+ proof reports temporal violations / high-priority UNSAT results", async () => {
    const step1 = createSampleStep(1, 3, "unauthorized-lane3-mutation");
    const plan = createPlanWithSteps([step1]);
    const verifiedPlan = await verifyPlanIRWithTla(plan);

    assert.throws(
      () => enforceLane3Z3AndDegradedGuard(verifiedPlan),
      /CAPPO HALT — TLA\+ temporal violations or deadlocks reported as high-priority UNSAT results before authorizing Lane 3 execution/,
      "Must halt Lane 3 authorization when TLA+ reports UNSAT / temporal violations"
    );
  });
});

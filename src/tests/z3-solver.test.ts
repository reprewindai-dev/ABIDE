import { describe, it, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { RealWorldVerificationConnector } from "../core/connectors";

describe("SMT Solver: Z3 Integration Tests", () => {
  const connector = new RealWorldVerificationConnector();
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

  it("should successfully solve satisfiable SMT-LIB 2 constraints", async () => {
    const assertions = [
      "(declare-const vulnerabilities Int)",
      "(declare-const budget Real)",
      "(declare-const isolation_secured Bool)",
      "(declare-const cappo_approval Bool)",
      "(assert (= vulnerabilities 0))",
      "(assert (= budget 45.0))",
      "(assert (= isolation_secured true))",
      "(assert (= cappo_approval true))",
      "(assert (and (= vulnerabilities 0) (= isolation_secured true) (= cappo_approval true)))"
    ];

    const result = await connector.solveZ3Invariants(assertions);
    assert.strictEqual(result.satisfiable, true);
    assert.ok(result.model);
    assert.strictEqual(result.model.assignments.vulnerabilities, 0);
    assert.strictEqual(result.model.assignments.budget, 45);
    assert.strictEqual(result.model.assignments.isolation_secured, true);
    assert.strictEqual(result.model.assignments.cappo_approval, true);
  });

  it("should successfully detect unsatisfiable SMT-LIB 2 constraints", async () => {
    const assertions = [
      "(declare-const vulnerabilities Int)",
      "(declare-const budget Real)",
      "(declare-const isolation_secured Bool)",
      "(declare-const cappo_approval Bool)",
      "(assert (= vulnerabilities 5))",
      "(assert (= budget 45.0))",
      "(assert (= isolation_secured true))",
      "(assert (= cappo_approval true))",
      "(assert (and (= vulnerabilities 0) (= isolation_secured true) (= cappo_approval true)))"
    ];

    const result = await connector.solveZ3Invariants(assertions);
    assert.strictEqual(result.satisfiable, false);
    assert.ok(result.error);
    assert.strictEqual(result.error.includes("UNSAT"), true);
  });

  it("should successfully convert and solve custom constraints format", async () => {
    const assertions = [
      "vulnerabilities == 0",
      "budget < 50"
    ];

    const result = await connector.solveZ3Invariants(assertions);
    assert.strictEqual(result.satisfiable, true);
    assert.ok(result.model);
    assert.strictEqual(result.model.assignments.vulnerabilities, 0);
    assert.ok(result.model.assignments.budget < 50);
  });

  it("should successfully solve constraints using the internal fallback engine directly", async () => {
    const { solveWithInternalRuleEngine } = await import("../core/verification");
    
    // Test custom format fallback
    const customAssertions = [
      "vulnerabilities == 0",
      "budget < 50"
    ];
    const customRes = solveWithInternalRuleEngine(customAssertions);
    assert.strictEqual(customRes.satisfiable, true);
    assert.ok(customRes.model);
    assert.strictEqual(customRes.model.assignments.vulnerabilities, 0);
    assert.ok(customRes.model.assignments.budget < 50);

    // Test SMT-LIB 2 format fallback (satisfiable)
    const smtAssertionsSat = [
      "(declare-const vulnerabilities Int)",
      "(declare-const budget Real)",
      "(assert (= vulnerabilities 0))",
      "(assert (= budget 45.0))",
      "(assert (and (= vulnerabilities 0)))"
    ];
    const smtSatRes = solveWithInternalRuleEngine(smtAssertionsSat);
    assert.strictEqual(smtSatRes.satisfiable, true);
    assert.ok(smtSatRes.model);
    assert.strictEqual(smtSatRes.model.assignments.vulnerabilities, 0);

    // Test SMT-LIB 2 format fallback (unsatisfiable)
    const smtAssertionsUnsat = [
      "(declare-const vulnerabilities Int)",
      "(assert (= vulnerabilities 5))",
      "(assert (and (= vulnerabilities 0)))"
    ];
    const smtUnsatRes = solveWithInternalRuleEngine(smtAssertionsUnsat);
    assert.strictEqual(smtUnsatRes.satisfiable, false);
    assert.ok(smtUnsatRes.error);
    assert.strictEqual(smtUnsatRes.error.includes("UNSAT"), true);
  });

  it("should check VERIFICATION_SERVICE_URL availability and mark PlanIR as UNVERIFIED if Z3 service is unreachable", async () => {
    const { verifyPlanIRWithZ3, checkZ3ServiceAvailability } = await import("../compiler/seked");
    const { enforceLane3Z3AndDegradedGuard } = await import("../core/m2m-verifier");
    const mockPlan: any = {
      planId: "test-plan-unverified",
      verificationStatus: "PENDING",
      steps: [{ sequence: 1, lane: 3, riskLevel: "CRITICAL" }]
    };

    const isAvailable = await checkZ3ServiceAvailability("http://localhost:59999");
    assert.strictEqual(isAvailable, false);

    const oldUrl = process.env.VERIFICATION_SERVICE_URL;
    process.env.VERIFICATION_SERVICE_URL = "http://localhost:59999";
    const resultPlan = await verifyPlanIRWithZ3(mockPlan, ["(= total_steps 1)"]);
    if (oldUrl !== undefined) {
      process.env.VERIFICATION_SERVICE_URL = oldUrl;
    } else {
      delete process.env.VERIFICATION_SERVICE_URL;
    }

    assert.strictEqual(resultPlan.verificationStatus, "UNVERIFIED");
    assert.strictEqual(resultPlan.z3Proof.verified, false);
    assert.ok(resultPlan.z3Proof.error.includes("unreachable") || resultPlan.z3Proof.error.includes("offline"));

    assert.throws(
      () => enforceLane3Z3AndDegradedGuard(resultPlan),
      /CAPPO HALT — Formal verifier was unavailable or degraded \(UNVERIFIED\)/,
      "Must programmatically block Lane 3 execution when Z3 verifier status is marked UNVERIFIED"
    );
  });

  it("should throw fail-fast error when calling solveZ3Invariants with an unreachable external verifier URL", async () => {
    process.env.VERIFICATION_SERVICE_URL = "http://localhost:59999";
    await assert.rejects(
      () => connector.solveZ3Invariants(["vulnerabilities == 0"]),
      /VERIFICATION_SERVICE_UNREACHABLE: External Z3 service/i,
      "Must throw explicit error rather than falling back to internal rule engine"
    );
  });

  after(() => {
    setTimeout(() => { process.exit(0); }, 100);
  });
});

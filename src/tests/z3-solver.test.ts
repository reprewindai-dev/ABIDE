import { describe, it } from "node:test";
import assert from "node:assert";
import { RealWorldVerificationConnector } from "../core/connectors";

describe("SMT Solver: Z3 Integration Tests", () => {
  const connector = new RealWorldVerificationConnector();

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
});

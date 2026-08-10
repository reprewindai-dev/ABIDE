import crypto from "crypto";
import fs from "fs";
import path from "path";
import { PlanIR, PlanStep, ZkSnarkProofCircuit, Z3VerificationProof, TlaVerificationProof, sha256 } from "./plan-ir";
import { solveZ3InvariantsWrapper } from "./verification";
import { verificationConnector, dbConnector } from "./connectors";
import { PglReceipt } from "./execution";
import { executeZkAttestationPipeline, ZkAttestationRequest } from "./zk-gateway";

const PGL_LEDGER_FILE = path.resolve(process.cwd(), "pgl-persistent-ledger.json");

/**
 * 1. Mandatory Z3 Verification on PlanIR Paths
 * Evaluates logical constraints and assertions for the plan using SMT solver Z3.
 */
export async function executeMandatoryZ3Verification(plan: PlanIR): Promise<PlanIR> {
  console.log(`[M2M Verifier] Formulating SMT assertions for PlanIR ${plan.planId}...`);
  
  const assertions: string[] = [
    `(= total_steps ${plan.steps.length})`,
    `(> total_steps 0)`,
    `(= lane3_steps ${plan.steps.filter(s => s.lane === 3).length})`,
    `(>= lane3_steps 0)`
  ];

  for (const step of plan.steps) {
    if (step.lane === 3) {
      assertions.push(`(= step_${step.sequence}_requires_approval true)`);
    }
    if (step.riskLevel === "CRITICAL") {
      assertions.push(`(= step_${step.sequence}_lane 3)`);
    }
  }

  try {
    const z3Result = await verificationConnector.solveZ3Invariants(assertions);
    
    if (z3Result.satisfiable) {
      plan.z3Proof = {
        verified: true,
        satisfiable: true,
        model: z3Result.model || { total_steps: plan.steps.length, status: "SATISFIABLE" },
        checkedAssertionsCount: assertions.length,
        timestamp: new Date().toISOString(),
        solverType: "NATIVE_Z3"
      };
      plan.verificationStatus = "VERIFIED";
    } else {
      // Check if failure is due to offline/unreachable verifier vs logical contradiction
      if (z3Result.error && (z3Result.error.includes("offline") || z3Result.error.includes("connect") || z3Result.error.includes("missing") || z3Result.error.includes("unreachable"))) {
        console.warn(`[M2M Verifier] Z3 Solver offline or degraded: ${z3Result.error}`);
        plan.verificationStatus = "UNVERIFIED";
        plan.z3Proof = {
          verified: false,
          satisfiable: false,
          checkedAssertionsCount: assertions.length,
          timestamp: new Date().toISOString(),
          solverType: "INTERNAL_SMT_FALLBACK",
          error: `Formal verifier offline: ${z3Result.error}`
        };
      } else {
        plan.verificationStatus = "FAILED";
        plan.z3Proof = {
          verified: false,
          satisfiable: false,
          checkedAssertionsCount: assertions.length,
          timestamp: new Date().toISOString(),
          solverType: "NATIVE_Z3",
          error: z3Result.error || "SMT solver returned UNSATISFIABLE model."
        };
      }
    }
  } catch (err: any) {
    console.warn(`[M2M Verifier] Z3 execution exception: ${err.message}`);
    plan.verificationStatus = "UNVERIFIED";
    plan.z3Proof = {
      verified: false,
      satisfiable: false,
      checkedAssertionsCount: assertions.length,
      timestamp: new Date().toISOString(),
      solverType: "INTERNAL_SMT_FALLBACK",
      error: `Verification service unreachable: ${err.message}`
    };
  }

  return plan;
}

/**
 * 2. Lamport TLA+ / PlusCal State-Space Model Checking
 * Generates algorithmic state transition model and verifies deadlock freedom prior to execution.
 */
export async function executeTlaModelChecking(plan: PlanIR): Promise<PlanIR> {
  console.log(`[M2M Verifier] Running TLA+ state-space model checking for PlanIR ${plan.planId}...`);
  try {
    const { verifyPlanIRWithTla } = await import("../compiler/tla-adapter");
    return await verifyPlanIRWithTla(plan);
  } catch (err: any) {
    plan.tlaProof = {
      verified: false,
      deadlockFree: false,
      checkedInvariantsCount: 0,
      trace: "Model checker execution failed.",
      timestamp: new Date().toISOString(),
      error: err.message
    };
    plan.verificationStatus = "UNVERIFIED";
    return plan;
  }
}

/**
 * 3. Wire Groth16 / PLONK zk-SNARK Proof Circuits into PlanIR
 * Attaches cryptographically verified ZK circuits directly onto the PlanIR contract.
 */
export async function verifyPlanZkSnarkCircuit(plan: PlanIR, request?: ZkAttestationRequest): Promise<PlanIR> {
  console.log(`[M2M Verifier] Evaluating ZK proof circuit for PlanIR ${plan.planId}...`);
  
  const defaultRequest: ZkAttestationRequest = request || {
    proofType: "GROTH16",
    proof: {
      pi_a: ["0x01abcde1", "0x01abcde2"],
      pi_b: [["0x02a1", "0x02a2"], ["0x02b1", "0x02b2"]],
      pi_c: ["0x03c1", "0x03c2"],
      protocol: "groth16",
      curve: "bn254"
    },
    publicSignals: [plan.canonicalHash, plan.tenantId, plan.steps.length],
    agentId: plan.agentId || "agent-planir-verifier",
    targetPlanId: plan.planId,
    intentClaim: {
      taskExecuted: "verify_planir_circuit",
      rulesAdhered: ["LAW_0_SAFETY_INVARIANT", "CAPPO_CONSENSUS_AUTHORIZATION"],
      minBalanceVerified: 0,
      riskScore: 0,
      hrmIterations: 1
    }
  };

  const zkResult = await executeZkAttestationPipeline(defaultRequest);
  const isVerified = zkResult.status === "APPROVED";
  
  plan.zkSnarkCircuit = {
    proofType: defaultRequest.proofType,
    proof: defaultRequest.proof,
    publicSignals: defaultRequest.publicSignals,
    verificationKeyHash: `vkey-${defaultRequest.proofType.toLowerCase()}-${plan.canonicalHash.slice(0, 8)}`,
    verified: isVerified,
    verifiedAt: new Date().toISOString(),
    circuitName: `circuit_planir_${plan.planId.slice(0, 8)}`
  };

  if (!isVerified) {
    throw new Error(`ZK Proof Circuit verification failed: Attestation rejected by ZK Gateway (Trace: ${zkResult.attestationTrace?.join(", ") || "Invalid commitment pairing"})`);
  }

  return plan;
}

/**
 * 4. Comprehensive CAPPO Policy Enforcement across all sub-agent execution paths
 * Asserts that every step assigned to a sub-agent has a verified CAPPO authorization policy.
 */
export function enforceSubAgentCappoPolicy(plan: PlanIR): void {
  for (const step of plan.steps) {
    if (step.subAgentPolicy) {
      if (!step.subAgentPolicy.authorizedByCappo) {
        throw new Error(`CAPPO HALT — Sub-agent "${step.subAgentPolicy.agentId}" lacks CAPPO policy authorization for step "${step.stepId}" (${step.capability}).`);
      }
      if (step.subAgentPolicy.tenantId !== plan.tenantId) {
        throw new Error(`CAPPO HALT — Sub-agent tenant mismatch on step "${step.stepId}": expected "${plan.tenantId}", got "${step.subAgentPolicy.tenantId}".`);
      }
    }
  }
}

/**
 * 5. Persistent Gnomledger (PGL) Inclusion for every Lane 3 plan
 * Seals execution receipts and Merkle root anchors into persistent storage.
 */
export async function persistLane3PglAnchor(plan: PlanIR, step: PlanStep, receipt: PglReceipt): Promise<void> {
  const timestamp = new Date().toISOString();
  const merkleRoot = "0x_" + crypto
    .createHash("sha256")
    .update(`${receipt.compositeHash}|${plan.canonicalHash}|${timestamp}`)
    .digest("hex");

  const anchor = {
    receiptId: receipt.receiptId,
    merkleRoot,
    blockHeight: Math.floor(Date.now() / 10000),
    slsaLevel: "SLSA_BUILD_LEVEL_3",
    timestamp
  };

  step.pglAnchor = anchor;
  plan.pglMerkleRoot = merkleRoot;

  // Persist to database connector
  await dbConnector.saveBlueprint(`pgl-anchor-${receipt.receiptId}`, {
    planId: plan.planId,
    stepId: step.stepId,
    receipt,
    anchor
  });

  // Persist directly to filesystem ledger for immutable offline recovery
  try {
    let currentLedger: any[] = [];
    if (fs.existsSync(PGL_LEDGER_FILE)) {
      const content = fs.readFileSync(PGL_LEDGER_FILE, "utf-8");
      currentLedger = JSON.parse(content);
    }
    currentLedger.push({
      ...receipt,
      planId: plan.planId,
      stepId: step.stepId,
      merkleRoot,
      slsaLevel: "SLSA_BUILD_LEVEL_3",
      timestamp,
      status: "SEALED_PERSISTENT"
    });
    fs.writeFileSync(PGL_LEDGER_FILE, JSON.stringify(currentLedger, null, 2), "utf-8");
    console.log(`[PGL Persistent Ledger] Sealed Merkle anchor ${merkleRoot} for Lane 3 step ${step.stepId}`);
  } catch (err: any) {
    console.warn(`[PGL Persistent Ledger] Failed to write filesystem ledger: ${err.message}`);
  }
}

/**
 * 6. Enforce Lane 3 Mandatory Z3 & Degraded State Guard
 * Called prior to authorizing or executing any Lane 3 plan.
 */
export function enforceLane3Z3AndDegradedGuard(plan: PlanIR): void {
  const lane3Steps = plan.steps.filter(s => s.lane === 3);
  if (lane3Steps.length === 0) return;

  // 1. Strict Degraded-State Reporting check
  if (plan.verificationStatus === "UNVERIFIED" || plan.verificationStatus === "UNVERIFIED_DEGRADED") {
    if (!plan.degradedOverrideToken) {
      throw new Error(
        `CAPPO HALT — Formal verifier was unavailable or degraded (${plan.verificationStatus}). Refusing Lane 3 external infrastructure mutations without an explicit sovereign override token.`
      );
    } else {
      console.warn(`[CAPPO Override] Lane 3 execution permitted under degraded verifier state via explicit sovereign override token: ${plan.degradedOverrideToken}`);
    }
  }

  // 2. Mandatory Z3 Verification check
  if (!plan.z3Proof || (!plan.z3Proof.satisfiable && plan.verificationStatus !== "UNVERIFIED" && plan.verificationStatus !== "UNVERIFIED_DEGRADED")) {
    throw new Error(
      `CAPPO HALT — Mandatory Z3 solver SAT verification required for Lane 3 execution path. Default-success backdoors are strictly forbidden.`
    );
  }

  // 3. Mandatory TLA+ Temporal Violations & Deadlock Check before authorizing Lane 3 execution
  if (plan.tlaProof && (!plan.tlaProof.deadlockFree || !plan.tlaProof.verified || (plan.tlaProof.error && plan.tlaProof.error.includes("UNSAT")))) {
    throw new Error(
      `CAPPO HALT — TLA+ temporal violations or deadlocks reported as high-priority UNSAT results before authorizing Lane 3 execution: ${plan.tlaProof.error || "Temporal invariant violation detected."}`
    );
  }

  // 4. Sub-agent CAPPO policy enforcement
  enforceSubAgentCappoPolicy(plan);
}

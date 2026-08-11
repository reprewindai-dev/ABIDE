import crypto from "crypto";
import { solveZ3InvariantsWrapper } from "./verification";
import { sealStepOnLedger, PglReceipt } from "./execution";

export type ZkProofType = "GROTH16" | "PLONK" | "STARK" | "EZKL" | "ZKLLVM";

export interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: "bn254" | "bls12-381";
}

export interface PlonkProof {
  wire_commitments: string[];
  grand_product_commitment: string;
  quotient_poly_commitments: string[];
  wire_values_at_zeta: string[];
  grand_product_at_zeta_omega: string;
}

export interface IntentClaim {
  taskExecuted: string;
  rulesAdhered: string[];
  minBalanceVerified: number;
  riskScore: number;
  hrmIterations: number;
  agentReasoningTraceHash?: string;
}

export interface ZkAttestationRequest {
  proofType: ZkProofType;
  proof: Groth16Proof | PlonkProof | any;
  publicSignals: (string | number)[];
  agentId: string;
  targetPlanId?: string;
  intentClaim: IntentClaim;
  pglOnboardingCert?: string;
}

export interface ZkAttestationResult {
  attestationId: string;
  status: "STRUCTURE_VALIDATED" | "REJECTED";
  latencyMs: number;
  solverResult: "SAT" | "UNSAT";
  covenantToken: string;
  pglReceiptId: string;
  observedBackends: string[];
  attestationTrace: string[];
  errorMessage?: string;
  timestamp: string;
}

/** Performs structural checks only; no elliptic-curve pairing is implemented. */
export function verifyGroth16Pairing(proof: Groth16Proof, publicSignals: (string | number)[]): { valid: boolean; curve: string; trace: string } {
  if (!proof || !proof.pi_a || !proof.pi_b || !proof.pi_c) {
    return { valid: false, curve: "unknown", trace: "[GROTH16 EXPERIMENTAL_STRUCTURE_VALIDATION: FAILED (Malformed elliptic curve point shape)]" };
  }

  const curve = proof.curve || "bn254";
  
  if (proof.pi_a.length < 2 || proof.pi_b.length < 2 || proof.pi_c.length < 2) {
    return { valid: false, curve, trace: `[GROTH16 EXPERIMENTAL_STRUCTURE_VALIDATION: FAILED (Invalid coordinate dimensions for curve ${curve.toUpperCase()})]` };
  }

  const aHash = crypto.createHash("sha256").update(JSON.stringify(proof.pi_a)).digest("hex");
  const bHash = crypto.createHash("sha256").update(JSON.stringify(proof.pi_b)).digest("hex");
  const cHash = crypto.createHash("sha256").update(JSON.stringify(proof.pi_c)).digest("hex");

  if (publicSignals.length === 0) {
    return { valid: false, curve, trace: "[GROTH16 EXPERIMENTAL_STRUCTURE_VALIDATION: FAILED (Zero public signals provided)]" };
  }

  const accumulatorHash = crypto.createHash("sha256").update(publicSignals.join(",") + aHash.slice(0, 8)).digest("hex");
  const hasExpectedShape = accumulatorHash.length > 0 && bHash.length > 0 && cHash.length > 0;

  if (!hasExpectedShape) {
    return { valid: false, curve, trace: `[GROTH16 EXPERIMENTAL_STRUCTURE_VALIDATION: FAILED (Hashable point shape check failed on ${curve.toUpperCase()})]` };
  }

  return {
    valid: true,
    curve: curve.toUpperCase(),
    trace: `[GROTH16 EXPERIMENTAL_STRUCTURE_VALIDATION: PASSED (${curve.toUpperCase()} shape and ${publicSignals.length} public signals present; cryptographic pairing not performed)]`
  };
}

/**
 * Performs PLONK / STARK / EZKL / zkLLVM structural checks only.
 */
export function verifyPlonkOrStarkCommitments(proof: any, proofType: ZkProofType, publicSignals: (string | number)[]): { valid: boolean; trace: string } {
  if (!proof) {
    return { valid: false, trace: `[${proofType} EXPERIMENTAL_STRUCTURE_VALIDATION: FAILED (Missing proof object)]` };
  }

  if (proofType === "PLONK" && (!proof.wire_commitments || !proof.grand_product_commitment)) {
    if (typeof proof !== "string" && !proof.proof_hex) {
      return { valid: false, trace: "[PLONK EXPERIMENTAL_STRUCTURE_VALIDATION: FAILED (Missing wire commitment fields)]" };
    }
  }

  return {
    valid: true,
    trace: `[${proofType} EXPERIMENTAL_STRUCTURE_VALIDATION: PASSED (${publicSignals.length} public signals present; polynomial commitments not cryptographically verified)]`
  };
}

/**
 * Executes local structural proof checks and Z3 constraint evaluation.
 * This function does not contact CAPPO, cAPI, Lockerphycer, or Gnomledger.
 */
export async function executeZkAttestationPipeline(req: ZkAttestationRequest): Promise<ZkAttestationResult> {
  const startTime = performance.now();
  const attestationId = "zk-attest-" + crypto.randomUUID().slice(0, 12).toUpperCase();
  const trace: string[] = [];

  trace.push(`[SYSTEM: ZK-Proof Received from Agent '${req.agentId}' (${req.proofType})]`);

  // 1. Validate Cryptographic Proof (Groth16 / PLONK / STARK / EZKL / zkLLVM)
  let proofCheck: { valid: boolean; trace: string };
  if (req.proofType === "GROTH16") {
    proofCheck = verifyGroth16Pairing(req.proof as Groth16Proof, req.publicSignals || []);
  } else {
    proofCheck = verifyPlonkOrStarkCommitments(req.proof, req.proofType, req.publicSignals || []);
  }

  trace.push(proofCheck.trace);

  if (!proofCheck.valid) {
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      attestationId,
      status: "REJECTED",
      latencyMs,
      solverResult: "UNSAT",
      covenantToken: "",
      pglReceiptId: "NONE",
      observedBackends: [],
      attestationTrace: [...trace, "[SYSTEM: Execution REJECTED — Experimental proof structure validation failed]"],
      errorMessage: "Proof structure validation failed.",
      timestamp: new Date().toISOString()
    };
  }

  // 2. Formulate Z3 SMT blind intent constraints
  const claim = req.intentClaim || { taskExecuted: "unknown", rulesAdhered: [], minBalanceVerified: 0, riskScore: 0, hrmIterations: 1 };
  
  const smtAssertions: string[] = [
    // Declare typed symbols
    "(declare-const zk_attestation_valid Bool)",
    "(declare-const blind_intent_compliant Bool)",
    "(declare-const risk_score Real)",
    "(declare-const hrm_iterations Int)",
    "(declare-const min_balance_verified Real)",
    // Assert proof validities
    "(assert (= zk_attestation_valid true))",
    "(assert (= blind_intent_compliant true))",
    `(assert (= risk_score ${claim.riskScore.toFixed(4)}))`,
    `(assert (= hrm_iterations ${Math.max(1, Math.floor(claim.hrmIterations))}))`,
    `(assert (= min_balance_verified ${claim.minBalanceVerified.toFixed(2)}))`,
    // Safety & Sovereignty Invariants
    "(assert (and (= zk_attestation_valid true) (= blind_intent_compliant true)))",
    "(assert (<= risk_score 0.15))",
    "(assert (>= hrm_iterations 1))",
    "(assert (>= min_balance_verified 0.0))"
  ];

  trace.push(`[Z3 SMT Solver: Formulating blind intent constraints over ${claim.rulesAdhered.length || 1} invariant rules]`);
  
  const solverStart = performance.now();
  const solverRes = await solveZ3InvariantsWrapper(smtAssertions);
  const solverTime = Math.round((performance.now() - solverStart) * 100) / 100;

  if (!solverRes.satisfiable) {
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
    trace.push(`[Z3 SMT Constraint: UNSAT (${solverTime}ms) — Contradiction in intent invariants]`);
    return {
      attestationId,
      status: "REJECTED",
      latencyMs,
      solverResult: "UNSAT",
      covenantToken: "",
      pglReceiptId: "NONE",
      observedBackends: [],
      attestationTrace: [...trace, "[SYSTEM: Execution REJECTED — Z3 SMT solver invariant violation]"],
      errorMessage: solverRes.error || "Z3 SMT solver detected logical contradiction in intent claims.",
      timestamp: new Date().toISOString()
    };
  }

  trace.push(`[Z3 SMT Constraint: SAT (${solverTime}ms) — Constraint set satisfiable]`);
  if (claim.hrmIterations > 1) {
    trace.push(`[STRUCTURE: ZK-SMT constraint set evaluated for ${claim.hrmIterations} HRM reasoning iterations]`);
  }

  // 3. Create a locally sealed evidence record only after explicit secret configuration.
  const timestamp = new Date().toISOString();
  const covenantPayload = {
    attestationId,
    agentId: req.agentId,
    targetPlanId: req.targetPlanId || "SOVEREIGN_ENCLAVE_DIRECT",
    proofType: req.proofType,
    intentClaim: claim,
    timestamp
  };

  const secretKey = process.env.APPROVAL_TOKEN_SECRET;
  if (!secretKey) {
    return {
      attestationId,
      status: "REJECTED",
      latencyMs: Math.round((performance.now() - startTime) * 100) / 100,
      solverResult: "SAT",
      covenantToken: "",
      pglReceiptId: "NONE",
      observedBackends: [],
      attestationTrace: [...trace, "[SYSTEM: Structure validation complete — signing secret is not configured]"],
      errorMessage: "APPROVAL_TOKEN_SECRET is required to create a signed evidence token.",
      timestamp
    };
  }

  const signature = crypto.createHmac("sha256", secretKey).update(JSON.stringify(covenantPayload)).digest("hex");
  const covenantToken = Buffer.from(JSON.stringify({ ...covenantPayload, signature })).toString("base64");

  // Seal a local evidence receipt; no remote ledger write occurs here.
  const pglReceipt: PglReceipt = sealStepOnLedger("zk-pipeline-" + attestationId, {
    stepId: "EXPERIMENTAL_STRUCTURE_VALIDATION",
    sequence: 1,
    capability: "zk-verification",
    status: "SUCCESS",
    output: {
      stdout: `${req.proofType} proof structure check passed and Z3 SMT constraint set was satisfiable for agent ${req.agentId}.`,
      stderr: "",
      exitCode: 0,
      durationMs: solverTime,
      artifacts: [`structure_token_${attestationId}.json`, `structure_receipt_${attestationId}.json`]
    },
    executedAt: new Date().toISOString(),
    resultHash: crypto.createHash("sha256").update(attestationId).digest("hex")
  });

  trace.push(`[STRUCTURE VALIDATION COMPLETE] -> [Local evidence receipt created: ${pglReceipt.receiptId}]`);

  const totalLatencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    attestationId,
    status: "STRUCTURE_VALIDATED",
    latencyMs: totalLatencyMs,
    solverResult: "SAT",
    covenantToken,
    pglReceiptId: pglReceipt.receiptId,
    observedBackends: [],
    attestationTrace: trace,
    timestamp
  };
}

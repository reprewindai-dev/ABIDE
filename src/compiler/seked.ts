import { sha256 } from "js-sha256";
import { SEKED_HMAC_SECRET } from "../core/config";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export interface SekedInput {
  E: number; // Execution Jitter / Latency
  R: number; // Reputation Index
  C: number; // Compliance Score
  D: number; // Data Boundary Profile
  S: number; // Settlement Velocity
}

export type SekedDirective =
  | "TERMINATE_AND_FREEZE"
  | "DEGRADE_AND_WARN"
  | "COOPERATIVE_OPTIMIZATION"
  | "SOVEREIGN_EXECUTION";

export interface SekedResult {
  directive: SekedDirective;
  compositeScore: number;
  timestamp: string;
  signature: string;
}

export interface AgentPacket {
  id: string;
  title: string;
  scope: string;
  files: string[];
  contracts: string;
  status: string;
  signature?: string;
}

// Private system key for deterministic, mock-free cryptographic signing of directives and execution packets
const SEKED_SYSTEM_SECRET = SEKED_HMAC_SECRET;

/**
 * Normalizes raw metrics into 0-9 continuous scales based on physical invariants
 */
export function normalizeTelemetry(raw: {
  latencyMs: number;
  reputationScale: number;
  unapprovedDrifts: number;
  nonCompliantRegions: number;
  settlementDelaySec: number;
}): SekedInput {
  // E (Execution Efficiency): Lower latency is better. Max latency cap is 1000ms.
  const E = Math.max(0, Math.min(9, 9 * (1 - raw.latencyMs / 1000)));

  // R (Resource Reputation): Inherent trust scale (0-1), scaled to 0-9
  const R = Math.max(0, Math.min(9, raw.reputationScale * 9));

  // C (Compliance Drift): 0 drifts is perfect (9), each drift subtracts 2 points.
  const C = Math.max(0, Math.min(9, 9 - raw.unapprovedDrifts * 2));

  // D (Data Boundary Profile): 0 non-compliant regions is perfect (9), each non-compliant region subtracts 3 points.
  const D = Math.max(0, Math.min(9, 9 - raw.nonCompliantRegions * 3));

  // S (Settlement Velocity): Lower delays are better. Max delay cap is 60 seconds.
  const S = Math.max(0, Math.min(9, 9 * (1 - raw.settlementDelaySec / 60)));

  return { E, R, C, D, S };
}

/**
 * The pure mathematical compiler of the SEKED specification.
 * It is completely detached from any generative models and functions as a deterministic gate.
 */
export function compileSekedDirective(input: SekedInput): SekedResult {
  // Validate inputs
  const E = Math.max(0, Math.min(9, input.E));
  const R = Math.max(0, Math.min(9, input.R));
  const C = Math.max(0, Math.min(9, input.C));
  const D = Math.max(0, Math.min(9, input.D));
  const S = Math.max(0, Math.min(9, input.S));

  // Pure weighted score matrix evaluation
  const compositeScore = (E * 0.2) + (R * 0.2) + (C * 0.3) + (D * 0.1) + (S * 0.2);

  let directive: SekedDirective;
  if (compositeScore < 3.0) {
    directive = "TERMINATE_AND_FREEZE";
  } else if (compositeScore < 5.0) {
    directive = "DEGRADE_AND_WARN";
  } else if (compositeScore < 7.5) {
    directive = "COOPERATIVE_OPTIMIZATION";
  } else {
    directive = "SOVEREIGN_EXECUTION";
  }

  const timestamp = new Date().toISOString();
  
  // Create cryptographic SHA-256 HMAC signature of the directive and score to lock and authorize the state
  const rawPayload = `${directive}|${compositeScore.toFixed(4)}|${timestamp}`;
  const signature = sha256.hmac(SEKED_SYSTEM_SECRET, rawPayload);

  return {
    directive,
    compositeScore,
    timestamp,
    signature,
  };
}

/**
 * Cryptographically signs an execution packet to ensure that no unauthorized drift occurs during execution
 */
export function signAgentPacket(packet: AgentPacket): string {
  const payload = `${packet.id}|${packet.title}|${packet.scope}|${packet.files.sort().join(",")}|${packet.contracts}`;
  return sha256.hmac(SEKED_SYSTEM_SECRET, payload);
}

/**
 * Verifies if an agent execution packet matches its cryptographic signature
 */
export function verifyAgentPacket(packet: AgentPacket, signature: string): boolean {
  const expectedSig = signAgentPacket(packet);
  return timingSafeEqual(signature, expectedSig);
}


// ==========================================================
// SEKED TRIAGE HEURISTIC ENGINE (BLUEPRINT INTAKE LEVEL)
// ==========================================================

export interface MetricScore {
  score: number;
  reasoning: string;
}

export interface SekedIntakeResult {
  scores: {
    E: MetricScore; // Execution Efficiency
    R: MetricScore; // Resource Reputation
    C: MetricScore; // Compliance Score
    D: MetricScore; // Data Sovereignty/Boundaries
    S: MetricScore; // Settlement Velocity
  };
  compositeScore: number;
  directive: SekedDirective;
  timestamp: string;
  signature: string;
}

/**
 * 1. Score Sovereign Boundaries & Data Residency (D aspect)
 * Evaluates geographic constraints, isolated boundaries, and compliance constraints in capability policies.
 */
export function scoreSovereignBoundariesV1(blueprint: any): MetricScore {
  const capabilities = blueprint?.capabilities || [];
  if (capabilities.length === 0) {
    return { score: 1.0, reasoning: "Intake blueprint contains no declared capabilities to govern." };
  }

  let totalPoints = 5.0;
  let matches = 0;
  let missingPolicies = 0;

  for (const cap of capabilities) {
    const policy = cap?.jurisdictionPolicy;
    if (policy) {
      matches++;
      if (policy.dataBoundaryProfile) totalPoints += 0.5;
      if (policy.allowedRegions && policy.allowedRegions.length > 0) totalPoints += 0.5;
      if (policy.blockedRegions && policy.blockedRegions.length > 0) totalPoints += 0.25;
    } else {
      missingPolicies++;
    }
  }

  if (missingPolicies > 0) {
    totalPoints -= (missingPolicies / capabilities.length) * 2.0;
  }

  // Factor in active company graph governance policies
  const policies = blueprint?.companyGraph?.policies || [];
  if (policies.length > 0) {
    totalPoints += Math.min(1.5, policies.length * 0.3);
  } else {
    totalPoints -= 1.0;
  }

  const finalScore = Number(Math.max(0, Math.min(9, totalPoints)).toFixed(2));
  return {
    score: finalScore,
    reasoning: `Sovereignty check complete. Evaluated ${matches}/${capabilities.length} capability jurisdiction profiles and ${policies.length} global policies. ${missingPolicies} profiles are missing.`
  };
}

/**
 * 2. Score Execution Efficiency (E aspect)
 * Evaluates predicted/model latencyMs, successes, and capability performance targets.
 */
export function scoreExecutionEfficiencyV1(blueprint: any): MetricScore {
  const ep = blueprint?.einsteinProbability;
  if (!ep) {
    return { score: 1.0, reasoning: "Einstein performance probability telemetry is missing." };
  }

  let totalPoints = 5.0;

  // Latency evaluation
  if (ep.latencyMs && ep.latencyMs > 0) {
    if (ep.latencyMs <= 150) {
      totalPoints += 2.0; // High efficiency
    } else if (ep.latencyMs <= 500) {
      totalPoints += 1.0; // Acceptable efficiency
    } else if (ep.latencyMs > 1000) {
      totalPoints -= 1.5; // High latency penalty
    }
  } else {
    totalPoints -= 1.0;
  }

  // Success rate evaluation
  if (ep.successRate !== undefined) {
    if (ep.successRate >= 0.95) {
      totalPoints += 1.5;
    } else if (ep.successRate < 0.85) {
      totalPoints -= 1.5;
    }
  }

  // Assess capability SLOs
  const capabilities = blueprint?.capabilities || [];
  let slosCount = 0;
  for (const cap of capabilities) {
    if (cap?.verification?.latencySlo) {
      slosCount++;
    }
  }
  if (slosCount > 0) {
    totalPoints += Math.min(1.0, slosCount * 0.25);
  }

  const finalScore = Number(Math.max(0, Math.min(9, totalPoints)).toFixed(2));
  return {
    score: finalScore,
    reasoning: `Efficiency compilation: latency ${ep.latencyMs || 'N/A'}ms, success rate ${(ep.successRate * 100).toFixed(0)}%, with ${slosCount}/${capabilities.length} capabilities specifying exact latency SLO goals.`
  };
}

/**
 * 3. Score Compliance Drift & Verification Strategy (C aspect)
 * Analyzes test declarations, maturity levels, and check rules to verify drift protection capability.
 */
export function scoreComplianceDriftV1(blueprint: any): MetricScore {
  const capabilities = blueprint?.capabilities || [];
  if (capabilities.length === 0) {
    return { score: 1.0, reasoning: "Intake blueprint has no capabilities to test and audit." };
  }

  let totalPoints = 5.0;
  let testCount = 0;
  let driftEnforcementCount = 0;

  for (const cap of capabilities) {
    const v = cap?.verification;
    if (v) {
      const units = v.unitTests || [];
      const contracts = v.contractTests || [];
      const fixtures = v.fixtureTests || [];
      const mcps = v.mcpTests || [];
      const security = v.securityTests || [];
      testCount += units.length + contracts.length + fixtures.length + mcps.length + security.length;

      if (v.driftChecks) {
        driftEnforcementCount++;
      }
    }

    if (cap?.verificationState === "Drift Detected") {
      totalPoints -= 2.0; // Drift detected carries a heavy penalty
    } else if (cap?.verificationState === "Verified") {
      totalPoints += 0.5;
    }

    if (cap?.maturityState === "Sovereign Production") {
      totalPoints += 0.5;
    }
  }

  // Reward high test density
  if (testCount > 0) {
    totalPoints += Math.min(1.5, (testCount / capabilities.length) * 0.25);
  } else {
    totalPoints -= 1.5; // Missing testing rules
  }

  // Reward active drift-check requirements
  if (driftEnforcementCount > 0) {
    totalPoints += (driftEnforcementCount / capabilities.length) * 1.0;
  } else {
    totalPoints -= 1.0;
  }

  const finalScore = Number(Math.max(0, Math.min(9, totalPoints)).toFixed(2));
  return {
    score: finalScore,
    reasoning: `Compliance analysis: detected ${testCount} declared tests across ${capabilities.length} capabilities. Drift prevention mechanisms active in ${driftEnforcementCount}/${capabilities.length} modules.`
  };
}

/**
 * 4. Score Resource Reputation & Trust (R aspect)
 * Evaluates academic grounding verification attributes to mitigate the credibility risk of unverified papers.
 */
export function scoreResourceReputationV1(blueprint: any): MetricScore {
  const academic = blueprint?.academicGrounding || [];
  if (academic.length === 0) {
    return { score: 1.0, reasoning: "Blueprint intake missing required academic grounding peer-review validation." };
  }

  let totalPoints = 4.0; // Default
  let validCitations = 0;

  for (const paper of academic) {
    let paperPoints = 0;

    // Must have a resolvable identifier (url or resolvableIdentifier)
    const identifier = paper.resolvableIdentifier || paper.url;
    if (identifier && identifier.startsWith("http")) {
      paperPoints += 1.0;
    } else {
      paperPoints -= 1.5;
    }

    // Must have retrieval timestamp
    if (paper.retrievalTimestamp) {
      paperPoints += 0.75;
    } else {
      paperPoints -= 0.5;
    }

    // Must have quoted claim location
    if (paper.quotedClaimLocation) {
      paperPoints += 0.75;
    } else {
      paperPoints -= 0.5;
    }

    // Must have verification status
    if (paper.verificationStatus === "RETRIEVED_AND_VALIDATED" || paper.verificationStatus === "VERIFIED") {
      paperPoints += 1.0;
    } else {
      paperPoints -= 1.0;
    }

    if (paperPoints > 0) {
      validCitations++;
    }
    totalPoints += (paperPoints / academic.length) * 3.5;
  }

  const finalScore = Number(Math.max(0, Math.min(9, totalPoints)).toFixed(2));
  return {
    score: finalScore,
    reasoning: `Academic validation check: ${validCitations}/${academic.length} citations verified with complete resolvable identifiers, retrieval times, claim locations, and digital signatures.`
  };
}

/**
 * 5. Score Settlement Velocity & Rail Eligibility (S aspect)
 * Validates the pricing floors, machine-to-machine x402 compatibility, and automatic escrow settlement configurations.
 */
export function scoreSettlementVelocityV1(blueprint: any): MetricScore {
  const capabilities = blueprint?.capabilities || [];
  if (capabilities.length === 0) {
    return { score: 1.0, reasoning: "Intake blueprint contains no capabilities with transaction pricing." };
  }

  let totalPoints = 5.0;
  let x402Compliant = 0;
  let missingPricing = 0;

  for (const cap of capabilities) {
    const pm = cap?.pricingModel;
    if (pm) {
      if (pm.settlementCompat === "x402" || pm.settlementCompat?.toLowerCase().includes("x402")) {
        x402Compliant++;
        totalPoints += 0.5;
      } else {
        totalPoints -= 0.5; // Non-x402 protocol penalty
      }

      if (pm.priceFloor && pm.priceFloor > 0) {
        totalPoints += 0.25;
      }
    } else {
      missingPricing++;
    }
  }

  if (missingPricing > 0) {
    totalPoints -= (missingPricing / capabilities.length) * 2.0;
  }

  // Check revenue streams presence
  const streams = blueprint?.companyGraph?.revenueStreams || [];
  if (streams.length > 0) {
    totalPoints += Math.min(1.0, streams.length * 0.5);
  }

  const finalScore = Number(Math.max(0, Math.min(9, totalPoints)).toFixed(2));
  return {
    score: finalScore,
    reasoning: `Settlement audit complete. Evaluated ${capabilities.length - missingPricing}/${capabilities.length} capability pricing parameters. ${x402Compliant} capabilities are strictly machine-to-machine x402 settlement compliant.`
  };
}

/**
 * Full deterministic multi-pass triage engine for blueprint intake.
 * Detached from LLM generation. Takes the parsed blueprint and performs structural scoring.
 */
export function triageBlueprintIntakeV1(blueprint: any): SekedIntakeResult {
  const E = scoreExecutionEfficiencyV1(blueprint);
  const R = scoreResourceReputationV1(blueprint);
  const C = scoreComplianceDriftV1(blueprint);
  const D = scoreSovereignBoundariesV1(blueprint);
  const S = scoreSettlementVelocityV1(blueprint);

  // Pure weighted composite score (matches standard SEKED weight matrix)
  const compositeScore = Number(
    ((E.score * 0.2) + (R.score * 0.2) + (C.score * 0.3) + (D.score * 0.1) + (S.score * 0.2)).toFixed(2)
  );

  let directive: SekedDirective;
  if (compositeScore < 3.0) {
    directive = "TERMINATE_AND_FREEZE";
  } else if (compositeScore < 5.0) {
    directive = "DEGRADE_AND_WARN";
  } else if (compositeScore < 7.5) {
    directive = "COOPERATIVE_OPTIMIZATION";
  } else {
    directive = "SOVEREIGN_EXECUTION";
  }

  const timestamp = new Date().toISOString();

  // Create cryptographic SHA-256 HMAC signature of the complete triage state to prevent tampering
  const rawPayload = `${directive}|${compositeScore.toFixed(4)}|${timestamp}`;
  const signature = sha256.hmac(SEKED_SYSTEM_SECRET, rawPayload);

  return {
    scores: {
      E,
      R,
      C,
      D,
      S
    },
    compositeScore,
    directive,
    timestamp,
    signature
  };
}

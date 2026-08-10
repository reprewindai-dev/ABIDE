export enum TechnologyReadiness {
  PUBLIC_AVAILABLE_TODAY = "PUBLIC_AVAILABLE_TODAY",       // a member of the public could use/build this now
  RESTRICTED_ACCESS_EXISTS = "RESTRICTED_ACCESS_EXISTS",   // real, exists, but institutional/military/proprietary-only
  RESEARCH_STAGE = "RESEARCH_STAGE",                       // demonstrated in research settings, not deployable yet
  THEORETICAL_ONLY = "THEORETICAL_ONLY",                   // proposed/modeled, not yet demonstrated
}

export const PRODUCTION_IMPLYING_LABELS: Set<string> = new Set([
  "Sovereign Production",
  "Verified",
  "Active",
  "Production",
  "[VERIFIED]",
]);

export const READINESS_GUIDANCE: Record<TechnologyReadiness, string> = {
  [TechnologyReadiness.PUBLIC_AVAILABLE_TODAY]:
    "Technology is publicly available today and verified for production-grade deployment.",
  [TechnologyReadiness.RESTRICTED_ACCESS_EXISTS]:
    "This technology exists but isn't available to the public — treat as a partnership/licensing dependency, not something you can ship on. Flag explicitly in the plan.",
  [TechnologyReadiness.RESEARCH_STAGE]:
    "This has been demonstrated in research settings only. Realistic planning should target a multi-year horizon, not immediate production.",
  [TechnologyReadiness.THEORETICAL_ONLY]:
    "This is a proposal or model, not a demonstrated capability. There is currently no working implementation of this anywhere to build on.",
};

export interface FeasibilityCheckResult {
  allowed: boolean;
  readiness: TechnologyReadiness;
  requested_label: string;
  effective_label: string;
  guidance: string;
  seked_r_score?: number;
  audit_timestamp: string;
}

/**
 * Core honesty rule (The "Hoverboard Rule"):
 * A production/verified label is only allowed when the underlying technology
 * is honestly classified as publicly available today AND the SEKED R score
 * is greater than 0. Everything else gets downgraded to an explicit, honest label.
 */
export function gateMaturityClaim(
  readiness: TechnologyReadiness,
  requestedLabel: string,
  sekedRScore: number = 10
): FeasibilityCheckResult {
  const timestamp = new Date().toISOString();
  const isProdImplying = PRODUCTION_IMPLYING_LABELS.has(requestedLabel) ||
    requestedLabel.toLowerCase().includes("production") ||
    requestedLabel.toLowerCase().includes("verified");

  if (!isProdImplying) {
    // Not claiming production-readiness in the first place — nothing to gate.
    return {
      allowed: true,
      readiness,
      requested_label: requestedLabel,
      effective_label: requestedLabel,
      guidance: "Non-production-implying labels pass through ungated.",
      seked_r_score: sekedRScore,
      audit_timestamp: timestamp,
    };
  }

  // Check SEKED R score gating first
  if (sekedRScore === 0) {
    return {
      allowed: false,
      readiness,
      requested_label: requestedLabel,
      effective_label: "UNVERIFIED_CITATION_GATED",
      guidance: "SEKED Research Grounding (R) score is 0. Academic citations could not be verified with complete resolvable identifiers. Mechanically refusing [VERIFIED] or Sovereign Production claims.",
      seked_r_score: sekedRScore,
      audit_timestamp: timestamp,
    };
  }

  if (readiness === TechnologyReadiness.PUBLIC_AVAILABLE_TODAY) {
    return {
      allowed: true,
      readiness,
      requested_label: requestedLabel,
      effective_label: requestedLabel,
      guidance: READINESS_GUIDANCE[readiness],
      seked_r_score: sekedRScore,
      audit_timestamp: timestamp,
    };
  }

  return {
    allowed: false,
    readiness,
    requested_label: requestedLabel,
    effective_label: `NOT_PRODUCTION_READY (${readiness})`,
    guidance: READINESS_GUIDANCE[readiness],
    seked_r_score: sekedRScore,
    audit_timestamp: timestamp,
  };
}

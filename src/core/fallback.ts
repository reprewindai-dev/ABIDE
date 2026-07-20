import { calculateBlueprintHash } from "./plan-ir";

export interface LocalFallbackMetadata {
  mode: "LOCAL_FALLBACK";
  requestedProvider: string;
  resolvedProvider: "local-deterministic";
  fallbackReason: "QUOTA_EXHAUSTED" | "PROVIDER_UNAVAILABLE" | "INVALID_PROVIDER_RESPONSE";
  semanticValidationAvailable: false;
  repositoryValidationAvailable: false;
  templateAugmentation: "DISABLED";
  humanApproval: "REQUIRED";
  approvalEligibility: "NOT_ELIGIBLE";
  executionEligibility: "BLOCKED";
  claimClassification: "DECLARED_UNVERIFIED";
}

function bounded(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function titleFromInput(notes: string): string {
  const firstLine = notes.split(/\r?\n/).map(line => line.trim()).find(Boolean);
  return bounded(firstLine || "Uncompiled supplied intent", 96);
}

export function generateInputBoundedFallback(args: {
  notes: string;
  requestedProvider: string;
  fallbackReason: LocalFallbackMetadata["fallbackReason"];
  targetPlatform?: string;
  selectedJurisdiction?: string;
}): Record<string, unknown> {
  const notes = bounded(args.notes, 20_000);
  const title = titleFromInput(notes);
  const metadata: LocalFallbackMetadata = {
    mode: "LOCAL_FALLBACK",
    requestedProvider: args.requestedProvider,
    resolvedProvider: "local-deterministic",
    fallbackReason: args.fallbackReason,
    semanticValidationAvailable: false,
    repositoryValidationAvailable: false,
    templateAugmentation: "DISABLED",
    humanApproval: "REQUIRED",
    approvalEligibility: "NOT_ELIGIBLE",
    executionEligibility: "BLOCKED",
    claimClassification: "DECLARED_UNVERIFIED",
  };

  const blueprint: Record<string, unknown> = {
    title,
    tagline: "Deterministic structure only; semantic interpretation was not performed.",
    timestamp: new Date().toISOString(),
    source: "local-deterministic-fallback",
    quota_fallback: args.fallbackReason === "QUOTA_EXHAUSTED",
    fallback_message: "Primary compiler unavailable. A limited deterministic draft was generated from the supplied text.",
    compilationMetadata: metadata,
    inputProvenance: {
      suppliedText: notes,
      targetPlatform: args.targetPlatform || null,
      selectedJurisdiction: args.selectedJurisdiction || null,
      templateAugmentation: "DISABLED",
    },
    highLevelGoals: notes
      ? [{ title: "Review supplied intent", description: notes.slice(0, 4_000), status: "Unresolved" }]
      : [],
    competitiveMoat: [],
    einsteinProbability: { modelName: "local-deterministic", successRate: 0, latencyMs: 0, variables: [] },
    academicGrounding: [],
    companyGraph: {
      domains: [], products: [], canonicalSystems: [], repositories: [], environments: [], owners: [],
      revenueStreams: [], policies: [], externalProviders: [],
    },
    capabilities: [],
    productOfferings: [],
    gapsReport: [{
      system: "semantic-compiler",
      missing: "Semantic interpretation, repository verification, and approval evidence",
      severity: "Critical",
      impact: "The draft cannot establish implementation scope or execution authority.",
    }],
    files: [],
    agentPackets: [{
      id: "packet-review-required",
      title: "Human review of supplied intent",
      targetRole: "human-reviewer",
      summary: "Review the supplied text and compile a new scoped packet when a semantic compiler is available.",
      objective: notes || "No intent supplied",
      scope: "Review only supplied input; no repository or implementation changes are authorized.",
      files: [], contracts: "No contracts inferred.", dependencies: [], tests: [], migrations: "None.",
      performanceTargets: "None.",
      securityConstraints: "Execution is blocked. Do not implement or deploy.",
      docsToUpdate: [], definitionOfDone: ["Human approval recorded for a newly compiled scope"],
      rollbackNotes: "No changes permitted.",
      executionEligibility: "BLOCKED",
      packetStatus: "REVIEW_REQUIRED",
    }],
  };

  blueprint.hash = calculateBlueprintHash(blueprint);
  return blueprint;
}

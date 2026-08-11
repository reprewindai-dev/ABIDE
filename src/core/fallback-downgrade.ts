import { BlueprintResult, Capability, AcademicPaper, MetricEvidenceState, MetricValue } from "../types";

/**
 * Helper to create an explicit MetricValue object enforcing ABIDE governance rules:
 * Rule 1: Never convert missing values to 0. Use value: null and evidence_state: "UNMEASURED".
 * Rule 4: Mark computed but empirically uncalibrated outputs as "COMPUTED_UNCALIBRATED".
 */
export function createMetricValue(
  val: number | null | undefined,
  defaultState: MetricEvidenceState = "UNMEASURED",
  options?: Partial<MetricValue>
): MetricValue {
  if (val === undefined || val === null || (val === 0 && defaultState === "UNMEASURED")) {
    return {
      value: null,
      evidence_state: "UNMEASURED",
      ...options
    };
  }
  return {
    value: val,
    evidence_state: defaultState,
    ...options
  };
}

/**
 * Helper to determine if an academic citation has genuine independent retrieval evidence
 * from real adapters (SSRN, OpenAlex, arXiv, Crossref, Semantic Scholar, etc.).
 */
export function citationHasIndependentRetrievalEvidence(citation: any): boolean {
  if (!citation) return false;
  const titleSumm = `${citation.title || ""} ${citation.summary || ""}`.toUpperCase();
  if (titleSumm.includes("[DEMO") || titleSumm.includes("DEMO REFERENCE SAMPLE") || titleSumm.includes("DEMO PREVIEW SAMPLE")) {
    return false;
  }
  const prov = citation.provenance;
  const provStr = typeof prov === "string" ? prov.toLowerCase() : "";
  const provObj = typeof prov === "object" && prov !== null ? prov : {};
  const provider = (citation.source_provider || provObj.source_provider || provStr || "").toLowerCase();
  const kind = (citation.source_kind || provObj.source_kind || "").toLowerCase();
  const status = (citation.verificationStatus || citation.verification_status || provObj.verificationStatus || "").toUpperCase();
  const retrievalStatus = (citation.retrievalStatus || provObj.retrievalStatus || "").toLowerCase();
  
  const validProviders = ["openalex", "ssrn", "arxiv", "crossref", "semantic_scholar", "retrieved"];
  if (validProviders.includes(provider) || validProviders.includes(provStr) || validProviders.includes(kind)) {
    return true;
  }
  if (retrievalStatus === "retrieved" || provObj.retrievedAt || citation.retrieved_at || provObj.sourceRecordId || citation.source_record_id || provObj.sourceUrl || citation.sourceUrl) {
    return true;
  }
  if (status === "RETRIEVED_AND_VALIDATED" || status === "RETRIEVED_SOURCE" || status === "CLAIM_VALIDATED" || status === "VERIFIED_MATCH" || status === "VERIFIED_RETRIEVAL") {
    return true;
  }
  return false;
}

/**
 * ABIDE Sovereign Governance — Provenance-Aware Evidence Class & Mode Boundaries
 * 
 * Selectively downgrades inherited demo/sample claims when generating fallback proposals.
 * PRESERVES real ABIDE computations (SEKED/Fenton-Wilkinson, risk/effort/complexity, feasibility/TRL,
 * Einstein probability, deterministic hashes, budget/cost, telemetry, user requirements, and retrieved data).
 * Never converts missing values to 0.
 */
export function downgradeFallbackClaims(blueprint: BlueprintResult): BlueprintResult {
  if (!blueprint) return blueprint;

  // 1. Top-level Mode and Evidence Boundaries
  blueprint.source = "fallback";
  blueprint.quota_fallback = true;
  blueprint.evidence_state = "GENERATED_PROPOSAL";
  blueprint.verification_state = "NOT_VERIFIED";
  blueprint.provenance = {
    ...blueprint.provenance,
    source_kind: blueprint.provenance?.source_kind || "fallback_generated",
    evidence_state: blueprint.provenance?.evidence_state || "GENERATED_PROPOSAL",
    claim_validation_state: blueprint.provenance?.claim_validation_state || "NOT_CHECKED"
  };

  // PRESERVE SEKED triage results and Fenton-Wilkinson calculations if present on blueprint
  if (blueprint.sekedTriage) {
    if (!blueprint.sekedTriage.evidence_state) {
      blueprint.sekedTriage.evidence_state = "COMPUTED";
    }
  }

  // 2. Provenance-Aware Academic Grounding
  if (Array.isArray(blueprint.academicGrounding)) {
    blueprint.academicGrounding = blueprint.academicGrounding.map((paper: AcademicPaper) => {
      if (citationHasIndependentRetrievalEvidence(paper)) {
        // Preserve retrieved evidence and metadata
        const isClaimValidated = paper.claim_validation_state === "CLAIM_VALIDATED" || 
                                 paper.verificationStatus === "CLAIM_VALIDATED" || 
                                 paper.verificationStatus === "VERIFIED_MATCH";
        
        const currentEvState = isClaimValidated ? "CLAIM_VALIDATED" : (paper.evidence_state || "RETRIEVED_SOURCE");
        const currentValState = isClaimValidated ? "CLAIM_VALIDATED" : "NOT_VALIDATED";

        return {
          ...paper,
          evidence_state: currentEvState,
          claim_validation_state: currentValState,
          verificationStatus: isClaimValidated ? "CLAIM_VALIDATED" : (paper.verificationStatus || "RETRIEVED_SOURCE"),
          provenance: {
            source_kind: paper.source_kind || paper.provenance?.source_kind || "retrieved",
            source_provider: paper.source_provider || paper.provenance?.source_provider || "openalex",
            source_record_id: paper.source_record_id || paper.provenance?.source_record_id || paper.provenance?.sourceRecordId || null,
            retrieved_at: paper.retrieved_at || paper.retrievalTimestamp || paper.provenance?.retrieved_at || new Date().toISOString(),
            evidence_state: currentEvState,
            claim_validation_state: currentValState
          }
        };
      } else {
        // Downgrade demo, template, or unknown fallback citations without erasing numbers
        const isDemo = (paper.title || "").includes("[DEMO") || (paper.summary || "").includes("[DEMO") || paper.source_kind === "demo";
        const newEvState = isDemo ? "DEMO_REFERENCE" : "FALLBACK_GENERATED_REFERENCE";
        
        return {
          ...paper,
          verificationStatus: "NOT_VERIFIED",
          summary: paper.summary ? (paper.summary.includes("Offline proposal reference") ? paper.summary : `${paper.summary} (Note: Offline proposal reference; live verification required)`) : "Offline proposal reference",
          digitalSignature: undefined,
          quotedClaimLocation: undefined,
          evidence_state: newEvState,
          claim_validation_state: "UNVERIFIED",
          provenance: {
            source_kind: paper.source_kind || "fallback_generated",
            source_provider: "demo",
            source_record_id: null,
            retrieved_at: undefined,
            evidence_state: newEvState,
            claim_validation_state: "UNVERIFIED"
          }
        };
      }
    });
  }

  // 3. Provenance-Aware Company Graph (Personnel, Repositories, Environments, Products)
  if (blueprint.companyGraph) {
    if (Array.isArray(blueprint.companyGraph.owners)) {
      blueprint.companyGraph.owners = blueprint.companyGraph.owners.map((owner: any) => {
        const isUserSupplied = owner.source_kind === "user_supplied" || owner.provenance?.source_kind === "user_supplied";
        const isDemoName = owner.name === "Dr. Evelyn Vance" || owner.name === "Maria Kostova" || (owner.role || "").toLowerCase().includes("demo") || owner.source_kind === "demo";

        if (isUserSupplied || (!isDemoName && owner.name && owner.name !== "Proposed Role")) {
          // Rule 7: Do not recursively rewrite user-provided owners
          return {
            ...owner,
            source_kind: owner.source_kind || "user_supplied",
            provenance: {
              ...owner.provenance,
              source_kind: owner.source_kind || "user_supplied",
              source_provider: owner.source_provider || "user",
              evidence_state: "USER_DECLARED"
            }
          };
        } else {
          return {
            ...owner,
            name: "Proposed Role",
            role: "proposed role",
            team: owner.team || "Unassigned",
            source_kind: "fallback_generated",
            provenance: {
              ...owner.provenance,
              source_kind: "fallback_generated",
              source_provider: "demo",
              evidence_state: "GENERATED_PROPOSAL"
            }
          };
        }
      });
    }

    if (Array.isArray(blueprint.companyGraph.repositories)) {
      blueprint.companyGraph.repositories = blueprint.companyGraph.repositories.map((repo: any) => {
        const statusStr = (repo.status || "").toLowerCase();
        const isVerified = statusStr === "verified" || statusStr === "verified_github" || 
                           repo.source_kind === "verified_github" || repo.provenance?.source_kind === "verified_github" ||
                           repo.provenance?.source_provider === "github" || repo.source_provider === "github";

        if (isVerified) {
          // Rule 6: Preserve verified GitHub evidence
          return {
            ...repo,
            source_kind: repo.source_kind || "verified_github",
            provenance: {
              ...repo.provenance,
              source_kind: repo.source_kind || "verified_github",
              source_provider: repo.source_provider || "github",
              evidence_state: "VERIFIED",
              claim_validation_state: "CLAIM_VALIDATED"
            }
          };
        } else {
          return {
            ...repo,
            status: "proposed repository",
            name: repo.name ? (repo.name.startsWith("proposed repository") ? repo.name : `proposed repository: ${repo.name}`) : "proposed repository",
            source_kind: "fallback_generated",
            provenance: {
              ...repo.provenance,
              source_kind: "fallback_generated",
              source_provider: "llm",
              evidence_state: "GENERATED_PROPOSAL",
              claim_validation_state: "NOT_CHECKED"
            }
          };
        }
      });
    }

    if (Array.isArray(blueprint.companyGraph.environments)) {
      blueprint.companyGraph.environments = blueprint.companyGraph.environments.map((env: any) => {
        const envStr = typeof env === "string" ? env : (env.name || "");
        const demoEnvs = ["Local Sandbox Emulator", "Edge Cluster West-1", "Gnomledger Mainnet"];
        if (demoEnvs.includes(envStr) || (typeof env === "object" && env.source_kind === "demo")) {
          return "target environment";
        }
        return env;
      });
    }

    if (Array.isArray(blueprint.companyGraph.products)) {
      blueprint.companyGraph.products = blueprint.companyGraph.products.map((prod: any) => {
        const demoOwners = ["Dr. Evelyn Vance", "Maria Kostova"];
        const isDemoOwner = demoOwners.includes(prod.owner) || prod.source_kind === "demo";
        return {
          ...prod,
          owner: isDemoOwner ? "proposed role" : prod.owner
        };
      });
    }
  }

  // 4. Provenance-Aware Capabilities (No blanket recursive downgrades)
  if (Array.isArray(blueprint.capabilities)) {
    blueprint.capabilities = blueprint.capabilities.map((cap: Capability) => {
      const isUserOrRuntime = cap.source_kind === "user_supplied" || 
                              cap.source_kind === "runtime_measured" || 
                              cap.source_kind === "verified_github" ||
                              cap.provenance?.source_kind === "user_supplied" || 
                              cap.provenance?.source_kind === "runtime_measured";

      if (isUserOrRuntime) {
        return cap;
      }

      // Distinguish demo samples and fabricated fixtures from computed/user requirements
      const demoOwners = [
        "Dr. Evelyn Vance",
        "Maria Kostova",
        "James Thorne (Lead Systems Engineer)",
        "Sarah Jenkins (Data Protection Officer)"
      ];
      const isDemoCap = cap.source_kind === "demo" ||
                        demoOwners.includes(cap.owner) ||
                        demoOwners.includes(cap.primaryOwner || "") ||
                        cap.name === "Govern Agent Session" ||
                        (cap.name && cap.name.includes("[DEMO")) ||
                        (cap.purpose && cap.purpose.includes("[DEMO"));

      if (!isDemoCap) {
        // PRESERVE computed values, user requirements, and generated estimates!
        // Do not empty unitTests, contractTests, latencySlo, or rewrite owners!
        const updatedCap = { ...cap };
        if (updatedCap.evidence) {
          if (updatedCap.evidence.testCoveragePercent === 0 && !updatedCap.evidence.measurementState) {
            updatedCap.evidence = { ...updatedCap.evidence, testCoveragePercent: null, measurementState: "UNMEASURED" };
          }
        }
        return updatedCap;
      }

      // For demo capabilities / fabricated fixtures only: replace demo owners and unmeasured fixture metrics
      const updatedCap: Capability = {
        ...cap,
        verificationState: "NOT_VERIFIED",
        maturityState: "Target state",
        pricingState: cap.pricingState ? "Pricing proposal" : cap.pricingState,
        owner: "proposed role",
        primaryOwner: cap.primaryOwner ? "proposed role" : undefined,
        technicalOwner: cap.technicalOwner ? "proposed role" : undefined,
        dataOwner: cap.dataOwner ? "proposed role" : undefined,
        complianceOwner: cap.complianceOwner ? "proposed role" : undefined,
        source_kind: cap.source_kind || "fallback_generated",
        provenance: {
          ...cap.provenance,
          source_kind: cap.source_kind || "fallback_generated",
          source_provider: "llm",
          evidence_state: "UNVERIFIED_DESIGN_INTENT",
          claim_validation_state: "NOT_CHECKED"
        }
      };

      if (updatedCap.canonicalRepoImplementation) {
        if (!updatedCap.canonicalRepoImplementation.startsWith("proposed repository")) {
          updatedCap.canonicalRepoImplementation = `proposed repository: ${updatedCap.canonicalRepoImplementation}`;
        }
      }

      // Downgrade demo verification metrics
      if (updatedCap.verification) {
        updatedCap.verification = {
          ...updatedCap.verification,
          unitTests: Array.isArray(updatedCap.verification.unitTests) ? [] : updatedCap.verification.unitTests,
          contractTests: Array.isArray(updatedCap.verification.contractTests) ? [] : updatedCap.verification.contractTests,
          fixtureTests: Array.isArray(updatedCap.verification.fixtureTests) ? [] : updatedCap.verification.fixtureTests,
          mcpTests: Array.isArray(updatedCap.verification.mcpTests) ? [] : updatedCap.verification.mcpTests,
          securityTests: Array.isArray(updatedCap.verification.securityTests) ? [] : updatedCap.verification.securityTests,
          latencySlo: "unmeasured",
          driftChecks: "NOT_EXECUTED"
        };
      }

      // Downgrade demo evidence produced and claims with nullable metrics and tri-state verification
      if (updatedCap.evidence) {
        const origClass = updatedCap.evidence.classification;
        const newClass = (origClass === "VERIFIED_EXISTING" || origClass === "INFERRED_FROM_CODE" || origClass === "RESEARCH_SUPPORTED")
          ? "UNVERIFIED_DESIGN_INTENT"
          : origClass;

        updatedCap.evidence = {
          ...updatedCap.evidence,
          evidenceProduced: "NOT_EXECUTED",
          completedProof: "NOT_EXECUTED",
          verifiable: false,
          classification: newClass as any,
          verifiedOnChain: "NOT_CHECKED" as any,
          testCoveragePercent: null,
          measurementState: "UNMEASURED",
          provenance: {
            ...updatedCap.evidence.provenance,
            source_kind: cap.source_kind || "fallback_generated",
            source_provider: "llm",
            evidence_state: "UNVERIFIED_DESIGN_INTENT",
            claim_validation_state: "NOT_CHECKED"
          }
        } as any;
      }

      return updatedCap;
    });
  }

  // 5. Provenance-Aware Einstein Probability (nullable metrics, never zero)
  if (blueprint.einsteinProbability) {
    const ep = blueprint.einsteinProbability;
    const isMeasured = ep.measurementState === "MEASURED" || ep.source_kind === "runtime_measured" || ep.evidence_state === "MEASURED";
    const isComputed = ep.evidence_state === "COMPUTED" || ep.evidence_state === "COMPUTED_UNCALIBRATED" || ep.source_kind === "computed";
    const isRetrieved = ep.evidence_state === "RETRIEVED" || ep.source_kind === "retrieved";
    const isUserDeclared = ep.evidence_state === "USER_DECLARED" || ep.source_kind === "user_supplied";
    const isGeneratedEstimate = ep.evidence_state === "GENERATED_ESTIMATE" || ep.source_kind === "generated_estimate" || ep.source_kind === "llm";
    const isDemoSample = ep.evidence_state === "DEMO_SAMPLE" || ep.source_kind === "demo" || (ep.modelName && ep.modelName.includes("DEMO"));

    if (isMeasured || isComputed || isRetrieved || isUserDeclared) {
      // PRESERVE values produced by real ABIDE computations, measurements, or user declarations!
      if (!ep.evidence_state) {
        ep.evidence_state = isMeasured ? "MEASURED" : isComputed ? "COMPUTED" : isRetrieved ? "RETRIEVED" : "USER_DECLARED";
      }
    } else if (isGeneratedEstimate && !isDemoSample) {
      // Rule 8: unsupported generated estimates remain visible as GENERATED_ESTIMATE, not silently promoted or erased.
      ep.evidence_state = "GENERATED_ESTIMATE";
      ep.measurementState = "GENERATED_ESTIMATE";
      if (!ep.source_kind) ep.source_kind = "generated_estimate";
    } else {
      // It is a demo sample, fabricated fixture, or unmeasured proposal.
      // Rule 1: Never convert missing values to 0. Use value: null and evidence_state: "UNMEASURED".
      blueprint.einsteinProbability = {
        ...ep,
        modelName: ep.modelName.includes("Unmeasured") ? ep.modelName : `${ep.modelName} (Unmeasured Proposal)`,
        successRate: null,
        latencyMs: null,
        measurementState: "UNMEASURED",
        variables: Array.isArray(ep.variables)
          ? ep.variables.map((v) => ({ ...v, impact: v.impact.includes("unmeasured") ? v.impact : `${v.impact} (unmeasured)` }))
          : [],
        source_kind: "fallback_generated",
        evidence_state: "UNMEASURED",
        claim_validation_state: "NOT_CHECKED",
        provenance: { ...ep.provenance, source_kind: "fallback_generated", evidence_state: "UNMEASURED" }
      };
    }
  }

  return blueprint;
}

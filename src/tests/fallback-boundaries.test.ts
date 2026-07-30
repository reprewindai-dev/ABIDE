import { describe, it } from "node:test";
import assert from "node:assert";
import { DEFAULT_BLUEPRINT } from "../data/defaultBlueprint";
import { downgradeFallbackClaims, createMetricValue } from "../core/fallback-downgrade";
import { scoreResourceReputationV1 } from "../compiler/seked";

describe("ABIDE Sovereign Governance: Provenance-Aware Evidence Class & Mode Boundaries", () => {
  it("must recursively downgrade inherited demo claims when generating fallback proposals", () => {
    // Clone the default blueprint which contains demo claims ("Verified", real names, "Sovereign Production", etc.)
    const inputBlueprint = JSON.parse(JSON.stringify(DEFAULT_BLUEPRINT));
    
    // Inject a demo reference to test the downgrade since DEFAULT_BLUEPRINT is now empty of demo records
    inputBlueprint.academicGrounding = [{
      title: "Demo Citation",
      author: "Demo Author",
      source: "Demo Source",
      summary: "Demo Summary",
      relevance: "Demo Relevance",
      url: "https://demo.url",
      resolvableIdentifier: "demo:123",
      retrievalTimestamp: "2026-07-20T00:00:00Z",
      quotedClaimLocation: "Demo Section",
      verificationStatus: "VERIFIED"
    }];
    
    // Verify initial demo state has production/verified claims
    assert.strictEqual(inputBlueprint.capabilities[0].verificationState, "Verified");
    assert.strictEqual(inputBlueprint.capabilities[0].maturityState, "Sovereign Production");
    assert.strictEqual(inputBlueprint.capabilities[0].owner, "Dr. Evelyn Vance");

    // Apply sovereign fallback downgrade
    const result = downgradeFallbackClaims(inputBlueprint);

    // 1. Top-level mode and evidence boundaries
    assert.strictEqual(result.source, "fallback", "Source must be explicitly marked as fallback");
    assert.strictEqual(result.quota_fallback, true, "quota_fallback flag must be true");
    assert.strictEqual(result.evidence_state, "GENERATED_PROPOSAL", "Evidence class must be GENERATED_PROPOSAL");
    assert.strictEqual(result.verification_state, "NOT_VERIFIED", "Verification state must be NOT_VERIFIED");

    // 2. Academic grounding demo citation downgrade
    assert.ok(result.academicGrounding.length > 0);
    result.academicGrounding.forEach((paper: any) => {
      assert.strictEqual(paper.verificationStatus, "NOT_VERIFIED", "Academic citations must not claim verified status in fallback proposals");
      assert.ok(paper.summary.includes("Offline proposal reference"), "Summary must note offline proposal reference");
      assert.strictEqual(paper.evidence_state, "DEMO_REFERENCE", "Demo citations must be marked DEMO_REFERENCE");
    });

    // 3. Company graph downgrade (demo owners, generated repositories, demo environments)
    result.companyGraph.owners.forEach((owner) => {
      assert.strictEqual(owner.name, "Proposed Role", "Demo personnel names must be replaced with Proposed Role");
      assert.strictEqual(owner.role, "proposed role", "Role must be marked as proposed role");
    });
    result.companyGraph.repositories.forEach((repo) => {
      assert.strictEqual(repo.status, "proposed repository", "Repository status must be proposed repository");
      assert.ok(repo.name.startsWith("proposed repository"), "Repository name must indicate proposed repository");
    });
    result.companyGraph.environments.forEach((env) => {
      assert.strictEqual(env, "target environment", "Demo environments must be marked as target environment");
    });

    // 4. Capability claim downgrade
    result.capabilities.forEach((cap) => {
      assert.strictEqual(cap.verificationState, "NOT_VERIFIED", "Capability verification state must be downgraded to NOT_VERIFIED");
      assert.strictEqual(cap.maturityState, "Target state", "Capability maturity state must be downgraded to Target state");
      assert.strictEqual(cap.pricingState, "Pricing proposal", "Pricing state must be downgraded to Pricing proposal");
      assert.strictEqual(cap.owner, "proposed role", "Capability owner must be downgraded to proposed role");
      
      // Verification metrics
      assert.strictEqual(cap.verification.unitTests.length, 0, "Test arrays must be emptied");
      assert.strictEqual(cap.verification.contractTests.length, 0);
      assert.strictEqual(cap.verification.securityTests.length, 0);
      assert.strictEqual(cap.verification.latencySlo, "unmeasured", "Latency SLO must be unmeasured");
      assert.strictEqual(cap.verification.driftChecks, "NOT_EXECUTED", "Drift checks must be NOT_EXECUTED");

      // Evidence claims and tri-state verification
      assert.strictEqual(cap.evidence.evidenceProduced, "NOT_EXECUTED", "Evidence produced must be NOT_EXECUTED");
      assert.strictEqual(cap.evidence.completedProof, "NOT_EXECUTED", "Completed proof must be NOT_EXECUTED");
      assert.strictEqual(cap.evidence.verifiable, false, "Verifiable flag must be false");
      assert.strictEqual(cap.evidence.verifiedOnChain, "NOT_CHECKED", "verifiedOnChain must be NOT_CHECKED (tri-state)");
      assert.strictEqual(cap.evidence.testCoveragePercent, null, "testCoveragePercent must be null (never zero)");
      assert.strictEqual(cap.evidence.measurementState, "UNMEASURED", "measurementState must be UNMEASURED");
      assert.notStrictEqual(cap.evidence.classification, "VERIFIED_EXISTING", "Classification must never be VERIFIED_EXISTING");
    });

    // 5. Einstein probability downgrade (missing metrics become null, never zero)
    assert.strictEqual(result.einsteinProbability.successRate, null, "Success rate must be null for unmeasured proposals, never zero");
    assert.strictEqual(result.einsteinProbability.latencyMs, null, "Latency must be null for unmeasured proposals, never zero");
    assert.strictEqual(result.einsteinProbability.measurementState, "UNMEASURED", "Measurement state must be UNMEASURED");
    assert.ok(result.einsteinProbability.modelName.includes("Unmeasured Proposal"), "Model name must indicate unmeasured proposal");
  });

  it("must preserve real OpenAlex/SSRN/arXiv retrievals and distinguish citation evidence states", () => {
    const inputBlueprint = JSON.parse(JSON.stringify(DEFAULT_BLUEPRINT));
    
    // Add real retrieved academic paper with claim validation
    const realOpenAlexPaper = {
      title: "Decentralized Escrow Protocols in Zero-Trust Ledgers",
      author: "Dr. Aris Thorne",
      source: "OpenAlex",
      summary: "An extensive evaluation of zero-trust ledger state machines.",
      relevance: "Validates the cryptographic escrow assumptions.",
      source_provider: "openalex",
      resolvableIdentifier: "doi:10.1038/s41586-021-03819-2",
      retrievalTimestamp: "2026-07-27T12:00:00Z",
      retrieved_at: "2026-07-27T12:00:00Z",
      verificationStatus: "CLAIM_VALIDATED",
      claim_validation_state: "CLAIM_VALIDATED"
    };

    // Add retrieved paper WITHOUT claim validation
    const retrievedArxivPaper = {
      title: "Asynchronous Logical Synchronization Drift",
      author: "J. Mercer",
      source: "arXiv",
      summary: "Studies logical drift in distributed networks.",
      relevance: "Background reading on logical drift.",
      source_provider: "arxiv",
      resolvableIdentifier: "arxiv:2301.12345",
      retrievalStatus: "retrieved",
      retrieved_at: "2026-07-25T10:00:00Z",
      claim_validation_state: "NOT_VALIDATED"
    };
    
    // Add dummy demo citation
    const dummyDemoPaper = {
      title: "Time, Clocks [DEMO]",
      author: "Leslie Lamport",
      source: "CACM",
      summary: "Demo",
      resolvableIdentifier: "demo:lamport",
      verificationStatus: "VERIFIED"
    };

    inputBlueprint.academicGrounding.push(realOpenAlexPaper as any, retrievedArxivPaper as any, dummyDemoPaper as any);

    const result = downgradeFallbackClaims(inputBlueprint);

    // Find our papers in result
    const openAlexRes = result.academicGrounding.find((p: any) => p.resolvableIdentifier === "doi:10.1038/s41586-021-03819-2");
    const arxivRes = result.academicGrounding.find((p: any) => p.resolvableIdentifier === "arxiv:2301.12345");
    const demoRes = result.academicGrounding.find((p: any) => p.resolvableIdentifier === "demo:lamport");

    // Assert real OpenAlex paper survives
    assert.ok(openAlexRes, "Real OpenAlex paper must survive fallback downgrade");
    assert.strictEqual(openAlexRes.evidence_state, "CLAIM_VALIDATED", "Real claim-validated paper must retain CLAIM_VALIDATED state");
    assert.strictEqual(openAlexRes.claim_validation_state, "CLAIM_VALIDATED");
    assert.strictEqual(openAlexRes.verificationStatus, "CLAIM_VALIDATED");
    assert.strictEqual(openAlexRes.provenance?.source_provider, "openalex");

    // Assert retrieved paper without claim validation remains RETRIEVED_SOURCE but not CLAIM_VALIDATED
    assert.ok(arxivRes, "Retrieved arXiv paper must survive fallback downgrade");
    assert.strictEqual(arxivRes.evidence_state, "RETRIEVED_SOURCE", "Paper without claim validation must be RETRIEVED_SOURCE");
    assert.strictEqual(arxivRes.claim_validation_state, "NOT_VALIDATED", "Paper without claim validation must not be CLAIM_VALIDATED");
    assert.notStrictEqual(arxivRes.evidence_state, "CLAIM_VALIDATED");

    // Assert demo paper is downgraded
    assert.strictEqual(demoRes.evidence_state, "DEMO_REFERENCE", "Demo paper must be DEMO_REFERENCE");
    assert.strictEqual(demoRes.verificationStatus, "NOT_VERIFIED");
  });

  it("must preserve verified GitHub repositories and user-provided owners while downgrading demo/generated items", () => {
    const inputBlueprint = JSON.parse(JSON.stringify(DEFAULT_BLUEPRINT));

    // Add verified GitHub repository
    const verifiedRepo = {
      name: "reprewindai-dev/ABIDE-verified-core",
      url: "https://github.com/reprewindai-dev/ABIDE-verified-core",
      capabilities: ["compile-human-intent"],
      status: "verified",
      source_kind: "verified_github"
    };

    // Add generated repository without verification
    const generatedRepo = {
      name: "custom-generated-service",
      url: "https://github.com/reprewindai-dev/custom-generated-service",
      capabilities: ["custom-task"],
      status: "Active"
    };

    inputBlueprint.companyGraph.repositories.push(verifiedRepo as any, generatedRepo as any);

    // Add user-provided owner
    const userOwner = {
      name: "Sarah Connor",
      role: "Security Director",
      team: "Cybersecurity",
      source_kind: "user_supplied"
    };
    inputBlueprint.companyGraph.owners.push(userOwner as any);

    const result = downgradeFallbackClaims(inputBlueprint);

    // Verify repositories
    const verifiedRepoRes = result.companyGraph.repositories.find((r) => r.name === "reprewindai-dev/ABIDE-verified-core");
    const generatedRepoRes = result.companyGraph.repositories.find((r) => r.name.includes("custom-generated-service"));

    assert.ok(verifiedRepoRes, "Verified GitHub repo must survive");
    assert.strictEqual(verifiedRepoRes.status, "verified", "Verified GitHub repository status must be preserved");
    assert.strictEqual(verifiedRepoRes.provenance?.evidence_state, "VERIFIED");

    assert.ok(generatedRepoRes, "Generated repo must be present");
    assert.strictEqual(generatedRepoRes.status, "proposed repository", "Generated repository status must be proposed repository");
    assert.strictEqual(generatedRepoRes.name, "proposed repository: custom-generated-service", "Generated repo name must be marked proposed");

    // Verify owners
    const userOwnerRes = result.companyGraph.owners.find((o) => o.name === "Sarah Connor");
    const demoOwnerRes = result.companyGraph.owners.find((o) => o.name === "Proposed Role");

    assert.ok(userOwnerRes, "User-provided owner must be preserved");
    assert.strictEqual(userOwnerRes.role, "Security Director", "User-provided owner role must be preserved");
    assert.strictEqual(userOwnerRes.provenance?.evidence_state, "USER_DECLARED");

    assert.ok(demoOwnerRes, "Demo owners must be replaced with Proposed Role");
  });

  it("must preserve SEKED/Fenton-Wilkinson computations, hashes, user requirements, telemetry, retrievals, and never zero missing metrics", () => {
    const inputBlueprint = JSON.parse(JSON.stringify(DEFAULT_BLUEPRINT));
    inputBlueprint.hash = "0x99887766554433221100";
    
    // Attach SEKED and Fenton-Wilkinson computed metrics
    inputBlueprint.sekedTriage = {
      compositeScore: 8.42,
      fentonWilkinsonScore: 0.91,
      dimensions: { S: 9, E: 8, K: 8, E2: 9, D: 8 }
    };
    
    // Attach Einstein probability with GENERATED_ESTIMATE
    inputBlueprint.einsteinProbability = {
      modelName: "Custom Estimate Model",
      successRate: 0.85,
      latencyMs: 140,
      evidence_state: "GENERATED_ESTIMATE",
      variables: []
    };

    // Attach user-supplied capability with pricing requirement
    inputBlueprint.capabilities.push({
      id: "user-custom-cap",
      name: "User Custom Capability",
      purpose: "User defined purpose",
      source_kind: "user_supplied",
      owner: "User Architect",
      pricingModel: {
        priceFloor: 0.15,
        marginEstimate: 85
      },
      evidence: {
        testCoveragePercent: 95,
        measurementState: "MEASURED"
      }
    });

    const result = downgradeFallbackClaims(inputBlueprint);

    // 1. Deterministic hash unchanged
    assert.strictEqual(result.hash, "0x99887766554433221100", "Deterministic hash must remain unchanged");

    // 2. SEKED & Fenton-Wilkinson computed values survive
    assert.strictEqual(result.sekedTriage.compositeScore, 8.42, "SEKED composite score must survive");
    assert.strictEqual(result.sekedTriage.fentonWilkinsonScore, 0.91, "Fenton-Wilkinson score must survive");
    assert.strictEqual(result.sekedTriage.evidence_state, "COMPUTED", "SEKED evidence state must be COMPUTED");

    // 3. User-supplied capability and pricing survive
    const userCap = result.capabilities.find((c: any) => c.id === "user-custom-cap");
    assert.ok(userCap, "User capability must survive");
    assert.strictEqual(userCap.pricingModel.priceFloor, 0.15, "User price floor must survive");
    assert.strictEqual(userCap.evidence.testCoveragePercent, 95, "User measurement must survive");

    // 4. Unsupported generated estimates remain GENERATED_ESTIMATE, not promoted or erased
    assert.strictEqual(result.einsteinProbability.successRate, 0.85, "Estimate success rate must survive");
    assert.strictEqual(result.einsteinProbability.evidence_state, "GENERATED_ESTIMATE", "Evidence state must remain GENERATED_ESTIMATE");

    // 5. Demo metrics become null/UNMEASURED and never zero
    const demoCap = result.capabilities.find((c: any) => c.id === "govern-agent-session");
    assert.strictEqual(demoCap.evidence.testCoveragePercent, null, "Demo metric must be null, not zero");
    assert.notStrictEqual(demoCap.evidence.testCoveragePercent, 0, "No missing metric represented by zero");
    assert.strictEqual(demoCap.evidence.measurementState, "UNMEASURED", "Demo measurement state must be UNMEASURED");

    // 6. SEKED R score in seked.ts is not mechanically clamped to 0 when quota_fallback is true
    const testBp = {
      quota_fallback: true,
      academicGrounding: [{
        title: "Verified Study",
        author: "Smith et al",
        source: "OpenAlex",
        url: "https://doi.org/10.1234/test",
        retrievalTimestamp: "2026-07-27T00:00:00Z",
        quotedClaimLocation: "Section 3.1",
        verificationStatus: "CLAIM_VALIDATED"
      }]
    };
    const rScore = scoreResourceReputationV1(testBp);
    assert.ok(rScore.score > 0, "SEKED R score must evaluate real citations even when quota_fallback is true");
    assert.strictEqual(rScore.score, 9, "SEKED R score must calculate correctly based on verified citation attributes");

    // 7. Test createMetricValue helper rules
    const nullVal = createMetricValue(0, "UNMEASURED");
    assert.strictEqual(nullVal.value, null, "Zero value with UNMEASURED default must convert to null");
    assert.strictEqual(nullVal.evidence_state, "UNMEASURED");

    const computedUncal = createMetricValue(42, "COMPUTED_UNCALIBRATED");
    assert.strictEqual(computedUncal.value, 42);
    assert.strictEqual(computedUncal.evidence_state, "COMPUTED_UNCALIBRATED");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateInputBoundedFallback } from "../core/fallback";
import { CanonicalBlueprintV1Schema } from "../core/validation";
import { calculateBlueprintHash } from "../core/plan-ir";

describe("input-bounded local fallback", () => {
  it("preserves supplied text without importing template material", () => {
    const input = "ABIDE Operational Findings Report\nThe fallback must remain truthful.";
    const result = generateInputBoundedFallback({
      notes: input,
      requestedProvider: "gemini",
      fallbackReason: "QUOTA_EXHAUSTED",
    });

    assert.equal(result.source, "local-deterministic-fallback");
    assert.equal((result as any).compilationMetadata.semanticValidationAvailable, false);
    assert.equal((result as any).compilationMetadata.repositoryValidationAvailable, false);
    assert.equal((result as any).compilationMetadata.approvalEligibility, "NOT_ELIGIBLE");
    assert.equal((result as any).compilationMetadata.executionEligibility, "BLOCKED");
    assert.equal((result as any).compilationMetadata.templateAugmentation, "DISABLED");
    assert.equal((result as any).inputProvenance.suppliedText, input);
    assert.deepEqual((result as any).capabilities, []);
    assert.doesNotMatch(JSON.stringify(result), /Dr\. Evelyn Vance|Rust Einstein|Solidity|Gnomledger Mainnet|SSR[NF]|94\.2%|8\.5ms/i);
    assert.equal((result as any).hash, calculateBlueprintHash(result));
    assert.equal(CanonicalBlueprintV1Schema.safeParse(result).success, true);
  });

  it("does not claim quota exhaustion for a generic provider failure", () => {
    const result = generateInputBoundedFallback({
      notes: "A supplied request",
      requestedProvider: "ollama",
      fallbackReason: "PROVIDER_UNAVAILABLE",
    }) as any;

    assert.equal(result.quota_fallback, false);
    assert.equal(result.compilationMetadata.requestedProvider, "ollama");
    assert.equal(result.compilationMetadata.fallbackReason, "PROVIDER_UNAVAILABLE");
  });
});

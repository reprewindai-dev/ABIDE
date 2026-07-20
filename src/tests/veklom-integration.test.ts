import { describe, it } from "node:test";
import assert from "node:assert";
import { CanonicalBlueprintV1Schema } from "../core/validation";

process.env.NODE_ENV = "test";
const { app } = await import("../../server");

// We start a mock/test server instance using our Express app to test /api/generate
import http from "node:http";

describe("Milestone 2: Veklom Adapter & Live Integration Tests", () => {
  const LIVE_API_BASE = "https://api.veklom.com";

  it("1. Live API /api/v1/health must respond with healthy status and fresh timestamp", async () => {
    const res = await fetch(`${LIVE_API_BASE}/api/v1/health`);
    assert.strictEqual(res.status, 200, "Health endpoint should return HTTP 200");

    const data = await res.json();
    assert.strictEqual(data.status, "healthy", "Status must be 'healthy'");
    assert.strictEqual(data.service, "Veklom Sovereign AI Hub", "Service identifier must match");
    assert.ok(data.timestamp, "Timestamp must be present");

    // Verify freshness of timestamp to protect against stale cached deployment proofs
    const serverTime = new Date(data.timestamp).getTime();
    const localTime = Date.now();
    const timeDifferenceMs = Math.abs(localTime - serverTime);

    // Assert timestamp is within 5 minutes of current test runner time
    assert.ok(
      timeDifferenceMs < 5 * 60 * 1000,
      `Timestamp is stale. Difference: ${timeDifferenceMs / 1000}s. Server time: ${data.timestamp}, Local time: ${new Date().toISOString()}`
    );
  });

  it("2. Live v1/exec must reject invalid credentials with authentication failure", async () => {
    const res = await fetch(`${LIVE_API_BASE}/v1/exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "byos_invalid_key_for_testing_purposes",
      },
      body: JSON.stringify({
        prompt: "Generate standard blueprint",
        model: "qwen2.5:3b",
        use_memory: false,
        max_tokens: 100,
        temperature: 0.2,
      }),
    });

    // Check for correct authentication failure status (usually 401 or 403)
    assert.ok(
      res.status === 401 || res.status === 403,
      `Expected HTTP 401 or 403 for invalid credentials, but got HTTP ${res.status}`
    );
  });

  it("3. Execution path validation (Live Inference or dynamic fallback checks)", async () => {
    const apiKey = process.env.VEKLOM_API_KEY;

    if (!apiKey) {
      console.warn("⚠️  VEKLOM_API_KEY is not configured in the environment. Verifying server fallback handling.");
      const serverInstance = http.createServer(app);
      await new Promise<void>((resolve) => serverInstance.listen(0, resolve));
      const address = serverInstance.address() as any;
      const localPort = address.port;

      const res = await fetch(`http://localhost:${localPort}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: "Build a secure sovereign payment processing edge node.",
          provider: "veklom",
          modelName: "qwen2.5:3b",
        }),
      });

      // It should successfully return the fallback blueprint
      assert.strictEqual(res.status, 200, "Should fall back gracefully and return HTTP 200");
      const data = await res.json();
      assert.strictEqual(data.source, "local-deterministic-fallback", "Blueprint source should identify the deterministic fallback");
      assert.strictEqual(data.quota_fallback, true, "quota_fallback must be set to true");
      assert.strictEqual(data.compilationMetadata.mode, "LOCAL_FALLBACK");
      assert.strictEqual(data.compilationMetadata.semanticValidationAvailable, false);
      assert.strictEqual(data.compilationMetadata.repositoryValidationAvailable, false);
      assert.strictEqual(data.compilationMetadata.executionEligibility, "BLOCKED");
      assert.strictEqual(data.compilationMetadata.templateAugmentation, "DISABLED");
      assert.strictEqual(data.agentPackets.length, 1);
      assert.match(data.agentPackets[0].title, /human review/i);
      assert.doesNotMatch(JSON.stringify(data), /Dr\. Evelyn Vance|Rust Einstein|Solidity|Gnomledger Mainnet|94\.2%|8\.5ms/i);

      serverInstance.close();
      return;
    }

    console.log("🚀 Running live Veklom execution and schema verification test with configured VEKLOM_API_KEY...");

    // Start a temporary test server
    const serverInstance = http.createServer(app);
    await new Promise<void>((resolve) => serverInstance.listen(0, resolve));
    const address = serverInstance.address() as any;
    const localPort = address.port;

    try {
      const res = await fetch(`http://localhost:${localPort}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: "Build a micro-transaction edge payment pipeline.",
          provider: "veklom",
          modelName: "qwen2.5:3b",
          apiKey: apiKey,
        }),
      });

      assert.strictEqual(res.status, 200, "Live API generate request should succeed");
      const data = await res.json();

      // Assert it parsed successfully and has core fields
      assert.ok(data.title, "Returned blueprint must have a title");
      assert.ok(data.tagline, "Returned blueprint must have a tagline");
      assert.ok(data.hash, "Returned blueprint must have a hash");

      // Verify it's not the placeholder orchestrator text
      const rawText = JSON.stringify(data);
      assert.ok(
        !rawText.includes("[Orchestrated Execution] Processed via ExecutionIdentityV1"),
        "Live response must contain real model-generated content, not the orchestrator placeholder"
      );

      // Validate blueprint conforms to the target Zod schema
      const parseResult = CanonicalBlueprintV1Schema.safeParse(data);
      assert.ok(
        parseResult.success,
        `Returned blueprint failed schema validation: ${parseResult.success ? "" : JSON.stringify(parseResult.error.format())}`
      );

    } finally {
      serverInstance.close();
    }
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CodeGraphRagError, createCodeGraphRagAdapter } from "./code-graph-rag";

describe("Code-Graph-RAG repository adapter", () => {
  it("normalizes graph and search data with deterministic provenance", async () => {
    const adapter = createCodeGraphRagAdapter({
      transport: "local",
      source: "fixture://code-graph-rag",
      invoke: () => ({
        nodes: [{ id: "n1", file: "src/app.ts", name: "createApp", description: "application entrypoint" }],
        edges: [{ id: "e1", source: "n1", target: "n2", type: "calls" }],
        results: [{ id: "r1", path: "src/app.ts", snippet: "createApp()", similarity: 0.91 }],
      }),
    }, { now: () => new Date("2026-07-20T00:00:00.000Z") });
    const result = await adapter.query({ repository: "abide", commitSha: "abc123", query: "entrypoint" });
    assert.equal(result.nodes[0]?.path, "src/app.ts");
    assert.equal(result.edges[0]?.relation, "calls");
    assert.equal(result.searchResults[0]?.score, 0.91);
    assert.equal(result.provenance.commitSha, "abc123");
    assert.equal(result.provenance.retrievedAt, "2026-07-20T00:00:00.000Z");
    assert.match(result.provenance.requestHash, /^[a-f0-9]{64}$/);
    assert.match(result.provenance.responseHash, /^[a-f0-9]{64}$/);
  });

  it("fails closed on malformed responses", async () => {
    const adapter = createCodeGraphRagAdapter({ transport: "local", invoke: () => ({ nodes: ["not-an-object"] }) });
    await assert.rejects(() => adapter.query({ repository: "abide" }), (error: unknown) => error instanceof CodeGraphRagError && error.code === "INVALID_RESPONSE");
  });

  it("fails closed on timeout", async () => {
    const adapter = createCodeGraphRagAdapter({ transport: "local", invoke: () => new Promise(() => undefined) }, { timeoutMs: 10 });
    await assert.rejects(() => adapter.query({ repository: "abide" }), (error: unknown) => error instanceof CodeGraphRagError && error.code === "TIMEOUT");
  });

  it("rejects unsafe or incomplete configuration", () => {
    assert.throws(() => createCodeGraphRagAdapter({ transport: "http", endpoint: "file:///tmp/graph" }), /http or https/);
    assert.throws(() => createCodeGraphRagAdapter({ transport: "cli", command: "" }), /CLI command/);
  });
});

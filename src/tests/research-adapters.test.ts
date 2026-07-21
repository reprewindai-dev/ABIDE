import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GptResearcherAdapter, ResearchAdapterError, WigoloResearchAdapter, type ProcessRunner } from "../integrations/research/index";

const response = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
const source = { id: "s1", title: "ABIDE source", url: "https://example.com/source", excerpt: "Bounded evidence." };

describe("typed research adapters", () => {
  it("maps a bounded Wigolo response into provenance-aware evidence", async () => {
    let body = "";
    const adapter = new WigoloResearchAdapter({ baseUrl: "https://wigolo.test", fetch: async (_input, init) => { body = String(init?.body); return response({ summary: "A report", sources: [source] }); } });
    const result = await adapter.research({ query: "  governed research  ", context: "repo context", maxSources: 1, allowedDomains: ["Example.com"] });
    assert.equal(result.provider, "wigolo");
    assert.equal(result.query, "governed research");
    assert.equal(result.sources[0].provenance.sourceType, "web");
    assert.deepEqual(JSON.parse(body), { query: "governed research", context: "repo context", allowed_domains: ["example.com"], max_sources: 1 });
  });

  it("fails closed on a malformed Wigolo response", async () => {
    const adapter = new WigoloResearchAdapter({ baseUrl: "https://wigolo.test", fetch: async () => response({ summary: "missing sources" }) });
    await assert.rejects(() => adapter.research({ query: "test" }), (error: unknown) => error instanceof ResearchAdapterError && error.code === "INVALID_RESPONSE");
  });

  it("maps a GPT Researcher process result without treating semantic verification as complete", async () => {
    let received = "";
    const runner: ProcessRunner = async (_command, _args, input) => { received = input; return { exitCode: 0, stdout: JSON.stringify({ report: "Research report", sources: [source] }) }; };
    const adapter = new GptResearcherAdapter({ baseUrl: "", process: { command: "gpt-researcher", args: ["--json"], runner } });
    const result = await adapter.research({ query: "bounded query", context: "context" });
    assert.equal(result.provenance.semanticVerification, "not-performed");
    assert.equal(result.sources[0].provenance.sourceType, "process-output");
    assert.deepEqual(JSON.parse(received), { query: "bounded query", context: "context", max_sources: 20 });
  });

  it("fails closed on a non-zero GPT Researcher process", async () => {
    const runner: ProcessRunner = async () => ({ exitCode: 2, stdout: "", stderr: "failed" });
    const adapter = new GptResearcherAdapter({ baseUrl: "", process: { command: "gpt-researcher", runner } });
    await assert.rejects(() => adapter.research({ query: "test" }), (error: unknown) => error instanceof ResearchAdapterError && error.code === "PROCESS_FAILURE");
  });

  it("aborts a timed-out HTTP request", async () => {
    const adapter = new WigoloResearchAdapter({ baseUrl: "https://wigolo.test", timeoutMs: 5, fetch: (_input, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted")))) });
    await assert.rejects(() => adapter.research({ query: "timeout" }), (error: unknown) => error instanceof ResearchAdapterError && error.code === "TIMEOUT");
  });

  it("rejects oversized input before contacting the provider", async () => {
    let called = false;
    const adapter = new WigoloResearchAdapter({ baseUrl: "https://wigolo.test", maxQueryChars: 3, fetch: async () => { called = true; return response({}); } });
    await assert.rejects(() => adapter.research({ query: "too long" }), (error: unknown) => error instanceof ResearchAdapterError && error.code === "INVALID_INPUT");
    assert.equal(called, false);
  });
});

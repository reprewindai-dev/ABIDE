import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

process.env.NODE_ENV = "test";
const { buildCapiRegistrationPayload, defaultProvider } = await import("../../server");

const root = process.cwd();
const serverSource = fs.readFileSync(path.join(root, "server.ts"), "utf8");
const sourceFiles = [
  "server.ts",
  "src/App.tsx",
  "src/components/AgentPackets.tsx",
  "src/components/CavemanGuide.tsx",
  "src/components/GapsDuplicates.tsx",
  "src/components/CognitiveIde.tsx",
  "src/test-integration.ts"
].map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

test("reconciliation binds the application to port 3009", () => {
  assert.match(serverSource, /const PORT = Number\(process\.env\.PORT\) \|\| 3009/);
  assert.doesNotMatch(sourceFiles, /localhost:3000|:3000|Port 3000|PORT = 3000/);
});

test("reconciliation removes Gemini and defaults to Ollama", () => {
  assert.notEqual(defaultProvider(), "gemini");
  assert.equal(defaultProvider(), "llama");
  assert.doesNotMatch(serverSource, /GoogleGenAI|@google\/genai|process\.env\.GEMINI_API_KEY/);
  const packageJson = fs.readFileSync(path.join(root, "package.json"), "utf8");
  assert.doesNotMatch(packageJson, /@google\/genai/);
});

test("Dockerfile exposes the canonical internal port", () => {
  const dockerfile = fs.readFileSync(path.join(root, "Dockerfile"), "utf8");
  assert.match(dockerfile, /EXPOSE 3009/);
  assert.match(dockerfile, /ENV PORT=3009/);
});

test("VNP authentication and seeded user artifacts are absent", () => {
  assert.equal(fs.existsSync(path.join(root, "vnp-users-db.json")), false);
  assert.equal(fs.existsSync(path.join(root, "src/core/vnp-auth.ts")), false);
  assert.equal(fs.existsSync(path.join(root, "src/components/VnpAuthHub.tsx")), false);
});

test("static academic records are unverified and unsigned", () => {
  const vectorSection = serverSource.slice(
    serverSource.indexOf("const vectorDatabase"),
    serverSource.indexOf("// Vector cosine similarity helper")
  );
  assert.doesNotMatch(vectorSection, /verificationStatus:\s*"VERIFIED"/);
  assert.doesNotMatch(vectorSection, /0x_[^"]+proof_sig/);
  assert.equal((vectorSection.match(/verificationStatus:\s*"UNVERIFIED"/g) || []).length, 6);
  assert.equal((vectorSection.match(/digitalSignature:\s*""/g) || []).length, 6);
  const blueprintSource = fs.readFileSync(path.join(root, "src/data/defaultBlueprint.ts"), "utf8");
  assert.doesNotMatch(blueprintSource.slice(0, 120), /verificationStatus:\s*"VERIFIED"/);
});

test("cAPI registration payload is canonical", () => {
  const payload = buildCapiRegistrationPayload();
  assert.equal(payload.service_name, "abide-node");
  assert.deepEqual(payload.capabilities, [
    "blueprint.compile",
    "governance.simulate",
    "z3.verify",
    "tla.verify",
    "x402.lock"
  ]);
});

test("unconfigured executor remains fail-closed", async () => {
  const execution = await import("../core/execution");
  delete process.env.CAPABILITY_EXECUTORS_CONFIGURED;
  delete process.env.PGL_ADAPTER_CONFIGURED;
  assert.equal(execution.isExecutionAdapterConfigured(), false);
  assert.equal(execution.isPglAdapterConfigured(), false);
  const projectEngine = fs.readFileSync(path.join(root, "src/services/project-engine.ts"), "utf8");
  assert.match(projectEngine, /SCAFFOLDED/);
  assert.doesNotMatch(projectEngine, /project\.status = "VERIFIED"/);
});

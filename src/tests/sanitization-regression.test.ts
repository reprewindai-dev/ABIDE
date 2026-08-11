import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { DEFAULT_BLUEPRINT } from "../data/defaultBlueprint";

const repoRoot = path.resolve(process.cwd());
const activeSource = [
  "server.ts",
  "src/App.tsx",
  "src/core",
  "src/components",
  "src/data"
].flatMap((entry) => {
  const absolute = path.join(repoRoot, entry);
  if (fs.statSync(absolute).isFile()) return [absolute];
  return fs.readdirSync(absolute, { recursive: true })
    .filter((file): file is string => typeof file === "string" && /\.(ts|tsx)$/.test(file))
    .map((file) => path.join(absolute, file));
});

const sourceText = activeSource.map((file) => fs.readFileSync(file, "utf8")).join("\n");

test("restored source does not reintroduce fabricated authority or evidence claims", () => {
  for (const forbidden of [
    "ZK_ATTESTATION_VERIFIED",
    "Bilinear Pairing",
    "CONVERGED_SOVEREIGN_PRODUCTION",
    "pglBirthCert",
    "VNP_SOVEREIGN_AUTH_SECRET_2026_HMAC_SHA256"
  ]) {
    assert.equal(sourceText.includes(forbidden), false, `forbidden claim returned: ${forbidden}`);
  }
});

test("backend and ZK status surfaces remain fail-closed by default", () => {
  const serverSource = fs.readFileSync(path.join(repoRoot, "server.ts"), "utf8");
  const syncHandler = serverSource.match(
    /app\.post\("\/api\/backends\/verify-sync"[\s\S]*?\n\}\);/
  )?.[0] || "";
  assert.match(serverSource, /gatewayStatus:\s*"EXPERIMENTAL_STRUCTURE_VALIDATION"/);
  assert.doesNotMatch(serverSource.match(/app\.get\("\/api\/zk\/status"[\s\S]*?\n\}\);/)?.[0] || "", /status:\s*"ONLINE"/);
  assert.match(syncHandler, /systemState:\s*"NOT_VERIFIED"/);
  assert.match(syncHandler, /logs:\s*\[\]/);
  assert.doesNotMatch(syncHandler, /totalLatencyMs/);
});

test("DELYN and cAPI catalog identities are honest and canonical", () => {
  const repositories = DEFAULT_BLUEPRINT.companyGraph.repositories;
  const delyn = repositories.find((repository) => repository.name === "delyn-backend");
  const capi = repositories.find((repository) => repository.name === "cAPI");

  assert.equal(delyn?.status, "UNVERIFIED");
  assert.equal(capi?.url, "https://github.com/reprewindai-dev/cAPI");
  assert.equal(repositories.some((repository) => repository.name === "interlink-cAPI"), false);
});

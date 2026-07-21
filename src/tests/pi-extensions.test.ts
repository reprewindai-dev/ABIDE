import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  discoverPiExtensionsConfiguration,
  validatePiExtensionsManifest,
  PI_EXTENSION_CAPABILITIES,
} from "../integrations/agents/pi-extensions";

describe("Pi Extensions integration boundary", () => {
  it("reports every optional capability as unavailable when nothing is configured", () => {
    const manifest = discoverPiExtensionsConfiguration({
      env: {},
      now: new Date("2026-07-20T12:00:00.000Z"),
    });

    assert.deepEqual(
      manifest.capabilities.map((entry) => entry.capability),
      PI_EXTENSION_CAPABILITIES,
    );
    for (const entry of manifest.capabilities) {
      assert.equal(entry.status, "UNAVAILABLE");
      assert.equal(entry.installed, "UNKNOWN");
      assert.equal(entry.live, false);
      assert.equal(entry.verification, "NOT_PERFORMED");
    }
  });

  it("detects configuration without falsely claiming installation or liveness", () => {
    const manifest = discoverPiExtensionsConfiguration({
      env: {
        PI_LSP_COMMAND: "pi-lsp",
        PI_CHROME_DEVTOOLS_URL: "http://127.0.0.1:9222",
        PI_GITHUB_PR_ENABLED: "true",
        GITHUB_TOKEN: "intentionally-redacted-in-test",
      },
    });

    const lsp = manifest.capabilities.find((entry) => entry.capability === "lsp");
    const chrome = manifest.capabilities.find((entry) => entry.capability === "chrome-devtools");
    const github = manifest.capabilities.find((entry) => entry.capability === "github-pr");
    assert.equal(lsp?.status, "CONFIGURED_UNVERIFIED");
    assert.equal(chrome?.status, "CONFIGURED_UNVERIFIED");
    assert.equal(github?.status, "CONFIGURED_UNVERIFIED");
    assert.equal(lsp?.installed, "UNKNOWN");
    assert.equal(lsp?.live, false);
    assert.deepEqual(github?.configuredValuesPresent, ["PI_GITHUB_PR_ENABLED", "GITHUB_TOKEN"]);
  });

  it("does not treat an enabled GitHub flag without a token as configured", () => {
    const manifest = discoverPiExtensionsConfiguration({ env: { PI_GITHUB_PR_ENABLED: "true" } });
    const github = manifest.capabilities.find((entry) => entry.capability === "github-pr");
    assert.equal(github?.status, "UNAVAILABLE");
    assert.deepEqual(github?.configuredValuesPresent, []);
  });

  it("rejects malformed or incomplete manifests", () => {
    const valid = discoverPiExtensionsConfiguration({ env: {} });
    assert.throws(() => validatePiExtensionsManifest({ ...valid, capabilities: [] }), /expected array to have >=5 items/);
    assert.throws(
      () => validatePiExtensionsManifest({ ...valid, capabilities: valid.capabilities.map((entry) => ({ ...entry, live: true })) }),
      /expected false/,
    );
  });
});

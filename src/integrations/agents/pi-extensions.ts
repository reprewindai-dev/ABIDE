import { z } from "zod";

export const PI_EXTENSION_CAPABILITIES = [
  "lsp",
  "chrome-devtools",
  "github-pr",
  "subagent",
  "sync",
] as const;

export type PiExtensionCapability = (typeof PI_EXTENSION_CAPABILITIES)[number];

export const PiCapabilityStatusSchema = z.enum([
  "UNAVAILABLE",
  "CONFIGURED_UNVERIFIED",
]);

export type PiCapabilityStatus = z.infer<typeof PiCapabilityStatusSchema>;

const PiCapabilitySchema = z.object({
  capability: z.enum(PI_EXTENSION_CAPABILITIES),
  status: PiCapabilityStatusSchema,
  installed: z.literal("UNKNOWN"),
  live: z.literal(false),
  verification: z.literal("NOT_PERFORMED"),
  configurationKeys: z.array(z.string()),
  configuredValuesPresent: z.array(z.string()),
  unavailableReason: z.string(),
});

export const PiExtensionsManifestSchema = z.object({
  adapter: z.literal("pi-extensions"),
  version: z.literal("1"),
  discoveredAt: z.string().datetime({ offset: true }),
  capabilities: z.array(PiCapabilitySchema).length(PI_EXTENSION_CAPABILITIES.length),
  limitations: z.array(z.string()).min(1),
});

export type PiExtensionCapabilityRecord = z.infer<typeof PiCapabilitySchema>;
export type PiExtensionsManifest = z.infer<typeof PiExtensionsManifestSchema>;

export interface PiExtensionsEnvironment {
  PI_LSP_COMMAND?: string;
  PI_EXTENSIONS_LSP_COMMAND?: string;
  PI_CHROME_DEVTOOLS_URL?: string;
  PI_EXTENSIONS_CHROME_DEVTOOLS_URL?: string;
  PI_GITHUB_PR_ENABLED?: string;
  GITHUB_TOKEN?: string;
  PI_SUBAGENT_COMMAND?: string;
  PI_EXTENSIONS_SUBAGENT_COMMAND?: string;
  PI_SYNC_COMMAND?: string;
  PI_EXTENSIONS_SYNC_URL?: string;
}

export interface PiExtensionsDiscoveryOptions {
  env?: PiExtensionsEnvironment;
  now?: Date;
}

const CONFIGURATION: Record<
  PiExtensionCapability,
  { keys: string[]; configured: (env: PiExtensionsEnvironment) => string[] }
> = {
  lsp: {
    keys: ["PI_LSP_COMMAND", "PI_EXTENSIONS_LSP_COMMAND"],
    configured: (env) => present(env, ["PI_LSP_COMMAND", "PI_EXTENSIONS_LSP_COMMAND"]),
  },
  "chrome-devtools": {
    keys: ["PI_CHROME_DEVTOOLS_URL", "PI_EXTENSIONS_CHROME_DEVTOOLS_URL"],
    configured: (env) => present(env, ["PI_CHROME_DEVTOOLS_URL", "PI_EXTENSIONS_CHROME_DEVTOOLS_URL"]),
  },
  "github-pr": {
    keys: ["PI_GITHUB_PR_ENABLED", "GITHUB_TOKEN"],
    configured: (env) => {
      const keys = present(env, ["PI_GITHUB_PR_ENABLED", "GITHUB_TOKEN"]);
      return env.PI_GITHUB_PR_ENABLED?.toLowerCase() === "true" && env.GITHUB_TOKEN ? keys : [];
    },
  },
  subagent: {
    keys: ["PI_SUBAGENT_COMMAND", "PI_EXTENSIONS_SUBAGENT_COMMAND"],
    configured: (env) => present(env, ["PI_SUBAGENT_COMMAND", "PI_EXTENSIONS_SUBAGENT_COMMAND"]),
  },
  sync: {
    keys: ["PI_SYNC_COMMAND", "PI_EXTENSIONS_SYNC_URL"],
    configured: (env) => present(env, ["PI_SYNC_COMMAND", "PI_EXTENSIONS_SYNC_URL"]),
  },
};

function present(env: PiExtensionsEnvironment, keys: string[]): string[] {
  return keys.filter((key) => {
    const value = env[key as keyof PiExtensionsEnvironment];
    return typeof value === "string" && value.trim().length > 0;
  });
}

function capabilityRecord(
  capability: PiExtensionCapability,
  env: PiExtensionsEnvironment,
): PiExtensionCapabilityRecord {
  const configuration = CONFIGURATION[capability];
  const configuredValuesPresent = configuration.configured(env);
  const configured = configuredValuesPresent.length > 0;

  return {
    capability,
    status: configured ? "CONFIGURED_UNVERIFIED" : "UNAVAILABLE",
    installed: "UNKNOWN",
    live: false,
    verification: "NOT_PERFORMED",
    configurationKeys: configuration.keys,
    configuredValuesPresent,
    unavailableReason: configured
      ? "Configuration was discovered, but installation and live operation were not probed."
      : "No supported Pi Extensions configuration was discovered.",
  };
}

/**
 * Describes the optional Pi Extensions boundary without making runtime claims.
 * Configuration presence is evidence of configuration only, never installation or liveness.
 */
export function discoverPiExtensionsConfiguration(
  options: PiExtensionsDiscoveryOptions = {},
): PiExtensionsManifest {
  const env = options.env ?? {};
  const discoveredAt = (options.now ?? new Date()).toISOString();
  const manifest: PiExtensionsManifest = {
    adapter: "pi-extensions",
    version: "1",
    discoveredAt,
    capabilities: PI_EXTENSION_CAPABILITIES.map((capability) => capabilityRecord(capability, env)),
    limitations: [
      "Pi Extensions are optional and are not bundled with ABIDE.",
      "This adapter performs configuration discovery only; it does not install, invoke, or health-check Pi Extensions.",
      "Configured capabilities remain unverified until a separate runtime probe supplies evidence.",
    ],
  };

  return validatePiExtensionsManifest(manifest);
}

export function validatePiExtensionsManifest(input: unknown): PiExtensionsManifest {
  const manifest = PiExtensionsManifestSchema.parse(input);
  const capabilities = new Set(manifest.capabilities.map((entry) => entry.capability));
  if (capabilities.size !== PI_EXTENSION_CAPABILITIES.length) {
    throw new Error("Pi Extensions manifest must contain each supported capability exactly once.");
  }
  return manifest;
}

export interface PiExtensionsAdapter {
  discover(options?: PiExtensionsDiscoveryOptions): PiExtensionsManifest;
  validate(input: unknown): PiExtensionsManifest;
}

export const piExtensionsAdapter: PiExtensionsAdapter = {
  discover: discoverPiExtensionsConfiguration,
  validate: validatePiExtensionsManifest,
};

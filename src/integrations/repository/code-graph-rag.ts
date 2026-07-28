import { createHash } from "node:crypto";
import { spawn } from "node:child_process";

export type CodeGraphRagTransport = "http" | "cli" | "local";

export interface RepositoryQuery {
  repository: string;
  commitSha?: string;
  query?: string;
  paths?: string[];
  maxResults?: number;
}

export interface RepositoryEvidenceProvenance {
  adapter: "code-graph-rag";
  transport: CodeGraphRagTransport;
  source: string;
  repository: string;
  commitSha: string | null;
  retrievedAt: string;
  requestHash: string;
  responseHash: string;
}

export interface RepositoryEvidence {
  id: string;
  kind: "repository-node" | "repository-edge" | "repository-search-result";
  repository: string;
  path: string | null;
  symbol: string | null;
  relation: string | null;
  text: string | null;
  score: number | null;
  provenance: RepositoryEvidenceProvenance;
}

export interface RepositoryGraphResult {
  nodes: RepositoryEvidence[];
  edges: RepositoryEvidence[];
  searchResults: RepositoryEvidence[];
  provenance: RepositoryEvidenceProvenance;
}

export interface CodeGraphRagHttpConfig {
  transport: "http";
  endpoint: string;
  headers?: Record<string, string>;
}

export interface CodeGraphRagCliConfig {
  transport: "cli";
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string | undefined>;
}

export interface CodeGraphRagLocalConfig {
  transport: "local";
  invoke: (request: RepositoryQuery) => Promise<unknown> | unknown;
  source?: string;
}

export type CodeGraphRagConfig = CodeGraphRagHttpConfig | CodeGraphRagCliConfig | CodeGraphRagLocalConfig;

export interface CodeGraphRagAdapterOptions {
  timeoutMs?: number;
  now?: () => Date;
}

export class CodeGraphRagError extends Error {
  readonly code: "INVALID_CONFIG" | "TIMEOUT" | "TRANSPORT_FAILURE" | "INVALID_RESPONSE";

  constructor(code: CodeGraphRagError["code"], message: string) {
    super(message);
    this.name = "CodeGraphRagError";
    this.code = code;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`).join(",")}}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function listFrom(payload: Record<string, unknown>, ...keys: string[]): unknown[] {
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

function normalizeItem(item: unknown, kind: RepositoryEvidence["kind"], repository: string, provenance: RepositoryEvidenceProvenance, index: number): RepositoryEvidence {
  const record = asRecord(item);
  if (!record) throw new CodeGraphRagError("INVALID_RESPONSE", `Code-Graph-RAG returned a non-object ${kind}.`);
  const path = stringOrNull(record.path ?? record.file ?? record.filePath ?? record.location);
  const symbol = stringOrNull(record.symbol ?? record.name ?? record.label);
  const relation = stringOrNull(record.relation ?? record.type ?? record.kind);
  const text = stringOrNull(record.text ?? record.content ?? record.description ?? record.snippet);
  const score = numberOrNull(record.score ?? record.similarity);
  const sourceId = stringOrNull(record.id) ?? `${kind}:${path ?? "unknown"}:${symbol ?? "unknown"}:${index}`;
  return { id: sourceId, kind, repository, path, symbol, relation, text, score, provenance };
}

function makeProvenance(config: CodeGraphRagConfig, request: RepositoryQuery, raw: unknown, now: Date): RepositoryEvidenceProvenance {
  const source = config.transport === "http" ? config.endpoint : config.transport === "cli" ? config.command : config.source ?? "local-code-graph-rag";
  return {
    adapter: "code-graph-rag",
    transport: config.transport,
    source,
    repository: request.repository,
    commitSha: request.commitSha ?? null,
    retrievedAt: now.toISOString(),
    requestHash: sha256(stableJson(request)),
    responseHash: sha256(stableJson(raw)),
  };
}

function validateConfig(config: CodeGraphRagConfig): void {
  if (!config || !["http", "cli", "local"].includes(config.transport)) throw new CodeGraphRagError("INVALID_CONFIG", "A supported Code-Graph-RAG transport is required.");
  if (config.transport === "http" && !/^https?:\/\//i.test(config.endpoint)) throw new CodeGraphRagError("INVALID_CONFIG", "The HTTP endpoint must use http or https.");
  if (config.transport === "cli" && !config.command.trim()) throw new CodeGraphRagError("INVALID_CONFIG", "The CLI command is required.");
  if (config.transport === "local" && typeof config.invoke !== "function") throw new CodeGraphRagError("INVALID_CONFIG", "The local invoke function is required.");
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new CodeGraphRagError("TIMEOUT", `Code-Graph-RAG timed out after ${timeoutMs}ms.`)), timeoutMs);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function invokeHttp(config: CodeGraphRagHttpConfig, request: RepositoryQuery, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(config.endpoint, { method: "POST", headers: { "content-type": "application/json", ...config.headers }, body: JSON.stringify(request), signal: controller.signal });
    if (!response.ok) throw new CodeGraphRagError("TRANSPORT_FAILURE", `Code-Graph-RAG HTTP request failed with status ${response.status}.`);
    try { return await response.json(); } catch { throw new CodeGraphRagError("INVALID_RESPONSE", "Code-Graph-RAG returned invalid JSON."); }
  } catch (error) {
    if (error instanceof CodeGraphRagError) throw error;
    if ((error as { name?: string }).name === "AbortError") throw new CodeGraphRagError("TIMEOUT", `Code-Graph-RAG timed out after ${timeoutMs}ms.`);
    throw new CodeGraphRagError("TRANSPORT_FAILURE", `Code-Graph-RAG HTTP request failed: ${error instanceof Error ? error.message : "unknown error"}.`);
  } finally { clearTimeout(timer); }
}

function invokeCli(config: CodeGraphRagCliConfig, request: RepositoryQuery): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const child = spawn(config.command, config.args ?? [], { cwd: config.cwd, env: { ...process.env, ...config.env }, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = ""; let stderr = "";
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });
    child.on("error", (error) => reject(new CodeGraphRagError("TRANSPORT_FAILURE", `Code-Graph-RAG CLI failed to start: ${error.message}.`)));
    child.on("close", (code) => {
      if (code !== 0) return reject(new CodeGraphRagError("TRANSPORT_FAILURE", `Code-Graph-RAG CLI exited with code ${code ?? "unknown"}: ${stderr.trim()}`));
      try { resolve(JSON.parse(stdout)); } catch { reject(new CodeGraphRagError("INVALID_RESPONSE", "Code-Graph-RAG CLI returned invalid JSON.")); }
    });
    child.stdin.end(JSON.stringify(request));
  });
}

export class CodeGraphRagAdapter {
  private readonly timeoutMs: number;
  private readonly now: () => Date;

  constructor(private readonly config: CodeGraphRagConfig, options: CodeGraphRagAdapterOptions = {}) {
    validateConfig(config);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs <= 0) throw new CodeGraphRagError("INVALID_CONFIG", "timeoutMs must be a positive integer.");
    this.now = options.now ?? (() => new Date());
  }

  async query(request: RepositoryQuery): Promise<RepositoryGraphResult> {
    if (!request.repository.trim()) throw new CodeGraphRagError("INVALID_CONFIG", "repository is required.");
    const raw = await withTimeout(this.invoke(request), this.timeoutMs);
    const payload = asRecord(raw);
    if (!payload) throw new CodeGraphRagError("INVALID_RESPONSE", "Code-Graph-RAG response must be an object.");
    const provenance = makeProvenance(this.config, request, raw, this.now());
    const nodes = listFrom(payload, "nodes", "graphNodes").map((item, index) => normalizeItem(item, "repository-node", request.repository, provenance, index));
    const edges = listFrom(payload, "edges", "graphEdges", "relationships").map((item, index) => normalizeItem(item, "repository-edge", request.repository, provenance, index));
    const searchResults = listFrom(payload, "searchResults", "results", "matches").map((item, index) => normalizeItem(item, "repository-search-result", request.repository, provenance, index));
    return { nodes, edges, searchResults, provenance };
  }

  private invoke(request: RepositoryQuery): Promise<unknown> {
    if (this.config.transport === "local") return Promise.resolve(this.config.invoke(request));
    if (this.config.transport === "http") return invokeHttp(this.config, request, this.timeoutMs);
    return invokeCli(this.config, request);
  }
}

export function createCodeGraphRagAdapter(config: CodeGraphRagConfig, options?: CodeGraphRagAdapterOptions): CodeGraphRagAdapter {
  return new CodeGraphRagAdapter(config, options);
}

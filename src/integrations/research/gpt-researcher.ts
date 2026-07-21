import { ResearchAdapterError } from "./errors";
import { DEFAULT_LIMITS, boundedUrl, normalizeRequest, readJson, requestHash, stringValue, withTimeout } from "./shared";
import type { CommonAdapterConfig, FetchLike, ProcessResult, ProcessRunner, ResearchAdapter, ResearchEvidence, ResearchRequest, ResearchSource } from "./types";

export interface GptResearcherConfig extends CommonAdapterConfig {
  reportPath?: string;
  process?: { command: string; args?: readonly string[]; runner: ProcessRunner };
}

export class GptResearcherAdapter implements ResearchAdapter {
  private readonly config: GptResearcherConfig;
  private readonly fetcher: FetchLike;

  constructor(config: GptResearcherConfig) {
    if (!config.process && !config.baseUrl) throw new ResearchAdapterError("INVALID_CONFIGURATION", "GPT Researcher requires an HTTP baseUrl or process configuration.");
    this.config = config;
    this.fetcher = config.fetch ?? fetch;
    if (config.baseUrl) boundedUrl(config.baseUrl, config.reportPath ?? "/report");
  }

  async research(request: ResearchRequest): Promise<ResearchEvidence> {
    const limits = { ...DEFAULT_LIMITS, ...this.config };
    const bounded = normalizeRequest(request, limits);
    const retrievedAt = new Date().toISOString();
    const payload = this.config.process
      ? await this.runProcess(bounded, limits.timeoutMs)
      : await this.runHttp(bounded, limits.timeoutMs, limits.maxResponseBytes);
    return parseReport(payload, bounded, retrievedAt, this.config.process ? "process-output" : "report");
  }

  private async runHttp(request: ReturnType<typeof normalizeRequest>, timeoutMs: number, maxResponseBytes: number): Promise<unknown> {
    const endpoint = boundedUrl(this.config.baseUrl, this.config.reportPath ?? "/report");
    const response = await withTimeout(signal => this.fetcher(endpoint, { method: "POST", signal, headers: { "content-type": "application/json", ...(this.config.apiKey ? { authorization: `Bearer ${this.config.apiKey}` } : {}) }, body: JSON.stringify({ query: request.query, ...(request.context ? { context: request.context } : {}), ...(request.allowedDomains ? { allowed_domains: request.allowedDomains } : {}), report_type: "research", max_sources: request.maxSources }) }), timeoutMs);
    return readJson(response, maxResponseBytes);
  }

  private async runProcess(request: ReturnType<typeof normalizeRequest>, timeoutMs: number): Promise<unknown> {
    const process = this.config.process!;
    if (!process.command.trim()) throw new ResearchAdapterError("INVALID_CONFIGURATION", "GPT Researcher process command is required.");
    const result = await withTimeout(signal => process.runner(process.command, process.args ?? [], JSON.stringify({ query: request.query, ...(request.context ? { context: request.context } : {}), ...(request.allowedDomains ? { allowed_domains: request.allowedDomains } : {}), max_sources: request.maxSources }), signal), timeoutMs);
    if (result.exitCode !== 0) throw new ResearchAdapterError("PROCESS_FAILURE", `GPT Researcher exited with code ${result.exitCode}.`);
    if (!result.stdout.trim()) throw new ResearchAdapterError("INVALID_RESPONSE", "GPT Researcher process returned empty output.");
    try { return JSON.parse(result.stdout); } catch (error) { throw new ResearchAdapterError("INVALID_RESPONSE", "GPT Researcher process returned invalid JSON.", error); }
  }
}

function parseReport(value: unknown, request: ReturnType<typeof normalizeRequest>, retrievedAt: string, sourceType: "report" | "process-output"): ResearchEvidence {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ResearchAdapterError("INVALID_RESPONSE", "GPT Researcher returned an invalid report object.");
  const record = value as Record<string, unknown>;
  const report = stringValue(record.report ?? record.summary ?? record.answer, "report");
  const rawSources = Array.isArray(record.sources) ? record.sources : Array.isArray(record.references) ? record.references : [];
  const sources = rawSources.slice(0, request.maxSources).map((source, index) => {
    if (!source || typeof source !== "object" || Array.isArray(source)) throw new ResearchAdapterError("INVALID_RESPONSE", `GPT Researcher source ${index} is invalid.`);
    const item = source as Record<string, unknown>;
    const url = stringValue(item.url ?? item.link, `sources[${index}].url`)!;
    try { new URL(url); } catch { throw new ResearchAdapterError("INVALID_RESPONSE", `GPT Researcher source ${index} has an invalid URL.`); }
    return { id: stringValue(item.id ?? item.citation_id, `sources[${index}].id`, false) ?? `gpt-researcher-source-${index + 1}`, title: stringValue(item.title ?? item.name, `sources[${index}].title`)!, url, excerpt: stringValue(item.excerpt ?? item.snippet ?? item.content, `sources[${index}].excerpt`)!, ...(stringValue(item.published_at, `sources[${index}].published_at`, false) ? { publishedAt: stringValue(item.published_at, `sources[${index}].published_at`, false) } : {}), retrievedAt, provider: "gpt-researcher", provenance: { sourceType } } satisfies ResearchSource;
  });
  if (!report || sources.length === 0) throw new ResearchAdapterError("INVALID_RESPONSE", "GPT Researcher report must contain report text and at least one source.");
  const hash = requestHash(request);
  return { id: `gpt-researcher:${hash}`, provider: "gpt-researcher", query: request.query, summary: report, sources, provenance: { retrievedAt, requestHash: hash, boundedInput: { query: request.query, ...(request.context ? { context: request.context } : {}), ...(request.allowedDomains ? { allowedDomains: request.allowedDomains } : {}), maxSources: request.maxSources }, semanticVerification: "not-performed" } };
}

export type { ProcessResult };

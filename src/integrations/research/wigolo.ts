import { ResearchAdapterError } from "./errors";
import { DEFAULT_LIMITS, boundedUrl, normalizeRequest, readJson, requestHash, stringValue, withTimeout } from "./shared";
import type { CommonAdapterConfig, FetchLike, ResearchAdapter, ResearchEvidence, ResearchRequest, ResearchSource } from "./types";

export interface WigoloConfig extends CommonAdapterConfig { searchPath?: string; }

export class WigoloResearchAdapter implements ResearchAdapter {
  private readonly config: WigoloConfig;
  private readonly fetcher: FetchLike;

  constructor(config: WigoloConfig) {
    this.config = config;
    this.fetcher = config.fetch ?? fetch;
    boundedUrl(config.baseUrl, config.searchPath ?? "/v1/search");
  }

  async research(request: ResearchRequest): Promise<ResearchEvidence> {
    const limits = { ...DEFAULT_LIMITS, ...this.config };
    const bounded = normalizeRequest(request, limits);
    const endpoint = boundedUrl(this.config.baseUrl, this.config.searchPath ?? "/v1/search");
    const response = await withTimeout(signal => this.fetcher(endpoint, {
      method: "POST",
      signal,
      headers: { "content-type": "application/json", ...(this.config.apiKey ? { authorization: `Bearer ${this.config.apiKey}` } : {}) },
      body: JSON.stringify({ query: bounded.query, ...(bounded.context ? { context: bounded.context } : {}), ...(bounded.allowedDomains ? { allowed_domains: bounded.allowedDomains } : {}), max_sources: bounded.maxSources }),
    }), limits.timeoutMs);
    const payload = await readJson(response, limits.maxResponseBytes);
    const record = asRecord(payload);
    const rawSources = Array.isArray(record.sources) ? record.sources : Array.isArray(record.results) ? record.results : undefined;
    if (!rawSources) throw new ResearchAdapterError("INVALID_RESPONSE", "Wigolo response must contain sources or results.");
    const retrievedAt = new Date().toISOString();
    const sources = rawSources.slice(0, bounded.maxSources).map((source, index) => parseSource(source, index, retrievedAt, endpoint.toString()));
    if (sources.length === 0) throw new ResearchAdapterError("INVALID_RESPONSE", "Wigolo returned no usable sources.");
    const summary = stringValue(record.summary ?? record.answer ?? record.text, "summary");
    return evidence("wigolo", bounded, summary ?? sources.map(source => source.excerpt).join("\n"), sources, retrievedAt);
  }
}

function parseSource(value: unknown, index: number, retrievedAt: string, endpoint: string): ResearchSource {
  const record = asRecord(value);
  const url = stringValue(record.url ?? record.link, `sources[${index}].url`)!;
  try { new URL(url); } catch { throw new ResearchAdapterError("INVALID_RESPONSE", `Wigolo source ${index} has an invalid URL.`); }
  return { id: stringValue(record.id ?? record.citation_id, `sources[${index}].id`, false) ?? `wigolo-source-${index + 1}`, title: stringValue(record.title, `sources[${index}].title`)!, url, excerpt: stringValue(record.excerpt ?? record.snippet ?? record.content, `sources[${index}].excerpt`)!, ...(stringValue(record.published_at, `sources[${index}].published_at`, false) ? { publishedAt: stringValue(record.published_at, `sources[${index}].published_at`, false) } : {}), retrievedAt, provider: "wigolo", provenance: { sourceType: "web", endpoint, ...(stringValue(record.citation, `sources[${index}].citation`, false) ? { citation: stringValue(record.citation, `sources[${index}].citation`, false) } : {}) } };
}

function evidence(provider: "wigolo", request: ReturnType<typeof normalizeRequest>, summary: string, sources: ResearchSource[], retrievedAt: string): ResearchEvidence {
  return { id: `${provider}:${requestHash(request)}`, provider, query: request.query, summary, sources, provenance: { retrievedAt, requestHash: requestHash(request), boundedInput: { query: request.query, ...(request.context ? { context: request.context } : {}), ...(request.allowedDomains ? { allowedDomains: request.allowedDomains } : {}), maxSources: request.maxSources }, semanticVerification: "not-performed" } };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ResearchAdapterError("INVALID_RESPONSE", "Research provider returned an invalid object.");
  return value as Record<string, unknown>;
}

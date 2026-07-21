import { createHash } from "node:crypto";
import { ResearchAdapterError } from "./errors";
import type { AdapterLimits, ResearchRequest } from "./types";

export const DEFAULT_LIMITS: Required<AdapterLimits> = {
  maxQueryChars: 4_000,
  maxContextChars: 12_000,
  maxSources: 20,
  maxDomains: 20,
  maxDomainChars: 253,
  maxResponseBytes: 2_000_000,
  timeoutMs: 15_000,
};

export interface BoundedRequest {
  query: string;
  context?: string;
  allowedDomains?: string[];
  maxSources: number;
  requestedAt: string;
}

export function normalizeRequest(request: ResearchRequest, limits: AdapterLimits = {}): BoundedRequest {
  const effective = { ...DEFAULT_LIMITS, ...limits };
  if (!request || typeof request.query !== "string") {
    throw new ResearchAdapterError("INVALID_INPUT", "Research query is required.");
  }
  const query = request.query.trim();
  if (!query || query.length > effective.maxQueryChars) {
    throw new ResearchAdapterError("INVALID_INPUT", `Query must be between 1 and ${effective.maxQueryChars} characters.`);
  }
  if (request.context !== undefined && (typeof request.context !== "string" || request.context.length > effective.maxContextChars)) {
    throw new ResearchAdapterError("INVALID_INPUT", `Context must be at most ${effective.maxContextChars} characters.`);
  }
  const domains = request.allowedDomains?.map(domain => domain.trim().toLowerCase()).filter(Boolean);
  if (domains && (domains.length > effective.maxDomains || domains.some(domain => domain.length > effective.maxDomainChars || !isDomain(domain)))) {
    throw new ResearchAdapterError("INVALID_INPUT", "Allowed domains are invalid or exceed configured bounds.");
  }
  const requested = request.maxSources ?? effective.maxSources;
  if (!Number.isInteger(requested) || requested < 1 || requested > effective.maxSources) {
    throw new ResearchAdapterError("INVALID_INPUT", `maxSources must be an integer between 1 and ${effective.maxSources}.`);
  }
  return {
    query,
    ...(request.context ? { context: request.context } : {}),
    ...(domains?.length ? { allowedDomains: [...new Set(domains)].sort() } : {}),
    maxSources: requested,
    requestedAt: request.requestedAt ?? new Date().toISOString(),
  };
}

export function requestHash(request: BoundedRequest): string {
  return createHash("sha256").update(JSON.stringify(request)).digest("hex");
}

export function boundedUrl(baseUrl: string, path: string): URL {
  let base: URL;
  try { base = new URL(baseUrl); } catch (error) { throw new ResearchAdapterError("INVALID_CONFIGURATION", "baseUrl must be an absolute URL.", error); }
  if (!/^https?:$/.test(base.protocol)) throw new ResearchAdapterError("INVALID_CONFIGURATION", "Only HTTP(S) research endpoints are supported.");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, base);
}

export async function readJson(response: Response, maxBytes: number): Promise<unknown> {
  if (!response.ok) throw new ResearchAdapterError("UPSTREAM_FAILURE", `Research provider returned HTTP ${response.status}.`);
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) throw new ResearchAdapterError("INVALID_RESPONSE", "Research provider response exceeds the configured size limit.");
  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) throw new ResearchAdapterError("INVALID_RESPONSE", "Research provider response exceeds the configured size limit.");
  try { return JSON.parse(body); } catch (error) { throw new ResearchAdapterError("INVALID_RESPONSE", "Research provider returned invalid JSON.", error); }
}

export async function withTimeout<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await operation(controller.signal); }
  catch (error) {
    if (controller.signal.aborted) throw new ResearchAdapterError("TIMEOUT", `Research provider timed out after ${timeoutMs}ms.`, error);
    throw error;
  } finally { clearTimeout(timer); }
}

export function stringValue(value: unknown, field: string, required = true): string | undefined {
  if (value === undefined || value === null) {
    if (required) throw new ResearchAdapterError("INVALID_RESPONSE", `Research response is missing ${field}.`);
    return undefined;
  }
  if (typeof value !== "string" || !value.trim()) throw new ResearchAdapterError("INVALID_RESPONSE", `Research response field ${field} must be a non-empty string.`);
  return value.trim();
}

export function isDomain(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(value);
}

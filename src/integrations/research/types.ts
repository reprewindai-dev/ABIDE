export type ResearchProvider = "wigolo" | "gpt-researcher";

export interface ResearchRequest {
  query: string;
  context?: string;
  maxSources?: number;
  allowedDomains?: string[];
  requestedAt?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  publishedAt?: string;
  retrievedAt: string;
  provider: ResearchProvider;
  provenance: {
    sourceType: "web" | "report" | "process-output";
    endpoint?: string;
    citation?: string;
    sourceRecord?: string;
  };
}

export interface ResearchEvidence {
  id: string;
  provider: ResearchProvider;
  query: string;
  summary: string;
  sources: ResearchSource[];
  provenance: {
    retrievedAt: string;
    requestHash: string;
    boundedInput: {
      query: string;
      context?: string;
      allowedDomains?: string[];
      maxSources: number;
    };
    semanticVerification: "not-performed";
  };
}

export interface ResearchAdapter {
  research(request: ResearchRequest): Promise<ResearchEvidence>;
}

export interface FetchLike {
  (input: string | URL, init?: RequestInit): Promise<Response>;
}

export interface ProcessResult {
  stdout: string;
  stderr?: string;
  exitCode: number;
}

export interface ProcessRunner {
  (command: string, args: readonly string[], input: string, signal: AbortSignal): Promise<ProcessResult>;
}

export interface AdapterLimits {
  maxQueryChars?: number;
  maxContextChars?: number;
  maxSources?: number;
  maxDomains?: number;
  maxDomainChars?: number;
  maxResponseBytes?: number;
  timeoutMs?: number;
}

export interface CommonAdapterConfig extends AdapterLimits {
  baseUrl: string;
  apiKey?: string;
  fetch?: FetchLike;
}

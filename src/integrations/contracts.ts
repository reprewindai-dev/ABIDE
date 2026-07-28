import { createHash } from "node:crypto";

export type IntegrationState = "CONFIGURED" | "UNAVAILABLE" | "ERROR";

export interface IntegrationStatus {
  adapter: string;
  state: IntegrationState;
  endpoint?: string;
  checkedAt: string;
  message?: string;
}

export interface EvidenceEnvelope<T> {
  evidenceId: string;
  adapter: string;
  classification: "OBSERVED_LIVE" | "DECLARED_UNVERIFIED" | "SIMULATED_EXAMPLE";
  observedAt: string;
  sourceReference: string;
  subjectHash: string;
  value: T;
}

export function boundedText(value: unknown, max = 20_000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function subjectHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function fetchWithTimeout(input: string | URL, init: RequestInit = {}, timeoutMs = 15_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

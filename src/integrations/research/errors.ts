export type ResearchErrorCode =
  | "INVALID_CONFIGURATION"
  | "INVALID_INPUT"
  | "TIMEOUT"
  | "UPSTREAM_FAILURE"
  | "INVALID_RESPONSE"
  | "PROCESS_FAILURE";

export class ResearchAdapterError extends Error {
  readonly code: ResearchErrorCode;
  readonly cause?: unknown;

  constructor(code: ResearchErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "ResearchAdapterError";
    this.code = code;
    this.cause = cause;
  }
}

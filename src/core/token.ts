import crypto from "crypto";
import { stableStringify } from "./plan-ir";
import { ApprovalTokenSchema } from "./validation";
import { APPROVAL_TOKEN_SECRET } from "./config";


/**
 * Signs an approval token deterministically based on its metadata.
 */
export function signApprovalToken(token: any): string {
  // Extract signature if exists to sign the core contents
  const { signature, ...rest } = token;
  const payload = stableStringify(rest);
  return crypto
    .createHmac("sha256", APPROVAL_TOKEN_SECRET)
    .update(payload)
    .digest("hex");
}

/**
 * Cryptographically verifies an approval token, returning the validated object or throwing.
 */
export function verifyAndValidateApprovalToken(tokenInput: any): any {
  let tokenObj = tokenInput;
  if (typeof tokenInput === "string") {
    try {
      tokenObj = JSON.parse(tokenInput);
    } catch {
      try {
        // Support base64 encoded token if needed
        tokenObj = JSON.parse(Buffer.from(tokenInput, "base64").toString("utf-8"));
      } catch {
        throw new Error("Invalid token format — must be valid JSON or base64-encoded JSON");
      }
    }
  }

  // Zod structural validation
  const parsed = ApprovalTokenSchema.safeParse(tokenObj);
  if (!parsed.success) {
    throw new Error(`Token validation failed: ${parsed.error.issues.map(e => e.path.join(".") + ": " + e.message).join(", ")}`);
  }

  const token = parsed.data;

  // Cryptographic check
  const expectedSig = signApprovalToken(token);
  const isValidSig = crypto.timingSafeEqual(
    Buffer.from(token.signature, "hex"),
    Buffer.from(expectedSig, "hex")
  );

  if (!isValidSig) {
    throw new Error("Invalid token signature — cryptographic tampering detected");
  }

  // Temporal expiration check
  const now = new Date();
  const expires = new Date(token.expiresAt);
  if (now > expires) {
    throw new Error(`Token expired at ${token.expiresAt} (current time is ${now.toISOString()})`);
  }

  return token;
}

/**
 * Checks if a specific file modification is authorized by the verified approval token.
 */
export function isFileModificationAuthorized(token: any, filePath: string): boolean {
  if (!token || !Array.isArray(token.allowedFiles)) return false;
  return token.allowedFiles.includes(filePath);
}

/**
 * Verifies that the approval token's plan metadata matches the expected plan.
 */
export function verifyTokenForPlan(token: any, expectedPlanId: string, expectedCanonicalHash: string): boolean {
  if (!token) return false;
  return token.planId === expectedPlanId && token.canonicalHash === expectedCanonicalHash;
}


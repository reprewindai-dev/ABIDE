import dotenv from "dotenv";

if (typeof process !== "undefined" && typeof process.cwd === "function") {
  try {
    dotenv.config();
  } catch (err) {
    console.warn("Failed to configure dotenv:", err);
  }
}

function getSecret(name: string, fallback: string): string {
  const isBrowser = typeof window !== "undefined";
  const value = (typeof process !== "undefined" && process.env) ? process.env[name] : undefined;
  
  if (!isBrowser && typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
    if (!value || value === fallback) {
      throw new Error(`CRITICAL: Cryptographic secret ${name} is absent or set to insecure default in production!`);
    }
  }
  
  const actual = value || fallback;
  if (!isBrowser && actual.length < 16) {
    throw new Error(`CRITICAL: Cryptographic secret ${name} is too short (must be at least 16 characters)`);
  }
  return actual;
}

export const SEKED_HMAC_SECRET = getSecret("SEKED_HMAC_SECRET", "SEKED_SYSTEM_COVENANT_SECRET_SECURE_2026");
export const CONSTITUTION_SIGNING_KEY = getSecret("CONSTITUTION_SIGNING_KEY", "CONSTITUTION_GOVERNANCE_SECRET_SECURE_2026");
export const APPROVAL_TOKEN_SECRET = getSecret("APPROVAL_TOKEN_SECRET", "COVENANT_APPROVAL_TOKEN_SECRET_2026_SECURE");


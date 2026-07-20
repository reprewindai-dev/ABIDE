export type PlanStatus =
  | 'DRAFT'
  | 'COMPILED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTING'
  | 'COMPLETE'
  | 'HALTED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PlanStep {
  stepId: string;              // UUID v4
  sequence: number;            // 1-based order, immutable after compile
  capability: string;          // MCP tool name or GraphQL mutation name
  lane: 1 | 2 | 3;            // Lane 1=read, Lane 2=state, Lane 3=external
  inputSchema: Record<string, unknown>;   // JSON Schema for inputs
  expectedOutput: Record<string, unknown>; // JSON Schema for outputs
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  approvalToken?: string;      // Set after human approval
  idempotencyKey: string;      // SHA-256 of stepId + inputHash
  executedAt?: string;         // ISO 8601, set after execution
  resultHash?: string;         // SHA-256 of actual output
}

export interface PlanIR {
  planId: string;              // UUID v4, set at compile time
  version: string;             // semver e.g. "4.02.0"
  status: PlanStatus;
  tenantId: string;            // Matches RLS app.current_tenant_id
  agentId: string;             // Identity of requesting agent
  compiledAt: string;          // ISO 8601
  approvedAt?: string;         // ISO 8601, set after human approval
  intent: string;              // Raw human/agent input, max 2000 chars
  steps: PlanStep[];
  canonicalHash: string;       // SHA-256 of deterministic JSON.stringify of steps[]
  signature?: string;          // Dilithium-5 or Ed25519 sig of canonicalHash
  einsteinScore?: number;      // 0.00–1.00 probability from Einstein trend model
  ssrnValidated?: boolean;     // Whether SSRN validator passed
  x402ReservationId?: string;  // Set when payment is reserved
  pglReceiptId?: string;       // Set when PGL seals this plan
  replayable: boolean;         // Always true for APPROVED+ plans
}

// Deterministic cross-environment SHA-256 implementation
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  
  const k: number[] = [];
  const primeGenerator = function() {
    const primes: number[] = [];
    let candidate = 2;
    while (primes[lengthProperty] < 64) {
      let isPrime = true;
      for (i = 0; i < primes[lengthProperty]; i++) {
        if (candidate % primes[i] === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) {
        primes.push(candidate);
        k.push((mathPow(candidate, 1/3) * maxWord) | 0);
      }
      candidate++;
    }
  };
  primeGenerator();
  
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const wordsLength = ((asciiBitLength + 64) >> 9 << 4) + 16;
  for (i = 0; i < wordsLength; i++) words[i] = 0;
  for (i = 0; i < ascii[lengthProperty]; i++) {
    words[i >> 2] |= ascii.charCodeAt(i) << (24 - (i % 4) * 8);
  }
  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[wordsLength - 1] = asciiBitLength;
  
  for (i = 0; i < wordsLength; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);
    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[j] + (w[j] || 0);
      const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
      
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    let hex = (hash[i] >>> 0).toString(16);
    while (hex.length < 8) hex = '0' + hex;
    result += hex;
  }
  return result;
}

export function stableStringify(val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  if (Array.isArray(val)) {
    return "[" + val.map(item => stableStringify(item)).join(",") + "]";
  }
  if (typeof val === "object") {
    const keys = Object.keys(val).sort();
    return "{" + keys.map(k => `${JSON.stringify(k)}:${stableStringify(val[k])}`).join(",") + "}";
  }
  return JSON.stringify(val);
}

export function calculateBlueprintHash(blueprint: any): string {
  if (!blueprint) return "";
  const clean = JSON.parse(JSON.stringify(blueprint));
  delete clean.hash;
  delete clean.timestamp;
  delete clean.source;
  delete clean.quota_fallback;
  delete clean.fallback_message;
  delete clean.sekedTriage;
  return sha256(stableStringify(clean));
}

export function computeCanonicalHash(steps: PlanStep[]): string {
  const sortedSteps = [...steps].sort((a, b) => a.sequence - b.sequence);
  const canonical = stableStringify(sortedSteps);
  return sha256(canonical);
}

export { sha256 };

export function validatePlanIR(plan: PlanIR): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!plan.planId) errors.push('planId required');
  if (!plan.tenantId) errors.push('tenantId required');
  if (!plan.steps || plan.steps.length === 0) errors.push('plan must have at least one step');
  if (plan.canonicalHash !== computeCanonicalHash(plan.steps)) {
    errors.push('canonicalHash mismatch — plan has been tampered with');
  }
  const lane3Steps = plan.steps.filter(s => s.lane === 3);
  if (lane3Steps.some(s => !s.requiresApproval)) {
    errors.push('all Lane 3 (external) steps must require approval');
  }
  return { valid: errors.length === 0, errors };
}

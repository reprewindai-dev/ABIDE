import { createHash } from "node:crypto";
import { z } from "zod";

export const ClaimClassificationSchema = z.enum(["OBSERVED_LIVE", "DECLARED_UNVERIFIED", "SIMULATED_EXAMPLE"]);
export type ClaimClassification = z.infer<typeof ClaimClassificationSchema>;

export type Classified<T> =
  | { value: T; classification: "OBSERVED_LIVE"; observedAt: string; evidenceId: string; source: string }
  | { value: T; classification: "DECLARED_UNVERIFIED" | "SIMULATED_EXAMPLE"; source?: string };

export const ClassifiedSchema = <T extends z.ZodTypeAny>(inner: T) => z.discriminatedUnion("classification", [
  z.object({ value: inner, classification: z.literal("OBSERVED_LIVE"), observedAt: z.string(), evidenceId: z.string(), source: z.string() }),
  z.object({ value: inner, classification: z.enum(["DECLARED_UNVERIFIED", "SIMULATED_EXAMPLE"]), source: z.string().optional() }),
]);

export const EvidenceRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["TEST_RESULT", "DEPLOYMENT_LOG", "SIGNATURE", "RUNTIME_PROBE"]),
  subjectPayloadHash: z.string(),
  artifactHash: z.string().optional(),
  environment: z.string().optional(),
  outcome: z.enum(["PASSED", "FAILED", "INCONCLUSIVE"]),
  producedAt: z.string(),
  producerIdentity: z.string(),
  sourceReference: z.string(),
  signature: z.string().optional(),
  freshnessWindowDays: z.number().nonnegative(),
  supersedesEvidenceId: z.string().optional(),
});
export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;

export const GovernedCapabilityPayloadSchema = z.object({
  schemaVersion: z.literal("1.0"),
  identity: z.object({ id: z.string(), name: z.string(), schemaVersion: z.literal("1.0") }),
  declaredArchitecture: z.object({
    purpose: z.string(),
    techStack: ClassifiedSchema(z.string()),
    owner: ClassifiedSchema(z.string()),
    environments: ClassifiedSchema(z.array(z.string())),
    targetMaturity: z.enum(["UNVERIFIED_DESIGN_INTENT", "IMPLEMENTED_UNVERIFIED", "LOCALLY_VERIFIED", "INTEGRATION_VERIFIED", "SOVEREIGN_PRODUCTION"]),
  }),
  evidenceEvents: z.array(EvidenceRecordSchema),
  approvalRequirements: z.array(z.object({ role: z.string(), count: z.number().int().positive() })),
  jurisdiction: z.object({ allowedRegions: z.array(z.string()).optional(), blockedRegions: z.array(z.string()).optional() }),
  inheritance: z.object({ parentRecordId: z.string().optional(), parentRecordHash: z.string().optional(), inheritancePolicyVersion: z.string().optional(), inheritedFields: z.array(z.string()) }),
});
export type GovernedCapabilityPayload = z.infer<typeof GovernedCapabilityPayloadSchema>;

export interface SignedApproval {
  signerIdentity: string;
  role: string;
  approvedPayloadHash: string;
  signature: string;
  signedAt: string;
  expiresAt: string;
}

export interface TrustedIdentityRegistry {
  verifySignature(signerIdentity: string, payloadHash: string, signature: string): boolean;
  roleOf(signerIdentity: string): string | undefined;
  isRevoked(signerIdentity: string): boolean;
}

export interface CapabilityGovernanceRecordV1 {
  payload: GovernedCapabilityPayload;
  integrity: { canonicalHash: string; hashAlgorithm: "SHA-256" };
  approval: { signatures: SignedApproval[] };
  revision: { revision: number; priorCanonicalHash?: string; mutatedAt: string; mutatedBy: string; mutationReason: string };
}

function canonicalStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${canonicalStringify(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function computeCanonicalHash(payload: GovernedCapabilityPayload): string {
  const parsed = GovernedCapabilityPayloadSchema.parse(payload);
  return createHash("sha256").update(canonicalStringify(parsed)).digest("hex");
}

export function createRecord(payload: GovernedCapabilityPayload, mutatedBy: string, now = new Date()): CapabilityGovernanceRecordV1 {
  return {
    payload,
    integrity: { canonicalHash: computeCanonicalHash(payload), hashAlgorithm: "SHA-256" },
    approval: { signatures: [] },
    revision: { revision: 1, mutatedAt: now.toISOString(), mutatedBy, mutationReason: "initial creation" },
  };
}

export function validApprovals(record: CapabilityGovernanceRecordV1, registry: TrustedIdentityRegistry, now: Date): SignedApproval[] {
  const seen = new Set<string>();
  return record.approval.signatures.filter(signature => {
    if (seen.has(signature.signerIdentity) || signature.approvedPayloadHash !== record.integrity.canonicalHash) return false;
    if (new Date(signature.expiresAt) <= now || registry.isRevoked(signature.signerIdentity)) return false;
    if (registry.roleOf(signature.signerIdentity) !== signature.role) return false;
    if (!registry.verifySignature(signature.signerIdentity, signature.approvedPayloadHash, signature.signature)) return false;
    seen.add(signature.signerIdentity);
    return true;
  });
}

function requiredRolesMet(payload: GovernedCapabilityPayload, approvals: SignedApproval[]): boolean {
  return payload.approvalRequirements.length > 0 && payload.approvalRequirements.every(requirement =>
    approvals.filter(approval => approval.role === requirement.role).length >= requirement.count
  );
}

export type MutationCommand =
  | { kind: "UPDATE_DECLARED_ARCHITECTURE"; patch: Partial<GovernedCapabilityPayload["declaredArchitecture"]> }
  | { kind: "APPEND_EVIDENCE"; evidence: EvidenceRecord }
  | { kind: "SET_APPROVAL_REQUIREMENTS"; requirements: GovernedCapabilityPayload["approvalRequirements"] }
  | { kind: "SET_JURISDICTION"; jurisdiction: GovernedCapabilityPayload["jurisdiction"] };

export function applyMutation(record: CapabilityGovernanceRecordV1, command: MutationCommand, mutatedBy: string, reason: string, now = new Date()) {
  const payload = structuredClone(record.payload);
  switch (command.kind) {
    case "UPDATE_DECLARED_ARCHITECTURE": payload.declaredArchitecture = { ...payload.declaredArchitecture, ...command.patch }; break;
    case "APPEND_EVIDENCE": payload.evidenceEvents = [...payload.evidenceEvents, command.evidence]; break;
    case "SET_APPROVAL_REQUIREMENTS": payload.approvalRequirements = command.requirements; break;
    case "SET_JURISDICTION": payload.jurisdiction = command.jurisdiction; break;
  }
  const newHash = computeCanonicalHash(payload);
  const next = {
    payload,
    integrity: { canonicalHash: newHash, hashAlgorithm: "SHA-256" as const },
    approval: { signatures: record.approval.signatures },
    revision: { revision: record.revision.revision + 1, priorCanonicalHash: record.integrity.canonicalHash, mutatedAt: now.toISOString(), mutatedBy, mutationReason: reason },
  } satisfies CapabilityGovernanceRecordV1;
  return { record: next, event: { fromHash: record.integrity.canonicalHash, toHash: newHash, revision: next.revision.revision, mutatedBy, reason, staleSignatureCount: record.approval.signatures.filter(signature => signature.approvedPayloadHash !== newHash).length } };
}

function freshEvidence(payload: GovernedCapabilityPayload, currentHash: string, now: Date): EvidenceRecord[] {
  const latest = new Map<EvidenceRecord["type"], EvidenceRecord>();
  for (const evidence of payload.evidenceEvents) {
    const ageDays = (now.getTime() - new Date(evidence.producedAt).getTime()) / 86_400_000;
    if (evidence.subjectPayloadHash !== currentHash || ageDays < 0 || ageDays > evidence.freshnessWindowDays) continue;
    const previous = latest.get(evidence.type);
    if (!previous || new Date(evidence.producedAt) > new Date(previous.producedAt)) latest.set(evidence.type, evidence);
  }
  return [...latest.values()];
}

export function deriveObservedImplementation(payload: GovernedCapabilityPayload) {
  const passed = (type: EvidenceRecord["type"]) => payload.evidenceEvents.filter(evidence => evidence.type === type && evidence.outcome === "PASSED");
  return { compilationState: passed("TEST_RESULT").length > 0 ? "COMPILED" as const : "UNCOMPILED" as const, deployedAt: passed("DEPLOYMENT_LOG").at(-1)?.producedAt, lastRuntimeProbeAt: passed("RUNTIME_PROBE").at(-1)?.producedAt, runtimeEvidenceIds: passed("RUNTIME_PROBE").map(evidence => evidence.id) };
}

export function deriveVerificationState(record: CapabilityGovernanceRecordV1, now = new Date()): "Unverified" | "Verified" | "Drift Detected" {
  const fresh = freshEvidence(record.payload, record.integrity.canonicalHash, now);
  if (fresh.length === 0) return "Unverified";
  if (fresh.some(evidence => evidence.outcome !== "PASSED")) return "Drift Detected";
  return fresh.some(evidence => evidence.type === "RUNTIME_PROBE" || evidence.type === "DEPLOYMENT_LOG") ? "Verified" : "Unverified";
}

export type CapabilityReadiness = "READY" | "RESTRICTED" | "BLOCKED";
export function deriveCapabilityReadiness(record: CapabilityGovernanceRecordV1, registry: TrustedIdentityRegistry, now = new Date()): CapabilityReadiness {
  if (computeCanonicalHash(record.payload) !== record.integrity.canonicalHash) return "BLOCKED";
  if (!requiredRolesMet(record.payload, validApprovals(record, registry, now))) return "BLOCKED";
  if (record.payload.evidenceEvents.length === 0) return "BLOCKED";
  const fresh = freshEvidence(record.payload, record.integrity.canonicalHash, now);
  if (fresh.length === 0 || fresh.some(evidence => evidence.outcome !== "PASSED")) return "BLOCKED";
  return deriveObservedImplementation(record.payload).compilationState === "COMPILED" ? "READY" : "BLOCKED";
}

export interface ExecutionContext { region: string; environment: string; lane: 1 | 2 | 3; operationHash: string; actorIdentity: string; }
export interface OperationAuthorization { recordHash: string; planHash: string; operationHash: string; environment: string; lane: 1 | 2 | 3; budget: number; actorIdentity: string; expiresAt: string; nonce: string; idempotencyKey: string; }
export function deriveOperationAuthorization(record: CapabilityGovernanceRecordV1, registry: TrustedIdentityRegistry, context: ExecutionContext, authorization?: OperationAuthorization, now = new Date()): "AUTHORIZED" | "BLOCKED" {
  if (deriveCapabilityReadiness(record, registry, now) !== "READY" || !authorization) return "BLOCKED";
  if (record.payload.jurisdiction.blockedRegions?.includes(context.region) || (record.payload.jurisdiction.allowedRegions && !record.payload.jurisdiction.allowedRegions.includes(context.region))) return "BLOCKED";
  if (authorization.recordHash !== record.integrity.canonicalHash || authorization.operationHash !== context.operationHash || authorization.environment !== context.environment || authorization.lane !== context.lane || authorization.actorIdentity !== context.actorIdentity || new Date(authorization.expiresAt) <= now) return "BLOCKED";
  return "AUTHORIZED";
}

export function detectInheritanceCycle(record: CapabilityGovernanceRecordV1, resolveParent: (id: string) => CapabilityGovernanceRecordV1 | undefined, maxDepth = 32): boolean {
  let current: CapabilityGovernanceRecordV1 | undefined = record;
  const seen = new Set<string>();
  for (let index = 0; index < maxDepth; index++) {
    const parentId = current?.payload.inheritance.parentRecordId;
    if (!parentId) return false;
    if (seen.has(parentId)) return true;
    seen.add(parentId);
    current = resolveParent(parentId);
    if (!current) return false;
  }
  return true;
}

export function projectWorkspaceView(record: CapabilityGovernanceRecordV1, registry: TrustedIdentityRegistry, asOf: Date) {
  return { payload: record.payload, integrity: record.integrity, revision: record.revision, derived: { observedImplementation: deriveObservedImplementation(record.payload), verificationState: deriveVerificationState(record, asOf), capabilityReadiness: deriveCapabilityReadiness(record, registry, asOf) }, projectionVersion: "1.0", evaluatedAt: asOf.toISOString() };
}

export function projectAgentPacket(record: CapabilityGovernanceRecordV1, registry: TrustedIdentityRegistry, asOf: Date) {
  const readiness = deriveCapabilityReadiness(record, registry, asOf);
  return { id: record.payload.identity.id, title: record.payload.identity.name, sourceRecordHash: record.integrity.canonicalHash, capabilityReadiness: readiness, packetStatus: readiness === "READY" ? "READY" : "REVIEW_REQUIRED", projectionVersion: "1.0", evaluatedAt: asOf.toISOString() };
}

export function projectExportBundle(record: CapabilityGovernanceRecordV1, registry: TrustedIdentityRegistry, asOf: Date) {
  const view = projectWorkspaceView(record, registry, asOf);
  return { ...view, exportHash: createHash("sha256").update(canonicalStringify(view)).digest("hex") };
}

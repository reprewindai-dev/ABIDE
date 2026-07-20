import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyMutation, computeCanonicalHash, createRecord, deriveCapabilityReadiness, deriveOperationAuthorization, projectAgentPacket, validApprovals, type GovernedCapabilityPayload, type TrustedIdentityRegistry } from "../core/capability-governance";

const now = new Date("2026-07-20T12:00:00Z");
const payload: GovernedCapabilityPayload = {
  schemaVersion: "1.0",
  identity: { id: "cap-1", name: "Test Capability", schemaVersion: "1.0" },
  declaredArchitecture: { purpose: "test", techStack: { value: "TypeScript", classification: "DECLARED_UNVERIFIED" }, owner: { value: "unassigned", classification: "DECLARED_UNVERIFIED" }, environments: { value: [], classification: "DECLARED_UNVERIFIED" }, targetMaturity: "IMPLEMENTED_UNVERIFIED" },
  evidenceEvents: [], approvalRequirements: [{ role: "security-reviewer", count: 1 }], jurisdiction: {}, inheritance: { inheritedFields: [] },
};
const registry: TrustedIdentityRegistry = { verifySignature: (signer, hash, signature) => signature === `valid-sig-for-${signer}-${hash}`, roleOf: signer => signer === "alice" ? "security-reviewer" : undefined, isRevoked: () => false };

describe("CapabilityGovernanceRecordV1", () => {
  it("blocks zero evidence and emits a review-required packet", () => {
    const record = createRecord(payload, "test-harness", now);
    const approval = { signerIdentity: "alice", role: "security-reviewer", approvedPayloadHash: record.integrity.canonicalHash, signature: `valid-sig-for-alice-${record.integrity.canonicalHash}`, signedAt: now.toISOString(), expiresAt: "2099-01-01T00:00:00Z" };
    const approved = { ...record, approval: { signatures: [approval] } };
    assert.equal(validApprovals(approved, registry, now).length, 1);
    assert.equal(deriveCapabilityReadiness(approved, registry, now), "BLOCKED");
    assert.equal(projectAgentPacket(approved, registry, now).packetStatus, "REVIEW_REQUIRED");
  });

  it("rejects forged signatures and duplicate signer counting", () => {
    const record = createRecord({ ...payload, approvalRequirements: [{ role: "security-reviewer", count: 2 }] }, "test-harness", now);
    const signature = { signerIdentity: "alice", role: "security-reviewer", approvedPayloadHash: record.integrity.canonicalHash, signature: `valid-sig-for-alice-${record.integrity.canonicalHash}`, signedAt: now.toISOString(), expiresAt: "2099-01-01T00:00:00Z" };
    assert.equal(validApprovals({ ...record, approval: { signatures: [signature, signature] } }, registry, now).length, 1);
    assert.equal(validApprovals({ ...record, approval: { signatures: [{ ...signature, signerIdentity: "mallory", signature: "forged" }] } }, registry, now).length, 0);
  });

  it("changes the payload hash on typed mutation while retaining stale approvals", () => {
    const record = createRecord(payload, "test-harness", now);
    const mutation = applyMutation(record, { kind: "APPEND_EVIDENCE", evidence: { id: "ev-1", type: "TEST_RESULT", subjectPayloadHash: record.integrity.canonicalHash, outcome: "PASSED", producedAt: now.toISOString(), producerIdentity: "ci-runner", sourceReference: "ci://run/1", freshnessWindowDays: 30 } }, "test-harness", "adding evidence", now);
    assert.notEqual(mutation.record.integrity.canonicalHash, record.integrity.canonicalHash);
    assert.equal(mutation.event.fromHash, record.integrity.canonicalHash);
    assert.equal(computeCanonicalHash(mutation.record.payload), mutation.record.integrity.canonicalHash);
  });

  it("keeps exact operation authorization separate and fail-closed", () => {
    const record = createRecord(payload, "test-harness", now);
    assert.equal(deriveOperationAuthorization(record, registry, { region: "CA", environment: "prod", lane: 3, operationHash: "op", actorIdentity: "agent" }, undefined, now), "BLOCKED");
  });
});

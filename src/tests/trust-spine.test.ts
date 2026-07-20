import { describe, it } from "node:test";
import assert from "node:assert";
import http from "node:http";
import { stableStringify, calculateBlueprintHash, computeCanonicalHash, PlanStep } from "../core/plan-ir";
import { signApprovalToken, verifyAndValidateApprovalToken, isFileModificationAuthorized, verifyTokenForPlan } from "../core/token";
import { CanonicalBlueprintV1Schema, PlanIRSchema } from "../core/validation";
import { createCheckpoint, getCheckpoint } from "../core/checkpoint";
import { DEFAULT_BLUEPRINT } from "../data/defaultBlueprint";
process.env.NODE_ENV = "test";
const { app } = await import("../../server");

describe("Milestone 1: Real Trust Spine Regression Tests", () => {
  
  describe("1. Recursive Stable JSON Serialization", () => {
    it("should produce identical output regardless of property order", () => {
      const objA = { z: 1, a: { y: 2, x: 3 }, b: [1, 2, 3] };
      const objB = { b: [1, 2, 3], a: { x: 3, y: 2 }, z: 1 };

      const strA = stableStringify(objA);
      const strB = stableStringify(objB);

      assert.strictEqual(strA, strB);
    });

    it("should produce a different hash when any nested property is changed (tampering)", () => {
      const blueprint1 = {
        title: "Apex Sovereign",
        tagline: "Uncompromising security",
        timestamp: "2026-07-18T12:00:00Z",
        highLevelGoals: [{ title: "Durable Ledger", description: "Use X402", status: "PENDING" }],
        capabilities: [{
          id: "cap-1",
          name: "Sovereign Escrow",
          preconditions: ["sufficient_gas"],
          postconditions: ["payment_settled"],
          verification: { unitTests: ["escrow.rs"] }
        }]
      };

      const blueprint2 = JSON.parse(JSON.stringify(blueprint1));
      // Change a single deeply nested array value
      blueprint2.capabilities[0].verification.unitTests[0] = "tampered_escrow.rs";

      const hash1 = calculateBlueprintHash(blueprint1);
      const hash2 = calculateBlueprintHash(blueprint2);

      assert.notStrictEqual(hash1, hash2, "Nested variation must produce different hashes");
    });
  });

  describe("2. Token Signature & Tampering Verification", () => {
    it("should successfully sign and verify a pristine token", () => {
      const pristineToken = {
        issuer: "CAPPO_AUTHORIZER_MAIN",
        tenantId: "tenant-999",
        planId: "3b235378-0cf7-4fbe-9014-996ff4207901",
        canonicalHash: "ae24f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4",
        stepId: "f92b7cfa-4687-43cf-be44-fa3046124cb1",
        allowedCapability: "Sovereign Settlement Layer",
        allowedRepositories: ["https://github.com/apex/sovereign"],
        allowedFiles: ["src/scheduler/einstein.rs", "src/scheduler/telemetry.rs"],
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour in the future
        nonce: "xyz-777",
        signature: ""
      };

      const signature = signApprovalToken(pristineToken);
      pristineToken.signature = signature;

      const verified = verifyAndValidateApprovalToken(pristineToken);
      assert.strictEqual(verified.nonce, "xyz-777");
    });

    it("should reject a token if any nested property has been tampered with", () => {
      const tokenObj = {
        issuer: "CAPPO_AUTHORIZER_MAIN",
        tenantId: "tenant-999",
        planId: "3b235378-0cf7-4fbe-9014-996ff4207901",
        canonicalHash: "ae24f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4",
        stepId: "f92b7cfa-4687-43cf-be44-fa3046124cb1",
        allowedCapability: "Sovereign Settlement Layer",
        allowedRepositories: ["https://github.com/apex/sovereign"],
        allowedFiles: ["src/scheduler/einstein.rs", "src/scheduler/telemetry.rs"],
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        nonce: "xyz-777",
        signature: ""
      };

      tokenObj.signature = signApprovalToken(tokenObj);

      // Attempt tampering with allowed files
      const tamperedObj = JSON.parse(JSON.stringify(tokenObj));
      tamperedObj.allowedFiles.push("forbidden_file.sh");

      assert.throws(() => {
        verifyAndValidateApprovalToken(tamperedObj);
      }, /cryptographic tampering detected/);
    });
  });

  describe("3. Out-of-Scope Files Rejection", () => {
    it("should authorize allowed files and reject any other files", () => {
      const mockToken = {
        allowedFiles: ["src/scheduler/einstein.rs", "src/scheduler/telemetry.rs"]
      };

      assert.strictEqual(isFileModificationAuthorized(mockToken, "src/scheduler/einstein.rs"), true);
      assert.strictEqual(isFileModificationAuthorized(mockToken, "src/scheduler/telemetry.rs"), true);
      assert.strictEqual(isFileModificationAuthorized(mockToken, "unauthorized_admin_script.sh"), false);
    });
  });

  describe("4. Expired Approval Tokens Failure", () => {
    it("should reject a cryptographically valid token if it has expired", () => {
      const expiredToken = {
        issuer: "CAPPO_AUTHORIZER_MAIN",
        tenantId: "tenant-999",
        planId: "3b235378-0cf7-4fbe-9014-996ff4207901",
        canonicalHash: "ae24f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4f5a6b0c2d3e4",
        stepId: "f92b7cfa-4687-43cf-be44-fa3046124cb1",
        allowedCapability: "Sovereign Settlement Layer",
        allowedRepositories: ["https://github.com/apex/sovereign"],
        allowedFiles: ["src/scheduler/einstein.rs", "src/scheduler/telemetry.rs"],
        issuedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        nonce: "expired-999",
        signature: ""
      };

      expiredToken.signature = signApprovalToken(expiredToken);

      assert.throws(() => {
        verifyAndValidateApprovalToken(expiredToken);
      }, /Token expired/);
    });
  });

  describe("5. Invalid Schemas Reject Intake", () => {
    it("should reject a PlanIR missing required fields via Zod", () => {
      const malformedPlan = {
        planId: "3b235378-0cf7-4fbe-9014-996ff4207901",
        version: "1.0",
        // missing tenantId and steps
        intent: "Test compile malformed plan"
      };

      const result = PlanIRSchema.safeParse(malformedPlan);
      assert.strictEqual(result.success, false);
    });

    it("should reject a blueprint with invalid type structures via Zod", () => {
      const malformedBlueprint = {
        title: 12345, // Should be string
        tagline: "Test",
        highLevelGoals: []
      };

      const result = CanonicalBlueprintV1Schema.safeParse(malformedBlueprint);
      assert.strictEqual(result.success, false);
    });
  });

  describe("6. Wrong-Plan Approval-Token Rejection", () => {
    it("should detect and reject a token intended for a different plan or blueprint hash", () => {
      const correctPlanId = "plan-777";
      const correctHash = "hash-777";
      
      const token = {
        planId: correctPlanId,
        canonicalHash: correctHash
      };

      assert.strictEqual(verifyTokenForPlan(token, correctPlanId, correctHash), true);
      assert.strictEqual(verifyTokenForPlan(token, "wrong-plan-id", correctHash), false);
      assert.strictEqual(verifyTokenForPlan(token, correctPlanId, "wrong-canonical-hash"), false);
    });
  });

  describe("7. Projection Rejection for Unapproved Plans", () => {
    it("should refuse writing projection files if the plan status is not APPROVED", async () => {
      const blueprint = {
        ...DEFAULT_BLUEPRINT,
        title: "Sovereign Apex",
        tagline: "Uncompromising ledger",
        timestamp: "2026-07-18T12:00:00Z",
      };
      blueprint.hash = calculateBlueprintHash(blueprint);

      const plan = {
        planId: "9f8e7d6c-5b4a-4f2e-8d0c-9b8a7f6e5d4c",
        version: "1.0.0",
        status: "DRAFT", // NOT APPROVED
        tenantId: "tenant-999",
        agentId: "agent-999",
        compiledAt: "2026-07-18T12:00:00Z",
        intent: "Drafting a ledger projection sweep",
        steps: [],
        canonicalHash: "",
        replayable: true
      };
      plan.canonicalHash = computeCanonicalHash(plan.steps);

      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      try {
        const response = await fetch(`http://localhost:${port}/api/covenant/project`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: "agents-md",
            plan,
            blueprint,
            writeToDisk: true
          })
        });
        
        const data: any = await response.json();
        if (response.status !== 403) {
          console.error("DEBUG TEST 7 RET:", data);
        }
        assert.strictEqual(response.status, 403);
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.error, "PLAN_NOT_APPROVED");
      } finally {
        server.close();
      }
    });
  });

  describe("8. Execution Rejection & Fake PGL Receipt Prevention", () => {
    it("should reject execution requests with EXECUTOR_NOT_CONFIGURED when adapters are unconfigured", async () => {
      const origAdapter = process.env.PGL_ADAPTER_CONFIGURED;
      const origExecutors = process.env.CAPABILITY_EXECUTORS_CONFIGURED;
      delete process.env.PGL_ADAPTER_CONFIGURED;
      delete process.env.CAPABILITY_EXECUTORS_CONFIGURED;

      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      const step: PlanStep = {
        stepId: "12345678-1234-1234-1234-123456789012",
        sequence: 1,
        capability: "read_balance",
        lane: 1,
        inputSchema: {},
        expectedOutput: {},
        riskLevel: "LOW",
        requiresApproval: false,
        idempotencyKey: "key-12345"
      };

      const plan = {
        planId: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
        version: "1.0.0",
        status: "APPROVED",
        tenantId: "tenant-555",
        agentId: "agent-555",
        compiledAt: "2026-07-18T12:00:00Z",
        intent: "Execute payment",
        steps: [step],
        canonicalHash: "",
        replayable: true
      };
      plan.canonicalHash = computeCanonicalHash(plan.steps);

      try {
        const response = await fetch(`http://localhost:${port}/api/covenant/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan })
        });

        const data: any = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.error, "EXECUTOR_NOT_CONFIGURED");
      } finally {
        process.env.PGL_ADAPTER_CONFIGURED = origAdapter;
        process.env.CAPABILITY_EXECUTORS_CONFIGURED = origExecutors;
        server.close();
      }
    });
  });

  describe("9. Agent Packets Generation & Fallback Leakage Prevention", () => {
    it("should properly project compiled input details into AGENTS.md, but omit default Rust/Solidity/Go packets if none are compiled", async () => {
      const blueprint = {
        title: "Custom Sovereign Enterprise",
        tagline: "Highly verified",
        timestamp: "2026-07-18T12:00:00Z",
        hash: "",
        highLevelGoals: [],
        competitiveMoat: [],
        capabilities: [
          {
            id: "cap-ledger",
            name: "Sovereign Ledger Core",
            purpose: "Durable record keeping",
            businessOutcome: "Immutable audits",
            inputs: ["txn_payload"],
            outputs: ["block_hash"],
            maturityState: "Verified"
          }
        ],
        agentPackets: [], // Empty compilation - MUST NOT leak Rust, Solidity or Go default packets
        securityProfile: {
          authenticationMethod: "mfa",
          encryptionAtRest: true,
          transitSecurity: "tls1.3",
          auditRetentionProfile: "90days"
        }
      };
      blueprint.hash = calculateBlueprintHash(blueprint);

      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      try {
        const response = await fetch(`http://localhost:${port}/api/covenant/project`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: "agents-md",
            blueprint,
            writeToDisk: false // Preview generation
          })
        });
        
        const data: any = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(data.success, true);
        
        // Assert custom capabilities are generated
        assert.match(data.content, /Sovereign Ledger Core/);
        // Assert no leakage of Rust, Solidity or Go default packets
        assert.match(data.content, /No active work orders dispatched/);
        assert.doesNotMatch(data.content, /Rust Asynchronous Einstein Scheduler/);
        assert.doesNotMatch(data.content, /Solidity X402 Escrow Smart Contract/);
      } finally {
        server.close();
      }
    });
  });

  describe("10. Checkpoint Continuation Across Agent Projections", () => {
    it("should allow Agent B to resume and continue from a checkpoint persisted by Agent A", () => {
      // 1. Create a checkpoint as Agent A
      const checkpointAInput = {
        parentCheckpointId: null,
        blueprintHash: "hash-alpha-123",
        packetHash: "pkt-alpha-123",
        repositoryCommitSha: "commit-abc123",
        modifiedFiles: ["src/scheduler/einstein.rs"],
        testResults: { success: true, count: 8 },
        unresolvedWork: "Implement telemetry buffering",
        agentIdentity: "Agent-A"
      };

      const checkpointA = createCheckpoint(checkpointAInput);
      assert.ok(checkpointA.checkpointId.startsWith("chk-"));
      assert.strictEqual(checkpointA.agentIdentity, "Agent-A");

      // 2. Load the checkpoint and verify resume by Agent B
      const retrieved = getCheckpoint(checkpointA.checkpointId);
      assert.ok(retrieved);
      assert.strictEqual(retrieved.agentIdentity, "Agent-A");
      assert.strictEqual(retrieved.parentCheckpointId, null);

      // 3. Create continuation checkpoint as Agent B
      const checkpointBInput = {
        parentCheckpointId: checkpointA.checkpointId, // Link to A
        blueprintHash: "hash-beta-456",
        packetHash: "pkt-beta-456",
        repositoryCommitSha: "commit-def456",
        modifiedFiles: ["src/scheduler/einstein.rs", "src/scheduler/telemetry.rs"],
        testResults: { success: true, count: 12 },
        unresolvedWork: "None. Telemetry buffering complete.",
        agentIdentity: "Agent-B"
      };

      const checkpointB = createCheckpoint(checkpointBInput);
      assert.ok(checkpointB.checkpointId.startsWith("chk-"));
      assert.strictEqual(checkpointB.agentIdentity, "Agent-B");
      assert.strictEqual(checkpointB.parentCheckpointId, checkpointA.checkpointId);
    });
  });

});

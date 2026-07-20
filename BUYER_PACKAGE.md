# APEX BLUEPRINT & POLTERGEIST — BUILD-TO-EXECUTION ACCOUNTABILITY BRIEF
*Confidential. Prepared for strategic review. July 2026.*

---

## Executive Summary: Verifiable Agentic Provenance

The breakthrough in agentic software development is not the ability to write code faster, but the ability to prove that compiled software was executed safely, authorized properly, and traced directly to its source state.

**The Strategic Paradigm:**
> **Apex Blueprint** is the control plane that defines what should be built, how it should be built, what constraints apply, and what evidence must exist before the result can be trusted. **Poltergeist** is a supporting subsystem that proves which source state produced the artifact. Together, they create verifiable agent provenance from file change through build, execution, evidence, and settlement.

We define this new category as **Agentic Software Supply-Chain Provenance** (or **Build-to-Execution Accountability Infrastructure**).

---

## The Four Core Jobs of Apex Blueprint

Apex should not be reduced to just an "evidence layer." Its strategic value begins far earlier in the software development life cycle, managing the entire loop from intent through compilation to runtime audit.

1. **Intent Compilation:** Converts vague, natural language product ideas into a complete, structured, and syntactically validated engineering contract.
2. **Blueprint Authorization:** Defines strict boundaries on what the coding agent is permitted and expected to build, creating a cryptographically locked specification.
3. **Execution Verification:** Intercepts and checks whether the implementation, build pipeline, and active runtime precisely align with that authorized blueprint.
4. **Evidence Packaging:** Produces a tamper-evident, Merkle-anchored receipt proving the entire lineage of what was planned, built, tested, executed, and settled.

---

## The Canonical Blueprint Package (Pre-Code Output)

Before a coding agent writes a single line of code or touches the repository, Apex Blueprint compiles a canonical, self-contained governance package. This output contains:

*   **Product Intent:** Natural-language objectives translated to structured goals.
*   **Requirements & Capabilities:** Atomized capabilities mapping to system limits.
*   **Architecture & Interfaces:** Declared API routes, MCP tools, and SDK entry points.
*   **Data Models & Security Boundaries:** Enforced jurisdiction profiles, network isolation policies, and data classification schemas.
*   **Repository Map & Implementation Sequence:** A detailed work blueprint for the agent.
*   **Agent Work Packages:** Well-defined micro-tasks with precise scope constraints.
*   **Acceptance Criteria & Verifiable Tests:** Unit, contract, and drift checks expected post-build.
*   **Budget & Settlement Conditions:** Standardized x402 micropayment limits and escrow configurations.

---

## The Problem Every AI Coding Tool Has Not Solved

Every major AI coding tool — Cursor, Claude Code, Windsurf, Devin, GitHub Copilot — can generate code, compile artifacts, and execute binaries. However, none of them can answer the critical enterprise questions:

*   "Prove that the agent was authorized to compile and execute this specific artifact."
*   "Show me the exact repository state, dependency set, and build recipe that produced this binary."
*   "Validate that the executing binary has not been bypassed, tampered with, or modified post-build."
*   "Provide an immutable audit trail anchoring this entire build-to-execution lineage."

**The Market Reality:**
Existing enterprise controls govern repositories, CI/CD pipelines, deployments, and developer identities as separate, fragmented silos. They are ill-equipped for autonomous agents that rewrite code and execute binaries on the fly. 

Apex joins these disparate layers into a single, cohesive, agent-native evidence chain beginning at authorized intent and concluding at verifiable execution.

---

## Upstream Foundations & Veklom's Defensible Moat

### Upstream Open-Source Foundation: Poltergeist
Poltergeist is an open-source, AI-friendly universal watcher and runner originally created and maintained by **Peter Steinberger** (published as `@steipete/poltergeist` on npm, distributed via the `steipete/tap` Homebrew formula, with development based at `steipete/poltergeist`). It provides high-performance file-system watching via Watchman, automatic compilation triggering, and a fresh execution wrapper (`polter`) across Windows, Linux, and macOS.

### Veklom's Proprietary Value & Defensible Asset
Veklom's commercial opportunity and intellectual property moat lie not in owning or duplicating the underlying general-purpose file watcher. Rather, it is the **proprietary integration and attestation architecture** built on top of the Poltergeist engine. 

While IDE companies could theoretically build a simple watcher themselves, Apex delivers a model-independent, IDE-independent implementation sooner — provided the complete loop is operational, documented, independently tested, and demonstrably difficult to bypass.

This proprietary moat is composed of six distinct architectural layers:

1.  **Poltergeist Attestation Extension (Post-Build Hook):** A secure extension injected into the compilation loop. Upon compile completion, it generates a cryptographically signed manifest containing the source tree state, dependency hashes, and the build recipe.
2.  **Apex Source-to-Blueprint Mapper:** An analyzer that maps changed repository files directly to the affected capabilities of the sovereign enterprise blueprint, verifying that file mutations fall within the agent's authorized scope.
3.  **Covenant Artifact Gate (Execution Guard):** A runtime gate that intercepts execution requests. It queries the signed attestation manifest and refuses to authorize any binary whose lineage is unverified or out of spec.
4.  **Gnomledger Evidence Envelope:** A transaction sequencer that serializes the compound build-and-execution lineage, committing the Merkle root onto an immutable decentralized ledger.
5.  **IDE Integration Protocol:** A standardized Model Context Protocol (MCP) server that seamlessly delivers this trust envelope to Cursor, Claude Code, Windsurf, or Copilot on every action.
6.  **Bypass Detection:** Active process monitoring that detects when an agent attempts to execute compiled binaries directly, bypassing the governed `polter` execution wrapper, and immediately halts the container.

---

## The Build-to-Execution Accountability Chain

Trust is established by tying compile-time provenance to runtime execution. Apex enforces an **End-to-End Provenance Dependency** (formerly termed structural lock-in) using a compound cryptographic binding hash:

$$\text{Provenance Hash} = \mathcal{H}(\text{blueprint\_hash} + \text{source\_tree\_hash} + \text{dependency\_lock\_hash} + \text{build\_recipe\_hash} + \text{toolchain\_identity} + \text{environment\_policy\_hash} + \text{artifact\_hash} + \text{execution\_identity})$$

### The `apex.build-execution.v1` Receipt Schema

All execution events produce a structured, signed receipt anchored to Gnomledger:

```json
{
  "receipt_id": "rec_01J3K4X9Y8Z7W6V5U4T3S2R1QP",
  "receipt_version": "apex.build-execution.v1",
  "blueprint": {
    "hash": "sha256:d6b4129e7c38a291fbc8046b85e13d10cf2e21b7a2d3e9c4b8fa09e3cf41a12d",
    "version": "v1.4.0-rev3"
  },
  "provenance": {
    "repository": "github.com/reprewindai-dev/poltergeist",
    "commit_hash": "c530b192e48231db0c8ea23fb04e68e09f518b52",
    "source_tree_hash": "sha256:7a8f3c1d5e7b2a9c0d8e6f4a3b2c1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
    "dependency_lock_hash": "sha256:4b9e2f1a0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f",
    "build_recipe_hash": "sha256:8c7d6e5b4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d"
  },
  "toolchain": {
    "digest": "sha256:0e9d8c7b6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d",
    "identity": "rustc 1.80.0 (container-x86_64-unknown-linux-gnu)"
  },
  "artifact": {
    "hash": "sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    "file_path": "/usr/local/bin/polter"
  },
  "execution": {
    "node_id": "node_seattle_edge_04",
    "execution_identity": "auth_token_0x92f3a1b0c9d8e7f6a5b4c3d2e1f0a9b8",
    "timestamp": "2026-07-15T18:04:43Z"
  },
  "attestation": {
    "signature": "0x4f8e9a2c1b0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b",
    "signer_public_key": "0x03a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  }
}
```

---

## The Covenant Artifact Gate

The core security runtime ensures that compiled code is never executed unless its cryptographic lineage matches the authorized blueprint criteria.

### Gate Enforcement Logic

```python
# Covenant Artifact Gate Enforcement Protocol
def verify_and_execute(binary_path, authorized_source_hash, active_policy):
    # 1. Query the signed attestation manifest generated by the Poltergeist post-build hook
    manifest = query_attestation_manifest(binary_path)
    
    # 2. Enforce absolute alignment with authorized source state
    if manifest.source_tree_hash != authorized_source_hash:
        audit_log_bypass_attempt(binary_path, manifest.source_tree_hash, authorized_source_hash)
        refuse_execution("Covenant Gate Violation: Unauthorized source modifications detected post-build.")
        
    # 3. Verify dependency lock integrity
    if manifest.dependency_lock_hash != active_policy.authorized_dependencies:
        refuse_execution("Covenant Gate Violation: Unapproved third-party dependency injection detected.")
        
    # 4. Confirm the toolchain signature is compliant
    if not verify_toolchain_compliance(manifest.toolchain_digest):
        refuse_execution("Covenant Gate Violation: Unsafe compiler toolchain utilized.")
        
    # 5. Authorize and hand over execution to polter wrapper
    execute_governed_binary(binary_path, manifest.execution_identity)
```

---

## Why IDE and Enterprise Partners Need This

### Cursor, Windsurf & Claude Code Integration
IDE vendors specialize in developer experience and local file operations. Apex provides them with an instant, model-agnostic, and secure governance framework. By pointing their MCP config to the Apex gateway, their agents are instantly outfitted with **Build-to-Execution Accountability Infrastructure**:

*   **Regulated Enterprise Entry:** Allows developer teams in healthcare, defense, and banking to deploy Cursor and Claude Code with the strict supply-chain auditing their legal departments mandate.
*   **Tamper-Proof Sandboxing:** Guarantees that local file writes cannot generate unauthorized hidden executables that bypass the runtime policy.

---

## Revenue & Integration Model

### Developer Plans (Recurring SaaS)
| Tier | Price | Monthly Governed Calls | Overage Rate |
| :--- | :--- | :--- | :--- |
| **Free** | $0 | 500 | $0.005/call |
| **Builder** | $29/mo | 25,000 | $0.003/call |
| **Team** | $99/mo | 150,000 | $0.002/call |
| **Scale** | $299/mo | 1,000,000 | $0.001/call |
| **Enterprise** | Custom | Unlimited | Flat rate |

### x402 Micropayment Revenue
Every transaction over the standard quota settles via our automated x402 micropayment engine. Settlements are direct, instant, and require no manual collections. Overage scales fluidly with autonomous agent execution counts.

---

## Contact & Strategic Inquiries

| Purpose | Contact |
| :--- | :--- |
| **Strategic Licensing & Acquisition** | acquire@veklom.com |
| **IDE Integration Partnerships** | partnerships@veklom.com |
| **Enterprise White-Label Licensing** | enterprise@veklom.com |
| **Evidence Validation Verification** | https://veklom.com/evidence |

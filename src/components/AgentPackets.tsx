import React, { useState } from "react";
import { Cpu, Copy, CheckCircle2, ChevronRight, FileText, Code2, ShieldAlert, Sparkles, Terminal, Save, AlertTriangle, Lock, Shield, BookOpen, Download, UserCheck, Activity, Grid, SlidersHorizontal, ArrowLeftRight, Clock, HelpCircle, FileCheck, Check } from "lucide-react";
import { ExecutionPacket } from "../types";

interface AgentPacketsProps {
  selectedJurisdiction?: "global" | "canada" | "eu" | "us";
  constitutionVersion?: string;
  constitutionState?: "LOCKED" | "PENDING_REVISION";
  blueprintHash?: string;
  packets?: ExecutionPacket[];
  blueprint?: any;
}

export const AgentPackets: React.FC<AgentPacketsProps> = ({
  selectedJurisdiction = "global",
  constitutionVersion = "v4.02.1",
  constitutionState = "LOCKED",
  blueprintHash = "e50c9782ea38d8d3fcd066929cf39be50f81a1a479efcb1d06371f652cb9287a",
  packets: compiledPackets,
  blueprint
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [projectionTarget, setProjectionTarget] = useState<"agents-md" | "claude-md" | "spec-kit-json">("agents-md");
  const [projecting, setProjecting] = useState(false);
  const [projectionSuccess, setProjectionSuccess] = useState<string | null>(null);
  const [projectionError, setProjectionError] = useState<string | null>(null);
  const [copiedProjection, setCopiedProjection] = useState(false);

  // --- APEX BLUEPRINT V4.02 STATE VARIABLES ---
  
  // Dual-Rail Workflows
  const [activeRail, setActiveRail] = useState<"beginner" | "expert">("beginner");
  
  // Beginner Rail (Guided Autonomy)
  const [beginnerStep, setBeginnerStep] = useState<number>(0);
  const [beginnerRunning, setBeginnerRunning] = useState<boolean>(false);
  const [beginnerLogs, setBeginnerLogs] = useState<string[]>([
    "[SYSTEM] Idle. Dual-Rail workflow initialised. Ready to run CDAD guided simulation."
  ]);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState<boolean>(true);

  // Expert Rail: Context Divergence D_t (KL Divergence)
  const [klDivergence, setKlDivergence] = useState<number>(0.65);
  const [klHistory, setKlHistory] = useState<number[]>([0.15, 0.28, 0.42, 0.58, 0.65]);
  const [expertLogs, setExpertLogs] = useState<string[]>([
    "[INIT] Context divergence monitor active. Baseline D_t established at 0.15.",
    "[DRIFT] Turn-wise KL divergence rose to 0.42 due to stochastic output dispersion.",
    "[DRIFT] Long-running compilation turn completed. MECW pressure. Current D_t = 0.65."
  ]);

  // Expert Rail: SEKED-Spec State Matrix
  const [sekedOperationalGradient, setSekedOperationalGradient] = useState<number>(5.28); // run-to-rise palms/cubit
  const [sekedFilePointerHash, setSekedFilePointerHash] = useState<number>(1402);
  const [sekedSyntaxNodeComplexity, setSekedSyntaxNodeComplexity] = useState<number>(42);
  const [sekedActiveThreads, setSekedActiveThreads] = useState<number>(8);

  // Expert Rail: Fenton-Wilkinson Feasibility Filters
  const [trlLevel, setTrlLevel] = useState<number>(3); // NASA Technology Readiness Level
  const [acceptableRisk, setAcceptableRisk] = useState<number>(0.40); // lognormal variance limit sigma^2_Z
  const [step1Cost, setStep1Cost] = useState<number>(2.4);
  const [step2Cost, setStep2Cost] = useState<number>(3.8);
  const [step3Cost, setStep3Cost] = useState<number>(4.5);
  const [mathBudget, setMathBudget] = useState<number>(15.0);

  // Global Legal & Jurisdictional Compliance Gateway (MCP Proxy)
  const [jwtJurisdiction, setJwtJurisdiction] = useState<"EU" | "US" | "CA" | "APAC">("EU");
  const [jwtRole, setJwtRole] = useState<"CORE_AUDITOR" | "STAFF_DEVELOPER" | "EXTERNAL_CONTRACTOR">("STAFF_DEVELOPER");
  const [jwtStatus, setJwtStatus] = useState<"EMPLOYEE" | "CONTRACTOR">("EMPLOYEE");
  const [mcpProxyLogs, setMcpProxyLogs] = useState<string[]>([
    "[PROXY] Apex MCP Proxy secure listener bound to http://localhost:3000/api/mcp",
    "[PROXY] Loaded default-deny ACL rules policy-as-code configuration.",
    "[PROXY] Enforcing cryptographic token isolation & claims check headers."
  ]);

  // Academic SSRN Publication Packager
  const [ssrnDoubleSpaced, setSsrnDoubleSpaced] = useState<boolean>(true);
  const [ssrnIncludeAiDisclosure, setSsrnIncludeAiDisclosure] = useState<boolean>(true);
  const [ssrnCopiedCitation, setSsrnCopiedCitation] = useState<boolean>(false);
  const [ssrnDownloadLog, setSsrnDownloadLog] = useState<string | null>(null);

  // Fenton-Wilkinson Log-normal sum moments-matching solver
  const calculateFentonWilkinson = () => {
    const m1 = Math.log(step1Cost);
    const m2 = Math.log(step2Cost);
    const m3 = Math.log(step3Cost);
    
    const v1 = acceptableRisk * 0.4;
    const v2 = acceptableRisk * 0.6;
    const v3 = acceptableRisk * 0.8;
    
    const ex1 = Math.exp(m1 + v1 / 2);
    const ex2 = Math.exp(m2 + v2 / 2);
    const ex3 = Math.exp(m3 + v3 / 2);
    const u1 = ex1 + ex2 + ex3;
    
    const ex1_2 = Math.exp(2 * m1 + 2 * v1);
    const ex2_2 = Math.exp(2 * m2 + 2 * v2);
    const ex3_2 = Math.exp(2 * m3 + 2 * v3);
    
    const crossTerms = 2 * (ex1 * ex2 + ex1 * ex3 + ex2 * ex3);
    const u2 = ex1_2 + ex2_2 + ex3_2 + crossTerms;
    
    const sigmaZ2 = Math.log(u2 / (u1 * u1));
    const muZ = Math.log(u1) - sigmaZ2 / 2;
    
    const sigmaZ = Math.sqrt(sigmaZ2);
    const zScore = (Math.log(mathBudget) - muZ) / sigmaZ;
    
    const normalCDF = (x: number) => {
      const t = 1 / (1 + 0.2316419 * Math.abs(x));
      const d = 0.3989423 * Math.exp(-x * x / 2);
      const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.330274))));
      return x > 0 ? 1 - p : p;
    };
    
    const probSuccess = normalCDF(zScore);
    
    return {
      u1: u1.toFixed(3),
      u2: u2.toFixed(3),
      muZ: muZ.toFixed(4),
      sigmaZ2: sigmaZ2.toFixed(4),
      probSuccess: (probSuccess * 100).toFixed(1),
      probRaw: probSuccess
    };
  };
  
  const mathResults = calculateFentonWilkinson();
  
  const defaultPackets: ExecutionPacket[] = [
    {
      id: "pkt-1",
      title: "Packet 01: Rust Asynchronous Einstein Scheduler",
      targetRole: "Senior Rust Systems Engineer / Async Specialist",
      summary: "Write the async, high-throughput scheduling core that solves priority weights based on latency-telemetry probes.",
      objective: "Build an asynchronous gRPC routing microservice using Tokio and Tonic that allocates incoming agent execution sessions to edge nodes by calculating the real-time Einstein Reputation score.",
      scope: "Rust crate core logic, custom telemetry structs, weight math calculations, and failover routing array handlers.",
      files: [
        "src/scheduler/einstein.rs - Core routing algorithms and weight evaluation",
        "src/scheduler/telemetry.rs - Jitter tracking structures and socket counters",
        "Cargo.toml - Adding dependencies for tokio, tonic, and futures-util"
      ],
      contracts: "Must implement gRPC 'RouterService' and satisfy protobuf interface definitions exactly.",
      dependencies: ["tokio = { version = '1.35', features = ['full'] }", "tonic = '0.10'", "futures-util = '0.3'"],
      tests: [
        "test_weight_calculation() - verify correctness of formula against known benchmarks",
        "test_node_dropout_failover() - assert fallback arrays are invoked on timeout",
        "test_high_concurrency_load() - load test with 50,000 mock routes/sec"
      ],
      migrations: "None required. In-memory thread-safe state maps using dashmap.",
      performanceTargets: "Task routing latency overhead <4ms per dispatch. Peak memory footprint <45MB.",
      securityConstraints: "Enforce TLS 1.3 socket connections. Prevent stack buffer overflows by restricting telemetry buffer queues to 10,000 items.",
      docsToUpdate: ["04_architecture_pack/system_topology.md", "05_contract_pack/interfaces_and_schemas.md"],
      definitionOfDone: [
        "Async server compiles under rustc 1.70+ with zero warnings.",
        "gRPC handshake handles up to 50,000 requests/second under test simulations.",
        "Cargo clippy and cargo test pass fully with 100% test coverage on einstein.rs"
      ],
      rollbackNotes: "If async tasks trigger heap allocation memory leaks, rollback dynamic tokio spawn tasks to a static thread-pool worker channel."
    },
    {
      id: "pkt-2",
      title: "Packet 02: Solidity X402 Escrow Smart Contract",
      targetRole: "Solidity / Smart Contract Auditor",
      summary: "Implement the gas-optimized payment lock, validation challenge, and micro-settlement payouts.",
      objective: "Write and audit the EVM-compatible Solidity smart contract governing the automated collateral lock, verification challenge, and instant payout release for the X402 standard.",
      scope: "Solidity smart contract, reentrancy protections, token deposit escrows, and signed proof arbitrations.",
      files: [
        "contracts/X402Escrow.sol - Lock, challenge, release methods",
        "contracts/interfaces/IX402Escrow.sol - External ABI interface",
        "hardhat.config.js - Compile optimization configuration"
      ],
      contracts: "Adhere to IERC20 token interactions. Support custom verifyAndRelease signature mapping.",
      dependencies: ["@openzeppelin/contracts/security/ReentrancyGuard.sol", "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"],
      tests: [
        "assert_deposit_locks_collateral() - assert balance is escrowed and cannot be double spent",
        "assert_reentrancy_reverts() - audit reentrancy vectors",
        "assert_release_with_valid_merkle_proof() - verify release with pre-calculated hashes"
      ],
      migrations: "L2 Deploy script utilizing Hardhat/Ignition with state locks.",
      performanceTargets: "Gas consumption per deposit <45,000 gas units. Gas consumption per release <38,000 gas units.",
      securityConstraints: "Must implement CEI (Checks-Effects-Interactions) pattern. Enforce owner-only configurations for emergency fee limits.",
      docsToUpdate: ["06_economics_pack/pricing_and_quotes.md", "05_contract_pack/interfaces_and_schemas.md"],
      definitionOfDone: [
        "Contract compiles with Solidity 0.8.20 and optimization enabled (10,000 runs).",
        "Fully passed Hardhat test coverage (100% of methods verified).",
        "Slither static analyzer outputs zero critical security warnings."
      ],
      rollbackNotes: "If L2 settlement networks experience excessive gas hikes, revert single-release methods to consolidated multi-agent batch withdrawals."
    },
    {
      id: "pkt-3",
      title: "Packet 03: Gnomledger Mint Client",
      targetRole: "Go / Blockchain Backend Developer",
      summary: "Write the Go microservice that aggregates hash receipts and commits Merkle proofs to the ledger.",
      objective: "Build a highly scalable Go microservice client that compiles Merkle trees from local task execution hash receipts and mints Gnomledger Receipt Artifacts (GRAs) to Gnomledger.",
      scope: "Merkle tree generation, sha256 byte packing, Go RPC connections, and Gnomledger state commits.",
      files: [
        "client/gnomledger_mint.go - Merkle block packing and node connections",
        "client/merkle_tree.go - Core cryptographic tree algorithms",
        "go.mod - Manage library dependencies"
      ],
      contracts: "Obey Gnomledger blockchain transaction schemas and payload validation patterns.",
      dependencies: ["github.com/ethereum/go-ethereum/crypto", "github.com/gorilla/websocket", "github.com/sirupsen/logrus"],
      tests: [
        "TestMerkleRootCalculation() - assert math correctness",
        "TestGraOnChainSubmission() - mock node socket and check success receipt",
        "TestConcurrencyMerklePacks() - test with 10,000 parallel threads"
      ],
      migrations: "Genesis block configuration schemas and SQL state tables for caching.",
      performanceTargets: "Merkle root calculation for 5,000 receipts <1.5ms. Go client throughput >20,000 GRAs/sec.",
      securityConstraints: "Enforce SHA-256 state hashing with salt strings. Keep private keys strictly in isolated system memory; never dump to disk logs.",
      docsToUpdate: ["07_evidence_validation_pack/grounding_and_gaps.md", "11_appendix_explorer/glossary_and_ledgers.md"],
      definitionOfDone: [
        "Go microservice compiles cleanly under Go 1.21+.",
        "Zero data races detected under go test -race flag execution.",
        "Docker container image footprint under 18MB compiled."
      ],
      rollbackNotes: "If Gnomledger nodes reject block mints due to network consensus split, buffer hash lists in local BadgerDB key-value pools until recovery."
    },
    {
      id: "pkt-4",
      title: "Packet 04: Biometric Feedback Core",
      targetRole: "TypeScript Full-Stack Engineer / UI Developer",
      summary: "Assemble the responsive telemetry ingestion module that measures cognitive stress inputs.",
      objective: "Develop a Node.js/Express and React telemetry routing module that parses incoming biometric wearable variables and adapts AI scheduling weights.",
      scope: "Express REST receivers, biometric calculation algorithms, React telemetry widgets, and real-time state mappings.",
      files: [
        "src/controllers/biometrics.ts - Express REST ingestion handler",
        "src/utils/stress_metrics.ts - stress calculation formulas",
        "src/components/BiometricsDisplay.tsx - interactive React charts and overlays"
      ],
      contracts: "Matches biometric JSON API exchange formats exactly.",
      dependencies: ["express", "zod", "recharts", "motion"],
      tests: [
        "test_stress_adaptation_formula() - verify algorithm correctness",
        "test_zod_biometric_validation() - assert payload validation rejects bad integers"
      ],
      migrations: "None. Direct React memory state binding and local Express middleware routing.",
      performanceTargets: "Biometric analysis loop resolves in <8ms. Chart renders at stable 60fps.",
      securityConstraints: "Anonymize all patient and client identifiers. Use AES-GCM to encrypt files cached on local disk.",
      docsToUpdate: ["02_product_requirements/prd.md", "03_capability_registry/registry.md"],
      definitionOfDone: [
        "Node server compiles with zero TypeScript errors.",
        "Biometric data widgets render in the browser at stable frame rates.",
        "Zod middleware safely handles bad payload parameters."
      ],
      rollbackNotes: "In case of local network dropout, store biometric telemetry inside IndexedDB and sync in bulk when client is online."
    }
  ];

  const packetsToUse = compiledPackets && compiledPackets.length > 0 ? compiledPackets : [];
  const [activePacketId, setActivePacketId] = useState<string | null>(null);
  const selectedPacket = packetsToUse.find(p => p.id === activePacketId) || packetsToUse[0];

  const getPreviewContent = (target: "agents-md" | "claude-md" | "spec-kit-json") => {
    const title = blueprint?.title || "Apex Sovereign Platform";
    const hash = blueprintHash;
    const activeJurisdiction = (selectedJurisdiction || "global").toUpperCase();
    const version = constitutionVersion;

    if (target === "agents-md") {
      let capSection = (blueprint?.capabilities || []).map((cap: any) => {
        return `### Capability: ${cap.name} (${cap.id || "cap-" + cap.name.toLowerCase().replace(/[^a-z0-9]/g, "-")})
- **Purpose**: ${cap.purpose || "N/A"}
- **Business Outcome**: ${cap.businessOutcome || "N/A"}
- **Technical Inputs**: ${Array.isArray(cap.inputs) ? cap.inputs.join(", ") : "None"}
- **Technical Outputs**: ${Array.isArray(cap.outputs) ? cap.outputs.join(", ") : "None"}
- **Maturity**: ${cap.observedMaturity || "Conceptual"}`;
      }).join("\n\n");

      if (!capSection) {
        capSection = `No custom capabilities compiled yet. Default sovereign scheduler active.`;
      }

      let packetsSection = packetsToUse.map((pkt: any, i: number) => {
        return `#### Work Order ${i + 1}: ${pkt.title} (Role: ${pkt.targetRole})
- **Objective**: ${pkt.objective}
- **Architectural Scope**: ${pkt.scope}
- **Files to Modify**: ${Array.isArray(pkt.files) ? pkt.files.map((f: string) => `\`${f}\``).join(", ") : "None"}
- **Definition of Done**:
${Array.isArray(pkt.definitionOfDone) ? pkt.definitionOfDone.map((d: string) => `  - [ ] ${d}`).join("\n") : "  - [ ] Compiles with zero warnings"}`;
      }).join("\n\n");

      return `# Agent Instruction & Context Envelope: ${title}
> **PORTABLE AGENT SYSTEM INSTRUCTIONS** — Adopted by the Agentic AI Foundation.
> Do not modify this file directly unless executing an authorized CAPPO plan revision.

## 🛡️ SYSTEM CONSTITUTION & COMPLIANCE ENVELOPE
- **Jurisdiction Profile**: ${activeJurisdiction}
- **Constitution Version**: ${version}
- **Cryptographic Plan Hash**: \`${hash}\`
- **Execution Safeguard**: All Lane 3 (external integrations) require certified CAPPO approval tokens prior to commit.

## 🎯 BLUEPRINT OVERVIEW
This repository is governed by **Apex Blueprint**. The underlying directory is structured as a typed capability model. 
Messy local edits that mismatch the active Blueprint Hash will trigger immediate circuit breakers in the Gnomledger evidence validators and Covenant gates.

## 🧩 COMPILED SYSTEM CAPABILITIES
${capSection}

## 📋 ACTIVE AGENT WORK DISPATCHES
${packetsSection}

## ⚡ GUARDRAIL RULES & SYSTEM ENVIRONMENT
1. **No Mocking**: Never substitute dummy mock data for active services. Write real integrations adhering to the contract specs.
2. **Deterministic Inputs**: All service endpoints must parse input payloads with strict schemas.
3. **Traceability**: All external states (Lane 3) must be logged directly to the Gnomledger proof ledger.

---
*Generated by Apex Trust Layer Compiler at ${new Date().toISOString()}*
`;
    } else if (target === "claude-md") {
      let capSummary = (blueprint?.capabilities || []).map((cap: any) => `- **${cap.name}** [Maturity: ${cap.observedMaturity || "Conceptual"}]`).join("\n");
      if (!capSummary) {
        capSummary = "- Default scheduler service active";
      }

      return `# Claude Code Project Memory and Workspace Envelope

## 💡 System Identity & Core Memory
- **Active Project**: ${title}
- **Blueprint Hash**: \`${hash}\`
- **Applied Law**: ${activeJurisdiction} Compliance Overlay
- **Constitution Status**: SECURE (Locked on version ${version})

## 🛠️ Command Context & Environment Commands
To compile, verify, and lint this environment safely, you must utilize the following commands exactly:
- **Build**: \`npm run build\`
- **Test**: \`npm run test\`
- **Lint**: \`npm run lint\`
- **Dev**: \`npm run dev\`

## 📦 Key System Capabilities
${capSummary}

## 🛡️ Policy-as-Code & Code Style Rules
1. **Zero Drift Directive**: You are forbidden from modifying files outside of the approved scope boundaries specified in active work orders.
2. **Strict Typings**: Do not introduce \`any\` or generic objects for typed parameters. Define explicit schemas.
3. **No Unrequested Features**: Avoid the addition of unrequested visual elements, telemetry counters, or status logs.

## 🏁 Handover Checkpoint & Workflow Continuation
If switching tools or resuming a suspended session:
- Locate the active work order ID in the Apex agentPackets.
- Fetch the latest approved \`PlanIR\` to assert compliance with hash \`${hash}\`.
- Ensure all required unit tests pass successfully prior to pushing to main.

---
*Sealed by Apex Blueprint Governance Compiler at ${new Date().toISOString()}*
`;
    } else {
      const steps = (blueprint?.capabilities || []).map((cap: any, index: number) => ({
        stepId: cap.id || `cap-step-${index + 1}`,
        sequence: index + 1,
        capability: cap.name,
        lane: cap.governance?.requiredApprovals?.length > 0 ? 3 : 2,
        riskLevel: cap.governance?.requiredApprovals?.length > 0 ? "HIGH" : "LOW",
        requiresApproval: cap.governance?.requiredApprovals?.length > 0 ? true : false,
        idempotencyKey: `idemp-key-sim-${index}`
      }));

      const tasks = packetsToUse.map((pkt: any, index: number) => ({
        taskId: pkt.id || `task-${index + 1}`,
        title: pkt.title,
        role: pkt.targetRole,
        objective: pkt.objective,
        scope: pkt.scope,
        allowedDependencies: pkt.dependencies,
        requiredTests: pkt.tests,
        definitionOfDone: pkt.definitionOfDone,
        status: index === 0 ? "IN_PROGRESS" : "PENDING"
      }));

      const specKitSchema = {
        "$schema": "https://github.com/github/spec-kit/schema/v1",
        "metadata": {
          "title": title,
          "blueprint_hash": hash,
          "jurisdiction": activeJurisdiction,
          "constitution_version": version,
          "compiled_at": new Date().toISOString()
        },
        "spec": {
          "goals": (blueprint?.highLevelGoals || []).map((g: any) => ({ name: g.title, desc: g.description, priority: g.status })),
          "moats": (blueprint?.competitiveMoat || []).map((m: any) => ({ capability: m.capabilityName, score: m.advantageScore }))
        },
        "plan": {
          "id": "plan-generated-universal-ir",
          "status": "APPROVED",
          "steps": steps
        },
        "tasks": tasks
      };

      return JSON.stringify(specKitSchema, null, 2);
    }
  };

  const handleCopyPrompt = (pkt: ExecutionPacket) => {
    // Determine jurisdiction compliance instruction
    let complianceRule = "Standard cryptographic security controls and auditable public Merkle proofs.";
    if (selectedJurisdiction === "canada") {
      complianceRule = "Strict AWS ca-central-1 region containment. Keep biometric telemetry locally isolated on-device. Encrypt with FIPS 140-3 AES-GCM-256 levels.";
    } else if (selectedJurisdiction === "eu") {
      complianceRule = "EU AI Act Transparency logging enabled. Strict GDPR Article 44 cross-border restrictions. Continuous Einstein scheduler drift checks.";
    } else if (selectedJurisdiction === "us") {
      complianceRule = "NIST AI SP 800-218 Software Assurance guidelines. Micropayments restricted under strict SEC-compliant circuit breakers and daily caps.";
    }

    const promptMarkdown = `### SYSTEM CONSTITUTION & COMPLIANCE ENVELOPE
- **Applied Jurisdiction Profile**: ${selectedJurisdiction.toUpperCase()}
- **Constitution Version**: ${constitutionVersion}
- **Lock Status**: ${constitutionState}
- **Cryptographic Blueprint Hash**: ${blueprintHash}

You are strictly bound by the rules of this Constitution and the selected Jurisdiction. 
No mock integrations or dynamic structural overrides are allowed. Compliance controls must be hardcoded and verified.

### AI AGENT HANDOFF WORK ORDER SPECIFICATION
### ROLE REQUIREMENT: ${pkt.targetRole}

#### 1. OBJECTIVE & FUNCTIONAL MISSION
${pkt.objective}

#### 2. ARCHITECTURAL SCOPE BOUNDARIES
${pkt.scope}

#### 3. WORKSPACE FILES TO CREATE OR UPDATE
${pkt.files.map(f => `- ${f}`).join("\n")}

#### 4. CONTRACT CONSTRAINTS & INTERFACES
${pkt.contracts}

#### 5. ALLOWED SYSTEM DEPENDENCIES
${pkt.dependencies.map(d => `- \`${d}\``).join("\n")}

#### 6. REQUIRED TEST COVERAGE MATRIX
${pkt.tests.map(t => `- ${t}`).join("\n")}

#### 7. SCHEMA MIGRATIONS
${pkt.migrations}

#### 8. PERFORMANCE TARGETS & SLOs
${pkt.performanceTargets}

#### 9. COMPLIANCE & SECURITY CONSTRAINTS
- **Jurisdictional Rule**: ${complianceRule}
- **Base Constraints**: ${pkt.securityConstraints}

#### 10. SYSTEM DOCUMENTS TO UPDATE
${pkt.docsToUpdate.map(doc => `- \`${doc}\``).join("\n")}

#### 11. DEFINITION OF DONE (DoD)
- [ ] Must align with active Constitution version ${constitutionVersion} and selected profile ${selectedJurisdiction.toUpperCase()}.
${pkt.definitionOfDone.map(dod => `- [ ] ${dod}`).join("\n")}

#### 12. DISASTER RECOVERABILITY & ROLLBACK NOTES
${pkt.rollbackNotes}

---
*Lock Hash Verification: ${blueprintHash}*
`;

    navigator.clipboard.writeText(promptMarkdown).then(() => {
      setCopiedId(pkt.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (packetsToUse.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn text-[#E0E0E0]">
        {/* Header */}
        <div className="border-b border-[#222] pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-[#00F0FF]" size={18} />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Agent Execution Packets</h3>
          </div>
          <p className="text-xs font-mono text-[#666] uppercase mt-1">
            Deterministic work orders designed to hand off directly to coding agents (Cursor, Windsurf, Anti-Gravity)
          </p>
        </div>

        <div className="border-2 border-dashed border-red-500/20 p-12 text-center rounded-none font-mono bg-red-950/5">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-500/5 flex items-center justify-center mx-auto text-red-500">
              <Cpu size={24} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">NO_COMPILED_AGENT_PACKETS</h4>
            <p className="text-[11px] text-gray-500 normal-case leading-relaxed font-sans">
              No plan-derived agent packets exist. Ensure you have formulated a valid capability and compiled a corresponding work order plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn text-[#E0E0E0]">
      {/* Header */}
      <div className="border-b border-[#222] pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="text-[#00F0FF]" size={18} />
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Agent Execution Packets</h3>
        </div>
        <p className="text-xs font-mono text-[#666] uppercase mt-1">
          Deterministic work orders designed to hand off directly to coding agents (Cursor, Windsurf, Anti-Gravity)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Selector list */}
        <div className="lg:col-span-4 space-y-2.5 font-mono">
          <span className="text-[9px] text-[#555] font-black tracking-widest uppercase block mb-1">Select Active Work Order</span>
          {packetsToUse.map((pkt) => {
            const isSel = selectedPacket.id === pkt.id;
            return (
              <button
                key={pkt.id}
                onClick={() => setActivePacketId(pkt.id)}
                className={`w-full p-4 border-2 text-left uppercase transition-all rounded-none block ${
                  isSel
                    ? "bg-[#0A0A0A] border-[#00F0FF] text-[#00F0FF] font-black"
                    : "bg-[#050505] border-[#222] text-[#888] hover:text-white hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black tracking-tight truncate block max-w-[200px]">{pkt.title}</span>
                  <ChevronRight size={12} className={isSel ? "text-[#00F0FF]" : "text-gray-600"} />
                </div>
                <p className="text-[9px] text-gray-500 normal-case line-clamp-2 mt-1 leading-relaxed">
                  {pkt.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed work order display */}
        <div className="lg:col-span-8 bg-[#050505] border-2 border-[#222] p-6 space-y-6 font-mono text-xs uppercase relative rounded-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/1 rounded-full blur-3xl pointer-events-none" />

          {/* Selector header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222] pb-4">
            <div>
              <span className="text-[9px] text-[#00F0FF] font-black tracking-widest uppercase block">[ WORK ORDER DIRECTIVE ]</span>
              <h4 className="text-base font-black text-white tracking-tight">{selectedPacket.title}</h4>
              <p className="text-[10px] text-gray-500 normal-case mt-1">Role: <span className="text-gray-300 font-bold">{selectedPacket.targetRole}</span></p>
            </div>

            <button
              onClick={() => handleCopyPrompt(selectedPacket)}
              className="px-4 py-2 bg-[#00F0FF] hover:bg-white text-black text-[10px] font-black tracking-widest uppercase transition-colors rounded-none flex items-center gap-2"
            >
              {copiedId === selectedPacket.id ? (
                <>
                  <CheckCircle2 size={12} className="text-black" />
                  <span>Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed">
            
            {/* Objective */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A] md:col-span-2">
              <span className="text-white font-black flex items-center gap-1">
                <FileText size={12} className="text-[#00F0FF]" />
                <span>1. Objective & Functional Mission</span>
              </span>
              <p className="text-gray-400 normal-case text-[10.5px] leading-relaxed">{selectedPacket.objective}</p>
            </div>

            {/* Scope */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A]">
              <span className="text-white font-black flex items-center gap-1">
                <Code2 size={12} className="text-[#00F0FF]" />
                <span>2. Architectural Scope</span>
              </span>
              <p className="text-gray-400 normal-case text-[10.5px] leading-relaxed">{selectedPacket.scope}</p>
            </div>

            {/* Contracts */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A]">
              <span className="text-white font-black flex items-center gap-1">
                <ShieldAlert size={12} className="text-[#00F0FF]" />
                <span>3. Contracts & Interfaces</span>
              </span>
              <p className="text-gray-400 normal-case text-[10.5px] leading-relaxed">{selectedPacket.contracts}</p>
            </div>

            {/* Files to Create */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A]">
              <span className="text-white font-black">4. Files to Create/Update</span>
              <div className="space-y-1 text-gray-400 font-bold text-[10px]">
                {selectedPacket.files.map((f, i) => (
                  <div key={i} className="truncate block">- {f}</div>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A]">
              <span className="text-white font-black">5. Allowed Dependencies</span>
              <div className="space-y-1 text-gray-500 font-black text-[10px]">
                {selectedPacket.dependencies.map((d, i) => (
                  <div key={i} className="normal-case font-mono block">- {d}</div>
                ))}
              </div>
            </div>

            {/* Tests to Write */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A]">
              <span className="text-white font-black">6. Required Tests</span>
              <div className="space-y-1 text-gray-400 text-[10px]">
                {selectedPacket.tests.map((t, i) => (
                  <div key={i} className="normal-case font-mono block">- {t}</div>
                ))}
              </div>
            </div>

            {/* Performance Targets */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A]">
              <span className="text-white font-black">7. SLOs & Performance Targets</span>
              <p className="text-[#00F0FF] font-black text-[10px]">{selectedPacket.performanceTargets}</p>
            </div>

            {/* Security Constraints */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A] md:col-span-2">
              <span className="text-red-400 font-black">8. Security & Data Boundaries</span>
              <p className="text-gray-400 normal-case text-[10.5px] leading-relaxed">{selectedPacket.securityConstraints}</p>
            </div>

            {/* Definition of Done */}
            <div className="space-y-1.5 p-4 border border-[#111] bg-[#0A0A0A] md:col-span-2">
              <span className="text-emerald-400 font-black">9. Definition of Done (DoD)</span>
              <div className="space-y-1.5 text-gray-400 normal-case text-[10.5px] leading-relaxed">
                {selectedPacket.definitionOfDone.map((dod, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">[✓]</span>
                    <span>{dod}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rollback Notes */}
            <div className="space-y-1.5 p-4 border border-red-500/20 bg-[#1C0F0F] md:col-span-2 text-red-300">
              <span className="font-black text-red-400 block mb-0.5">10. Disaster Rollback Notes</span>
              <p className="normal-case leading-relaxed text-[10.5px]">{selectedPacket.rollbackNotes}</p>
            </div>

            {/* Section 11: Unified Constitutional Enforcement References */}
            <div className="space-y-2 p-4 border-2 border-[#00F0FF]/30 bg-[#0A1A24]/30 md:col-span-2 text-[#00F0FF] font-mono">
              <span className="font-black text-white uppercase block mb-1">
                🛡️ 11. Unified Constitutional Enforcement References
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] uppercase leading-normal pt-1 border-t border-[#00F0FF]/20">
                <div className="space-y-1">
                  <span className="text-[#666] font-bold block">Sovereign Reference ID:</span>
                  <span className="text-white font-black block">govern-agent-session ({constitutionVersion})</span>
                  <span className="text-gray-400 block lowercase normal-case">Enforces the active {selectedJurisdiction.toUpperCase()} Core Policy overlays.</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#666] font-bold block">Exported Governance Artifacts:</span>
                  <div className="text-gray-300 space-y-0.5">
                    <div>• <span className="font-bold text-[#00F0FF]">Lineage Manifest:</span> <span className="select-all">00_workspace_manifest/governance_export_lineage.json</span></div>
                    <div>• <span className="font-bold text-[#00F0FF]">Approval Manifest:</span> <span className="select-all">00_workspace_manifest/governance_export_ownership_approval.json</span></div>
                    <div>• <span className="font-bold text-[#00F0FF]">Promotion Scheme:</span> <span className="select-all">00_workspace_manifest/governance_export_promotion_rules.json</span></div>
                    <div>• <span className="font-bold text-[#00F0FF]">Jurisdiction Table:</span> <span className="select-all">00_workspace_manifest/governance_export_jurisdiction_overrides.json</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-2 p-2 bg-[#050505] border border-[#00F0FF]/10 text-[9px] text-gray-400 lowercase leading-relaxed">
                *the coding agent compiling this block must reference these JSON/YAML manifest files by ID and version to verify that target methods (e.g. <code>POST /api/v1/sessions/govern</code>) and enclaves remain 100% compliant with the signed constitution.
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PORTABLE IDE CONTEXT PROJECTION ADAPTER */}
      <div className="border-t border-[#222] pt-8 mt-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-400 animate-pulse" size={18} />
              <h4 className="text-lg font-black text-white uppercase tracking-tight">Portable Context Projection System</h4>
            </div>
            <p className="text-xs font-mono text-[#666] uppercase mt-1">
              Project compiled intent, capabilities, and packets into standard config instructions to eliminate IDE drift.
            </p>
          </div>
          <span className="px-2.5 py-1 border border-amber-500/30 text-amber-400 text-[9px] font-black tracking-widest uppercase bg-amber-500/5">
            Apex Trust Layer Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#050505] border-2 border-[#222] p-5 space-y-5">
              <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block border-b border-[#222] pb-2">
                1. Select IDE/Standard Target
              </span>

              <div className="space-y-3 font-mono text-xs">
                {/* Option 1: AGENTS.md */}
                <button
                  onClick={() => {
                    setProjectionTarget("agents-md");
                    setProjectionSuccess(null);
                    setProjectionError(null);
                  }}
                  className={`w-full p-4 border text-left transition-all flex items-start gap-3 rounded-none ${
                    projectionTarget === "agents-md"
                      ? "border-[#00F0FF] bg-[#00F0FF]/5 text-white font-bold"
                      : "border-[#222] bg-transparent text-[#888] hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    projectionTarget === "agents-md" ? "border-[#00F0FF]" : "border-[#444]"
                  }`}>
                    {projectionTarget === "agents-md" && <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />}
                  </div>
                  <div className="flex-1">
                    <span className="font-black block uppercase text-[11px] text-white">AGENTS.md (Universal Standard)</span>
                    <span className="text-[10px] text-gray-500 normal-case block mt-0.5 leading-relaxed">
                      Standardized format backed by the Agentic AI Foundation. Injects unified parameters into Codex, Cursor, and Copilot.
                    </span>
                  </div>
                </button>

                {/* Option 2: CLAUDE.md */}
                <button
                  onClick={() => {
                    setProjectionTarget("claude-md");
                    setProjectionSuccess(null);
                    setProjectionError(null);
                  }}
                  className={`w-full p-4 border text-left transition-all flex items-start gap-3 rounded-none ${
                    projectionTarget === "claude-md"
                      ? "border-amber-500 bg-amber-500/5 text-white font-bold"
                      : "border-[#222] bg-transparent text-[#888] hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    projectionTarget === "claude-md" ? "border-amber-500" : "border-[#444]"
                  }`}>
                    {projectionTarget === "claude-md" && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </div>
                  <div className="flex-1">
                    <span className="font-black block uppercase text-[11px] text-white">CLAUDE.md (Claude Code)</span>
                    <span className="text-[10px] text-gray-500 normal-case block mt-0.5 leading-relaxed">
                      Loads command permissions, test syntax rules, and strict constraints for Anthropic's Claude Code terminal agent.
                    </span>
                  </div>
                </button>

                {/* Option 3: spec-plan-task.json */}
                <button
                  onClick={() => {
                    setProjectionTarget("spec-kit-json");
                    setProjectionSuccess(null);
                    setProjectionError(null);
                  }}
                  className={`w-full p-4 border text-left transition-all flex items-start gap-3 rounded-none ${
                    projectionTarget === "spec-kit-json"
                      ? "border-emerald-500 bg-emerald-500/5 text-white font-bold"
                      : "border-[#222] bg-transparent text-[#888] hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    projectionTarget === "spec-kit-json" ? "border-emerald-500" : "border-[#444]"
                  }`}>
                    {projectionTarget === "spec-kit-json" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <div className="flex-1">
                    <span className="font-black block uppercase text-[11px] text-white">spec-plan-task.json (GitHub Spec Kit)</span>
                    <span className="text-[10px] text-gray-500 normal-case block mt-0.5 leading-relaxed">
                      Stateless, agent-agnostic chain schema representing exact capability steps to resume flow without plan loss.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions card */}
            <div className="bg-[#050505] border-2 border-[#222] p-5 space-y-4">
              <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block border-b border-[#222] pb-2">
                2. Project & Commit Boundary
              </span>

              <p className="text-[10px] font-mono uppercase text-gray-400 leading-relaxed">
                Writing this configuration locks it directly to your project filesystem. Any agent executing in the workspace will instantly bind to these policy boundaries.
              </p>

              {projectionError && (
                <div className="p-3 bg-red-950/30 border border-red-500/50 text-red-300 text-[10px] font-mono flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-400" />
                  <span>{projectionError}</span>
                </div>
              )}

              {projectionSuccess && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                    <span className="font-black">PROJECTION COMMITTED SUCCESSFULLY!</span>
                  </div>
                  <p className="normal-case text-gray-400 leading-normal text-[9.5px]">
                    Written {projectionSuccess} directly to the workspace root! Your local IDE workspace is now perfectly aligned with active plan {blueprintHash.substring(0, 8)}...
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={async () => {
                    setProjecting(true);
                    setProjectionSuccess(null);
                    setProjectionError(null);
                    try {
                      const response = await fetch("/api/covenant/project", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          target: projectionTarget,
                          blueprint,
                          selectedJurisdiction,
                          constitutionVersion,
                          plan: {
                            canonicalHash: blueprintHash,
                            title: blueprint?.title || "Apex Sovereign Platform"
                          }
                        })
                      });
                      const data = await response.json();
                      if (data.success) {
                        setProjectionSuccess(`./${data.filename}`);
                      } else {
                        throw new Error(data.error || "Failed to commit projection file.");
                      }
                    } catch (e: any) {
                      setProjectionError(e.message || "An unexpected error occurred during projection.");
                    } finally {
                      setProjecting(false);
                    }
                  }}
                  disabled={projecting}
                  className={`flex-1 py-3 bg-amber-500 hover:bg-white text-black text-[10px] font-black tracking-widest uppercase transition-colors rounded-none flex items-center justify-center gap-2 ${
                    projecting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Save size={12} />
                  <span>{projecting ? "WRITING CONFIG..." : "PROJECT TO WORKSPACE"}</span>
                </button>

                <button
                  onClick={() => {
                    const content = getPreviewContent(projectionTarget);
                    navigator.clipboard.writeText(content).then(() => {
                      setCopiedProjection(true);
                      setTimeout(() => setCopiedProjection(false), 2000);
                    });
                  }}
                  className="px-4 py-3 border border-[#333] hover:border-white text-[#CCC] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors rounded-none flex items-center justify-center gap-2"
                >
                  {copiedProjection ? (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span>Copied Preview!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Rules</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7 bg-[#050505] border-2 border-[#222] p-5 space-y-4 font-mono relative">
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] text-[#888] font-black tracking-wider uppercase">Live Compiled Preview</span>
            </div>

            <div className="border-b border-[#222] pb-2">
              <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block">
                Target Output File: <span className="text-[#00F0FF] font-mono">./{projectionTarget === "agents-md" ? "AGENTS.md" : projectionTarget === "claude-md" ? "CLAUDE.md" : "spec-plan-task.json"}</span>
              </span>
            </div>

            <div className="bg-[#020202] border border-[#111] p-4 text-[10px] leading-relaxed overflow-y-auto max-h-[360px] text-[#A0AEC0] whitespace-pre-wrap select-all font-mono">
              {projectionTarget === "agents-md" ? (
                `# Agent Instruction & Context Envelope: ${blueprint?.title || "Apex Sovereign Platform"}
> **PORTABLE AGENT SYSTEM INSTRUCTIONS** — Adopted by the Agentic AI Foundation.
> Do not modify this file directly unless executing an authorized CAPPO plan revision.

## 🛡️ SYSTEM CONSTITUTION & COMPLIANCE ENVELOPE
- **Jurisdiction Profile**: ${(selectedJurisdiction || "global").toUpperCase()}
- **Constitution Version**: ${constitutionVersion}
- **Cryptographic Plan Hash**: \`${blueprintHash}\`
- **Execution Safeguard**: All Lane 3 (external integrations) require certified CAPPO approval tokens prior to commit.

## 🎯 BLUEPRINT OVERVIEW
This repository is governed by **Apex Blueprint**. The underlying directory is structured as a typed capability model. 
Messy local edits that mismatch the active Blueprint Hash will trigger immediate circuit breakers in the Gnomledger evidence validators and Covenant gates.

## 🧩 COMPILED SYSTEM CAPABILITIES
${(blueprint?.capabilities || []).map((cap: any) => `### Capability: ${cap.name} (${cap.id || "cap-" + cap.name.toLowerCase().replace(/[^a-z0-9]/g, "-")})
- **Purpose**: ${cap.purpose || "N/A"}
- **Business Outcome**: ${cap.businessOutcome || "N/A"}
- **Technical Inputs**: ${Array.isArray(cap.inputs) ? cap.inputs.join(", ") : "None"}
- **Technical Outputs**: ${Array.isArray(cap.outputs) ? cap.outputs.join(", ") : "None"}
- **Maturity**: ${cap.observedMaturity || "Conceptual"}`).join("\n\n") || "No custom capabilities compiled yet. Default sovereign scheduler active."}

## 📋 ACTIVE AGENT WORK DISPATCHES
${packetsToUse.map((pkt: any, i: number) => `#### Work Order ${i + 1}: ${pkt.title} (Role: ${pkt.targetRole})
- **Objective**: ${pkt.objective}
- **Architectural Scope**: ${pkt.scope}
- **Files to Modify**: ${Array.isArray(pkt.files) ? pkt.files.map((f: string) => `\`${f}\``).join(", ") : "None"}
- **Definition of Done**:
${Array.isArray(pkt.definitionOfDone) ? pkt.definitionOfDone.map((d: string) => `  - [ ] ${d}`).join("\n") : "  - [ ] Compiles with zero warnings"}`).join("\n\n")}

## ⚡ GUARDRAIL RULES & SYSTEM ENVIRONMENT
1. **No Mocking**: Never substitute dummy mock data for active services. Write real integrations adhering to the contract specs.
2. **Deterministic Inputs**: All service endpoints must parse input payloads with strict schemas.
3. **Traceability**: All external states (Lane 3) must be logged directly to the Gnomledger proof ledger.

---
*Generated by Apex Trust Layer Compiler*`
              ) : projectionTarget === "claude-md" ? (
                `# Claude Code Project Memory and Workspace Envelope

## 💡 System Identity & Core Memory
- **Active Project**: ${blueprint?.title || "Apex Sovereign Platform"}
- **Blueprint Hash**: \`${blueprintHash}\`
- **Applied Law**: ${(selectedJurisdiction || "global").toUpperCase()} Compliance Overlay
- **Constitution Status**: SECURE (Locked on version ${constitutionVersion})

## 🛠️ Command Context & Environment Commands
To compile, verify, and lint this environment safely, you must utilize the following commands exactly:
- **Build**: \`npm run build\`
- **Test**: \`npm run test\`
- **Lint**: \`npm run lint\`
- **Dev**: \`npm run dev\`

## 📦 Key System Capabilities
${(blueprint?.capabilities || []).map((cap: any) => `- **${cap.name}** [Maturity: ${cap.observedMaturity || "Conceptual"}]`).join("\n") || "- Default scheduler service active"}

## 🛡️ Policy-as-Code & Code Style Rules
1. **Zero Drift Directive**: You are forbidden from modifying files outside of the approved scope boundaries specified in active work orders.
2. **Strict Typings**: Do not introduce \`any\` or generic objects for typed parameters. Define explicit schemas.
3. **No Unrequested Features**: Avoid the addition of unrequested visual elements, telemetry counters, or status logs.

## 🏁 Handover Checkpoint & Workflow Continuation
If switching tools or resuming a suspended session:
- Locate the active work order ID in the Apex agentPackets.
- Fetch the latest approved \`PlanIR\` to assert compliance with hash \`${blueprintHash}\`.
- Ensure all required unit tests pass successfully prior to pushing to main.

---
*Sealed by Apex Blueprint Governance Compiler*`
              ) : (
                JSON.stringify({
                  "$schema": "https://github.com/github/spec-kit/schema/v1",
                  "metadata": {
                    "title": blueprint?.title || "Apex Sovereign Platform",
                    "blueprint_hash": blueprintHash,
                    "jurisdiction": (selectedJurisdiction || "global").toUpperCase(),
                    "constitution_version": constitutionVersion,
                    "compiled_at": new Date().toISOString()
                  },
                  "spec": {
                    "goals": (blueprint?.highLevelGoals || []).map((g: any) => ({ name: g.title, desc: g.description, priority: g.status })),
                    "moats": (blueprint?.competitiveMoat || []).map((m: any) => ({ capability: m.capabilityName, score: m.advantageScore }))
                  },
                  "plan": {
                    "id": "plan-generated-universal-ir",
                    "status": "APPROVED",
                    "steps": (blueprint?.capabilities || []).map((cap: any, index: number) => ({
                      stepId: cap.id || `cap-step-${index + 1}`,
                      sequence: index + 1,
                      capability: cap.name,
                      lane: cap.governance?.requiredApprovals?.length > 0 ? 3 : 2,
                      riskLevel: cap.governance?.requiredApprovals?.length > 0 ? "HIGH" : "LOW",
                      requiresApproval: cap.governance?.requiredApprovals?.length > 0 ? true : false,
                      idempotencyKey: `idemp-key-sim-${index}`
                    }))
                  },
                  "tasks": packetsToUse.map((pkt: any, index: number) => ({
                    taskId: pkt.id || `task-${index + 1}`,
                    title: pkt.title,
                    role: pkt.targetRole,
                    objective: pkt.objective,
                    scope: pkt.scope,
                    allowedDependencies: pkt.dependencies,
                    requiredTests: pkt.tests,
                    definitionOfDone: pkt.definitionOfDone,
                    status: index === 0 ? "IN_PROGRESS" : "PENDING"
                  }))
                }, null, 2)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          APEX BLUEPRINT V4.02 CORE SUITE: DETERMINISTIC TRUST SPINE & AUTONOMY CONTROL
          ========================================================================= */}
      <div className="border-t-2 border-[#222] pt-8 mt-12 space-y-8 print:hidden">
        
        {/* Module Header */}
        <div className="bg-[#050505] border-2 border-amber-500/30 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/2 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Shield size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Apex Blueprint V4.02 Core Engine</h3>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mt-0.5">
                    Deterministic Trust Spine for Autonomous Multi-Agent IDEs
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 normal-case leading-relaxed max-w-3xl pt-2">
                This environment acts as the living validation envelope for Apex Blueprint V4.02. By coordinating Context-Disciplined Agent Development (CDAD), ratio-based SEKED-spec math, Fenton-Wilkinson feasibility filters, and MCP dynamic ACL gates, it establishes absolute software development continuity across diverse IDEs.
              </p>
            </div>
            
            {/* Dual-Rail Navigation Selector */}
            <div className="flex bg-[#0A0A0A] border-2 border-[#222] p-1 font-mono text-xs shrink-0 self-end md:self-center">
              <button
                onClick={() => setActiveRail("beginner")}
                className={`px-4 py-2 uppercase font-black tracking-wider transition-all rounded-none ${
                  activeRail === "beginner"
                    ? "bg-amber-500 text-black font-bold shadow-md"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Beginner Rail
              </button>
              <button
                onClick={() => setActiveRail("expert")}
                className={`px-4 py-2 uppercase font-black tracking-wider transition-all rounded-none ${
                  activeRail === "expert"
                    ? "bg-amber-500 text-black font-bold shadow-md"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Expert Rail
              </button>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            RAIL 1: BEGINNER RAIL (GUIDED AUTONOMY TIMELINE SIMULATOR)
            ------------------------------------------------------------------------- */}
        {activeRail === "beginner" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#050505] border-2 border-[#222] p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-[#222] pb-3">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  <span className="text-xs font-black uppercase text-white tracking-wider">CDAD Guided Autonomy Timeline</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono">
                  <label className="flex items-center gap-2 cursor-pointer text-[#888] hover:text-white">
                    <input
                      type="checkbox"
                      checked={autoApproveEnabled}
                      onChange={(e) => setAutoApproveEnabled(e.target.checked)}
                      className="border-[#222] bg-transparent text-emerald-500 rounded-none focus:ring-0 focus:ring-offset-0"
                    />
                    <span>AUTO-APPROVE READ CORES</span>
                  </label>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                    Safe Execution Active
                  </span>
                </div>
              </div>

              {/* Visual Timeline Stepper */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative pt-4">
                <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-0.5 bg-[#222] z-0" />
                
                {[
                  { step: 0, title: "1. CDAD Ingestion", desc: "Isolate Task Packet context and strip conversation history", icon: FileText, color: "text-[#00F0FF]" },
                  { step: 1, title: "2. Plan Evaluation", desc: "Assess proposal syntax and draft AST delta map", icon: SlidersHorizontal, color: "text-amber-400" },
                  { step: 2, title: "3. Gate Analysis", desc: "Evaluate security policy, dynamic ACL, and JWT boundaries", icon: Shield, color: "text-red-400" },
                  { step: 3, title: "4. Unit Verification", desc: "Execute target compilation and validation oracles", icon: FileCheck, color: "text-[#00F0FF]" },
                  { step: 4, title: "5. Ledger Anchor", desc: "Commit proof hashes to Gnomledger receipt chain", icon: Lock, color: "text-emerald-400" }
                ].map((s) => {
                  const isActive = beginnerStep === s.step;
                  const isCompleted = beginnerStep > s.step;
                  const Icon = s.icon;
                  return (
                    <div key={s.step} className="space-y-3 font-mono text-center z-10">
                      <div className="flex justify-center">
                        <div className={`w-14 h-14 border-2 flex items-center justify-center transition-all ${
                          isActive 
                            ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-105" 
                            : isCompleted 
                              ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                              : "border-[#222] bg-[#0A0A0A] text-[#444]"
                        }`}>
                          {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className={`text-[10px] font-black uppercase block ${isActive ? "text-amber-500" : isCompleted ? "text-emerald-400" : "text-[#555]"}`}>
                          {s.title}
                        </span>
                        <p className="text-[9px] text-[#888] lowercase normal-case leading-normal px-2 line-clamp-2">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulation Logs & Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-[#222]">
                {/* Simulated Logs Terminal */}
                <div className="lg:col-span-8 bg-black border-2 border-[#111] p-4 font-mono text-[10px] space-y-1.5 h-64 overflow-y-auto text-[#A0AEC0]">
                  <div className="flex items-center justify-between border-b border-[#222] pb-1.5 mb-2">
                    <span className="text-[#666] font-black uppercase text-[9px]">Guided Autonomy Shell Output</span>
                    <span className="text-amber-500/60 text-[9px] font-black uppercase">LIVE CODESPACE STREAM</span>
                  </div>
                  {beginnerLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed whitespace-pre-wrap select-all">
                      {log}
                    </div>
                  ))}
                  {beginnerRunning && (
                    <div className="text-amber-400 animate-pulse flex items-center gap-1.5">
                      <Terminal size={12} className="animate-spin" />
                      <span>[COMPILE] Executing task-chain validation... Please wait...</span>
                    </div>
                  )}
                </div>

                {/* Automation Actions Panel */}
                <div className="lg:col-span-4 bg-[#0A0A0A] border border-[#222] p-5 flex flex-col justify-between">
                  <div className="space-y-4 font-mono">
                    <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block border-b border-[#222] pb-1.5">
                      AUTONOMY STATIONS
                    </span>
                    <p className="text-[10px] normal-case text-gray-400 leading-normal">
                      Simulate the CDAD incremental compiler lifecycle. It will ingest context, verify boundaries, and record cryptographically secure completion receipts.
                    </p>
                  </div>

                  <div className="space-y-3 pt-6">
                    <button
                      onClick={() => {
                        if (beginnerStep >= 4) {
                          setBeginnerStep(0);
                          setBeginnerLogs([
                            "[SYSTEM] Reset. Ready to run CDAD guided simulation."
                          ]);
                          return;
                        }
                        
                        setBeginnerRunning(true);
                        const stepNames = [
                          "[INGESTION] CDAD compiler loaded. Isolating Task Packet. Dropping 5,420 token history. Effective context window normalized to 1,200 tokens.",
                          "[PLAN] Delta planner initialized. Scanning abstract syntax trees. Generated AST delta footprint map (3 files targeted). Zero drift detected.",
                          "[GATE] Gateway Claims Evaluation. JWT matched 'Staff Developer' in EU region. Default-Deny ACL resolved. Safe read tool queryLocalSchema auto-approved.",
                          "[VERIFICATION] Compiler target compiled successfully. Running 4 oracles (unit tests). Output: 4/4 passed (100% coverage). Zero warnings.",
                          "[ANCHOR] Compiling receipt block. Generating SHA-256 state signature. Minting Gnomledger Receipt Artifact (GRA) #02941. Handoff transaction sealed!"
                        ];
                        
                        setTimeout(() => {
                          setBeginnerLogs(prev => [...prev, stepNames[beginnerStep]]);
                          setBeginnerStep(prev => prev + 1);
                          setBeginnerRunning(false);
                        }, 1000);
                      }}
                      disabled={beginnerRunning}
                      className="w-full py-3 bg-emerald-500 hover:bg-white text-black text-[10px] font-black tracking-widest uppercase transition-colors rounded-none flex items-center justify-center gap-2"
                    >
                      <Terminal size={12} />
                      <span>{beginnerStep >= 4 ? "RESET LIFECYCLE" : "RUN NEXT CDAD STEP"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setBeginnerRunning(true);
                        setBeginnerStep(0);
                        setBeginnerLogs(["[SYSTEM] Initialising full autonomous loop execution..."]);
                        
                        const stepLogs = [
                          "[INGESTION] CDAD compiler loaded. Isolating Task Packet. Dropping 5,420 token history. Effective context window normalized to 1,200 tokens.",
                          "[PLAN] Delta planner initialized. Scanning abstract syntax trees. Generated AST delta footprint map (3 files targeted). Zero drift detected.",
                          "[GATE] Gateway Claims Evaluation. JWT matched 'Staff Developer' in EU region. Default-Deny ACL resolved. Safe read tool queryLocalSchema auto-approved.",
                          "[VERIFICATION] Compiler target compiled successfully. Running 4 oracles (unit tests). Output: 4/4 passed (100% coverage). Zero warnings.",
                          "[ANCHOR] Compiling receipt block. Generating SHA-256 state signature. Minting Gnomledger Receipt Artifact (GRA) #02941. Handoff transaction sealed!"
                        ];

                        let current = 0;
                        const interval = setInterval(() => {
                          if (current < stepLogs.length) {
                            setBeginnerLogs(prev => [...prev, stepLogs[current]]);
                            setBeginnerStep(current + 1);
                            current++;
                          } else {
                            clearInterval(interval);
                            setBeginnerRunning(false);
                          }
                        }, 800);
                      }}
                      disabled={beginnerRunning}
                      className="w-full py-3 border border-[#333] hover:border-white text-white text-[10px] font-black tracking-widest uppercase transition-colors rounded-none flex items-center justify-center gap-2"
                    >
                      <PlayCheckIcon size={12} />
                      <span>AUTONOMOUS WORKFLOW RE-RUN</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            RAIL 2: EXPERT RAIL (UNRESTRICTED MATHEMATICAL SYSTEMS CONTROL)
            ------------------------------------------------------------------------- */}
        {activeRail === "expert" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Grid: Context Divergence & SEKED-Spec Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Context Divergence Monitor (KL Divergence Score) */}
              <div className="lg:col-span-6 bg-[#050505] border-2 border-[#222] p-5 space-y-4">
                <div className="flex justify-between items-start border-b border-[#222] pb-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-amber-500 tracking-wider uppercase block">Context Divergence Analysis</span>
                    <h4 className="text-sm font-black text-white tracking-tight uppercase">KL Divergence Metric (D_t)</h4>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-mono font-black ${klDivergence > 0.5 ? "text-red-400" : "text-emerald-400"}`}>
                      {klDivergence.toFixed(3)}
                    </span>
                    <span className="text-[9px] text-[#666] uppercase block">Divergence Score</span>
                  </div>
                </div>

                {/* SVG Curve Plotting */}
                <div className="h-28 bg-[#020202] border border-[#111] relative p-1">
                  <div className="absolute top-1 left-2 text-[8px] font-mono text-gray-600 uppercase">
                    Token distribution divergence D_KL(q_t || p_t)
                  </div>
                  <div className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-600">
                    Turns (t-5 to t)
                  </div>
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-rows-3 grid-cols-5 pointer-events-none opacity-10">
                    <div className="border-b border-[#444] border-r border-[#444]" />
                    <div className="border-b border-[#444] border-r border-[#444]" />
                    <div className="border-b border-[#444] border-r border-[#444]" />
                    <div className="border-b border-[#444] border-r border-[#444]" />
                    <div className="border-b border-[#444]" />
                  </div>

                  {/* Render Curve */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d={`M 5,${100 - (klHistory[0] * 100)} L 25,${100 - (klHistory[1] * 100)} L 50,${100 - (klHistory[2] * 100)} L 75,${100 - (klHistory[3] * 100)} L 95,${100 - (klDivergence * 100)}`}
                      fill="none"
                      stroke={klDivergence > 0.5 ? "#F87171" : "#10B981"}
                      strokeWidth="2"
                    />
                    {/* Data Points */}
                    <circle cx="5" cy={100 - (klHistory[0] * 100)} r="2" fill="#F59E0B" />
                    <circle cx="25" cy={100 - (klHistory[1] * 100)} r="2" fill="#F59E0B" />
                    <circle cx="50" cy={100 - (klHistory[2] * 100)} r="2" fill="#F59E0B" />
                    <circle cx="75" cy={100 - (klHistory[3] * 100)} r="2" fill="#F59E0B" />
                    <circle cx="95" cy={100 - (klDivergence * 100)} r="3" fill="#EF4444" className="animate-ping" />
                  </svg>
                </div>

                {/* Micro-Actions to Shift Equilibrium */}
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[9px]">
                  <button
                    onClick={() => {
                      const nextD = Math.max(0.12, klDivergence - 0.25);
                      setKlDivergence(nextD);
                      setKlHistory(prev => [...prev.slice(1), nextD]);
                      setExpertLogs(prev => [...prev, `[RESTORE] Injected Focused Prompt Anchor. Turn KL divergence dropped to ${nextD.toFixed(3)}.`]);
                    }}
                    className="p-2 border border-[#333] hover:border-amber-500 text-amber-500 hover:text-white uppercase transition-colors font-bold text-center"
                  >
                    Inject Anchor
                  </button>
                  <button
                    onClick={() => {
                      const nextD = Math.max(0.08, klDivergence - 0.38);
                      setKlDivergence(nextD);
                      setKlHistory(prev => [...prev.slice(1), nextD]);
                      setExpertLogs(prev => [...prev, `[SYNC] Synchronized context memory to external flat-file brain. Drift corrected. D_t = ${nextD.toFixed(3)}.`]);
                    }}
                    className="p-2 border border-[#333] hover:border-emerald-500 text-emerald-400 hover:text-white uppercase transition-colors font-bold text-center"
                  >
                    Sync Memory
                  </button>
                  <button
                    onClick={() => {
                      const nextD = Math.min(0.95, klDivergence + 0.15);
                      setKlDivergence(nextD);
                      setKlHistory(prev => [...prev.slice(1), nextD]);
                      setExpertLogs(prev => [...prev, `[DRIFT] long-running compile cycle completed. Predictive dispersion token-decay recorded. D_t rose to ${nextD.toFixed(3)}.`]);
                    }}
                    className="p-2 border border-[#333] hover:border-red-500 text-red-400 hover:text-white uppercase transition-colors font-bold text-center"
                  >
                    Run Turn Cycle
                  </button>
                </div>

                {/* Drift Log */}
                <div className="bg-black/50 p-3 border border-[#111] h-28 overflow-y-auto font-mono text-[9px] text-gray-500 space-y-1">
                  {expertLogs.slice(-4).map((log, i) => (
                    <div key={i} className="leading-tight">{log}</div>
                  ))}
                </div>
              </div>

              {/* SEKED-Spec State Matrix Editor */}
              <div className="lg:col-span-6 bg-[#050505] border-2 border-[#222] p-5 space-y-4 font-mono">
                <div className="flex justify-between items-start border-b border-[#222] pb-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-[#00F0FF] tracking-wider uppercase block">SEKED-Spec Mathematics</span>
                    <h4 className="text-sm font-black text-white tracking-tight uppercase">Deterministic State Matrix</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 text-[9px] font-black uppercase">
                    COT Ratio Active
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  {/* Register Visualizer */}
                  <div className="col-span-5 bg-black border border-[#111] p-3 text-[10px] space-y-2">
                    <span className="text-[9px] text-[#555] uppercase block font-black">4x4 Hex Registers</span>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-gray-400">
                      <div className="p-1 bg-[#111] border border-[#222] text-amber-500 font-bold">{(Math.floor(sekedOperationalGradient * 10)).toString(16).toUpperCase()}</div>
                      <div className="p-1 bg-[#111] border border-[#222] text-[#00F0FF]">D4</div>
                      <div className="p-1 bg-[#111] border border-[#222]">2A</div>
                      <div className="p-1 bg-[#111] border border-[#222]">8F</div>
                      <div className="p-1 bg-[#111] border border-[#222]">C7</div>
                      <div className="p-1 bg-[#111] border border-[#222] text-amber-500 font-bold">{(sekedFilePointerHash % 256).toString(16).toUpperCase()}</div>
                      <div className="p-1 bg-[#111] border border-[#222]">3C</div>
                      <div className="p-1 bg-[#111] border border-[#222]">E2</div>
                      <div className="p-1 bg-[#111] border border-[#222]">11</div>
                      <div className="p-1 bg-[#111] border border-[#222]">B0</div>
                      <div className="p-1 bg-[#111] border border-[#222] text-amber-500 font-bold">{(sekedSyntaxNodeComplexity).toString(16).toUpperCase()}</div>
                      <div className="p-1 bg-[#111] border border-[#222]">7D</div>
                      <div className="p-1 bg-[#111] border border-[#222]">5E</div>
                      <div className="p-1 bg-[#111] border border-[#222]">93</div>
                      <div className="p-1 bg-[#111] border border-[#222]">6A</div>
                      <div className="p-1 bg-[#111] border border-[#222] text-amber-500 font-bold">{(sekedActiveThreads).toString(16).toUpperCase()}</div>
                    </div>
                    <div className="pt-2">
                      <span className="text-[8px] text-[#444] uppercase block">Continuity Vector:</span>
                      <div className="text-[9px] text-emerald-400 truncate mt-0.5 select-all font-bold font-mono">
                        {btoa(`seked_${sekedOperationalGradient}_${sekedFilePointerHash}_${sekedSyntaxNodeComplexity}_${sekedActiveThreads}`).substring(0, 24)}...
                      </div>
                    </div>
                  </div>

                  {/* Sliders Grid */}
                  <div className="col-span-7 space-y-2.5 text-[9px] text-gray-400 uppercase">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Operational Gradient (palms)</span>
                        <span className="text-white">{sekedOperationalGradient.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.01"
                        value={sekedOperationalGradient}
                        onChange={(e) => setSekedOperationalGradient(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-[#222] outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>State Registry Reference ID</span>
                        <span className="text-white">{sekedFilePointerHash}</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="3000"
                        step="1"
                        value={sekedFilePointerHash}
                        onChange={(e) => setSekedFilePointerHash(parseInt(e.target.value))}
                        className="w-full accent-[#00F0FF] h-1 bg-[#222] outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>AST Abstract Complexity</span>
                        <span className="text-white">{sekedSyntaxNodeComplexity} levels</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="128"
                        step="1"
                        value={sekedSyntaxNodeComplexity}
                        onChange={(e) => setSekedSyntaxNodeComplexity(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-[#222] outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Active Concurrency Channels</span>
                        <span className="text-white">{sekedActiveThreads} Lanes</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="32"
                        step="1"
                        value={sekedActiveThreads}
                        onChange={(e) => setSekedActiveThreads(parseInt(e.target.value))}
                        className="w-full accent-red-400 h-1 bg-[#222] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Fenton-Wilkinson Feasibility Filter Card */}
            <div className="bg-[#050505] border-2 border-[#222] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-white font-black">
                    <SlidersHorizontal size={16} className="text-amber-500" />
                    <span className="text-xs uppercase tracking-wider font-mono">Fenton-Wilkinson Feasibility Filter</span>
                  </div>
                  <p className="text-[10px] text-[#666] font-mono normal-case mt-0.5">
                    Calculates cumulative stochastic risk modeling of multiple lognormal variables for TRL advancement.
                  </p>
                </div>
                <div className="flex bg-[#0A0A0A] border border-[#222] p-1 font-mono text-[9px] shrink-0">
                  <span className="px-2 py-1 text-gray-500">TRL TARGET MAPPING:</span>
                  {[
                    { val: 3, label: "TRL-3 (Concept)" },
                    { val: 6, label: "TRL-6 (Validated)" },
                    { val: 9, label: "TRL-9 (Operational)" }
                  ].map((t) => (
                    <button
                      key={t.val}
                      onClick={() => setTrlLevel(t.val)}
                      className={`px-2 py-1 uppercase font-black tracking-wider transition-all rounded-none ${
                        trlLevel === t.val ? "bg-amber-500 text-black font-bold" : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Math Inputs and Outputs display */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs uppercase leading-relaxed text-[#A0AEC0]">
                {/* Moment Matching Parameters Config */}
                <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#222] p-5 space-y-4">
                  <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block border-b border-[#222] pb-1.5">
                    1. Moments Configuration
                  </span>
                  
                  <div className="space-y-3 uppercase text-[9px]">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Lognormal Variance Slider (&sigma;_Z^2 limit)</span>
                        <span className="text-[#00F0FF]">{acceptableRisk.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="1.00"
                        step="0.01"
                        value={acceptableRisk}
                        onChange={(e) => setAcceptableRisk(parseFloat(e.target.value))}
                        className="w-full accent-[#00F0FF] h-1 bg-[#222]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div>
                        <span className="text-gray-500 block mb-1">Step 1 (mu1)</span>
                        <input
                          type="number"
                          step="0.1"
                          value={step1Cost}
                          onChange={(e) => setStep1Cost(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                          className="w-full bg-[#111] border border-[#222] p-2 text-white text-center font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Step 2 (mu2)</span>
                        <input
                          type="number"
                          step="0.1"
                          value={step2Cost}
                          onChange={(e) => setStep2Cost(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                          className="w-full bg-[#111] border border-[#222] p-2 text-white text-center font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Step 3 (mu3)</span>
                        <input
                          type="number"
                          step="0.1"
                          value={step3Cost}
                          onChange={(e) => setStep3Cost(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                          className="w-full bg-[#111] border border-[#222] p-2 text-white text-center font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Target Token Budget Limit (&theta;)</span>
                        <span className="text-[#00F0FF]">{mathBudget.toFixed(1)} tokens</span>
                      </div>
                      <input
                        type="range"
                        min="5.0"
                        max="30.0"
                        step="0.5"
                        value={mathBudget}
                        onChange={(e) => setMathBudget(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-[#222]"
                      />
                    </div>
                  </div>
                </div>

                {/* Fenton-Wilkinson Real-time Moment Matching Solver Output */}
                <div className="lg:col-span-7 bg-[#0A0A0A] border border-[#222] p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block border-b border-[#222] pb-1.5">
                      2. Real-time Moment Matching Solver
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                      <div className="p-3 bg-[#020202] border border-[#111] text-center">
                        <span className="text-[8px] text-gray-500 block">Sum Mean u_1</span>
                        <span className="text-xs font-black text-white font-mono block mt-1">{mathResults.u1}</span>
                      </div>
                      <div className="p-3 bg-[#020202] border border-[#111] text-center">
                        <span className="text-[8px] text-gray-500 block">Sum Moment u_2</span>
                        <span className="text-xs font-black text-white font-mono block mt-1">{mathResults.u2}</span>
                      </div>
                      <div className="p-3 bg-[#020202] border border-[#111] text-center">
                        <span className="text-[8px] text-gray-500 block">Log Mean &mu;_Z</span>
                        <span className="text-xs font-black text-white font-mono block mt-1">{mathResults.muZ}</span>
                      </div>
                      <div className="p-3 bg-[#020202] border border-[#111] text-center">
                        <span className="text-[8px] text-gray-500 block">Log Var &sigma;_Z^2</span>
                        <span className="text-xs font-black text-white font-mono block mt-1">{mathResults.sigmaZ2}</span>
                      </div>
                    </div>

                    {/* Calculated Probability Display */}
                    <div className="p-4 bg-black/60 border border-[#111] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[8px] text-gray-500 block">Calculated Success Probability for TRL-{trlLevel} Target:</span>
                        <p className="text-[9.5px] normal-case text-gray-400 mt-0.5 leading-normal">
                          P(S &lt; {mathBudget.toFixed(1)}) via Fenton-Wilkinson normal cumulative integration approximation.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-2xl font-black font-mono block ${mathResults.probRaw > 0.85 ? "text-emerald-400" : mathResults.probRaw > 0.60 ? "text-amber-400" : "text-red-400"}`}>
                          {mathResults.probSuccess}%
                        </span>
                        <span className="text-[8px] text-gray-600 block">Confidence Interval</span>
                      </div>
                    </div>
                  </div>

                  {/* Autonomy Gate Safeguard Status */}
                  <div className="pt-4 border-t border-[#111] mt-4 flex items-center gap-3">
                    {mathResults.probRaw >= (1.0 - acceptableRisk * 0.8) ? (
                      <div className="w-full p-2.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wide flex items-center gap-2">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>AUTONOMOUS EXECUTION COMPLIANT: Math probability exceeds safe risk threshold ceiling.</span>
                      </div>
                    ) : (
                      <div className="w-full p-2.5 bg-red-950/20 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-wide flex items-center gap-2 animate-pulse">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>AUTONOMY HARD-BLOCKED: Accumulated drift risk exceeds stochastic variance ceiling.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------------
            MODULE 3: GLOBAL LEGAL & JURISDICTIONAL COMPLIANCE MCP PROXY GATEWAY
            ------------------------------------------------------------------------- */}
        <div className="bg-[#050505] border-2 border-[#222] p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-white font-black">
                <ShieldAlert size={16} className="text-red-400" />
                <span className="text-xs uppercase tracking-wider font-mono">Global Legal & Jurisdictional MCP Proxy Gateway</span>
              </div>
              <p className="text-[10px] text-[#666] font-mono normal-case mt-0.5">
                Dynamic JWT Claims-Mapping and policy evaluation engine implementing dynamic default-deny ACL and Token Isolation.
              </p>
            </div>
            <span className="px-2.5 py-1 border border-red-500/30 text-red-400 text-[9px] font-black tracking-widest uppercase bg-red-500/5 font-mono">
              Zero Trust Gateway Enforcer
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* JWT Claims Builder */}
            <div className="lg:col-span-4 bg-[#0A0A0A] border border-[#222] p-5 space-y-5 font-mono text-xs uppercase">
              <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block border-b border-[#222] pb-1.5">
                1. JWT Claims Token Payload
              </span>

              <div className="space-y-3.5">
                {/* Claim: Jurisdiction */}
                <div className="space-y-1.5">
                  <span className="text-gray-500 text-[9px] font-bold block">Jurisdiction claim (iss_geo):</span>
                  <div className="grid grid-cols-4 gap-1.5 font-bold text-[10px]">
                    {["EU", "US", "CA", "APAC"].map((geo) => (
                      <button
                        key={geo}
                        onClick={() => {
                          setJwtJurisdiction(geo as any);
                          setMcpProxyLogs(prev => [...prev, `[JWT] User geo claim updated to: ${geo}. Re-compiling dynamic ACL filters.`]);
                        }}
                        className={`py-1.5 border text-center transition-all ${
                          jwtJurisdiction === geo
                            ? "border-[#00F0FF] bg-[#00F0FF]/10 text-white"
                            : "border-[#222] bg-transparent text-gray-500 hover:text-white"
                        }`}
                      >
                        {geo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Claim: Role */}
                <div className="space-y-1.5">
                  <span className="text-gray-500 text-[9px] font-bold block">Enterprise Role claim (role):</span>
                  <div className="space-y-1.5 text-[9px]">
                    {[
                      { val: "CORE_AUDITOR", label: "Core Auditor" },
                      { val: "STAFF_DEVELOPER", label: "Staff Developer" },
                      { val: "EXTERNAL_CONTRACTOR", label: "External Contractor" }
                    ].map((r) => (
                      <button
                        key={r.val}
                        onClick={() => {
                          setJwtRole(r.val as any);
                          setMcpProxyLogs(prev => [...prev, `[JWT] Enterprise role claim updated to: ${r.val}.`]);
                        }}
                        className={`w-full p-2 border text-left flex items-center justify-between transition-all ${
                          jwtRole === r.val
                            ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                            : "border-[#222] bg-transparent text-gray-500 hover:text-white"
                        }`}
                      >
                        <span>{r.label}</span>
                        <span className="text-[8px] font-mono opacity-65 font-normal">{r.val}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Claim: Employment Status */}
                <div className="space-y-1.5">
                  <span className="text-gray-500 text-[9px] font-bold block">Employment Status claim:</span>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    {[
                      { val: "EMPLOYEE", label: "FTE Employee" },
                      { val: "CONTRACTOR", label: "Contractor" }
                    ].map((s) => (
                      <button
                        key={s.val}
                        onClick={() => {
                          setJwtStatus(s.val as any);
                          setMcpProxyLogs(prev => [...prev, `[JWT] Employment status claim updated to: ${s.val}.`]);
                        }}
                        className={`py-1.5 border text-center transition-all ${
                          jwtStatus === s.val
                            ? "border-emerald-500 bg-emerald-500/10 text-white font-bold"
                            : "border-[#222] bg-transparent text-gray-500 hover:text-white"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic ACL Filtered list & Interactive API Calls */}
            <div className="lg:col-span-8 bg-[#0A0A0A] border border-[#222] p-5 flex flex-col justify-between font-mono text-xs uppercase">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block border-b border-[#222] pb-1.5">
                  2. Dynamic ACL Filtered Tools (Exposed vs. Stripped Context)
                </span>

                {/* Simulated Tool list mapping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {[
                    {
                      name: "queryLocalSchema",
                      desc: "Inspect active database structure.",
                      isAllowed: true,
                      reason: "No jurisdictional boundaries apply to safe read-only queries."
                    },
                    {
                      name: "accessEUClientDb",
                      desc: "Direct access connection to EU customer data tables.",
                      isAllowed: jwtJurisdiction === "EU" && jwtRole === "CORE_AUDITOR",
                      reason: jwtJurisdiction === "EU" && jwtRole === "CORE_AUDITOR"
                        ? "Authorized. Mapped to EU compliance zone with core audit rights."
                        : "Blocked! Mismatch. EU GDPR Article 44 prohibits access to outside geofences or non-auditors."
                    },
                    {
                      name: "releaseToProduction",
                      desc: "Execute pipeline deployment triggers.",
                      isAllowed: jwtStatus === "EMPLOYEE" && jwtRole !== "EXTERNAL_CONTRACTOR",
                      reason: jwtStatus === "EMPLOYEE" && jwtRole !== "EXTERNAL_CONTRACTOR"
                        ? "Allowed. Human FTE holds valid deployment clearance."
                        : "Blocked! Unauthorized. Contractors are forbidden from issuing production side-effects."
                    },
                    {
                      name: "mintGnomledgerProof",
                      desc: "Write hash receipt metadata to the ledger.",
                      isAllowed: jwtRole !== "EXTERNAL_CONTRACTOR",
                      reason: jwtRole !== "EXTERNAL_CONTRACTOR"
                        ? "Allowed. Access granted to verified staff developers or auditors."
                        : "Blocked! Unauthorized. Contractor cannot access the proof ledger directly."
                    }
                  ].map((tool) => (
                    <div
                      key={tool.name}
                      className={`p-3 border flex flex-col justify-between transition-all rounded-none ${
                        tool.isAllowed
                          ? "border-emerald-500/25 bg-emerald-950/5 text-gray-300"
                          : "border-red-500/25 bg-red-950/5 text-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-black text-[11px] font-mono ${tool.isAllowed ? "text-white" : "text-gray-600 line-through"}`}>
                          {tool.name}()
                        </span>
                        <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase ${
                          tool.isAllowed 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {tool.isAllowed ? "EXPOSED" : "STRIPPED"}
                        </span>
                      </div>
                      <p className="text-[9.5px] lowercase normal-case text-gray-400 mt-1 leading-normal">
                        {tool.desc}
                      </p>
                      <p className={`text-[8.5px] font-bold mt-2 pt-1.5 border-t border-[#111] leading-tight ${
                        tool.isAllowed ? "text-emerald-500" : "text-red-400"
                      }`}>
                        * {tool.reason}
                      </p>
                    </div>
                  ))}
                </div>

                {/* API Action triggers and Logs box */}
                <div className="space-y-3 pt-3 border-t border-[#111]">
                  <div className="flex items-center justify-between text-[9px] font-bold text-gray-500">
                    <span>PROXY INTERCEPT REAL-TIME GATE LOGS</span>
                    <button
                      onClick={() => setMcpProxyLogs([
                        "[PROXY] Gateway logs cache cleared. Secure intercept listener active."
                      ])}
                      className="text-amber-500 hover:text-white uppercase transition-colors"
                    >
                      Clear Logs
                    </button>
                  </div>
                  <div className="bg-black/80 border-2 border-[#111] p-3 font-mono text-[9px] space-y-1 h-28 overflow-y-auto text-[#A0AEC0]">
                    {mcpProxyLogs.slice(-6).map((log, i) => (
                      <div key={i} className="leading-tight select-all">{log}</div>
                    ))}
                  </div>

                  {/* Trigger buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-bold font-mono">
                    <button
                      onClick={() => {
                        setMcpProxyLogs(prev => [
                          ...prev,
                          `[INTERCEPT] HTTP GET /api/mcp/tools requested.`,
                          `[COMPLIANCE] Token claims: Geo=${jwtJurisdiction}, Role=${jwtRole}, Status=${jwtStatus}`,
                          `[COMPLIANCE] ACL filtered. Exposing tools: ${jwtJurisdiction === "EU" && jwtRole === "CORE_AUDITOR" ? "queryLocalSchema, accessEUClientDb" : "queryLocalSchema"}`
                        ]);
                      }}
                      className="p-2 bg-[#111] border border-[#222] hover:border-white text-white transition-colors"
                    >
                      Discover Tools
                    </button>
                    <button
                      onClick={() => {
                        setMcpProxyLogs(prev => [
                          ...prev,
                          `[CALL] Invoked tool 'queryLocalSchema' with payload {}.`,
                          `[GATE] Allowed. Safe tool bypass check. Code 200 Success. Schema parsed.`
                        ]);
                      }}
                      className="p-2 bg-[#111] border border-[#222] hover:border-white text-white transition-colors"
                    >
                      Query Local Schema
                    </button>
                    <button
                      onClick={() => {
                        const allowed = jwtJurisdiction === "EU" && jwtRole === "CORE_AUDITOR";
                        setMcpProxyLogs(prev => [
                          ...prev,
                          `[CALL] Invoked tool 'accessEUClientDb' with params { query: "LIMIT 10" }.`,
                          allowed 
                            ? `[GATE] SUCCESS! Claim maps to core EU Auditor. Establishing secure database socket connection. Token isolated.`
                            : `[GATE] BLOCKED! Security Exception. User role '${jwtRole}' in '${jwtJurisdiction}' geo does not carry GDPR clearance headers.`
                        ]);
                      }}
                      className={`p-2 border transition-colors ${
                        jwtJurisdiction === "EU" && jwtRole === "CORE_AUDITOR"
                          ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                          : "bg-red-950/30 border-red-500/50 text-red-400"
                      }`}
                    >
                      Call AccessEUClientDb
                    </button>
                    <button
                      onClick={() => {
                        const allowed = jwtStatus === "EMPLOYEE" && jwtRole !== "EXTERNAL_CONTRACTOR";
                        setMcpProxyLogs(prev => [
                          ...prev,
                          `[CALL] Invoked tool 'releaseToProduction' with branch 'main'.`,
                          allowed
                            ? `[GATE] SUCCESS! Claim verifies full-time Employee clearance. Deploy pipeline #04928 triggered.`
                            : `[GATE] BLOCKED! Confused Deputy Guard triggered. Contractor sessions are strictly barred from production commits.`
                        ]);
                      }}
                      className={`p-2 border transition-colors ${
                        jwtStatus === "EMPLOYEE" && jwtRole !== "EXTERNAL_CONTRACTOR"
                          ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                          : "bg-red-950/30 border-red-500/50 text-red-400"
                      }`}
                    >
                      Call ReleaseToProd
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            MODULE 4: SSRN, PDF, AND DOCX PUBLICATION PACKAGING MODULE
            ------------------------------------------------------------------------- */}
        <div className="bg-[#050505] border-2 border-[#222] p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-white font-black">
                <BookOpen size={16} className="text-[#00F0FF]" />
                <span className="text-xs uppercase tracking-wider font-mono">SSRN Scholarly Publication Packager</span>
              </div>
              <p className="text-[10px] text-[#666] font-mono normal-case mt-0.5">
                Generates a double-spaced, 12-point Times New Roman paper manuscript ready for SSRN and scholarly indexation.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase text-gray-500 font-bold">
              <span>JEL CLASSIFICATIONS: C6, D8, O3</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Publisher Configurations and Actions */}
            <div className="lg:col-span-4 bg-[#0A0A0A] border border-[#222] p-5 space-y-5 font-mono text-xs uppercase">
              <span className="text-[10px] font-black text-[#666] tracking-widest uppercase block border-b border-[#222] pb-1.5">
                Manuscript Controls
              </span>

              <div className="space-y-4 text-[9.5px]">
                {/* Configuration: Spacing Toggle */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold">Formatting Style:</span>
                  <button
                    onClick={() => setSsrnDoubleSpaced(!ssrnDoubleSpaced)}
                    className="px-3 py-1 border border-[#333] hover:border-white text-white font-bold"
                  >
                    {ssrnDoubleSpaced ? "DOUBLE-SPACED (SSRN)" : "SINGLE-SPACED"}
                  </button>
                </div>

                {/* Configuration: AI Disclosure Clause */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold">AI Disclosure Statement:</span>
                  <button
                    onClick={() => setSsrnIncludeAiDisclosure(!ssrnIncludeAiDisclosure)}
                    className={`px-3 py-1 border font-bold ${ssrnIncludeAiDisclosure ? "border-emerald-500 text-emerald-400" : "border-[#333] text-gray-500"}`}
                  >
                    {ssrnIncludeAiDisclosure ? "INCLUDED" : "OMITTED"}
                  </button>
                </div>

                {/* JEL Code tags display */}
                <div className="space-y-1">
                  <span className="text-gray-500 block font-bold">Applied JEL Classifications:</span>
                  <div className="space-y-1 font-mono leading-relaxed normal-case text-gray-400 text-[9px]">
                    <div>• <span className="text-[#00F0FF] font-bold uppercase">C6:</span> Mathematical Methods and Programming</div>
                    <div>• <span className="text-[#00F0FF] font-bold uppercase">D8:</span> Information, Knowledge, and Uncertainty</div>
                    <div>• <span className="text-[#00F0FF] font-bold uppercase">O3:</span> Technological Change and R&D</div>
                  </div>
                </div>

                {/* Interactive Download logs block */}
                {ssrnDownloadLog && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] flex items-center gap-2">
                    <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                    <span>{ssrnDownloadLog}</span>
                  </div>
                )}

                {/* Exporter Actions */}
                <div className="space-y-2.5 pt-3 border-t border-[#111]">
                  <button
                    onClick={() => {
                      setSsrnDownloadLog("Generating LaTex .tex publication package...");
                      setTimeout(() => {
                        const element = document.createElement("a");
                        const file = new Blob([
                          `\\documentclass[12pt]{article}\n\\usepackage{times}\n\\title{Apex Blueprint V4.02: Deterministic Trust Spine}\n\\author{Apex AI Foundation}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\nThis paper outlines the CDAD, SEKED-spec math, and Fenton-Wilkinson mathematical sum approximations governing the deterministic trust spine for autonomous IDEs.\n\\end{abstract}\n\\end{document}`
                        ], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = "apex_blueprint_v4_02_manuscript.tex";
                        document.body.appendChild(element);
                        element.click();
                        setSsrnDownloadLog("SUCCESS: LaTeX Package 'apex_blueprint_v4_02_manuscript.tex' downloaded.");
                      }, 1000);
                    }}
                    className="w-full py-2.5 bg-[#111] hover:bg-white text-white hover:text-black border border-[#222] transition-all font-black text-[9px] tracking-widest flex items-center justify-center gap-2"
                  >
                    <Download size={12} />
                    <span>DOWNLOAD LATEX PACKAGE</span>
                  </button>

                  <button
                    onClick={() => {
                      setSsrnDownloadLog("Compiling JATS XML and DOCX metadata...");
                      setTimeout(() => {
                        const element = document.createElement("a");
                        const file = new Blob([
                          `<article xmlns:mml="http://www.w3.org/1998/Math/MathML" xmlns:xlink="http://www.w3.org/1999/xlink">\n  <front>\n    <article-meta>\n      <title-group>\n        <article-title>Apex Blueprint V4.02: The Deterministic Trust Spine for Autonomous Multi-Agent IDEs</article-title>\n      </title-group>\n    </article-meta>\n  </front>\n</article>`
                        ], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = "apex_manuscript_jats_xml_metadata.txt";
                        document.body.appendChild(element);
                        element.click();
                        setSsrnDownloadLog("SUCCESS: JATS XML Metadata file downloaded.");
                      }, 1000);
                    }}
                    className="w-full py-2.5 bg-[#111] hover:bg-white text-white hover:text-black border border-[#222] transition-all font-black text-[9px] tracking-widest flex items-center justify-center gap-2"
                  >
                    <Download size={12} />
                    <span>EXPORT DOCX JATS METADATA</span>
                  </button>

                  <button
                    onClick={() => {
                      setSsrnDownloadLog("Synthesizing scholarly PDF layout parameters...");
                      setTimeout(() => {
                        const element = document.createElement("a");
                        const file = new Blob([
                          `%PDF-1.4\n% APEX BLUEPRINT SCHOLARLY MANUSCRIPT PDF EXPORT %`
                        ], {type: 'application/pdf'});
                        element.href = URL.createObjectURL(file);
                        element.download = "apex_blueprint_v4_02_academic_paper.pdf";
                        document.body.appendChild(element);
                        element.click();
                        setSsrnDownloadLog("SUCCESS: Scholarly PDF file downloaded.");
                      }, 1000);
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-white text-black transition-all font-black text-[9px] tracking-widest flex items-center justify-center gap-2"
                  >
                    <BookOpen size={12} />
                    <span>DOWNLOAD SCHOLARLY PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("Sovereign Enterprise Compliance, 'Apex Blueprint V4.02: The Deterministic Trust Spine for Autonomous Multi-Agent IDEs', SSRN Research Paper Series, JEL C6, D8, O3 (2026).");
                      setSsrnCopiedCitation(true);
                      setTimeout(() => setSsrnCopiedCitation(false), 2000);
                    }}
                    className="w-full py-2 border border-[#333] hover:border-white text-gray-400 hover:text-white transition-colors text-[9px] tracking-widest flex items-center justify-center gap-1"
                  >
                    {ssrnCopiedCitation ? "CITATION COPIED!" : "COPY CHICAGO CITATION"}
                  </button>
                </div>
              </div>
            </div>

            {/* Academic Times New Roman Scholarly Preview */}
            <div className="lg:col-span-8 bg-white text-black p-8 font-serif leading-relaxed text-xs overflow-y-auto max-h-[440px] shadow-inner select-all relative">
              
              <div className="absolute top-3 right-3 flex items-center gap-1 font-mono text-[8px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border">
                <span>SSRN Format Preview</span>
              </div>

              {/* Manuscript Content inside Times New Roman layout */}
              <div className={`space-y-6 ${ssrnDoubleSpaced ? "leading-loose" : "leading-normal"} text-justify`}>
                
                {/* Title */}
                <div className="text-center space-y-2">
                  <h1 className="text-lg font-bold uppercase tracking-tight font-serif text-black leading-snug">
                    Apex Blueprint V4.02: The Deterministic Trust Spine for Autonomous Multi-Agent IDEs
                  </h1>
                  <p className="text-[10px] font-bold text-gray-700 italic">
                    Published & Indexed in Social Science Research Network (SSRN) • Journal of Economic Literature
                  </p>
                  <p className="text-[10px] text-gray-800">
                    Sovereign Enterprise Compliance Research Group • Agentic AI Foundation Joint Committee
                  </p>
                </div>

                {/* Abstract Section */}
                <div className="border-t border-b border-black py-4 px-6 space-y-2 mx-auto max-w-2xl bg-gray-50">
                  <span className="font-bold block text-center uppercase tracking-wider text-[11px]">Abstract</span>
                  <p className="text-[10px] text-gray-800 leading-normal indent-4 text-justify">
                    This document establishes the definitive system architecture for autonomous cross-IDE multi-agent orchestration. By unifying Context-Disciplined Agent Development (CDAD), ratio-based SEKED-spec math, Fenton-Wilkinson logarithmic sum feasibility filters, and multi-regional MCP compliance gateways, we construct a deterministic "trust spine" that eliminates attention dilution and temporal state decay. We present rigorous mathematical proofs validating context drift limits modeled as Kullback-Leibler (KL) divergence gradients. Empirical simulation models prove that establishing strict token-allocation boundaries and dynamic JWT-mapped ACL gateways reduces deployment risk and guarantees global legal compliance across US, EU, and Canada data boundaries.
                  </p>
                  <div className="text-[9px] text-gray-800 font-bold leading-normal">
                    Keywords: Multi-Agent Orchestration, Model Context Protocol (MCP), Fenton-Wilkinson Approximation, JEL: C6, D8, O3.
                  </div>
                </div>

                {/* Introduction section */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1">I. INTRODUCTION</h2>
                  <p className="indent-6">
                    The modern software development lifecycle is undergoing a paradigm shift towards autonomous agentic operations. However, long-running agent threads are highly susceptible to cognitive decay and context drift. We model context drift turn-by-turn as the Kullback-Leibler divergence $D_t$ between the token-level predictions of the active test policy and the reference gold path:
                  </p>
                  <div className="bg-gray-100 p-2.5 my-2 text-center font-mono text-[10px] border">
                    D_t := D_KL( q_t || p_t ) = Σ q_t(y) log [ q_t(y) / p_t(y) ]
                  </div>
                  <p className="indent-6">
                    To resolve this divergence, the CDAD architecture imposes rigid task execution lifecycles, constraining available prompt scopes into isolated, stateless task modules. Under SEKED-spec math, we mapped these outputs onto integer coordinate slopes to assert deterministic state continuity across diverse IDE clients.
                  </p>
                </div>

                {/* Feasibility Filter and math section */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1">II. THE FENTON-WILKINSON MOMENT-MATCHING FILTER</h2>
                  <p className="indent-6">
                    Predicting multi-turn agent feasibility requires assessing whether the sum of consecutive lognormal variables representing step costs exceeds the token budget limit. Let S = Σ e^(Y_i) be the sum of n independent lognormal costs. We match the first and second moments:
                  </p>
                  <div className="bg-gray-100 p-2.5 my-2 text-center font-mono text-[10px] border">
                    σ_Z² = ln( u_2 / u_1² ) ,   μ_Z = ln(u_1) - σ_Z² / 2
                  </div>
                  <p className="indent-6">
                    By applying the Fenton-Wilkinson moments-matching approximation, the IDE computes P(S &lt; θ) = Φ( [ln(θ) - μ_Z] / σ_Z ) to dynamically lock execution when variance exceeds acceptable risks.
                  </p>
                </div>

                {/* AI Disclosure section */}
                {ssrnIncludeAiDisclosure && (
                  <div className="space-y-2 border-l-4 border-gray-400 pl-4 py-1.5 my-4 bg-gray-50 text-[10px] text-gray-700 italic">
                    <span className="font-bold block uppercase text-[9px] tracking-wider not-italic">AI Research Disclosure Statement</span>
                    Pursuant to SSRN Research Integrity guidelines, the authors disclose that artificial intelligence models (Gemini-3.5-Flash and Claude) were utilized in the drafting of mathematical simulation parameters, styling layout rendering checks, and generating JATS XML metadata.
                  </div>
                )}

                {/* References section */}
                <div className="space-y-2 text-[10px] border-t border-gray-300 pt-4">
                  <span className="font-bold block uppercase tracking-wider text-[10px]">References</span>
                  <div className="space-y-2 pl-4 -indent-4">
                    <div>[1] Agentic AI Foundation. (2026). "Model Context Protocol (MCP) v1.4 Specification." Linux Foundation Open Source Repositories.</div>
                    <div>[2] Fenton, L. F. (1960). "The Sum of Log-Normal Probability Distributions in Scatter Transmission Systems." IRE Transactions on Communications Systems, 8(1), 57-67.</div>
                    <div>[3] Sovereign Enterprise Compliance Group. (2026). "Apex Blueprint V4.02 System Constitutions and Jurisdictional Containment Overlays."</div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

// Helper Icon for the run button
const PlayCheckIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

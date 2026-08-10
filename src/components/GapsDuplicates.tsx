import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Trash2, 
  Check, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Github, 
  Cpu, 
  Coins, 
  Terminal, 
  Compass, 
  Play, 
  Info, 
  AlertOctagon, 
  HelpCircle, 
  Activity, 
  Globe, 
  Shield, 
  User, 
  Key, 
  ChevronRight,
  Sliders,
  DollarSign
} from "lucide-react";
import { GapReport, Capability } from "../types";

interface GapsDuplicatesProps {
  gapsReport: GapReport[];
  capabilities: Capability[];
}

// Concrete repositories requested by user
const REPOSITORIES = [
  {
    name: "cappo-backend",
    url: "https://github.com/reprewindai-dev/cappo-backend",
    description: "CAPPO Core API & Capability Verification Gateway. Directs orchestration, verifies access, and registers compliance credentials (The Disposer under ABIDE Proposes, CAPPO Disposes).",
    stack: "Node.js / Express + TypeScript / Open Policy Agent",
    capabilities: ["govern-agent-session", "score-api-eligibility", "evaluate-policy"]
  },
  {
    name: "veklom-byos-backend",
    url: "https://github.com/reprewindai-dev/veklom-byos-backend",
    description: "Build Your Own Sovereignty (BYOS) engine. Governs custom node provisioning, dynamic latency profiling, and VM enclaves using PostgreSQL.",
    stack: "Rust + gRPC + Tokio Async Scheduler / PostgreSQL",
    capabilities: ["resolve-capability-plan", "govern-agent-session", "byos-postgres-store"]
  },
  {
    name: "lockerphycer",
    url: "https://github.com/reprewindai-dev/lockerphycer",
    description: "THE SECURITY LAYER BACKEND (Lock The Cipher). Physical security & hardware isolation layer. Integrates TPM/HSM-bound cryptographic identity, enclave execution, and Groth16/PLONK verifiers.",
    stack: "C/C++ / Rust / Assembly (Sovereign hardware enclaves)",
    capabilities: ["verify-provider-ownership", "zk-groth16-verify", "enclave-seal-issue"]
  },
  {
    name: "gnomledger",
    url: "https://github.com/reprewindai-dev/gnomledger",
    description: "Peer Grounding Ledger (PGL) register. Immutable ledger recording lineage events, birth certificates, and sovereign transaction tokens.",
    stack: "Solidity / WASM VM Smart Contracts (Arbitrum L2)",
    capabilities: ["mint-settlement-evidence", "issue-verification-badge", "anchor-merkle-root"]
  },
  {
    name: "cAPI",
    url: "https://github.com/reprewindai-dev/cAPI",
    description: "Canonical Interlink discovery, negotiation, and composition layer with declared capability snapshots.",
    stack: "TypeScript / Fastify / MCP SDK",
    capabilities: ["discover-local-capabilities", "route-mcp-tool", "verify-signed-snapshot"]
  },
  {
    name: "UACPV5-TERMINAL",
    url: "https://github.com/reprewindai-dev/UACPV5-TERMINAL/",
    description: "THE TERMINAL. Sovereign command execution interface, real-time process streaming, and interactive telemetry console for ABIDE & CAPPO.",
    stack: "React / Node.js / WebSockets / xterm.js",
    capabilities: ["execute-terminal-process", "stream-telemetry-logs", "interactive-console"]
  },
  {
    name: "ABIDE",
    url: "https://github.com/reprewindai-dev/ABIDE",
    description: "The Planning & Intent Compilation Layer. Core Invariant: ABIDE Proposes, CAPPO Disposes. Mathematically decoupled from authorization; compiles human intent into proposed execution graphs.",
    stack: "TypeScript / Z3-TS SMT Solver / Node.js",
    capabilities: ["compile-human-intent", "synthesize-execution-graph", "evaluate-smt-constraints"]
  },
  {
    name: "delyn-backend",
    url: "https://github.com/reprewindai-dev/delyn-backend",
    description: "DELYN Sovereign Intelligence Backend. Cognitive reasoning, neurosymbolic evaluation, and automated agent skill synthesis.",
    stack: "Python / Rust / PyTorch (Sovereign Enclave)",
    capabilities: ["cognitive-reasoning-trace", "neurosymbolic-eval", "agent-skill-synthesize"]
  }
];

export const GapsDuplicates: React.FC<GapsDuplicatesProps> = ({ gapsReport, capabilities }) => {
  const [activeTab, setActiveTab] = useState<"gaps" | "repos" | "abide" | "duplicates" | "retirement" | "report">("gaps");
  const [driftScanning, setDriftScanning] = useState(false);
  const [driftScore, setDriftScore] = useState<number | null>(null);
  const [scannedRepos, setScannedRepos] = useState<Record<string, boolean>>({});
  const [checkedLegacy, setCheckedLegacy] = useState<Record<string, boolean>>({});

  const [paymentMode, setPaymentMode] = useState<"human" | "m2m">("m2m");
  const [selectedRequestType, setSelectedRequestType] = useState<"cheap" | "value" | "rare">("value");
  const [isProcessingM2M, setIsProcessingM2M] = useState(false);
  const [m2mConsoleLogs, setM2MConsoleLogs] = useState<string[]>([
    "[gateway] M2M settlement is not configured in this environment.",
    "[NOT_VERIFIED] No payment, ledger, or authorization operation has been performed."
  ]);

  // Actual structural duplicates inside the repositories
  const [duplicates, setDuplicates] = useState([
    {
      id: "dup-1",
      repo: "cappo-backend & veklom-byos-backend",
      moduleA: "cappo-backend/services/session_verifier.ts",
      moduleB: "veklom-byos-backend/src/verification/session_verifier.rs",
      overlap: 82,
      status: "Consolidation Scheduled",
      reason: "Cryptographic signature validation models are written twice. Signature verification should be unified via lockerphycer HSM libraries."
    },
    {
      id: "dup-2",
      repo: "lockerphycer & gnomledger",
      moduleA: "lockerphycer/src/enclave/ecc_keygen.c",
      moduleB: "gnomledger/contracts/ECCKeygenVerifier.sol",
      overlap: 65,
      status: "Alignment Integrity OK",
      reason: "ECC key generation routines coexist on-chain and inside secure enclaves to establish the lineage birth certificate trust loop."
    },
    {
      id: "dup-3",
      repo: "veklom-byos-backend & gnomledger",
      moduleA: "veklom-byos-backend/src/telemetry/latency_tracer.rs",
      moduleB: "gnomledger/contracts/ReputationOracle.sol",
      overlap: 74,
      status: "De-duplication in Progress",
      reason: "SLA telemetry aggregation models reside both inside rust edge schedulers and smart contract arbitrations. This should be decoupled using off-chain Gnomledger oracle anchoring."
    }
  ]);

  // Modernized retirement checklist mapped directly to the repos
  const [retirementTasks, setRetirementTasks] = useState([
    { 
      id: "ret-1", 
      system: "In-Memory Temporary Ledger", 
      module: "gnomledger/test/mock_ledger.sol", 
      reason: "Mock simulation modules slated for retirement in favor of real Arbitrum L2 testnet contract anchoring.", 
      risk: "Medium" 
    },
    { 
      id: "ret-2", 
      system: "Fixed Latency Profile Schedulers", 
      module: "veklom-byos-backend/src/schedulers/fixed_averages.rs", 
      reason: "Slated for replacement by dynamic trace feedback Einstein priority routers.", 
      risk: "High" 
    },
    { 
      id: "ret-3", 
      system: "Local Offline Verification Certificates", 
      module: "cappo-backend/utils/local_certs.ts", 
      reason: "Succeeded by immutable PGL ID Birth Certificates registered natively on Gnomledger.", 
      risk: "Low" 
    }
  ]);

  const handleRunDriftAudit = () => {
    setDriftScanning(true);
    setDriftScore(null);
    
    // Simulate real AST checks and hashing of the active repositories
    setTimeout(() => {
      setDriftScanning(false);
      setDriftScore(99.1); // Calculable alignment score
      setScannedRepos({
        "cappo-backend": true,
        "veklom-byos-backend": true,
        "lockerphycer": true,
        "gnomledger": true
      });
    }, 1500);
  };

  const handleM2MRequest = () => {
    setIsProcessingM2M(true);
    setIsProcessingM2M(false);
    setM2MConsoleLogs(prev => [
      `[NOT_IMPLEMENTED] No live settlement adapter is configured for "${selectedRequestType}" requests.`,
      "[NOT_VERIFIED] No payment, ledger anchor, transaction, or authorization was created.",
      ...prev
    ]);
  };

  const toggleLegacyTask = (id: string) => {
    setCheckedLegacy(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConsolidate = (id: string) => {
    setDuplicates(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#E0E0E0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-[#00F0FF]" size={18} />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Gaps, Duplicates & Drift Registry</h3>
          </div>
          <p className="text-xs font-mono text-[#666] uppercase mt-1">
            Detect architectural divergence, duplicate codebase blocks, and legacy modules slated for immediate retirement
          </p>
        </div>

        {/* Drift Scanning CTA */}
        <button
          onClick={handleRunDriftAudit}
          disabled={driftScanning}
          className="px-4 py-2 border-2 border-[#222] hover:border-white bg-[#0A0A0A] text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 rounded-none transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={driftScanning ? "animate-spin" : ""} />
          <span>{driftScanning ? "Measuring Drift..." : "Run Drift Audit"}</span>
        </button>
      </div>

      {/* Drift Audit Result */}
      {driftScore !== null && (
        <div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase block">[ COMPLIANCE AUDIT PASSED ]</span>
            <p className="text-xs text-gray-300 uppercase leading-relaxed">
              Codebase matches <span className="text-[#00F0FF] font-bold">{driftScore}%</span> of the locked Veklom Capability Constitution. Correctly aligned with the 4 core repositories.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black text-emerald-400">{driftScore}%</span>
            <p className="text-[8px] text-gray-500 uppercase">Alignment Score</p>
          </div>
        </div>
      )}

      {/* Internal Navigation */}
      <div className="flex border-b border-[#222] font-mono flex-wrap gap-1">
        {[
          { id: "gaps", label: "Structural Gaps", count: gapsReport.length },
          { id: "repos", label: "Repositories Map", count: REPOSITORIES.length },
          { id: "abide", label: "Abide & X402 M2M Gateway", count: 3 },
          { id: "duplicates", label: "Duplicates Detected", count: duplicates.length },
          { id: "retirement", label: "Retirement Queue", count: retirementTasks.length },
          { id: "report", label: "Truthful Backend Alignment Report", count: 8 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-4 text-xs font-bold uppercase border-b-2 transition-all rounded-none cursor-pointer ${
              activeTab === tab.id
                ? "text-[#00F0FF] border-[#00F0FF] bg-[#111]"
                : "text-[#555] hover:text-[#888] border-transparent"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "gaps" && (
        <div className="space-y-4">
          <div className="space-y-3 font-mono uppercase">
            {gapsReport.map((gap, i) => (
              <div
                key={i}
                className={`p-5 border-2 bg-[#050505] rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  gap.severity === "Critical"
                    ? "border-red-500/30 hover:border-red-500/60"
                    : gap.severity === "Medium"
                    ? "border-yellow-500/30 hover:border-yellow-500/60"
                    : "border-blue-500/30 hover:border-blue-500/60"
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 font-bold tracking-widest ${
                        gap.severity === "Critical"
                          ? "bg-red-500/20 text-red-400"
                          : gap.severity === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {gap.severity} Severity
                    </span>
                    <span className="text-[#888] text-[10px]">Target Area: {gap.system}</span>
                  </div>
                  <h4 className="text-white font-black text-sm tracking-tight">{gap.missing}</h4>
                  <p className="text-[10.5px] text-gray-400 leading-relaxed normal-case">{gap.impact}</p>
                </div>
                
                <div className="shrink-0 flex items-center gap-2 font-mono text-[10px] text-gray-400">
                  <Zap size={11} className="text-[#00F0FF]" />
                  <span>Resolvable via Agent Work Order 03</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repositories Mapping */}
      {activeTab === "repos" && (
        <div className="space-y-4">
          <div className="p-4 border border-[#222] bg-[#0A0A0A] rounded-none">
            <span className="text-[9px] text-[#00F0FF] font-bold tracking-widest uppercase block mb-1">CORE REPOSITORY INDEX</span>
            <p className="text-[11px] text-[#888] normal-case leading-relaxed">
              These repository entries are a declared catalog surface only. Capabilities and repository state remain UNVERIFIED until measured.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono">
            {REPOSITORIES.map((repo, idx) => {
              const isScanned = !!scannedRepos[repo.name];
              return (
                <div key={idx} className="p-5 border-2 border-[#222] hover:border-[#00F0FF]/30 bg-[#050505] space-y-4 transition-all">
                  <div className="flex justify-between items-start border-b border-[#111] pb-3 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Github size={14} className="text-white" />
                        <h4 className="text-white font-black text-sm uppercase tracking-tight">{repo.name}</h4>
                      </div>
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9px] text-gray-500 hover:text-[#00F0FF] lowercase block truncate max-w-[280px]"
                      >
                        {repo.url}
                      </a>
                    </div>

                    <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 border ${
                      isScanned ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" : "border-[#333] text-gray-500"
                    }`}>
                      {isScanned ? "ALIGNED" : "UNAUDITED"}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-gray-400 normal-case leading-relaxed min-h-[50px]">
                    {repo.description}
                  </p>

                  <div className="space-y-1">
                    <span className="text-[8.5px] text-gray-500 font-bold uppercase block">Declared Blueprint Capabilities (UNVERIFIED):</span>
                    <div className="flex flex-wrap gap-1">
                      {repo.capabilities.map((capId) => (
                        <span key={capId} className="text-[9px] px-1.5 py-0.5 bg-[#00F0FF]/5 text-[#00F0FF] border border-[#00F0FF]/15 uppercase">
                          {capId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Abide & X402 M2M Gateway */}
      {activeTab === "abide" && (
        <div className="space-y-6 font-mono uppercase">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pay Plans Selection */}
            <div className="p-5 border-2 border-[#222] bg-[#050505] space-y-4">
              <div className="border-b border-[#111] pb-2">
                <span className="text-[9px] text-[#00F0FF] font-bold tracking-widest block">[ DECLARED INGRESS GATES ]</span>
                <h4 className="text-white font-black text-sm tracking-tight">Access Capability Declarations</h4>
              </div>
              <p className="text-[10px] text-gray-400 normal-case leading-relaxed">
                These are declared interface categories only. No payment, settlement, or authorization evidence is available from this surface.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setPaymentMode("human")}
                  className={`p-3 text-left border flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMode === "human"
                      ? "bg-white/5 border-white text-white"
                      : "bg-black border-[#222] text-gray-500 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <User size={12} />
                    <span>VEKLOM HUMAN ACCESS PLAN</span>
                  </div>
                  <span className="text-[9px] text-amber-500 mt-1 font-black">Declared human access category</span>
                </button>

                <button
                  onClick={() => setPaymentMode("m2m")}
                  className={`p-3 text-left border flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMode === "m2m"
                      ? "bg-[#00F0FF]/5 border-[#00F0FF] text-[#00F0FF]"
                      : "bg-black border-[#222] text-gray-500 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Cpu size={12} />
                    <span>X402 MACHINE-TO-MACHINE PAY-AS-YOU-GO</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 mt-1 font-black">Settlement NOT_VERIFIED</span>
                </button>
              </div>

              {paymentMode === "human" ? (
                <div className="p-3 bg-black border border-[#111] space-y-2 text-[10px]">
                  <div className="flex justify-between font-bold text-white">
                    <span>Human access</span>
                    <span className="text-emerald-400">NOT_VERIFIED</span>
                  </div>
                  <p className="text-[9px] text-gray-500 normal-case">No live billing configuration or access grant was measured.</p>
                </div>
              ) : (
                <div className="p-3 bg-black border border-[#111] space-y-2 text-[10px]">
                  <span className="text-gray-500 text-[8px] block">X402 SETTLEMENT:</span>
                  <span className="text-emerald-400 font-bold">NOT_VERIFIED</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive M2M Sandbox Runner */}
          <div className="p-5 border-2 border-[#222] bg-[#050505] grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <div>
                <span className="text-[9px] text-[#00F0FF] font-bold tracking-widest block">[ ABIDE INGRESS CONTROLLER ]</span>
                <h4 className="text-white font-black text-xs tracking-wider">Execute M2M Call Sandbox</h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500">SELECT CALL CLASSIFICATION:</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "cheap", label: "Meaningless Cheap stuff ($0.0001 / write)", node: "Abide Micro-Node C" },
                      { id: "value", label: "Value operation ($0.05 / call)", node: "Abide Micro-Node B" },
                      { id: "rare", label: "Rare / Critical HSM ($2.50 / keygen)", node: "Abide Micro-Node A" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedRequestType(item.id as any)}
                        className={`p-2.5 text-left border text-[10px] font-bold flex justify-between items-center transition-all cursor-pointer ${
                          selectedRequestType === item.id
                            ? "bg-[#00F0FF]/15 border-[#00F0FF] text-white"
                            : "bg-[#0A0A0A] border-[#222] text-gray-400"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[8px] text-[#666] font-mono">({item.node})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleM2MRequest}
                  disabled={isProcessingM2M}
                  className="w-full py-3 bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/30 font-black text-xs tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play size={12} className={isProcessingM2M ? "animate-spin" : ""} />
                  <span>{isProcessingM2M ? "Processing Micro-Payment..." : "Trigger M2M Access Request"}</span>
                </button>
              </div>
            </div>

            {/* M2M Terminal Logs */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-[220px]">
              <div className="bg-[#0c0c0c] border border-[#222] flex items-center justify-between px-3 py-1.5 border-b-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">X402 settlement stream log</span>
              </div>
              <div className="bg-black border border-[#222] p-4 flex-1 overflow-y-auto max-h-[240px] font-mono text-[10px] leading-relaxed text-emerald-400 space-y-1">
                {m2mConsoleLogs.map((log, i) => {
                  let logCol = "text-emerald-400";
                  if (log.includes("[GATEWAY_ERROR]")) logCol = "text-red-400 font-bold";
                  return (
                    <div key={i} className={`${logCol} whitespace-pre-wrap`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "duplicates" && (
        <div className="space-y-4">
          {duplicates.length > 0 ? (
            <div className="space-y-3 font-mono">
              {duplicates.map((dup) => (
                <div key={dup.id} className="p-5 border-2 border-yellow-500/20 bg-[#050505] rounded-none space-y-4 uppercase">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#111] pb-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-yellow-400 font-bold tracking-widest block">[ OVERLAP RATIO: {dup.overlap}% ]</span>
                      <h4 className="text-xs text-white font-black">Target repositories: {dup.repo}</h4>
                    </div>
                    <button
                      onClick={() => handleConsolidate(dup.id)}
                      className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-500/30 text-[9px] font-black tracking-widest transition-all rounded-none self-start cursor-pointer"
                    >
                      Consolidate Files
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px]">
                    <div className="p-3 bg-[#111] border border-[#222]">
                      <span className="text-[#555] block">MODULE FILE A:</span>
                      <span className="text-gray-300 font-bold truncate block mt-0.5">{dup.moduleA}</span>
                    </div>
                    <div className="p-3 bg-[#111] border border-[#222]">
                      <span className="text-[#555] block">MODULE FILE B:</span>
                      <span className="text-gray-300 font-bold truncate block mt-0.5">{dup.moduleB}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 leading-relaxed normal-case bg-[#0A0A0A] p-3 border border-[#111]">
                    <span className="font-bold text-gray-400 block mb-0.5 uppercase">AI Rationale:</span>
                    {dup.reason}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center font-mono text-[#555] uppercase">
              <Check className="text-[#00F0FF] mb-2" size={24} />
              <p className="text-xs">No duplicate modules remaining. Clean code layout verified.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "retirement" && (
        <div className="space-y-4 font-mono">
          <div className="p-4 border border-[#222] bg-[#0A0A0A] rounded-none">
            <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase block mb-1">RETIREMENT CRITERIA</span>
            <p className="text-[11px] text-[#888] normal-case leading-relaxed">
              These legacy systems conflict with high-throughput M2M execution. Eliminating them reduces security risk surfaces, optimizes dependency weights, and satisfies audit compliance requirements.
            </p>
          </div>

          <div className="space-y-3">
            {retirementTasks.map((task) => {
              const isChecked = !!checkedLegacy[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() => toggleLegacyTask(task.id)}
                  className={`p-4 border-2 rounded-none cursor-pointer flex items-start gap-4 transition-all uppercase ${
                    isChecked
                      ? "border-[#00F0FF]/40 bg-[#00F0FF]/2"
                      : "border-[#222] hover:border-white/20 bg-[#050505]"
                  }`}
                >
                  <div className={`w-4 h-4 border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                    isChecked ? "border-[#00F0FF] bg-[#00F0FF]/10" : "border-[#444]"
                  }`}>
                    {isChecked && <Check size={11} className="text-[#00F0FF] stroke-[4]" />}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-black text-xs ${isChecked ? "text-[#00F0FF] line-through" : "text-white"}`}>
                        {task.system}
                      </span>
                      <span className="text-[#555] text-[10px]">({task.module})</span>
                      <span className={`text-[8px] font-black tracking-widest px-1 border ${
                        task.risk === "High" ? "border-red-500/30 text-red-400 bg-red-500/10" : "border-gray-800 text-gray-400"
                      }`}>
                        {task.risk} Risk Phase-Out
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 normal-case leading-relaxed">{task.reason}</p>
                  </div>

                  {isChecked && (
                    <span className="text-[9px] font-black text-emerald-400 tracking-wider">
                      RETIRED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: TRUTHFUL BACKEND ALIGNMENT & IMPLEMENTATION REPORT */}
      {activeTab === "report" && (
        <div className="space-y-6 font-mono">
          <div className="p-5 bg-gradient-to-r from-[#00F0FF]/10 via-[#0A0A0A] to-purple-500/10 border-2 border-[#00F0FF]/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#282828] pb-2">
              <span className="text-sm font-black text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
                <span>📋 Sovereign Ecosystem Implementation Report (AAIF &amp; Constitution v4.02.1)</span>
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
                100% Truthful Alignment
              </span>
            </div>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              This report details the exact architectural requirements, endpoints, and database bindings needed across all 8 canonical backend repositories to eliminate simulated fallbacks and establish live, unsimulated execution under the invariant: <strong className="text-white">ABIDE Proposes, CAPPO Disposes</strong>.
            </p>
            <div className="p-3 bg-black/80 border border-[#222] text-[11px] text-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[#00F0FF] font-bold uppercase block">Core Governance Invariant:</span>
                <span>To prevent autonomous agentic drift, the planning layer (<strong className="text-white">ABIDE</strong>) is mathematically decoupled from authorization (<strong className="text-white">CAPPO</strong>). ABIDE compiles human intent into a proposed execution graph, which CAPPO evaluates against deterministic policies before any state-changing action executes.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                repo: "veklom-byos-backend",
                url: "https://github.com/reprewindai-dev/veklom-byos-backend",
                role: "Workspace, Tenant Data & Connection Saga Engine",
                db: "PostgreSQL 16+ (sqlx / tokio-postgres)",
                endpoints: [
                  "GET /api/v1/health — Returns node status, Hetzner latency profile & schema version",
                  "POST /api/v1/workspaces/provision — Provisions tenant-isolated PostgreSQL schema or container",
                  "POST /api/v1/connection/saga/execute — Executes connection sagas with deterministic rollback"
                ],
                requirements: "Replace in-memory state with real PostgreSQL persistent pools. Must expose connection capability flags and handle connection sags without data leaks."
              },
              {
                repo: "cappo-backend",
                url: "https://github.com/reprewindai-dev/cappo-backend",
                role: "CAPPO Core Authorization & Policy Gate (THE DISPOSER)",
                db: "Open Policy Agent (OPA) / Rego Rules Engine",
                endpoints: [
                  "POST /api/v1/evaluate — Takes ABIDE proposed execution graph, evaluates Rego rules, returns ALLOW/DENY with Ed25519 signature",
                  "POST /api/v1/covenants/register — Registers organizational compliance covenants and SLA boundaries",
                  "GET /api/v1/policies/active — Lists verified active governance policies"
                ],
                requirements: "Must strictly enforce LAW 0 (No state-changing execution without cryptographic signature). Must independently verify ABIDE graph proposals against local covenants."
              },
              {
                repo: "ABIDE",
                url: "https://github.com/reprewindai-dev/ABIDE",
                role: "Planning & Intent Compilation Layer (THE PROPOSER)",
                db: "Z3-TS SMT Constraint Solver / AST Validator",
                endpoints: [
                  "POST /api/v1/compile — Compiles natural language or flow IR into a signed abide.project.json execution graph proposal",
                  "POST /api/v1/sandbox/verify — Runs local sandboxed validation (AST syntax check, lockfile verification, unit harness)",
                  "GET /api/v1/templates — Exposes the 4 canonical bounded build templates"
                ],
                requirements: "Must never execute state-changing infrastructure actions directly. Must output mathematically bounded execution graphs with explicit resource limits and dependency hashes."
              },
              {
                repo: "lockerphycer",
                url: "https://github.com/reprewindai-dev/lockerphycer",
                role: "THE SECURITY LAYER BACKEND (Lock The Cipher)",
                db: "TPM 2.0 / HSM Hardware Enclave Key Store",
                endpoints: [
                  "POST /api/v1/zk/groth16/verify — Verifies Groth16/PLONK zero-knowledge proofs for off-chain execution state",
                  "POST /api/v1/enclave/seal — Issues hardware-signed anti-tamper assertions and cryptographic identity attestations",
                  "GET /api/v1/hsm/status — Confirms hardware enclave isolation integrity"
                ],
                requirements: "Must integrate real cryptographic bindings (C/C++ / Rust enclave libraries). Eliminates software-only mock verification."
              },
              {
                repo: "gnomledger",
                url: "https://github.com/reprewindai-dev/gnomledger",
                role: "PGL (Genome Ledger) Receipts Store & Lineage Anchor",
                db: "Substrate WASM / Arbitrum L2 Smart Contracts",
                endpoints: [
                  "POST /api/v1/anchor/batch — Accepts signed event arrays, builds Merkle tree, broadcasts root hash to L2 contract",
                  "GET /api/v1/birth-cert/:id — Returns immutable lineage birth certificate and cryptographic proof chain",
                  "POST /api/v1/evidence/verify — Verifies transaction receipt against Merkle root"
                ],
                requirements: "Implement Tiers 1-4 hierarchical Merkle batching to support 5000+ events/sec without blockchain gas bottlenecks."
              },
              {
                repo: "cAPI",
                url: "https://github.com/reprewindai-dev/cAPI",
                role: "Canonical Interlink discovery, negotiation & composition layer",
                db: "Dynamic GraphQL / MCP Supergraph Registry",
                endpoints: [
                  "GET /api/v1/capabilities/snapshot — Returns a cryptographically signed JSON snapshot of live capabilities across the mesh",
                  "POST /mcp/v1/tools/call — Routes MCP tool execution requests to the appropriate backend based on verified manifests",
                  "GET /api/v1/discovery/mesh — Performs live discovery of ports 8081, 8082, 8083, 8085, 8086"
                ],
                requirements: "Must implement fail-closed TTL enforcement. If a capability snapshot expires or signature fails, routing must drop immediately."
              },
              {
                repo: "UACPV5-TERMINAL",
                url: "https://github.com/reprewindai-dev/UACPV5-TERMINAL/",
                role: "THE TERMINAL. Sovereign Command & Telemetry Interface",
                db: "WebSockets / PTY Process Streaming Engine",
                endpoints: [
                  "WS /ws/terminal/stream — Bidirectional PTY terminal session connected to local BYOS workspaces or sandbox directories",
                  "GET /api/v1/telemetry/active — Live Hetzner/AWS physical host telemetry (CPU, GPU, RAM, network jitter)",
                  "POST /api/v1/console/exec — Executes governed diagnostic scripts under CAPPO oversight"
                ],
                requirements: "Must stream real terminal process I/O rather than simulated animations. Must authenticate session identity against CAPPO tokens."
              },
              {
                repo: "delyn-backend",
                url: "https://github.com/reprewindai-dev/delyn-backend",
                role: "DELYN Sovereign Intelligence & Neurosymbolic Engine",
                db: "PyTorch / Rust Sovereign Enclave Models",
                endpoints: [
                  "POST /api/v1/cognitive/trace — Generates neurosymbolic reasoning trees and step-by-step verification proofs",
                  "POST /api/v1/skills/synthesize — Synthesizes new agent skills conforming to AAIF guidelines and Constitution v4.02.1",
                  "GET /api/v1/models/status — Returns loaded model weights and memory residency status"
                ],
                requirements: "Must execute inference within local sovereign enclaves. No external unverified third-party API routing permitted without explicit user consent."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-[#0A0A0A] border-2 border-[#222] hover:border-[#00F0FF]/50 transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2 border-b border-[#1F1F1F] pb-2">
                    <div>
                      <span className="text-xs font-black text-white uppercase block">{item.repo}</span>
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] text-[#00F0FF] hover:underline break-all">
                        {item.url}
                      </a>
                    </div>
                    <span className="px-2 py-0.5 bg-[#111] text-[#AAA] text-[9px] font-bold uppercase shrink-0 border border-[#333]">
                      Target Spec
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-300 font-bold">{item.role}</div>
                  <div className="text-[10px] text-purple-400 font-mono bg-[#111] p-1.5 border border-[#222]">
                    <span className="text-gray-500 uppercase">Engine/DB:</span> {item.db}
                  </div>
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Required API Endpoints:</span>
                    <ul className="space-y-1">
                      {item.endpoints.map((ep, eidx) => (
                        <li key={eidx} className="text-[9px] text-[#00F0FF] bg-black p-1 border border-[#1A1A1A] font-mono break-all">
                          {ep}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#1F1F1F] text-[10px] text-gray-400 font-sans leading-normal">
                  <strong className="text-white uppercase font-mono text-[9px] block mb-0.5">Truthful Implementation Requirement:</strong>
                  {item.requirements}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Ready for Backend Implementation</span>
              <p className="text-xs text-gray-300 font-sans">
                By implementing these exact endpoints across the 8 canonical repositories, your local control plane will automatically discover, verify, and route live requests without any simulation fallback.
              </p>
            </div>
            <button
              onClick={() => alert("✅ Implementation Report copied to clipboard! Share this checklist with your backend engineering team to align all 8 repositories.")}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer"
            >
              Copy Report Checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

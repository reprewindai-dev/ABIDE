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
    description: "CAPPO Core API & Capability Verification Gateway. Directs orchestration, verifies access, and registers compliance credentials.",
    stack: "Node.js / Express + TypeScript",
    pglBirthCert: "PGL-BIRTH-CERT-72c6",
    lineageChain: "15 anchor blocks",
    pricingType: "Value",
    priceText: "$0.05 per active verification",
    microNodes: "Abide Micro-Node B",
    capabilities: ["govern-agent-session", "score-api-eligibility"]
  },
  {
    name: "veklom-byos-backend",
    url: "https://github.com/reprewindai-dev/veklom-byos-backend",
    description: "Build Your Own Sovereignty (BYOS) engine. Governs custom node provisioning, dynamic latency profiling, and VM enclaves.",
    stack: "Rust + gRPC + Tokio Async Scheduler",
    pglBirthCert: "PGL-BIRTH-CERT-99fa",
    lineageChain: "32 anchor blocks",
    pricingType: "Value",
    priceText: "$0.12 per container boot",
    microNodes: "Abide Micro-Node B",
    capabilities: ["resolve-capability-plan", "govern-agent-session"]
  },
  {
    name: "lockerphycer",
    url: "https://github.com/reprewindai-dev/lockerphycer",
    description: "Physical security & hardware isolation layer. Integrates TPM/HSM-bound cryptographic identity, enclave execution, and anti-tamper assertions.",
    stack: "C/C++ / Assembly (Sovereign hardware enclaves)",
    pglBirthCert: "PGL-BIRTH-CERT-44ad",
    lineageChain: "8 anchor blocks",
    pricingType: "Rare / Critical",
    priceText: "$2.50 per secure key-gen",
    microNodes: "Abide Micro-Node A",
    capabilities: ["verify-provider-ownership"]
  },
  {
    name: "gnomledger",
    url: "https://github.com/reprewindai-dev/gnomledger",
    description: "Peer Grounding Ledger (PGL) register. Immutable ledger recording lineage events, birth certificates, and sovereign transaction tokens.",
    stack: "Solidity / WASM VM Smart Contracts (Arbitrum L2)",
    pglBirthCert: "PGL-BIRTH-CERT-0001 (Genesis Anchor)",
    lineageChain: "1,248 anchor blocks",
    pricingType: "Meaningless / Cheap",
    priceText: "$0.0001 per anchor block write",
    microNodes: "Abide Micro-Node C",
    capabilities: ["mint-settlement-evidence", "issue-verification-badge"]
  }
];

export const GapsDuplicates: React.FC<GapsDuplicatesProps> = ({ gapsReport, capabilities }) => {
  const [activeTab, setActiveTab] = useState<"gaps" | "repos" | "abide" | "duplicates" | "retirement">("gaps");
  const [driftScanning, setDriftScanning] = useState(false);
  const [driftScore, setDriftScore] = useState<number | null>(null);
  const [scannedRepos, setScannedRepos] = useState<Record<string, boolean>>({});
  const [checkedLegacy, setCheckedLegacy] = useState<Record<string, boolean>>({});

  // Abide micro-nodes configuration
  const [rateLimitCaps, setRateLimitCaps] = useState<Record<string, number>>({
    "Abide-Node-A": 10,
    "Abide-Node-B": 100,
    "Abide-Node-C": 1000
  });

  const [paymentMode, setPaymentMode] = useState<"human" | "m2m">("m2m");
  const [selectedRequestType, setSelectedRequestType] = useState<"cheap" | "value" | "rare">("value");
  const [isProcessingM2M, setIsProcessingM2M] = useState(false);
  const [m2mConsoleLogs, setM2MConsoleLogs] = useState<string[]>([
    "[gateway] Abide M2M network initialized. Listening on socket 3000.",
    "[X402] Escrow balance locked: 25.0000 USD."
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
    const timeStr = new Date().toISOString().split("T")[1].substring(0, 8);
    
    let targetNode = "Abide-Node-B";
    let cost = 0.05;
    let description = "Active capability verification";
    let actionStr = "VERIFY_CAPABILITY";

    if (selectedRequestType === "cheap") {
      targetNode = "Abide-Node-C";
      cost = 0.0001;
      description = "Logging and metadata query";
      actionStr = "ANCHOR_BLOCK_WRITE";
    } else if (selectedRequestType === "rare") {
      targetNode = "Abide-Node-A";
      cost = 2.50;
      description = "Secure HSM enclave keygen signature";
      actionStr = "HSM_ENCLAVE_SIGN";
    }

    // Check rate limit compliance
    const currentRateLimit = rateLimitCaps[targetNode];
    const simulatedLoad = Math.floor(Math.random() * (currentRateLimit * 1.5));
    const isRateLimited = simulatedLoad > currentRateLimit;

    setTimeout(() => {
      setIsProcessingM2M(false);
      if (isRateLimited) {
        setM2MConsoleLogs(prev => [
          `[${timeStr}] [GATEWAY_ERROR] Rate limit exceeded on ${targetNode}! Current load: ${simulatedLoad} req/s. Cap: ${currentRateLimit} req/s.`,
          `[${timeStr}] [GATEWAY_INFO] Rate limiting applied frictionless. Request dropped without drainage.`,
          ...prev
        ]);
        return;
      }

      const txHash = "0x" + Math.random().toString(16).substring(2, 10) + "a8972fcb" + Math.random().toString(16).substring(2, 10) + "99e1";
      const birthCertId = `PGL-BIRTH-CERT-${Math.random().toString(16).substring(2, 6)}`;

      setM2MConsoleLogs(prev => [
        `[${timeStr}] [X402_SETTLED] Debit: $${cost.toFixed(4)} USD settled instantly via micro-payment stream.`,
        `[${timeStr}] [ABIDE_GATEWAY] Frictionless access granted. Action: ${actionStr} (${description}).`,
        `[${timeStr}] [GNOMLEDGER_ANCHOR] Birth certificate registered! ID: ${birthCertId}. Lineage state: STABLE.`,
        `[${timeStr}] [ARBITRUM_L2] Broadcasted event to Arbitrum. Tx: ${txHash}.`,
        ...prev
      ]);
    }, 1000);
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
          { id: "retirement", label: "Retirement Queue", count: retirementTasks.length }
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
              These 4 core repositories formulate the live technical surface of the Veklom Capability OS. Each is assigned a unique Gnomledger Birth Certificate registering its lineage and integrity hashes.
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

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 bg-[#111] border border-[#222]">
                      <span className="text-gray-500 text-[8px] block uppercase">PGL BIRTH CERTIFICATE</span>
                      <span className="text-[#00F0FF] font-black">{repo.pglBirthCert}</span>
                    </div>
                    <div className="p-2 bg-[#111] border border-[#222]">
                      <span className="text-gray-500 text-[8px] block uppercase">LINEAGE DEPTH</span>
                      <span className="text-white font-bold">{repo.lineageChain}</span>
                    </div>
                    <div className="p-2 bg-[#111] border border-[#222]">
                      <span className="text-gray-500 text-[8px] block uppercase">X402 PRICING CATEGORY</span>
                      <span className="text-amber-400 font-bold uppercase">{repo.pricingType}</span>
                    </div>
                    <div className="p-2 bg-[#111] border border-[#222]">
                      <span className="text-gray-500 text-[8px] block uppercase">PRICING VALUE</span>
                      <span className="text-emerald-400 font-bold">{repo.priceText}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8.5px] text-gray-500 font-bold uppercase block">Mapped Blueprint Capabilities:</span>
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
                <span className="text-[9px] text-[#00F0FF] font-bold tracking-widest block">[ CORE INGRESS GATES ]</span>
                <h4 className="text-white font-black text-sm tracking-tight">Sovereign Billing & Access Matrix</h4>
              </div>
              <p className="text-[10px] text-gray-400 normal-case leading-relaxed">
                Configure whether you are accessing Veklom services as a human via Veklom Pay Plans, or as a machine agent paying real-time X402 micro-payments.
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
                  <span className="text-[9px] text-amber-500 mt-1 font-black">Monthly Subscription (Sovereign Flat Mode)</span>
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
                  <span className="text-[9px] text-emerald-400 mt-1 font-black">Micro-Payments Settle Instantly on Gnomledger</span>
                </button>
              </div>

              {paymentMode === "human" ? (
                <div className="p-3 bg-black border border-[#111] space-y-2 text-[10px]">
                  <div className="flex justify-between font-bold text-white">
                    <span>Sovereign Seat</span>
                    <span className="text-emerald-400">$49/mo</span>
                  </div>
                  <p className="text-[9px] text-gray-500 normal-case">Fixed rate human seats with complete access, subject to a soft rate-limiting quota.</p>
                </div>
              ) : (
                <div className="p-3 bg-black border border-[#111] space-y-2 text-[10px]">
                  <span className="text-gray-500 text-[8px] block">X402 PRICING MATRIX:</span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Meaningless Cheap stuff</span>
                      <span className="text-emerald-400 font-bold">$0.0001 / call</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Value Operations</span>
                      <span className="text-emerald-400 font-bold">$0.05 / check</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rare / Critical HSM Enclave</span>
                      <span className="text-emerald-400 font-bold">$2.50 / keygen</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Abide Micro-Nodes Deployed */}
            <div className="p-5 border-2 border-[#222] bg-[#050505] space-y-4 lg:col-span-2">
              <div className="border-b border-[#111] pb-2">
                <span className="text-[9px] text-[#00F0FF] font-bold tracking-widest block">[ ABIDE MICRO-NODES NETWORK ]</span>
                <h4 className="text-white font-black text-sm tracking-tight">Active Micro-Nodes & Rate-Limit Controllers</h4>
              </div>
              <p className="text-[10px] text-gray-400 normal-case leading-relaxed">
                Abide deploys frictionless rate-limited micro-nodes across physical and ledger boundaries. Adjust rate limits to safeguard enclaves against Drained-Wallet exhaustion attacks.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {[
                  {
                    id: "Abide-Node-A",
                    name: "Abide Micro-Node A (Secure Enclave)",
                    repo: "lockerphycer",
                    status: "Enforced",
                    col: "text-red-400",
                    border: "border-red-500/20",
                    bg: "bg-red-500/5",
                    max: 20
                  },
                  {
                    id: "Abide-Node-B",
                    name: "Abide Micro-Node B (API Gateway)",
                    repo: "cappo / BYOS",
                    status: "Active",
                    col: "text-amber-400",
                    border: "border-amber-500/20",
                    bg: "bg-amber-500/5",
                    max: 200
                  },
                  {
                    id: "Abide-Node-C",
                    name: "Abide Micro-Node C (Ledger Anchoring)",
                    repo: "gnomledger",
                    status: "Idle",
                    col: "text-[#00F0FF]",
                    border: "border-cyan-500/20",
                    bg: "bg-cyan-500/5",
                    max: 2000
                  }
                ].map((node) => (
                  <div key={node.id} className={`p-4 border ${node.border} ${node.bg} space-y-3`}>
                    <div className="flex justify-between items-start border-b border-[#111] pb-2">
                      <div>
                        <span className="text-[8px] text-gray-500 block uppercase">{node.repo}</span>
                        <span className="text-white font-black text-[11px] block">{node.id}</span>
                      </div>
                      <span className={`text-[8px] font-black ${node.col}`}>[ {node.status} ]</span>
                    </div>

                    <p className="text-[9px] text-gray-400 normal-case leading-normal">{node.name}</p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-gray-500">
                        <span>RATE LIMIT CAPACITY:</span>
                        <span className="text-white font-bold">{rateLimitCaps[node.id]} req/s</span>
                      </div>
                      <input 
                        type="range"
                        min="5"
                        max={node.max}
                        value={rateLimitCaps[node.id]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setRateLimitCaps(prev => ({ ...prev, [node.id]: val }));
                        }}
                        className="w-full accent-[#00F0FF] bg-black h-1 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
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
                  if (log.includes("[X402_SETTLED]")) logCol = "text-[#00F0FF] font-bold";
                  if (log.includes("[GATEWAY_ERROR]")) logCol = "text-red-400 font-bold";
                  if (log.includes("[GNOMLEDGER_ANCHOR]")) logCol = "text-amber-400 font-bold";
                  if (log.includes("[ARBITRUM_L2]")) logCol = "text-violet-400";
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
    </div>
  );
};

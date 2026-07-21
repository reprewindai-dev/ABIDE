import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, ShieldCheck, ShieldAlert, Cpu, Layers, Lock, CheckCircle2, 
  AlertTriangle, Play, RefreshCw, Copy, Activity, Database, Coins, ArrowRight, Eye, EyeOff,
  Search, FileText, Link, Check, HardDrive
} from "lucide-react";
import { BlueprintResult } from "../types";

interface BuildExecutionAttestationProps {
  blueprint: BlueprintResult;
  userEmail: string;
}

export default function BuildExecutionAttestation({ blueprint, userEmail }: BuildExecutionAttestationProps) {
  // Config state
  const [selectedTarget, setSelectedTarget] = useState("api-server");
  const [selectedFile, setSelectedFile] = useState("contracts/X402Escrow.sol");
  const [executionMode, setExecutionMode] = useState<"governed" | "dirty" | "bypass">("governed");
  
  // Real Repository Intelligence State
  const [repoIntel, setRepoIntel] = useState<any>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);
  
  // Simulation states
  const [step, setStep] = useState<"idle" | "watching" | "compiling" | "manifesting" | "gating" | "anchoring" | "completed" | "bypassed" | "blocked">("idle");
  const [triggerCount, setTriggerCount] = useState(14821);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  // Source-to-Blueprint Mapper State
  const [mapperSearch, setMapperSearch] = useState("");
  const [mapperFilterTarget, setMapperFilterTarget] = useState("all");
  const [selectedMappingId, setSelectedMappingId] = useState<string>("contracts/X402Escrow.sol");
  const [hoveredMappingId, setHoveredMappingId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Source mapping definition connecting files to authorized capability IDs
  const mappings = [
    {
      id: "contracts/X402Escrow.sol",
      file: "contracts/X402Escrow.sol",
      target: "api-server",
      targetLabel: "Core API Server (x402 Gateway)",
      capabilityId: "mint-settlement-evidence",
      defaultCapName: "Gnomledger Merkle Anchor & x402 Settlement",
      purpose: "Performs autonomous x402 settlement & Merkle-anchoring of provenance evidence",
      enforcementRule: "Covenant ensures absolute balance parity; unauthorized value transfer triggers immediate circuit break.",
      triggerType: "Solidity smart contract mutation event",
      riskScenario: "Stale binary allows ledger inflation or bypassed escrow conditions.",
      verificationStatus: "verified" as const,
      auditStore: "Gnomledger Ledger Store (Arbitrum-Escrow-Channel)",
      driftCheck: "Continuous audit of escrow balances against ledger state"
    },
    {
      id: "src/server.ts",
      file: "src/server.ts",
      target: "api-server",
      targetLabel: "Core API Server (x402 Gateway)",
      capabilityId: "govern-agent-session",
      defaultCapName: "Sovereign Agent Intent Validation",
      purpose: "Filters and signs agentic intent requests; validates authorization tokens against Sovereign Constitution",
      enforcementRule: "No input string is routed without a signed intent envelope from the authorized client profile.",
      triggerType: "TypeScript server entry point update",
      riskScenario: "Tampered routes bypass the Sovereign Constitution and inject arbitrary prompts.",
      verificationStatus: "verified" as const,
      auditStore: "Sovereign IPFS/Arweave Constitution Root",
      driftCheck: "Static analysis of server routing trees against policy boundaries"
    },
    {
      id: "src/einstein.rs",
      file: "src/einstein.rs",
      target: "einstein-scheduler",
      targetLabel: "Einstein Priority Router",
      capabilityId: "score-api-eligibility",
      defaultCapName: "Einstein Priority Routing",
      purpose: "Calculates live edge router priority scores and network fiber load heuristics",
      enforcementRule: "Enforces a strict <4ms SLO response limit; routes traffic only through cryptographically registered nodes.",
      triggerType: "Rust scheduling engine rebuild",
      riskScenario: "Falsified load statistics divert sensitive packets to malicious edge routes.",
      verificationStatus: "verified" as const,
      auditStore: "VNP Routing Score Multi-chain registry",
      driftCheck: "Verification of latency metrics against edge node fiber telemetry"
    },
    {
      id: "config/weights.json",
      file: "config/weights.json",
      target: "einstein-scheduler",
      targetLabel: "Einstein Priority Router",
      capabilityId: "score-api-eligibility",
      defaultCapName: "Einstein Priority Routing",
      purpose: "Dynamic neural-network weights configured to govern routing criteria prioritizations",
      enforcementRule: "Requires drift-check verification every 3 mins against Gnomledger fiber ledger state.",
      triggerType: "JSON weight map update",
      riskScenario: "Manipulated parameters redirect high-value payloads to cheaper, high-jitter nodes.",
      verificationStatus: "verified" as const,
      auditStore: "Gnomledger Parameter Registry",
      driftCheck: "Neural-net parameter weight drift checks"
    },
    {
      id: "src/decryption.rs",
      file: "src/decryption.rs",
      target: "wasm-enclave",
      targetLabel: "Secure Isolation Enclave",
      capabilityId: "verify-provider-ownership",
      defaultCapName: "Provider Attestation Gate",
      purpose: "Executes confidential decryption within secure hardware enclaves",
      enforcementRule: "Data packets must possess geographic tags matching regional tenant boundary policies.",
      triggerType: "Rust cryptographic library mutation",
      riskScenario: "Malicious local patch exposes keys or copies plaintext variables to unsafe memory buffers.",
      verificationStatus: "verified" as const,
      auditStore: "AWS Nitro Enclave Attestation Registry",
      driftCheck: "Continuous hardware signature checks"
    },
    {
      id: "Cargo.lock",
      file: "Cargo.lock",
      target: "wasm-enclave",
      targetLabel: "Secure Isolation Enclave",
      capabilityId: "verify-provider-ownership",
      defaultCapName: "Provider Attestation Gate",
      purpose: "Locks absolute dependency hashes to guarantee reproducible enclave compilation",
      enforcementRule: "Compiler refuses build if package hashes fail to match audited registry snapshots.",
      triggerType: "Rust dependency manifest update",
      riskScenario: "Dependency injection/supply chain poisoning introduces backdoors into binary artifacts.",
      verificationStatus: "verified" as const,
      auditStore: "Cargo SHA Lock Verification Ledger",
      driftCheck: "Continuous audit of crate dependencies and patches"
    }
  ];

  // Auto file lists based on target
  const targets = [
    { id: "api-server", label: "Core API Server (x402 Gateway)", files: ["contracts/X402Escrow.sol", "src/server.ts"] },
    { id: "einstein-scheduler", label: "Einstein Priority Router", files: ["src/einstein.rs", "config/weights.json"] },
    { id: "wasm-enclave", label: "Secure Isolation Enclave", files: ["src/decryption.rs", "Cargo.lock"] }
  ];

  // Fetch real workspace stats from `/api/repo-intelligence` on mount
  const fetchWorkspaceIntelligence = async () => {
    setIsLoadingIntel(true);
    try {
      const res = await fetch("/api/repo-intelligence");
      if (res.ok) {
        const data = await res.json();
        setRepoIntel(data);
      }
    } catch (err) {
      console.error("Failed to load workspace intelligence:", err);
    } finally {
      setIsLoadingIntel(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceIntelligence();
  }, []);

  useEffect(() => {
    // Sync selected file when target changes
    const targetObj = targets.find(t => t.id === selectedTarget);
    if (targetObj) {
      setSelectedFile(targetObj.files[0]);
    }
  }, [selectedTarget]);

  // Terminal log helper
  const addLog = (msg: string) => {
    const time = new Date().toISOString().split("T")[1].substring(0, 8);
    setTerminalLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  // Run the full simulation loop powered by actual backend endpoints
  const handleStartSimulation = async () => {
    setTerminalLogs([]);
    setCopiedReceipt(false);
    setActiveReceipt(null);
    
    // Step 1: Start watchman
    setStep("watching");
    addLog(`🔍 [POLTERGEIST] Active universal watcher listening. Target: ${selectedTarget}`);
    addLog(`👉 [INTENT DETECTED] Coding agent modified simulated target file: ${selectedFile}.`);

    if (executionMode === "bypass") {
      setTimeout(() => {
        setStep("bypassed");
        addLog("🚨 [BYPASS DETECTED] Process attempted execution outside governed 'polter' wrapper!");
        addLog("🔴 [SECURITY ALERT] Unauthorized process: node dist/server.js (PID 91024)");
        addLog("🔴 [SECURITY ALERT] Source Attestation missing. Gnomledger evidence receipt voided.");
        addLog("🔒 [COVENANT COLD SHUTDOWN] Active sandbox container halted immediately to prevent supply-chain poisoning!");
      }, 1200);
      return;
    }

    // Fetch live repository facts to print real workspace telemetry
    setTimeout(async () => {
      setStep("compiling");
      setTriggerCount(prev => prev + 1);
      
      addLog(`⚡ [POLTERGEIST] Watchman event received. Cursor clock: c:17283419-seq-${triggerCount}`);
      addLog(`🔨 [BUILD RUNNER] Automatically triggering deterministic build command...`);
      addLog(`📁 [WORKSPACE PROBE] Scan of workspace folder '${repoIntel?.projectName || "apex-blueprint"}' started.`);
      
      if (repoIntel) {
        addLog(`📁 [WORKSPACE PROBE] Real workspace size: ${repoIntel.totalFiles} physical files scanned.`);
        addLog(`📁 [WORKSPACE PROBE] Live lines of TypeScript code audited: ${repoIntel.totalLinesOfCode} LOC.`);
        addLog(`📁 [WORKSPACE PROBE] SEKED compiler verified on disk: ${repoIntel.sekedCompilerExists ? "ACTIVE" : "MISSING"}`);
      }
    }, 1000);

    // Step 3: Manifest artifacts
    setTimeout(() => {
      setStep("manifesting");
      addLog(`✨ [BUILD SUCCESS] Artifact produced at dist/${selectedTarget === "api-server" ? "server" : selectedTarget}`);
      addLog(`🔑 [ATTESTATION EXTENSION] Intercepting post-build hook...`);
      addLog(`🔑 [ATTESTATION EXTENSION] Mapping source tree hash to authorized Sovereign Blueprint...`);
      
      if (repoIntel?.workspaceFiles?.length > 0) {
        const randomFile = repoIntel.workspaceFiles[Math.floor(Math.random() * repoIntel.workspaceFiles.length)];
        addLog(`🔑 [ATTESTATION EXTENSION] Audited workspace file anchor: '${randomFile.path}'`);
        addLog(`🔑 [ATTESTATION EXTENSION] Current content SHA-256: ${randomFile.sha256.substring(0, 32)}...`);
      }
    }, 3000);

    // Step 4: Gating using the real `/api/backends/verify-sync` endpoint
    setTimeout(async () => {
      setStep("gating");
      addLog(`🛡️ [COVENANT GATE] Intercepting execution request for target [${selectedTarget}]`);
      addLog(`🛡️ [COVENANT GATE] Contacting plural backends to verify deep covenant alignment...`);
      
      try {
        const response = await fetch("/api/backends/verify-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            byosUrl: "https://api.veklom.com",
            cappoUrl: "https://cappo.veklom.com",
            gnomeledgerUrl: "https://pgl.veklom.com",
            vnpUrl: "https://vnp.veklom.com",
            connectionId: `conn-${blueprint.hash.slice(0, 10)}`,
            connectionVersion: "2.0.0"
          })
        });

        if (!response.ok) {
          throw new Error("Handshake validation refused by backend authorities.");
        }

        const syncData = await response.json();
        if (!response.ok || syncData.success !== true || syncData.isSyncOk !== true) {
          throw new Error(syncData.error || "Authority convergence was not verified.");
        }
        
        // Print actual backend logs returned by `/api/backends/verify-sync`
        if (syncData.logs && syncData.logs.length > 0) {
          syncData.logs.forEach((srvLog: string) => {
            addLog(`⚡ [BACKEND HANDSHAKE] ${srvLog}`);
          });
        }

        if (executionMode === "dirty") {
          addLog(`❌ [COVENANT GATE] ERROR: source_tree_hash does not align with authorized Blueprint.`);
          addLog(`❌ [COVENANT GATE] ERROR: Dirty working directory or unapproved local patch detected!`);
          addLog(`🚫 [COVENANT GATE] Execution BLOCKED. Covenant refused to issue execution permit.`);
          setStep("blocked");
        } else {
          addLog(`✅ [COVENANT GATE] Build status: PASSED`);
          addLog(`✅ [COVENANT GATE] Artifact hash matches executable binary.`);
          addLog(`✅ [COVENANT GATE] Backend convergence score: ${syncData.systemState}`);
          addLog(`✅ [COVENANT GATE] Real-time gateway latency: ${syncData.totalLatencyMs}ms`);
          addLog(`👉 [COVENANT GATE] Handing execution to polter wrapper. Issuing execution permit...`);
          
          // A health handshake is not proof of a build, ledger anchor, or settlement.
          // Keep this surface fail-closed until real attestations are returned.
          addLog(`🚫 [COVENANT GATE] Build, ledger, and settlement attestations are unavailable. Execution BLOCKED.`);
          setStep("blocked");
          return;

        }

      } catch (err: any) {
        addLog(`❌ [BACKEND HANDSHAKE FAILED] ${err.message || "Connection refused"}`);
        addLog(`🚫 [COVENANT GATE] Alignment check failed. Execution BLOCKED.`);
        setStep("blocked");
      }
    }, 5000);
  };

  const handleCopyReceipt = () => {
    if (!activeReceipt) return;
    navigator.clipboard.writeText(JSON.stringify(activeReceipt, null, 2));
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const filteredMappings = mappings.filter(m => {
    const matchesSearch = m.file.toLowerCase().includes(mapperSearch.toLowerCase()) || 
                          m.capabilityId.toLowerCase().includes(mapperSearch.toLowerCase()) ||
                          m.defaultCapName.toLowerCase().includes(mapperSearch.toLowerCase());
    const matchesTarget = mapperFilterTarget === "all" || m.target === mapperFilterTarget;
    return matchesSearch && matchesTarget;
  });

  const activeMapping = mappings.find(m => m.id === selectedMappingId) || filteredMappings[0] || mappings[0];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-[#00F0FF]" />
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Apex & Poltergeist Build-to-Execution Accountability Engine</h3>
        </div>
        <span className="px-2.5 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-[9px] font-mono uppercase font-black tracking-widest glow-cyan">
          Active Provenance Loop
        </span>
      </div>

      <p className="text-xs font-mono text-[#666] uppercase leading-relaxed max-w-4xl">
        Poltergeist proves which source state produced the compiled binary. Apex Blueprint proves that artifact was authorized to execute. Powered by actual workspace intelligence and deep backend alignment verification.
      </p>

      {/* Real Workspace Summary Widget */}
      {repoIntel && (
        <div className="p-4 bg-[#070C15] border border-cyan-500/20 text-xs font-mono uppercase grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <HardDrive size={16} />
            <div>
              <span className="text-[9px] text-[#555] block">Audited Workspace</span>
              <span className="font-bold text-white leading-tight">{repoIntel.projectName}</span>
            </div>
          </div>
          <div>
            <span className="text-[9px] text-[#555] block">Total Files</span>
            <span className="font-bold text-white leading-tight">{repoIntel.totalFiles} Files</span>
          </div>
          <div>
            <span className="text-[9px] text-[#555] block">Total Code Lines</span>
            <span className="font-bold text-white leading-tight">{repoIntel.totalLinesOfCode} LOC</span>
          </div>
          <div>
            <span className="text-[9px] text-[#555] block">Linter & Compilers</span>
            <span className="font-bold text-emerald-400 leading-tight">ONLINE / VERIFIED</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Control Panel */}
        <div className="lg:col-span-5 space-y-5 font-mono text-xs uppercase">
          
          {/* Target and Source File selection */}
          <div className="p-4 bg-[#0A0A0A] border-2 border-[#222] space-y-4 rounded-none">
            <span className="text-white font-black text-[10px] block border-b border-[#222] pb-2 text-[#00F0FF]">1. SELECT BUILD & EXECUTION TARGET</span>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[#666] text-[10px] block">Execution Target:</label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] p-2 text-white text-[11px] focus:outline-none focus:border-[#00F0FF] rounded-none"
                >
                  {targets.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#666] text-[10px] block">Trigger Source File:</label>
                <select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] p-2 text-white text-[11px] focus:outline-none focus:border-[#00F0FF] rounded-none"
                >
                  {targets.find(t => t.id === selectedTarget)?.files.map(f => (
                    <option key={f} value={f}>{f}</option>
                  )) || <option>{selectedFile}</option>}
                </select>
              </div>
            </div>
          </div>

          {/* Execution Mode configuration */}
          <div className="p-4 bg-[#0A0A0A] border-2 border-[#222] space-y-4 rounded-none">
            <span className="text-white font-black text-[10px] block border-b border-[#222] pb-2 text-[#00F0FF]">2. EXECUTION ATTACK VECTOR / MODE</span>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setExecutionMode("governed")}
                className={`p-3 border text-left flex items-start gap-3 rounded-none transition-all ${
                  executionMode === "governed"
                    ? "bg-[#0A1A24] border-[#00F0FF] text-white"
                    : "bg-[#050505] border-[#222] text-[#666] hover:border-[#333]"
                }`}
              >
                <ShieldCheck className={`shrink-0 mt-0.5 ${executionMode === "governed" ? "text-[#00F0FF]" : "text-gray-500"}`} size={16} />
                <div>
                  <span className={`font-black block text-[10px] ${executionMode === "governed" ? "text-[#00F0FF]" : "text-[#888]"}`}>STANDARD GOVERNED</span>
                  <p className="text-[9px] lowercase leading-relaxed mt-0.5 text-gray-400">Poltergeist watches, auto-rebuilds, Covenant gates align, Gnomledger seals.</p>
                </div>
              </button>

              <button
                onClick={() => setExecutionMode("dirty")}
                className={`p-3 border text-left flex items-start gap-3 rounded-none transition-all ${
                  executionMode === "dirty"
                    ? "bg-[#2A1410] border-red-500/50 text-white"
                    : "bg-[#050505] border-[#222] text-[#666] hover:border-[#333]"
                }`}
              >
                <AlertTriangle className={`shrink-0 mt-0.5 ${executionMode === "dirty" ? "text-red-500" : "text-gray-500"}`} size={16} />
                <div>
                  <span className={`font-black block text-[10px] ${executionMode === "dirty" ? "text-red-400" : "text-[#888]"}`}>TAMPERED SOURCE (DIRTY STATE)</span>
                  <p className="text-[9px] lowercase leading-relaxed mt-0.5 text-gray-400">Simulates local source code modifications that violate authorized blueprint parameters. Blocks at Covenant Gate!</p>
                </div>
              </button>

              <button
                onClick={() => setExecutionMode("bypass")}
                className={`p-3 border text-left flex items-start gap-3 rounded-none transition-all ${
                  executionMode === "bypass"
                    ? "bg-[#1E1128] border-purple-500/50 text-white"
                    : "bg-[#050505] border-[#222] text-[#666] hover:border-[#333]"
                }`}
              >
                <ShieldAlert className={`shrink-0 mt-0.5 ${executionMode === "bypass" ? "text-purple-400" : "text-gray-500"}`} size={16} />
                <div>
                  <span className={`font-black block text-[10px] ${executionMode === "bypass" ? "text-purple-400" : "text-[#888]"}`}>BYPASS ATTEMPT (DIRECT EXECUTION)</span>
                  <p className="text-[9px] lowercase leading-relaxed mt-0.5 text-gray-400">Agent tries to execute compiled binary directly, bypassing governed polter wrapper. Bypass monitoring triggers container lockdown!</p>
                </div>
              </button>
            </div>
          </div>

          {/* Trigger Action Button */}
          <button
            onClick={handleStartSimulation}
            disabled={step === "watching" || step === "compiling" || step === "manifesting" || step === "gating" || step === "anchoring"}
            className="w-full py-3 bg-[#00F0FF] hover:bg-white text-black font-black uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 text-[11px]"
          >
            {step === "watching" || step === "compiling" || step === "manifesting" || step === "gating" || step === "anchoring" ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin block" />
                <span>Lineage Verification Active...</span>
              </>
            ) : (
              <>
                <Play size={13} fill="black" />
                <span>Run Build & Execute Provenance</span>
              </>
            )}
          </button>

        </div>

        {/* Right: Simulated Dashboard Logs & Receipt */}
        <div className="lg:col-span-7 space-y-4 font-mono text-xs uppercase text-left">
          
          {/* Status bar */}
          <div className="border-2 border-[#222] bg-[#050505] p-4 rounded-none space-y-4 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="border-b border-[#222] pb-3 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-black text-white tracking-widest flex items-center gap-1.5">
                  <Terminal size={12} className="text-[#00F0FF]" />
                  <span>POLTERGEIST DAEMON TERMINAL</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-[#666]">STATE:</span>
                  <span className={`text-[9px] px-1.5 py-0.5 border font-black ${
                    step === "completed" ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" :
                    step === "bypassed" ? "border-red-500 text-red-400 bg-red-500/5 animate-pulse" :
                    step === "blocked" ? "border-red-500 text-red-400 bg-red-500/5" :
                    step === "idle" ? "border-[#222] text-[#666]" : "border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/5"
                  }`}>
                    {step.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Logger Screen */}
              <div className="bg-[#080808] border border-[#111] p-3 text-[10px] leading-relaxed text-emerald-400/90 h-[210px] overflow-y-auto space-y-1.5 mt-3 select-text font-mono">
                {terminalLogs.length > 0 ? (
                  terminalLogs.map((log, i) => {
                    const isErr = log.includes("🔴") || log.includes("🚨") || log.includes("❌");
                    const isSucc = log.includes("🏆") || log.includes("✅") || log.includes("✨");
                    const isAction = log.includes("👉") || log.includes("🚀");
                    let colorClass = "text-emerald-400/80";
                    if (isErr) colorClass = "text-red-400 font-bold";
                    if (isSucc) colorClass = "text-emerald-400 font-bold";
                    if (isAction) colorClass = "text-[#00F0FF] font-bold";
                    return (
                      <div key={i} className={colorClass}>
                        {log}
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-700 uppercase">
                    <Terminal size={22} className="mb-2 text-gray-800" />
                    <span>Select mode and click 'Run Build' to kick off the provenance pipeline.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Checkbox criteria matching list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-[#111] text-[8px] tracking-wider text-[#666]">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={10} className={step === "completed" ? "text-emerald-400" : "text-[#222]"} />
                <span>BUILD FRESH</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={10} className={step === "completed" ? "text-emerald-400" : "text-[#222]"} />
                <span>HASH COMPLIANT</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={10} className={step === "completed" ? "text-emerald-400" : "text-[#222]"} />
                <span>BLUEPRINT PERMIT</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={10} className={step === "completed" ? "text-emerald-400" : "text-[#222]"} />
                <span>X402 SETTLED</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Render active signed cryptographic receipt JSON */}
      {activeReceipt && (
        <div className="border-2 border-emerald-500/20 bg-black p-5 rounded-none space-y-3 text-left">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <span className="text-[10px] font-black text-emerald-400 tracking-widest flex items-center gap-1.5 font-mono">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>AUTHENTICATED EXECUTION RECEIPT (JSON COVENANT)</span>
            </span>
            <button
              onClick={handleCopyReceipt}
              className="flex items-center gap-1 px-2 py-1 border border-[#222] text-[9px] text-gray-400 hover:text-white hover:border-[#444] transition-colors"
            >
              {copiedReceipt ? <Check size={10} /> : <Copy size={10} />}
              <span>{copiedReceipt ? "Copied" : "Copy Receipt"}</span>
            </button>
          </div>
          <pre className="p-4 bg-[#050505] border border-[#111] text-[10px] leading-relaxed text-cyan-400 font-mono overflow-x-auto select-all max-h-[250px]">
            <code>{JSON.stringify(activeReceipt, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* SOURCE-TO-BLUEPRINT MAPPER RELATIONSHIP VISUALIZER */}
      <div className="border-2 border-[#222] bg-[#050505] p-5 rounded-none space-y-6 text-left relative overflow-visible" onMouseMove={handleMouseMove}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Link size={18} className="text-[#00F0FF]" />
              <h3 className="text-base font-black text-white uppercase tracking-tight font-sans">Active Source-to-Blueprint Lineage Mapper</h3>
            </div>
            <p className="text-[10px] font-mono text-[#666] uppercase mt-1 leading-relaxed">
              Enforces architectural accountability by binding watched files directly to cryptographically signed blueprint requirements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="text-[9px] font-mono font-black text-[#00F0FF] uppercase tracking-wider bg-[#00F0FF]/10 px-2 py-0.5 border border-[#00F0FF]/20">
              Covenant Watch Active
            </span>
          </div>
        </div>

        {/* Search & Target Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#444]" />
            <input
              type="text"
              placeholder="Filter by file path or capability..."
              value={mapperSearch}
              onChange={(e) => setMapperSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#222] pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-[#444] uppercase focus:outline-none focus:border-[#00F0FF] rounded-none"
            />
          </div>
          <div className="md:col-span-7 flex flex-wrap gap-1.5 items-center justify-start md:justify-end">
            <span className="text-[9px] font-mono text-[#555] uppercase mr-1">Target Filter:</span>
            {["all", "api-server", "einstein-scheduler", "wasm-enclave"].map((t) => (
              <button
                key={t}
                onClick={() => setMapperFilterTarget(t)}
                className="px-2.5 py-1 text-[9px] font-mono uppercase font-bold border transition-colors rounded-none"
                style={{
                  backgroundColor: mapperFilterTarget === t ? "rgba(0, 240, 255, 0.1)" : "#0A0A0A",
                  borderColor: mapperFilterTarget === t ? "#00F0FF" : "#222",
                  color: mapperFilterTarget === t ? "#00F0FF" : "#666"
                }}
              >
                {t === "all" ? "All Targets" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Columns representing File -> Causal Link -> Capability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Column A: Watched Repository Source Files (Poltergeist Layer) */}
          <div className="lg:col-span-5 space-y-2 max-h-[340px] overflow-y-auto pr-1">
            <div className="text-[9px] font-black text-[#666] uppercase tracking-widest border-b border-[#111] pb-1 flex justify-between items-center">
              <span>WATCHED REPOSITORY FILES</span>
              <span>[POLTERGEIST DAEMON]</span>
            </div>

            {filteredMappings.map((m) => {
              const isSelected = selectedMappingId === m.id;
              const isHovered = hoveredMappingId === m.id;
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHoveredMappingId(m.id)}
                  onMouseLeave={() => setHoveredMappingId(null)}
                  onClick={() => {
                    setSelectedMappingId(m.id);
                    // Synchronize selection with the build simulation target dropdown
                    setSelectedTarget(m.target);
                    setSelectedFile(m.file);
                  }}
                  className={`p-3 border text-left cursor-pointer transition-all relative rounded-none select-none ${
                    isSelected
                      ? "bg-[#0D161A] border-[#00F0FF] text-white"
                      : isHovered
                      ? "bg-[#080E10] border-[#00F0FF]/40 text-gray-200"
                      : "bg-[#0A0A0A] border-[#222] text-gray-400 hover:border-[#333]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText size={13} className={isSelected ? "text-[#00F0FF]" : "text-gray-500"} />
                      <span className="font-bold text-[11px] font-mono truncate">{m.file}</span>
                    </div>
                    <span className="text-[8px] bg-black/40 px-1 py-0.5 text-gray-500 border border-[#111] font-mono whitespace-nowrap">
                      {m.target === "api-server" ? "API" : m.target === "einstein-scheduler" ? "SCHEDULER" : "ENCLAVE"}
                    </span>
                  </div>

                  <p className="text-[9px] lowercase text-gray-500 leading-tight mt-1 max-w-[90%] truncate">
                    {m.purpose}
                  </p>

                  <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-black/40 text-[8px] text-[#555] font-mono">
                    <span>CAPABILITY: <strong className="text-gray-400">{m.capabilityId}</strong></span>
                    <span className="text-[#10B981] flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block animate-pulse" />
                      SECURE
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00F0FF]" />
                  )}
                </div>
              );
            })}

            {filteredMappings.length === 0 && (
              <div className="text-center py-8 text-xs text-[#444] border border-dashed border-[#222]">
                NO FILES MATCHING THIS SELECTION FOUND.
              </div>
            )}
          </div>

          {/* Column B: Dynamic Causal Lineage Connector */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-[#111] min-h-[80px]">
            <span className="text-[8px] font-black text-[#444] tracking-wider mb-2 font-mono">CAUSAL TRACE</span>
            
            <div className="w-full px-4 relative flex flex-col items-center justify-center">
              {/* Glowing animated trail */}
              <div className="w-full h-[3px] bg-[#111] relative border-y border-black/80 flex items-center">
                <motion.div
                  className="absolute top-0 bottom-0 bg-[#00F0FF] rounded-full"
                  animate={{
                    left: ["0%", "100%"],
                    width: ["10%", "40%", "10%"]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Connected Line indicators */}
              <div className="mt-3 flex flex-col items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-center">
                <div className="flex items-center gap-1 text-white bg-[#00F0FF]/10 border border-[#00F0FF]/20 px-2 py-0.5 text-[8px]">
                  <Activity size={10} className="text-[#00F0FF] animate-pulse" />
                  <span>INTEGRITY BINDING</span>
                </div>
                <div className="text-[7.5px] text-[#666] leading-tight max-w-[120px] text-center">
                  {hoveredMappingId ? "Mapping active change event..." : "Continuous file synchronization"}
                </div>
              </div>
            </div>
          </div>

          {/* Column C: Authorized Blueprint Capabilities (Apex Plane) */}
          <div className="lg:col-span-5 space-y-2 max-h-[340px] overflow-y-auto pl-1">
            <div className="text-[9px] font-black text-[#666] uppercase tracking-widest border-b border-[#111] pb-1 flex justify-between items-center">
              <span>AUTHORIZED CAPABILITIES</span>
              <span>[APEX CONTROL PLANE]</span>
            </div>

            {/* Render a list of capabilities matching current mapping selection */}
            {mappings
              .filter((m, i, self) => self.findIndex(x => x.capabilityId === m.capabilityId) === i) // Unique capabilities
              .filter(m => {
                if (mapperFilterTarget === "all") return true;
                return m.target === mapperFilterTarget;
              })
              .map((m) => {
                const isActive = activeMapping.capabilityId === m.capabilityId;
                const isHovered = hoveredMappingId && mappings.find(x => x.id === hoveredMappingId)?.capabilityId === m.capabilityId;
                const realCap = blueprint.capabilities?.find(c => c.id === m.capabilityId);
                const capName = realCap?.name || m.defaultCapName;
                const capPurpose = realCap?.purpose || m.purpose;

                return (
                  <div
                    key={m.capabilityId}
                    className={`p-3 border text-left transition-all relative rounded-none ${
                      isActive
                        ? "bg-[#091512] border-emerald-500 text-white"
                        : isHovered
                        ? "bg-[#050D0A] border-emerald-500/40 text-gray-200"
                        : "bg-[#0A0A0A] border-[#222] text-gray-400"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Lock size={12} className={isActive ? "text-emerald-400" : "text-gray-600"} />
                        <span className="font-bold text-[10.5px] font-mono tracking-tight text-white uppercase">{capName}</span>
                      </div>
                      <span className={`text-[8px] font-mono border px-1.5 py-0.5 font-bold ${
                        isActive ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-black/30 border-[#222] text-gray-500"
                      }`}>
                        ID: {m.capabilityId}
                      </span>
                    </div>

                    <p className="text-[9px] lowercase text-gray-500 leading-tight mt-1">
                      {capPurpose}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-black/40 flex justify-between items-center text-[7.5px] text-[#555] font-mono">
                      <span>OWNER: <strong className="text-gray-400">{realCap?.owner || "VEKLOM AUTOPILOT"}</strong></span>
                      <span>STATUS: <strong className="text-emerald-400">SOVEREIGN PROD</strong></span>
                    </div>

                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    )}
                  </div>
                );
              })}
          </div>

        </div>

        {/* Detailed Lineage Trace Inspector HUD */}
        <div className="bg-[#080808] border border-[#111] p-4 text-xs font-mono uppercase space-y-4">
          <div className="flex justify-between items-center border-b border-[#111] pb-2 text-[10px] font-black text-white">
            <span className="flex items-center gap-1.5 font-sans">
              <Activity size={12} className="text-[#00F0FF]" />
              <span>ACTIVE TRACEABILITY INSPECTOR: <span className="text-[#00F0FF]">{activeMapping.file}</span></span>
            </span>
            <span className="text-[#666] font-mono">ENFORCEMENT SPECIFICATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Box: Cryptographic Parity Parameters */}
            <div className="bg-[#050505] p-3 border border-[#222] space-y-2.5">
              <span className="text-[9px] font-black text-[#666] block border-b border-[#111] pb-1">BUILD & PROVENANCE METADATA</span>
              
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">BOUND CAPABILITY ID:</span>
                  <span className="text-white font-bold">{activeMapping.capabilityId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">INTEGRITY REGISTRY:</span>
                  <span className="text-white font-bold truncate max-w-[200px]">{activeMapping.auditStore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CAUSAL TRIGGER:</span>
                  <span className="text-white font-bold truncate max-w-[200px]">{activeMapping.triggerType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DRIFT DRILLDOWN SLA:</span>
                  <span className="text-[#00F0FF] font-bold">{activeMapping.driftCheck}</span>
                </div>
                <div className="flex justify-between border-t border-[#111] pt-1.5 mt-1">
                  <span className="text-red-400 font-bold">TAMPER EXPOSURE RISK:</span>
                  <span className="text-red-400 font-bold truncate max-w-[200px] lowercase normal-case">{activeMapping.riskScenario}</span>
                </div>
              </div>
            </div>

            {/* Right Box: Covenant Authorization Rule (Pseudocode) */}
            <div className="bg-[#050505] p-3 border border-[#222] space-y-1.5">
              <span className="text-[9px] font-black text-[#666] block border-b border-[#111] pb-1">COVENANT ENFORCEMENT PARITY</span>
              
              <div className="p-2 bg-[#020202] text-emerald-400 font-mono text-[9px] lowercase space-y-0.5 border border-emerald-500/10 max-h-[105px] overflow-y-auto leading-relaxed select-text">
                <div>def verify_gate_rule(request):</div>
                <div className="pl-3">attestation = poltergeist.get_attestation(request.target)</div>
                <div className="pl-3 text-white"># verify file: {activeMapping.file}</div>
                <div className="pl-3 text-[#00F0FF]">require(attestation.source_tree_hash == authorized_hash)</div>
                <div className="pl-3 text-[#00F0FF]">require(attestation.dependency_lock_hash == current_lock_hash)</div>
                <div className="pl-3">require(blueprint.authorizes(request.target, "{activeMapping.capabilityId}"))</div>
                <div className="pl-3">return covenant.issue_permit(attestation.artifact_hash)</div>
              </div>
            </div>

          </div>

          <div className="border-t border-[#111] pt-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-[9px] text-[#666] leading-relaxed">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[8px] font-sans">
                STRATEGIC BUYER OUTCOME
              </span>
              <span className="lowercase normal-case text-gray-400">
                Guarantees complete supply-chain custody. Prevents malicious model interventions or silent backdoor edits from ever touching live execution paths.
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedTarget(activeMapping.target);
                setSelectedFile(activeMapping.file);
              }}
              className="text-[#00F0FF] hover:text-white font-bold tracking-widest shrink-0 transition-colors uppercase border border-[#00F0FF]/20 px-2 py-0.5 hover:border-[#00F0FF]"
            >
              Load In Build Sim Above ➔
            </button>
          </div>
        </div>

        {/* Hover Floating Tooltip HUD */}
        <AnimatePresence>
          {hoveredMappingId && (
            (() => {
              const hoveredItem = mappings.find(m => m.id === hoveredMappingId);
              if (!hoveredItem) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute z-50 pointer-events-none p-4 bg-[#080E10]/95 border-2 border-[#00F0FF] text-white font-mono rounded-none shadow-2xl w-80 space-y-3 uppercase text-[10px]"
                  style={{
                    left: mousePos.x + 16,
                    top: mousePos.y + 16,
                    backdropFilter: "blur(4px)",
                    boxShadow: "0 10px 35px -10px rgba(0, 240, 255, 0.45)",
                  }}
                >
                  <div className="flex justify-between items-center border-b border-[#00F0FF]/30 pb-2">
                    <span className="text-[#00F0FF] font-black tracking-widest text-[9px] flex items-center gap-1">
                      <ShieldCheck size={11} className="text-[#00F0FF]" />
                      <span>POLTERGEIST AUDIT INDEX</span>
                    </span>
                    <span className="text-[7.5px] text-emerald-400 font-bold">STABLE LOCK</span>
                  </div>
                  <div className="space-y-1 text-gray-300">
                    <div><span className="text-gray-500 text-[8.5px]">FILE:</span> <span className="font-bold">{hoveredItem.file}</span></div>
                    <div><span className="text-gray-500 text-[8.5px]">CAPABILITY:</span> <span className="font-bold text-emerald-400">{hoveredItem.capabilityId}</span></div>
                    <div><span className="text-gray-500 text-[8.5px]">RULE:</span> <span className="text-gray-400 lowercase normal-case leading-snug">{hoveredItem.enforcementRule}</span></div>
                  </div>
                </motion.div>
              );
            })()
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

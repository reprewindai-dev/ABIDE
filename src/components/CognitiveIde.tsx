import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  Activity,
  FileCode,
  Terminal,
  Sliders,
  Play,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Lock,
  RefreshCw,
  Zap,
  Award,
  Send,
  Eye,
  LockKeyhole,
  Check,
  Network,
  Database,
  Coins,
  ChevronRight,
  Code
} from "lucide-react";
import { VirtualFile, BlueprintResult, Capability } from "../types";

interface CognitiveIdeProps {
  blueprint: BlueprintResult | null;
  constitutionState: "LOCKED" | "PENDING_REVISION";
  selectedJurisdiction: string;
  targetPlatform: string;
  einsteinJitter: number;
  setEinsteinJitter: (val: number) => void;
  vnpUrl: string;
  gnomeledgerUrl: string;
}

export default function CognitiveIde({
  blueprint,
  constitutionState,
  selectedJurisdiction,
  targetPlatform,
  einsteinJitter,
  setEinsteinJitter,
  vnpUrl,
  gnomeledgerUrl
}: CognitiveIdeProps) {
  // Navigation & Workspace states
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [customFiles, setCustomFiles] = useState<Record<string, string>>({});
  const [entropy, setEntropy] = useState<number>(einsteinJitter / 100 || 0.12);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "COGNITIVE_IDE: System booted successfully.",
    "POLTERGEIST: Standard file system watcher initialized.",
    "SEKED_MATH: Multi-dimensional matrix waiting for capability vectors."
  ]);
  const [terminalFilter, setTerminalFilter] = useState<"all" | "poltergeist" | "seked" | "covenant">("all");
  
  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Simulation States
  const [activeTab, setActiveTab] = useState<"editor" | "analytics" | "receipt">("editor");
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(0);
  const [copierSuccess, setCopierSuccess] = useState(false);
  const [recentCommits, setRecentCommits] = useState<any[]>([
    {
      txHash: "0x8f3c...1e0f",
      type: "COMPILATION_PASS",
      score: 8.9,
      timestamp: "Just now"
    }
  ]);

  // Sync state with parent's einsteinJitter
  useEffect(() => {
    setEntropy(einsteinJitter / 100);
  }, [einsteinJitter]);

  // Combined list of static blueprint files and user edits
  const combinedFilesList = useMemo(() => {
    const bFiles = blueprint?.files || [];
    const filesMap: Record<string, string> = {};
    
    bFiles.forEach(f => {
      filesMap[f.path] = f.content;
    });
    
    Object.keys(customFiles).forEach(p => {
      filesMap[p] = customFiles[p];
    });

    return Object.keys(filesMap).map(p => ({
      path: p,
      content: filesMap[p]
    }));
  }, [blueprint, customFiles]);

  // Default selection
  useEffect(() => {
    if (combinedFilesList.length > 0 && !selectedPath) {
      const readme = combinedFilesList.find(f => f.path.endsWith("README.md"));
      if (readme) {
        setSelectedPath(readme.path);
      } else {
        setSelectedPath(combinedFilesList[0].path);
      }
    }
  }, [combinedFilesList, selectedPath]);

  const activeFileContent = useMemo(() => {
    const f = combinedFilesList.find(x => x.path === selectedPath);
    return f ? f.content : "No file content loaded.";
  }, [combinedFilesList, selectedPath]);

  // Generate probabilistic candidates for the file editor
  // Shows how Einstein Probability shifts the code structure!
  const codeCandidates = useMemo(() => {
    if (!selectedPath) return [];

    const isCode = selectedPath.endsWith(".ts") || selectedPath.endsWith(".json") || selectedPath.endsWith(".js");
    
    if (!isCode) {
      return [
        {
          title: "Deterministic Spec (Lock-in)",
          desc: "Raw specification document detailing the sovereign standard.",
          content: activeFileContent,
          latency: "0ms (Static Asset)",
          compliance: "100%",
          reliability: "100%",
          cost: "$0.00"
        }
      ];
    }

    // Generate beautiful code variants based on different probability spaces!
    const baseCleanContent = activeFileContent;
    
    // Path A: Strictly Deterministic, high audit
    const deterministicCode = `// [COGNITIVE SPECIFICATION COLLAPSED STATE]
// Authoritative Domain Mapping: Sovereign Compliance
// Alignment Check: 100% Rigidly Certified
import { Gnomledger } from "@veklom/gnomledger";
import { verifyAttestation } from "./core/validation";

export async function executeCapability(payload: any) {
  console.log("[SEKED_MATH] Rigorous compliance audit check initiated...");
  
  // 1. Direct Attestation Verification (Zero Jitter tolerance)
  const isAttested = await verifyAttestation(payload.attestation);
  if (!isAttested) {
    throw new Error("COVENANT_VIOLATION: Attestation lineage is out-of-bounds");
  }

  // 2. Strict Data-Residency compliance locking
  const residencyProfile = "${selectedJurisdiction.toUpperCase()}";
  console.log(\`[DATA_Sovereignty] Pinning transaction strictly to \${residencyProfile} enclaves\`);

  // 3. Anchor transaction trace with full ledger verification
  const receipt = await Gnomledger.commit({
    blueprintHash: "${blueprint?.hash || "0x8f3c...a8b7"}",
    timestamp: new Date().toISOString(),
    payload: payload,
    governanceLocked: true
  });

  return {
    status: "SOVEREIGN_EXECUTION_COMPLIANT",
    evidenceId: receipt.id,
    latencyMs: 85,
    reputationIndex: 9.8
  };
}`;

    // Path B: Probabilistic Auto-Route (Hyper-optimized, self-healing)
    const probabilisticCode = `// [PROBABILISTIC QUANTUM AUTO-ROUTE]
// Einstein Priority Jitter Optimization: ACTIVE
// Bypasses classical SLA bottlenecks by routing via predicted latency nodes
import { predictJitterNode } from "./adapters/system";
import { Gnomledger } from "@veklom/gnomledger";

export async function executeCapability(payload: any) {
  // 1. Einstein priority queue calculations
  // Forecast packet drop clusters based on current latency (${einsteinJitter}ms)
  const predictedNode = predictJitterNode({
    jitter: ${einsteinJitter},
    allowedLoss: 0.8
  });

  // 2. Optimistic routing (M2M Escrow locks concurrently)
  console.log(\`[EINSTEIN_ROUTING] Optimistically routing to edge node: \${predictedNode}\`);

  // 3. Concurrent ledger evidence committing
  const quickReceipt = Gnomledger.optimisticCommit({
    nodeId: predictedNode,
    estimatedSla: "99.2%"
  });

  return {
    status: "PROBABILISTIC_OPTIMIZED_PASS",
    evidenceId: quickReceipt.id,
    latencyMs: 11, // Collapsed latency!
    reputationIndex: 8.4,
    unverifiedRisk: "0.08%"
  };
}`;

    // Path C: Balanced Adaptive (Cooperative Optimization)
    const balancedCode = `// [COOPERATIVE OPTIMIZATION BALANCED PATH]
// Real-time SLA balancing based on telemetry metrics
import { evaluateSekedMatrix } from "./compiler/seked";
import { Gnomledger } from "@veklom/gnomledger";

export async function executeCapability(payload: any) {
  // Dynamic threshold matching
  const matrixScore = evaluateSekedMatrix({
    E: 8.2, // Jitter estimation
    R: 9.1, // Reputation
    C: 9.5  // Compliance
  });

  if (matrixScore < 5.0) {
    // Graceful degradation down to rigid deterministic audits
    console.warn("[SEKED_MATH] Compliance warning: degrading path to deterministic bounds");
    return executeDeterministic(payload);
  }

  // Active micro-escrow locking via X402
  const lockId = await Gnomledger.lockEscrow({
    amountUSD: 0.05,
    channel: "CAPABILITY_ALIGN_v2"
  });

  return {
    status: "COOPERATIVE_OPTIMIZATION_SUCCESS",
    escrowLockId: lockId,
    latencyMs: 24,
    reputationIndex: 9.2
  };
}`;

    return [
      {
        title: "Deterministic Lock-in (Pure Compliant)",
        desc: "Zero-risk path. Generates full-scale cryptographic attestations, locking operations inside absolute compliance boundaries.",
        content: deterministicCode,
        latency: "85ms (Rigid)",
        compliance: "100% Verified",
        reliability: "99.99%",
        cost: "$0.05/call"
      },
      {
        title: "Einstein Probability Engine (Self-Healing)",
        desc: "Bypasses SLA queues by utilizing quantum wave forecasts. Drops latency from 85ms down to 11ms with microscopic unverified risk.",
        content: probabilisticCode,
        latency: "11ms (Hyper-Fast)",
        compliance: "92% Projected",
        reliability: "99.12%",
        cost: "$0.003/call"
      },
      {
        title: "Cooperative Balanced (Adaptive Node Routing)",
        desc: "Analyzes telemetry dynamically. Auto-degrades to deterministic locks if latency spikes or compliance scores fall.",
        content: balancedCode,
        latency: "24ms (Balanced)",
        compliance: "98% Hybrid",
        reliability: "99.85%",
        cost: "$0.015/call"
      }
    ];
  }, [selectedPath, activeFileContent, selectedJurisdiction, blueprint, einsteinJitter]);

  // Active compiled code showing the active candidate or edited content
  const activeCodeDisplay = useMemo(() => {
    if (codeCandidates.length === 0) return "";
    if (codeCandidates.length === 1) return codeCandidates[0].content;
    
    // Auto-select candidate based on entropy slider if editor tab is default
    const candIndex = entropy < 0.3 ? 0 : entropy < 0.7 ? 2 : 1;
    return codeCandidates[candIndex]?.content || codeCandidates[0].content;
  }, [codeCandidates, entropy]);

  // Active metrics based on active code path
  const activeMetrics = useMemo(() => {
    const candIndex = entropy < 0.3 ? 0 : entropy < 0.7 ? 2 : 1;
    return (
      codeCandidates[candIndex] || {
        latency: "0ms",
        compliance: "100%",
        reliability: "100%",
        cost: "$0.00"
      }
    );
  }, [codeCandidates, entropy]);

  // Terminal Line Logger helper
  const addTerminalLog = (msg: string, source: "poltergeist" | "seked" | "covenant" | "system" = "system") => {
    const prefix = source.toUpperCase();
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLines(prev => [`[${timestamp}] ${prefix}: ${msg}`, ...prev]);
  };

  // Compile wavefunction trigger (the innovative way to save/compile code!)
  const handleCollapseWavefunction = () => {
    setIsCompiling(true);
    setCompilationProgress(10);
    addTerminalLog("Wavefunction Collapse triggered. Freezing probabilistic superposition states...", "seked");
    
    const interval = setInterval(() => {
      setCompilationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompiling(false);
          addTerminalLog("Wavefunction collapsed into single deterministic executable.", "seked");
          addTerminalLog(`Provenance attestation created: sha256:${blueprint?.hash || "e3c4...8764"}`, "covenant");
          addTerminalLog("Covenant Gate status: VERIFIED & SECURED", "covenant");
          
          // Add a new mock commit to recent logs
          setRecentCommits(prevCommits => [
            {
              txHash: `0x${Math.random().toString(16).substring(2, 6)}d...${Math.random().toString(16).substring(2, 6)}`,
              type: "WAVE_COLLAPSE_PASS",
              score: (8.5 + Math.random() * 1.4).toFixed(1),
              timestamp: "Just now"
            },
            ...prevCommits
          ]);
          return 100;
        }
        
        // Log steps
        if (prev === 30) {
          addTerminalLog("Scanning active capability dependencies for Compliance Drift...", "poltergeist");
        } else if (prev === 60) {
          addTerminalLog("Seked Math Standard evaluated. E=9.1, R=9.4, C=9.8, D=10.0, S=8.9. Matrix Directive: SOVEREIGN_EXECUTION", "seked");
        } else if (prev === 85) {
          addTerminalLog("Binding Provenance Hash: H(blueprint + source + dependencies + toolchain) generated.", "covenant");
        }
        
        return prev + 15;
      });
    }, 400);
  };

  // Simulated AI response helper representing "Einstein Coding Assistant"
  const handleAiPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);
    addTerminalLog(`Query submitted to Einstein AI Core: "${aiPrompt}"`, "system");

    setTimeout(() => {
      let response = "";
      const lower = aiPrompt.toLowerCase();
      
      if (lower.includes("einstein") || lower.includes("probability") || lower.includes("jitter")) {
        response = `**Einstein Probabilistic Solution Core initialized.**\n\nTo optimize capability routing under **${einsteinJitter}ms Jitter**, we can apply a non-deterministic routing protocol. Instead of waiting for full attestation consensus synchronously, we can execute the following **optimistic escrow lock**:\n\n\`\`\`ts\n// Wave superposition optimization\nconst predictedPath = await predictJitterNode({\n  jitter: ${einsteinJitter},\n  tolerance: "high-throughput"\n});\n\`\`\`\n\nThis collapses the execution latency from 85ms down to **11ms**, while holding $0.05 collateral in the X402 escrow. Compliance metrics remain completely secure under EU AI Act bounds.`;
      } else if (lower.includes("jurisdiction") || lower.includes("canada") || lower.includes("eu") || lower.includes("sec")) {
        response = `**Jurisdiction Shield Policy Evaluation:**\n\nActive compliance is locked on **${selectedJurisdiction.toUpperCase()}**. In this profile:\n- Data is pinned directly to sovereign edge hosts.\n- Escrow collateral settling executes via the certified Gnomledger chain.\n- All compilations must produce a cryptographically sealed **attestation receipt** before execution is authorized.`;
      } else {
        response = `**Cognitive Optimization Suggestion:**\n\nBased on your request, we can inject a **Self-Healing Capability Adaptor** into the source manifest. This adaptor automatically tunes the **Einstein Jitter Entropy** in real-time. If the network Jitter climbs past 30ms, the router collapses the wavefunction down to the **Strict Deterministic Path** to prevent SLA penalties.\n\nWould you like me to patch this into the active workspace?`;
      }

      setAiResponse(response);
      setIsAiLoading(false);
      setAiPrompt("");
      addTerminalLog("Einstein AI successfully compiled custom code patch.", "system");
    }, 1200);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeDisplay);
    setCopierSuccess(true);
    setTimeout(() => setCopierSuccess(false), 2000);
  };

  const filteredTerminalLines = useMemo(() => {
    if (terminalFilter === "all") return terminalLines;
    return terminalLines.filter(line => line.includes(terminalFilter.toUpperCase()));
  }, [terminalLines, terminalFilter]);

  return (
    <div className="bg-[#050505] border-2 border-[#1A1A1A] p-1 grid grid-cols-1 xl:grid-cols-12 gap-4 rounded-none min-h-[700px] text-gray-300 font-sans">
      
      {/* 1. Left Sidebar: Capability File Navigator */}
      <div className="xl:col-span-3 bg-[#080808] border border-[#151515] p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-[#1A1A1A] mb-3">
            <AtomIcon className="text-[#00F0FF] animate-spin-slow" size={16} />
            <span className="text-[10px] font-mono font-black tracking-widest text-[#888] uppercase">
              Quantum Workspace
            </span>
          </div>

          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {combinedFilesList.map(file => {
              const isSelected = selectedPath === file.path;
              const isTypeScript = file.path.endsWith(".ts");
              return (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedPath(file.path);
                    addTerminalLog(`Loaded file: ${file.path}`, "poltergeist");
                  }}
                  className={`w-full text-left px-2.5 py-2 flex items-center justify-between text-[11px] font-mono tracking-tight transition-all rounded-none border ${
                    isSelected
                      ? "bg-[#0A1920] border-[#00F0FF]/30 text-[#00F0FF]"
                      : "bg-[#090909]/40 border-transparent text-gray-400 hover:bg-[#111] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileCode size={13} className={isTypeScript ? "text-[#00F0FF]" : "text-gray-500"} />
                    <span className="truncate">{file.path}</span>
                  </div>
                  {isTypeScript && (
                    <span className="text-[8px] px-1 py-0.2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 rounded-none uppercase font-black tracking-widest">
                      Wave
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Einstein Priority Jitter Routing Gauge */}
        <div className="mt-4 pt-3 border-t border-[#151515] space-y-3 bg-[#090909] p-3 border border-[#111]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Sliders size={13} className="text-[#9D4EDD]" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">Einstein Entropy</span>
            </div>
            <span className="text-[10px] font-mono font-black text-[#9D4EDD]">
              {(entropy * 100).toFixed(0)}% Jitter
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="100"
              value={(entropy * 100).toFixed(0)}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setEntropy(val / 100);
                setEinsteinJitter(val);
                addTerminalLog(`Einstein Jitter scaled to ${val}ms. Re-calculating probabilistic code overlay.`, "seked");
              }}
              className="w-full accent-[#9D4EDD] cursor-pointer bg-[#222] h-1"
            />
            <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase tracking-widest">
              <span>0.0 (Rigid-Det)</span>
              <span>1.0 (Quantum-Auto)</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono uppercase pt-1">
            <div className="bg-[#050505] p-1.5 border border-[#111]">
              <div className="text-gray-500 text-[8px]">SLA Latency</div>
              <div className={`font-bold mt-0.5 ${entropy > 0.3 ? "text-emerald-400" : "text-amber-400"}`}>
                {activeMetrics.latency}
              </div>
            </div>
            <div className="bg-[#050505] p-1.5 border border-[#111]">
              <div className="text-gray-500 text-[8px]">Compliance</div>
              <div className={`font-bold mt-0.5 ${entropy < 0.7 ? "text-emerald-400" : "text-amber-400"}`}>
                {activeMetrics.compliance}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Column: Interactive Wave Editor */}
      <div className="xl:col-span-6 bg-[#070707] border border-[#151515] p-3 flex flex-col justify-between">
        
        {/* Header Tabs & Controls */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isCompiling ? "bg-cyan-400 animate-ping" : "bg-emerald-500"}`} />
            <span className="text-[11px] font-mono font-black text-white uppercase tracking-wider">
              {selectedPath ? selectedPath.split("/").pop() : "Editor Workspace"}
            </span>
            <span className="text-[8px] px-1.5 py-0.5 bg-[#111] text-[#9D4EDD] border border-[#222] uppercase tracking-widest font-mono">
              {entropy < 0.3 ? "Locked Determinism" : entropy < 0.7 ? "Adaptive Hybrid" : "Superposition"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 border border-[#222] bg-[#0A0A0A] text-[9px] font-mono uppercase tracking-widest hover:border-white transition-all text-gray-400 hover:text-white"
            >
              {copierSuccess ? "Copied" : "Copy Code"}
            </button>
            <button
              onClick={handleCollapseWavefunction}
              disabled={isCompiling}
              className="px-3.5 py-1.5 bg-[#00F0FF] hover:bg-white text-black font-black uppercase tracking-widest text-[9px] font-mono flex items-center gap-1 transition-all disabled:opacity-50"
            >
              {isCompiling ? (
                <>
                  <RefreshCw size={11} className="animate-spin" />
                  <span>Collapsing...</span>
                </>
              ) : (
                <>
                  <Lock size={11} />
                  <span>Collapse Wave (Compile)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar for Wave Collapse */}
        {isCompiling && (
          <div className="mb-3 bg-[#111] border border-[#222] p-1.5">
            <div className="flex justify-between text-[8px] font-mono uppercase text-cyan-400 mb-1">
              <span>Seked Math Standard Evaluation...</span>
              <span>{compilationProgress}%</span>
            </div>
            <div className="w-full bg-[#151515] h-1.5 rounded-none overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 h-full"
                style={{ width: `${compilationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* The Holographic Editor Area */}
        <div className="flex-1 bg-[#040404] border border-[#121212] p-3 relative min-h-[380px] flex flex-col justify-between">
          <div className="absolute right-3 top-3 pointer-events-none opacity-5 flex flex-col items-end">
            <AtomIcon size={120} className="text-[#00F0FF]" />
            <div className="text-[12px] font-mono mt-2 font-black">EINSTEIN_ENGINE</div>
          </div>

          <div className="font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre select-text h-[350px] scrollbar-thin scrollbar-thumb-[#222] text-cyan-400/90">
            {activeCodeDisplay.split("\n").map((line, idx) => (
              <div key={idx} className="flex hover:bg-[#0A0A0A]/50 px-2 py-0.5 rounded-none group">
                <span className="w-8 select-none text-gray-700 text-right pr-3 border-r border-[#151515] mr-3 text-[9px]">
                  {idx + 1}
                </span>
                <span className={line.startsWith("//") ? "text-gray-500" : line.includes("export") || line.includes("import") ? "text-violet-400" : "text-cyan-400"}>
                  {line}
                </span>
              </div>
            ))}
          </div>

          {/* SLA Warning / Compliance Seal HUD */}
          <div className="border-t border-[#121212] pt-2.5 mt-2 flex flex-wrap gap-2 items-center justify-between text-[9px] font-mono uppercase tracking-wider">
            <div className="flex items-center gap-1 text-[#888]">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Sovereign Security:</span>
              <span className="text-emerald-400 font-bold">Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Node:</span>
              <span className="text-[#00F0FF] truncate max-w-[120px]">{vnpUrl}</span>
            </div>
          </div>
        </div>

        {/* 3. Terminal & Console logs */}
        <div className="mt-4 bg-[#080808] border border-[#151515] p-3 flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#888] uppercase tracking-wider">
              <Terminal size={11} className="text-[#00F0FF]" />
              <span>Attestation Logs &amp; Trace Spine</span>
            </div>
            <div className="flex gap-1.5 text-[8px] font-mono uppercase">
              {(["all", "poltergeist", "seked", "covenant"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTerminalFilter(f)}
                  className={`px-1.5 py-0.5 border ${
                    terminalFilter === f
                      ? "bg-[#111] border-[#00F0FF]/30 text-[#00F0FF]"
                      : "border-transparent text-gray-500 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[9px] text-[#888] space-y-1.5 max-h-[100px] scrollbar-thin">
            <AnimatePresence initial={false}>
              {filteredTerminalLines.map((line, idx) => {
                let colorClass = "text-gray-400";
                if (line.includes("POLTERGEIST")) colorClass = "text-amber-500/80";
                if (line.includes("SEKED")) colorClass = "text-[#9D4EDD]";
                if (line.includes("COVENANT")) colorClass = "text-emerald-400";
                if (line.includes("VIOLATION") || line.includes("warning")) colorClass = "text-red-400";

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx}
                    className={`leading-relaxed border-l-2 pl-2 ${colorClass} border-current/10`}
                  >
                    {line}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* 3. Right Column: Einstein AI Agent & Covenant Gate Attestation */}
      <div className="xl:col-span-3 bg-[#080808] border border-[#151515] p-3 flex flex-col justify-between">
        
        {/* Interactive Assistant (Einstein Perspective) */}
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-[#1A1A1A] mb-3">
            <Sparkles className="text-[#9D4EDD]" size={15} />
            <span className="text-[10px] font-mono font-black tracking-widest text-[#888] uppercase">
              Einstein AI Coder
            </span>
          </div>

          <div className="bg-[#040404] border border-[#121212] p-2.5 rounded-none min-h-[160px] max-h-[220px] overflow-y-auto text-[10px] font-mono leading-relaxed text-gray-400 mb-3 scrollbar-thin">
            {isAiLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-10 space-y-2">
                <AtomIcon className="animate-spin text-[#9D4EDD]" size={20} />
                <span>Computing quantum state variables...</span>
              </div>
            ) : aiResponse ? (
              <div className="space-y-2 select-text">
                <div className="text-[#9D4EDD] font-black uppercase text-[8px] tracking-widest">
                  AI Solution Collapse:
                </div>
                <div className="prose prose-invert prose-xs text-gray-300">
                  {aiResponse.split("\n").map((para, i) => (
                    <p key={i} className="mb-1.5">{para}</p>
                  ))}
                </div>
                <button
                  onClick={() => {
                    // Patch the code template into local state
                    setCustomFiles(prev => ({
                      ...prev,
                      "src/execute_optimized.ts": codeCandidates[1]?.content || ""
                    }));
                    setSelectedPath("src/execute_optimized.ts");
                    setAiResponse(null);
                    addTerminalLog("Patched custom execute_optimized.ts with probabilistic quantum routing. Saved to workspace.", "system");
                  }}
                  className="w-full py-1.5 border border-[#9D4EDD]/30 bg-[#9D4EDD]/10 hover:bg-[#9D4EDD]/20 text-[#9D4EDD] hover:text-white uppercase text-[8px] font-black tracking-widest transition-all mt-2"
                >
                  Apply Probabilistic Patch
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-600 uppercase text-[9px] tracking-wider space-y-2">
                <Sliders size={20} className="mx-auto text-gray-800" />
                <p>Prompt the Einstein AI to patch, optimize, or secure your active capability code.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleAiPromptSubmit} className="flex gap-1">
            <input
              type="text"
              placeholder="e.g., Optimize latency for Jitter..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-[#040404] border border-[#1A1A1A] text-[10px] text-white font-mono focus:outline-none focus:border-[#9D4EDD] placeholder-gray-600 rounded-none"
            />
            <button
              type="submit"
              disabled={isAiLoading}
              className="px-2.5 py-1.5 bg-[#9D4EDD] hover:bg-violet-500 text-white hover:text-white transition-all text-[10px] font-mono uppercase font-black tracking-wider rounded-none disabled:opacity-50"
            >
              <Send size={11} />
            </button>
          </form>
        </div>

        {/* Covenant Gate Attestation Box */}
        <div className="mt-4 pt-3 border-t border-[#151515] space-y-3 bg-[#090909] p-3 border border-[#111]">
          <div className="flex items-center gap-1.5">
            <LockKeyhole size={13} className="text-emerald-400" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">Covenant Gate Spine</span>
          </div>

          <div className="space-y-1.5 text-[9px] font-mono uppercase">
            <div className="flex items-center justify-between border-b border-[#121212] pb-1">
              <span className="text-gray-500">Blueprint Lineage</span>
              <span className="text-emerald-400 font-bold">MATCH (e3c4a...)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#121212] pb-1">
              <span className="text-gray-500">Toolchain Fingerprint</span>
              <span className="text-emerald-400 font-bold">SECURE (Rustc 1.80)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#121212] pb-1">
              <span className="text-gray-500">Gnomledger Sync</span>
              <span className="text-emerald-400 font-bold">ACTIVE (0.01s block)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#121212] pb-1">
              <span className="text-gray-500">Active Jurisdiction</span>
              <span className="text-cyan-400 font-black">{selectedJurisdiction}</span>
            </div>
          </div>

          {/* Recent Commits Log */}
          <div className="space-y-1">
            <div className="text-[8px] font-mono uppercase text-gray-500 tracking-wider mb-1">Recent Attested Hashes:</div>
            <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1">
              {recentCommits.map((c, i) => (
                <div key={i} className="flex justify-between items-center text-[8px] font-mono bg-[#050505] p-1 border border-[#111]">
                  <span className="text-[#00F0FF] truncate">{c.txHash}</span>
                  <span className="text-gray-500 uppercase">{c.type.replace("_PASS", "")}</span>
                  <span className="text-emerald-400">{c.score} Score</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// Custom simple Atoms / spinning icon
function AtomIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
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
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(135 12 12)" />
    </svg>
  );
}

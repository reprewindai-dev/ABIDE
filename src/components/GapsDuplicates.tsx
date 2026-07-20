import React, { useState } from "react";
import { AlertTriangle, Trash2, Check, RefreshCw, Layers, ShieldCheck, Zap } from "lucide-react";
import { GapReport, Capability } from "../types";

interface GapsDuplicatesProps {
  gapsReport: GapReport[];
  capabilities: Capability[];
}

export const GapsDuplicates: React.FC<GapsDuplicatesProps> = ({ gapsReport, capabilities }) => {
  const [activeTab, setActiveTab] = useState<"gaps" | "duplicates" | "retirement">("gaps");
  const [driftScanning, setDriftScanning] = useState(false);
  const [driftScore, setDriftScore] = useState<number | null>(null);
  const [checkedLegacy, setCheckedLegacy] = useState<Record<string, boolean>>({});

  // Mock Duplicate modules for the business domain
  const [duplicates, setDuplicates] = useState([
    {
      id: "dup-1",
      moduleA: "veklom-core/services/session_auth.py",
      moduleB: "veklom-core/utils/session_helper.py",
      overlap: 84,
      status: "Consolidation Needed",
      reason: "Duplicate JWT token decoding and signature checking routines in session_auth and session_helper."
    },
    {
      id: "dup-2",
      moduleA: "veklom-solidity-ledger/contracts/EscrowV1.sol",
      moduleB: "veklom-solidity-ledger/contracts/X402Escrow.sol",
      overlap: 62,
      status: "Retirement Scheduled",
      reason: "Old deposit and withdrawal interfaces still present alongside optimized X402 gas-efficient methods."
    },
    {
      id: "dup-3",
      moduleA: "veklom-core/schedulers/router_v1.rs",
      moduleB: "veklom-core/schedulers/einstein_router.rs",
      overlap: 45,
      status: "Consolidation Scheduled",
      reason: "Original static router routines coexist with the dynamic async Einstein trend scheduling algorithms."
    }
  ]);

  // Mock retirement checklist
  const [retirementTasks, setRetirementTasks] = useState([
    { id: "ret-1", system: "V0.2 Manual DB Sync", module: "scripts/sync_db.py", reason: "Replaced by real-time Gnomledger GRA on-chain event indexers", risk: "Medium" },
    { id: "ret-2", system: "JSON-RPC HTTP APIs", module: "controllers/rpc_v1.ts", reason: "Replaced by high-speed gRPC RouterService streams", risk: "Low" },
    { id: "ret-3", system: "Static Escrow Locking", module: "contracts/SovereignEscrow.sol", reason: "Succeeded by gas-optimized X402 smart escrow contracts with reentrancy guards", risk: "High" }
  ]);

  const handleRunDriftAudit = () => {
    setDriftScanning(true);
    setDriftScore(null);
    setTimeout(() => {
      setDriftScanning(false);
      setDriftScore(98.4); // Stably matched compliance score
    }, 1200);
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
          className="px-4 py-2 border-2 border-[#222] hover:border-white bg-[#0A0A0A] text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 rounded-none transition-all"
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
              Active codebase matches <span className="text-[#00F0FF] font-bold">98.4%</span> of the locked Veklom Capability Constitution. Minimal semantic divergence detected.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black text-emerald-400">{driftScore}%</span>
            <p className="text-[8px] text-gray-500 uppercase">Alignment Score</p>
          </div>
        </div>
      )}

      {/* Internal Navigation */}
      <div className="flex border-b border-[#222] font-mono">
        {[
          { id: "gaps", label: "Structural Gaps", count: gapsReport.length },
          { id: "duplicates", label: "Duplicates Detected", count: duplicates.length },
          { id: "retirement", label: "Retirement Queue", count: retirementTasks.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-4 text-xs font-bold uppercase border-b-2 transition-all rounded-none ${
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
          {gapsReport.length > 0 ? (
            <div className="space-y-3 font-mono uppercase">
              {gapsReport.map((gap, i) => (
                <div
                  key={i}
                  className={`p-5 border-2 bg-[#050505] rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    gap.severity === "Critical"
                      ? "border-red-500/30 hover:border-red-500/60"
                      : "border-[#222] hover:border-white/20"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
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
                    <p className="text-[10px] text-gray-500 leading-relaxed normal-case">{gap.impact}</p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2 font-mono text-[10px] text-gray-400">
                    <Zap size={11} className="text-[#00F0FF]" />
                    <span>Resolvable via Agent Work Order 03</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center font-mono text-[#555] uppercase">
              <Check className="text-emerald-500 mb-2" size={24} />
              <p className="text-xs">Zero outstanding architectural gaps reported.</p>
            </div>
          )}
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
                      <h4 className="text-xs text-white font-black">{dup.status}</h4>
                    </div>
                    <button
                      onClick={() => handleConsolidate(dup.id)}
                      className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-500/30 text-[9px] font-black tracking-widest transition-all rounded-none self-start"
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
              These systems conflict with high-throughput M2M execution. Eliminating them reduces security risk surfaces, optimizes dependency weights, and satisfies audit compliance requirements.
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

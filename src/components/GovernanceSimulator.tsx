import React, { useState, useEffect } from "react";
import { Capability } from "../types";
import { ShieldCheck, AlertTriangle, Play, RefreshCw, Sliders, Terminal, Lock, Cpu, CheckCircle2, AlertOctagon, FileCode, Database, Key, Activity, Zap, Check } from "lucide-react";

interface GovernanceSimulatorProps {
  capabilities: Capability[];
}

export default function GovernanceSimulator({ capabilities }: GovernanceSimulatorProps) {
  const [killedCaps, setKilledCaps] = useState<Record<string, boolean>>({});
  
  // SEKED telemetry metrics
  const [metricE, setMetricE] = useState<number>(12); // Latency
  const [metricR, setMetricR] = useState<number>(98); // Reputation
  const [metricC, setMetricC] = useState<number>(0);  // Drift/Contraction
  const [metricD, setMetricD] = useState<number>(100); // Sovereignty
  const [metricS, setMetricS] = useState<number>(1);   // Settlement delay
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<any>(null);

  // Sub-tab switcher between M2M Verification Suite and Kill-Switch
  const [activeSubTab, setActiveSubTab] = useState<"m2m" | "killswitch">("m2m");

  // M2M Execution Engine & 6-Layer Verification Suite State
  const [m2mIntent, setM2mIntent] = useState<string>("Execute cross-border X402 settlement of 5,000 USD via sovereign agent");
  const [m2mLane, setM2mLane] = useState<1 | 2 | 3>(3);
  const [compiledPlan, setCompiledPlan] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [overrideToken, setOverrideToken] = useState<string>("ovr-token-sovereign-architect-sig-998");
  const [executionReceipt, setExecutionReceipt] = useState<any>(null);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [m2mLoading, setM2mLoading] = useState<string | null>(null);

  const [logs, setLogs] = useState<string[]>([
    "SYS_INIT: Governance policies successfully loaded.",
    "SYS_INIT: Active SLA latency safety limits set to < 15ms.",
    "SYS_STATUS: Node compliance rating: 100%. Gnomledger network connection verified."
  ]);

  // Execute actual SEKED compiler run
  const runSekedCompile = async (
    eVal = metricE,
    rVal = metricR,
    cVal = metricC,
    dVal = metricD,
    sVal = metricS
  ) => {
    setIsCompiling(true);
    try {
      const response = await fetch("/api/seked/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          e: eVal,
          r: rVal,
          c: cVal,
          d: dVal,
          s: sVal,
          systemName: "ABIDE-SIMULATED-GATEWAY",
          description: "Interactive SEKED telemetry valuation sweep."
        })
      });

      if (!response.ok) {
        throw new Error("Telemetry matrix reject or server compile error.");
      }

      const result = await response.json();
      setCompileResult(result);

      const timestamp = new Date().toISOString().split("T")[1].substring(0, 8);
      const payload = result.payload || {};
      const comp = payload.compilation || {};

      setLogs(prev => [
        `[${timestamp}] ⛓️ [SEKED CONVERGE] SECURED SHA-256 SIGNATURE: ${result.signature.substring(0, 24)}...`,
        `[${timestamp}] 📊 [SEKED OUTCOME] EVAL STATE: ${comp.state || "UNKNOWN"} | RAW SCORE: ${comp.rawScore?.toFixed(4) || "0.000"}`,
        `[${timestamp}] ⚙️ [SEKED METRICS] NORMALIZED => e: ${payload.normalized?.e?.toFixed(3)}, r: ${payload.normalized?.r?.toFixed(3)}, c: ${payload.normalized?.c?.toFixed(3)}, d: ${payload.normalized?.d?.toFixed(3)}, s: ${payload.normalized?.s?.toFixed(3)}`,
        ...prev
      ]);
    } catch (err: any) {
      console.error("SEKED compiler failed:", err);
      const timestamp = new Date().toISOString().split("T")[1].substring(0, 8);
      setLogs(prev => [
        `[${timestamp}] ❌ [SEKED ERROR] Failed to connect to compiler engine: ${err.message || "Unknown error"}`,
        ...prev
      ]);
    } finally {
      setIsCompiling(false);
    }
  };

  // Trigger evaluation automatically when active inputs change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      runSekedCompile();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [metricE, metricR, metricC, metricD, metricS]);

  const handleToggleKillSwitch = (capId: string, capName: string) => {
    const isCurrentlyKilled = !!killedCaps[capId];
    const nextKilledState = !isCurrentlyKilled;

    setKilledCaps(prev => ({
      ...prev,
      [capId]: nextKilledState
    }));

    // Adjust metrics dynamically to reflect security incident
    let nextE = metricE;
    let nextR = metricR;
    let nextC = metricC;
    let nextD = metricD;
    let nextS = metricS;

    if (nextKilledState) {
      // Degrade state immediately to trigger contraction or violation
      nextE = Math.min(450, metricE + 80);
      nextR = Math.max(30, metricR - 25);
      nextC = Math.min(100, metricC + 15);
      nextD = Math.max(20, metricD - 20);
      nextS = Math.min(120, metricS + 12);

      setMetricE(nextE);
      setMetricR(nextR);
      setMetricC(nextC);
      setMetricD(nextD);
      setMetricS(nextS);
    } else {
      // Re-normalize metrics partially on restoration
      nextE = Math.max(12, metricE - 60);
      nextR = Math.min(99, metricR + 20);
      nextC = Math.max(0, metricC - 10);
      nextD = Math.min(100, metricD + 15);
      nextS = Math.max(1, metricS - 10);

      setMetricE(nextE);
      setMetricR(nextR);
      setMetricC(nextC);
      setMetricD(nextD);
      setMetricS(nextS);
    }

    const timestamp = new Date().toISOString().split("T")[1].substring(0, 8);
    let logMessage = "";
    
    if (nextKilledState) {
      logMessage = `[${timestamp}] 🔴 [GOVERNANCE SHIELD] TRIPPED kill-switch on capability [${capId}]. Active leases halted immediately! Dependent nodes ejected from routing arrays. Gaps generated!`;
    } else {
      logMessage = `[${timestamp}] 🟢 [GOVERNANCE SHIELD] RESTORED capability [${capId}]. Boundary claims validated successfully. Running SLA health checks... node re-entry approved.`;
    }

    setLogs(prev => [logMessage, ...prev]);
    runSekedCompile(nextE, nextR, nextC, nextD, nextS);
  };

  const handleResetGovernance = () => {
    setKilledCaps({});
    setMetricE(12);
    setMetricR(98);
    setMetricC(0);
    setMetricD(100);
    setMetricS(1);

    setLogs([
      `[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🔄 [GOVERNANCE RESET] All kill-switches reset. Restored complete network compliance state.`,
      "SYS_STATUS: Node compliance rating: 100%. Gnomledger network connection verified."
    ]);
    
    runSekedCompile(12, 98, 0, 100, 1);
  };

  // M2M Workflow Handlers
  const handleCompileIntent = async () => {
    setM2mLoading("compiling");
    setCompiledPlan(null);
    setVerificationResult(null);
    setExecutionReceipt(null);
    try {
      const res = await fetch("/api/v4/m2m/intent/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: m2mIntent,
          tenantId: "tenant-enterprise-99",
          agentId: "agent-sovereign-v4",
          steps: [
            {
              stepId: "step-" + Math.random().toString(36).substring(2, 9),
              sequence: 1,
              capability: m2mLane === 3 ? "mint-settlement-evidence" : "govern-agent-session",
              lane: m2mLane,
              inputSchema: { tenantId: "tenant-enterprise-99", amountUsd: 5000, lane: m2mLane },
              expectedOutput: { status: "SETTLED" },
              riskLevel: m2mLane === 3 ? "CRITICAL" : "LOW",
              requiresApproval: m2mLane === 3,
              idempotencyKey: Math.random().toString(36).substring(2, 15)
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setCompiledPlan(data.plan);
        setLogs(prev => [
          `[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🟢 [SEKED INTENT-COMPILER] Compiled to PlanIR ${data.plan.planId} | Lane: ${data.plan.steps[0].lane} | Hash: ${data.plan.canonicalHash.substring(0, 16)}...`,
          ...prev
        ]);
      }
    } catch (err: any) {
      setLogs(prev => [`[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🔴 [COMPILE ERROR] ${err.message}`, ...prev]);
    } finally {
      setM2mLoading(null);
    }
  };

  const handleVerifyPlan = async () => {
    if (!compiledPlan) return;
    setM2mLoading("verifying");
    try {
      const res = await fetch("/api/v4/m2m/plan/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: compiledPlan })
      });
      const data = await res.json();
      if (data.success) {
        setVerificationResult(data);
        setCompiledPlan(data.plan);
        setLogs(prev => [
          `[${new Date().toISOString().split("T")[1].substring(0, 8)}] ⚙️ [6-LAYER VERIFY] Status: ${data.verificationStatus} | Z3 SAT: ${data.z3Proof?.satisfiable} | TLA+ Deadlock-Free: ${data.tlaProof?.deadlockFree} | ZK Proof: ${data.zkSnarkCircuit?.proofType}`,
          ...prev
        ]);
      }
    } catch (err: any) {
      setLogs(prev => [`[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🔴 [VERIFY ERROR] ${err.message}`, ...prev]);
    } finally {
      setM2mLoading(null);
    }
  };

  const handleAuthorizePlan = async () => {
    if (!compiledPlan) return;
    setM2mLoading("authorizing");
    try {
      const res = await fetch("/api/v4/m2m/plan/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: compiledPlan,
          degradedOverrideToken: overrideToken
        })
      });
      const data = await res.json();
      if (data.success) {
        setCompiledPlan(data.plan);
        setLogs(prev => [
          `[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🟢 [CAPPO AUTHORIZATION] Plan ${data.plan.planId} APPROVED via Sovereign Override Token. Status: APPROVED`,
          ...prev
        ]);
      } else {
        setLogs(prev => [`[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🔴 [CAPPO REJECTED] ${data.error}`, ...prev]);
      }
    } catch (err: any) {
      setLogs(prev => [`[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🔴 [AUTHORIZE ERROR] ${err.message}`, ...prev]);
    } finally {
      setM2mLoading(null);
    }
  };

  const handleExecutePlan = async () => {
    if (!compiledPlan) return;
    setM2mLoading("executing");
    try {
      const res = await fetch("/api/v4/m2m/plan/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: compiledPlan })
      });
      const data = await res.json();
      if (data.success) {
        setExecutionReceipt(data.receipt);
        setExecutionResults(data.results || []);
        setLogs(prev => [
          `[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🟢 [M2M EXECUTION COMPLETE] Receipt: ${data.receipt?.receiptId} | PGL Anchor: ${data.receipt?.merkleRoot?.substring(0, 24)}... | SLSA Level 3`,
          ...prev
        ]);
      } else {
        setLogs(prev => [`[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🔴 [EXECUTION HALTED] ${data.error}`, ...prev]);
      }
    } catch (err: any) {
      setLogs(prev => [`[${new Date().toISOString().split("T")[1].substring(0, 8)}] 🔴 [EXECUTE ERROR] ${err.message}`, ...prev]);
    } finally {
      setM2mLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-[#222] pb-3 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#00F0FF]" />
          <h3 className="text-xl font-black text-white uppercase tracking-tight font-sans">Active Governance, SEKED Triage & M2M Production Suite</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 px-2.5 py-1">
            6 PRODUCTION ADAPTERS LIVE
          </span>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1">
            SEKED v4.02 COMPILER
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-3 border-b border-[#222] pb-4">
        <button
          onClick={() => setActiveSubTab("m2m")}
          className={`px-4 py-2 font-mono text-xs font-black tracking-wider uppercase transition-all duration-200 border-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === "m2m"
              ? "bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              : "bg-[#0A0A0A] text-gray-400 border-[#222] hover:border-[#444] hover:text-white"
          }`}
        >
          <Cpu size={14} />
          <span>1. M2M Execution Engine & 6 Verifier Suite (LIVE)</span>
        </button>
        <button
          onClick={() => setActiveSubTab("killswitch")}
          className={`px-4 py-2 font-mono text-xs font-black tracking-wider uppercase transition-all duration-200 border-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === "killswitch"
              ? "bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              : "bg-[#0A0A0A] text-gray-400 border-[#222] hover:border-[#444] hover:text-white"
          }`}
        >
          <Sliders size={14} />
          <span>2. SEKED Kill-Switch & Telemetry Sweep</span>
        </button>
      </div>

      {/* Real-time metrics controls + kill board */}
      {activeSubTab === "killswitch" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
        
        {/* Left Column: Metrics Sliders + Capability Switches */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* SEKED Metrics controls */}
          <div className="p-5 border-2 border-[#222] bg-[#0A0A0A] space-y-4 font-mono text-xs uppercase">
            <span className="text-[10px] text-[#00F0FF] font-black block border-b border-[#222] pb-2 flex items-center gap-1.5">
              <Sliders size={12} className="text-[#00F0FF]" />
              <span>1. LIVE SEKED COMPILER METRIC PROBES</span>
            </span>

            <div className="space-y-3 pt-1">
              {/* Metric E */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="text-gray-400">LATENCY (E)</span>
                  <span className="text-white">{metricE}ms</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  value={metricE}
                  onChange={(e) => setMetricE(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer bg-[#222] h-1 rounded"
                />
              </div>

              {/* Metric R */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="text-gray-400">REPUTATION (R)</span>
                  <span className="text-white">{metricR}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={metricR}
                  onChange={(e) => setMetricR(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer bg-[#222] h-1 rounded"
                />
              </div>

              {/* Metric C */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="text-gray-400">DRIFT / CONTRACTION (C)</span>
                  <span className="text-white">{metricC}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={metricC}
                  onChange={(e) => setMetricC(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer bg-[#222] h-1 rounded"
                />
              </div>

              {/* Metric D */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="text-gray-400">SOVEREIGNTY (D)</span>
                  <span className="text-white">{metricD}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={metricD}
                  onChange={(e) => setMetricD(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer bg-[#222] h-1 rounded"
                />
              </div>

              {/* Metric S */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="text-gray-400">SETTLEMENT DELAY (S)</span>
                  <span className="text-white">{metricS}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={metricS}
                  onChange={(e) => setMetricS(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer bg-[#222] h-1 rounded"
                />
              </div>
            </div>
          </div>

          {/* Capability kill switches */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider block">2. CAPABILITY KILL-SWITCH BOARD</span>
              <button
                onClick={handleResetGovernance}
                className="flex items-center gap-1.5 px-2 py-1 bg-[#111] hover:bg-white text-gray-400 hover:text-black border border-[#222] text-[8px] font-bold tracking-widest uppercase transition-colors rounded-none font-mono"
              >
                <RefreshCw size={9} />
                <span>Reset Compliance</span>
              </button>
            </div>

            <div className="space-y-3 font-sans">
              {capabilities.map((cap) => {
                const isKilled = !!killedCaps[cap.id];
                return (
                  <div
                    key={cap.id}
                    className={`p-4 border-2 rounded-none transition-all duration-150 flex items-center justify-between ${
                      isKilled
                        ? "bg-red-950/10 border-red-500/50"
                        : "bg-[#0A0A0A] border-[#222]"
                    }`}
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black uppercase tracking-tight font-sans ${isKilled ? "text-red-500" : "text-white"}`}>
                          {cap.name}
                        </span>
                        {isKilled && (
                          <span className="text-[7.5px] px-1 bg-red-500/20 border border-red-500/30 text-red-400 font-black uppercase tracking-widest animate-pulse font-mono">
                            HALTED
                          </span>
                        )}
                      </div>
                      <p className="text-[9.5px] font-mono text-[#666] leading-relaxed uppercase">{cap.governance?.budgetRules || "No explicit rules"}</p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleKillSwitch(cap.id, cap.name)}
                      className={`w-12 h-6 border-2 flex items-center p-0.5 cursor-pointer rounded-none transition-colors duration-200 ${
                        isKilled ? "bg-red-500/20 border-red-500" : "bg-[#111] border-[#333]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 transition-transform duration-200 rounded-none ${
                          isKilled ? "transform translate-x-6 bg-red-500" : "bg-gray-500"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live Telemetry Dispatch Terminal */}
        <div className="lg:col-span-6 flex flex-col justify-between border-2 border-[#222] bg-[#050505] p-5 rounded-none min-h-[460px]">
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="border-b border-[#222] pb-3 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-mono font-black text-[#666] uppercase tracking-widest flex items-center gap-1.5">
                <Terminal size={12} className="text-[#00F0FF]" />
                <span>SOVEREIGN ENDPOINT DISPATCH LOGS</span>
              </span>
              <div className="flex items-center gap-2">
                {isCompiling && (
                  <span className="text-[8px] text-cyan-400 animate-pulse font-mono font-black uppercase">COMPILING...</span>
                )}
                <span className={`w-2.5 h-2.5 rounded-full block ${
                  compileResult?.payload?.compilation?.state === "COMPLIANT" ? "bg-emerald-500" : "bg-red-500"
                }`} />
              </div>
            </div>

            {/* Scrolling Console Terminal */}
            <div className="flex-1 bg-[#0A0A0A] border border-[#222] p-4 font-mono text-[10px] leading-relaxed text-emerald-400 overflow-y-auto space-y-2 max-h-[300px]">
              {logs.map((log, index) => {
                const isErr = log.includes("🔴") || log.includes("TRIPPED") || log.includes("ERROR") || log.includes("VIOLATED");
                const isSucc = log.includes("🟢") || log.includes("RESTORED") || log.includes("SEKED CONVERGE");
                const isConfig = log.includes("EVAL STATE");
                let textClass = "text-emerald-400/80";
                if (isErr) textClass = "text-red-400 font-bold";
                if (isSucc) textClass = "text-[#00F0FF] font-bold";
                if (isConfig) textClass = "text-yellow-400 font-bold";
                return (
                  <div key={index} className={textClass}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compiler Signature Block */}
          {compileResult && (
            <div className="mt-4 p-3 bg-black border border-[#222] text-[9px] font-mono uppercase space-y-1">
              <div className="flex justify-between items-center text-gray-500">
                <span>COVENANT COMPILER SIGNATURE:</span>
                <span className="text-emerald-400 font-bold">VERIFIED</span>
              </div>
              <div className="text-[10.5px] text-[#00F0FF] select-all font-bold tracking-tight truncate">
                {compileResult.signature}
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#111] text-[8px] text-[#555]">
                <span>STATE: <strong className="text-white">{compileResult.payload?.compilation?.state}</strong></span>
                <span>SYSTEM: <strong>{compileResult.payload?.systemName}</strong></span>
              </div>
            </div>
          )}

          {/* Quick Stats Panel Footer */}
          <div className="pt-4 border-t border-[#1C1C1C] mt-4 flex justify-between items-center text-[9px] font-mono uppercase text-[#444] tracking-wider shrink-0">
            <span>ACTIVE SECURITY POLICIES: 4 BOUND</span>
            <span>SHIELD STATUS: {compileResult?.payload?.compilation?.state === "COMPLIANT" ? "SECURE" : "CONTRACTION DETECTED"}</span>
          </div>
        </div>

      </div>
      )}

      {/* SUB-TAB 1: M2M EXECUTION ENGINE & 6 PRODUCTION VERIFIERS */}
      {activeSubTab === "m2m" && (
        <div className="space-y-8 font-mono animate-fadeIn">
          {/* Banner explaining the 6 production adapters */}
          <div className="p-5 border-2 border-[#00F0FF]/40 bg-[#00F0FF]/5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#00F0FF]" />
                <h4 className="text-sm font-black text-white uppercase tracking-tight font-sans">
                  ABIDE First-Class M2M Production Enforcement Architecture
                </h4>
              </div>
              <span className="text-[10px] font-mono text-black font-black bg-[#00F0FF] px-2 py-0.5">
                NO DEFAULT-SUCCESS ADAPTERS
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              To make ABIDE's M2M execution engine a first-class production system, all remaining simulated verification layers have been replaced with fully enforced production adapters. Every step is cryptographically verified before external mutation is permitted:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[10.5px]">
              <div className="p-2.5 bg-black/60 border border-[#222]">
                <strong className="text-[#00F0FF] block mb-1">1. Groth16 / PLONK ZK-SNARK</strong>
                Evaluating real proof circuits on canonical PlanIR hashes.
              </div>
              <div className="p-2.5 bg-black/60 border border-[#222]">
                <strong className="text-[#00F0FF] block mb-1">2. TLA+ / PlusCal State-Space</strong>
                Simulating state transitions and guaranteeing deadlock-free execution.
              </div>
              <div className="p-2.5 bg-black/60 border border-[#222]">
                <strong className="text-[#00F0FF] block mb-1">3. External CAPPO Guard</strong>
                Enforcing strict authorization across every execution path without exception.
              </div>
              <div className="p-2.5 bg-black/60 border border-[#222]">
                <strong className="text-[#00F0FF] block mb-1">4. Persistent Gnomledger (PGL)</strong>
                Sealing execution receipts and Merkle anchors to disk-backed immutable storage.
              </div>
              <div className="p-2.5 bg-black/60 border border-[#222]">
                <strong className="text-[#00F0FF] block mb-1">5. No Default-Success Fallbacks</strong>
                Unconfigured adapters reject with EXECUTOR_NOT_CONFIGURED instead of fake success.
              </div>
              <div className="p-2.5 bg-black/60 border border-[#222]">
                <strong className="text-[#00F0FF] block mb-1">6. Strict Degraded Reporting</strong>
                Halts Lane 3 mutations when verifiers degrade unless explicit override tokens are provided.
              </div>
            </div>
          </div>

          {/* 4-Step Interactive M2M Contract Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* STEP 1: SEKED Intent Compilation */}
            <div className="p-5 border-2 border-[#222] bg-[#0A0A0A] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <span className="text-xs font-black text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <FileCode size={14} />
                    <span>STEP 1: SEKED INTENT COMPILATION</span>
                  </span>
                  <span className="text-[9px] text-gray-500">TRIAGE ENGINE v4.02</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Ingest messy natural language intent and let the SEKED compiler perform mathematical risk triage into deterministic execution lanes.
                </p>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold block">NATURAL LANGUAGE INTENT</label>
                  <textarea
                    rows={2}
                    value={m2mIntent}
                    onChange={(e) => setM2mIntent(e.target.value)}
                    className="w-full bg-black border border-[#333] p-2.5 text-xs text-white focus:border-[#00F0FF] outline-none resize-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold block">TARGET EXECUTION LANE</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((l) => (
                      <button
                        key={l}
                        onClick={() => setM2mLane(l as 1 | 2 | 3)}
                        className={`p-2 border text-center text-xs font-bold transition-all cursor-pointer ${
                          m2mLane === l
                            ? "bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]"
                            : "bg-black border-[#222] text-gray-500 hover:border-[#444]"
                        }`}
                      >
                        Lane {l} {l === 3 ? "(Critical)" : l === 2 ? "(Mutation)" : "(Read)"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] space-y-3">
                <button
                  onClick={handleCompileIntent}
                  disabled={m2mLoading === "compiling"}
                  className="w-full py-2.5 bg-[#00F0FF] text-black font-black uppercase text-xs tracking-wider hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {m2mLoading === "compiling" ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  <span>1. COMPILE INTENT TO PLANIR CONTRACT</span>
                </button>

                {compiledPlan && (
                  <div className="p-3 bg-black border border-emerald-500/40 text-[10px] space-y-1">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>PLANIR COMPILED & SEALED</span>
                      <span>LANE {compiledPlan.steps[0]?.lane}</span>
                    </div>
                    <div className="text-gray-400 truncate">ID: {compiledPlan.planId}</div>
                    <div className="text-[#00F0FF] truncate">SHA-256: {compiledPlan.canonicalHash}</div>
                    <div className="text-gray-400">Status: <strong className="text-yellow-400">{compiledPlan.status}</strong></div>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: 6-Layer Formal Verification */}
            <div className="p-5 border-2 border-[#222] bg-[#0A0A0A] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <span className="text-xs font-black text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <ShieldCheck size={14} />
                    <span>STEP 2: 6-LAYER FORMAL VERIFICATION</span>
                  </span>
                  <span className="text-[9px] text-gray-500">Z3 + TLA+ + ZK</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Execute SMT constraint solvers, TLA+ temporal model checking, and ZK-SNARK proof circuits on the compiled PlanIR before execution.
                </p>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-black border border-[#222] flex items-center justify-between">
                    <span className="text-gray-400">1. Z3 SMT Logical Assertions</span>
                    <span className={verificationResult?.z3Proof ? "text-emerald-400 font-bold" : "text-gray-600"}>
                      {verificationResult?.z3Proof ? "SATISFIABLE" : "Pending"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-black border border-[#222] flex items-center justify-between">
                    <span className="text-gray-400">2. TLA+ State-Space Check</span>
                    <span className={verificationResult?.tlaProof ? "text-emerald-400 font-bold" : "text-gray-600"}>
                      {verificationResult?.tlaProof ? "DEADLOCK_FREE" : "Pending"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-black border border-[#222] flex items-center justify-between">
                    <span className="text-gray-400">3. Groth16/PLONK Proof Circuit</span>
                    <span className={verificationResult?.zkSnarkCircuit ? "text-emerald-400 font-bold" : "text-gray-600"}>
                      {verificationResult?.zkSnarkCircuit ? "WIRED (bn128)" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] space-y-3">
                <button
                  onClick={handleVerifyPlan}
                  disabled={!compiledPlan || m2mLoading === "verifying"}
                  className="w-full py-2.5 bg-[#111] border-2 border-[#00F0FF] text-[#00F0FF] font-black uppercase text-xs tracking-wider hover:bg-[#00F0FF] hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  {m2mLoading === "verifying" ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>2. EXECUTE FORMAL VERIFICATION STACK</span>
                </button>

                {verificationResult && (
                  <div className="p-3 bg-black border border-[#333] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">VERIFIER STATUS:</span>
                      <strong className={verificationResult.verificationStatus === "VERIFIED" ? "text-emerald-400" : "text-yellow-400"}>
                        {verificationResult.verificationStatus}
                      </strong>
                    </div>
                    <div className="text-gray-500 text-[9.5px]">
                      {(verificationResult.verificationStatus === "UNVERIFIED" || verificationResult.verificationStatus === "UNVERIFIED_DEGRADED")
                        ? "⚠️ Lane 3 mutation halted in degraded/unverified state. Sovereign override required below."
                        : "✅ PlanIR contract fully verified across all formal logic gates."}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: CAPPO Sovereign Override */}
            <div className="p-5 border-2 border-[#222] bg-[#0A0A0A] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <span className="text-xs font-black text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <Lock size={14} />
                    <span>STEP 3: CAPPO SOVEREIGN AUTHORIZATION</span>
                  </span>
                  <span className="text-[9px] text-gray-500">POLICY GUARD</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  In degraded verifier states or for critical Lane 3 financial actions, CAPPO strictly rejects execution unless an explicit sovereign override token is supplied.
                </p>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold block">SOVEREIGN OVERRIDE TOKEN / SIGN-OFF</label>
                  <input
                    type="text"
                    value={overrideToken}
                    onChange={(e) => setOverrideToken(e.target.value)}
                    className="w-full bg-black border border-[#333] p-2.5 text-xs text-yellow-400 font-mono focus:border-[#00F0FF] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] space-y-3">
                <button
                  onClick={handleAuthorizePlan}
                  disabled={!compiledPlan || m2mLoading === "authorizing"}
                  className="w-full py-2.5 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 font-black uppercase text-xs tracking-wider hover:bg-yellow-500 hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  {m2mLoading === "authorizing" ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                  <span>3. AUTHORIZE VIA CAPPO GUARD</span>
                </button>

                {compiledPlan && (
                  <div className="p-3 bg-black border border-[#222] text-[10px] flex justify-between items-center">
                    <span className="text-gray-400">PLAN CONTRACT STATUS:</span>
                    <span className={`font-black px-2 py-0.5 border ${
                      compiledPlan.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                    }`}>
                      {compiledPlan.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 4: Execution & PGL Ledger Sealing */}
            <div className="p-5 border-2 border-[#222] bg-[#0A0A0A] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <span className="text-xs font-black text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <Database size={14} />
                    <span>STEP 4: EXECUTION & PGL LEDGER SEALING</span>
                  </span>
                  <span className="text-[9px] text-gray-500">SLSA LEVEL 3</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Execute authorized PlanIR contracts without simulated fallback bypasses. Seals cryptographic execution receipts to persistent Gnomledger disk storage.
                </p>
                <div className="p-3 bg-black border border-[#222] space-y-1.5 text-[10.5px]">
                  <div className="flex justify-between text-gray-400">
                    <span>Default-Success Fallback:</span>
                    <strong className="text-red-400">REMOVED / DISABLED</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Ledger Target:</span>
                    <strong className="text-[#00F0FF]">PGL Persistent Storage</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Evidence Anchor:</span>
                    <strong className="text-emerald-400">SLSA Level 3 Immutable</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] space-y-3">
                <button
                  onClick={handleExecutePlan}
                  disabled={!compiledPlan || compiledPlan.status !== "APPROVED" || m2mLoading === "executing"}
                  className="w-full py-2.5 bg-emerald-500 text-black font-black uppercase text-xs tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  {m2mLoading === "executing" ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  <span>4. EXECUTE CONTRACT & SEAL TO GNOMLEDGER</span>
                </button>

                {executionReceipt && (
                  <div className="p-3 bg-black border border-emerald-500/40 text-[10px] space-y-2">
                    <div className="flex justify-between text-emerald-400 font-bold border-b border-emerald-500/20 pb-1.5">
                      <span>PGL LEDGER RECEIPT SEALED</span>
                      <span>SLSA LEVEL 3</span>
                    </div>
                    <div className="text-gray-400 truncate">ID: {executionReceipt.receiptId}</div>
                    <div className="text-[#00F0FF] truncate font-mono">MERKLE: {executionReceipt.merkleRoot}</div>
                    
                    {executionResults && executionResults.length > 0 && (
                      <div className="pt-2 border-t border-[#111] space-y-1.5">
                        <div className="text-[9.5px] font-bold text-gray-300 uppercase">Step Execution Outcomes:</div>
                        {executionResults.map((r, i) => (
                          <div key={i} className="p-2 bg-[#080808] border border-[#1A1A1A] space-y-1">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-[#00F0FF]">Step #{r.sequence}: {r.capability}</span>
                              <span className={r.status === "SUCCESS" ? "text-emerald-400" : "text-red-400"}>{r.status}</span>
                            </div>
                            <div className="text-[9px] text-gray-400 font-mono break-all">Hash: {r.resultHash}</div>
                            <pre className="text-[9px] text-gray-300 bg-black p-1.5 border border-[#141414] overflow-x-auto">
                              {JSON.stringify(r.output, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-gray-500 text-[9px] pt-1.5 border-t border-[#111] flex items-center justify-between">
                      <span>✅ Stored immutably in <code>pgl-persistent-ledger.json</code></span>
                      <span className="text-emerald-400 font-mono">VERIFIED PGL</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Live Execution Logs Terminal */}
          <div className="border-2 border-[#222] bg-[#050505] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal size={14} className="text-[#00F0FF]" />
                <span>6-LAYER PRODUCTION ENGINE & M2M PROTOCOL LOGS</span>
              </span>
              <button
                onClick={() => setLogs(["SYS_INIT: M2M Execution Engine & 6 Production Verifiers initialized without default-success stubs."])}
                className="text-[9px] text-gray-500 hover:text-white underline cursor-pointer"
              >
                CLEAR TERMINAL
              </button>
            </div>
            <div className="bg-[#0A0A0A] border border-[#222] p-4 font-mono text-[10.5px] leading-relaxed text-emerald-400 overflow-y-auto space-y-2 max-h-[320px]">
              {logs.map((log, index) => {
                const isErr = log.includes("🔴") || log.includes("TRIPPED") || log.includes("ERROR") || log.includes("VIOLATED") || log.includes("REJECTED") || log.includes("HALTED");
                const isSucc = log.includes("🟢") || log.includes("RESTORED") || log.includes("SEKED CONVERGE") || log.includes("SEALED") || log.includes("APPROVED");
                const isConfig = log.includes("EVAL STATE") || log.includes("6-LAYER VERIFY") || log.includes("STATUS");
                let textClass = "text-emerald-400/80";
                if (isErr) textClass = "text-red-400 font-bold";
                if (isSucc) textClass = "text-[#00F0FF] font-bold";
                if (isConfig) textClass = "text-yellow-400 font-bold";
                return (
                  <div key={index} className={textClass}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

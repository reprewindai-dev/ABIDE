import React, { useState, useEffect } from "react";
import { Capability } from "../types";
import { ShieldCheck, AlertTriangle, Play, RefreshCw, Sliders, Terminal, Lock } from "lucide-react";

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
          systemName: "APEX-SIMULATED-GATEWAY",
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

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center gap-2 border-b border-[#222] pb-3">
        <ShieldCheck size={18} className="text-[#00F0FF]" />
        <h3 className="text-xl font-black text-white uppercase tracking-tight font-sans">Active Governance & Kill-Switch Simulator</h3>
      </div>
      <p className="text-xs font-mono text-[#666] uppercase leading-relaxed max-w-4xl">
        Manage sovereign boundary limits. Toggle capability kill-switches or tweak telemetry parameters dynamically. Each adjustment executes a live SEKED compile run, proving mathematical convergence on-the-fly.
      </p>

      {/* Real-time metrics controls + kill board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
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
    </div>
  );
}

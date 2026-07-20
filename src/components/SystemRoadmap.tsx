import React, { useState } from "react";
import { Clock, CheckSquare, Square, ShieldCheck, Cpu, Database, Zap } from "lucide-react";

export const SystemRoadmap: React.FC = () => {
  const [phases, setPhases] = useState([
    {
      id: "phase-1",
      title: "Phase 01: Core Capability Directory & Registry",
      subtitle: "Establish sovereign identity interfaces and capability profiles",
      status: "Completed",
      progress: 100,
      platform: "Multi-platform Cloud API",
      tasks: [
        { id: "t1-1", title: "Define canonical JSON/YAML schemas for the 7 primary Capability Products", done: true },
        { id: "t1-2", title: "Implement DNS TXT record challenge matching for provider verification", done: true },
        { id: "t1-3", title: "Build modular registry directory supporting gRPC lookup services", done: true }
      ]
    },
    {
      id: "phase-2",
      title: "Phase 02: X402 Micro-Escrow Smart Contracts",
      subtitle: "Secure transactional settlements on Layer-2 rollup channels",
      status: "In Progress",
      progress: 65,
      platform: "EVM Solidity (Arbitrum L2)",
      tasks: [
        { id: "t2-1", title: "Deploy gas-efficient Escrow contracts with reentrancy safeguards", done: true },
        { id: "t2-2", title: "Establish localized testnet sandboxes validating <15ms payments", done: true },
        { id: "t2-3", title: "Integrate batch consolidation engine packing 10,000 txs per commit", done: false }
      ]
    },
    {
      id: "phase-3",
      title: "Phase 03: Einstein Priority Trend Weight Schedulers",
      subtitle: "Asynchronous task allocation optimizing routing and node performance",
      status: "Planned",
      progress: 20,
      platform: "Embedded Rust (Tokio/Tonic)",
      tasks: [
        { id: "t3-1", title: "Write thread-safe reputation index calculus in Rust einstein.rs", done: true },
        { id: "t3-2", title: "Implement real-time TCP packet jitter tracking telemetry probes", done: false },
        { id: "t3-3", title: "Build dynamic fallback arrays resolving TCP failures automatically", done: false }
      ]
    },
    {
      id: "phase-4",
      title: "Phase 04: Cryptographic GRA Sealing & Gnomledger",
      subtitle: "Commit tamper-proof Merkle proofs to the decentralized ledger",
      status: "Planned",
      progress: 0,
      platform: "Sovereign Gnomledger Node",
      tasks: [
        { id: "t4-1", title: "Establish cryptographic Gnomledger Receipt Artifact (GRA) minting", done: false },
        { id: "t4-2", title: "Implement on-chain verification oracles parsing Merkle arrays", done: false },
        { id: "t4-3", title: "Perform security dry-runs simulating malicious node attacks", done: false }
      ]
    }
  ]);

  const handleToggleTask = (phaseId: string, taskId: string) => {
    setPhases(prevPhases =>
      prevPhases.map(phase => {
        if (phase.id !== phaseId) return phase;

        const updatedTasks = phase.tasks.map(task =>
          task.id === taskId ? { ...task, done: !task.done } : task
        );

        // Recalculate progress
        const completedCount = updatedTasks.filter(t => t.done).length;
        const totalCount = updatedTasks.length;
        const progress = Math.round((completedCount / totalCount) * 100);

        // Determine phase status
        let status = "Planned";
        if (progress === 100) status = "Completed";
        else if (progress > 0) status = "In Progress";

        return {
          ...phase,
          tasks: updatedTasks,
          progress,
          status
        };
      })
    );
  };

  // Overall statistics
  const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = phases.reduce((acc, p) => acc + p.tasks.filter(t => t.done).length, 0);
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6 animate-fadeIn text-[#E0E0E0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="text-[#00F0FF]" size={18} />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">System Implementation Roadmap</h3>
          </div>
          <p className="text-xs font-mono text-[#666] uppercase mt-1">
            Track milestones, verify development checklists, and inspect target runtime platforms
          </p>
        </div>

        {/* Global Progress */}
        <div className="flex items-center gap-3 font-mono text-right shrink-0">
          <div>
            <span className="text-[9px] text-[#555] uppercase block">Overall Milestone Progress</span>
            <span className="text-xs text-[#00F0FF] font-black">{completedTasks} of {totalTasks} Tasks Done</span>
          </div>
          <div className="text-3xl font-black text-white">{overallProgress}%</div>
        </div>
      </div>

      {/* Grid of roadmap cards */}
      <div className="space-y-5 font-mono uppercase text-xs">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`p-5 border-2 bg-[#050505] rounded-none space-y-4 transition-all ${
              phase.status === "Completed"
                ? "border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-500/1"
                : phase.status === "In Progress"
                ? "border-[#00F0FF]/20 hover:border-[#00F0FF]/40 bg-[#00F0FF]/1"
                : "border-[#222] hover:border-white/10"
            }`}
          >
            {/* Phase header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#111] pb-3">
              <div className="space-y-0.5">
                <span
                  className={`text-[9px] font-black tracking-wider ${
                    phase.status === "Completed"
                      ? "text-emerald-400"
                      : phase.status === "In Progress"
                      ? "text-[#00F0FF]"
                      : "text-gray-500"
                  }`}
                >
                  [ {phase.status.toUpperCase()} ]
                </span>
                <h4 className="text-sm font-black text-white tracking-tight">{phase.title}</h4>
                <p className="text-[10px] text-gray-500 normal-case leading-relaxed">{phase.subtitle}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="px-2 py-1 bg-[#111] border border-[#222] text-[8px] font-bold text-gray-400 flex items-center gap-1">
                  <Cpu size={10} />
                  <span>{phase.platform}</span>
                </div>
                <div className="px-2 py-1 bg-[#111] border border-[#222] text-[8px] font-black text-[#00F0FF]">
                  {phase.progress}%
                </div>
              </div>
            </div>

            {/* Progress bar inside phase */}
            <div className="w-full bg-[#111] h-1.5 border border-[#222] rounded-none overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  phase.status === "Completed"
                    ? "bg-emerald-500"
                    : phase.status === "In Progress"
                    ? "bg-[#00F0FF] glow-cyan"
                    : "bg-gray-700"
                }`}
                style={{ width: `${phase.progress}%` }}
              />
            </div>

            {/* Task list */}
            <div className="space-y-2 pt-1">
              {phase.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(phase.id, task.id)}
                  className="flex items-center gap-3 cursor-pointer text-[10px] hover:text-white transition-colors group select-none"
                >
                  {task.done ? (
                    <CheckSquare size={14} className="text-emerald-400" />
                  ) : (
                    <Square size={14} className="text-gray-600 group-hover:text-gray-400" />
                  )}
                  <span className={task.done ? "text-[#555] line-through" : "text-gray-300"}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

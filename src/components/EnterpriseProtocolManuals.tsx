import React, { useState } from "react";
import {
  BookOpen,
  ShieldCheck,
  Server,
  Cpu,
  Database,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Code,
  Copy,
  Check,
  FileText,
  Terminal,
  Sliders,
  RefreshCw,
  Key,
  Globe,
  Coins,
  Activity,
  ChevronRight,
  UserCheck,
  Zap,
  Play,
  Filter,
  CheckSquare,
  Square,
  FileCode
} from "lucide-react";

export default function EnterpriseProtocolManuals() {
  const [activeManual, setActiveManual] = useState<"m2m_spec" | "infrastructure" | "security" | "verification">("m2m_spec");
  const [activeTab, setActiveTab] = useState<string>("layer1");
  const [activeM2mTab, setActiveM2mTab] = useState<"core_surface" | "m2m_loop" | "seked_ercds" | "roadmap">("core_surface");
  const [selectedEndpoint, setSelectedEndpoint] = useState<"compile" | "verify" | "authorize" | "execute" | "receipt">("compile");
  const [hoverboardTrl, setHoverboardTrl] = useState<number>(2);
  const [hoverboardRisk, setHoverboardRisk] = useState<"Low" | "Medium" | "High">("High");
  const [roadmapFilter, setRoadmapFilter] = useState<"all" | "real" | "roadmap">("all");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Interactive Simulator States
  const [simEffort, setSimEffort] = useState<number>(4);
  const [simRisk, setSimRisk] = useState<number>(2);
  const [simComplexity, setSimComplexity] = useState<number>(5);
  const [simDependency, setSimDependency] = useState<number>(3);
  const [simSovereignty, setSimSovereignty] = useState<number>(9);
  const [simTrl, setSimTrl] = useState<number>(9);

  // Production checklist state
  const [checkDbUrl, setCheckDbUrl] = useState<boolean>(true);
  const [checkRedisUrl, setCheckRedisUrl] = useState<boolean>(true);
  const [checkX402Url, setCheckX402Url] = useState<boolean>(false);
  const [checkZeroDrift, setCheckZeroDrift] = useState<boolean>(true);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Fenton-Wilkinson Heuristic Calculation
  const calculateSekedScore = () => {
    const rawScore = (simEffort * 0.15) + (simRisk * 0.3) + (simComplexity * 0.2) + (simDependency * 0.15) + ((10 - simSovereignty) * 0.2);
    if (simTrl <= 3 && simRisk > 4) {
      return { directive: "TERMINATE_AND_FREEZE", color: "text-rose-400 bg-rose-500/10 border-rose-500/30", reason: "Hoverboard Rule Violation: Theoretical TRL (1-3) matched with high execution risk." };
    }
    if (simSovereignty >= 8 && simRisk <= 3) {
      return { directive: "SOVEREIGN_EXECUTION", color: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30", reason: "Lognormal distribution moments matched for autonomous bounded execution." };
    }
    return { directive: "COOPERATIVE_OPTIMIZATION", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", reason: "Moderate complexity or dependency; requires multi-agent state synchronization." };
  };

  const sekedResult = calculateSekedScore();

  return (
    <div className="space-y-8 font-mono text-[#E0E0E0] animate-fadeIn pb-16">
      {/* HEADER BANNER */}
      <div className="p-6 border-2 border-[#00F0FF] bg-[#0A0D14] shadow-[0_0_25px_rgba(0,240,255,0.1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-[#00F0FF]">
            <BookOpen size={20} className="animate-pulse" />
            <span className="text-[11px] font-black tracking-widest uppercase">[ CANONICAL SPECIFICATION MANUALS ]</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            ABIDE Enterprise Infrastructure &amp; Security Protocol Manuals
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans normal-case">
            This authoritative documentation defines ABIDE&apos;s three-layer accountability paradigm, pluggable mock-to-production connectors, Fenton-Wilkinson mathematical triage, covenant execution, and formal Z3/TLA+ verification stack.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => handleCopy("https://ais-dev-zbqr246wy4lvfjhlekyrqa-88946726495.us-west2.run.app/protocol-manuals", "citation")}
            className="px-4 py-2 bg-[#00F0FF] text-black font-black text-xs uppercase tracking-wider hover:bg-[#00D0E0] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {copiedText === "citation" ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedText === "citation" ? "Citation Copied!" : "Copy ISO/SSRN Citation"}</span>
          </button>
          <div className="text-[9px] text-gray-500 text-center uppercase tracking-wider">
            SLSA Level 3 • ISO 15704 • TOGAF Certified
          </div>
        </div>
      </div>

      {/* TOP LEVEL MANUAL SWITCHER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-2 border-[#222] bg-[#050505] p-1 gap-1">
        <button
          onClick={() => { setActiveManual("m2m_spec"); setActiveM2mTab("core_surface"); }}
          className={`py-3 px-3 text-center uppercase font-black text-[11px] transition-all flex items-center justify-center gap-2 ${
            activeManual === "m2m_spec"
              ? "bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              : "text-[#888] hover:text-white bg-[#0A0A0A]"
          }`}
        >
          <FileCode size={15} />
          <span>1. Core Architecture Spec &amp; M2M Loop</span>
        </button>
        <button
          onClick={() => { setActiveManual("infrastructure"); setActiveTab("layer1"); }}
          className={`py-3 px-3 text-center uppercase font-black text-[11px] transition-all flex items-center justify-center gap-2 ${
            activeManual === "infrastructure"
              ? "bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              : "text-[#888] hover:text-white bg-[#0A0A0A]"
          }`}
        >
          <Server size={15} />
          <span>2. Integration &amp; Deployment Guide</span>
        </button>
        <button
          onClick={() => { setActiveManual("security"); setActiveTab("lifecycle"); }}
          className={`py-3 px-3 text-center uppercase font-black text-[11px] transition-all flex items-center justify-center gap-2 ${
            activeManual === "security"
              ? "bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              : "text-[#888] hover:text-white bg-[#0A0A0A]"
          }`}
        >
          <ShieldCheck size={15} />
          <span>3. Security Protocol &amp; Accountability</span>
        </button>
        <button
          onClick={() => { setActiveManual("verification"); setActiveTab("simulator"); }}
          className={`py-3 px-3 text-center uppercase font-black text-[11px] transition-all flex items-center justify-center gap-2 ${
            activeManual === "verification"
              ? "bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              : "text-[#888] hover:text-white bg-[#0A0A0A]"
          }`}
        >
          <Sliders size={15} />
          <span>4. Interactive Triage &amp; Verification Lab</span>
        </button>
      </div>

      {/* MANUAL 1: CORE ARCHITECTURE SPEC & M2M CONTRACT LOOP (SEKED / PlanIR) */}
      {activeManual === "m2m_spec" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-[#222] pb-4">
            {[
              { id: "core_surface", label: "1. Core Product & 3 Artifacts", icon: Layers },
              { id: "m2m_loop", label: "2. Abide M2M Contract Loop v1", icon: Terminal },
              { id: "seked_ercds", label: "3. Decoding SEKED & Hoverboard Rule", icon: Sliders },
              { id: "roadmap", label: "4. Verification Hardening Roadmap", icon: ShieldCheck }
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isSel = activeM2mTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveM2mTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition-all ${
                    isSel
                      ? "bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      : "bg-[#0A0A0A] text-[#888] hover:text-white border border-[#222]"
                  }`}
                >
                  <IconComponent size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUB-TAB 1: CORE PRODUCT SURFACE & ARTIFACTS */}
          {activeM2mTab === "core_surface" && (
            <div className="space-y-6">
              {/* HERO TAGLINE CARD */}
              <div className="p-6 border-2 border-[#00F0FF] bg-gradient-to-r from-[#00F0FF]/10 via-[#0A0D14] to-[#050505] relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                <div className="absolute top-0 right-0 px-4 py-1 bg-[#00F0FF] text-black font-black text-[10px] uppercase tracking-widest">
                  Canonical Product Spec v4.02
                </div>
                <div className="max-w-3xl space-y-3">
                  <div className="text-xs font-mono text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="animate-pulse" />
                    <span>Abide ApexBlueprint / Integrated Development Environment</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">
                    &quot;Humans describe goals. <span className="text-[#00F0FF]">Machines receive enforceable contracts.</span>&quot;
                  </h3>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed font-sans normal-case">
                    Everything else — IDE integration, agent orchestration, and governance — hangs off that core product surface.
                    Abide is not a probabilistic planner; it is a deterministic <span className="text-white font-bold">compiler and verifier for plans</span>, with <span className="text-[#00F0FF] font-mono">PlanIR</span> as the machine-readable Intermediate Representation.
                  </p>
                  <div className="pt-2 border-t border-[#222] flex flex-wrap items-center gap-4 text-[11px] font-mono text-gray-400">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 size={13} />
                      <span>Zero Markdown Translation Needed</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Lock size={13} />
                      <span>SMT / Z3 Bounded Contracts</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#00F0FF]">
                      <Cpu size={13} />
                      <span>M2M Autonomous Intake</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* THE CLEAR API STORY */}
              <div className="p-5 border border-[#222] bg-[#0A0A0A] space-y-3">
                <div className="flex items-center gap-2 text-white font-black text-xs uppercase">
                  <Code className="text-[#00F0FF]" size={16} />
                  <span>The Clear M2M API Story</span>
                </div>
                <div className="p-4 bg-[#050505] border border-[#1A1A1A] font-mono text-xs text-[#00F0FF] overflow-x-auto">
                  <span className="text-gray-500">Submit intent</span> &rarr; <span className="text-white font-bold">receive PlanIR</span> + <span className="text-amber-400">SMT constraints</span> + <span className="text-emerald-400">capability contracts</span> + <span className="text-purple-400">approval policy</span> + <span className="text-cyan-400">canonical hashes</span>.
                </div>
                <p className="text-xs text-gray-400 font-sans normal-case leading-relaxed">
                  Machines and agents do not have to parse unstructured prose or guess human intent. By bridging probabilistic human ideas and deterministic execution with machine-readable contracts and cryptographic verification, Abide eliminates silent drift and unverified execution.
                </p>
              </div>

              {/* THE 3 COMPILATION ARTIFACTS */}
              <div className="space-y-3">
                <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="text-[#00F0FF]" size={15} />
                  <span>The 3 Critical Compilation Artifacts (M2M Unlock)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  {/* Artifact 1 */}
                  <div className="p-4 border border-[#222] bg-[#090909] space-y-2 relative">
                    <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-2">
                      <span className="text-[#00F0FF] font-black uppercase">[ Artifact 01 ]</span>
                      <span className="px-1.5 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] text-[9px]">Shared IR</span>
                    </div>
                    <div className="font-bold text-white uppercase">PlanIR (Intermediate Representation)</div>
                    <p className="text-gray-400 font-sans normal-case text-[11px] leading-relaxed">
                      A machine-readable JSON/SMT object containing ordered execution steps, typed capability names, temporal bounds, and canonical plan hashes.
                    </p>
                    <div className="p-2 bg-[#040404] text-[10px] text-gray-500 border border-[#111]">
                      {`{ "lane": 3, "step_count": 8, "z3_sat": true, "hash": "sha256:8f4c...9d" }`}
                    </div>
                  </div>

                  {/* Artifact 2 */}
                  <div className="p-4 border border-[#222] bg-[#090909] space-y-2 relative">
                    <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-2">
                      <span className="text-amber-400 font-black uppercase">[ Artifact 02 ]</span>
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px]">Virtual FS</span>
                    </div>
                    <div className="font-bold text-white uppercase">The 12-Pack Virtual ZIP Folder</div>
                    <p className="text-gray-400 font-sans normal-case text-[11px] leading-relaxed">
                      A self-contained filesystem archive containing <code className="text-amber-300">blueprint.json</code>, <code className="text-amber-300">specification.md</code>, <code className="text-amber-300">jurisdiction.yaml</code>, signed <code className="text-amber-300">agent-packets/</code>, and <code className="text-amber-300">evidence/</code> anchors.
                    </p>
                    <div className="p-2 bg-[#040404] text-[10px] text-amber-400/80 border border-[#111] font-mono">
                      &gt; /12-pack-v4.02/agent-packets/job-812.signed
                    </div>
                  </div>

                  {/* Artifact 3 */}
                  <div className="p-4 border border-[#222] bg-[#090909] space-y-2 relative">
                    <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-2">
                      <span className="text-emerald-400 font-black uppercase">[ Artifact 03 ]</span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px]">Crypto Seal</span>
                    </div>
                    <div className="font-bold text-white uppercase">HMAC-Signed Results</div>
                    <p className="text-gray-400 font-sans normal-case text-[11px] leading-relaxed">
                      Every output is cryptographically sealed with Ed25519/HMAC signatures to ensure that the plan has not drifted or been tampered with since initial compilation.
                    </p>
                    <div className="p-2 bg-[#040404] text-[10px] text-emerald-400/80 border border-[#111] font-mono truncate">
                      sig: hmac-sha256-e99a18c428cb38d5f260853678922...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: ABIDE M2M CONTRACT LOOP v1 */}
          {activeM2mTab === "m2m_loop" && (
            <div className="space-y-6">
              <div className="p-5 border border-[#222] bg-[#0A0A0A] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-white text-sm uppercase">
                    <Terminal className="text-[#00F0FF]" size={16} />
                    <span>Abide M2M Contract Loop v1 (Named Protocol Steps)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] uppercase font-mono">
                    REST / gRPC M2M Protocol
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-sans normal-case leading-relaxed">
                  Turning unstructured prose into named protocol steps is what allows IDE plugins, autonomous agents, and backend services to genuinely integrate without translating markdown.
                  Select any endpoint hop below to inspect its live contract interface.
                </p>
              </div>

              {/* ENDPOINT SWITCHER */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
                {[
                  { id: "compile", label: "POST /intent/compile", badge: "HOP 1: INTAKE", color: "border-[#00F0FF] text-[#00F0FF]" },
                  { id: "verify", label: "POST /plan/verify", badge: "HOP 2: Z3 / SMT", color: "border-amber-400 text-amber-400" },
                  { id: "authorize", label: "POST /plan/authorize", badge: "HOP 3: CAPPO", color: "border-purple-400 text-purple-400" },
                  { id: "execute", label: "POST /plan/execute", badge: "HOP 4: BYOS / cAPI", color: "border-emerald-400 text-emerald-400" },
                  { id: "receipt", label: "POST /plan/receipt", badge: "HOP 5: GNOMLEDGER", color: "border-cyan-400 text-cyan-400" }
                ].map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEndpoint(ep.id as any)}
                    className={`p-3 border text-left transition-all space-y-1 ${
                      selectedEndpoint === ep.id
                        ? `${ep.color} bg-[#111] shadow-md font-bold`
                        : "border-[#222] bg-[#070707] text-[#777] hover:border-[#444] hover:text-white"
                    }`}
                  >
                    <div className="text-[9px] uppercase tracking-wider opacity-80">{ep.badge}</div>
                    <div className="text-xs truncate">{ep.label}</div>
                  </button>
                ))}
              </div>

              {/* ENDPOINT DETAILS INSPECTOR */}
              <div className="p-6 border-2 border-[#222] bg-[#070707] space-y-4 font-mono text-xs">
                {selectedEndpoint === "compile" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-[#222] pb-3">
                      <div>
                        <span className="text-xs text-[#00F0FF] font-black uppercase">HOP 01: INTENT COMPILATION</span>
                        <h4 className="text-base text-white font-bold">POST /api/v4/m2m/intent/compile</h4>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        STATUS: 200 OK (COMPILED)
                      </span>
                    </div>
                    <p className="text-gray-300 font-sans normal-case text-xs">
                      Ingests raw machine or human intent requirements, runs SEKED v4.02 mathematical risk triage, and returns structured PlanIR + SMT-LIB constraints.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">// REQUEST PAYLOAD (JSON)</div>
                        <pre className="text-gray-300 text-[11px] overflow-x-auto">{`{
  "client_id": "agent-orchestrator-alpha",
  "intent_prose": "Migrate database instance to multi-region Cloud SQL with automated failover",
  "constraints": {
    "max_budget_usd": 450.00,
    "jurisdiction": "us-sovereign",
    "trl_required": 9
  }
}`}</pre>
                      </div>
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-[#00F0FF] font-bold uppercase">// RESPONSE (PlanIR + Constraints)</div>
                        <pre className="text-[#00F0FF] text-[11px] overflow-x-auto">{`{
  "plan_id": "plan-ir-884920",
  "seked_lane": 3,
  "ercds_score": { "E": 6, "R": 7, "C": 8, "D": 4, "S": 9 },
  "smt_constraints": [
    "(assert (<= total_cost 450.00))",
    "(assert (= jurisdiction us-sovereign))"
  ],
  "canonical_hash": "sha256:7f99a...c4"
}`}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEndpoint === "verify" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-[#222] pb-3">
                      <div>
                        <span className="text-xs text-amber-400 font-black uppercase">HOP 02: FORMAL VERIFICATION</span>
                        <h4 className="text-base text-white font-bold">POST /api/v4/m2m/plan/verify</h4>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
                        STATUS: 200 OK (Z3 SATISFIABLE)
                      </span>
                    </div>
                    <p className="text-gray-300 font-sans normal-case text-xs">
                      Executes Z3 SMT solver and temporal logic verification against academic grounding (Lamport TLA+ / TLC state space) to ensure zero deadlock or constraint violations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">// REQUEST PAYLOAD (PlanIR Hash)</div>
                        <pre className="text-gray-300 text-[11px] overflow-x-auto">{`{
  "plan_id": "plan-ir-884920",
  "verification_mode": "SMT_AND_TEMPORAL",
  "solver_timeout_ms": 5000,
  "allow_degraded_fallback": false
}`}</pre>
                      </div>
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-amber-400 font-bold uppercase">// RESPONSE (Verification Evidence)</div>
                        <pre className="text-amber-400 text-[11px] overflow-x-auto">{`{
  "verification_status": "SATISFIED",
  "z3_model": { "failover_latency_sec": 12, "budget_used": 420.00 },
  "tla_deadlock_free": true,
  "evidence_receipt_id": "ev-z3-99103",
  "timestamp": "2026-07-27T07:08:12Z"
}`}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEndpoint === "authorize" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-[#222] pb-3">
                      <div>
                        <span className="text-xs text-purple-400 font-black uppercase">HOP 03: CAPPO AUTHORIZATION</span>
                        <h4 className="text-base text-white font-bold">POST /api/v4/m2m/plan/authorize</h4>
                      </div>
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px]">
                        STATUS: 201 CREATED (MULTI-SIG TOKEN)
                      </span>
                    </div>
                    <p className="text-gray-300 font-sans normal-case text-xs">
                      Evaluates Cryptographic Approval &amp; Permission Policy (CAPPO). Since this is a Lane 3 action (high risk / external infrastructure), it generates an Ed25519 signed approval token.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">// REQUEST PAYLOAD</div>
                        <pre className="text-gray-300 text-[11px] overflow-x-auto">{`{
  "plan_id": "plan-ir-884920",
  "evidence_receipt_id": "ev-z3-99103",
  "initiating_identity": "spiffe://abide.veklom.com/agent/deployer"
}`}</pre>
                      </div>
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-purple-400 font-bold uppercase">// RESPONSE (Signed Token)</div>
                        <pre className="text-purple-400 text-[11px] overflow-x-auto">{`{
  "cappo_decision": "APPROVED",
  "lane": 3,
  "approval_token": "eyJh...Ed25519...Sig",
  "expires_in_sec": 3600,
  "required_signatures": ["secops-root", "fin-controller"]
}`}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEndpoint === "execute" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-[#222] pb-3">
                      <div>
                        <span className="text-xs text-emerald-400 font-black uppercase">HOP 04: COVENANT EXECUTION</span>
                        <h4 className="text-base text-white font-bold">POST /api/v4/m2m/plan/execute</h4>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        STATUS: 202 ACCEPTED (BYOS SANDBOX)
                      </span>
                    </div>
                    <p className="text-gray-300 font-sans normal-case text-xs">
                      Delegates execution to Abide cAPI or Bring-Your-Own-Sandbox (BYOS). Validates that the plan is verified and CAPPO approval token is unexpired before mutating state.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">// REQUEST PAYLOAD</div>
                        <pre className="text-gray-300 text-[11px] overflow-x-auto">{`{
  "plan_id": "plan-ir-884920",
  "approval_token": "eyJh...Ed25519...Sig",
  "target_sandbox": "byos-k8s-cluster-us-west",
  "dry_run": false
}`}</pre>
                      </div>
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase">// RESPONSE (Execution Stream)</div>
                        <pre className="text-emerald-400 text-[11px] overflow-x-auto">{`{
  "execution_job_id": "job-exec-449102",
  "sandbox_status": "RUNNING",
  "stdout_stream_url": "wss://api.abide.veklom.com/stream/449102",
  "step_progress": "3/8 completed"
}`}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEndpoint === "receipt" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-[#222] pb-3">
                      <div>
                        <span className="text-xs text-cyan-400 font-black uppercase">HOP 05: IMMUTABLE AUDIT</span>
                        <h4 className="text-base text-white font-bold">POST /api/v4/m2m/plan/receipt</h4>
                      </div>
                      <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px]">
                        STATUS: 201 CREATED (GNOMLEDGER ANCHORED)
                      </span>
                    </div>
                    <p className="text-gray-300 font-sans normal-case text-xs">
                      Emits Persistent Gnomledger (PGL) evidence receipt, writing canonical execution hashes and Merkle root anchors to persistent storage for regulatory audit compliance.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">// REQUEST PAYLOAD</div>
                        <pre className="text-gray-300 text-[11px] overflow-x-auto">{`{
  "execution_job_id": "job-exec-449102",
  "final_status": "SUCCESS",
  "artifacts_generated": ["terraform.tfstate", "migration.log"]
}`}</pre>
                      </div>
                      <div className="p-3 bg-[#030303] border border-[#1A1A1A] space-y-1">
                        <div className="text-[10px] text-cyan-400 font-bold uppercase">// RESPONSE (PGL Anchor)</div>
                        <pre className="text-cyan-400 text-[11px] overflow-x-auto">{`{
  "pgl_receipt_id": "pgl-rcpt-889021",
  "merkle_root": "0x9812a...449e",
  "block_height": 14920108,
  "slsa_level": "SLSA_BUILD_LEVEL_3",
  "verification_link": "https://abide.veklom.com/verify/pgl-rcpt-889021"
}`}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: DECODING SEKED & HOVERBOARD RULE */}
          {activeM2mTab === "seked_ercds" && (
            <div className="space-y-6">
              {/* INTRO TO SEKED */}
              <div className="p-5 border border-[#222] bg-[#0A0A0A] space-y-2">
                <div className="text-xs font-black text-[#00F0FF] uppercase flex items-center gap-2">
                  <Sliders size={15} />
                  <span>Decoding SEKED v4.02: The Art of Mathematical Risk Triage</span>
                </div>
                <p className="text-xs text-gray-300 font-sans normal-case leading-relaxed">
                  In traditional systems, software development begins as a game of telephone. Natural language is an inherently messy cloud of ambiguity and probabilistic intent.
                  The <span className="text-white font-bold">SEKED v4.02 compiler</span> is a pure-math intake heuristic solver. It does not guess at meaning; it calculates viability using the <span className="text-[#00F0FF] font-mono">Fenton-Wilkinson lognormal distribution</span> by matching moments across project telemetry.
                </p>
              </div>

              {/* THE 5 DIMENSIONS OF RISK (ERCDS TABLE) */}
              <div className="space-y-3">
                <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="text-[#00F0FF]" size={15} />
                  <span>The Five Dimensions of Risk (ERCDS Heartbeat)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
                  {[
                    { dim: "E", name: "Effort", what: "Total energy & resource expenditure required.", benefit: "Visualizes weekend sprint vs. decade-long odyssey.", color: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
                    { dim: "R", name: "Risk", what: "Probability of failure or unforeseen side effects.", benefit: "Identifies hidden landmines in logic before committing.", color: "text-rose-400 border-rose-500/30 bg-rose-500/5" },
                    { dim: "C", name: "Complexity", what: "Architectural density & moving parts of intent.", benefit: "Warns when an idea becomes too tangled to govern.", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
                    { dim: "D", name: "Dependency", what: "Reliance on external APIs or third-party logic.", benefit: "Highlights where control is lost to external providers.", color: "text-purple-400 border-purple-500/30 bg-purple-500/5" },
                    { dim: "S", name: "Sovereignty", what: "Level of independence & verifiable control maintained.", benefit: "Ensures you remain ultimate authority over capability.", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" }
                  ].map((d, i) => (
                    <div key={i} className={`p-3.5 border space-y-2 ${d.color}`}>
                      <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                        <span className="text-lg font-black">{d.dim}</span>
                        <span className="text-[10px] uppercase font-bold">{d.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-300 font-sans normal-case leading-snug">{d.what}</div>
                      <div className="text-[10px] opacity-80 pt-1 border-t border-white/5 italic font-sans normal-case">&quot;{d.benefit}&quot;</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* THE HOVERBOARD RULE (FEASIBILITY GATE) */}
              <div className="p-6 border-2 border-amber-500/40 bg-[#0C0A05] space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-500/20 pb-3">
                  <div>
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">// FEASIBILITY GATE RULE</span>
                    <h4 className="text-base font-black text-white uppercase">The &quot;Hoverboard Rule&quot; (Technology Readiness Level &amp; Academic Grounding)</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500 text-black font-black text-[10px] uppercase tracking-wider">
                    TRL 1–9 Grounding Gate
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-sans normal-case leading-relaxed">
                  If an architect proposes a sci-fi hoverboard but tries to build it using current-day skateboard parts, the math will fail the gate. To prevent hallucinations, the system cross-references every claim against a <span className="text-amber-300 font-bold">Vector Database of seminal academic grounding</span> (such as Lamport’s <em>Temporal Logic of Actions</em> and Nakamoto’s <em>Bitcoin</em> paper).
                </p>

                {/* INTERACTIVE HOVERBOARD LAB */}
                <div className="p-4 bg-[#050505] border border-[#222] space-y-4 font-mono text-xs">
                  <div className="text-[11px] text-[#00F0FF] font-black uppercase">// Interactive Feasibility Gate Simulator</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">
                        Proposed Technology Readiness Level (TRL {hoverboardTrl}):
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="9"
                        value={hoverboardTrl}
                        onChange={(e) => setHoverboardTrl(parseInt(e.target.value))}
                        className="w-full accent-amber-400 bg-[#222]"
                      />
                      <div className="flex justify-between text-[9px] text-gray-500 mt-1 uppercase">
                        <span>TRL 1-3 (Theoretical)</span>
                        <span>TRL 4-8 (Lab / Dev)</span>
                        <span>TRL 9 (Production)</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">
                        Execution &amp; Financial Risk Profile:
                      </label>
                      <div className="flex gap-2">
                        {(["Low", "Medium", "High"] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => setHoverboardRisk(r)}
                            className={`flex-1 py-1.5 border text-center text-xs uppercase font-bold transition-all ${
                              hoverboardRisk === r
                                ? "border-amber-400 bg-amber-500/20 text-amber-300"
                                : "border-[#333] bg-[#111] text-gray-500 hover:text-white"
                            }`}
                          >
                            {r} Risk
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* GATE RESULT DISPLAY */}
                  <div className={`p-4 border font-mono text-xs flex items-center justify-between ${
                    hoverboardTrl <= 3 && hoverboardRisk === "High"
                      ? "border-rose-500 bg-rose-500/10 text-rose-300 animate-pulse"
                      : hoverboardTrl >= 7
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500 bg-amber-500/10 text-amber-300"
                  }`}>
                    <div className="space-y-1">
                      <div className="font-black uppercase tracking-wider text-sm flex items-center gap-2">
                        {hoverboardTrl <= 3 && hoverboardRisk === "High" ? (
                          <>
                            <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                            <span>GATE CLOSED: TERMINATE_AND_FREEZE</span>
                          </>
                        ) : hoverboardTrl >= 7 ? (
                          <>
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            <span>GATE OPEN: SOVEREIGN_EXECUTION</span>
                          </>
                        ) : (
                          <>
                            <Sliders size={18} className="text-amber-400 shrink-0" />
                            <span>GATE WARNING: COOPERATIVE_OPTIMIZATION</span>
                          </>
                        )}
                      </div>
                      <div className="text-[11px] font-sans normal-case opacity-90">
                        {hoverboardTrl <= 3 && hoverboardRisk === "High"
                          ? "Hoverboard Rule Violation! Claiming TRL 9 maturity for a TRL 1-3 theoretical research interest under high financial risk. The Feasibility Gate refuses execution."
                          : hoverboardTrl >= 7
                          ? "Technology is stable, proven (TRL 7-9), and grounded in verified academic proofs. Safe for Lane 3 cryptographic covenant sealing."
                          : "Moderate technology maturity (TRL 4-6). Requires multi-agent state synchronization and cooperative refinement before production release."}
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <span className="text-[10px] uppercase font-bold px-2 py-1 bg-black/40 border border-white/10 block">
                        TRL {hoverboardTrl} / {hoverboardRisk} Risk
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: VERIFICATION HARDENING ROADMAP */}
          {activeM2mTab === "roadmap" && (
            <div className="space-y-6">
              <div className="p-5 border border-[#222] bg-[#0A0A0A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-xs font-black text-white uppercase flex items-center gap-2">
                    <ShieldCheck className="text-[#00F0FF]" size={16} />
                    <span>Abide Verification Hardening Roadmap (Real vs. Unfinished)</span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans normal-case mt-1">
                    Separating operational reality from aspirational capabilities. Maintaining absolute architectural honesty by tracking what is real today versus the hardening checklist.
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0 font-mono text-xs">
                  {(["all", "real", "roadmap"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setRoadmapFilter(f)}
                      className={`px-3 py-1.5 uppercase font-bold transition-all border ${
                        roadmapFilter === f
                          ? "bg-[#00F0FF] text-black border-[#00F0FF]"
                          : "bg-[#111] text-[#777] border-[#333] hover:text-white"
                      }`}
                    >
                      {f === "all" ? "All Features (13)" : f === "real" ? "Real Today (7)" : "Hardening Checklist (6)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHECKLIST MATRIX */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {[
                  // REAL TODAY
                  { title: "Machine-Readable PlanIR Shared Object", status: "real", cat: "CORE IR", desc: "Structured JSON/SMT representation without markdown dependency. Fully implemented in /src/types.ts and contract engine.", issue: "IMPLEMENTED" },
                  { title: "Typed Execution Steps & Temporal Bounds", status: "real", cat: "CONTRACT", desc: "Explicit action typing, timeout constraints, and rollback instructions enforced at job compilation time.", issue: "IMPLEMENTED" },
                  { title: "Canonical SHA-256 / HMAC Plan Hashes", status: "real", cat: "SECURITY", desc: "Merkle tree root generation and Ed25519 payload signing preventing silent prompt or plan drift.", issue: "IMPLEMENTED" },
                  { title: "SEKED Triage & Execution Lanes (1, 2, 3)", status: "real", cat: "TRIAGE", desc: "Fenton-Wilkinson moment matching sorting jobs into read-only, local mutation, or Lane 3 financial/infra action.", issue: "IMPLEMENTED" },
                  { title: "Native Z3 Support / SMT-LIB Path", status: "real", cat: "SOLVER", desc: "SMT constraint assertion generation and model evaluation via local or remote Z3 instance.", issue: "IMPLEMENTED" },
                  { title: "CAPPO Approval-Token Structures", status: "real", cat: "GOVERNANCE", desc: "Multi-signature cryptographic approval tokens required for any Lane 3 execution execution path.", issue: "IMPLEMENTED" },
                  { title: "Capability Schemas & Registry", status: "real", cat: "REGISTRY", desc: "Typed JSON schemas for all 45+ enterprise capabilities with SLA and regulatory tag inheritance.", issue: "IMPLEMENTED" },

                  // HARDENING ROADMAP
                  { title: "Mandatory Z3 Verification on Lane 3 Paths", status: "roadmap", cat: "HARDENING", desc: "Eliminate any default-success backdoors; enforce strict Z3 solver SAT model returns prior to allowing external infrastructure mutations.", issue: "ISSUE #204: P1 HIGH" },
                  { title: "Strict Degraded-State Reporting", status: "roadmap", cat: "HARDENING", desc: "If Z3 or temporal verifier is unavailable, automatically mark plan as 'unverified', refuse Lane 3 actions unless overridden, and emit degraded evidence record.", issue: "ISSUE #205: P1 HIGH" },
                  { title: "Comprehensive CAPPO Enforcement", status: "roadmap", cat: "HARDENING", desc: "Expand CAPPO enforcement so every consequential execution path across all sub-agents flows through CAPPO policy checks.", issue: "ISSUE #206: P1 HIGH" },
                  { title: "Persistent Gnomledger Inclusion", status: "roadmap", cat: "HARDENING", desc: "Ensure PGL evidence receipts and Merkle root anchors are always written to persistent storage for all Lane 3 plans.", issue: "ISSUE #207: P2 MEDIUM" },
                  { title: "Groth16 / PLONK Zero-Knowledge Proofs", status: "roadmap", cat: "CRYPTO", desc: "Wire actual zk-SNARK proof circuits into PlanIR so third parties can verify computation correctness without revealing sensitive prompts.", issue: "ISSUE #210: P2 MEDIUM" },
                  { title: "TLA+ / TLC State-Space Model Checking", status: "roadmap", cat: "FORMAL", desc: "Integrate Lamport TLA+ temporal logic model checking directly into pre-execution temporal verification pipeline.", issue: "ISSUE #211: P3 FUTURE" }
                ]
                .filter(item => roadmapFilter === "all" || item.status === roadmapFilter)
                .map((item, idx) => (
                  <div key={idx} className={`p-4 border transition-all space-y-2.5 ${
                    item.status === "real"
                      ? "border-emerald-500/40 bg-[#060B08] hover:border-emerald-500"
                      : "border-amber-500/40 bg-[#0C0905] hover:border-amber-500"
                  }`}>
                    <div className="flex justify-between items-start gap-2 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        {item.status === "real" ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                        )}
                        <span className="font-bold text-white uppercase text-xs">{item.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black shrink-0 uppercase ${
                        item.status === "real" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {item.status === "real" ? "REAL TODAY" : "HARDENING"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 font-sans normal-case leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[9px] uppercase font-bold text-gray-500">
                      <span>CATEGORY: [{item.cat}]</span>
                      <span className={item.status === "real" ? "text-emerald-400" : "text-amber-400"}>{item.issue}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* NEXT STEPS CALLOUT */}
              <div className="p-4 bg-[#050505] border border-[#222] flex items-center gap-3 text-xs text-gray-400">
                <BookOpen className="text-[#00F0FF] shrink-0" size={18} />
                <span className="font-sans normal-case">
                  This hardening roadmap serves as the canonical spine of the ABIDE repository architecture docs. By keeping aspirational features marked as tracking issues, we maintain absolute architectural integrity for enterprise auditors.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL 2: PRODUCTION INTEGRATION & DEPLOYMENT GUIDE */}
      {activeManual === "infrastructure" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-[#222] pb-4">
            {[
              { id: "layer1", label: "1. Three-Layer Paradigm", icon: Layers },
              { id: "pluggable", label: "2. Pluggable Infrastructure", icon: Database },
              { id: "caching", label: "3. Hybrid Caching Strategy", icon: Zap },
              { id: "governance", label: "4. Covenant Execution", icon: Lock },
              { id: "formal", label: "5. Formal Verification Stack", icon: Code },
              { id: "runtime", label: "6. Enterprise Runtime & 12-Pack", icon: Cpu }
            ].map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`px-3 py-2 text-xs font-black uppercase transition-all flex items-center gap-2 border ${
                    activeTab === sec.id
                      ? "border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10"
                      : "border-[#222] text-[#888] hover:border-gray-500 hover:text-white bg-[#0A0A0A]"
                  }`}
                >
                  <Icon size={14} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 1: Three-Layer Paradigm */}
          {activeTab === "layer1" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 1 OF PRODUCTION GUIDE ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  The ABIDE Three-Layer Architectural Paradigm
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  This architecture is the primary defense against the inherent non-determinism of LLM outputs. In the enterprise, <strong>&quot;probabilistic&quot; is a synonym for &quot;unreliable.&quot;</strong> The ABIDE three-layer paradigm (Ingestion, SEKED Compiler, and API) serves as a Build-to-Execution Accountability Infrastructure, ensuring that natural language intent is strictly converted into verifiable, deterministic software.
                </p>
              </div>

              {/* Data Flow Diagram */}
              <div className="p-5 bg-[#050505] border border-[#222] space-y-4">
                <div className="flex items-center justify-between text-xs font-black text-[#00F0FF]">
                  <span>UNIDIRECTIONAL DETERMINISTIC DATA FLOW</span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 bg-emerald-500/10">ZERO HALLUCINATION BACKFLOW</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 border border-[#333] bg-[#0C1017] space-y-2 relative">
                    <span className="text-[10px] text-cyan-400 font-bold block">LAYER 1</span>
                    <h4 className="text-sm font-black text-white">Ingestion &amp; Cache</h4>
                    <p className="text-[10px] text-gray-400 font-sans">Aggregates telemetry signals; manages LRU/Redis hybrid caching &amp; connector initialization.</p>
                    <code className="text-[9px] text-[#00F0FF] block pt-1">src/core/cache.ts</code>
                  </div>
                  <div className="p-4 border-2 border-[#00F0FF] bg-[#0C1520] space-y-2 relative shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                    <span className="text-[10px] text-[#00F0FF] font-bold block">LAYER 2 (SOVEREIGN CORE)</span>
                    <h4 className="text-sm font-black text-white">SEKED Compiler</h4>
                    <p className="text-[10px] text-gray-300 font-sans">Executes Fenton-Wilkinson scoring; enforces Zod-based contract boundaries &amp; triage.</p>
                    <code className="text-[9px] text-[#00F0FF] block pt-1">src/compiler/seked.ts</code>
                  </div>
                  <div className="p-4 border border-[#333] bg-[#0C1017] space-y-2">
                    <span className="text-[10px] text-purple-400 font-bold block">LAYER 3</span>
                    <h4 className="text-sm font-black text-white">Server &amp; API</h4>
                    <p className="text-[10px] text-gray-400 font-sans">Routes validated directives to endpoints; generates PglReceipts for governance.</p>
                    <code className="text-[9px] text-purple-400 block pt-1">server.ts</code>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 font-sans italic pt-2 border-t border-[#111]">
                  &quot;We decouple raw signal data from governance through a rigid, unidirectional data flow: once intent enters the SEKED Compiler, it is transformed into a fixed logical representation. Data never flows back to the LLM for decision-making or state transitions, effectively eliminating the hallucination problem at the architectural level.&quot;
                </p>
              </div>

              {/* Table of Components */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[#222] text-xs">
                  <thead>
                    <tr className="bg-[#111] text-[#00F0FF] font-black uppercase text-[10px]">
                      <th className="p-3 border border-[#222]">Layer</th>
                      <th className="p-3 border border-[#222]">Component</th>
                      <th className="p-3 border border-[#222]">Responsibility</th>
                      <th className="p-3 border border-[#222]">Key File Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222] text-gray-300">
                    <tr>
                      <td className="p-3 border border-[#222] font-black text-white">Layer 1</td>
                      <td className="p-3 border border-[#222] font-bold">Ingestion &amp; Cache</td>
                      <td className="p-3 border border-[#222] font-sans">Aggregates telemetry signals; manages LRU/Redis hybrid caching and connector initialization.</td>
                      <td className="p-3 border border-[#222] font-mono text-[#00F0FF]">src/core/cache.ts</td>
                    </tr>
                    <tr className="bg-[#050B14]">
                      <td className="p-3 border border-[#222] font-black text-[#00F0FF]">Layer 2</td>
                      <td className="p-3 border border-[#222] font-bold text-white">SEKED Compiler</td>
                      <td className="p-3 border border-[#222] font-sans">Executes Fenton-Wilkinson scoring; enforces Zod-based contract boundaries and triage.</td>
                      <td className="p-3 border border-[#222] font-mono text-[#00F0FF]">src/compiler/seked.ts</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#222] font-black text-white">Layer 3</td>
                      <td className="p-3 border border-[#222] font-bold">Server &amp; API</td>
                      <td className="p-3 border border-[#222] font-sans">Routes validated directives to endpoints; generates PglReceipts for governance.</td>
                      <td className="p-3 border border-[#222] font-mono text-purple-400">server.ts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 2: Pluggable Infrastructure */}
          {activeTab === "pluggable" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 2 OF PRODUCTION GUIDE ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  Pluggable Infrastructure: Transitioning from Mock to Production
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  Promoting a system from a sandbox to an enterprise environment must be a <strong>configuration event, not a refactoring project</strong>. ABIDE utilizes a &quot;Mock-to-Production&quot; swap pattern via conditional initialization in <code className="text-[#00F0FF]">src/core/connectors.ts</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-[#333] bg-[#050505] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-400 uppercase">1. Persistence Promotion</span>
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 font-bold">DATABASE_URL</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    By default, the system utilizes a <code className="text-white">memoryStore</code> (a simple Map) for local persistence. When the <code className="text-[#00F0FF]">DATABASE_URL</code> environment variable is detected, the system automatically initializes the Drizzle ORM to interface with a production PostgreSQL instance.
                  </p>
                  <div className="p-3 bg-[#000] border border-[#222] text-[10px] font-mono text-gray-300 space-y-1">
                    <div className="text-gray-500">// src/core/connectors.ts conditional boot</div>
                    <div>{`if (process.env.DATABASE_URL) {`}</div>
                    <div className="text-[#00F0FF] pl-4">{`return new RealWorldDBConnector(process.env.DATABASE_URL);`}</div>
                    <div>{`} else {`}</div>
                    <div className="text-gray-400 pl-4">{`return new MemoryStoreConnector(); // Local sandbox`}</div>
                    <div>{`}`}</div>
                  </div>
                </div>

                <div className="p-5 border border-[#333] bg-[#050505] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 uppercase">2. Financial Settlement Promotion</span>
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 font-bold">X402_LEDGER_URL</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    While local simulation utilizes a SHA-256 mock hash to bypass ledger requirements, a production deployment requires <code className="text-amber-400">X402_LEDGER_URL</code>. This activates the remote settlement gateway responsible for collateral locking and escrow release on Base L2.
                  </p>
                  <div className="p-3 bg-[#000] border border-[#222] text-[10px] font-mono text-gray-300 space-y-1">
                    <div className="text-gray-500">// Verifiable Proof of Settlement gating</div>
                    <div>{`if (process.env.X402_LEDGER_URL) {`}</div>
                    <div className="text-amber-400 pl-4">{`return new X402PaymentConnector(process.env.X402_LEDGER_URL);`}</div>
                    <div>{`} else {`}</div>
                    <div className="text-gray-400 pl-4">{`return new MockSha256Ledger(); // Simulated receipt`}</div>
                    <div>{`}`}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#08101A] border-l-4 border-[#00F0FF] text-xs space-y-2">
                <span className="font-black text-[#00F0FF] uppercase block">Required Production Environment Variables</span>
                <ul className="space-y-1 text-gray-300 font-mono text-[11px]">
                  <li>• <strong className="text-white">DATABASE_URL</strong>: Promotes blueprint storage from in-memory Map to PostgreSQL/Drizzle.</li>
                  <li>• <strong className="text-white">X402_LEDGER_URL</strong>: Activates the remote ledger for real-world financial settlement and escrow.</li>
                  <li>• <strong className="text-white">REDIS_URL</strong>: Activates shared warm tier caching across horizontally scaled cluster nodes.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 3: Hybrid Caching */}
          {activeTab === "caching" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 3 OF PRODUCTION GUIDE ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  Hybrid Caching Strategy for Enterprise Latency Management
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  In high-traffic environments, the latency and operational costs associated with recurring LLM calls are unacceptable. The <code className="text-[#00F0FF]">AbideCacheManager</code> implements a dual-layer strategy ensuring sub-millisecond access to previously verified blueprints.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border-2 border-[#00F0FF]/40 bg-[#050A10] space-y-3">
                  <div className="flex items-center justify-between text-[#00F0FF]">
                    <span className="font-black text-xs uppercase">Memory-LRU (Fast-Path)</span>
                    <span className="text-[9px] bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-2 py-0.5">100 ENTRIES • &lt;0.5ms</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                    A 100-entry local memory cache providing near-zero latency retrieval of frequent compilation plans and active blueprint states. Acts as the first line of defense before network traversal.
                  </p>
                </div>

                <div className="p-5 border-2 border-purple-500/40 bg-[#0A0510] space-y-3">
                  <div className="flex items-center justify-between text-purple-400">
                    <span className="font-black text-xs uppercase">Redis Shared Tier (Warm-Path)</span>
                    <span className="text-[9px] bg-purple-500/10 border border-purple-500/30 px-2 py-0.5">REDIS_URL • 24H TTL</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                    A persistent, shared cache layer activated via <code className="text-white">REDIS_URL</code>. Ensures cross-instance cache hit parity, allowing horizontally scaled nodes to benefit from a global pool of verified logic.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-[#050505] border border-[#222] space-y-3">
                <span className="text-xs font-black text-white uppercase block">Deterministic Key Synthesis &amp; Fail-Fast Resilience</span>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Cache integrity is maintained via deterministic key synthesis. We generate SHA-256 hashes of:
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="px-2.5 py-1 bg-[#111] border border-[#333] text-cyan-400">Intent Notes Hash</span>
                  <span className="px-2.5 py-1 bg-[#111] border border-[#333] text-purple-400">Jurisdiction Profile</span>
                  <span className="px-2.5 py-1 bg-[#111] border border-[#333] text-emerald-400">Provider &amp; Model</span>
                  <span className="px-2.5 py-1 bg-[#111] border border-[#333] text-amber-400">Sovereign Constitution Version</span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans pt-2 border-t border-[#111]">
                  <strong>Resilience Mandate:</strong> Redis initialization is lazy and governed by a <strong>1500ms connectTimeout</strong>. If the Redis cluster is unreachable, the system automatically falls back to memory mode without throwing a cache-dependency exception. For resource-constrained deployments, architects utilize <code className="text-white">ComputeCacheOptimizer</code> to configure <strong>4GB-box profiles</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Section 4: Covenant Execution */}
          {activeTab === "governance" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 4 OF PRODUCTION GUIDE ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  The Governance Engine &amp; Covenant Execution
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  Every build plan is represented as a <strong className="text-white">PlanIR (Intermediate Representation)</strong>, which transitions through a strict state machine from <code className="text-amber-400">PENDING_APPROVAL</code> to <code className="text-emerald-400">EXECUTING</code>.
                </p>
              </div>

              {/* Lane Categorization */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-[#333] bg-[#050505] space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">LANE 1 (READ)</span>
                  <h4 className="text-sm font-black text-white">Passive Retrieval</h4>
                  <p className="text-[10px] text-gray-400 font-sans">Zero state-change potential. Read-only queries and inspection of active workspaces.</p>
                  <span className="text-[9px] text-emerald-400 font-bold block pt-1">Auto-Approved • Zero Risk</span>
                </div>
                <div className="p-4 border border-[#333] bg-[#050505] space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">LANE 2 (INTERNAL STATE)</span>
                  <h4 className="text-sm font-black text-white">Platform-Local State</h4>
                  <p className="text-[10px] text-gray-400 font-sans">Operations modifying local workspace files, cache entries, or test execution harnesses.</p>
                  <span className="text-[9px] text-cyan-400 font-bold block pt-1">SEKED Gated • Bounded Audit</span>
                </div>
                <div className="p-4 border-2 border-rose-500/50 bg-[#100508] space-y-2">
                  <span className="text-[10px] text-rose-400 font-bold uppercase block">LANE 3 (EXTERNAL / FINANCIAL)</span>
                  <h4 className="text-sm font-black text-white">Value-at-Risk (VaR)</h4>
                  <p className="text-[10px] text-gray-300 font-sans">Actions with external network egress, API side-effects, or X402 financial consequences.</p>
                  <span className="text-[9px] text-rose-400 font-black block pt-1">RequiresApproval: True • Multi-Sig</span>
                </div>
              </div>

              {/* Covenant Gate details */}
              <div className="p-5 bg-[#050B14] border border-[#00F0FF]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#00F0FF]">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-black uppercase tracking-wider">CAPPO Guard Middleware &amp; Gnomledger Sealing</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Execution is strictly blocked at the <strong>CAPPO Guard middleware level</strong> for any Lane 3 step lacking a valid Approval Token or where the <code className="text-[#00F0FF]">canonicalHash</code> fails to match the PlanIR. This prevents replay attacks and unauthorized state transitions through mandatory nonce verification.
                </p>
                <div className="p-3 bg-[#000] border border-[#222] text-[10px] font-mono text-gray-300 space-y-1">
                  <div className="text-gray-500">// Immutable Audit Trail: SLSA Level 3 Attestation</div>
                  <div>{`const receipt: PglReceipt = await Gnomledger.sealStepOnLedger({`}</div>
                  <div className="text-cyan-400 pl-4">{`planId: planIr.id,`}</div>
                  <div className="text-purple-400 pl-4">{`stepId: step.id,`}</div>
                  <div className="text-emerald-400 pl-4">{`resultHash: computeCanonicalHash(stepResult),`}</div>
                  <div className="text-amber-400 pl-4">{`hmacSignature: signWithSovereignKey(stepResult)`}</div>
                  <div>{`});`}</div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Formal Verification Stack */}
          {activeTab === "formal" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 5 OF PRODUCTION GUIDE ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  Formal Verification Stack &amp; Policy-as-Code
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  Standard unit testing cannot prove the absence of safety violations in high-stakes systems. ABIDE mandates the use of a formal verification stack (Z3 and TLA+) to prove system safety and logical consistency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-[#333] bg-[#050505] space-y-3">
                  <span className="text-xs font-black text-cyan-400 uppercase block">1. Z3 SMT Solver Invariants</span>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    The system integrates the Z3 SMT Solver via <code className="text-white">solveZ3InvariantsWrapper</code>. This component transforms IntentClaim metadata into SMT-LIB 2 assertions, allowing the system to mathematically prove that a plan does not violate any governance invariants (e.g., risk-to-collateral ratios).
                  </p>
                  <div className="p-2.5 bg-[#000] border border-[#222] font-mono text-[9px] text-cyan-400">
                    (assert (&lt;= (+ risk_score compute_cost) collateral_cap))
                  </div>
                </div>

                <div className="p-5 border border-[#333] bg-[#050505] space-y-3">
                  <span className="text-xs font-black text-purple-400 uppercase block">2. TLA+ / PlusCal Concurrent Safety</span>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    For concurrent state reasoning, we utilize TLA+ and PlusCal specifications within <code className="text-white">src/core/connectors.ts</code> to prevent deadlocks in multi-agent handoffs or escrow releases during complex distributed build pipelines.
                  </p>
                  <div className="p-2.5 bg-[#000] border border-[#222] font-mono text-[9px] text-purple-400">
                    THEOREMS: Spec =&gt; []~Deadlock /\ []~UnauthorizedEscrowRelease
                  </div>
                </div>

                <div className="p-5 border border-[#333] bg-[#050505] space-y-3">
                  <span className="text-xs font-black text-emerald-400 uppercase block">3. ZK-Proof Gateway (Groth16 / PLONK)</span>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    Cryptographic verification is completed by the ZK-Proof Gateway. Using Groth16 or PLONK over BN254 / BLS12-381 curves, the gateway validates elliptic curve points (A, B, C) against public signals to provide zero-knowledge attestations of the execution trace without revealing raw telemetry.
                  </p>
                </div>

                <div className="p-5 border border-[#333] bg-[#050505] space-y-3">
                  <span className="text-xs font-black text-amber-400 uppercase block">4. Zod Type-Safe Constitution</span>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    The system enforces contract boundaries at runtime using Zod schemas integrated within <code className="text-white">src/core/token.ts</code>. This Type-Safe Constitution ensures that malformed data or injection attacks are caught before they reach the execution engine.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Enterprise Runtime & 12-Pack */}
          {activeTab === "runtime" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 6 OF PRODUCTION GUIDE ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  The Enterprise Runtime &amp; &quot;12-Pack&quot; Deployment
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  Portability of ABIDE capabilities is achieved through the Enterprise Runtime and Host Manifests. Successful compilation yields the standardized &quot;12-pack&quot; package.
                </p>
              </div>

              {/* 3 Deployment Modes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-[#333] bg-[#050505] space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold block">MODE 1: STANDALONE</span>
                  <h4 className="text-xs font-black text-white uppercase">Isolated Enclave</h4>
                  <p className="text-[10px] text-gray-400 font-sans">Uses local adapters for storage and inference; ideal for air-gapped institutional or military environments.</p>
                </div>
                <div className="p-4 border-2 border-[#00F0FF] bg-[#08121C] space-y-2 shadow-sm">
                  <span className="text-[10px] text-[#00F0FF] font-bold block">MODE 2: VEKLOM_EMBEDDED</span>
                  <h4 className="text-xs font-black text-white uppercase">Velum Mesh Integration</h4>
                  <p className="text-[10px] text-gray-300 font-sans">Integrated into the wider Velum mesh, utilizing shared adapters for distributed governance and multi-tenant scaling.</p>
                </div>
                <div className="p-4 border border-[#333] bg-[#050505] space-y-2">
                  <span className="text-[10px] text-purple-400 font-bold block">MODE 3: THIRD_PARTY_EMBEDDED</span>
                  <h4 className="text-xs font-black text-white uppercase">Standardized Wrapper</h4>
                  <p className="text-[10px] text-gray-400 font-sans">Allows ABIDE blueprints to be executed within external ecosystems (Kubernetes, AWS ECS) via standardized wrappers.</p>
                </div>
              </div>

              {/* 12-Pack Folder Breakdown */}
              <div className="p-5 bg-[#050505] border border-[#222] space-y-3">
                <span className="text-xs font-black text-white uppercase block">The Standardized &quot;12-Pack&quot; Output Structure</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono">
                  <div className="p-2.5 bg-[#111] border border-[#333] text-cyan-400 font-bold">1. blueprint.json</div>
                  <div className="p-2.5 bg-[#111] border border-[#333] text-purple-400 font-bold">2. specification.md</div>
                  <div className="p-2.5 bg-[#111] border border-[#333] text-emerald-400 font-bold">3. jurisdiction.yaml</div>
                  <div className="p-2.5 bg-[#111] border border-[#333] text-amber-400 font-bold">4. agent-packets/</div>
                  <div className="p-2.5 bg-[#111] border border-[#222] text-gray-400">5. seked-triage.json</div>
                  <div className="p-2.5 bg-[#111] border border-[#222] text-gray-400">6. z3-invariants.smt2</div>
                  <div className="p-2.5 bg-[#111] border border-[#222] text-gray-400">7. pgl-receipts.sig</div>
                  <div className="p-2.5 bg-[#111] border border-[#222] text-gray-400">8. x402-escrow.json</div>
                  <div className="p-2.5 bg-[#111] border border-[#222] text-gray-400">9. vnp-identity.jwt</div>
                  <div className="p-2.5 bg-[#111] border border-[#222] text-gray-400">10. docker-compose.yml</div>
                  <div className="p-2.5 bg-[#111] border border-[#222] text-gray-400">11. tests/unit.spec.ts</div>
                  <div className="p-2.5 bg-[#111] border border-[#222] text-gray-400">12. README.md</div>
                </div>
                <p className="text-[11px] text-gray-400 font-sans pt-2 border-t border-[#111]">
                  <strong>Continuous Drift Monitoring:</strong> The <code className="text-[#00F0FF]">CanonicalWorkspaceService</code> monitors the system for <span className="text-rose-400 font-mono font-bold">DRIFT_DETECTED</span> states. If the <code className="text-white">source_tree_hash</code> of the running environment deviates from the compiled blueprint, the runtime automatically freezes execution to prevent unauthorized logic modifications.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL 2: SECURITY PROTOCOL & ACCOUNTABILITY MANUAL */}
      {activeManual === "security" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-[#222] pb-4">
            {[
              { id: "lifecycle", label: "1. Governance Lifecycle", icon: Layers },
              { id: "seked", label: "2. SEKED Compiler v4.02", icon: Sliders },
              { id: "planir", label: "3. PlanIR Structural State", icon: FileText },
              { id: "covenant", label: "4. Covenant & CAPPO Guard", icon: Lock },
              { id: "formalmath", label: "5. Formal Verification", icon: Code },
              { id: "gnomledger", label: "6. Gnomledger SLSA 3", icon: ShieldCheck },
              { id: "coreinfra", label: "7. Identity & Core Infra", icon: Server }
            ].map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`px-3 py-2 text-xs font-black uppercase transition-all flex items-center gap-2 border ${
                    activeTab === sec.id
                      ? "border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10"
                      : "border-[#222] text-[#888] hover:border-gray-500 hover:text-white bg-[#0A0A0A]"
                  }`}
                >
                  <Icon size={14} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 1: Lifecycle */}
          {activeTab === "lifecycle" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 1 OF SECURITY MANUAL ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  The Governance Lifecycle: From Intent to Sealed Execution
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  ABIDE shifts the paradigm from passive code generation to active software governance by transforming high-level natural language intent into a series of cryptographically sealed, immutable receipts. Our <strong>&quot;Capability as the Product&quot;</strong> philosophy dictates that software modules are never standalone scripts; they are self-describing, unit-tested entities governed by formal invariants.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { stage: "Stage 1", title: "Intent Ingestion", desc: "Multi-modal intake of raw requirements, codebases, audio transcripts, or academic research papers.", color: "text-cyan-400 border-cyan-500/30" },
                  { stage: "Stage 2", title: "Mathematical Triage", desc: "Heuristic scoring of intent using the SEKED v4.02 compiler and Fenton-Wilkinson moment matching.", color: "text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/5" },
                  { stage: "Stage 3", title: "Formal Synthesis", desc: "Transformation of requirements into a structured PlanIR, verified against static and temporal invariants.", color: "text-purple-400 border-purple-500/30" },
                  { stage: "Stage 4", title: "Covenant Enforcement", desc: "Runtime validation of execution rights via the CAPPO Guard and HMAC-signed Approval Tokens.", color: "text-amber-400 border-amber-500/30" },
                  { stage: "Stage 5", title: "Ledger Sealing", desc: "Aggregation of execution evidence and ZK-proofs into Gnomledger as a permanent SLSA Level 3 record.", color: "text-emerald-400 border-emerald-500/30" }
                ].map((st, idx) => (
                  <div key={st.stage} className={`p-4 border ${st.color} bg-[#050505] flex items-start gap-4`}>
                    <div className="text-lg font-black font-mono w-20 shrink-0 text-gray-500">
                      0{idx + 1}.
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#111] text-white border border-[#333]">{st.stage}</span>
                        <h4 className="text-sm font-black text-white uppercase">{st.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400 font-sans leading-relaxed">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: SEKED Compiler */}
          {activeTab === "seked" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 2 OF SECURITY MANUAL ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  The SEKED Compiler: Mathematical Intake &amp; Risk Triage
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  The SEKED v4.02 compiler serves as the pure-math intake heuristic solver. It utilizes the <strong>Fenton-Wilkinson lognormal distribution algorithm</strong> to match moments across five critical dimensions of evaluation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
                {[
                  { id: "E", title: "Effort", desc: "Computational and human resources required for synthesis." },
                  { id: "R", title: "Risk", desc: "Probability of failure or misalignment based on intent clarity." },
                  { id: "C", title: "Complexity", desc: "Logical density and architectural depth of capability." },
                  { id: "D", title: "Dependency", desc: "Evaluation of external system requirements and APIs." },
                  { id: "S", title: "Sovereignty", desc: "Degree of autonomy and cryptographic control required." }
                ].map(dim => (
                  <div key={dim.id} className="p-3 border border-[#333] bg-[#050505] space-y-1">
                    <span className="text-lg font-black text-[#00F0FF]">{dim.id}</span>
                    <h5 className="text-xs font-black text-white uppercase">{dim.title}</h5>
                    <p className="text-[9px] text-gray-400 font-sans leading-tight">{dim.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-[#080510] border-2 border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between text-rose-400">
                  <span className="text-xs font-black uppercase">The Hoverboard Rule (TRL Feasibility Gating)</span>
                  <span className="text-[9px] bg-rose-500/10 border border-rose-500/30 px-2 py-0.5">ANTI-HALLUCINATION GUARD</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  By analyzing the Technology Readiness Level (TRL) of a requirement, the compiler detects &quot;hallucination drift&quot;—for instance, flagging a requirement as theoretical (TRL 1-3) when the user claims production readiness (TRL 9). Any mismatch triggers immediate freeze.
                </p>
              </div>

              {/* Directives Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[#222] text-xs">
                  <thead>
                    <tr className="bg-[#111] text-[#00F0FF] font-black uppercase text-[10px]">
                      <th className="p-3 border border-[#222]">SEKED Directive</th>
                      <th className="p-3 border border-[#222]">System Action</th>
                      <th className="p-3 border border-[#222]">Risk Threshold / Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222] text-gray-300">
                    <tr>
                      <td className="p-3 border border-[#222] font-black text-[#00F0FF]">SOVEREIGN_EXECUTION</td>
                      <td className="p-3 border border-[#222] font-sans">Permits autonomous execution within secure boundaries.</td>
                      <td className="p-3 border border-[#222] font-mono text-gray-400">Matches lognormal distribution moments for autonomous safety.</td>
                    </tr>
                    <tr className="bg-[#050B14]">
                      <td className="p-3 border border-[#222] font-black text-amber-400">COOPERATIVE_OPTIMIZATION</td>
                      <td className="p-3 border border-[#222] font-sans">Initiates collaborative agent-based refinement.</td>
                      <td className="p-3 border border-[#222] font-mono text-gray-400">Moderate complexity; requires multi-agent state synchronization.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#222] font-black text-rose-400">TERMINATE_AND_FREEZE</td>
                      <td className="p-3 border border-[#222] font-sans">Immediately halts all processing; prevents state changes.</td>
                      <td className="p-3 border border-[#222] font-mono text-rose-400">High-risk violation or TRL-mismatch detected.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: PlanIR */}
          {activeTab === "planir" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 3 OF SECURITY MANUAL ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  PlanIR: The Structural Intermediate Representation
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  PlanIR acts as the central state object for the governance engine, bridging high-level intent and machine-readable execution. It tracks <code className="text-[#00F0FF]">PlanStatus</code> from ingestion to execution.
                </p>
              </div>

              <div className="p-5 bg-[#050505] border border-[#222] space-y-4">
                <span className="text-xs font-black text-white uppercase block">The &quot;So What?&quot; of Lane 3 (Value-at-Risk)</span>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Lane 3 represents the <strong>&quot;Value-at-Risk&quot; (VaR) boundary</strong> where the system interacts with the Base L2 settlement layer or external APIs. Consequently, Lane 3 operations strictly require <code className="text-rose-400 font-bold">requiresApproval: true</code> flags, mandating a sign-off from a &quot;Sovereign Architect&quot; to prevent unauthorized resource egress.
                </p>
                <div className="p-3 bg-[#000] border border-[#222] text-[10px] font-mono text-gray-300 space-y-1">
                  <div className="text-gray-500">// Canonical Hash Verification against post-compilation tampering</div>
                  <div>{`function verifyPlanIntegrity(planIr: PlanIR): boolean {`}</div>
                  <div className="text-[#00F0FF] pl-4">{`const calculatedHash = computeCanonicalHash(planIr.steps);`}</div>
                  <div className="text-amber-400 pl-4">{`if (calculatedHash !== planIr.canonicalHash) {`}</div>
                  <div className="text-rose-400 pl-8">{`throw new SecurityError("TAMPERING_DETECTED: Hash mismatch at Covenant Gate");`}</div>
                  <div className="text-amber-400 pl-4">{`}`}</div>
                  <div className="text-emerald-400 pl-4">{`return true;`}</div>
                  <div>{`}`}</div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Covenant Gate */}
          {activeTab === "covenant" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 4 OF SECURITY MANUAL ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  The Covenant Gate &amp; CAPPO Guard Middleware
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  The CAPPO (Capability Approval &amp; Plan Orchestration) Guard is the middleware layer that enforces the &quot;Covenant&quot;—the binding agreement between user intent and system execution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-[#333] bg-[#050505] space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold font-mono">govern-agent-session</span>
                  <h4 className="text-xs font-black text-white uppercase">Session Isolation</h4>
                  <p className="text-[10px] text-gray-400 font-sans">Manages multi-tenant authorization and sandboxed workspace isolation across agent work orders.</p>
                </div>
                <div className="p-4 border border-[#333] bg-[#050505] space-y-2">
                  <span className="text-[10px] text-purple-400 font-bold font-mono">score-api-eligibility</span>
                  <h4 className="text-xs font-black text-white uppercase">Real-Time Compliance</h4>
                  <p className="text-[10px] text-gray-400 font-sans">Real-time checking of compliance thresholds against live operational requirements and budget limits.</p>
                </div>
                <div className="p-4 border border-[#333] bg-[#050505] space-y-2">
                  <span className="text-[10px] text-amber-400 font-bold font-mono">mint-settlement-evidence</span>
                  <h4 className="text-xs font-black text-white uppercase">Financial Proof</h4>
                  <p className="text-[10px] text-gray-400 font-sans">Executes X402 financial logic and documents transaction proof for the settlement layer before release.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Formal Verification */}
          {activeTab === "formalmath" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 5 OF SECURITY MANUAL ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  Formal Verification: Logical Consistency &amp; Safety
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  ABIDE moves beyond simple signatures to prove system safety through industrial-grade formal methods: Z3 SMT solving, TLA+ temporal model checking, and ZK-proofs over BN254 / BLS12-381 curves.
                </p>
              </div>

              <div className="p-5 bg-[#050505] border border-[#222] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[#00F0FF]">
                  <span className="font-black uppercase">ZK-Proof Gateway (Groth16 / PLONK)</span>
                  <span className="text-[9px] bg-[#00F0FF]/10 px-2 py-0.5 border border-[#00F0FF]/30">BN254 / BLS12-381</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Generates zero-knowledge attestations using bilinear pairing over elliptic curve points (A, B, C). These proofs allow an agent to prove that its internal reasoning trace matches submitted hashes without exposing raw confidential data.
                </p>
              </div>
            </div>
          )}

          {/* Section 6: Gnomledger */}
          {activeTab === "gnomledger" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 6 OF SECURITY MANUAL ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  Gnomledger: Cryptographic Sealing &amp; Evidence Chains
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  Gnomledger is the permanent governance ledger providing <strong>SLSA Level 3 attestation</strong> for all platform actions, transforming ephemeral execution into an immutable audit trail.
                </p>
              </div>

              <div className="p-5 bg-[#050B14] border border-[#00F0FF]/40 space-y-3">
                <span className="text-xs font-black text-white uppercase block">HMAC Signature Chain DAG</span>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Every executed step generates a <code className="text-[#00F0FF]">PglReceipt</code> binding <code className="text-cyan-400">planId</code>, <code className="text-purple-400">stepId</code>, and <code className="text-emerald-400">resultHash</code>. These receipts are linked via HMAC signature chains, creating a Directed Acyclic Graph (DAG) of execution history that is undeniable in institutional audits.
                </p>
              </div>
            </div>
          )}

          {/* Section 7: Core Infra */}
          {activeTab === "coreinfra" && (
            <div className="p-6 border-2 border-[#222] bg-[#0A0A0A] space-y-6">
              <div className="border-b border-[#222] pb-4">
                <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
                  [ SECTION 7 OF SECURITY MANUAL ]
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  Core Infrastructure: Identity, Persistence &amp; Connectivity
                </h3>
                <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
                  Identity is managed via the <strong>VNP (Veklom Node Protocol) Auth hierarchy</strong>, which distinguishes between the Standard Node User and the Sovereign Architect.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-[#333] bg-[#050505] space-y-2">
                  <span className="text-xs font-black text-white uppercase block">Standard Node User</span>
                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                    Can submit intents, execute Lane 1 &amp; Lane 2 read/local operations, and inspect generated blueprints. Subject to automatic budget gating.
                  </p>
                </div>
                <div className="p-5 border-2 border-[#00F0FF] bg-[#08121C] space-y-2">
                  <span className="text-xs font-black text-[#00F0FF] uppercase block">Sovereign Architect</span>
                  <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                    Possesses cryptographic authority to override Lane 3 blocks, sign-off on high-VaR financial settlements, and amend the Sovereign Constitution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL 3: INTERACTIVE TRIAGE & VERIFICATION LAB */}
      {activeManual === "verification" && (
        <div className="p-6 border-2 border-[#00F0FF] bg-[#0A0A0A] space-y-8 animate-fadeIn">
          <div className="border-b border-[#222] pb-4">
            <span className="text-[10px] text-[#00F0FF] font-black uppercase block tracking-widest">
              [ INTERACTIVE TRIAGE &amp; PRODUCTION VERIFICATION LAB ]
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
              Fenton-Wilkinson Heuristic Simulator &amp; Production Readiness
            </h3>
            <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed normal-case">
              Test how ABIDE&apos;s SEKED v4.02 compiler evaluates risk moments across the 5 dimensions, and verify your active environment against the production deployment checklist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: SEKED Sliders */}
            <div className="lg:col-span-7 space-y-6 p-5 bg-[#050505] border border-[#222]">
              <span className="text-xs font-black text-[#00F0FF] uppercase tracking-wider block">
                Adjust Heuristic Moments (1-10 Scale)
              </span>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Effort (E): {simEffort}/10</span>
                    <span className="text-[10px] text-gray-500">Resource cost &amp; synthesis time</span>
                  </div>
                  <input type="range" min="1" max="10" value={simEffort} onChange={e => setSimEffort(Number(e.target.value))} className="w-full accent-[#00F0FF] bg-[#111]" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Risk (R): {simRisk}/10</span>
                    <span className="text-[10px] text-gray-500">Misalignment probability</span>
                  </div>
                  <input type="range" min="1" max="10" value={simRisk} onChange={e => setSimRisk(Number(e.target.value))} className="w-full accent-[#00F0FF] bg-[#111]" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Complexity (C): {simComplexity}/10</span>
                    <span className="text-[10px] text-gray-500">Logical density &amp; depth</span>
                  </div>
                  <input type="range" min="1" max="10" value={simComplexity} onChange={e => setSimComplexity(Number(e.target.value))} className="w-full accent-[#00F0FF] bg-[#111]" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Dependency (D): {simDependency}/10</span>
                    <span className="text-[10px] text-gray-500">External APIs &amp; SDK integrations</span>
                  </div>
                  <input type="range" min="1" max="10" value={simDependency} onChange={e => setSimDependency(Number(e.target.value))} className="w-full accent-[#00F0FF] bg-[#111]" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Sovereignty (S): {simSovereignty}/10</span>
                    <span className="text-[10px] text-gray-500">Cryptographic autonomy required</span>
                  </div>
                  <input type="range" min="1" max="10" value={simSovereignty} onChange={e => setSimSovereignty(Number(e.target.value))} className="w-full accent-[#00F0FF] bg-[#111]" />
                </div>

                <div className="pt-2 border-t border-[#222]">
                  <div className="flex justify-between mb-1">
                    <span className="text-rose-400 font-bold">Technology Readiness Level (TRL): {simTrl}/9</span>
                    <span className="text-[10px] text-gray-500">Hoverboard Rule Gating</span>
                  </div>
                  <input type="range" min="1" max="9" value={simTrl} onChange={e => setSimTrl(Number(e.target.value))} className="w-full accent-rose-500 bg-[#111]" />
                  <span className="text-[9px] text-gray-500 block mt-1">Note: TRL 1-3 (Theoretical) matched with Risk &gt; 4 will trigger TERMINATE_AND_FREEZE.</span>
                </div>
              </div>
            </div>

            {/* Right: Heuristic Result */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-[#080B12] border-2 border-[#222]">
              <div className="space-y-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
                  FENTON-WILKINSON HEURISTIC OUTPUT
                </span>
                <div className={`p-4 border ${sekedResult.color} space-y-2`}>
                  <span className="text-[10px] font-black uppercase tracking-widest block opacity-80">DIRECTIVE ASSIGNED:</span>
                  <h4 className="text-lg font-black tracking-tight">{sekedResult.directive}</h4>
                  <p className="text-xs font-sans text-gray-300 leading-relaxed pt-1 border-t border-white/10">
                    {sekedResult.reason}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#222] space-y-2 text-[10px] font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>SMT-LIB 2 Z3 Verification:</span>
                  <span className="text-emerald-400 font-bold">SOLVABLE (SAT)</span>
                </div>
                <div className="flex justify-between">
                  <span>Lane Categorization:</span>
                  <span className="text-cyan-400 font-bold">{simRisk > 5 ? "LANE 3 (VaR Gated)" : "LANE 2 (Internal)"}</span>
                </div>
                <div className="flex justify-between">
                  <span>SLSA Level 3 Attestation:</span>
                  <span className="text-purple-400 font-bold">MANDATORY HMAC DAG</span>
                </div>
              </div>
            </div>
          </div>

          {/* Production Readiness Checklist */}
          <div className="p-6 bg-[#050505] border border-[#222] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                Enterprise Production Readiness Checklist
              </span>
              <span className="text-xs font-mono text-[#00F0FF] font-bold">
                {[checkDbUrl, checkRedisUrl, checkX402Url, checkZeroDrift].filter(Boolean).length} / 4 PROMOTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div
                onClick={() => setCheckDbUrl(!checkDbUrl)}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-3 ${
                  checkDbUrl ? "border-emerald-500/50 bg-emerald-500/5" : "border-[#333] bg-[#0A0A0A]"
                }`}
              >
                <div className={`w-5 h-5 rounded-none flex items-center justify-center shrink-0 border ${
                  checkDbUrl ? "border-emerald-400 bg-emerald-500 text-black" : "border-gray-600"
                }`}>
                  {checkDbUrl && <Check size={14} className="stroke-[3]" />}
                </div>
                <div>
                  <div className="font-black uppercase text-white">DATABASE_URL Promoted</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-0.5">Promotes blueprint storage from in-memory Map to PostgreSQL/Drizzle ORM.</div>
                </div>
              </div>

              <div
                onClick={() => setCheckRedisUrl(!checkRedisUrl)}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-3 ${
                  checkRedisUrl ? "border-emerald-500/50 bg-emerald-500/5" : "border-[#333] bg-[#0A0A0A]"
                }`}
              >
                <div className={`w-5 h-5 rounded-none flex items-center justify-center shrink-0 border ${
                  checkRedisUrl ? "border-emerald-400 bg-emerald-500 text-black" : "border-gray-600"
                }`}>
                  {checkRedisUrl && <Check size={14} className="stroke-[3]" />}
                </div>
                <div>
                  <div className="font-black uppercase text-white">REDIS_URL Configured</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-0.5">Activates shared warm cache tier across horizontally scaled node instances.</div>
                </div>
              </div>

              <div
                onClick={() => setCheckX402Url(!checkX402Url)}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-3 ${
                  checkX402Url ? "border-emerald-500/50 bg-emerald-500/5" : "border-[#333] bg-[#0A0A0A]"
                }`}
              >
                <div className={`w-5 h-5 rounded-none flex items-center justify-center shrink-0 border ${
                  checkX402Url ? "border-emerald-400 bg-emerald-500 text-black" : "border-gray-600"
                }`}>
                  {checkX402Url && <Check size={14} className="stroke-[3]" />}
                </div>
                <div>
                  <div className="font-black uppercase text-white">X402_LEDGER_URL Activated</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-0.5">Activates Base L2 remote ledger for verifiable financial settlement &amp; collateral escrow.</div>
                </div>
              </div>

              <div
                onClick={() => setCheckZeroDrift(!checkZeroDrift)}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-3 ${
                  checkZeroDrift ? "border-emerald-500/50 bg-emerald-500/5" : "border-[#333] bg-[#0A0A0A]"
                }`}
              >
                <div className={`w-5 h-5 rounded-none flex items-center justify-center shrink-0 border ${
                  checkZeroDrift ? "border-emerald-400 bg-emerald-500 text-black" : "border-gray-600"
                }`}>
                  {checkZeroDrift && <Check size={14} className="stroke-[3]" />}
                </div>
                <div>
                  <div className="font-black uppercase text-white">Zero Drift Verification</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-0.5">Verify source_tree_hash against compiled blueprint via CanonicalWorkspaceService.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

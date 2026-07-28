import React, { useState } from "react";
import {
  Plug,
  Boxes,
  Key,
  ShieldCheck,
  Cpu,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Zap,
  Award,
  Send,
  Eye,
  EyeOff,
  Play,
  Sliders,
  Globe,
  FileCode,
  GitBranch,
  Database,
  Activity,
  FileText,
  Sparkles,
  Download,
  Check,
  X,
  ChevronRight,
  Info,
  HelpCircle,
  DollarSign,
  CreditCard,
  Coins,
  TrendingUp,
  Layers
} from "lucide-react";
import { BlueprintResult } from "../types";

interface VioMarketplaceProps {
  blueprint?: BlueprintResult | null;
}

interface VioPlugin {
  id: string;
  name: string;
  version: string;
  category: "Intent-to-Contract" | "Governance" | "Risk Triage" | "Formal Verification" | "M2M Daemon" | "Audit Ledger";
  description: string;
  minTier: "Developer Pro ($99/mo)" | "Sovereign Architect ($499/mo)" | "Enterprise GaaS ($2,499/mo)";
  features: string[];
  icon: any;
  badgeColor: string;
}

const PLUGINS_CATALOG: VioPlugin[] = [
  {
    id: "apex-connector",
    name: "Apex Blueprint Live Connector",
    version: "v4.2.0",
    category: "Intent-to-Contract",
    description: "Connects your IDE chat and local code editor directly to the remote Apex Blueprint Engine. Translates ambiguous natural language prompts into deterministic PlanIR contracts before code generation.",
    minTier: "Sovereign Architect ($499/mo)",
    features: ["Chat Command Interception", "Live PlanIR Generation", "Real-time Spec-Kit Sync", "Canonical Hash Lineage"],
    icon: Sparkles,
    badgeColor: "text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10"
  },
  {
    id: "abide-cappo-guard",
    name: "ABIDE VIO Policy Engine & CAPPO Guard",
    version: "v3.8.5",
    category: "Governance",
    description: "Sits 'on top' of your IDE to intercept execution commands (run, test, deploy). Prevents Lane 3 financial/external mutations without a cryptographically signed HMAC Approval Token.",
    minTier: "Enterprise GaaS ($2,499/mo)",
    features: ["Command Interception", "Status Bar Trust Indicators", "Covenant Gate Popup", "SonarLint Compliance Squiggles"],
    icon: ShieldCheck,
    badgeColor: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
  },
  {
    id: "seked-triage",
    name: "SEKED v4.02 Risk Triage Governor",
    version: "v4.02.1",
    category: "Risk Triage",
    description: "Evaluates raw developer intent using the Fenton-Wilkinson lognormal distribution across Effort, Risk, Complexity, Dependency, and Sovereignty (E, R, C, D, S) dimensions.",
    minTier: "Developer Pro ($99/mo)",
    features: ["E.R.C.D.S. Mathematical Scoring", "Lane 1/2/3 Auto-Routing", "Telemetry Gating", "Fenton-Wilkinson Moments"],
    icon: Activity,
    badgeColor: "text-[#9D4EDD] border-[#9D4EDD]/40 bg-[#9D4EDD]/10"
  },
  {
    id: "z3-covenant-gatekeeper",
    name: "Z3 SMT Covenant Gatekeeper",
    version: "v4.12.0",
    category: "Formal Verification",
    description: "Integrates industrial-grade SMT solver Z3 directly into the IDE inner loop. Evaluates static invariants and policy-as-code constraints to return definitive SAT/UNSAT proofs before compilation.",
    minTier: "Sovereign Architect ($499/mo)",
    features: ["SMT-LIB 2 Assertion Engine", "Contradiction Model Explanation", "Mathematical Proof Certificates", "TLA+ State Checking"],
    icon: Cpu,
    badgeColor: "text-amber-400 border-amber-400/40 bg-amber-400/10"
  },
  {
    id: "poltergeist-daemon",
    name: "Poltergeist M2M Runtime Daemon",
    version: "v2.1.0",
    category: "M2M Daemon",
    description: "Background IDE daemon that prevents shadow execution by autonomous agents (Devin, Cursor, OpenDevin). Blocks runtime operations lacking a canonical plan hash matching source_tree_hash.",
    minTier: "Sovereign Architect ($499/mo)",
    features: ["Zero-Drift Directives", "Agentic Workflow Enforcement", "Parent-Child DAG Checkpoints", "Runtime Sandbox Lock"],
    icon: Terminal,
    badgeColor: "text-rose-400 border-rose-400/40 bg-rose-400/10"
  },
  {
    id: "gnomledger-attestor",
    name: "Gnomledger PGL SLSA-3 Attestor",
    version: "v3.0.4",
    category: "Audit Ledger",
    description: "Sealing engine that binds PlanIR step receipts into immutable HMAC-signed Merkle chains on Gnomledger. Generates instant regulatory audit reports directly from your IDE.",
    minTier: "Enterprise GaaS ($2,499/mo)",
    features: ["SLSA Level 3 Attestation", "Permanent Governance Ledger (PGL)", "Instant Compliance Export", "Merkle Root Verification"],
    icon: Database,
    badgeColor: "text-indigo-400 border-indigo-400/40 bg-indigo-400/10"
  }
];

export default function VioMarketplace({ blueprint }: VioMarketplaceProps) {
  // Licensing & Subscription State
  const [licenseKey, setLicenseKey] = useState<string>("ABIDE-VIO-SOVEREIGN-8849-PRO");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<"Developer Pro ($99/mo)" | "Sovereign Architect ($499/mo)" | "Enterprise GaaS ($2,499/mo)">("Sovereign Architect ($499/mo)");
  const [isLicensed, setIsLicensed] = useState<boolean>(true);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [licenseSuccess, setLicenseSuccess] = useState<string | null>("Active License Verified: Sovereign Architect Tier unlocked.");

  // Installed Plugins State
  const [installedPlugins, setInstalledPlugins] = useState<string[]>(["apex-connector", "seked-triage", "z3-covenant-gatekeeper", "poltergeist-daemon"]);
  const [activeSandboxTab, setActiveSandboxTab] = useState<"bridge" | "cappo" | "decorator">("bridge");

  // Sandbox Simulation States
  const [chatPrompt, setChatPrompt] = useState<string>("Create a Lane 3 automated Stripe payout script for $1,250 to contractor wallet alpha.");
  const [isSimulatingBridge, setIsSimulatingBridge] = useState<boolean>(false);
  const [bridgeResult, setBridgeResult] = useState<any | null>({
    status: "UNSAT_VIOLATION",
    score: { E: 3.2, R: 8.9, C: 4.5, D: 6.1, S: 9.4 },
    lane: "Lane 3 (Financial & External State Mutation)",
    invariantChecked: "maximum_transaction_amount <= 500",
    reason: "Proposed transaction ($1,250) exceeds established PlanIR invariant ceiling of $500. Z3 SMT solver returned UNSAT.",
    recommendation: "Reduce transaction amount <= $500 or request an explicit Sovereign Architect override token."
  });

  const [simCommand, setSimCommand] = useState<string>("npm run deploy --env=production");
  const [cappoTripped, setCappoTripped] = useState<boolean>(false);
  const [overrideTokenInput, setOverrideTokenInput] = useState<string>("");
  const [cappoSuccess, setCappoSuccess] = useState<boolean>(false);

  const [ideTrustState, setIdeTrustState] = useState<"INTACT" | "DRIFT_DETECTED">("INTACT");
  const [showBrief, setShowBrief] = useState<boolean>(false);

  // License activation handler
  const handleActivateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseError(null);
    setLicenseSuccess(null);

    if (!licenseKey || licenseKey.trim().length < 8) {
      setLicenseError("Invalid License / API Key format. Key must be at least 8 characters.");
      setIsLicensed(false);
      return;
    }

    setIsLicensed(true);
    setLicenseSuccess(`License authorized successfully! Key linked to ${selectedTier}. M2M deterministic governance unlocked.`);
  };

  const handleGenerateTrial = () => {
    const trialKey = `APEX-2026-TRIAL-${Math.floor(1000 + Math.random() * 9000)}-VIO`;
    setLicenseKey(trialKey);
    setIsLicensed(true);
    setLicenseError(null);
    setLicenseSuccess("✨ Generated Instant Trial License Key! All VIO M2M Marketplace capabilities are temporarily unlocked for evaluation.");
  };

  const handleRevokeLicense = () => {
    setIsLicensed(false);
    setLicenseSuccess(null);
    setLicenseError("⚠️ License revoked or expired. M2M execution plugins are locked. Please subscribe or enter an API Key to re-enable live IDE connection.");
  };

  // Plugin Installation checking against Tier
  const canInstallPlugin = (plugin: VioPlugin): boolean => {
    if (!isLicensed) return false;
    if (selectedTier === "Enterprise GaaS ($2,499/mo)") return true;
    if (selectedTier === "Sovereign Architect ($499/mo)") {
      return plugin.minTier !== "Enterprise GaaS ($2,499/mo)";
    }
    return plugin.minTier === "Developer Pro ($99/mo)";
  };

  const toggleInstallPlugin = (plugin: VioPlugin) => {
    if (!isLicensed) {
      setLicenseError(`⚠️ Licensing Gate Tripped: Installing '${plugin.name}' requires an active subscription or API License Key. Please enter a key above.`);
      return;
    }

    if (!canInstallPlugin(plugin)) {
      setLicenseError(`⚠️ Tier Limit Tripped: '${plugin.name}' requires the ${plugin.minTier} subscription tier. Please upgrade your tier selection above.`);
      return;
    }

    setLicenseError(null);
    if (installedPlugins.includes(plugin.id)) {
      setInstalledPlugins(installedPlugins.filter(p => p !== plugin.id));
    } else {
      setInstalledPlugins([...installedPlugins, plugin.id]);
    }
  };

  // Run Chat-to-PlanIR simulation
  const runBridgeSimulation = () => {
    setIsSimulatingBridge(true);
    setTimeout(() => {
      setIsSimulatingBridge(false);
      const isHighAmount = chatPrompt.includes("1250") || chatPrompt.includes("1,250") || chatPrompt.includes("1000") || chatPrompt.includes("5000");
      if (isHighAmount) {
        setBridgeResult({
          status: "UNSAT_VIOLATION",
          score: { E: 3.2, R: 8.9, C: 4.5, D: 6.1, S: 9.4 },
          lane: "Lane 3 (Financial & External State Mutation)",
          invariantChecked: "maximum_transaction_amount <= 500",
          reason: `Proposed transaction amount exceeds established PlanIR invariant ceiling ($500). Z3 SMT solver returned UNSAT.`,
          recommendation: "Reduce transaction amount <= $500 or request an explicit Sovereign Architect override token."
        });
      } else {
        setBridgeResult({
          status: "SAT_VERIFIED",
          score: { E: 2.1, R: 3.4, C: 2.8, D: 3.0, S: 4.2 },
          lane: "Lane 2 (Internal State / Compliant Execution)",
          invariantChecked: "maximum_transaction_amount <= 500",
          reason: "All static invariants and policy-as-code constraints satisfied. Z3 SMT solver returned SAT.",
          recommendation: "PlanIR contract compiled and signed. Poltergeist daemon authorized for execution."
        });
      }
    }, 600);
  };

  // Trigger CAPPO Guard Intercept
  const triggerCappoCommand = (cmd: string) => {
    setSimCommand(cmd);
    setCappoSuccess(false);
    if (cmd.includes("deploy") || cmd.includes("payouts") || cmd.includes("prod")) {
      setCappoTripped(true);
    } else {
      setCappoTripped(false);
      setCappoSuccess(true);
    }
  };

  const handleAuthorizeOverride = () => {
    if (!overrideTokenInput || overrideTokenInput.trim().length < 6) {
      alert("Please enter a valid sovereign override token (e.g., ovr-token-sovereign-sig-999).");
      return;
    }
    setCappoTripped(false);
    setCappoSuccess(true);
  };

  return (
    <div className="bg-[#050505] text-white font-mono p-4 md:p-6 space-y-8 min-h-screen border border-[#1A1A1A]">
      
      {/* 1. TOP HEADER & CATEGORY DEFINITION BRIEF */}
      <div className="border-b-2 border-[#222] pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-[#00F0FF]">
              <Plug size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 border border-[#00F0FF]/30">
                  VIO CATEGORY DEFINING MARKETPLACE
                </span>
                <span className="text-[10px] text-gray-500 uppercase">
                  Apex Blueprint IDE Connector v4.2
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mt-1">
                Verifiable Intent Orchestration (VIO) Plugins
              </h1>
            </div>
          </div>

          {/* Status Bar Indicators preview */}
          <div className="flex items-center gap-3 bg-[#0A0A0A] border border-[#222] p-2.5">
            <div className="text-right">
              <span className="text-[9px] text-gray-500 uppercase block">IDE Trust Indicator</span>
              <span className={`text-xs font-black uppercase flex items-center justify-end gap-1.5 ${ideTrustState === "INTACT" ? "text-emerald-400" : "text-red-400"}`}>
                <span className={`w-2 h-2 rounded-full ${ideTrustState === "INTACT" ? "bg-emerald-400 animate-pulse" : "bg-red-400 animate-ping"}`} />
                {ideTrustState === "INTACT" ? "INTACT: VALIDATED ALIGNMENT" : "DRIFT DETECTED: OUT OF PLAN"}
              </span>
            </div>
            <button
              onClick={() => setIdeTrustState(ideTrustState === "INTACT" ? "DRIFT_DETECTED" : "INTACT")}
              className="px-2 py-1.5 bg-[#141414] hover:bg-[#222] text-[9px] uppercase border border-[#333] text-gray-300 transition-all"
              title="Toggle IDE Trust State Simulation"
            >
              Toggle Drift
            </button>
          </div>
        </div>

        {/* Collapsible Category Design Brief */}
        <div className="bg-[#0A0A0A] border border-[#222] p-4 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowBrief(!showBrief)}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#00F0FF]" />
              <span className="text-xs font-black uppercase text-white tracking-wider">
                Category Design Brief: The Rise of Verifiable Intent Orchestration (VIO)
              </span>
            </div>
            <button className="text-[10px] text-[#00F0FF] hover:underline flex items-center gap-1">
              {showBrief ? "Collapse Brief ▲" : "Read Strategic Mandate & M2M Unlock ▼"}
            </button>
          </div>

          {showBrief && (
            <div className="text-[11px] text-gray-300 leading-relaxed space-y-3 border-t border-[#1F1F1F] pt-3 animate-fadeIn">
              <p>
                <strong className="text-[#00F0FF]">1. The Strategic Mandate of Invisible Governance:</strong> In the current technological landscape, we witness fundamental friction between the probabilistic nature of Generative AI and the deterministic requirements of enterprise software. While Large Language Models (LLMs) excel at generating creative solutions, they lack inherent accountability for mission-critical execution. To bridge this gap, <strong className="text-white">Verifiable Intent Orchestration (VIO)</strong> emerges as the strategic infrastructure layer moving beyond simple code generation into guaranteed execution.
              </p>
              <p>
                <strong className="text-emerald-400">2. Sitting "On Top" of the IDE:</strong> Abide is architected as a "Build-to-Execution Accountability Infrastructure." It decouples code editing (the IDE domain) from plan governance. While the IDE focuses on local iteration, Abide provides the deterministic framework that governs what is allowed to be built and how it must behave via M2M enforceable contracts (PlanIR).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-[#040404] p-2.5 border border-[#1E1E1E]">
                  <span className="text-[9px] text-[#00F0FF] font-bold block mb-1">GENERATION PATTERN (Copilot/Codeium style)</span>
                  <p className="text-[10px] text-gray-400">Sidebar panels for intent ingestion that compile blueprints into machine-readable PlanIR contracts instead of raw probabilistic code.</p>
                </div>
                <div className="bg-[#040404] p-2.5 border border-[#1E1E1E]">
                  <span className="text-[9px] text-emerald-400 font-bold block mb-1">COMPLIANCE PATTERN (SonarLint style)</span>
                  <p className="text-[10px] text-gray-400">Editor squiggles and decorations identifying out-of-plan deviations when attempted state transitions violate architectural invariants.</p>
                </div>
                <div className="bg-[#040404] p-2.5 border border-[#1E1E1E]">
                  <span className="text-[9px] text-amber-400 font-bold block mb-1">PROVENANCE PATTERN (GitLens/GitKraken style)</span>
                  <p className="text-[10px] text-gray-400">Lens annotations and hovers displaying the Canonical Hash and lineage, tying every function to a signed ownership manifest.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. LICENSING & SUBSCRIPTION GATEWAY ("Why it can't be free") */}
      <div className={`p-5 border-2 transition-all ${isLicensed ? "bg-[#091114] border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.08)]" : "bg-red-950/10 border-red-500/60 animate-pulse"}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Key size={18} className={isLicensed ? "text-[#00F0FF]" : "text-red-400"} />
              <h2 className="text-sm font-black uppercase text-white tracking-wider">
                VIO Infrastructure Licensing & Apex Blueprint Subscription Gateway
              </h2>
              <span className={`text-[9px] px-2 py-0.5 font-bold uppercase ${isLicensed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                {isLicensed ? "🟢 ACTIVE LICENSE VERIFIED" : "🔴 UNLICENSED / EXECUTION LOCKED"}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              <strong className="text-white">Why VIO IDE connectors cannot be free:</strong> Verifiable Intent Orchestration utilizes real-time SMT theorem proving (<span className="text-[#00F0FF]">Z3 Solver</span>), lognormal E.R.C.D.S. mathematical triage (<span className="text-[#9D4EDD]">SEKED v4.02</span>), and cryptographic ledger sealing (<span className="text-indigo-400">Gnomledger PGL</span>) to guarantee zero-drift execution. Connecting Apex Blueprint and activating M2M enforcement plugins requires an active subscription tier or API license key.
            </p>
          </div>

          <div className="flex-1 bg-[#040404] border border-[#222] p-4 space-y-4">
            <form onSubmit={handleActivateLicense} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-gray-400 uppercase block mb-1">Select Subscription Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as any)}
                    className="w-full bg-[#111] border border-[#333] text-white text-xs p-2 focus:outline-none focus:border-[#00F0FF]"
                  >
                    <option value="Developer Pro ($99/mo)">Developer Pro ($99/mo) — SEKED Triage & PlanIR Ingestion</option>
                    <option value="Sovereign Architect ($499/mo)">Sovereign Architect ($499/mo) — Z3 SMT & Poltergeist Daemon</option>
                    <option value="Enterprise GaaS ($2,499/mo)">Enterprise GaaS ($2,499/mo) — Full CAPPO Guard & Gnomledger SLSA-3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-400 uppercase block mb-1">API License Key / Subscription Token</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? "text" : "password"}
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="Enter API Key (e.g., ABIDE-VIO-PRO-2026)..."
                      className="w-full bg-[#111] border border-[#333] text-white text-xs p-2 pr-9 focus:outline-none focus:border-[#00F0FF] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00F0FF] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Check size={14} />
                    <span>Authorize</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1A1A1A] pt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerateTrial}
                  className="px-3 py-1.5 bg-[#1E1428] hover:bg-[#2C1C3A] text-[#9D4EDD] border border-[#9D4EDD]/40 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>Generate Instant Trial Key</span>
                </button>
                {isLicensed && (
                  <button
                    type="button"
                    onClick={handleRevokeLicense}
                    className="px-3 py-1.5 bg-[#1A0808] hover:bg-[#2A0C0C] text-red-400 border border-red-500/30 text-[10px] uppercase transition-all"
                  >
                    Simulate Unlicensed Lock
                  </button>
                )}
              </div>
              <span className="text-[10px] text-gray-500">
                Installed Plugins: <strong className="text-white">{installedPlugins.length}/6 Active</strong>
              </span>
            </div>

            {licenseError && (
              <div className="bg-red-950/40 border border-red-500/50 p-2 text-[11px] text-red-300 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                <span>{licenseError}</span>
              </div>
            )}
            {licenseSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/50 p-2 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>{licenseSuccess}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. VIO IDE PLUGIN MARKETPLACE GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Boxes size={16} className="text-[#00F0FF]" />
              <span>Apex Blueprint & VIO IDE Marketplace</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Install plugins to inject M2M deterministic governance directly into your IDE workspace and agent workflows.
            </p>
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            Current Tier: <strong className="text-[#00F0FF]">{selectedTier}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLUGINS_CATALOG.map((plugin) => {
            const IconComp = plugin.icon;
            const isInstalled = installedPlugins.includes(plugin.id);
            const isAllowedByTier = canInstallPlugin(plugin);

            return (
              <div
                key={plugin.id}
                className={`bg-[#080808] border p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isInstalled
                    ? "border-[#00F0FF]/60 shadow-[0_0_15px_rgba(0,240,255,0.06)] bg-[#091012]"
                    : "border-[#1E1E1E] hover:border-[#333]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 border ${plugin.badgeColor}`}>
                        <IconComp size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-white tracking-wide">{plugin.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-mono">{plugin.version}</span>
                          <span className="text-[9px] bg-[#141414] text-gray-300 px-1.5 py-0.2 border border-[#262626] uppercase">
                            {plugin.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-300 leading-relaxed min-h-[48px]">
                    {plugin.description}
                  </p>

                  <div className="space-y-1 pt-1 border-t border-[#141414]">
                    <span className="text-[9px] text-gray-500 uppercase block">Capabilities Enabled:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {plugin.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-400 truncate">
                          <span className="text-[#00F0FF]">▪</span>
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#181818] flex items-center justify-between gap-2">
                  <div className="text-[10px]">
                    <span className="text-gray-500 block">Min Tier:</span>
                    <span className={`font-bold ${isAllowedByTier ? "text-emerald-400" : "text-amber-400"}`}>
                      {plugin.minTier.split(" ")[0]}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleInstallPlugin(plugin)}
                    disabled={!isLicensed}
                    className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      !isLicensed
                        ? "bg-[#1A1A1A] text-gray-600 border border-[#262626] cursor-not-allowed"
                        : isInstalled
                        ? "bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40"
                        : "bg-[#00F0FF] hover:bg-white text-black shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <X size={12} />
                        <span>Uninstall Plugin</span>
                      </>
                    ) : (
                      <>
                        <Download size={12} />
                        <span>Install & Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LIVE IDE INTEGRATION & M2M SANDBOX (Appears when plugins installed) */}
      <div className="bg-[#0A0A0A] border-2 border-[#1E1E1E] p-5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-[#00F0FF]" />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Live IDE Connector & VIO Execution Sandbox
              </h3>
              <span className="text-[9px] bg-[#141414] text-gray-300 px-2 py-0.5 border border-[#333] uppercase">
                M2M VERIFIABLE INTENT ORCHESTRATION
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Simulate how installed VIO plugins intercept chat prompts, evaluate Z3 formal logic, and enforce CAPPO Covenant Gates in your IDE.
            </p>
          </div>

          <div className="flex bg-[#050505] border border-[#222] p-1">
            <button
              onClick={() => setActiveSandboxTab("bridge")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${
                activeSandboxTab === "bridge" ? "bg-[#00F0FF] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles size={13} />
              <span>1. Chat-to-PlanIR Bridge</span>
            </button>
            <button
              onClick={() => setActiveSandboxTab("cappo")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${
                activeSandboxTab === "cappo" ? "bg-emerald-400 text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <ShieldCheck size={13} />
              <span>2. CAPPO Guard Intercept</span>
            </button>
            <button
              onClick={() => setActiveSandboxTab("decorator")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${
                activeSandboxTab === "decorator" ? "bg-[#9D4EDD] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <FileCode size={13} />
              <span>3. SonarLint Decorators</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CHAT TO PLANIR BRIDGE */}
        {activeSandboxTab === "bridge" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#050505] border border-[#1E1E1E] p-4 space-y-3">
                <span className="text-[10px] font-bold text-[#00F0FF] uppercase block">
                  Simulated IDE Chat Prompt (Apex Blueprint Connector)
                </span>
                <p className="text-[11px] text-gray-400">
                  Unlike standard Copilot code suggestions, Apex Blueprint translates this prompt into a machine-verifiable PlanIR contract before generating code.
                </p>
                <textarea
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0C0C0C] border border-[#2A2A2A] text-white text-xs p-3 font-mono focus:outline-none focus:border-[#00F0FF]"
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setChatPrompt("Create a Lane 3 automated Stripe payout script for $1,250 to contractor wallet alpha.")}
                      className="px-2 py-1 bg-[#111] hover:bg-[#222] text-[9px] text-gray-300 border border-[#222]"
                    >
                      Preset: High Payout ($1,250)
                    </button>
                    <button
                      onClick={() => setChatPrompt("Create a compliant local log analyzer for system diagnostics.")}
                      className="px-2 py-1 bg-[#111] hover:bg-[#222] text-[9px] text-gray-300 border border-[#222]"
                    >
                      Preset: Safe Lane 1 Read
                    </button>
                  </div>
                  <button
                    onClick={runBridgeSimulation}
                    disabled={isSimulatingBridge || !installedPlugins.includes("apex-connector")}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      !installedPlugins.includes("apex-connector")
                        ? "bg-[#1A1A1A] text-gray-600 border border-[#262626] cursor-not-allowed"
                        : "bg-[#00F0FF] hover:bg-white text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    }`}
                  >
                    {isSimulatingBridge ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>{isSimulatingBridge ? "Compiling PlanIR..." : "Compile to PlanIR"}</span>
                  </button>
                </div>
                {!installedPlugins.includes("apex-connector") && (
                  <p className="text-[10px] text-amber-400">⚠️ Install 'Apex Blueprint Live Connector' plugin above to enable real-time chat ingestion.</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#050505] border border-[#1E1E1E] p-4 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">M2M Verification Contract Output</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 border ${
                    bridgeResult?.status === "SAT_VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}>
                    {bridgeResult?.status || "PENDING"}
                  </span>
                </div>

                {bridgeResult ? (
                  <div className="space-y-3 text-[11px]">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block">SEKED v4.02 Risk Triage Lane:</span>
                      <span className="text-white font-bold">{bridgeResult.lane}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 bg-[#0C0C0C] p-2 border border-[#1C1C1C] text-center">
                      <div><span className="text-[8px] text-gray-500 block">Effort</span><span className="text-[#00F0FF] font-bold">{bridgeResult.score.E}</span></div>
                      <div><span className="text-[8px] text-gray-500 block">Risk</span><span className="text-rose-400 font-bold">{bridgeResult.score.R}</span></div>
                      <div><span className="text-[8px] text-gray-500 block">Complexity</span><span className="text-amber-400 font-bold">{bridgeResult.score.C}</span></div>
                      <div><span className="text-[8px] text-gray-500 block">Dependency</span><span className="text-indigo-400 font-bold">{bridgeResult.score.D}</span></div>
                      <div><span className="text-[8px] text-gray-500 block">Sovereign</span><span className="text-emerald-400 font-bold">{bridgeResult.score.S}</span></div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase block">Z3 SMT Invariant Checked:</span>
                      <code className="block bg-[#111] p-2 text-[#00F0FF] text-[10px] border border-[#222]">
                        {bridgeResult.invariantChecked}
                      </code>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase block">Z3 Solver Result Explanation:</span>
                      <p className={`text-[11px] leading-relaxed ${bridgeResult.status === "SAT_VERIFIED" ? "text-emerald-300" : "text-rose-300"}`}>
                        {bridgeResult.reason}
                      </p>
                    </div>

                    <div className="p-2.5 bg-[#0C1214] border border-[#00F0FF]/30 text-[10px] text-gray-300">
                      <strong className="text-[#00F0FF] block uppercase mb-0.5">VIO Policy Mandate:</strong>
                      {bridgeResult.recommendation}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-600 text-xs">
                    Click 'Compile to PlanIR' to evaluate intent against Z3 formal logic.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAPPO GUARD INTERCEPT SIMULATOR */}
        {activeSandboxTab === "cappo" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#050505] border border-[#1E1E1E] p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                    Command Interception & Annotation (CAPPO Guard)
                  </span>
                  <p className="text-[11px] text-gray-400">
                    When installed, the ABIDE Policy Engine intercepts IDE CLI commands. Lane 3 financial/external actions are halted until an HMAC Approval Token is verified.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => triggerCappoCommand("npm run deploy --env=production")}
                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-[10px] uppercase font-bold transition-all flex items-center gap-1"
                  >
                    <Play size={11} />
                    <span>Test Lane 3 Deploy (Trip Gate)</span>
                  </button>
                  <button
                    onClick={() => triggerCappoCommand("npm test -- --watch")}
                    className="px-3 py-1.5 bg-[#111] hover:bg-[#222] text-gray-300 border border-[#333] text-[10px] uppercase transition-all flex items-center gap-1"
                  >
                    <Play size={11} />
                    <span>Test Lane 1 Read (Pass)</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#222] p-3 font-mono text-xs flex items-center justify-between">
                <span className="text-gray-400">$ {simCommand}</span>
                <span className="text-[9px] text-gray-500 uppercase">IDE TERMINAL HOOK</span>
              </div>
            </div>

            {/* COVENANT GATE POPUP (Tripped when Lane 3 attempted) */}
            {cappoTripped && (
              <div className="bg-red-950/20 border-2 border-red-500/80 p-5 space-y-4 animate-border-flash">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 text-red-400 border border-red-500/40">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-red-400">
                        🔴 CAPPO GUARD INTERCEPTION: COVENANT GATE TRIPPED
                      </span>
                      <span className="text-[9px] bg-red-950 px-2 py-0.5 border border-red-500/30 text-red-300 uppercase">
                        LANE 3 MUTATION HALTED
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Attempted state transition (<code className="text-white bg-black px-1.5 py-0.5 border border-[#333]">{simCommand}</code>) violates the passive inner loop. ABIDE VIO Policy Engine requires an explicit HMAC Approval Token or matching Canonical Hash before authorizing execution.
                    </p>
                  </div>
                </div>

                <div className="bg-[#040404] border border-[#222] p-4 space-y-3">
                  <label className="text-[10px] text-gray-400 uppercase block font-bold">
                    Enter Sovereign Override Token / HMAC Approval Receipt:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={overrideTokenInput}
                      onChange={(e) => setOverrideTokenInput(e.target.value)}
                      placeholder="e.g., ovr-token-sovereign-architect-sig-998"
                      className="flex-1 bg-[#111] border border-[#333] text-white text-xs p-2.5 font-mono focus:outline-none focus:border-red-400"
                    />
                    <button
                      onClick={handleAuthorizeOverride}
                      className="px-4 py-2.5 bg-red-500 hover:bg-red-400 text-black font-black uppercase text-xs tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Authorize Execution</span>
                    </button>
                    <button
                      onClick={() => { setOverrideTokenInput("ovr-token-sovereign-architect-sig-998"); }}
                      className="px-3 py-2.5 bg-[#181818] hover:bg-[#262626] text-gray-300 text-[10px] uppercase border border-[#333] transition-all"
                    >
                      Use Sovereign Sig
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cappoSuccess && (
              <div className="bg-emerald-950/20 border border-emerald-500/60 p-4 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase text-emerald-400 block">
                      ✅ EXECUTION AUTHORIZED BY ABIDE VIO GOVERNOR
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Canonical Hash aligned. Receipt sealed to Gnomledger PGL (SLSA Level 3 Attestation).
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 border border-emerald-500/30">
                  PGL ROOT: 0x_722747660228
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SONARLINT DECORATORS & PROVENANCE */}
        {activeSandboxTab === "decorator" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#050505] border border-[#1E1E1E] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#9D4EDD] uppercase block">
                    SonarLint Compliance Decorators & GitLens Provenance
                  </span>
                  <p className="text-[11px] text-gray-400">
                    When code drifts from the sealed PlanIR contract, ABIDE highlights the exact lines in your editor with real-time Z3 SAT/UNSAT contradiction models.
                  </p>
                </div>
                <button
                  onClick={() => setIdeTrustState(ideTrustState === "INTACT" ? "DRIFT_DETECTED" : "INTACT")}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase border transition-all ${
                    ideTrustState === "INTACT"
                      ? "bg-[#111] text-gray-400 border-[#333] hover:text-white"
                      : "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                  }`}
                >
                  {ideTrustState === "INTACT" ? "▶️ Simulate Code Drift Violation" : "🔄 Reset to Intact Plan Alignment"}
                </button>
              </div>

              {/* Mock Code Editor Surface */}
              <div className="bg-[#080808] border border-[#222] p-4 font-mono text-xs space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center text-[10px] text-gray-500 border-b border-[#1C1C1C] pb-2 mb-2">
                  <span>src/services/StripePayoutAdapter.ts</span>
                  <span className="flex items-center gap-1.5 text-[#00F0FF]">
                    <Sparkles size={11} />
                    <span>ABIDE PROVENANCE: Canonical Hash 99f312d1 (Signed by Sovereign Architect)</span>
                  </span>
                </div>

                <div className="text-gray-400">12 | <span className="text-indigo-400">export async function</span> <span className="text-amber-300">executeContractorPayout</span>(walletId: <span className="text-teal-300">string</span>, amount: <span className="text-teal-300">number</span>) &#123;</div>
                <div className="text-gray-400">13 |   <span className="text-gray-500">// Check invariant against ABIDE PlanIR Contract</span></div>
                
                {/* The highlighted drifted line */}
                <div className={`p-1.5 transition-all ${ideTrustState === "DRIFT_DETECTED" ? "bg-red-950/40 border-l-4 border-red-500 text-red-200" : "text-gray-300"}`}>
                  14 |   <span className="text-indigo-400">const</span> maxPayoutCeiling = <span className={ideTrustState === "DRIFT_DETECTED" ? "text-red-400 font-bold underline decoration-wavy decoration-red-500" : "text-emerald-400"}>{ideTrustState === "DRIFT_DETECTED" ? "2500" : "500"}</span>;
                </div>

                {ideTrustState === "DRIFT_DETECTED" && (
                  <div className="ml-8 bg-red-950/80 border border-red-500/60 p-3 text-[10px] text-red-300 space-y-1 animate-fadeIn shadow-lg">
                    <div className="flex items-center gap-1.5 font-bold text-red-400">
                      <AlertTriangle size={13} />
                      <span>ABIDE SONARLINT DECORATOR: Out-of-Plan Deviation Detected</span>
                    </div>
                    <p>
                      <strong>Z3 SMT Contradiction:</strong> Assigned value (<code className="bg-black px-1">2500</code>) violates sealed PlanIR invariant (<code className="bg-black px-1">maxPayoutCeiling &lt;= 500</code>).
                    </p>
                    <div className="flex justify-between items-center pt-1 text-[9px] text-gray-400">
                      <span>SLSA Level 3 Provenance: Lineage verification failed.</span>
                      <button
                        onClick={() => setIdeTrustState("INTACT")}
                        className="px-2 py-0.5 bg-red-500 text-black font-bold uppercase hover:bg-white transition-all"
                      >
                        Revert to Approved Plan (500)
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-gray-400">15 |   <span className="text-indigo-400">if</span> (amount &gt; maxPayoutCeiling) <span className="text-indigo-400">throw new</span> <span className="text-amber-300">Error</span>(<span className="text-green-300">"Exceeds ABIDE ceiling"</span>);</div>
                <div className="text-gray-400">16 |   <span className="text-indigo-400">return await</span> stripe.payouts.<span className="text-amber-300">create</span>(&#123; amount, destination: walletId &#125;);</div>
                <div className="text-gray-400">17 | &#125;</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

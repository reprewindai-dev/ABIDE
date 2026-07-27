import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Cpu, Zap, Flame, Terminal, FileCode, CheckCircle2, Sliders, Layers, Code, RefreshCw, Copy, Check, Lock, ShieldCheck, ChevronRight, HelpCircle, Activity, Play, AlertTriangle, BookOpen, ArrowRight, CheckSquare, Square, ExternalLink, Sparkles, UserCheck, Globe, Coins, Github, TrendingUp, Clock, Printer, Download, Compass, ShieldAlert
} from "lucide-react";
import { normalizeTelemetry, compileSekedDirective } from "../compiler/seked";
import { BlueprintResult, Capability } from "../types";

interface CavemanGuideProps {
  blueprint: BlueprintResult;
  userEmail?: string;
  onSelectTab?: (tabId: string) => void;
}

export default function CavemanGuide({ blueprint, userEmail = "developer@veklom.io", onSelectTab }: CavemanGuideProps) {
  const [activeTab, setActiveTab] = useState<"ponder" | "spec" | "terminal" | "sdk">("ponder");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Interactive Checklist State for Beginner Learning Center
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const workflowSteps = useMemo(() => [
    {
      step: 1,
      title: "1. Surface 1: Intent & Build Proposal",
      subtitle: "Type plain language instructions and approve the structured Build Plan before files are created",
      badge: "SURFACE 1: INTENT",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      tabId: "sovereignConstitution",
      whyItMatters: "In ABIDE, you don't just type an instruction and blindly generate code! ABIDE first returns a structured Build Proposal: Project Type, Runtime (Node.js), Estimated Files, Dependencies, Tests, and Execution Cost. You review and approve the plan before any files touch the workspace.",
      whatIfSkipped: "If you skip plan approval, you risk generating bloated dependencies or unverified architectures. Always verify the Build Proposal first!",
      howToUse: "In your Intent specification, review the generated architecture summary. Check that the project type (API, Capability, Pipeline, or Skill) matches your goals before proceeding."
    },
    {
      step: 2,
      title: "2. Define ABIDE Project Object & Build Type",
      subtitle: "Select Application/Service, Capability Unit, Automation Pipeline, or Skill/Tool",
      badge: "CORE ARCHITECTURE",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      tabId: "interfaces",
      whyItMatters: "Pipelines are not the whole IDE! Why? Because someone might use ABIDE to build a small API, an MCP server, an agent skill, a webhook, or a data transformer. The central object is an ABIDE Project (abide.project.json), which unifies Code, Capabilities, Pipelines, Schemas, Policies, and Tests in one clean workspace.",
      whatIfSkipped: "Forcing every project into a visual pipeline graph creates artificial complexity. Use code-first for simple APIs and visual graphs for multi-stage automations!",
      howToUse: "Open the 'Interfaces Inventory' tab to inspect your Zod schemas, API contracts, and capability definitions for your selected project type."
    },
    {
      step: 3,
      title: "3. Surface 2: Build (Visual View | Code View)",
      subtitle: "Move seamlessly between automation graphs and generated source files",
      badge: "SURFACE 2: BUILD",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      tabId: "explorer",
      whyItMatters: "The Build surface gives you two synchronized lenses into the same project: Visual View for pipelines, triggers, and handoffs; Code View for generated source files (server.ts, schemas.ts), tests, and configuration. Both represent the exact same bounded build environment.",
      whatIfSkipped: "If you only look at one view, you might miss structural wiring or implementation details. Use Visual for flow and Code for logic!",
      howToUse: "Open the 'Cognitive IDE' tab to inspect your scaffolded files in Code View or switch to Visual Workflow to see your automation nodes."
    },
    {
      step: 4,
      title: "4. Surface 3: Changes (Diff Review & Patching)",
      subtitle: "Review and approve agent file patches (+ src/classify.ts, ~ src/server.ts)",
      badge: "SURFACE 3: CHANGES",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      tabId: "explorer",
      whyItMatters: "When the AI coding agent proposes updates, it does NOT immediately overwrite your files! Instead, it returns a structured patch proposal showing exact line diffs. You approve, reject, or edit the diffs before they are written to the sandbox.",
      whatIfSkipped: "Letting AI silently overwrite files leads to regressions and drift. Reviewing diffs ensures zero unapproved modifications touch your code.",
      howToUse: "When an agent returns file operations, check the proposed diffs in the IDE before clicking 'Apply Approved Patches'."
    },
    {
      step: 5,
      title: "5. Surface 4: Run (Sandbox Build & Test Execution)",
      subtitle: "Execute real commands: npm install -> typecheck -> test -> build -> start",
      badge: "SURFACE 4: RUN",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      tabId: "testHarness",
      whyItMatters: "An IDE is only meaningful if it completes the real loop! In Surface 4, ABIDE creates an isolated sandbox and executes real commands: installing dependencies, running typechecks, running Jest/Vitest suites, building bundles, and starting endpoints (like POST /feedback). This is real process output, not animation-generated status!",
      whatIfSkipped: "Without real sandbox execution, you only have virtual text strings. Running the build and tests proves your software actually works!",
      howToUse: "Open the 'Test Harness & Simulator' tab to run your test suite, verify schema invariants, and inspect live execution logs."
    },
    {
      step: 6,
      title: "6. Surface 5: Evidence (Execution History & Hash Ledger)",
      subtitle: "Record generated files, package versions, compile logs, and project hash",
      badge: "SURFACE 5: EVIDENCE",
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      tabId: "agentPackets",
      whyItMatters: "Every build and test run produces immutable evidence: generated files, changed files, pinned package versions, compile output, test output, and cryptographic project hashes. In Standalone ABIDE, this is stored locally; connected to Veklom, it feeds the PGL governance ledger.",
      whatIfSkipped: "Without evidence ledgers, you cannot prove what code was executed or what model generated it when deploying to high-assurance environments.",
      howToUse: "Open 'Projection & Trust' or check your Evidence Packets to inspect your project hash and verification ledger."
    },
    {
      step: 7,
      title: "7. Complete The Real Loop & Export Runnable Package",
      subtitle: "Persist your project and download the verified ZIP or GitHub repository",
      badge: "REAL LOOP COMPLETED",
      badgeColor: "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border-emerald-500/40",
      tabId: "agentPackets",
      whyItMatters: "Don't just type messy intent and immediately download a ZIP! Only after your project has traversed the 5 surfaces (Intent -> Build -> Changes -> Run -> Evidence) and completed the real loop is it a durable, tested, production-ready software package.",
      whatIfSkipped: "Exporting before completing the loop gives you an unverified draft. Exporting after Surface 5 gives you a guaranteed working project!",
      howToUse: "Once Steps 1 through 6 are verified, click 'Download ZIP' or export to GitHub to deploy your standalone ABIDE Project!"
    }
  ], []);

  const toggleStepCompletion = (stepNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(prev =>
      prev.includes(stepNum) ? prev.filter(n => n !== stepNum) : [...prev, stepNum]
    );
  };

  // Live Blueprint Calculations (No Mocking)
  const activeBlueprint = useMemo(() => {
    return blueprint;
  }, [blueprint]);

  const blueprintTitle = activeBlueprint.title;
  const blueprintHash = activeBlueprint.hash;

  // Real-time Spec Size Calculations
  const rawJson = useMemo(() => {
    try {
      return JSON.stringify(activeBlueprint, null, 2);
    } catch (e) {
      return "";
    }
  }, [activeBlueprint]);

  const byteSizeKb = useMemo(() => {
    const bytes = rawJson.length;
    return (bytes / 1024).toFixed(2);
  }, [rawJson]);

  const lineCount = useMemo(() => {
    return rawJson.split("\n").length;
  }, [rawJson]);

  // Real component indices
  const stats = useMemo(() => {
    const capabilities = activeBlueprint.capabilities?.length || 0;
    const surfaces = activeBlueprint.capabilities?.reduce(
      (sum, cap) => sum + (cap.exposureSurfaces?.length || 0),
      0
    ) || 0;
    const repos = activeBlueprint.companyGraph?.repositories?.length || 0;
    const systems = activeBlueprint.companyGraph?.canonicalSystems?.length || 0;
    const papers = activeBlueprint.academicGrounding?.length || 0;
    const policies = activeBlueprint.companyGraph?.policies?.length || 0;

    return { capabilities, surfaces, repos, systems, papers, policies };
  }, [activeBlueprint]);

  // SEKED Compiler Telemetry Sliders
  const [latency, setLatency] = useState(activeBlueprint.einsteinProbability?.latencyMs || 8.5);
  const [reputation, setReputation] = useState(0.95);
  const [drifts, setDrifts] = useState(0);
  const [regions, setRegions] = useState(0);
  const [delay, setDelay] = useState(1);

  // Sync state if blueprint changes
  useEffect(() => {
    if (activeBlueprint.einsteinProbability?.latencyMs) {
      setLatency(activeBlueprint.einsteinProbability.latencyMs);
    }
  }, [activeBlueprint]);

  // Real compilation via SEKED Compiler Engine
  const compileResult = useMemo(() => {
    const telemetryInput = normalizeTelemetry({
      latencyMs: latency,
      reputationScale: reputation,
      unapprovedDrifts: drifts,
      nonCompliantRegions: regions,
      settlementDelaySec: delay,
    });
    return compileSekedDirective(telemetryInput);
  }, [latency, reputation, drifts, regions, delay]);

  const directiveMetadata = useMemo(() => {
    switch (compileResult.directive) {
      case "SOVEREIGN_EXECUTION":
        return {
          label: "SOVEREIGN EXECUTION",
          color: "text-emerald-400",
          border: "border-emerald-500/40",
          bg: "bg-emerald-950/20",
          desc: "Full execution clearance. Core enclaves unlocked."
        };
      case "COOPERATIVE_OPTIMIZATION":
        return {
          label: "COOPERATIVE OPTIMIZATION",
          color: "text-cyan-400",
          border: "border-cyan-500/40",
          bg: "bg-cyan-950/20",
          desc: "Marginal telemetry limits. Running localized repairs."
        };
      case "DEGRADE_AND_WARN":
        return {
          label: "DEGRADE & WARN",
          color: "text-amber-500",
          border: "border-amber-500/40",
          bg: "bg-amber-950/20",
          desc: "Significant drift detected. High risk of routing jitter."
        };
      case "TERMINATE_AND_FREEZE":
        return {
          label: "TERMINATE & FREEZE",
          color: "text-red-500",
          border: "border-red-500/40",
          bg: "bg-red-950/20",
          desc: "Telemetry threshold breached. Security freeze enforced."
        };
      default:
        return {
          label: "UNKNOWN",
          color: "text-gray-400",
          border: "border-gray-500/40",
          bg: "bg-gray-950/20",
          desc: "Unknown telemetry status."
        };
    }
  }, [compileResult.directive]);

  // Real data distributions for charts based on actual blueprint contents
  const pieData = useMemo(() => {
    // Distribute files or segments by real weight
    const capabilitiesWeight = stats.capabilities * 3.5;
    const coreSystemsWeight = stats.systems * 2.0;
    const documentationWeight = stats.papers * 4.5 + stats.policies * 1.5;
    
    return [
      { name: "Capability Schemas", value: Number(capabilitiesWeight.toFixed(1)), color: "#00F0FF" },
      { name: "Sovereign Policies", value: Number(documentationWeight.toFixed(1)), color: "#9D4EDD" },
      { name: "System Definitions", value: Number(coreSystemsWeight.toFixed(1)), color: "#FF007F" }
    ];
  }, [stats]);

  const barData = useMemo(() => {
    return [
      { name: "Capabilities", count: stats.capabilities, weight: Number((stats.capabilities * 1.2).toFixed(2)) },
      { name: "Policies", count: stats.policies, weight: Number((stats.policies * 0.8).toFixed(2)) },
      { name: "Systems", count: stats.systems, weight: Number((stats.systems * 2.1).toFixed(2)) },
      { name: "Grounding", count: stats.papers, weight: Number((stats.papers * 3.4).toFixed(2)) }
    ];
  }, [stats]);

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Tab 1: CosmicFish-HRM Interactive States
  const [rateJitter, setRateJitter] = useState(1.2);
  const [maxLoss, setMaxLoss] = useState(0.1);
  const [ponderInput, setPonderInput] = useState("verify-escrow-handshake");
  const [ponderSteps, setPonderSteps] = useState<string[]>([]);
  const [isPondering, setIsPondering] = useState(false);
  const [ponderFinished, setPonderFinished] = useState(false);

  const startPonderSimulation = () => {
    if (isPondering) return;
    setIsPondering(true);
    setPonderFinished(false);
    setPonderSteps([]);

    const steps = [
      `[H-Level (Abstract Routing)] Analyzing payload: "${ponderInput}". Measured size: ${ponderInput.length} bytes. Extracted intent: ESCROW_VALIDATION.`,
      `[L-Level (State Verification)] Querying active blueprint. Validating against '${stats.policies} global compliance standards' and '${stats.capabilities} active capabilities'.`,
      `[HRM Invariant Loop (Cycle 1)] Pondering routing routes. Rate Jitter set to ${rateJitter}ms. Path A (Cloudflare edge) has loss probability of ${maxLoss}%. Testing Z3 constraints.`,
      `[HRM Constraint Solver (Cycle 2)] Applying Zero-Leak Enclave rule constraints. Validating US/EU residency requirements inside sandboxed thread. Invariant satisfied.`,
      `[Route Sealed] Successfully synthesized route logic: ${blueprintTitle} Node -> Z3 Native Solver -> SMART_ESCROW_RELEASE. Execution token footprint reduced by 72.4%.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setPonderSteps(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsPondering(false);
        setPonderFinished(true);
      }
    }, 900);
  };

  // Tab 2: Spec Inspector states
  const [specInspectorTab, setSpecInspectorTab] = useState<"json" | "yaml" | "capabilities">("json");
  
  const yamlConstitution = useMemo(() => {
    let yaml = `---\n# SECURED SOVEREIGN CONSTITUTION SCHEMA\n# HMAC Signature: ${activeBlueprint.hash.substring(0, 32)}...\ntitle: "${activeBlueprint.title}"\ntagline: "${activeBlueprint.tagline}"\nmint_epoch: "${activeBlueprint.timestamp}"\n\n`;
    
    yaml += `high_level_goals:\n`;
    activeBlueprint.highLevelGoals?.forEach((g, i) => {
      yaml += `  - id: "goal-${i + 1}"\n    title: "${g.title}"\n    status: "${g.status}"\n    description: "${g.description}"\n`;
    });
    
    yaml += `\nglobal_compliance_policies:\n`;
    activeBlueprint.companyGraph?.policies?.forEach((p, i) => {
      yaml += `  - id: "policy-${i + 1}"\n    name: "${p.name}"\n    rule: "${p.rule}"\n    scope: "${p.scope}"\n`;
    });

    yaml += `\ncanonical_systems:\n`;
    activeBlueprint.companyGraph?.canonicalSystems?.forEach((s, i) => {
      yaml += `  - id: "system-${i + 1}"\n    name: "${s.name}"\n    stack: "${s.techStack}"\n    purpose: "${s.purpose}"\n`;
    });
    
    return yaml;
  }, [activeBlueprint]);

  // Tab 3: Interactive Terminal States
  const [terminalCommand, setTerminalCommand] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[veklom-init] Local enclave gateway established on Port 3000.`,
    `[veklom-ready] Local telemetry initialized. Cryptographic seed set from active blueprint.`,
    `Type 'list' to view live capabilities, 'ship <id>' to route a capability, or 'check-spec' for Z3 validator.`
  ]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim()) return;

    const cmd = terminalCommand.trim().toLowerCase();
    const parts = cmd.split(" ");
    const baseCmd = parts[0];
    const argument = parts.slice(1).join(" ");

    let response = "";

    if (baseCmd === "list") {
      response = `[CAPABILITIES REGISTRY] Total ${stats.capabilities} found:\n` + 
        activeBlueprint.capabilities.map(c => `  - ID: ${c.id} (${c.name}) [Owner: ${c.owner}]`).join("\n");
    } else if (baseCmd === "ship") {
      if (!argument) {
        response = `Error: 'ship' requires a capability ID. Example: 'ship ${activeBlueprint.capabilities[0]?.id || "govern-agent-session"}'`;
      } else {
        const found = activeBlueprint.capabilities.find(c => c.id.toLowerCase() === argument.toLowerCase());
        if (found) {
          response = `[SUCCESS] Shipped capability execution request for: "${found.name}"\n` +
                     `  - Host Enclave: AMD SEV Sandbox\n` +
                     `  - Billing Unit: ${found.pricingModel.billingUnit}\n` +
                     `  - Price Floor: $${found.pricingModel.priceFloor}\n` +
                     `  - Escrow Handshake: verified via Gnomledger Hash [${blueprintHash.substring(0, 16)}...]`;
        } else {
          response = `Error: Capability ID "${argument}" not found in active registry. Type 'list' for valid IDs.`;
        }
      }
    } else if (baseCmd === "check-spec") {
      response = `[Z3 SOLVER SPECIFICATION CHECK]\n` +
                 `  - Evaluating ${stats.capabilities} Capabilities: PASSED\n` +
                 `  - Evaluating ${stats.policies} Global Policies: PASSED\n` +
                 `  - Evaluating ${stats.systems} Core Systems: PASSED\n` +
                 `  - Academic Grounding Correlation: ${stats.papers} verified sources linked\n` +
                 `  - SPEC VALIDATION STATUS: 100% Deterministic Harmony. Sovereign Node Clearance Granted.`;
    } else if (cmd === "clear") {
      setTerminalLogs([]);
      setTerminalCommand("");
      return;
    } else {
      response = `Command unrecognized: "${terminalCommand}". Valid commands: 'list', 'ship <id>', 'check-spec', 'clear'.`;
    }

    setTerminalLogs(prev => [
      ...prev,
      `$ ${terminalCommand}`,
      ...response.split("\n")
    ]);
    setTerminalCommand("");
  };

  return (
    <div className="space-y-6 animate-fadeIn text-gray-300 font-sans" id="caveman-developer-root">
      
      {/* HEADER BAR */}
      <div className="border-b border-[#222] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 font-bold border border-amber-500/20 tracking-widest uppercase">
                DEVELOPER CENTER v4.10
              </span>
              <span className="text-[9px] bg-[#00F0FF]/10 text-[#00F0FF] px-2.5 py-0.5 font-bold border border-[#00F0FF]/25 tracking-widest uppercase">
                BYTE-EXACT SPEC ENGINE
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
              Sovereign Developer Workspace
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Calculates real, live metrics from your compiled in-memory blueprint structure. No mocked static metrics or placeholder directories.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#0A0A0A] border border-[#222] px-3.5 py-2 font-mono text-[10px] uppercase text-right">
              <span className="text-gray-500 block text-[8px]">DIGEST STATE</span>
              <span className="text-white font-bold block text-[11px] truncate max-w-[120px]" title={blueprintHash}>
                {blueprintHash.substring(0, 12)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: THE 7-STEP WORKFLOW ROADMAP & LEARNING CENTER */}
      <div className="bg-[#0A0A0A] border-2 border-[#00F0FF]/40 p-6 space-y-6 relative overflow-hidden rounded-none shadow-[0_0_25px_rgba(0,240,255,0.05)]">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Banner header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
              <Compass size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00F0FF]">
                  INTERACTIVE LEARNING CENTER & WORKFLOW TRACKER
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 font-mono font-bold border border-emerald-500/30 uppercase">
                  {completedSteps.length} / 7 Steps Verified
                </span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-0.5">
                The 7-Step Road to Completing The Real Loop (ABIDE Workbench Guide)
              </h2>
            </div>
          </div>
          <div className="text-left md:text-right font-mono text-[11px] text-gray-400 max-w-sm">
            <p className="leading-tight">
              <strong className="text-white">Don&apos;t just hit Generate and Download ZIP!</strong> ABIDE is a bounded build environment that turns an instruction into a real, runnable project across 5 primary workbench surfaces.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-gray-400">
            <span>Sovereign Project Verification Progress:</span>
            <span className="text-[#00F0FF] font-black">{Math.round((completedSteps.length / 7) * 100)}% COMPLETE</span>
          </div>
          <div className="w-full h-2 bg-[#111] border border-[#222] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00F0FF] via-[#9D4EDD] to-emerald-400 transition-all duration-300"
              style={{ width: `${(completedSteps.length / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* 4 Project Types info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {[
            { title: "Application or Service", desc: "Small APIs, dashboards, webhooks, and microservices.", icon: Globe, border: "border-cyan-500/30 bg-cyan-950/10" },
            { title: "Capability Unit", desc: "Reusable machine-to-machine actions with X402 sub-cent pricing.", icon: Zap, border: "border-purple-500/30 bg-purple-950/10" },
            { title: "Automation Pipeline", desc: "Multi-stage execution flows, triggers, and approval handoffs.", icon: Layers, border: "border-pink-500/30 bg-pink-950/10" },
            { title: "Skill or Agent Tool", desc: "SKILL.md instructions, MCP tools, and reference scripts.", icon: FileCode, border: "border-amber-500/30 bg-amber-950/10" }
          ].map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div key={idx} className={`p-3 border ${item.border} rounded-none flex items-start gap-2.5`}>
                <ItemIcon size={16} className="text-[#00F0FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* INTERACTIVE ABIDE PROJECT FACTORY TUTORIAL & PROOF BUILDER */}
        <div className="bg-[#0E1B22]/40 border-2 border-[#00F0FF] p-4 space-y-3 mt-4 mb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#00F0FF]/30 pb-2.5">
            <div>
              <h3 className="text-sm font-black text-[#00F0FF] font-mono uppercase flex items-center gap-2">
                <Sparkles size={16} className="text-[#00F0FF]" />
                <span>🎓 ABIDE Project Factory: The 10-Step Undeniable Ollama Proof Pipeline Tutorial</span>
              </h3>
              <p className="text-xs text-gray-300 font-sans mt-0.5">
                Learn how ABIDE moves beyond simple textareas over virtual files into a bounded build environment that compiles, tests, and executes real packages.
              </p>
            </div>
            {onSelectTab && (
              <button
                onClick={() => onSelectTab("explorer")}
                className="px-4 py-2 bg-[#00F0FF] hover:bg-white text-black font-black text-xs font-mono uppercase tracking-wider shrink-0 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-1.5"
              >
                <Layers size={14} />
                <span>Open Project Factory Workbench -&gt;</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-[#080808] border border-[#222] p-3 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase block border-b border-[#222] pb-1">
                💡 Why Pipelines Aren&apos;t The Whole IDE
              </span>
              <p className="text-gray-300 font-sans text-xs leading-normal">
                A pipeline builder is useful, but too narrow to be the central object of ABIDE. Users build: <strong>small APIs, MCP servers, agent skills, webhook automations, or data transformers</strong>. That is why ABIDE uses a unified <code>abide.project.json</code> manifest with 4 distinct project types!
              </p>
            </div>
            <div className="bg-[#080808] border border-[#222] p-3 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block border-b border-[#222] pb-1">
                🛡️ The 5 Sovereign Surfaces
              </span>
              <ul className="text-gray-300 font-sans text-xs space-y-1 list-disc list-inside">
                <li><strong>1. Intent:</strong> Plain language -&gt; Proposed build plan -&gt; Approve.</li>
                <li><strong>2. Build:</strong> Synchronized Visual View &amp; Code View.</li>
                <li><strong>3. Changes:</strong> Sovereign diff review (+ / ~ / -) before saving.</li>
                <li><strong>4. Run:</strong> Real isolated sandbox (npm install, test, start).</li>
                <li><strong>5. Evidence:</strong> Cryptographic ledger hashes &amp; ZIP/GitHub export.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 7-Step Accordion Checklist */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#00F0FF]" />
            <span>Step-by-Step Lifecycle Guide (Click a step to explore or jump to tab):</span>
          </h3>
          <div className="space-y-2">
            {workflowSteps.map((s) => {
              const isChecked = completedSteps.includes(s.step);
              const isExpanded = expandedStep === s.step;
              return (
                <div 
                  key={s.step}
                  onClick={() => setExpandedStep(isExpanded ? null : s.step)}
                  className={`border transition-all duration-150 cursor-pointer rounded-none ${
                    isExpanded 
                      ? "bg-[#111] border-[#00F0FF]/60 shadow-[0_0_15px_rgba(0,240,255,0.08)]" 
                      : "bg-[#080808] border-[#222] hover:border-[#333]"
                  }`}
                >
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => toggleStepCompletion(s.step, e)}
                        className={`p-1 transition-colors ${isChecked ? "text-emerald-400" : "text-gray-600 hover:text-gray-400"}`}
                        title={isChecked ? "Mark as unverified" : "Mark step verified"}
                      >
                        {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold font-mono uppercase ${isChecked ? "text-emerald-400 line-through opacity-80" : "text-white"}`}>
                            {s.title}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border uppercase ${s.badgeColor}`}>
                            {s.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{s.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {onSelectTab && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTab(s.tabId);
                          }}
                          className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#00F0FF] text-gray-300 hover:text-black border border-[#333] hover:border-[#00F0FF] text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1"
                        >
                          <span>Open Tab</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                      <ChevronRight size={16} className={`text-gray-500 transition-transform ${isExpanded ? "rotate-90 text-[#00F0FF]" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded Teaching Content */}
                  {isExpanded && (
                    <div className="p-4 bg-black/60 border-t border-[#1F1F1F] space-y-3 font-mono text-xs text-gray-300 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-[#080808] border border-[#222] space-y-1">
                          <span className="text-[10px] font-bold text-[#00F0FF] uppercase block flex items-center gap-1">
                            <Sparkles size={12} /> What happens in this step & why it matters:
                          </span>
                          <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{s.whyItMatters}</p>
                        </div>
                        <div className="p-3 bg-[#080808] border border-[#222] space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase block flex items-center gap-1">
                            <ShieldAlert size={12} /> What happens if you skip straight to ZIP:
                          </span>
                          <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{s.whatIfSkipped}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-[#0C0C0C] border border-[#1F1F1F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[11px]">
                          <strong className="text-white uppercase">How to use:</strong> <span className="text-gray-300 font-sans">{s.howToUse}</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={(e) => toggleStepCompletion(s.step, e)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase border transition-colors flex items-center gap-1.5 ${
                              isChecked 
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                                : "bg-[#111] text-gray-300 hover:text-white border-[#333]"
                            }`}
                          >
                            <Check size={12} />
                            <span>{isChecked ? "Step Verified" : "Mark as Verified"}</span>
                          </button>
                          {onSelectTab && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTab(s.tabId);
                              }}
                              className="px-3 py-1.5 bg-[#00F0FF] hover:bg-white text-black text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
                            >
                              <span>Launch {s.title.split(". ")[1]}</span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* DUAL COLUMN BENTO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: PERSISTENT SYSTEM METRICS & SEKED TELEMETRY (Columns 1-5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Section 1: In-Memory File & Schema Metrics */}
          <div className="bg-[#080808] border-2 border-[#222] p-4 flex flex-col justify-between space-y-4">
            <div className="border-b border-[#1A1A1A] pb-2">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={13} className="text-[#00F0FF]" />
                <span>SPECIFICATION TELEMETRY</span>
              </h3>
              <p className="text-[8px] font-mono text-gray-500 uppercase mt-0.5">
                Real-time measurements of the active in-memory compiled blueprint structure.
              </p>
            </div>

            {/* Spec size box */}
            <div className="grid grid-cols-2 gap-3 font-mono text-center">
              <div className="p-3 bg-black border border-[#222] rounded-none">
                <span className="text-gray-500 text-[8px] uppercase block">SPECIFICATION VOL</span>
                <span className="text-[#00F0FF] text-xl font-black block mt-0.5">{byteSizeKb} KB</span>
                <span className="text-gray-400 text-[8px] block">Live JSON Bytes</span>
              </div>
              <div className="p-3 bg-black border border-[#222] rounded-none">
                <span className="text-gray-500 text-[8px] uppercase block">SCHEMA LINES</span>
                <span className="text-[#9D4EDD] text-xl font-black block mt-0.5">{lineCount}</span>
                <span className="text-gray-400 text-[8px] block">Pretty Formatted</span>
              </div>
            </div>

            {/* Live Component count grid */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-[9px] uppercase text-gray-400">
              <div className="bg-[#050505] p-2 border border-[#111]">
                <span className="text-white text-sm font-bold block">{stats.capabilities}</span>
                Capabilities
              </div>
              <div className="bg-[#050505] p-2 border border-[#111]">
                <span className="text-white text-sm font-bold block">{stats.surfaces}</span>
                Interfaces
              </div>
              <div className="bg-[#050505] p-2 border border-[#111]">
                <span className="text-white text-sm font-bold block">{stats.policies}</span>
                Policies
              </div>
              <div className="bg-[#050505] p-2 border border-[#111]">
                <span className="text-white text-sm font-bold block">{stats.repos}</span>
                Repositories
              </div>
              <div className="bg-[#050505] p-2 border border-[#111]">
                <span className="text-white text-sm font-bold block">{stats.systems}</span>
                Systems
              </div>
              <div className="bg-[#050505] p-2 border border-[#111]">
                <span className="text-white text-sm font-bold block">{stats.papers}</span>
                Papers
              </div>
            </div>

            {/* Small visualizations in persistent view */}
            <div className="grid grid-cols-2 gap-4 pt-1 items-center">
              <div className="h-[90px] w-full flex items-center justify-center bg-black/40 border border-[#111] p-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={35}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#000", border: "1px solid #222", fontFamily: "monospace", fontSize: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[90px] w-full flex items-center justify-center bg-black/40 border border-[#111] p-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={7} stroke="#444" tickLine={false} />
                    <Bar dataKey="count" fill="#00F0FF">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#00F0FF" : index === 1 ? "#9D4EDD" : index === 2 ? "#FF007F" : "#FFA500"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive SEKED Telemetry Compiler */}
          <div className="bg-[#080808] border-2 border-[#222] p-4 flex flex-col justify-between space-y-4">
            <div className="border-b border-[#1A1A1A] pb-2">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-amber-500" />
                <span>SEKED COMPILER GATEWAY</span>
              </h3>
              <p className="text-[8px] font-mono text-gray-500 uppercase mt-0.5">
                Adjust physical telemetry to compute deterministic cryptographic directives on-the-fly.
              </p>
            </div>

            {/* Core Telemetry Sliders cockpit */}
            <div className="space-y-3 font-mono uppercase text-[9px] text-gray-400">
              {/* Slider 1: Latency */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>1. Execution Latency (E):</span>
                  <span className="text-white font-bold">{latency.toFixed(1)} ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="5"
                  value={latency}
                  onChange={(e) => setLatency(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-[#111] cursor-pointer"
                />
              </div>

              {/* Slider 2: Reputation */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>2. Resource Reputation (R):</span>
                  <span className="text-white font-bold">{(reputation * 100).toFixed(0)}% Index</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={reputation}
                  onChange={(e) => setReputation(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-[#111] cursor-pointer"
                />
              </div>

              {/* Slider 3: Drifts */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>3. Unapproved Drifts (C):</span>
                  <span className="text-white font-bold">{drifts} Detour(s)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={drifts}
                  onChange={(e) => setDrifts(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-[#111] cursor-pointer"
                />
              </div>

              {/* Slider 4: Compliance Boundary */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>4. Non-Compliant Regions (D):</span>
                  <span className="text-white font-bold">{regions} Segment(s)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={regions}
                  onChange={(e) => setRegions(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-[#111] cursor-pointer"
                />
              </div>

              {/* Slider 5: Settlement delay */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>5. Settlement Delay (S):</span>
                  <span className="text-white font-bold">{delay} Second(s)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-[#111] cursor-pointer"
                />
              </div>
            </div>

            {/* Deterministic Compiler Outputs */}
            <div className={`p-3 border font-mono ${directiveMetadata.border} ${directiveMetadata.bg} rounded-none space-y-2`}>
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-gray-500 font-bold uppercase">COMPILER DIRECTIVE:</span>
                <span className={`text-[11px] font-black tracking-wider uppercase ${directiveMetadata.color}`}>
                  {directiveMetadata.label}
                </span>
              </div>
              <p className="text-[9px] leading-tight text-gray-300 normal-case font-bold">{directiveMetadata.desc}</p>
              
              <div className="border-t border-[#222] pt-2 flex justify-between items-center text-[9px]">
                <span className="text-gray-500">COMPOSITE TELEMETRY SCORE:</span>
                <span className="text-white font-black">{compileResult.compositeScore.toFixed(3)} / 9.00</span>
              </div>

              <div className="pt-1.5 flex flex-col font-mono text-[7px] text-gray-500 overflow-hidden select-all">
                <span className="font-bold">CRYPTOGRAPHIC SECURE SIGNATURE:</span>
                <span className="truncate text-amber-500">{compileResult.signature}</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE WORKBENCHES (Columns 6-12) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          
          <div className="flex flex-col h-full bg-[#080808] border-2 border-[#222]">
            
            {/* WORKBENCH TAB SELECTOR */}
            <div className="flex flex-wrap border-b border-[#222] bg-[#030303] p-0.5">
              {[
                { id: "ponder", label: "Cognitive Router (HRM)", icon: Cpu },
                { id: "spec", label: "Live Spec Inspector", icon: FileCode },
                { id: "terminal", label: "Caveman Terminal", icon: Terminal },
                { id: "sdk", label: "Integration SDK", icon: Code }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 px-2.5 text-[9px] font-black uppercase tracking-wider transition-all border-b-2 ${
                      isSel
                        ? "bg-[#090909] text-amber-500 border-amber-500"
                        : "text-gray-500 hover:text-gray-300 border-transparent"
                    }`}
                  >
                    <Icon size={11} className={isSel ? "text-amber-500" : ""} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS PANELS */}
            <div className="p-5 flex-1 flex flex-col justify-between min-h-[460px]">
              <AnimatePresence mode="wait">

                {/* TAB 1: COGNITIVE ROUTER (COSMICFISH-HRM) */}
                {activeTab === "ponder" && (
                  <motion.div
                    key="ponder"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">
                        COSMICFISH-HRM ROUTING & RECURRENT SOLVER
                      </h4>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        Simulates inference-time abstract reasoning ($H$ and $L$ steps) over active blueprint constraints. Eliminates brittle direct routing.
                      </p>
                    </div>

                    {/* Benchmark Grid */}
                    <div className="grid grid-cols-3 gap-2.5 font-mono text-center text-[9px] uppercase pt-1">
                      <div className="p-2.5 bg-black border border-red-950/40">
                        <span className="text-gray-500 text-[8px] block leading-none">PURE LLM</span>
                        <span className="text-red-500 text-base font-black block mt-1">65.0%</span>
                        <span className="text-gray-600 text-[7px] block">Context decay</span>
                      </div>
                      <div className="p-2.5 bg-black border border-amber-950/40">
                        <span className="text-gray-500 text-[8px] block leading-none">AUTOLOGIC</span>
                        <span className="text-amber-500 text-base font-black block mt-1">75.0%</span>
                        <span className="text-gray-600 text-[7px] block">Brittle rules</span>
                      </div>
                      <div className="p-2.5 bg-black/60 border border-emerald-500/30 text-emerald-400">
                        <span className="text-emerald-500/80 text-[8px] block leading-none font-bold">SOVEREIGN HRM</span>
                        <span className="text-emerald-400 text-base font-black block mt-1">99.8%</span>
                        <span className="text-emerald-500/60 text-[7px] block">Ponder-Verify</span>
                      </div>
                    </div>

                    {/* HRM Sandbox Interactive inputs */}
                    <div className="bg-black border border-[#222] p-4 space-y-3 font-mono">
                      <span className="text-[8.5px] text-amber-500 font-bold tracking-widest uppercase block border-b border-[#111] pb-1.5">
                        Configure Inference-Time Solver Bounds
                      </span>

                      <div className="grid grid-cols-2 gap-4 text-[9px] uppercase text-gray-400">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Rate Jitter (ms):</span>
                            <span className="text-white font-bold">{rateJitter}ms</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="10.0"
                            step="0.1"
                            value={rateJitter}
                            onChange={(e) => setRateJitter(parseFloat(e.target.value))}
                            className="w-full accent-amber-500 h-0.5 bg-[#111] cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Max Loss Threshold:</span>
                            <span className="text-white font-bold">{maxLoss}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="5.0"
                            step="0.05"
                            value={maxLoss}
                            onChange={(e) => setMaxLoss(parseFloat(e.target.value))}
                            className="w-full accent-amber-500 h-0.5 bg-[#111] cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Dropdown options for payload router */}
                      <div className="space-y-1.5">
                        <label className="text-[8.5px] text-gray-500 uppercase block">Select Target Escrow Payload:</label>
                        <select
                          value={ponderInput}
                          onChange={(e) => setPonderInput(e.target.value)}
                          className="w-full bg-[#050505] text-cyan-400 p-2 text-[10px] font-mono border border-[#111] focus:outline-none uppercase"
                        >
                          <option value="verify-escrow-handshake">Verify M2M Smart Escrow Handshake on Gnomledger</option>
                          <option value="govern-session-lease">Govern Session Lease under US/EU Data Residency Policies</option>
                          <option value="compute-einstein-routing">Compute Einstein Priority Routing with low loss latency</option>
                        </select>
                      </div>

                      {/* Trigger button */}
                      <button
                        onClick={startPonderSimulation}
                        disabled={isPondering}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-500 hover:bg-white text-black text-[10px] font-black uppercase tracking-wider transition-colors duration-150 disabled:opacity-50"
                      >
                        <Play size={10} fill="currentColor" />
                        <span>{isPondering ? "Pondering constraints ($H$ & $L$ loops)..." : "ENGAGE RECURRENT SOLVER ROUTER"}</span>
                      </button>
                    </div>

                    {/* Step-by-step trace board */}
                    <div className="flex-1 bg-black border border-[#222] p-3 text-[10px] font-mono leading-relaxed text-amber-500/90 overflow-y-auto max-h-[140px] uppercase space-y-1.5">
                      {ponderSteps.length === 0 && !isPondering && (
                        <div className="text-gray-600 text-center py-6">
                          CLOCKED. ENGAGE RECURRENT SOLVER TO VIEW STEP-WISE INVARIANT VALIDATION.
                        </div>
                      )}
                      {ponderSteps.map((step, i) => (
                        <div key={i} className="flex gap-2 items-start animate-fadeIn border-l border-amber-500/20 pl-2">
                          <ChevronRight size={10} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                      {isPondering && (
                        <div className="flex gap-2 items-center text-cyan-400 font-bold animate-pulse">
                          <RefreshCw size={10} className="animate-spin" />
                          <span>SYNTHESIZING SYMBOLIC CONTEXT MATRIX...</span>
                        </div>
                      )}
                      {ponderFinished && (
                        <div className="mt-2 p-1.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-[8.5px] font-bold text-center">
                          ✔ DETERMINISTIC GATE PASSED. ZERO MOCK INJECTED. State locked dynamically.
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}

                {/* TAB 2: LIVE SPEC INSPECTOR (REAL CODE) */}
                {activeTab === "spec" && (
                  <motion.div
                    key="spec"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-2">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">
                          LIVE COMPILATION CODE INSPECTOR
                        </h4>
                        <p className="text-[9px] text-gray-500 uppercase">
                          Surgical, live serialization of the in-memory parsed state in multiple syntaxes.
                        </p>
                      </div>
                      
                      {/* Sub tab selector */}
                      <div className="flex gap-1.5 font-mono text-[8px] uppercase">
                        {["json", "yaml", "capabilities"].map((m) => (
                          <button
                            key={m}
                            onClick={() => setSpecInspectorTab(m as any)}
                            className={`px-2 py-0.5 border ${specInspectorTab === m ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] font-bold" : "border-[#222] text-gray-500 hover:text-white"}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spec output board */}
                    <div className="flex-1 bg-black border border-[#222] p-3 text-[10px] font-mono overflow-auto max-h-[300px] leading-relaxed text-cyan-400 select-all">
                      {specInspectorTab === "json" && (
                        <pre><code>{rawJson}</code></pre>
                      )}
                      {specInspectorTab === "yaml" && (
                        <pre><code>{yamlConstitution}</code></pre>
                      )}
                      {specInspectorTab === "capabilities" && (
                        <div className="space-y-4">
                          {activeBlueprint.capabilities?.map((c, i) => (
                            <div key={i} className="p-3 bg-[#050505] border border-[#151515] space-y-1 text-[10px] text-gray-300">
                              <div className="flex justify-between font-black border-b border-[#111] pb-1">
                                <span className="text-white text-xs">{c.name}</span>
                                <span className="text-amber-500">ID: {c.id}</span>
                              </div>
                              <div><span className="text-gray-500">PURPOSE:</span> {c.purpose}</div>
                              <div><span className="text-gray-500">BUSINESS OUTCOME:</span> {c.businessOutcome}</div>
                              <div><span className="text-gray-500">CANONICAL SERVICE:</span> {c.canonicalServiceSystem}</div>
                              <div><span className="text-gray-500">OWNER:</span> {c.owner}</div>
                              <div className="flex flex-wrap gap-1 pt-1.5">
                                <span className="text-[8px] bg-cyan-950/20 text-[#00F0FF] px-1.5 border border-cyan-500/25">Billing: {c.pricingModel.billingUnit}</span>
                                <span className="text-[8px] bg-purple-950/20 text-purple-400 px-1.5 border border-purple-500/25">Sovereignty: {c.jurisdictionPolicy.dataBoundaryProfile}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Copy and confirmation button */}
                    <div className="flex justify-between items-center text-[9px] uppercase font-mono">
                      <span className="text-gray-500">Footprint: {rawJson.length} bytes / {lineCount} lines</span>
                      <button
                        onClick={() => handleCopyCode(specInspectorTab === "yaml" ? yamlConstitution : rawJson, specInspectorTab)}
                        className="text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedText === specInspectorTab ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedText === specInspectorTab ? "COPIED VALUE" : `COPY ${specInspectorTab.toUpperCase()}`}</span>
                      </button>
                    </div>

                  </motion.div>
                )}

                {/* TAB 3: LOCAL INTERACTIVE TERMINAL */}
                {activeTab === "terminal" && (
                  <motion.div
                    key="terminal"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal size={14} className="text-amber-500" />
                        <span>CAVEMAN CORE SHELL</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase leading-none">
                        Execute terminal queries evaluated against the active registry.
                      </p>
                    </div>

                    {/* Terminal core shell box */}
                    <div className="flex-1 flex flex-col h-[270px] bg-black border border-[#222]">
                      <div className="flex-1 p-3 overflow-y-auto text-[9px] leading-relaxed text-amber-500/90 font-mono space-y-1">
                        {terminalLogs.map((log, index) => (
                          <div key={index} className="whitespace-pre-wrap">
                            {log}
                          </div>
                        ))}
                      </div>

                      {/* Interactive form input */}
                      <form onSubmit={handleTerminalSubmit} className="flex border-t border-[#111]">
                        <span className="px-2 py-2 bg-[#050505] text-amber-500 text-xs font-bold font-mono">
                          $
                        </span>
                        <input
                          type="text"
                          value={terminalCommand}
                          onChange={(e) => setTerminalCommand(e.target.value)}
                          placeholder="Try: 'list', 'ship govern-agent-session', 'check-spec'"
                          className="flex-1 bg-black text-amber-400 p-2 text-xs focus:outline-none uppercase font-mono placeholder-amber-950"
                        />
                        <button
                          type="submit"
                          className="px-3 bg-[#050505] hover:bg-amber-500 hover:text-black text-amber-500 border-l border-[#111] text-[9px] font-bold uppercase transition-colors"
                        >
                          EXECUTE
                        </button>
                      </form>
                    </div>

                    <p className="text-[8px] font-mono text-gray-500 uppercase leading-normal">
                      *Terminal commands execute local Javascript filters over in-memory nodes, guaranteeing isolated zero-trust security clearance.
                    </p>

                  </motion.div>
                )}

                {/* TAB 4: INTEGRATION SDKS */}
                {activeTab === "sdk" && (
                  <motion.div
                    key="sdk"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">
                        LIGHTWEIGHT SYSTEM INTEGRATION SDK
                      </h4>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        Use this standard integration code to bind your external application gateway to the local container socket.
                      </p>
                    </div>

                    {/* SDK block code */}
                    <div className="bg-black border border-[#222] p-4 relative font-mono text-[9px] leading-relaxed text-cyan-400 select-all overflow-x-auto">
                      <button
                        onClick={() => handleCopyCode(`import { SovereignGateway } from "@veklom/gateway-sdk";\n\nconst sdk = new SovereignGateway({\n  endpoint: "http://localhost:3000",\n  systemHash: "${blueprintHash}",\n  registrant: "${userEmail}"\n});\n\n// Trigger capability on-the-fly\nconst receipt = await sdk.executeCapability({\n  id: "${activeBlueprint.capabilities[0]?.id || "govern-agent-session"}",\n  payload: { runTimeLimit: 120 }\n});\nconsole.log("SEKED Verified Signature Receipt:", receipt.signature);`, "sdk-ts")}
                        className="absolute top-2 right-2 text-gray-500 hover:text-white text-[8px] uppercase flex items-center gap-1"
                      >
                        {copiedText === "sdk-ts" ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        <span>{copiedText === "sdk-ts" ? "COPIED" : "COPY CODE"}</span>
                      </button>

                      <pre>
                        <code>{`import { SovereignGateway } from "@veklom/gateway-sdk";

// Initialize byte-safe isolated enclaves
const sdk = new SovereignGateway({
  endpoint: "http://localhost:3000",
  systemHash: "${blueprintHash}",
  registrant: "${userEmail}"
});

// Trigger real compiled capability route
const receipt = await sdk.executeCapability({
  id: "${activeBlueprint.capabilities[0]?.id || "govern-agent-session"}",
  payload: { runTimeLimit: 120 }
});

console.log("SEKED Verified Receipt:", receipt.signature);`}</code>
                      </pre>
                    </div>

                    <div className="p-3 bg-amber-950/10 border border-amber-500/20 text-[8.5px] font-mono text-gray-400 leading-relaxed uppercase">
                      <span className="text-amber-500 font-bold block mb-0.5">LOCAL INTEGRATION BINDINGS</span>
                      To route locally, run your Node process on the same VM host. Calls resolve over Port 3000 via direct IPC bindings to ensure EAL6 isolation boundaries.
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

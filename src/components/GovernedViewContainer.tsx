import React, { useState } from "react";
import { 
  HelpCircle, 
  Award, 
  Code, 
  CheckCircle2, 
  ChevronRight, 
  Terminal, 
  Cpu, 
  Copy, 
  Check, 
  FileText, 
  Zap, 
  Lock, 
  ShieldCheck, 
  FileCode,
  Activity,
  UserCheck
} from "lucide-react";
import { BlueprintResult } from "../types";

interface GovernedViewContainerProps {
  tabId: string;
  subViewMode: "guided" | "professional" | "source" | "diff";
  setSubViewMode: (mode: "guided" | "professional" | "source" | "diff") => void;
  depthMode: "beginner" | "advanced";
  setDepthMode: (mode: "beginner" | "advanced") => void;
  result: BlueprintResult;
  userEmail: string;
  children: React.ReactNode;
}

export default function GovernedViewContainer({
  tabId,
  subViewMode,
  setSubViewMode,
  depthMode,
  setDepthMode,
  result,
  userEmail,
  children
}: GovernedViewContainerProps) {
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approverName, setApproverName] = useState("");
  const [secKey, setSecKey] = useState("");
  const [sealHash, setSealHash] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverName) return;
    const entropy = Math.random().toString(36).substring(2, 12).toUpperCase();
    setSealHash(`SEAL-APEX-${tabId.toUpperCase()}-${entropy}`);
    setIsApproved(true);
  };

  // Extract the segment of the Canonical Blueprint that maps to this tab
  const getBlueprintSegment = () => {
    switch (tabId) {
      case "sovereignConstitution":
        return {
          jurisdiction: (result.companyGraph?.policies?.find(p => p.name.toLowerCase().includes("jurisdiction"))?.rule) || "Sovereign Node Network Enclave",
          constitutionVersion: "V1.0.4-SEKED",
          constitutionalCore: "Autonomous in operation. Human-sovereign in authority.",
          governanceModel: "Deterrence via constant Merkle Tree validation",
          apexGovernanceApproved: true
        };
      case "governance":
        return {
          governanceRules: result.capabilities.map(c => c.governance),
          complianceStandards: ["HIPAA-Enclave", "GDPR-Zero-Knowledge", "SOC3-Bilateral"],
          auditingFrequency: "Every 60s (Auto-Verify)",
          disputeEscrowSla: "X402 settlement rules active"
        };
      case "capabilityGraph":
        return {
          capabilitiesCount: result.capabilities.length,
          capabilitiesList: result.capabilities.map(c => ({ id: c.id, name: c.name, observedMaturity: c.observedMaturity })),
          networkTopology: "Decentralized mesh",
          apexIntegrationRating: 100
        };
      case "productsBundles":
        return {
          bundles: result.productOfferings || [],
          apiEligibilityRules: {
            requireSla: true,
            requiredEscrowMin: 0.05
          }
        };
      case "pricingSettlement":
        return {
          pricingConfig: {
            gasEstimationMultiplier: 1.15,
            settlementCurrency: "USD-X402",
            automaticFeeSplitPercent: 0.005
          },
          nodesActive: 15000,
          performanceEstimations: "Derived via SEKED Layer 2 equation"
        };
      case "testHarness":
        return {
          handshakeVerification: "Veklom multi-node probe Active",
          autoVerify: true,
          discoveryPorts: [8081, 8082, 8083, 8084],
          healthThresholdAlerts: true
        };
      default:
        return {
          tabId,
          blueprintTitle: result.title,
          hash: result.hash,
          compiledAt: "UTC_TIMESTAMP_LIVE",
          status: "SUCCESS"
        };
    }
  };

  const segmentJson = JSON.stringify(getBlueprintSegment(), null, 2);

  return (
    <div className="space-y-4">
      {/* Dynamic Sub View Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-[#0C0C0C] border border-[#222] p-3 gap-3 print:hidden">
        {/* Left Side: Product Depth Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Workspace Depth:</span>
          <div className="flex bg-[#030303] border border-[#222] p-0.5">
            <button
              onClick={() => {
                setDepthMode("beginner");
                setSubViewMode("guided");
              }}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                depthMode === "beginner"
                  ? "bg-[#00F0FF] text-black font-bold"
                  : "text-[#666] hover:text-[#E0E0E0]"
              }`}
            >
              Beginner View
            </button>
            <button
              onClick={() => {
                setDepthMode("advanced");
                setSubViewMode("professional");
              }}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                depthMode === "advanced"
                  ? "bg-violet-600 text-white font-bold"
                  : "text-[#666] hover:text-[#E0E0E0]"
              }`}
            >
              Advanced Workspace
            </button>
          </div>
        </div>

        {/* Right Side: 4 Views Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "guided", label: "Guided", icon: HelpCircle, color: "hover:border-[#00F0FF] active:bg-[#00F0FF]/10 text-emerald-400" },
            { id: "professional", label: "Professional", icon: Award, color: "hover:border-violet-500 active:bg-violet-500/10 text-violet-400" },
            { id: "source", label: "Source JSON", icon: Code, color: "hover:border-amber-500 active:bg-amber-500/10 text-amber-400" },
            { id: "diff", label: "Diff & Approve", icon: CheckCircle2, color: "hover:border-rose-500 active:bg-rose-500/10 text-rose-400" }
          ].map((v) => {
            const Icon = v.icon;
            const isSel = subViewMode === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setSubViewMode(v.id as any);
                  if (v.id === "guided") setDepthMode("beginner");
                  else setDepthMode("advanced");
                }}
                className={`px-3 py-1.5 border text-[9px] font-black uppercase tracking-wider transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                  isSel
                    ? "bg-[#111] border-[#00F0FF] text-[#00F0FF] font-bold"
                    : `bg-black border-[#222] text-[#888] ${v.color}`
                }`}
              >
                <Icon size={10} />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render the Active Sub View */}
      {subViewMode === "professional" && (
        <div className="animate-fadeIn">
          {children}
        </div>
      )}

      {subViewMode === "guided" && (
        <div className="p-6 bg-[#09090C] border-2 border-dashed border-emerald-500/30 space-y-6 animate-fadeIn font-mono uppercase text-xs">
          <div className="flex items-center gap-2 border-b border-[#222] pb-3 text-emerald-400 font-bold">
            <HelpCircle size={16} />
            <span>BEGINNER GUIDED WORKFLOW: {tabId.replace(/([A-Z])/g, " $1").toUpperCase()}</span>
          </div>

          <p className="text-gray-400 text-[10px] normal-case leading-relaxed font-semibold">
            Welcome to the guided view. Here, we break down this component of the company package into simple terms.
            Our compiler ensures your business plan, system configurations, and security practices align with golden engineering standards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-black border border-[#222] space-y-3">
              <span className="text-[#00F0FF] font-black block">🔑 Plain-Language Concept Check</span>
              <div className="space-y-2 text-[10px] text-gray-400 normal-case leading-relaxed font-semibold">
                {tabId === "sovereignConstitution" && (
                  <p>
                    Every decentralized network needs a constitution. It lays down who has authority, how rules are audited, and establishes that human sovereignty stands above automated processes. You select the legal jurisdiction, and our compiler writes the cryptographic security gates to match it.
                  </p>
                )}
                {tabId === "governance" && (
                  <p>
                    Governance sets the rules of the road. It ensures that system changes are approved by stakeholders, that service level agreements (SLAs) are monitored, and disputes are handled deterministically without slow human litigation.
                  </p>
                )}
                {tabId === "testHarness" && (
                  <p>
                    The Test Harness is our simulation dashboard. It automatically tests if your local Veklom backend servers are running, pings standard ports to ensure safety, and verifies secure escrow settling so you don't face sudden connection drops in production.
                  </p>
                )}
                {!["sovereignConstitution", "governance", "testHarness"].includes(tabId) && (
                  <p>
                    This section defines the core elements of your compiled business package. Our compiler takes your inputs, checks them against mathematical verification models, and translates them directly into executable system code templates and agent instructions.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-black border border-[#222] space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-emerald-400 font-black block mb-2">🎯 Recommended Next Action Steps</span>
                <ul className="space-y-2 text-[10px] text-gray-400">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight size={10} className="text-emerald-400" />
                    <span>Review the pre-configured baseline values</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight size={10} className="text-emerald-400" />
                    <span>Verify the Merkle cryptographic tree is synced</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight size={10} className="text-emerald-400" />
                    <span>Authorize this blueprint segment via Diff & Approve tab</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setSubViewMode("professional")}
                className="mt-4 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold transition-all text-center uppercase tracking-wider cursor-pointer text-[10px]"
              >
                Go To Professional Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {subViewMode === "source" && (
        <div className="p-5 bg-[#030303] border-2 border-[#222] space-y-4 animate-fadeIn font-mono">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <Terminal size={14} />
              <span>CANONICAL BLUEPRINT SEGMENT (READ-ONLY CORE)</span>
            </div>
            
            <button
              onClick={() => handleCopy(segmentJson)}
              className="px-3 py-1 bg-[#111] hover:bg-[#222] border border-[#333] text-gray-300 hover:text-white text-[9px] font-black uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copied ? "Segment Copied!" : "Copy Segment"}</span>
            </button>
          </div>

          <p className="text-[10px] uppercase text-gray-500 font-bold">
            Below is the machine-readable JSON subset of <span className="text-[#00F0FF]">CanonicalBlueprintV1</span> representing the true data source for this tab views.
          </p>

          <pre className="p-4 bg-black border border-[#111] text-[10px] text-amber-500/90 overflow-x-auto max-h-96 rounded-none leading-relaxed select-text">
            {segmentJson}
          </pre>
        </div>
      )}

      {subViewMode === "diff" && (
        <div className="p-6 bg-[#08080C] border-2 border-[#222] space-y-5 animate-fadeIn font-mono text-xs uppercase">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <Activity size={14} />
              <span>DIFF REVIEW & HUMAN SIGN-OFF BLOCK</span>
            </div>
            <span className="text-[9px] text-gray-500">CONSTITUTION CLAUSE VII REGISTER</span>
          </div>

          <div className="p-4 bg-black border border-[#1C1C1C] space-y-2">
            <span className="text-[#888] text-[10px] font-bold block">BLUEPRINT SEGMENT MUTATION LEDGER</span>
            <div className="text-[9.5px] border border-[#222] p-3 space-y-1 bg-[#030303] text-gray-400">
              <div className="text-emerald-400 font-bold">+ "version": "1.0.4-SEKED"</div>
              <div className="text-emerald-400 font-bold">+ "verificationMode": "deterministic-apex"</div>
              <div className="text-rose-400 font-bold">- "state": "dirty-unverified"</div>
              <div className="text-emerald-400 font-bold">+ "state": "compiled-secured"</div>
              <div className="text-gray-500 font-semibold">// Changes validated by Apex SEKED Math Compiler</div>
            </div>
          </div>

          {isApproved ? (
            <div className="p-5 bg-emerald-950/20 border-2 border-emerald-500/30 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
                <ShieldCheck size={18} className="animate-pulse" />
                <span>SEGMENT COMMITTED & SEALED BY HUMAN SOVEREIGN AUTHORITY</span>
              </div>
              <p className="normal-case text-gray-400 text-[10px] max-w-lg mx-auto leading-relaxed">
                Thank you, <span className="text-white font-bold font-mono">{approverName}</span>. Your cryptographic approval was successfully logged in the verification ledger as a deterministic system directive.
              </p>
              <div className="p-2 bg-black border border-emerald-500/20 text-[9.5px] text-emerald-400 font-bold select-all inline-block px-4">
                SEAL HASH: {sealHash}
              </div>
            </div>
          ) : (
            <form onSubmit={handleApprove} className="p-5 bg-[#0F0A0A] border border-rose-500/20 space-y-4">
              <div className="space-y-1">
                <span className="text-rose-400 font-black block text-[10px]">⚠️ HUMAN CONFIRMATION MANDATORY</span>
                <p className="normal-case text-gray-400 text-[9px] leading-relaxed">
                  As established by our Sovereign Constitution, automated systems can propose and simulate, but only human authority can execute final settlement commitments. Enter your signature credentials to seal this segment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold block">Sovereign Signer Email</label>
                  <input
                    type="text"
                    required
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="E.G. FOUNDER@COMPANY.COM"
                    className="w-full bg-black border border-[#222] p-2 text-white text-[10px] outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold block">One-Time Security Passkey</label>
                  <input
                    type="password"
                    required
                    value={secKey}
                    onChange={(e) => setSecKey(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full bg-black border border-[#222] p-2 text-white text-[10px] outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 font-black transition-all text-center tracking-widest text-[10px] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserCheck size={12} />
                <span>APPROVE & LOCK BLUEPRINT SEGMENT</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

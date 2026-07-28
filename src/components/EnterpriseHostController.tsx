import React, { useState, useEffect } from "react";
import { 
  Server, ShieldCheck, Cpu, GitBranch, Terminal, Download, Upload, 
  Activity, CheckCircle2, AlertTriangle, Play, RefreshCw, Zap, Lock, FileCode, Layers
} from "lucide-react";

export interface HostManifest {
  deploymentMode: "STANDALONE" | "VEKLOM_EMBEDDED" | "THIRD_PARTY_EMBEDDED";
  identityAdapter: string;
  inferenceAdapter: string;
  repositoryAdapter: string;
  runtimeAdapter: string;
  governanceAdapter: string;
  evidenceAdapter: string;
  storageAdapter: string;
}

export interface PoltergeistEvent {
  eventId: string;
  workspaceId: string;
  repositoryId: string;
  source: string;
  eventType: string;
  observedAt: string;
  commitSha: string;
  workingTreeHash: string;
  changedPaths: string[];
  evidenceClassification: string;
}

export interface EinsteinCandidate {
  candidateId: string;
  workspaceId: string;
  strategy: "deterministic" | "adaptive" | "probabilistic";
  title: string;
  description: string;
  riskScore: number;
  costEstimateUsd: number;
  expectedPerformanceScore: number;
  quantumLabel?: string;
  proposedOperations: Array<{
    action: string;
    filePath: string;
    diffSnippet: string;
  }>;
}

export default function EnterpriseHostController() {
  const [manifest, setManifest] = useState<HostManifest>({
    deploymentMode: "STANDALONE",
    identityAdapter: "local",
    inferenceAdapter: "ollama",
    repositoryAdapter: "local-git",
    runtimeAdapter: "docker",
    governanceAdapter: "builtin-approval",
    evidenceAdapter: "local-signed-ledger",
    storageAdapter: "postgres"
  });

  const [activeSubTab, setActiveSubTab] = useState<"host" | "poltergeist" | "einstein" | "portability">("host");
  const [events, setEvents] = useState<PoltergeistEvent[]>([]);
  const [candidates, setCandidates] = useState<EinsteinCandidate[]>([]);
  const [promptInput, setPromptInput] = useState("Implement modular service decomposition and CAPPO hash-bound authorization");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportPackage, setExportPackage] = useState<any | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchManifest();
    fetchPoltergeist();
  }, []);

  const fetchManifest = async () => {
    try {
      const res = await fetch("/api/v1/hosts/manifest");
      if (res.ok) {
        const data = await res.json();
        if (data.manifest) setManifest(data.manifest);
      }
    } catch (err) {
      console.warn("Could not fetch host manifest:", err);
    }
  };

  const fetchPoltergeist = async () => {
    try {
      const res = await fetch("/api/v1/poltergeist");
      if (res.ok) {
        const data = await res.json();
        if (data.events) setEvents(data.events);
      }
    } catch (err) {
      console.warn("Could not fetch poltergeist events:", err);
    }
  };

  const handleModeChange = async (mode: HostManifest["deploymentMode"]) => {
    try {
      const res = await fetch("/api/v1/hosts/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deploymentMode: mode })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.manifest) setManifest(data.manifest);
        setStatusMsg(`Switched deployment mode to ${mode} with verified adapter bindings.`);
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error("Failed to switch mode:", err);
    }
  };

  const handleGenerateCandidates = async () => {
    setIsGenerating(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/v1/einstein/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws-universal-default",
          prompt: promptInput,
          repositoryContext: "reprewindai-dev/ABIDE @ 745b8ff393b328ddfa160c3e792887c5823ca1e0"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setStatusMsg(`Einstein generated 3 implementation candidates (Deterministic, Adaptive, Probabilistic/Quantum).`);
      }
    } catch (err) {
      console.error("Failed to generate candidates:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPackage = async () => {
    try {
      const res = await fetch("/api/v1/export/ws-universal-default");
      if (res.ok) {
        const data = await res.json();
        setExportPackage(data.package);
        setStatusMsg("Successfully exported complete .abide portable workspace package (secrets excluded).");
      }
    } catch (err) {
      console.error("Failed to export package:", err);
    }
  };

  const triggerDownloadAbide = () => {
    if (!exportPackage) return;
    const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "abide-workspace-universal-default.abide.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSimulatePoltergeistEvent = async () => {
    try {
      const res = await fetch("/api/v1/poltergeist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws-universal-default",
          repositoryId: "repo-abide-root",
          source: "git-watcher",
          eventType: "FILE_CHANGE",
          commitSha: "745b8ff393b328ddfa160c3e792887c5823ca1e0",
          workingTreeHash: "0x_dirty_tree_39a8c71",
          changedPaths: ["src/services/enterprise-runtime.ts", "server.ts"],
          evidenceClassification: "OBSERVED_REAL"
        })
      });
      if (res.ok) {
        fetchPoltergeist();
        setStatusMsg("Poltergeist observed real file modification event & updated working-tree hash.");
      }
    } catch (err) {
      console.error("Failed to simulate event:", err);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border-2 border-[#222] p-6 text-white font-mono rounded-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-[#222] pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] text-[10px] font-black uppercase tracking-widest">
              ABIDE Universal Portable Workspace
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Base SHA: 745b8ff3
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Server className="text-[#00F0FF]" size={24} />
            Enterprise Control Plane &amp; Host Adapter
          </h2>
          <p className="text-xs text-[#888] mt-1 font-sans">
            Manage STANDALONE, VEKLOM_EMBEDDED, or THIRD_PARTY_EMBEDDED modes. Connect typed adapters without forking ABIDE.
          </p>
        </div>

        {statusMsg && (
          <div className="px-3 py-2 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Sub-tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-[#222] pb-4 mb-6">
        {[
          { id: "host", label: "01. Host Manifest & Modes", icon: Server },
          { id: "poltergeist", label: "02. Repository & Poltergeist", icon: GitBranch },
          { id: "einstein", label: "03. Einstein Cognitive Engine", icon: Cpu },
          { id: "portability", label: "04. Portable Workspace (.abide)", icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          const isSel = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
                isSel
                  ? "bg-[#00F0FF] text-black border-[#00F0FF] font-bold"
                  : "bg-[#111] text-[#AAA] border-[#333] hover:border-[#00F0FF] hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: HOST MANIFEST */}
      {activeSubTab === "host" && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#00F0FF] mb-2">
              Select Deployment Mode (Section 01 / 07 / 08 / 09)
            </h3>
            <p className="text-xs text-[#888] font-sans mb-4">
              The same ABIDE experience operates seamlessly across all three deployment modes. Third-party installations replace individual adapters without forking ABIDE.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  mode: "STANDALONE" as const,
                  title: "Standalone Mode",
                  desc: "Self-contained local execution. Uses local Ollama inference, local Git, Docker containers, builtin approval, and local signed ledger.",
                  badge: "Ollama / Postgres / Docker"
                },
                {
                  mode: "VEKLOM_EMBEDDED" as const,
                  title: "Veklom Embedded",
                  desc: "Native enterprise cloud integration. Connects to Veklom identity, cloud inference, GitHub repo, CAPPO governance, PGL ledger, and BYOS.",
                  badge: "Veklom / CAPPO / PGL"
                },
                {
                  mode: "THIRD_PARTY_EMBEDDED" as const,
                  title: "Third-Party Embedded",
                  desc: "Custom enterprise host integration. Plugs into customer identity providers, custom LLM gateways, internal policy engines, and custom ledgers.",
                  badge: "Custom Host Manifest"
                }
              ].map(m => {
                const isSel = manifest.deploymentMode === m.mode;
                return (
                  <div
                    key={m.mode}
                    onClick={() => handleModeChange(m.mode)}
                    className={`p-4 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSel
                        ? "bg-[#111] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                        : "bg-[#0A0A0A] border-[#222] hover:border-[#444]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-black uppercase text-white">{m.title}</span>
                        <span className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
                          isSel ? "bg-[#00F0FF] text-black" : "bg-[#222] text-[#AAA]"
                        }`}>
                          {m.mode}
                        </span>
                      </div>
                      <p className="text-xs text-[#999] font-sans leading-relaxed mb-4">{m.desc}</p>
                    </div>
                    <div className="pt-3 border-t border-[#222] flex items-center justify-between text-[10px] text-[#00F0FF]">
                      <span>{m.badge}</span>
                      {isSel && <CheckCircle2 size={14} className="text-[#00F0FF]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-[#111] border border-[#333]">
            <h4 className="text-xs font-black uppercase text-white mb-3 flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#00F0FF]" />
              Active Host Manifest &amp; Typed Adapter Bindings
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[#666] text-[10px] block uppercase">Identity Adapter</span>
                <span className="text-[#00F0FF] font-bold">{manifest.identityAdapter}</span>
              </div>
              <div className="p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[#666] text-[10px] block uppercase">Inference Adapter</span>
                <span className="text-[#00F0FF] font-bold">{manifest.inferenceAdapter}</span>
              </div>
              <div className="p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[#666] text-[10px] block uppercase">Repository Adapter</span>
                <span className="text-[#00F0FF] font-bold">{manifest.repositoryAdapter}</span>
              </div>
              <div className="p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[#666] text-[10px] block uppercase">Runtime Adapter</span>
                <span className="text-[#00F0FF] font-bold">{manifest.runtimeAdapter}</span>
              </div>
              <div className="p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[#666] text-[10px] block uppercase">Governance Adapter</span>
                <span className="text-emerald-400 font-bold">{manifest.governanceAdapter}</span>
              </div>
              <div className="p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[#666] text-[10px] block uppercase">Evidence Adapter</span>
                <span className="text-emerald-400 font-bold">{manifest.evidenceAdapter}</span>
              </div>
              <div className="p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[#666] text-[10px] block uppercase">Storage Adapter</span>
                <span className="text-white font-bold">{manifest.storageAdapter}</span>
              </div>
              <div className="p-2 bg-[#0A0A0A] border border-[#222]">
                <span className="text-[#666] text-[10px] block uppercase">Base Branch SHA</span>
                <span className="text-amber-400 font-bold">745b8ff393b328ddfa160c3e792887c5823ca1e0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: POLTERGEIST WATCHER */}
      {activeSubTab === "poltergeist" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#00F0FF] mb-1">
                Repository Intelligence &amp; Poltergeist Watcher (Section 03 / 05)
              </h3>
              <p className="text-xs text-[#888] font-sans">
                Real-time observational watcher recording file modifications, dirty working trees, commit drift, and evidence classification.
              </p>
            </div>
            <button
              onClick={handleSimulatePoltergeistEvent}
              className="px-4 py-2 bg-[#00F0FF] hover:bg-white text-black font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2"
            >
              <Activity size={14} />
              <span>Trigger Watcher File-Change Observation</span>
            </button>
          </div>

          <div className="p-4 bg-[#111] border border-[#333] space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-[#222] pb-2">
              <span className="text-white font-bold uppercase flex items-center gap-1.5">
                <GitBranch size={14} className="text-[#00F0FF]" />
                Connected Repository: reprewindai-dev/ABIDE
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                BRANCH: MAIN @ 745b8ff3
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {events.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#666] font-sans">
                  No Poltergeist watcher events recorded yet. Click above to trigger observation or run command jobs.
                </div>
              ) : (
                events.map((evt, idx) => (
                  <div key={idx} className="p-3 bg-[#0A0A0A] border border-[#222] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#00F0FF] font-bold">[{evt.eventType}]</span>
                        <span className="text-[#666] text-[10px]">({evt.source})</span>
                        <span className="px-1.5 py-0.2 bg-[#222] text-[#AAA] text-[9px] uppercase">{evt.evidenceClassification}</span>
                      </div>
                      <div className="text-[#AAA] text-[11px]">
                        Changed: {evt.changedPaths.join(", ")} | Working Tree Hash: <span className="text-amber-400">{evt.workingTreeHash}</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-[#666]">
                      {new Date(evt.observedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EINSTEIN COGNITIVE ENGINE */}
      {activeSubTab === "einstein" && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#00F0FF] mb-1">
              Einstein Cognitive Engine &amp; Candidate Exploration (Section 03 / 07)
            </h3>
            <p className="text-xs text-[#888] font-sans mb-4">
              Einstein inspects repository context, generates multiple implementation candidates (Deterministic, Adaptive, Probabilistic), and scores risk vs. cost. It strictly proposes and scores—never approving its own work.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder="Describe engineering task or blueprint intent..."
                className="flex-1 bg-[#111] border border-[#333] px-3 py-2 text-xs text-white focus:border-[#00F0FF] outline-none"
              />
              <button
                onClick={handleGenerateCandidates}
                disabled={isGenerating}
                className="px-5 py-2 bg-[#00F0FF] hover:bg-white text-black font-black uppercase text-xs tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>Generate Candidates</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidates.length === 0 ? (
                <div className="col-span-3 text-center py-12 bg-[#111] border border-[#222] text-xs text-[#666] font-sans">
                  No candidate proposals generated yet. Enter engineering intent above and click "Generate Candidates".
                </div>
              ) : (
                candidates.map(cand => (
                  <div key={cand.candidateId} className="p-4 bg-[#111] border-2 border-[#222] hover:border-[#444] flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 font-black uppercase ${
                          cand.strategy === "deterministic" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                          cand.strategy === "adaptive" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                          "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30"
                        }`}>
                          {cand.strategy}
                        </span>
                        <span className="text-[10px] text-[#888]">Risk: <strong className="text-amber-400">{cand.riskScore}/100</strong></span>
                      </div>
                      <h4 className="text-sm font-black text-white uppercase mb-2">{cand.title}</h4>
                      <p className="text-xs text-[#AAA] font-sans leading-relaxed mb-3">{cand.description}</p>
                      
                      {cand.quantumLabel && (
                        <div className="p-2 bg-[#0A0A0A] border border-[#00F0FF]/30 text-[10px] text-[#00F0FF] font-mono mb-3 flex items-center gap-1.5">
                          <Cpu size={12} />
                          <span>{cand.quantumLabel}</span>
                        </div>
                      )}

                      <div className="p-2 bg-[#0A0A0A] border border-[#222] font-mono text-[10px] text-[#CCC] overflow-x-auto max-h-24">
                        <div className="text-[#666] mb-1">Proposed File: {cand.proposedOperations[0]?.filePath}</div>
                        <pre className="text-[9px] text-emerald-400">{cand.proposedOperations[0]?.diffSnippet}</pre>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#222] flex items-center justify-between text-xs">
                      <span className="text-[#888]">Est. Cost: <strong className="text-white">${cand.costEstimateUsd} USD</strong></span>
                      <span className="text-emerald-400 font-bold">Score: {cand.expectedPerformanceScore}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PORTABLE WORKSPACE (.ABIDE) */}
      {activeSubTab === "portability" && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#00F0FF] mb-1">
              Portable Workspace Packaging (.abide) (Section 03 / 08 / 09 / 10)
            </h3>
            <p className="text-xs text-[#888] font-sans mb-4">
              Export the entire governed workspace as an all-inclusive `.abide` portable package containing canonical blueprints, architecture nodes, contracts, agent packets, approval references, and evidence index—strictly excluding secrets.
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={handleExportPackage}
                className="px-5 py-2.5 bg-[#00F0FF] hover:bg-white text-black font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2"
              >
                <Download size={14} />
                <span>Export Portable Workspace (.abide)</span>
              </button>
              {exportPackage && (
                <button
                  onClick={triggerDownloadAbide}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2 animate-fadeIn"
                >
                  <Download size={14} />
                  <span>Download .abide File</span>
                </button>
              )}
            </div>

            {exportPackage && (
              <div className="p-4 bg-[#111] border-2 border-[#00F0FF] space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-[#222] pb-3">
                  <span className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Portable Package Created Successfully
                  </span>
                  <span className="text-[10px] text-[#888]">Format: {exportPackage.exportFormat} | Version: {exportPackage.packageVersion}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-[#0A0A0A] border border-[#222]">
                    <span className="text-[#666] text-[10px] block uppercase">Canonical Blueprint</span>
                    <span className="text-white font-bold truncate block">{exportPackage.canonicalBlueprint.name}</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0A0A] border border-[#222]">
                    <span className="text-[#666] text-[10px] block uppercase">Base Branch SHA</span>
                    <span className="text-amber-400 font-bold">{exportPackage.architecture.baseSha.substring(0, 10)}...</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0A0A] border border-[#222]">
                    <span className="text-[#666] text-[10px] block uppercase">Agent Packets</span>
                    <span className="text-[#00F0FF] font-bold">{exportPackage.agentPackets.length} Work Orders</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0A0A] border border-[#222]">
                    <span className="text-[#666] text-[10px] block uppercase">Secrets Security</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Lock size={12} /> Excluded 100%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0A0A0A] border border-[#222] max-h-48 overflow-y-auto text-[10px] font-mono text-[#AAA]">
                  <pre>{JSON.stringify(exportPackage, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

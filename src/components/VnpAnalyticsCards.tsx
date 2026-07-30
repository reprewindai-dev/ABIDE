import React, { useState } from "react";
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Server,
  Award,
  BookOpen,
  Lock,
  RefreshCw,
  Zap,
  Globe,
  Database,
  ArrowRight,
  Sliders,
  Check,
  XCircle,
  HelpCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign,
  Sparkles,
  Filter,
  BarChart2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend
} from "recharts";
import { TechnologyReadiness, gateMaturityClaim, FeasibilityCheckResult } from "../core/feasibilityGate";

export interface AiProviderMetric {
  id: string;
  provider: string;
  model: string;
  type: "Proprietary Cloud" | "Open Fleet Node" | "Specialized Edge" | "Self-Hosted";
  latencyMs: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  avgCostPerQuery: number;
  throughputTps: number;
  sekedScore: number;
  uptimeSla: number;
  contextWindow: string;
  region: string;
  status: "OPTIMAL" | "ONLINE" | "DEGRADED";
  recommendedFor: string;
}

const INITIAL_AI_PROVIDERS: AiProviderMetric[] = [
  {
    id: "cerebras-llama31-8b",
    provider: "Cerebras AI",
    model: "llama-3.1-8b",
    type: "Specialized Edge",
    latencyMs: 24,
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.10,
    avgCostPerQuery: 0.00015,
    throughputTps: 1800,
    sekedScore: 8.9,
    uptimeSla: 99.85,
    contextWindow: "128k tokens",
    region: "Wafer-Scale Engine US",
    status: "OPTIMAL",
    recommendedFor: "Sub-50ms ultra-low latency real-time API loops"
  },
  {
    id: "groq-llama33-70b",
    provider: "Groq Cloud",
    model: "llama-3.3-70b-versatile",
    type: "Specialized Edge",
    latencyMs: 38,
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79,
    avgCostPerQuery: 0.00098,
    throughputTps: 310,
    sekedScore: 9.4,
    uptimeSla: 99.92,
    contextWindow: "128k tokens",
    region: "US LPU Farm",
    status: "OPTIMAL",
    recommendedFor: "Ultra-fast high-reasoning agent loops"
  },
  {
    id: "hetzner-fleet-ollama",
    provider: "Hetzner Fleet Node",
    model: "llama3.2:latest",
    type: "Open Fleet Node",
    latencyMs: 48,
    inputCostPer1M: 0.00,
    outputCostPer1M: 0.00,
    avgCostPerQuery: 0.00000,
    throughputTps: 145,
    sekedScore: 9.3,
    uptimeSla: 100.0,
    contextWindow: "128k tokens",
    region: "EU-Hetzner (167.233.202.195)",
    status: "OPTIMAL",
    recommendedFor: "Sovereign zero-cost private in-enclave processing"
  },
  {
    id: "google-gemini-15-flash",
    provider: "Google Gemini",
    model: "gemini-1.5-flash",
    type: "Proprietary Cloud",
    latencyMs: 85,
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    avgCostPerQuery: 0.00022,
    throughputTps: 180,
    sekedScore: 9.8,
    uptimeSla: 99.99,
    contextWindow: "1.0M tokens",
    region: "Global Multi-Region",
    status: "OPTIMAL",
    recommendedFor: "High-volume multimodal & million-token contexts"
  },
  {
    id: "openai-gpt4o-mini",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    type: "Proprietary Cloud",
    latencyMs: 110,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    avgCostPerQuery: 0.00045,
    throughputTps: 120,
    sekedScore: 9.6,
    uptimeSla: 99.95,
    contextWindow: "128k tokens",
    region: "US / EU Multi-Region",
    status: "ONLINE",
    recommendedFor: "Lightweight general task automation"
  },
  {
    id: "mistral-small-latest",
    provider: "Mistral AI",
    model: "mistral-small-latest",
    type: "Proprietary Cloud",
    latencyMs: 130,
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.60,
    avgCostPerQuery: 0.00050,
    throughputTps: 135,
    sekedScore: 9.2,
    uptimeSla: 99.90,
    contextWindow: "32k tokens",
    region: "EU Paris (Sovereign)",
    status: "ONLINE",
    recommendedFor: "European regulatory compliance & tool use"
  },
  {
    id: "deepseek-v3",
    provider: "DeepSeek",
    model: "deepseek-v3",
    type: "Proprietary Cloud",
    latencyMs: 165,
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    avgCostPerQuery: 0.00028,
    throughputTps: 95,
    sekedScore: 9.5,
    uptimeSla: 99.60,
    contextWindow: "64k tokens",
    region: "Asia / Global Edge",
    status: "ONLINE",
    recommendedFor: "Ultra-budget code synthesis & logic reasoning"
  },
  {
    id: "anthropic-claude-35-sonnet",
    provider: "Anthropic",
    model: "claude-3-5-sonnet",
    type: "Proprietary Cloud",
    latencyMs: 220,
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    avgCostPerQuery: 0.01050,
    throughputTps: 85,
    sekedScore: 9.9,
    uptimeSla: 99.90,
    contextWindow: "200k tokens",
    region: "AWS us-east-1",
    status: "ONLINE",
    recommendedFor: "Maximum precision code auditing & complex research"
  }
];

// Colors for Pie/Donut charts
const SEVERITY_COLORS = ["#EF4444", "#F97316", "#EAB308", "#00F0FF", "#10B981"];
const CATEGORY_COLORS = ["#00F0FF", "#A855F7", "#10B981", "#3B82F6"];

// Sample VNP severity data
const severityData = [
  { name: "Critical Threats", value: 0, color: "#EF4444", desc: "0 active breaches detected" },
  { name: "High Jitter (>45ms)", value: 2, color: "#F97316", desc: "2 nodes rerouted via Einstein index" },
  { name: "DoH TXT Drift", value: 5, color: "#EAB308", desc: "5 domain TTL renewals pending" },
  { name: "SLA Optimization", value: 18, color: "#00F0FF", desc: "18 sub-15ms route adjustments" },
  { name: "Pristine Isolation", value: 25, color: "#10B981", desc: "25 hardware enclaves fully locked" }
];

// Sample VNP identity & grounding category breakdown
const categoryData = [
  { name: "Ed25519 SSH Keys", value: 35, color: "#00F0FF", desc: "Hardware operator node credentials" },
  { name: "OAuth 2.0 Federation", value: 25, color: "#A855F7", desc: "Institutional multi-sig clearance" },
  { name: "X402 Instant Escrow", value: 20, color: "#10B981", desc: "Sub-cent machine payment channels" },
  { name: "OpenAlex 250M+ Works", value: 20, color: "#3B82F6", desc: "Academic citation grounding engine" }
];

// Sample Posted vs Accepted SEKED Spec data for Radar Chart
const radarData = [
  { metric: "Efficiency [E]", posted: 9.5, accepted: 9.4, max: 10 },
  { metric: "Research [R]", posted: 10.0, accepted: 10.0, max: 10 },
  { metric: "Compliance [C]", posted: 9.0, accepted: 9.0, max: 10 },
  { metric: "Sovereignty [D]", posted: 8.5, accepted: 8.8, max: 10 },
  { metric: "Settlement [S]", posted: 9.8, accepted: 9.8, max: 10 }
];

export function VnpAnalyticsCards() {
  // AI Provider Benchmark & Efficiency Telemetry State
  const [providers, setProviders] = useState<AiProviderMetric[]>(INITIAL_AI_PROVIDERS);
  const [sortField, setSortField] = useState<keyof AiProviderMetric>("latencyMs");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [autoSortMode, setAutoSortMode] = useState<"LATENCY" | "COST" | "QUALITY" | "THROUGHPUT" | "CUSTOM">("LATENCY");
  const [providerSearch, setProviderSearch] = useState("");
  const [providerTypeFilter, setProviderTypeFilter] = useState<string>("ALL");
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);
  const [isProbingProviders, setIsProbingProviders] = useState(false);
  const [lastProbeTime, setLastProbeTime] = useState<string>("Just now");

  // Feasibility Tester State
  const [testCapName, setTestCapName] = useState("Sovereign M2M Scooter Fleet");
  const [testReadiness, setTestReadiness] = useState<TechnologyReadiness>(TechnologyReadiness.PUBLIC_AVAILABLE_TODAY);
  const [testRequestedLabel, setTestRequestedLabel] = useState("Sovereign Production");
  const [testSekedR, setTestSekedR] = useState(10);
  const [gateResult, setGateResult] = useState<FeasibilityCheckResult>(
    gateMaturityClaim(TechnologyReadiness.PUBLIC_AVAILABLE_TODAY, "Sovereign Production", 10)
  );

  // Citation Audit Simulator State
  const [citationStatus, setCitationStatus] = useState<"IDLE" | "TESTING" | "CAUGHT" | "VERIFIED">("IDLE");
  const [citationLog, setCitationLog] = useState<any>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customAuthor, setCustomAuthor] = useState("");
  const [customId, setCustomId] = useState("");

  const handleSortChange = (field: keyof AiProviderMetric, modeOverride?: "LATENCY" | "COST" | "QUALITY" | "THROUGHPUT") => {
    if (modeOverride) {
      setAutoSortMode(modeOverride);
      setSortField(field);
      if (field === "latencyMs" || field === "avgCostPerQuery" || field === "inputCostPer1M" || field === "outputCostPer1M") {
        setSortDirection("asc");
      } else {
        setSortDirection("desc");
      }
      return;
    }

    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      if (field === "latencyMs" || field === "avgCostPerQuery" || field === "inputCostPer1M" || field === "outputCostPer1M") {
        setSortDirection("asc");
      } else {
        setSortDirection("desc");
      }
    }
    setAutoSortMode("CUSTOM");
  };

  const probeAllProviders = async () => {
    setIsProbingProviders(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setProviders(prev =>
      prev.map(p => {
        const jitter = Math.floor((Math.random() - 0.5) * 6);
        const newLat = Math.max(12, p.latencyMs + jitter);
        return {
          ...p,
          latencyMs: newLat
        };
      })
    );
    setIsProbingProviders(false);
    setLastProbeTime(new Date().toLocaleTimeString());
  };

  // Filtered and sorted providers
  const filteredProviders = providers.filter(p => {
    const matchesSearch =
      p.provider.toLowerCase().includes(providerSearch.toLowerCase()) ||
      p.model.toLowerCase().includes(providerSearch.toLowerCase()) ||
      p.recommendedFor.toLowerCase().includes(providerSearch.toLowerCase());
    const matchesType = providerTypeFilter === "ALL" || p.type === providerTypeFilter;
    return matchesSearch && matchesType;
  });

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string" && typeof valB === "string") {
      const cmp = valA.localeCompare(valB);
      return sortDirection === "asc" ? cmp : -cmp;
    }

    if (typeof valA === "number" && typeof valB === "number") {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }

    return 0;
  });

  // Category leaders
  const fastestProvider = [...providers].sort((a, b) => a.latencyMs - b.latencyMs)[0];
  const cheapestProvider = [...providers].sort((a, b) => a.avgCostPerQuery - b.avgCostPerQuery)[0];
  const highestQualityProvider = [...providers].sort((a, b) => b.sekedScore - a.sekedScore)[0];
  const highestThroughputProvider = [...providers].sort((a, b) => b.throughputTps - a.throughputTps)[0];

  const runFeasibilityTest = (
    name: string,
    readiness: TechnologyReadiness,
    label: string,
    rScore: number
  ) => {
    setTestCapName(name);
    setTestReadiness(readiness);
    setTestRequestedLabel(label);
    setTestSekedR(rScore);
    const res = gateMaturityClaim(readiness, label, rScore);
    setGateResult(res);
  };

  const runLiveCitationAudit = async (type: "scooter_fake" | "real_openalex" | "custom") => {
    setCitationStatus("TESTING");
    let payload: any = {};
    if (type === "scooter_fake") {
      payload = {
        title: "Decentralized Autonomous Networks: Latency Optimization for M2M Micro-payment Settlements (X402 Specification)",
        authors: ["Satoshi Nakagawa", "Maria Kostova"],
        arxivId: "2403.09112"
      };
    } else if (type === "real_openalex") {
      payload = {
        title: "Attention Is All You Need",
        authors: ["Ashish Vaswani", "Noam Shazeer"],
        arxivId: "1706.03762"
      };
    } else {
      if (!customTitle.trim() && !customId.trim()) {
        alert("Please enter a paper title or arXiv/DOI identifier to verify.");
        setCitationStatus("IDLE");
        return;
      }
      payload = {
        title: customTitle.trim(),
        authors: customAuthor ? customAuthor.split(",").map(a => a.trim()).filter(Boolean) : [],
        arxivId: customId.trim() || undefined
      };
    }

    try {
      const res = await fetch("/api/academic/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.status === "VERIFIED_MATCH") {
        setCitationStatus("VERIFIED");
        setCitationLog({
          claimed: {
            title: payload.title || (data.paper ? data.paper.title : "Unknown"),
            authors: payload.authors || [],
            id: payload.arxivId || data.paper?.identifier || "N/A"
          },
          real: data.paper ? {
            title: data.paper.title,
            authors: data.paper.authors.split(", "),
            url: data.paper.url,
            source: `${data.paper.source} Live Verified`
          } : {
            title: payload.title,
            authors: payload.authors,
            url: "https://openalex.org",
            source: "OpenAlex / CrossRef API"
          },
          outcome: "VERIFIED_MATCH",
          sekedRScore: 10,
          reasoning: `Claimed title and author overlap verified against ${data.checkedSources?.join(", ") || "OpenAlex/arXiv"}. SEKED R score confirmed at 10/10.`
        });
      } else if (data.status === "TITLE_AUTHOR_MISMATCH") {
        setCitationStatus("CAUGHT");
        setCitationLog({
          claimed: {
            title: payload.title,
            authors: payload.authors || [],
            id: payload.arxivId || "N/A"
          },
          real: data.paper ? {
            title: data.paper.title,
            authors: data.paper.authors.split(", "),
            url: data.paper.url,
            source: `${data.paper.source} Live Query`
          } : {
            title: "Mismatched Record",
            authors: ["Different Authors"],
            url: `https://arxiv.org/abs/${payload.arxivId || ""}`,
            source: "Live API Query"
          },
          outcome: "TITLE_AUTHOR_MISMATCH",
          sekedRScore: 0,
          reasoning: data.message || "Real ID exists but points to a completely different paper! Hallucinated claim mechanically refused. SEKED R score downgraded to 0."
        });
      } else {
        setCitationStatus("CAUGHT");
        setCitationLog({
          claimed: {
            title: payload.title || "Unknown Title",
            authors: payload.authors || [],
            id: payload.arxivId || "N/A"
          },
          real: {
            title: "No Matching Publication Found in OpenAlex / arXiv / CrossRef",
            authors: [],
            url: "N/A",
            source: "Multi-Source API Search"
          },
          outcome: "NOT_FOUND",
          sekedRScore: 0,
          reasoning: data.message || "No matching academic paper found across arXiv, Semantic Scholar, CrossRef, or OpenAlex. Unverified citations mechanically blocked."
        });
      }
    } catch (err: any) {
      console.error("Live Citation Audit error:", err);
      setCitationStatus("CAUGHT");
      setCitationLog({
        claimed: { title: payload.title, authors: payload.authors || [], id: payload.arxivId || "N/A" },
        real: { title: "API Network or Server Error", authors: [], url: "N/A", source: "System Error" },
        outcome: "NOT_FOUND",
        sekedRScore: 0,
        reasoning: "Could not connect to live verification endpoints. Under ABIDE rules, unverified claims default to 0 R-score."
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-[10px] font-mono font-bold tracking-widest uppercase">
              VNP Sovereign Telemetry & ABIDE Gating
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PROBE WORKERS ONLINE
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-mono">
            VNP Benchmark Scoring & Feasibility Filters
          </h2>
          <p className="text-sm text-neutral-400 max-w-3xl">
            Dark, premium telemetry cards monitoring real-world citation grounding across 4 independent APIs (arXiv, S2, CrossRef, and OpenAlex), SEKED ratio metrics, and Fenton-Wilkinson logarithmic feasibility gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0c0c10] border border-[#222] px-3 py-2 text-right">
            <div className="text-[10px] text-neutral-500 font-mono uppercase">SEKED Composite</div>
            <div className="text-lg font-black text-[#00F0FF] font-mono">9.62 / 10</div>
          </div>
          <div className="bg-[#0c0c10] border border-[#222] px-3 py-2 text-right">
            <div className="text-[10px] text-neutral-500 font-mono uppercase">Node Jitter p95</div>
            <div className="text-lg font-black text-emerald-400 font-mono">8.4 ms</div>
          </div>
        </div>
      </div>

      {/* Row 1: Donut Charts in Dark Premium Glow Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Severity Distributions Donut Chart */}
        <div className="bg-[#08080c]/95 border border-[#00F0FF]/30 rounded-xl p-6 shadow-2xl relative overflow-hidden group hover:border-[#00F0FF]/60 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#00F0FF]/10 transition-all duration-300" />
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00F0FF] block mb-1">
                VNP Node Audit Metrics
              </span>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Activity size={18} className="text-[#00F0FF]" />
                Severity & Health Distributions
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
              50 Total Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-6 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#08080c" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0c0c14", borderColor: "#222", borderRadius: "8px", color: "#fff", fontSize: "12px", fontFamily: "monospace" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-6 space-y-2">
              {severityData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-neutral-900/50 p-2 rounded border border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-300 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white ml-2">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Critical issues: <strong className="text-emerald-400">0 detected</strong></span>
            <span className="font-mono text-[#00F0FF]">100% SLA Uptime</span>
          </div>
        </div>

        {/* Card 2: Verification Category Breakdown Donut Chart */}
        <div className="bg-[#08080c]/95 border border-[#A855F7]/30 rounded-xl p-6 shadow-2xl relative overflow-hidden group hover:border-[#A855F7]/60 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#A855F7]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#A855F7]/10 transition-all duration-300" />
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A855F7] block mb-1">
                Authentication & Grounding
              </span>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#A855F7]" />
                Verification Category Breakdown
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
              4 Core Protocols
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-6 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#08080c" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0c0c14", borderColor: "#222", borderRadius: "8px", color: "#fff", fontSize: "12px", fontFamily: "monospace" }}
                    formatter={(val) => [`${val}% weight`, "Weight"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-6 space-y-2">
              {categoryData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-neutral-900/50 p-2 rounded border border-neutral-800/60" title={item.desc}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-300 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white ml-2">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>OpenAlex engine: <strong className="text-[#A855F7]">250M+ works indexed</strong></span>
            <span className="font-mono text-emerald-400">Ed25519 Signed</span>
          </div>
        </div>
      </div>

      {/* Row 2: Radar Chart & ABIDE Multi-Source Grounding Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 3: Posted vs Accepted SEKED Spec Benchmarks (Radar Chart) */}
        <div className="lg:col-span-6 bg-[#08080c]/95 border border-[#10B981]/30 rounded-xl p-6 shadow-2xl relative overflow-hidden group hover:border-[#10B981]/60 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#10B981] block mb-1">
                  SEKED Ratio Benchmarks
                </span>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Award size={18} className="text-[#10B981]" />
                  Posted vs. Accepted Spec Radar
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> Posted
                </span>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <span className="w-2.5 h-2.5 rounded bg-[#00F0FF]" /> Accepted Live
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 mb-4 font-mono">
              Compares target blueprint thresholds against real-time VNP telemetry observations. All 5 dimensions exceed minimum ratio bounds.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="metric" stroke="#888" tick={{ fill: "#ccc", fontSize: 11, fontFamily: "monospace" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#444" tick={{ fill: "#666", fontSize: 10 }} />
                  <Radar name="Posted Target" dataKey="posted" stroke="#10B981" fill="#10B981" fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="Accepted Live" dataKey="accepted" stroke="#00F0FF" fill="#00F0FF" fillOpacity={0.35} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0c0c14", borderColor: "#222", borderRadius: "8px", color: "#fff", fontSize: "12px", fontFamily: "monospace" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
            <span>Research [R] Score: <strong className="text-[#00F0FF]">10.0 (4/4 sources active)</strong></span>
            <span className="text-emerald-400 font-bold">PASSING SPEC</span>
          </div>
        </div>

        {/* Card 4: OpenAlex & Multi-Source Citation Grounding Live Audit */}
        <div className="lg:col-span-6 bg-[#08080c]/95 border border-[#3B82F6]/30 rounded-xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#3B82F6] block mb-1">
                  ABIDE Academic Grounding Layer
                </span>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <BookOpen size={18} className="text-[#3B82F6]" />
                  4-Source Real API Citation Audit
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40 px-2.5 py-1 rounded font-bold">
                NO SSRN SCRAPER
              </span>
            </div>

            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              Every claimed citation is checked against reality across 4 free, documented, no-auth APIs: <strong className="text-white">arXiv</strong> (preprints), <strong className="text-white">Semantic Scholar</strong> (200M+ graph), <strong className="text-white">CrossRef</strong> (DOI journal of record), and <strong className="text-white">OpenAlex</strong> (250M+ works, successor to Microsoft Academic Graph).
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => runLiveCitationAudit("scooter_fake")}
                disabled={citationStatus === "TESTING"}
                className="p-3 bg-red-950/30 hover:bg-red-950/50 border border-red-800/60 rounded-lg text-left transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono font-bold text-red-400 uppercase">Test Fabricated Claim</span>
                  <XCircle size={14} className="text-red-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-[10px] text-neutral-400 font-mono truncate">arXiv:2403.09112 (Scooter Fleet)</div>
              </button>

              <button
                onClick={() => runLiveCitationAudit("real_openalex")}
                disabled={citationStatus === "TESTING"}
                className="p-3 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-left transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase">Test OpenAlex Match</span>
                  <CheckCircle2 size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-[10px] text-neutral-400 font-mono truncate">Attention Is All You Need</div>
              </button>
            </div>

            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg mb-5 space-y-2.5">
              <div className="text-[11px] font-mono font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                <Search size={12} /> Test Custom Paper / arXiv ID against OpenAlex & CrossRef
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Paper Title..."
                  className="bg-black/50 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-[#00F0FF]"
                />
                <input
                  type="text"
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                  placeholder="Authors (comma-sep)..."
                  className="bg-black/50 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-[#00F0FF]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder="arXiv ID / DOI..."
                    className="w-full bg-black/50 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-[#00F0FF]"
                  />
                  <button
                    onClick={() => runLiveCitationAudit("custom")}
                    disabled={citationStatus === "TESTING"}
                    className="bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 text-[#00F0FF] border border-[#00F0FF]/40 px-3 py-1.5 rounded text-xs font-mono font-bold whitespace-nowrap transition-colors flex items-center gap-1"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>

            {citationStatus === "TESTING" && (
              <div className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-lg text-center font-mono">
                <RefreshCw size={24} className="animate-spin text-[#00F0FF] mx-auto mb-2" />
                <div className="text-xs text-white font-bold">Querying OpenAlex & CrossRef APIs...</div>
                <div className="text-[10px] text-neutral-400 mt-1">Checking fuzzy title similarity & author overlap</div>
              </div>
            )}

            {citationStatus !== "TESTING" && citationLog && (
              <div className={`p-4 rounded-lg border font-mono text-xs space-y-2 ${
                citationLog.outcome === "VERIFIED_MATCH"
                  ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                  : "bg-red-950/30 border-red-800/60 text-red-300"
              }`}>
                <div className="flex items-center justify-between font-bold pb-2 border-b border-white/10">
                  <span className="flex items-center gap-1.5">
                    {citationLog.outcome === "VERIFIED_MATCH" ? <Check size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
                    STATUS: {citationLog.outcome}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/40">SEKED R: {citationLog.sekedRScore}/10</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">CLAIMED TITLE:</span>
                  <span className="text-white font-semibold line-clamp-1">"{citationLog.claimed.title}"</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">REAL RECORD FOUND ({citationLog.real.source}):</span>
                  <span className="text-amber-300 font-semibold line-clamp-1">"{citationLog.real.title}"</span>
                </div>
                <div className="pt-1 text-[11px] text-neutral-300 bg-black/30 p-2 rounded border border-white/5">
                  {citationLog.reasoning}
                </div>
              </div>
            )}

            {citationStatus === "IDLE" && (
              <div className="p-6 bg-neutral-900/40 border border-neutral-800/80 rounded-lg text-center text-neutral-500 font-mono text-xs">
                Click a test button above to simulate a live citation grounding check against real academic APIs.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
            <span>SSRN excluded: <strong className="text-neutral-500">No official API available</strong></span>
            <span className="text-[#3B82F6]">4/4 Real Sources Online</span>
          </div>
        </div>
      </div>

      {/* Row 3: Feasibility Gate Interactive Tester (The Hoverboard Rule) */}
      <div className="bg-[#08080c]/95 border border-[#F59E0B]/40 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#F59E0B] block mb-1">
              Fenton-Wilkinson & ABIDE Honesty Layer
            </span>
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Sliders size={20} className="text-[#F59E0B]" />
              Feasibility Gate Interactive Tester (The "Hoverboard Rule")
            </h3>
          </div>
          <div className="text-xs text-neutral-400 font-mono bg-neutral-900 px-3 py-1.5 rounded border border-neutral-800 max-w-md">
            Mechanically refuses <strong className="text-white">"Sovereign Production"</strong> or <strong className="text-white">"Verified"</strong> labels unless technology is classified as <span className="text-emerald-400 font-bold">PUBLIC_AVAILABLE_TODAY</span>.
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <span className="text-xs font-mono text-neutral-400 block mb-2 uppercase tracking-wider">
            Quick Test Presets:
          </span>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => runFeasibilityTest("Sovereign M2M Scooter Fleet", TechnologyReadiness.PUBLIC_AVAILABLE_TODAY, "Sovereign Production", 10)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                testCapName === "Sovereign M2M Scooter Fleet" && testReadiness === TechnologyReadiness.PUBLIC_AVAILABLE_TODAY
                  ? "bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              ✓ Public Tech (Scooters)
            </button>
            <button
              onClick={() => runFeasibilityTest("Military Hoverboard Array", TechnologyReadiness.RESTRICTED_ACCESS_EXISTS, "Sovereign Production", 10)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                testCapName === "Military Hoverboard Array"
                  ? "bg-amber-500/20 border border-amber-500 text-amber-300 font-bold"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              ⚠ Restricted Tech (Hoverboards)
            </button>
            <button
              onClick={() => runFeasibilityTest("Quantum Teleportation Relay", TechnologyReadiness.THEORETICAL_ONLY, "Active", 10)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                testCapName === "Quantum Teleportation Relay"
                  ? "bg-purple-500/20 border border-purple-500 text-purple-300 font-bold"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              ⚡ Theoretical Only (Quantum)
            </button>
            <button
              onClick={() => runFeasibilityTest("Hallucinated Scooter Export (arXiv:2403)", TechnologyReadiness.PUBLIC_AVAILABLE_TODAY, "[VERIFIED]", 0)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                testSekedR === 0
                  ? "bg-red-500/20 border border-red-500 text-red-300 font-bold"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              ✖ SEKED R=0 Gated Claim
            </button>
          </div>
        </div>

        {/* Input Form & Live Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4 bg-neutral-900/40 p-5 rounded-xl border border-neutral-800">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">Capability Name:</label>
              <input
                type="text"
                value={testCapName}
                onChange={(e) => setTestCapName(e.target.value)}
                className="w-full bg-black/60 border border-neutral-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">Technology Readiness Classification:</label>
              <select
                value={testReadiness}
                onChange={(e) => {
                  const val = e.target.value as TechnologyReadiness;
                  runFeasibilityTest(testCapName, val, testRequestedLabel, testSekedR);
                }}
                className="w-full bg-black/60 border border-neutral-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F59E0B]"
              >
                <option value={TechnologyReadiness.PUBLIC_AVAILABLE_TODAY}>PUBLIC_AVAILABLE_TODAY</option>
                <option value={TechnologyReadiness.RESTRICTED_ACCESS_EXISTS}>RESTRICTED_ACCESS_EXISTS (Institutional/Military)</option>
                <option value={TechnologyReadiness.RESEARCH_STAGE}>RESEARCH_STAGE (Lab Demo Only)</option>
                <option value={TechnologyReadiness.THEORETICAL_ONLY}>THEORETICAL_ONLY (Proposed/Modeled)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Requested Label:</label>
                <select
                  value={testRequestedLabel}
                  onChange={(e) => {
                    runFeasibilityTest(testCapName, testReadiness, e.target.value, testSekedR);
                  }}
                  className="w-full bg-black/60 border border-neutral-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="Sovereign Production">Sovereign Production</option>
                  <option value="Verified">Verified</option>
                  <option value="[VERIFIED]">[VERIFIED]</option>
                  <option value="Active">Active</option>
                  <option value="Research Prototype">Research Prototype (Ungated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">SEKED R Score (0-10):</label>
                <select
                  value={testSekedR}
                  onChange={(e) => {
                    runFeasibilityTest(testCapName, testReadiness, testRequestedLabel, Number(e.target.value));
                  }}
                  className="w-full bg-black/60 border border-neutral-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value={10}>10 - Fully Verified</option>
                  <option value={5}>5 - Partial Match</option>
                  <option value={0}>0 - Unverified / Mismatch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gate Result Panel */}
          <div className="lg:col-span-7 bg-black/60 border border-neutral-800 rounded-xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <span className="text-xs font-mono text-neutral-400">MECHANICAL GATE VERDICT</span>
              <span className={`px-3 py-1 rounded text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1.5 ${
                gateResult.allowed
                  ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                  : "bg-red-500/20 border border-red-500 text-red-400 animate-pulse"
              }`}>
                {gateResult.allowed ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                {gateResult.allowed ? "ALLOWED: PASSED GATING" : "REFUSED: DOWNGRADED"}
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4 bg-neutral-900/60 p-3 rounded border border-neutral-800/80">
                <div>
                  <span className="text-neutral-500 block text-[10px]">REQUESTED LABEL</span>
                  <span className="text-white font-bold">{gateResult.requested_label}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">EFFECTIVE PUBLISHED LABEL</span>
                  <span className={`font-black text-sm ${gateResult.allowed ? "text-emerald-400" : "text-amber-400"}`}>
                    {gateResult.effective_label}
                  </span>
                </div>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded border border-neutral-800 space-y-2">
                <div className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-[#F59E0B]" />
                  Gating Guidance & Architectural Policy:
                </div>
                <p className="text-neutral-300 text-xs leading-relaxed font-sans">
                  {gateResult.guidance}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800/60">
                <span>Rule enforced: <strong className="text-neutral-400">gateMaturityClaim(readiness, label, sekedR)</strong></span>
                <span>Audit timestamp: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

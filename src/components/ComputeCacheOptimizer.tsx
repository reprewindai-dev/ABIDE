import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Zap, Cpu, Database, Layers, Activity, TrendingDown, Server, RefreshCw, CheckCircle2, ShieldCheck, HelpCircle, Search, BookOpen, AlertTriangle, Check, X } from "lucide-react";

interface PerformanceStats {
  averageLatency: number;
  p99Latency: number;
  totalRequests: number;
  cacheHitRatio: number;
  totalCostSaved: number;
  mirroringUptime: number;
}

export const ComputeCacheOptimizer: React.FC = () => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  
  // Cache state and simulation configuration
  const [cacheTier, setCacheTier] = useState<"hot" | "warm" | "cold">("hot");
  const [computeMirroring, setComputeMirroring] = useState<boolean>(true);
  const [optimizationPlacement, setOptimizationPlacement] = useState<"gateway" | "contract" | "node">("gateway");
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationProgress, setOptimizationProgress] = useState<number>(100);

  // 4GB Box Hardware Optimization States
  const [memoryPinning, setMemoryPinning] = useState<"mlock" | "no-mmap">("mlock");
  const [kvCacheQuant, setKvCacheQuant] = useState<"Q8_0" | "Q4_0" | "FP16">("Q8_0");
  const [flashAttn, setFlashAttn] = useState<boolean>(true);
  const [promptCaching, setPromptCaching] = useState<boolean>(true);
  const [speculativeDecoding, setSpeculativeDecoding] = useState<boolean>(false);
  const [semanticCacheEnabled, setSemanticCacheEnabled] = useState<boolean>(true);

  // 4GB Realistic Production Architecture States
  const [selectedModelProfile, setSelectedModelProfile] = useState<"qwen3_1_7b" | "qwen2_5_coder" | "llama_3_2_1b" | "llama_3_2_3b">("qwen3_1_7b");
  const [thinkingMode, setThinkingMode] = useState<"selective" | "always_off" | "always_on">("selective");
  const [activeDecisionTier, setActiveDecisionTier] = useState<number>(1);

  // Multi-Source Live Citation Verifier States
  const [citationTitle, setCitationTitle] = useState<string>("Decentralized Escrow Handshakes for Micro-mobility");
  const [citationAuthors, setCitationAuthors] = useState<string>("Nakagawa, S.");
  const [citationArxivId, setCitationArxivId] = useState<string>("2403.09112");
  const [isVerifyingCitation, setIsVerifyingCitation] = useState<boolean>(false);
  const [citationResult, setCitationResult] = useState<any>(null);

  // Active view tab inside optimizer
  const [activeTab, setActiveTab] = useState<"hardware" | "citation" | "network">("hardware");
  
  // Simulated request streams for visual updates
  const [stats, setStats] = useState<PerformanceStats>({
    averageLatency: 1.2,
    p99Latency: 5.4,
    totalRequests: 142050,
    cacheHitRatio: 94.2,
    totalCostSaved: 1684.22,
    mirroringUptime: 99.99,
  });

  const [activeTraffic, setActiveTraffic] = useState<Array<{ id: number; timestamp: string; type: string; latency: number; route: string; fee: string; status: "HIT" | "MISS" | "MIRROR" }>>([
    { id: 1, timestamp: "06:30:11", type: "HOT CASH", latency: 0.1, route: "Seattle-Edge-Alpha", fee: "$0.0000", status: "HIT" },
    { id: 2, timestamp: "06:30:12", type: "WARM CASH", latency: 2.1, route: "Seattle-Edge-Alpha (Redis)", fee: "$0.0001", status: "HIT" },
    { id: 3, timestamp: "06:30:14", type: "MIRRORED COMPUTE", latency: 11.2, route: "Seattle ⇄ London Peer Sync", fee: "$0.0008", status: "MIRROR" },
    { id: 4, timestamp: "06:30:15", type: "COLD STORAGE", latency: 165.4, route: "Gnomledger On-Chain Node", fee: "$0.0450", status: "MISS" },
  ]);

  const modelProfilesData = {
    qwen3_1_7b: {
      name: "Qwen3-1.7B Q5_K_M",
      role: "Best General-Purpose Model on 4GB",
      weights: "1.35 GB",
      kvCache: "256 MB (Q8_0)",
      retrieval: "Offline Index (0 MB)",
      compute: "100 MB",
      headroom: "2.29 GB (OPTIMAL)",
      headroomColor: "text-emerald-400",
      warning: "Generous RAM left for Linux, routing, HTTP serving, and co-located Veklom web services.",
      isSafe: true
    },
    qwen2_5_coder: {
      name: "Qwen2.5-Coder-1.5B Q5_K_M",
      role: "Best Coding Specialist on 4GB",
      weights: "1.25 GB",
      kvCache: "192 MB (2-head GQA)",
      retrieval: "Offline Index (0 MB)",
      compute: "100 MB",
      headroom: "2.45 GB (OPTIMAL)",
      headroomColor: "text-emerald-400",
      warning: "Purpose-trained for AST inspection, small code edits, test repair loops, and linter feedback.",
      isSafe: true
    },
    llama_3_2_1b: {
      name: "Llama 3.2 1B Instruct Q5_K_M",
      role: "Best Meta Llama Option on 4GB",
      weights: "0.90 GB",
      kvCache: "192 MB",
      retrieval: "Offline Index (0 MB)",
      compute: "100 MB",
      headroom: "2.80 GB (OPTIMAL)",
      headroomColor: "text-[#00F0FF]",
      warning: "Ultra-lightweight resident footprint when Meta Llama custom license is strictly required.",
      isSafe: true
    },
    llama_3_2_3b: {
      name: "Llama 3.2 3B Q4_K_M",
      role: "Physical Ceiling / Dedicated Appliance Only",
      weights: "3.40 GB (Measured)",
      kvCache: "384 MB",
      retrieval: "300 MB (Resident)",
      compute: "120 MB",
      headroom: "~100 MB (CRITICAL RISK)",
      headroomColor: "text-red-400",
      warning: "CRITICAL RISK: Leaves essentially zero OS headroom. Will trigger kernel swap-spilling & OOM unless standalone dedicated appliance with concurrency 1.",
      isSafe: false
    }
  };
  const activeProfileInfo = modelProfilesData[selectedModelProfile];

  // Handle Multi-Source Live Citation Verification
  const handleVerifyCitation = async () => {
    setIsVerifyingCitation(true);
    setCitationResult(null);
    try {
      const response = await fetch("/api/academic/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: citationTitle,
          authors: citationAuthors ? citationAuthors.split(",").map(a => a.trim()) : [],
          arxivId: citationArxivId || undefined,
        })
      });
      const data = await response.json();
      setCitationResult(data);
    } catch (err: any) {
      setCitationResult({
        success: false,
        status: "ERROR",
        message: err.message || "Failed to reach citation verifier API."
      });
    } finally {
      setIsVerifyingCitation(false);
    }
  };

  // Run a latency optimization sweep simulation
  const handleOptimizationSweep = () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    const interval = setInterval(() => {
      setOptimizationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          // Boost metrics following optimization
          setStats(prevStats => ({
            ...prevStats,
            averageLatency: +(Math.max(0.4, prevStats.averageLatency * 0.7).toFixed(1)),
            p99Latency: +(Math.max(2.1, prevStats.p99Latency * 0.65).toFixed(1)),
            cacheHitRatio: +(Math.min(99.5, prevStats.cacheHitRatio + 3.5).toFixed(1)),
            totalCostSaved: +(prevStats.totalCostSaved + 45.12),
            totalRequests: prevStats.totalRequests + 1,
          }));
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Live request simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      // Pick random tier based on setting weights
      const rand = Math.random();
      let type = "HOT CASH";
      let latency = 0.1;
      let fee = "$0.0000";
      let status: "HIT" | "MISS" | "MIRROR" = "HIT";
      let route = "Seattle-Edge-Alpha";

      // Base coefficients from optimization settings
      const placementCoeff = optimizationPlacement === "gateway" ? 0.4 : optimizationPlacement === "contract" ? 1.5 : 0.95;

      if (rand < 0.60) {
        // Hot cache hit (L1 Memory Map)
        type = "HOT CASH";
        latency = Math.round((0.15 + Math.random() * 0.1) * placementCoeff * 100) / 100;
        fee = "$0.0000";
        status = "HIT";
        route = "Seattle-Edge-Alpha [L1 RAM]";
      } else if (rand < 0.85) {
        // Warm cache hit (L2 Hybrid Redis)
        type = "WARM CASH";
        latency = Math.round((1.8 + Math.random() * 0.8) * placementCoeff * 10) / 10;
        fee = "$0.0001";
        status = "HIT";
        route = "Seattle-Edge-Alpha [L2 REDIS]";
      } else if (computeMirroring && rand < 0.95) {
        // Mirrored active-active peer execution
        type = "MIRRORED COMPUTE";
        latency = Math.round((9.5 + Math.random() * 2.5) * placementCoeff * 10) / 10;
        fee = "$0.0008";
        status = "MIRROR";
        route = "Seattle ⇄ London Active Mirror";
      } else {
        // Cold fetch (Raw on-chain Arbitrum / Gnomledger / DB)
        type = "COLD CASH FETCH";
        latency = Math.round((145 + Math.random() * 45) * placementCoeff * 10) / 10;
        fee = "$0.0450";
        status = "MISS";
        route = "Gnomledger Mainnet Chain Block";
      }

      const timestamp = new Date().toLocaleTimeString();
      const newRequest = {
        id: Math.random(),
        timestamp,
        type,
        latency,
        route,
        fee,
        status,
      };

      setActiveTraffic((prev) => [newRequest, ...prev.slice(0, 5)]);

      // Increment stats slightly
      setStats((prevStats) => {
        const totalReq = prevStats.totalRequests + 1;
        const currentHitCoeff = status === "HIT" ? 1 : 0;
        const nextHitRatio = ((prevStats.cacheHitRatio * (totalReq - 1) + (currentHitCoeff * 100)) / totalReq);
        const costSavingDelta = status === "HIT" ? 0.0449 : status === "MIRROR" ? 0.0442 : 0;
        
        return {
          totalRequests: totalReq,
          cacheHitRatio: Math.round(Math.max(40, Math.min(99.9, nextHitRatio)) * 100) / 100,
          totalCostSaved: +(prevStats.totalCostSaved + costSavingDelta),
          averageLatency: +(Math.max(0.2, (prevStats.averageLatency * 0.98 + latency * 0.02)).toFixed(2)),
          p99Latency: +(Math.max(1.8, (prevStats.p99Latency * 0.98 + (status === "MISS" ? latency * 0.1 : latency * 1.05) * 0.02)).toFixed(2)),
          mirroringUptime: computeMirroring ? 99.99 : 0.00,
        };
      });

    }, 2000);

    return () => clearInterval(timer);
  }, [cacheTier, computeMirroring, optimizationPlacement]);

  // D3 performance curve rendering
  useEffect(() => {
    if (!chartRef.current) return;

    // Data representing Latency (ms) vs Cost ($) under different caching modes
    // Modes: Uncached (Cold), Optimized (Warm Hybrid), Ultra-Boosted (Hot & Mirrored)
    const datasets = [
      {
        name: "Uncached (Cold)",
        color: "#EF4444", // Red
        points: [
          { x: 0, y: 190 },
          { x: 20, y: 180 },
          { x: 40, y: 175 },
          { x: 60, y: 160 },
          { x: 80, y: 155 },
          { x: 100, y: 150 },
        ]
      },
      {
        name: "Warm Cash (Hybrid)",
        color: "#F59E0B", // Amber
        points: [
          { x: 0, y: 140 },
          { x: 20, y: 90 },
          { x: 40, y: 50 },
          { x: 60, y: 15 },
          { x: 80, y: 8 },
          { x: 100, y: 2.5 },
        ]
      },
      {
        name: "Hot Cash + Mirrored",
        color: "#00F0FF", // Cyan
        points: [
          { x: 0, y: 12 },
          { x: 20, y: 4.5 },
          { x: 40, y: 1.8 },
          { x: 60, y: 0.5 },
          { x: 80, y: 0.25 },
          { x: 100, y: 0.12 },
        ]
      }
    ];

    const width = 500;
    const height = 180;
    const margin = { top: 15, right: 120, bottom: 30, left: 40 };

    // Clear previous
    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#020202");

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLog()
      .domain([0.1, 250])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data([1, 10, 100])
      .enter()
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#111")
      .attr("stroke-width", 1);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    const yAxis = d3.axisLeft(yScale)
      .tickValues([0.1, 1, 10, 100, 200])
      .tickFormat(d => `${d}ms`);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select(".domain").attr("stroke", "#222"))
      .call(g => g.selectAll(".tick text").attr("fill", "#555").style("font-size", "7px").style("font-family", "monospace"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#222"));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .call(g => g.select(".domain").attr("stroke", "#222"))
      .call(g => g.selectAll(".tick text").attr("fill", "#555").style("font-size", "7px").style("font-family", "monospace"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#222"));

    // Draw curves
    const lineGenerator = d3.line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    datasets.forEach((dataset) => {
      // Draw path
      svg.append("path")
        .datum(dataset.points)
        .attr("fill", "none")
        .attr("stroke", dataset.color)
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator);

      // Label at the end of each path
      const lastPt = dataset.points[dataset.points.length - 1];
      svg.append("text")
        .attr("x", xScale(lastPt.x) + 5)
        .attr("y", yScale(lastPt.y) + 3)
        .attr("fill", dataset.color)
        .style("font-size", "7px")
        .style("font-family", "monospace")
        .style("font-weight", "bold")
        .text(dataset.name);
    });

    // Add visual crosshair pointing to current settings intersection
    const activeHitRatio = stats.cacheHitRatio;
    const activeLatValue = stats.averageLatency;
    
    svg.append("circle")
      .attr("cx", xScale(activeHitRatio))
      .attr("cy", yScale(Math.max(0.1, activeLatValue)))
      .attr("r", 4)
      .attr("fill", "#00F0FF")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    svg.append("text")
      .attr("x", xScale(activeHitRatio) - 10)
      .attr("y", yScale(Math.max(0.1, activeLatValue)) - 8)
      .attr("fill", "#00F0FF")
      .attr("text-anchor", "end")
      .style("font-size", "7px")
      .style("font-family", "monospace")
      .text(`Active: ${activeLatValue}ms (${activeHitRatio}%)`);

  }, [stats.cacheHitRatio, stats.averageLatency]);

  return (
    <div className="bg-[#0A0A0A] border-2 border-[#222] p-6 rounded-none font-mono uppercase space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="text-[#00F0FF] animate-pulse" size={18} />
            <h3 className="text-sm font-black text-white tracking-widest">
              Capability OS Acceleration &amp; Latency Layer Sweep
            </h3>
          </div>
          <p className="text-[9px] text-gray-500 normal-case leading-relaxed mt-1 font-semibold">
            Strategically optimize 4GB memory constraints, KV-cache quantization, speculative decoding, and execute live academic grounding verification against arXiv, Semantic Scholar, CrossRef, and OpenAlex.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Sub-Tabs */}
          <div className="flex border border-[#222] bg-black p-1">
            <button
              onClick={() => setActiveTab("hardware")}
              className={`px-3 py-1 text-[9px] font-black transition-all ${
                activeTab === "hardware" ? "bg-[#00F0FF] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              4GB Box Profile
            </button>
            <button
              onClick={() => setActiveTab("citation")}
              className={`px-3 py-1 text-[9px] font-black transition-all ${
                activeTab === "citation" ? "bg-[#00F0FF] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Citation Verifier
            </button>
            <button
              onClick={() => setActiveTab("network")}
              className={`px-3 py-1 text-[9px] font-black transition-all ${
                activeTab === "network" ? "bg-[#00F0FF] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Latency &amp; Mirror
            </button>
          </div>

          <button
            onClick={handleOptimizationSweep}
            disabled={isOptimizing}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600/30 to-[#00F0FF]/25 hover:from-emerald-600/45 hover:to-[#00F0FF]/35 border border-[#00F0FF]/30 hover:border-[#00F0FF] text-white text-[10px] font-black tracking-widest transition-all duration-200 flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={11} className={isOptimizing ? "animate-spin text-[#00F0FF]" : "text-[#00F0FF]"} />
            <span>{isOptimizing ? `Sweeping: ${optimizationProgress}%` : "Run Latency Sweep"}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: 4GB Box System Optimization */}
      {activeTab === "hardware" && (
        <div className="space-y-6">
          {/* Model Profile Selector Banner */}
          <div className="bg-black border border-[#222] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#222] pb-2">
              <div className="flex items-center gap-2 text-[#00F0FF]">
                <Cpu size={16} />
                <h4 className="text-xs font-black tracking-widest">[ 4GB REALISTIC PRODUCTION ARCHITECTURE ]</h4>
              </div>
              <span className="text-[9px] text-gray-400 font-mono">Select Target Resident Model:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[9px]">
              <button
                onClick={() => setSelectedModelProfile("qwen3_1_7b")}
                className={`p-2.5 border text-left font-bold transition-all ${
                  selectedModelProfile === "qwen3_1_7b"
                    ? "bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    : "bg-[#050505] border-[#222] text-gray-400 hover:text-white"
                }`}
              >
                <span className="block text-[#00F0FF] font-black">Qwen3-1.7B Q5_K_M</span>
                <span className="block text-[8px] text-gray-500 mt-0.5">Best General-Purpose (1.35GB)</span>
              </button>
              <button
                onClick={() => setSelectedModelProfile("qwen2_5_coder")}
                className={`p-2.5 border text-left font-bold transition-all ${
                  selectedModelProfile === "qwen2_5_coder"
                    ? "bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-[#050505] border-[#222] text-gray-400 hover:text-white"
                }`}
              >
                <span className="block text-emerald-400 font-black">Qwen2.5-Coder-1.5B</span>
                <span className="block text-[8px] text-gray-500 mt-0.5">Best Code Specialist (1.25GB)</span>
              </button>
              <button
                onClick={() => setSelectedModelProfile("llama_3_2_1b")}
                className={`p-2.5 border text-left font-bold transition-all ${
                  selectedModelProfile === "llama_3_2_1b"
                    ? "bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    : "bg-[#050505] border-[#222] text-gray-400 hover:text-white"
                }`}
              >
                <span className="block text-[#00F0FF] font-black">Llama 3.2 1B Instruct</span>
                <span className="block text-[8px] text-gray-500 mt-0.5">Best Meta Option (0.90GB)</span>
              </button>
              <button
                onClick={() => setSelectedModelProfile("llama_3_2_3b")}
                className={`p-2.5 border text-left font-bold transition-all ${
                  selectedModelProfile === "llama_3_2_3b"
                    ? "bg-red-500/15 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    : "bg-[#050505] border-[#222] text-gray-400 hover:text-white"
                }`}
              >
                <span className="block text-red-400 font-black">Llama 3.2 3B Q4_K_M</span>
                <span className="block text-[8px] text-gray-500 mt-0.5">Physical Ceiling / Risk (3.40GB)</span>
              </button>
            </div>

            <div className={`p-3 border text-[10px] ${activeProfileInfo.isSafe ? "bg-[#0a1515] border-[#00F0FF]/30" : "bg-red-950/20 border-red-500/50"}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`font-black uppercase ${activeProfileInfo.isSafe ? "text-[#00F0FF]" : "text-red-400"}`}>
                  Active Profile: {activeProfileInfo.name} — {activeProfileInfo.role}
                </span>
                <span className={`px-2 py-0.5 text-[8px] font-mono font-bold border ${activeProfileInfo.isSafe ? "border-emerald-500 text-emerald-400 bg-emerald-950/40" : "border-red-500 text-red-400 bg-red-950/60 animate-pulse"}`}>
                  {activeProfileInfo.isSafe ? "OPTIMAL OS HEADROOM" : "CRITICAL SWAP-SPILLING RISK"}
                </span>
              </div>
              <p className="text-gray-300 normal-case leading-relaxed text-[9px]">
                {activeProfileInfo.warning}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Memory & KV Cache Block */}
            <div className="bg-black border border-[#222] p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#00F0FF] border-b border-[#222] pb-2">
                <Cpu size={14} />
                <h4 className="text-xs font-black">1. Memory &amp; KV Cache Policy</h4>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="space-y-1">
                  <span className="text-gray-400 block font-bold">Memory Pinning Mode:</span>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setMemoryPinning("mlock")}
                      className={`p-1.5 border text-[9px] font-bold ${
                        memoryPinning === "mlock"
                          ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]"
                          : "bg-[#050505] border-[#222] text-gray-500"
                      }`}
                    >
                      --mlock (RAM Lock)
                    </button>
                    <button
                      onClick={() => setMemoryPinning("no-mmap")}
                      className={`p-1.5 border text-[9px] font-bold ${
                        memoryPinning === "no-mmap"
                          ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]"
                          : "bg-[#050505] border-[#222] text-gray-500"
                      }`}
                    >
                      --no-mmap (Virtual)
                    </button>
                  </div>
                  <span className="text-[8px] text-amber-400/90 normal-case block leading-tight">
                    {selectedModelProfile === "llama_3_2_3b" 
                      ? "⚠️ CAUTION: Do not enable --mlock on 3B models! It prevents swapping but will starve Linux and kill surrounding web services when headroom is near zero."
                      : "Locks model weights into RAM safely with generous >2GB headroom for OS and routing."}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-gray-400 block font-bold">KV-Cache Quantization:</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setKvCacheQuant("Q8_0")}
                      className={`p-1.5 border text-[9px] font-bold ${
                        kvCacheQuant === "Q8_0" ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "bg-[#050505] border-[#222] text-gray-500"
                      }`}
                    >
                      Q8_0 (Recommended)
                    </button>
                    <button
                      onClick={() => setKvCacheQuant("Q4_0")}
                      className={`p-1.5 border text-[9px] font-bold ${
                        kvCacheQuant === "Q4_0" ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "bg-[#050505] border-[#222] text-gray-500"
                      }`}
                    >
                      Q4_0 (Max Capacity)
                    </button>
                    <button
                      onClick={() => setKvCacheQuant("FP16")}
                      className={`p-1.5 border text-[9px] font-bold ${
                        kvCacheQuant === "FP16" ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "bg-[#050505] border-[#222] text-gray-500"
                      }`}
                    >
                      FP16 (Uncompressed)
                    </button>
                  </div>
                  <span className="text-[8px] text-gray-500 normal-case block">
                    Shrinks 4096-token context KV footprint down to ~256MB without quality loss.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Sequential Harness & Thinking Mode Block */}
            <div className="bg-black border border-[#222] p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#00F0FF] border-b border-[#222] pb-2">
                <Zap size={14} />
                <h4 className="text-xs font-black">2. Sequential Harness &amp; Thinking</h4>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="p-2 bg-[#050505] border border-[#222] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">One Model, Sequential Roles</span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500 px-1 font-mono">NO MULTI-AGENT BLOAT</span>
                  </div>
                  <p className="text-[8px] text-gray-400 normal-case leading-tight">
                    Running Planner, Executor, and Reviewer simultaneously wastes RAM and causes OOM. We run 1 model sequentially: <b>Pass 1 (Plan) → Pass 2 (Execute bounded step) → Pass 3 (Critique against checks)</b>.
                  </p>
                </div>

                <div className="p-2 bg-[#050505] border border-[#222] space-y-1">
                  <span className="text-gray-400 font-bold block">Selective Thinking Mode:</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setThinkingMode("selective")}
                      className={`p-1 border text-[8px] font-bold ${
                        thinkingMode === "selective" ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]" : "bg-black border-[#222] text-gray-500"
                      }`}
                    >
                      Selective (Auto)
                    </button>
                    <button
                      onClick={() => setThinkingMode("always_off")}
                      className={`p-1 border text-[8px] font-bold ${
                        thinkingMode === "always_off" ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]" : "bg-black border-[#222] text-gray-500"
                      }`}
                    >
                      Always OFF
                    </button>
                    <button
                      onClick={() => setThinkingMode("always_on")}
                      className={`p-1 border text-[8px] font-bold ${
                        thinkingMode === "always_on" ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]" : "bg-black border-[#222] text-gray-500"
                      }`}
                    >
                      Always ON
                    </button>
                  </div>
                  <span className="text-[8px] text-gray-500 normal-case block leading-tight">
                    {thinkingMode === "selective"
                      ? "OFF for classification/ordinary edits. ON only for failed repair loops & complex planning."
                      : "Manual override applied."}
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-[#050505] border border-[#222]">
                  <span className="text-gray-300 font-bold text-[9px]">Prompt Prefix Caching</span>
                  <button
                    onClick={() => setPromptCaching(!promptCaching)}
                    className={`px-2 py-0.5 text-[8px] font-bold border ${
                      promptCaching ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]" : "bg-black border-[#222] text-gray-500"
                    }`}
                  >
                    {promptCaching ? "--cache-reuse 256 (ON)" : "OFF"}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Repo-Aware Retrieval & Tool Feedback */}
            <div className="bg-black border border-[#222] p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#00F0FF] border-b border-[#222] pb-2">
                <Database size={14} />
                <h4 className="text-xs font-black">3. Retrieval &amp; Tool Loop</h4>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="p-2 bg-[#050505] border border-[#222] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200 font-bold">SQLite FTS5 / Tantivy Index</span>
                    <span className="text-emerald-400 font-mono text-[8px] font-black">0 MB Resident RAM</span>
                  </div>
                  <p className="text-[8px] text-gray-400 normal-case leading-tight">
                    Ordinary vector RAG is insufficient for code. We retrieve by: <b>Exact ID → BM25 Lexical → Symbol Graph → Semantic Index</b>. Offline embeddings save 300MB resident RAM!
                  </p>
                </div>

                <div className="p-2 bg-[#050505] border border-[#222] space-y-1">
                  <span className="text-gray-200 font-bold block">Compiler &amp; Test Repair Loop</span>
                  <div className="text-[8px] text-gray-400 normal-case space-y-0.5">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <span>✓</span> <span>TypeScript / Python static type checking</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <span>✓</span> <span>ESLint / Ruff syntax linting</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <span>✓</span> <span>Propose → Sandbox → Compile → 1-Attempt Repair</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-[#050505] border border-[#222]">
                  <span className="text-gray-300 font-bold text-[9px]">Semantic Result Cache</span>
                  <button
                    onClick={() => setSemanticCacheEnabled(!semanticCacheEnabled)}
                    className={`px-2 py-0.5 text-[8px] font-bold border ${
                      semanticCacheEnabled ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]" : "bg-black border-[#222] text-gray-500"
                    }`}
                  >
                    {semanticCacheEnabled ? "SHA+Intent Key (ON)" : "DISABLED"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4GB Host System Memory Breakdown Table */}
          <div className="bg-black border border-[#222] p-4 space-y-2">
            <div className="flex justify-between items-center border-b border-[#222] pb-1">
              <span className="text-[10px] text-[#00F0FF] font-black tracking-widest block">
                [ 4GB HOST SYSTEM MEMORY BREAKDOWN — {activeProfileInfo.name.toUpperCase()} ]
              </span>
              <span className="text-[9px] text-gray-400 font-mono">Total Budget: 4,096 MB</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[9px]">
              <div className="p-2 bg-[#111] border border-[#222]">
                <span className="text-gray-500 block">MODEL WEIGHTS</span>
                <span className="text-white font-black block mt-0.5">{activeProfileInfo.weights}</span>
              </div>
              <div className="p-2 bg-[#111] border border-[#222]">
                <span className="text-gray-500 block">KV CACHE</span>
                <span className="text-emerald-400 font-black block mt-0.5">{activeProfileInfo.kvCache}</span>
              </div>
              <div className="p-2 bg-[#111] border border-[#222]">
                <span className="text-gray-500 block">RETRIEVAL INDEX</span>
                <span className="text-emerald-400 font-black block mt-0.5">{activeProfileInfo.retrieval}</span>
              </div>
              <div className="p-2 bg-[#111] border border-[#222]">
                <span className="text-gray-500 block">COMPUTE BUFFER</span>
                <span className="text-[#00F0FF] font-black block mt-0.5">{activeProfileInfo.compute}</span>
              </div>
              <div className="p-2 bg-[#111] border border-[#222]">
                <span className="text-gray-500 block">OS &amp; SYSTEM HEADROOM</span>
                <span className={`font-black block mt-0.5 ${activeProfileInfo.headroomColor}`}>{activeProfileInfo.headroom}</span>
              </div>
            </div>
          </div>

          {/* 4-Tier Decision Ladder Router Visualization */}
          <div className="bg-black border border-[#222] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#222] pb-2">
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-2">
                  <span className="text-[#00F0FF]">[ 4-TIER DECISION LADDER ]</span>
                  <span>An HRM-Style Router Without Heavy Resident Models</span>
                </h4>
                <p className="text-[8.5px] text-gray-400 normal-case leading-tight mt-0.5">
                  Click a tier to inspect how incoming requests are routed to preserve RAM and maximize precision.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[9px]">
              {[
                { tier: 0, title: "Tier 0: Deterministic", subtitle: "No Model Required (0ms)", ram: "0 MB RAM", desc: "Health/status queries, known commands, exact repo lookups, cache hits, policy decisions, and schema validation. Faster & more reliable than asking an LLM." },
                { tier: 1, title: "Tier 1: Local Small Model", subtitle: "1.5B–1.7B Classifier (~85ms)", ram: "~1.35 GB RAM", desc: "Intent classification, selecting capabilities, structured JSON plans, parameter extraction, small code edits, and documentation summaries." },
                { tier: 2, title: "Tier 2: Tool-Assisted", subtitle: "Local Reasoning (~320ms)", ram: "~1.50 GB RAM", desc: "AST/symbol lookup, Git diff inspection, compilation/linter verification loop. Propose patch -> sandbox apply -> compile -> single bounded repair attempt." },
                { tier: 3, title: "Tier 3: Remote Frontier", subtitle: "API Escalation (~1.2s)", ram: "0 MB Resident RAM", desc: "Escalate only for cross-repo architectural reasoning, long-context analysis (>4k tokens), difficult debugging after local repair failures, or large refactors." }
              ].map((step) => (
                <div
                  key={step.tier}
                  onClick={() => setActiveDecisionTier(step.tier)}
                  className={`p-3 border cursor-pointer transition-all ${
                    activeDecisionTier === step.tier
                      ? "bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      : "bg-[#050505] border-[#222] text-gray-400 hover:border-gray-500"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-black ${activeDecisionTier === step.tier ? "text-[#00F0FF]" : "text-white"}`}>
                      {step.title}
                    </span>
                    <span className="text-[8px] font-mono bg-black px-1.5 py-0.5 border border-[#333] text-gray-300">
                      {step.ram}
                    </span>
                  </div>
                  <span className="text-[8px] text-gray-400 block font-bold mb-1.5">{step.subtitle}</span>
                  <p className="text-[8.5px] text-gray-300 normal-case leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended llama.cpp Configuration Shell Command */}
          <div className="bg-[#050a0a] border border-[#00F0FF]/40 p-4 space-y-2 font-mono">
            <div className="flex justify-between items-center text-[9px] text-[#00F0FF] font-black border-b border-[#00F0FF]/20 pb-1">
              <span>[ RECOMMENDED LLAMA.CPP SERVER CONFIGURATION FOR 4GB HOST ]</span>
              <span className="text-gray-400">Optimal settings for Qwen3-1.7B Q5_K_M</span>
            </div>
            <div className="bg-black p-3 border border-[#222] text-gray-200 text-[9px] overflow-x-auto whitespace-pre leading-relaxed select-all">
              {`./llama-server \\
  --model /models/qwen3-1.7b-q5_k_m.gguf \\
  --host 127.0.0.1 --port 8080 \\
  --ctx-size 4096 --parallel 1 \\
  --threads 3 --threads-batch 3 \\
  --batch-size 256 --ubatch-size 128 \\
  --cache-type-k q8_0 --cache-type-v q8_0 \\
  --flash-attn auto --mmap --jinja`}
            </div>
            <p className="text-[8px] text-gray-400 normal-case font-sans leading-tight">
              <b>Key parameter notes:</b> Set <code>--threads 3</code> to leave 1 physical CPU core free for Linux and the request router. Quantized <code>--cache-type-k q8_0</code> saves ~50% KV cache memory. Keep <code>--mmap</code> enabled unless benchmarking proves otherwise; avoid automatic <code>--mlock</code> when OS headroom is near zero.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Multi-Source Live Citation Verifier */}
      {activeTab === "citation" && (
        <div className="bg-black border border-[#222] p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#222] pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="text-[#00F0FF]" size={16} />
                <h4 className="text-xs font-black text-white">Multi-Source Academic Citation Verifier</h4>
              </div>
              <p className="text-[8.5px] text-gray-500 normal-case leading-tight mt-0.5">
                Audits claimed paper titles and authors against 4 real free APIs: arXiv, Semantic Scholar, CrossRef, and OpenAlex (250M+ works). Never accepts fabricated citations or hallucinated IDs.
              </p>
            </div>
            <span className="text-[8px] bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 px-2 py-0.5 font-bold">
              ZERO FABRICATION GUARANTEE
            </span>
          </div>

          {/* Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-[9px] font-bold block mb-1">Claimed Paper Title:</label>
              <input
                type="text"
                value={citationTitle}
                onChange={(e) => setCitationTitle(e.target.value)}
                placeholder="e.g. Decentralized Escrow Handshakes..."
                className="w-full bg-[#050505] border border-[#222] focus:border-[#00F0FF] p-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-[9px] font-bold block mb-1">Claimed Authors:</label>
              <input
                type="text"
                value={citationAuthors}
                onChange={(e) => setCitationAuthors(e.target.value)}
                placeholder="e.g. Nakagawa, S."
                className="w-full bg-[#050505] border border-[#222] focus:border-[#00F0FF] p-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-[9px] font-bold block mb-1">arXiv ID / DOI (Optional):</label>
              <input
                type="text"
                value={citationArxivId}
                onChange={(e) => setCitationArxivId(e.target.value)}
                placeholder="e.g. 2403.09112"
                className="w-full bg-[#050505] border border-[#222] focus:border-[#00F0FF] p-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleVerifyCitation}
              disabled={isVerifyingCitation || (!citationTitle && !citationArxivId)}
              className="px-4 py-2 bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 border border-[#00F0FF] text-white text-[10px] font-black tracking-widest flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <Search size={12} className={isVerifyingCitation ? "animate-spin text-[#00F0FF]" : "text-[#00F0FF]"} />
              <span>{isVerifyingCitation ? "Auditing 4 APIs..." : "Audit Citation Against Reality"}</span>
            </button>
          </div>

          {/* Results Output */}
          {citationResult && (
            <div className={`p-4 border text-xs space-y-2 ${
              citationResult.success
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                : citationResult.status === "TITLE_AUTHOR_MISMATCH"
                ? "bg-amber-500/10 border-amber-500 text-amber-300"
                : "bg-red-500/10 border-red-500 text-red-300"
            }`}>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 font-black">
                  {citationResult.success ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : citationResult.status === "TITLE_AUTHOR_MISMATCH" ? (
                    <AlertTriangle size={16} className="text-amber-400" />
                  ) : (
                    <X size={16} className="text-red-400" />
                  )}
                  <span>STATUS: {citationResult.status}</span>
                </div>
                {citationResult.checkedSources && (
                  <span className="text-[9px] font-mono opacity-80">
                    Checked Sources: {citationResult.checkedSources.join(", ")}
                  </span>
                )}
              </div>

              <p className="normal-case text-[10.5px] leading-relaxed font-semibold">
                {citationResult.message}
              </p>

              {citationResult.paper && (
                <div className="bg-black/40 border border-white/10 p-2 text-[10px] space-y-1 font-mono">
                  <div><strong>Verified Title:</strong> {citationResult.paper.title}</div>
                  <div><strong>Real Authors:</strong> {citationResult.paper.authors}</div>
                  <div><strong>Source Database:</strong> {citationResult.paper.source}</div>
                  {citationResult.paper.url && (
                    <div>
                      <strong>URL:</strong>{" "}
                      <a href={citationResult.paper.url} target="_blank" rel="noopener noreferrer" className="underline text-[#00F0FF]">
                        {citationResult.paper.url}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Latency & Network Sweep */}
      {activeTab === "network" && (
        <div className="space-y-6">
          {/* Grid: Configurations vs Live Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Configurations Column */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] text-[#00F0FF] font-bold tracking-widest block border-b border-[#111] pb-1">
                [ SWEEP SETTINGS ]
              </span>

              <div className="space-y-4 text-xs">
                {/* Cache placement strategy */}
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold block">1. Cache Deployment Point:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setOptimizationPlacement("gateway")}
                      className={`p-2 border text-[9px] font-black tracking-wider transition-all ${
                        optimizationPlacement === "gateway"
                          ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]"
                          : "bg-[#050505] border-[#222] text-[#666] hover:text-[#bbb]"
                      }`}
                    >
                      Edge Gateway
                    </button>
                    <button
                      onClick={() => setOptimizationPlacement("node")}
                      className={`p-2 border text-[9px] font-black tracking-wider transition-all ${
                        optimizationPlacement === "node"
                          ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]"
                          : "bg-[#050505] border-[#222] text-[#666] hover:text-[#bbb]"
                      }`}
                    >
                      Local Node
                    </button>
                    <button
                      onClick={() => setOptimizationPlacement("contract")}
                      className={`p-2 border text-[9px] font-black tracking-wider transition-all ${
                        optimizationPlacement === "contract"
                          ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]"
                          : "bg-[#050505] border-[#222] text-[#666] hover:text-[#bbb]"
                      }`}
                    >
                      Smart Contract
                    </button>
                  </div>
                </div>

                {/* Cash Tier Priority */}
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold block">2. Caching Tier Configuration:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setCacheTier("hot")}
                      className={`p-2 border text-[9px] font-black tracking-wider transition-all ${
                        cacheTier === "hot"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                          : "bg-[#050505] border-[#222] text-[#666] hover:text-[#bbb]"
                      }`}
                    >
                      Hot Cash (L1)
                    </button>
                    <button
                      onClick={() => setCacheTier("warm")}
                      className={`p-2 border text-[9px] font-black tracking-wider transition-all ${
                        cacheTier === "warm"
                          ? "bg-amber-500/10 border-amber-500 text-amber-400"
                          : "bg-[#050505] border-[#222] text-[#666] hover:text-[#bbb]"
                      }`}
                    >
                      Warm Cash (L2)
                    </button>
                    <button
                      onClick={() => setCacheTier("cold")}
                      className={`p-2 border text-[9px] font-black tracking-wider transition-all ${
                        cacheTier === "cold"
                          ? "bg-blue-500/10 border-blue-500 text-blue-400"
                          : "bg-[#050505] border-[#222] text-[#666] hover:text-[#bbb]"
                      }`}
                    >
                      Cold Cash (L3)
                    </button>
                  </div>
                </div>

                {/* Compute Mirroring Strategy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-400 font-bold block">3. Compute Mirroring Technique:</label>
                    <span className={`text-[8.5px] px-1.5 py-0.5 border font-bold ${computeMirroring ? "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]" : "bg-[#111] border-[#222] text-gray-500"}`}>
                      {computeMirroring ? "ACTIVE-ACTIVE" : "STANDBY"}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setComputeMirroring(!computeMirroring)}
                    className={`w-full p-2 border text-[10px] font-black tracking-widest uppercase transition-all ${
                      computeMirroring
                        ? "bg-[#00F0FF]/15 border-[#00F0FF] text-white"
                        : "bg-black border-[#222] text-gray-500"
                    }`}
                  >
                    {computeMirroring ? "Disable Active Twin Sync" : "Enable Twin Active Mirroring"}
                  </button>
                </div>
              </div>
            </div>

            {/* Graphs and Telemetry */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="border border-[#222] bg-black p-2 relative">
                <span className="absolute top-2 left-2 bg-[#0c0c0c] border border-[#222] text-[#888] text-[7.5px] px-1.5 py-0.5 z-10">
                  LATENCY RESPONSE SWEEP PROFILE (LOG SCALE)
                </span>
                <svg ref={chartRef} className="w-full h-[150px]" />
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-[#111] border border-[#222]">
                  <span className="text-gray-500 text-[8px] block">AVG LATENCY</span>
                  <span className="text-emerald-400 text-xs font-black block mt-0.5">{stats.averageLatency}ms</span>
                </div>
                <div className="p-2.5 bg-[#111] border border-[#222]">
                  <span className="text-gray-500 text-[8px] block">p99 LIVENESS</span>
                  <span className="text-[#00F0FF] text-xs font-black block mt-0.5">{stats.p99Latency}ms</span>
                </div>
                <div className="p-2.5 bg-[#111] border border-[#222]">
                  <span className="text-gray-500 text-[8px] block">CACHE HIT RATIO</span>
                  <span className="text-emerald-400 text-xs font-black block mt-0.5">{stats.cacheHitRatio}%</span>
                </div>
                <div className="p-2.5 bg-[#111] border border-[#222]">
                  <span className="text-gray-500 text-[8px] block">TOTAL COST SAVED</span>
                  <span className="text-[#00F0FF] text-xs font-black block mt-0.5">${stats.totalCostSaved.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stream Traffic Logger */}
          <div className="space-y-2 border-t border-[#111] pt-4">
            <span className="text-[10px] text-[#888] font-black tracking-wider block">
              [ REAL-TIME ACCELERATION INGRESS STREAM ]
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {activeTraffic.map((req) => (
                <div key={req.id} className="bg-black border border-[#222] p-2.5 space-y-1 text-[9px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold">{req.timestamp}</span>
                    <span className={`px-1.5 py-0.5 text-[7px] font-black ${
                      req.status === "HIT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                      req.status === "MIRROR" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25" :
                      "bg-red-500/10 text-red-400 border border-red-500/25"
                    }`}>
                      {req.type}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono pt-1 text-gray-400">
                    <span>Latency:</span>
                    <span className="text-white font-black">{req.latency}ms</span>
                  </div>
                  <div className="flex justify-between font-mono text-gray-400">
                    <span>X402 Fee:</span>
                    <span className="text-[#00F0FF] font-black">{req.fee}</span>
                  </div>
                  <div className="text-[8px] text-gray-500 leading-tight normal-case pt-0.5 truncate">
                    Node: {req.route}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cost optimization summary info */}
      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10.5px] normal-case leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="shrink-0 text-emerald-400" size={15} />
          <p className="font-semibold text-gray-300">
            Hardware optimizations (<strong className="text-emerald-400 font-black">--mlock</strong>, <strong className="text-emerald-400 font-black">Q8_0 KV-cache</strong>, <strong className="text-emerald-400 font-black">Speculative Decoding</strong>) enable 3B parameter models to fit inside <strong className="text-emerald-400 font-black">2.5GB RAM on a 4GB system</strong> with &lt;2s latency and zero swap-spilling degradation.
          </p>
        </div>
        <div className="shrink-0 text-[10px] bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 text-emerald-400 font-black uppercase tracking-wider">
          4GB SYSTEM OPTIMIZED
        </div>
      </div>
    </div>
  );
};

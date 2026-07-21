import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Zap, Cpu, Database, Layers, Activity, TrendingDown, Server, RefreshCw, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

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
            Strategically optimize the placement of Hot, Warm, and Cold caching tiers and enable twin Active-Active compute mirroring for sub-millisecond gateway response.
          </p>
        </div>

        <button
          onClick={handleOptimizationSweep}
          disabled={isOptimizing}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600/30 to-[#00F0FF]/25 hover:from-emerald-600/45 hover:to-[#00F0FF]/35 border border-[#00F0FF]/30 hover:border-[#00F0FF] text-white text-[10px] font-black tracking-widest transition-all duration-200 flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={11} className={isOptimizing ? "animate-spin text-[#00F0FF]" : "text-[#00F0FF]"} />
          <span>{isOptimizing ? `Sweeping Gaps: ${optimizationProgress}%` : "Run Latency Sweep"}</span>
        </button>
      </div>

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
              <span className="text-[8px] text-gray-500 normal-case leading-tight block">
                Edge Gateway: Filters requests before computing, saving 95%+ compute resources.
              </span>
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
              <span className="text-[8px] text-gray-500 normal-case leading-tight block">
                Hot: In-memory LRU Map (0ms). Warm: Shared Host Redis (1.5ms). Cold: Chain-fetch (150ms).
              </span>
            </div>

            {/* Compute Mirroring Strategy */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-gray-400 font-bold block">3. Compute Mirroring Technique:</label>
                <span className={`text-[8.5px] px-1.5 py-0.5 border font-bold ${computeMirroring ? "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]" : "bg-[#111] border-[#222] text-gray-500"}`}>
                  {computeMirroring ? "ACTIVE-ACTIVE" : "STANDBY"}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setComputeMirroring(!computeMirroring)}
                  className={`flex-1 p-2 border text-[10px] font-black tracking-widest uppercase transition-all ${
                    computeMirroring
                      ? "bg-[#00F0FF]/15 border-[#00F0FF] text-white"
                      : "bg-black border-[#222] text-gray-500"
                  }`}
                >
                  {computeMirroring ? "Disable Active Twin Sync" : "Enable Twin Active Mirroring"}
                </button>
              </div>
              <span className="text-[8px] text-gray-500 normal-case leading-tight block">
                Twin execution: Dispatches to Seattle &amp; London nodes concurrently, returning fastest response to mitigate jitter.
              </span>
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

      {/* Cost optimization summary info */}
      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10.5px] normal-case leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="shrink-0 text-emerald-400" size={15} />
          <p className="font-semibold text-gray-300">
            By shifting cache filtering to the <strong className="text-emerald-400 font-black">Edge Gateway ingress (Seattle-Edge-Alpha)</strong>, we intercept invalid or stale claims before executing on-chain transactions, reducing transaction overhead costs down from $0.0450 to <strong className="text-emerald-400 font-black">$0.0001 per request</strong>.
          </p>
        </div>
        <div className="shrink-0 text-[10px] bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 text-emerald-400 font-black uppercase tracking-wider">
          M2M MICRO-PAYMENTS: GATED
        </div>
      </div>
    </div>
  );
};

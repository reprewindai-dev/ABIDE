import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Sliders, Activity, Cpu, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

interface EinsteinRouterDashboardProps {
  einsteinJitter: number;
  setEinsteinJitter: (v: number) => void;
  einsteinPacketLoss: number;
  setEinsteinPacketLoss: (v: number) => void;
  einsteinSla: number;
  setEinsteinSla: (v: number) => void;
}

export const EinsteinRouterDashboard: React.FC<EinsteinRouterDashboardProps> = ({
  einsteinJitter,
  setEinsteinJitter,
  einsteinPacketLoss,
  setEinsteinPacketLoss,
  einsteinSla,
  setEinsteinSla,
}) => {
  const d3Container = useRef<SVGSVGElement | null>(null);
  const [activeProbe, setActiveProbe] = useState<{ x: number; y: number } | null>(null);
  const [packetTrace, setPacketTrace] = useState<{ id: number; jitter: number; loss: number; latency: number; reputation: number; status: "success" | "warn" | "failed" }[]>([]);
  const [traceId, setTraceId] = useState(0);
  const [selectedRouteTarget, setSelectedRouteTarget] = useState<string>("Seattle-Edge-Alpha");

  // Calculate Reputation & Latency using the core system logic formulas to keep it mathematically aligned
  const calcReputation = (jit: number, sla: number, loss: number) => {
    return Math.max(0, Math.min(100, Math.round(
      (sla * 0.6) - (jit * 1.5) - (loss * 6.5) + 38
    )));
  };

  const calcLatency = (jit: number, loss: number) => {
    return 8.5 + (jit * 0.4) + (loss * 3.2);
  };

  // Generate packet history trace
  useEffect(() => {
    // Generate some initial random but correlated packets around current setting
    const initialTrace = Array.from({ length: 45 }).map((_, index) => {
      // Add slight random deviation
      const jitDev = (Math.random() - 0.5) * (einsteinJitter * 0.5);
      const lossDev = (Math.random() - 0.5) * (einsteinPacketLoss * 0.5);
      
      const jitter = Math.max(2, Math.min(40, einsteinJitter + jitDev));
      const loss = Math.max(0, Math.min(5, einsteinPacketLoss + lossDev));
      
      const rep = calcReputation(jitter, einsteinSla, loss);
      const lat = calcLatency(jitter, loss);
      
      let status: "success" | "warn" | "failed" = "success";
      if (rep < 60 || lat > 20) status = "failed";
      else if (rep < 80 || lat > 14) status = "warn";

      return {
        id: index,
        jitter,
        loss,
        latency: lat,
        reputation: rep,
        status,
      };
    });
    setPacketTrace(initialTrace);
    setTraceId(45);
  }, [einsteinJitter, einsteinPacketLoss, einsteinSla]);

  // Handle live trace updates via an interval
  useEffect(() => {
    const timer = setInterval(() => {
      setPacketTrace((prev) => {
        const nextId = traceId + 1;
        setTraceId(nextId);

        // Calculate a new packet with slight drift around current set coordinates
        const jitDev = (Math.random() - 0.5) * 6;
        const lossDev = (Math.random() - 0.5) * 1.2;

        const jitter = Math.max(2, Math.min(40, einsteinJitter + jitDev));
        const loss = Math.max(0, Math.min(5, einsteinPacketLoss + lossDev));
        
        const rep = calcReputation(jitter, einsteinSla, loss);
        const lat = calcLatency(jitter, loss);
        
        let status: "success" | "warn" | "failed" = "success";
        if (rep < 60 || lat > 20) status = "failed";
        else if (rep < 80 || lat > 14) status = "warn";

        const newPacket = {
          id: nextId,
          jitter,
          loss,
          latency: lat,
          reputation: rep,
          status,
        };

        // Maintain size constraint
        const updated = [...prev.slice(1), newPacket];
        return updated;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [traceId, einsteinJitter, einsteinPacketLoss, einsteinSla]);

  // Main D3 Rendering logic
  useEffect(() => {
    if (!d3Container.current || packetTrace.length === 0) return;

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    // Clear previous elements
    d3.select(d3Container.current).selectAll("*").remove();

    const svg = d3.select(d3Container.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "black");

    // Add Grid Background lines
    const gridG = svg.append("g").attr("class", "grid-lines");

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 42]) // Node Packet Jitter (ms)
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 5.5]) // Packet Loss Rate (%)
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    for (let xVal = 5; xVal <= 40; xVal += 5) {
      gridG.append("line")
        .attr("x1", xScale(xVal))
        .attr("x2", xScale(xVal))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#111")
        .attr("stroke-width", 1);
    }
    for (let yVal = 1; yVal <= 5; yVal += 1) {
      gridG.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(yVal))
        .attr("y2", yScale(yVal))
        .attr("stroke", "#111")
        .attr("stroke-width", 1);
    }

    // Add Threshold boundaries / risk zones using background shading
    // Jitter high risk > 25ms, Packet Loss high risk > 2.5%
    svg.append("rect")
      .attr("x", xScale(25))
      .attr("y", margin.top)
      .attr("width", xScale(42) - xScale(25))
      .attr("height", yScale(0) - yScale(2.5))
      .attr("fill", "rgba(239, 68, 68, 0.05)")
      .attr("stroke", "none");

    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", yScale(5.5))
      .attr("width", xScale(42) - margin.left)
      .attr("height", yScale(2.5) - yScale(5.5))
      .attr("fill", "rgba(245, 158, 11, 0.03)")
      .attr("stroke", "none");

    // X-Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => `${d} ms`);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select(".domain").attr("stroke", "#222"))
      .call(g => g.selectAll(".tick text").attr("fill", "#666").style("font-size", "8px").style("font-family", "monospace"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#222"));

    // Y-Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `${d}%`);

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .call(g => g.select(".domain").attr("stroke", "#222"))
      .call(g => g.selectAll(".tick text").attr("fill", "#666").style("font-size", "8px").style("font-family", "monospace"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#222"));

    // Axis Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 6)
      .attr("fill", "#444")
      .attr("text-anchor", "middle")
      .style("font-size", "8px")
      .style("font-family", "monospace")
      .style("font-weight", "bold")
      .text("NODE PACKET JITTER (MS)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("fill", "#444")
      .attr("text-anchor", "middle")
      .style("font-size", "8px")
      .style("font-family", "monospace")
      .style("font-weight", "bold")
      .text("PACKET LOSS RATE (%)");

    // Plot simulated historical packet trace dots (real mathematical correlation points)
    svg.selectAll(".trace-dot")
      .data(packetTrace)
      .enter()
      .append("circle")
      .attr("class", "trace-dot")
      .attr("cx", d => xScale((d as any).jitter))
      .attr("cy", d => yScale((d as any).loss))
      .attr("r", 3)
      .attr("fill", d => {
        const item = d as any;
        if (item.status === "failed") return "#ef4444"; // Red
        if (item.status === "warn") return "#f59e0b"; // Amber
        return "#10b981"; // Emerald
      })
      .attr("opacity", (d, i) => Math.max(0.15, (i / packetTrace.length)))
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);

    // Crosshairs for current state settings
    svg.append("line")
      .attr("x1", xScale(einsteinJitter))
      .attr("x2", xScale(einsteinJitter))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "rgba(0, 240, 255, 0.15)")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1);

    svg.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(einsteinPacketLoss))
      .attr("y2", yScale(einsteinPacketLoss))
      .attr("stroke", "rgba(0, 240, 255, 0.15)")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1);

    // Big Target / Crosshair circle for the exact active router value
    const pulseG = svg.append("g")
      .attr("transform", `translate(${xScale(einsteinJitter)}, ${yScale(einsteinPacketLoss)})`);

    pulseG.append("circle")
      .attr("r", 10)
      .attr("fill", "none")
      .attr("stroke", "#00F0FF")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.8)
      .append("animate")
      .attr("attributeName", "r")
      .attr("values", "6;14;6")
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite");

    pulseG.append("circle")
      .attr("r", 4)
      .attr("fill", "#00F0FF");

    // Add regression correlation trendline showing mathematically modeled latency threshold
    // Let's draw the Latency SLO line (20ms) as a custom D3 line on this correlation chart
    const lossRange = d3.range(0, 6, 0.5);
    const lineGenerator = d3.line<number>()
      .x(d => {
        // Calculate maximum allowed jitter to stay under Latency Limit for this loss level
        // Latency = 8.5 + jit*0.4 + loss*3.2 = 20ms
        // jit*0.4 = 11.5 - loss*3.2
        // jit = (11.5 - loss*3.2) / 0.4
        const maxJit = (11.5 - d * 3.2) / 0.4;
        return xScale(Math.max(2, Math.min(40, maxJit)));
      })
      .y(d => yScale(d));

    svg.append("path")
      .datum(lossRange)
      .attr("fill", "none")
      .attr("stroke", "rgba(239, 68, 68, 0.4)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .attr("d", lineGenerator);

    // Text marking the Latency SLO limit
    svg.append("text")
      .attr("x", xScale(22))
      .attr("y", yScale(1.8))
      .attr("fill", "rgba(239, 68, 68, 0.6)")
      .style("font-size", "7px")
      .style("font-family", "monospace")
      .text("--- LATENCY SLO LIMIT (20ms)");

    // D3 click handler to dynamically query and update router values from the SVG canvas itself!
    svg.on("click", function(event) {
      const [coordsX, coordsY] = d3.pointer(event);
      if (coordsX >= margin.left && coordsX <= width - margin.right &&
          coordsY >= margin.top && coordsY <= height - margin.bottom) {
        
        const jit = Math.round(xScale.invert(coordsX));
        const loss = Math.round(yScale.invert(coordsY) * 10) / 10;
        
        // Boundaries checks
        const cleanJit = Math.max(2, Math.min(40, jit));
        const cleanLoss = Math.max(0, Math.min(5, loss));

        setEinsteinJitter(cleanJit);
        setEinsteinPacketLoss(cleanLoss);
        setActiveProbe({ x: cleanJit, y: cleanLoss });
      }
    });

  }, [packetTrace, einsteinJitter, einsteinPacketLoss, einsteinSla]);

  const activeRep = calcReputation(einsteinJitter, einsteinSla, einsteinPacketLoss);
  const activeLat = calcLatency(einsteinJitter, einsteinPacketLoss);

  // Determine actual routed targets purely from the settings to prevent random telemetry
  let statusColor = "text-[#10b981]";
  let statusBg = "bg-emerald-500/5 border-emerald-500/20";
  let statusText = "EXCELLENT";
  let descText = "High prioritization routing through Seattle primary hardware cluster. No packet loss mitigation required.";

  if (activeRep < 60 || activeLat > 18) {
    statusColor = "text-[#ef4444]";
    statusBg = "bg-red-500/5 border-red-500/20";
    statusText = "CRITICAL SLO BREACH";
    descText = "High packet-loss and jitter cascade. Underperforming node escrows subjected to automatic X402 micro-payment refunds.";
  } else if (activeRep < 80 || activeLat > 14) {
    statusColor = "text-[#f59e0b]";
    statusBg = "bg-amber-500/5 border-amber-500/20";
    statusText = "STRESS PROFILE WARNING";
    descText = "Elevated latency jitter triggers secondary London node routing overlays. Flow stabilized with active rate limiting.";
  }

  return (
    <div className="border-2 border-[#222] bg-[#050505] p-5 rounded-none font-mono uppercase space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#222] pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-[#00F0FF]" />
            <h4 className="text-sm font-black text-white tracking-wider">Einstein Priority Telemetry Optimizer</h4>
          </div>
          <span className="text-[9px] text-[#666] block">
            D3-powered interactive correlation matrix (Jitter ms vs Packet-Loss %)
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-black border border-[#222] px-2.5 py-1 text-[9px] text-[#888]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ROUTER: LIVE TELEMETRY STREAM</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Sliders Form */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[10px] text-[#00F0FF] font-bold tracking-widest block border-b border-[#111] pb-1">
            [ INGRESS PARAMETERS ]
          </span>

          <div className="space-y-3">
            {/* Jitter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">1. Packet Jitter:</span>
                <span className="text-white font-black">{einsteinJitter} ms</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={einsteinJitter}
                onChange={(e) => setEinsteinJitter(parseInt(e.target.value))}
                className="w-full accent-[#00F0FF] h-1 bg-[#111] rounded-none cursor-pointer"
              />
              <span className="text-[8px] text-[#555] normal-case leading-tight block">
                Fluctuation in packet arrival latency. Target is &lt;15ms.
              </span>
            </div>

            {/* Packet Loss */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">2. Packet Loss:</span>
                <span className="text-white font-black">{einsteinPacketLoss}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={einsteinPacketLoss}
                onChange={(e) => setEinsteinPacketLoss(parseFloat(e.target.value))}
                className="w-full accent-[#00F0FF] h-1 bg-[#111] rounded-none cursor-pointer"
              />
              <span className="text-[8px] text-[#555] normal-case leading-tight block">
                Dropped telemetry packets. Threshold &gt;2.5% drops rating.
              </span>
            </div>

            {/* SLA */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">3. Node SLA Target:</span>
                <span className="text-white font-black">{einsteinSla}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                value={einsteinSla}
                onChange={(e) => setEinsteinSla(parseInt(e.target.value))}
                className="w-full accent-[#00F0FF] h-1 bg-[#111] rounded-none cursor-pointer"
              />
              <span className="text-[8px] text-[#555] normal-case leading-tight block">
                Contractual SLA availability target locked in the blueprint.
              </span>
            </div>
          </div>

          {/* D3 Guidance */}
          <div className="p-3 bg-black border border-[#111] text-[9.5px] normal-case text-gray-400 space-y-1">
            <span className="font-bold text-[#00F0FF] block uppercase">Interactive Canvas Tip:</span>
            Click directly on any coordinate in the graph on the right to probe and instantly update Jitter and Packet Loss configurations!
          </div>
        </div>

        {/* D3 SVG Chart */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="relative border border-[#222] bg-black p-1">
            {/* Real SVG chart */}
            <svg ref={d3Container} className="w-full h-[200px]" />
            
            {activeProbe && (
              <div className="absolute top-2 right-2 bg-[#0c0c0c] border border-[#00F0FF]/30 text-[#00F0FF] text-[8px] px-1.5 py-0.5">
                PROBED: {activeProbe.x}ms JIT / {activeProbe.y}% LOSS
              </div>
            )}
          </div>

          {/* Live Outcome metrics card */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-2.5 bg-[#111] border border-[#222]">
              <span className="text-[#666] block text-[8px]">EINSTEIN COEFF:</span>
              <span className="text-white text-xs font-bold block mt-0.5">
                {(0.6 + (einsteinSla * 0.002) - (einsteinJitter * 0.005)).toFixed(3)}
              </span>
            </div>
            <div className="p-2.5 bg-[#111] border border-[#222]">
              <span className="text-[#666] block text-[8px]">ROUTING REPUTATION:</span>
              <span className={`text-xs font-black block mt-0.5 ${
                activeRep > 80 ? "text-emerald-400" : activeRep > 60 ? "text-amber-400" : "text-red-400"
              }`}>
                {activeRep}%
              </span>
            </div>
            <div className="p-2.5 bg-[#111] border border-[#222]">
              <span className="text-[#666] block text-[8px]">PREDICTED LATENCY:</span>
              <span className="text-[#00F0FF] text-xs font-black block mt-0.5">
                {activeLat.toFixed(1)} ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Router Verdict State */}
      <div className={`p-4 border-2 ${statusBg} transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {statusText.includes("BREACH") ? (
              <ShieldAlert className="text-[#ef4444]" size={14} />
            ) : statusText.includes("STRESS") ? (
              <AlertTriangle className="text-[#f59e0b]" size={14} />
            ) : (
              <CheckCircle2 className="text-[#10b981]" size={14} />
            )}
            <span className={`text-xs font-black tracking-widest ${statusColor}`}>
              STATUS: {statusText}
            </span>
          </div>
          <p className="text-[10.5px] text-gray-400 normal-case leading-relaxed">
            {descText}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[9px] text-[#666] uppercase">ROUTED GATEWAY:</span>
          <span className="px-2 py-0.5 bg-black border border-[#222] text-white text-[10px] font-black font-mono">
            {activeRep > 80 ? "Seattle-Edge-Alpha" : activeRep > 60 ? "London-Vault-Bravo" : "Tokyo-Vessel-Delta (Bypassed)"}
          </span>
        </div>
      </div>
    </div>
  );
};

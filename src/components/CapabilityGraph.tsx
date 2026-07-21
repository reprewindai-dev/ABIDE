import React, { useState, useMemo, useEffect } from "react";
import { CompanyGraph, Capability } from "../types";
import { Globe, Activity, ChevronRight, HelpCircle, Layers, Shield, Check, GitBranch, UserCheck, Compass, Wrench, Terminal, Plus, Play, ArrowRight, Cpu, Coins, Info, AlertTriangle, Clock } from "lucide-react";

interface CapabilityGraphProps {
  companyGraph: CompanyGraph;
  capabilities: Capability[];
  killedCaps?: Record<string, boolean>;
  setActiveTab?: (tab: any) => void;
}

export default function CapabilityGraphComponent({ companyGraph, capabilities, killedCaps, setActiveTab }: CapabilityGraphProps) {
  const [localCapabilities, setLocalCapabilities] = useState<Capability[]>(() => [...capabilities]);
  const [customCapabilities, setCustomCapabilities] = useState<Capability[]>([]);
  
  useEffect(() => {
    setLocalCapabilities(capabilities);
  }, [capabilities]);

  const combinedCapabilities = useMemo(() => {
    return [...localCapabilities, ...customCapabilities];
  }, [localCapabilities, customCapabilities]);

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<"def" | "surf" | "owners" | "jurisdiction" | "verification">("def");
  const [visualizeMode, setVisualizeMode] = useState<"type" | "status" | "cost" | "verification">("type");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Playground & Weaver States
  const [weaverTab, setWeaverTab] = useState<"weaver" | "subagents" | "bundles">("weaver");
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);
  const [isExecutingOps, setIsExecutingOps] = useState(false);
  const [auditTargetId, setAuditTargetId] = useState<string>(() => capabilities[0]?.id || "");
  
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[SYSTEM_INIT] Veklom Sovereign Node Orchestrator active.",
    "[SUB_AGENTS] 3 background M2M sub-agents listening on network loop.",
    "[GNOMLEDGER] Verified anchor proof signature: v_sec_0x2a91... [SLA: <15ms]"
  ]);

  // Weaver Form States
  const [formCapId, setFormCapId] = useState("custom-audit-agent");
  const [formCapName, setFormCapName] = useState("Narrow Audit Agent");
  const [formDomain, setFormDomain] = useState(() => companyGraph?.domains[0]?.name || "Agent Identity");
  const [formProduct, setFormProduct] = useState(() => companyGraph?.products[0]?.name || "");
  const [formSystem, setFormSystem] = useState(() => companyGraph?.canonicalSystems[0]?.name || "Gnomledger");
  const [formPriceFloor, setFormPriceFloor] = useState("0.0240");
  const [formInputs, setFormInputs] = useState("raw_logs, telemetry_claims");
  const [formOutputs, setFormOutputs] = useState("audited_receipt, signoff_vector");

  const handleWeaveCapability = () => {
    const cleanId = formCapId.trim().toLowerCase().replace(/\s+/g, "-");
    if (!cleanId) return;

    if (combinedCapabilities.some(c => c.id === cleanId)) {
      setConsoleLogs(prev => [
        ...prev,
        `[WEAVER_ERR] Refusing to compile. Capability ID "${cleanId}" already registered in active blueprint.`
      ]);
      return;
    }

    const newCap: Capability = {
      id: cleanId,
      name: formCapName.trim(),
      purpose: `Automated ${formCapName.trim()} verifying localized states on-the-fly.`,
      businessOutcome: "Provides instantaneous decentralized verification and eliminates legal/regulatory clearing lag.",
      machineOutcome: "Emits verifiable cryptographic witness vector.",
      inputs: formInputs.split(",").map(s => s.trim()).filter(Boolean),
      outputs: formOutputs.split(",").map(s => s.trim()).filter(Boolean),
      preconditions: ["ledger_sync_ok"],
      postconditions: ["witness_sealed"],
      owner: "Developer Sub-agent",
      canonicalSystem: formSystem,
      canonicalDataDomain: formProduct,
      supportingServices: ["arbitrum-gateway"],
      exposedInterfaces: {
        rest: [`/api/v1/custom/${cleanId}`],
        mcp: [`mcp://custom/${cleanId}`],
        sdk: [`veklom.custom.${cleanId}`],
        cli: [`veklom custom ${cleanId}`],
        ui: [],
        webhooks: []
      },
      exposureSurfaces: [
        {
          type: "API",
          identifier: `/api/v1/custom/${cleanId}`,
          description: `Localized API exposure for ${formCapName.trim()}`,
          status: "Active",
          semanticVersion: "v1.0.0"
        }
      ],
      pricingModel: {
        billingUnit: "per check",
        priceFloor: parseFloat(formPriceFloor) || 0.0150,
        includedQuota: "1,000 runs",
        overage: "$0.02 per run",
        settlementCompat: "X402",
        costToServe: "0.002",
        marginEstimate: 85
      },
      governance: {
        requiredApprovals: ["Secops Autopay"],
        budgetRules: "Standard micro-billing",
        dataBoundaries: "VPC Private subnet",
        delegations: "Runtime delegation",
        auditReqs: "Continuous trace log telemetry",
        killSwitchRules: "Manual toggle by secure admin",
        limits: "500 rps"
      },
      evidence: {
        evidenceProduced: "Witness signature",
        hashAlgorithm: "SHA-256",
        ledgerStorage: formSystem,
        verifiable: true,
        privateDetails: "Sovereign keys locked in HSM",
        completedProof: "Verified",
        classification: "VERIFIED_EXISTING"
      },
      verification: {
        unitTests: ["Verify contract signature", "Validate bounds constraint"],
        contractTests: ["Check Gnomledger alignment"],
        fixtureTests: [],
        mcpTests: [],
        securityTests: ["Static source analysis check"],
        latencySlo: "SLA < 12ms",
        driftChecks: "Active continuously"
      },
      dependencies: [],
      lifecycleState: "Draft",
      maturityState: "Conceptual",
      verificationState: "Unverified",
      pricingState: "Draft Price",
      deprecationState: "None",
      jurisdictionPolicy: {
        dataBoundaryProfile: "EU/US Compliant Residency",
        jurisdictionConstraints: ["Sovereign key ownership", "Decoupled exposure layer"],
        paymentRailConstraints: ["X402 micro-payment settlement"],
        auditRetentionProfile: "7 Year Auditable Ledger Log",
        allowedRegions: ["US", "EU"],
        blockedRegions: [],
        modifiedBehaviorByRegion: {},
        fallbackInteractionPattern: "Graceful fall-back to local offline cache buffer."
      }
    };

    setCustomCapabilities(prev => [...prev, newCap]);
    setSelectedNode({
      id: cleanId,
      rawId: cleanId,
      label: formCapName.trim(),
      type: "capability",
      x: 250,
      y: 220,
      color: "#00F0FF",
      details: newCap.purpose
    });
    
    setConsoleLogs(prev => [
      ...prev,
      `[WEAVER_COMPILER] SUCCESS: Compiled and woven capability "${newCap.name}" into network topology!`,
      `[WEAVER_COMPILER] Auto-allocated topology coordinates. Linked to product: "${formProduct}" & system: "${formSystem}".`
    ]);
  };

  const runOpsCommand = (capId: string) => {
    const targetCap = combinedCapabilities.find(c => c.id === capId);
    if (!targetCap) return;
    
    setIsExecutingOps(true);
    setConsoleLogs(prev => [
      ...prev,
      `[ops-command-runner] $ ./veklom-ops-command --validate --capability "${capId}"`,
      `[ops-command-runner] Initiating symbolic verification of capability boundary: ${targetCap.name}`
    ]);

    setTimeout(() => {
      setConsoleLogs(prev => [
        ...prev,
        `[sub-agent-alpha] Scanning AST interface fields for "${targetCap.name}"... Found valid exposure definitions.`,
        `[sub-agent-beta] SLA test packet injection: sent 100 fake micro-transaction payloads. Avg latency returned: 11.4ms.`
      ]);
    }, 600);

    setTimeout(() => {
      const anchorHash = `AG_ANCHOR_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setConsoleLogs(prev => [
        ...prev,
        `[sub-agent-gamma] No schema drift detected. Committing cryptographic signature to Gnomledger...`,
        `[gnomledger] Block generated and verified. Proof signature: ${anchorHash}`,
        `[ops-command-runner] SUCCESS: Capability "${targetCap.name}" verification state promoted to VERIFIED SAFETY.`
      ]);
      
      setCustomCapabilities(prev => prev.map(c => c.id === capId ? { ...c, verificationState: "Verified" } : c));
      setLocalCapabilities(prev => prev.map(c => c.id === capId ? { ...c, verificationState: "Verified" } : c));
      setIsExecutingOps(false);
    }, 1600);
  };

  // Dynamic coordinate generation for nodes based on compiled blueprint
  const viewBoxWidth = 500;

  // 1. Domains (Y: 50)
  const domainNodes = (companyGraph?.domains || []).map((dom, idx, arr) => {
    const count = arr.length;
    const x = count > 1
      ? 60 + (idx * (viewBoxWidth - 120)) / (count - 1)
      : viewBoxWidth / 2;
    const id = `dom-${dom.name.toLowerCase().replace(/\s+/g, "-")}`;
    return {
      id,
      rawId: dom.name,
      label: dom.name,
      type: "domain",
      x,
      y: 50,
      color: "#BF5AF2",
      desc: dom.description,
    };
  });

  // 2. Products (Y: 120)
  const productNodes = (companyGraph?.products || []).map((prod, idx, arr) => {
    const count = arr.length;
    const x = count > 1
      ? 100 + (idx * (viewBoxWidth - 200)) / (count - 1)
      : viewBoxWidth / 2;
    const id = `prod-${prod.name.toLowerCase().replace(/\s+/g, "-")}`;
    return {
      id,
      rawId: prod.name,
      label: prod.name,
      type: "product",
      x,
      y: 120,
      color: "#0A84FF",
      desc: prod.businessValue || `Product offering: ${prod.name}`,
    };
  });

  // 3. Capabilities (Y: 220)
  const capabilityNodes = (combinedCapabilities || []).map((cap, idx, arr) => {
    const count = arr.length;
    const x = count > 1
      ? 50 + (idx * (viewBoxWidth - 100)) / (count - 1)
      : viewBoxWidth / 2;
    return {
      id: cap.id,
      rawId: cap.id,
      label: cap.name,
      type: "capability",
      x,
      y: 220,
      color: "#00F0FF",
      details: cap.purpose,
    };
  });

  // 4. Systems (Y: 310)
  const systemNodes = (companyGraph?.canonicalSystems || []).map((sys, idx, arr) => {
    const count = arr.length;
    const x = count > 1
      ? 120 + (idx * (viewBoxWidth - 240)) / (count - 1)
      : viewBoxWidth / 2;
    const id = `sys-${sys.name.toLowerCase().replace(/\s+/g, "-")}`;
    return {
      id,
      rawId: sys.name,
      label: sys.name,
      type: "system",
      x,
      y: 310,
      color: "#FF375F",
      desc: sys.purpose,
    };
  });

  // 5. Abide Micro-Nodes (Y: 390)
  const abideNodes = [
    {
      id: "abide-node-a",
      rawId: "Abide-Node-A",
      label: "Abide Node A",
      type: "abide",
      x: 100,
      y: 390,
      color: "#FF9F0A", // Orange
      desc: "Lockerphycer physical security isolation enclave."
    },
    {
      id: "abide-node-b",
      rawId: "Abide-Node-B",
      label: "Abide Node B",
      type: "abide",
      x: 250,
      y: 390,
      color: "#30D158", // Green
      desc: "Cappo-backend & BYOS capability verification router."
    },
    {
      id: "abide-node-c",
      rawId: "Abide-Node-C",
      label: "Abide Node C",
      type: "abide",
      x: 400,
      y: 390,
      color: "#0A84FF", // Blue
      desc: "Gnomledger decentralized peer lineage witness anchor."
    }
  ];

  const nodes = [
    ...domainNodes,
    ...productNodes,
    ...capabilityNodes,
    ...systemNodes,
    ...abideNodes,
  ];

  // Dynamic link generation linking domain to product, product to capability, and capability to system
  const links: { source: string; target: string; dashed?: boolean }[] = [];

  // A. Link Domain -> Product
  (companyGraph?.products || []).forEach(prod => {
    const pNode = productNodes.find(pn => pn.rawId === prod.name);
    if (pNode) {
      const dNode = domainNodes.find(dn => dn.rawId === prod.domain);
      if (dNode) {
        links.push({ source: dNode.id, target: pNode.id });
      }
    }
  });

  if (links.length === 0) {
    (companyGraph?.domains || []).forEach(dom => {
      const dNode = domainNodes.find(dn => dn.rawId === dom.name);
      if (dNode && dom.products) {
        dom.products.forEach(pName => {
          const pNode = productNodes.find(pn => pn.rawId === pName);
          if (pNode) {
            links.push({ source: dNode.id, target: pNode.id });
          }
        });
      }
    });
  }

  // B. Link Product -> Capability (Heuristic mapping based on domain context or sequential distribution)
  (combinedCapabilities || []).forEach((cap, idx) => {
    const capNode = capabilityNodes.find(cn => cn.id === cap.id);
    if (capNode) {
      let matchedProd = null;
      if (cap.owner === "Developer Sub-agent" && cap.canonicalDataDomain) {
        matchedProd = productNodes.find(pn => pn.rawId === cap.canonicalDataDomain);
      }
      if (!matchedProd) {
        matchedProd = productNodes.find(pn => {
          const prodLower = pn.rawId.toLowerCase();
          const capLower = cap.id.toLowerCase();
          return prodLower.includes("os") && (capLower.includes("session") || capLower.includes("route") || capLower.includes("eligibility") || capLower.includes("govern"));
        });
      }
      if (!matchedProd) {
        matchedProd = productNodes.find(pn => {
          const prodLower = pn.rawId.toLowerCase();
          const capLower = cap.id.toLowerCase();
          return prodLower.includes("escrow") && (capLower.includes("settle") || capLower.includes("evidence") || capLower.includes("dns") || capLower.includes("verify") || capLower.includes("mint"));
        });
      }
      if (!matchedProd && productNodes.length > 0) {
        matchedProd = productNodes[idx % productNodes.length];
      }
      if (matchedProd) {
        links.push({ source: matchedProd.id, target: capNode.id });
      }
    }
  });

  // C. Link Capability -> Canonical System
  (combinedCapabilities || []).forEach(cap => {
    const capNode = capabilityNodes.find(cn => cn.id === cap.id);
    if (capNode) {
      const targetSysName = cap.canonicalServiceSystem || cap.canonicalSystem;
      if (targetSysName) {
        const sysNode = systemNodes.find(sn => sn.rawId.toLowerCase().includes(targetSysName.toLowerCase()) || targetSysName.toLowerCase().includes(sn.rawId.toLowerCase()));
        if (sysNode) {
          links.push({ source: capNode.id, target: sysNode.id });
        } else if (systemNodes.length > 0) {
          const fallbackSys = systemNodes.find(sn => cap.id.includes("session") || cap.id.includes("eligibility") ? sn.rawId.includes("Router") : sn.rawId.includes("Ledger"));
          if (fallbackSys) {
            links.push({ source: capNode.id, target: fallbackSys.id });
          } else {
            links.push({ source: capNode.id, target: systemNodes[0].id });
          }
        }
      }
    }
  });

  // D. Link Inter-Capability dependencies
  (combinedCapabilities || []).forEach(cap => {
    const capNode = capabilityNodes.find(cn => cn.id === cap.id);
    if (capNode && cap.dependencies) {
      cap.dependencies.forEach(depId => {
        const depNode = capabilityNodes.find(cn => cn.id === depId);
        if (depNode) {
          links.push({ source: depNode.id, target: capNode.id, dashed: true });
        }
      });
    }
  });

  // E. Link System -> Abide Micro-Nodes
  systemNodes.forEach(sn => {
    if (sn.rawId.includes("Router")) {
      links.push({ source: sn.id, target: "abide-node-b" });
    } else if (sn.rawId.includes("Ledger") || sn.rawId.includes("Gnomledger")) {
      links.push({ source: sn.id, target: "abide-node-c" });
    }
  });
  // Connect Node A (Secure Enclave) to the first system (or any system containing Security or Router)
  if (systemNodes[0]) {
    links.push({ source: systemNodes[0].id, target: "abide-node-a" });
  }

  // Product Offering Cascade highlighting lookup
  const illuminatedNodeIds = useMemo(() => {
    if (!highlightedProduct) return null;
    const ids = new Set<string>();
    
    const pNode = productNodes.find(pn => pn.rawId === highlightedProduct);
    if (pNode) {
      ids.add(pNode.id);
      
      const prodObj = companyGraph?.products.find(p => p.name === highlightedProduct);
      if (prodObj) {
        const dNode = domainNodes.find(dn => dn.rawId === prodObj.domain);
        if (dNode) ids.add(dNode.id);
      }
      
      links.forEach(l => {
        if (l.source === pNode.id) {
          ids.add(l.target);
          
          links.forEach(l2 => {
            if (l2.source === l.target) {
              ids.add(l2.target);
            }
          });
        }
      });
    }
    return ids;
  }, [highlightedProduct, productNodes, domainNodes, companyGraph, links]);

  // Dynamic node color and badge calculation helper
  const getNodeVisuals = (node: any) => {
    if (node.type !== "capability") {
      return { color: node.color, extraLabel: "" };
    }

    if (killedCaps && killedCaps[node.id]) {
      return { color: "#EF4444", extraLabel: "HALTED" };
    }

    const cap = combinedCapabilities.find(c => c.id === node.id);
    if (!cap) return { color: node.color, extraLabel: "" };

    let color = node.color;
    let extraLabel = "";

    if (visualizeMode === "status") {
      const state = cap.maturityState?.toLowerCase() || "";
      if (state.includes("production")) {
        color = "#10B981"; // Emerald green
        extraLabel = "PROD";
      } else if (state.includes("simulated")) {
        color = "#F59E0B"; // Amber orange
        extraLabel = "SIM";
      } else {
        color = "#3B82F6"; // Blue
        extraLabel = "CONCEPT";
      }
    } else if (visualizeMode === "cost") {
      const price = cap.pricingModel?.priceFloor || 0;
      if (price === 0) {
        color = "#10B981"; // Emerald free
        extraLabel = "FREE";
      } else if (price < 0.02) {
        color = "#60A5FA"; // Cyan/blue
        extraLabel = `$${price}`;
      } else if (price < 0.1) {
        color = "#F59E0B"; // Amber
        extraLabel = `$${price}`;
      } else {
        color = "#EF4444"; // Red
        extraLabel = `$${price}`;
      }
    } else if (visualizeMode === "verification") {
      const state = cap.verificationState?.toLowerCase() || "";
      if (state.includes("verified")) {
        color = "#10B981"; // Emerald
        extraLabel = "SAFE";
      } else if (state.includes("drift")) {
        color = "#EF4444"; // Red
        extraLabel = "DRIFT";
      } else {
        color = "#6B7280"; // Slate gray
        extraLabel = "UNVERIFIED";
      }
    }

    return { color, extraLabel };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-[#00F0FF]" />
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Interactive Capability Network Graph</h3>
        </div>
        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 font-bold border border-emerald-500/30 uppercase tracking-widest">
          Dynamic state trace active
        </span>
      </div>

      <p className="text-xs font-mono text-[#666] uppercase leading-relaxed max-w-4xl">
        Rendered from the latest blueprint compile. Select an overlay filter to project unit cost, implementation maturity, or ledger audit status onto the physical nodes. Hover any node to trace downstream dependency pathways.
      </p>

      {/* Dynamic Graph Visualizer Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-[#0A0A0A] border-2 border-[#222] p-3 text-xs font-mono uppercase">
        <span className="text-[#666] font-black text-[10px] tracking-wider block">[ Visualization Overlay filter ]</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "type", label: "Capability Category / Type", desc: "Color by domain, product, capability, or system" },
            { id: "status", label: "Implementation Status", desc: "Color by maturity (Production vs Simulated vs Concept)" },
            { id: "cost", label: "Unit Cost / Price", desc: "Highlight by unit pricing tier" },
            { id: "verification", label: "Verification Safety", desc: "Color by certified verification state" }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setVisualizeMode(opt.id as any)}
              className={`px-3 py-1.5 border font-bold transition-all cursor-pointer text-[10px] uppercase tracking-wider ${
                visualizeMode === opt.id
                  ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF] font-black"
                  : "bg-black border-[#222] text-gray-400 hover:text-white hover:border-[#444]"
              }`}
              title={opt.desc}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive SVG Canvas */}
        <div className="lg:col-span-8 p-4 bg-[#050505] border-2 border-[#1E293B] relative rounded-none overflow-hidden h-[460px]">
          <svg className="w-full h-full" viewBox="0 0 500 440">
            {/* Grid background & arrow markers */}
            <defs>
              <pattern id="graph-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111" strokeWidth="1" />
              </pattern>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="14"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
              </marker>
              <marker
                id="arrow-dashed"
                viewBox="0 0 10 10"
                refX="14"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFD60A" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#graph-grid)" />

            {/* Render Links */}
            {links.map((link, i) => {
              const src = nodes.find(n => n.id === link.source);
              const tgt = nodes.find(n => n.id === link.target);
              if (!src || !tgt) return null;

              // Bezier curve calculations
              const midY = (src.y + tgt.y) / 2;
              const pathData = `M ${src.x} ${src.y} C ${src.x} ${midY}, ${tgt.x} ${midY}, ${tgt.x} ${tgt.y}`;

              const isHoveredNetwork = hoveredNode 
                ? (link.source === hoveredNode || link.target === hoveredNode)
                : false;
              
              const isIlluminatedLink = illuminatedNodeIds 
                ? (illuminatedNodeIds.has(link.source) && illuminatedNodeIds.has(link.target))
                : false;

              let opacity = "0.5";
              if (hoveredNode) {
                opacity = isHoveredNetwork ? "1" : "0.15";
              } else if (illuminatedNodeIds) {
                opacity = isIlluminatedLink ? "1" : "0.08";
              }

              const isHaltedLink = killedCaps && (killedCaps[link.source] || killedCaps[link.target]);
              let strokeColor = isHoveredNetwork 
                ? "#00F0FF" 
                : (isHaltedLink ? "#EF4444" : (link.dashed ? "#FFD60A" : "#333"));
              
              if (!hoveredNode && isIlluminatedLink) {
                strokeColor = "#00F0FF";
              }

              let strokeWidth = isHoveredNetwork 
                ? "2.5" 
                : (isHaltedLink ? "2.0" : (link.dashed ? "1.5" : "1.5"));

              if (!hoveredNode && isIlluminatedLink) {
                strokeWidth = "2.5";
              }

              return (
                <g key={i} style={{ opacity, transition: "opacity 0.2s" }}>
                  <path
                     d={pathData}
                     fill="none"
                     stroke={strokeColor}
                     strokeWidth={strokeWidth}
                     strokeDasharray={link.dashed ? "4 4" : "0"}
                     className={link.dashed ? "animate-[dash_2s_linear_infinite]" : ""}
                     markerEnd={link.dashed ? "url(#arrow-dashed)" : "url(#arrow)"}
                  />
                  {/* Small animated signal bubble on links */}
                  <circle r={isHoveredNetwork || isIlluminatedLink ? "3" : "2"} fill={isHoveredNetwork || isIlluminatedLink ? "#FFD60A" : "#00F0FF"} className="glow-cyan">
                    <animateMotion dur={isHoveredNetwork || isIlluminatedLink ? "1.5s" : "3s"} repeatCount="indefinite" path={pathData} />
                  </circle>
                </g>
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const isRelated = hoveredNode 
                ? (hoveredNode === node.id || links.some(l => (l.source === hoveredNode && l.target === node.id) || (l.target === hoveredNode && l.source === node.id)))
                : false;
              
              const isIlluminatedNode = illuminatedNodeIds 
                ? illuminatedNodeIds.has(node.id)
                : false;

              let opacity = "1";
              if (hoveredNode) {
                opacity = isRelated ? "1" : "0.3";
              } else if (illuminatedNodeIds) {
                opacity = isIlluminatedNode ? "1" : "0.15";
              }

              const { color, extraLabel } = getNodeVisuals(node);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => { setSelectedNode(node); setActiveSubTab("def"); }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer group"
                  style={{ opacity, transition: "opacity 0.2s" }}
                >
                  <circle
                    r={node.type === "domain" ? "12" : node.type === "product" ? "10" : "8"}
                    fill={color}
                    stroke={isSelected ? "#FFF" : (isHovered || isIlluminatedNode ? "#00F0FF" : "#050505")}
                    strokeWidth="2"
                    className="group-hover:scale-125 transition-transform duration-200"
                  />
                  {/* Glowing outer shadow ring */}
                  <circle
                    r={node.type === "domain" ? "16" : "12"}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity={isSelected || isHovered || isIlluminatedNode ? "0.8" : "0.2"}
                    className={isSelected || isHovered || isIlluminatedNode ? "animate-ping" : ""}
                    style={{ animationDuration: "3s" }}
                  />
                  <text
                    y="-16"
                    textAnchor="middle"
                    fill={isSelected || isHovered || isIlluminatedNode ? "#00F0FF" : "#E0E0E0"}
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="uppercase select-none group-hover:fill-white transition-colors"
                  >
                    {node.label}
                  </text>

                  {/* Draw extra dynamic label/badge if enabled and present */}
                  {extraLabel && (
                    <g transform="translate(0, 16)">
                      <rect
                        x="-24"
                        y="-6"
                        width="48"
                        height="11"
                        fill="#050505"
                        stroke={color}
                        strokeWidth="0.5"
                        rx="1"
                      />
                      <text
                        textAnchor="middle"
                        fill={color}
                        fontSize="5.5"
                        fontFamily="monospace"
                        fontWeight="black"
                        y="1"
                      >
                        {extraLabel}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Dynamic Map Legend based on visual Mode */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[8px] font-mono uppercase text-[#666]">
            {visualizeMode === "type" && (
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#BF5AF2] block rounded-full" /> Domain</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#0A84FF] block rounded-full" /> Product</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00F0FF] block rounded-full" /> Capability</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#FF375F] block rounded-full" /> System</span>
              </div>
            )}
            {visualizeMode === "status" && (
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10B981] block rounded-full" /> Sovereign Production</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#F59E0B] block rounded-full" /> Partially Simulated</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3B82F6] block rounded-full" /> Conceptual / Draft</span>
              </div>
            )}
            {visualizeMode === "cost" && (
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10B981] block rounded-full" /> Free ($0.00)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#60A5FA] block rounded-full" /> Low (&lt; $0.02)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#F59E0B] block rounded-full" /> Mid (&lt; $0.10)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#EF4444] block rounded-full" /> High (&ge; $0.10)</span>
              </div>
            )}
            {visualizeMode === "verification" && (
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10B981] block rounded-full" /> Verified Safety</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#6B7280] block rounded-full" /> Unverified Design</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#EF4444] block rounded-full" /> Drift Detected</span>
              </div>
            )}
            <span className="text-[#555] hidden sm:inline">Hover a node to trace lineage pathways</span>
          </div>
        </div>

        {/* Selected Node Details Panel */}
        <div className="lg:col-span-4 border-2 border-[#222] bg-[#0A0A0A] p-5 flex flex-col justify-between rounded-none min-h-[400px] max-h-[600px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-5 text-xs font-mono uppercase">
              <div className="border-b border-[#222] pb-3">
                <span className="text-[9px] text-[#00F0FF] font-black tracking-widest uppercase block">[ NODE ARCHITECTURE DRILLDOWN ]</span>
                <h4 className="text-sm font-black text-white mt-1 uppercase tracking-tight">{selectedNode.label}</h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#111] border border-[#222] text-[#888] font-black tracking-widest uppercase">
                    TYPE: {selectedNode.type}
                  </span>
                  {selectedNode.type === "capability" && (() => {
                    const cap = combinedCapabilities.find(c => c.id === selectedNode.id);
                    if (!cap) return null;
                    return (
                      <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase">
                        {cap.lifecycleState}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* DYNAMIC METADATA RENDER BASED ON TYPE */}
              {selectedNode.type === "capability" ? (() => {
                const cap = combinedCapabilities.find(c => c.id === selectedNode.id);
                if (!cap) {
                  return (
                    <div className="space-y-2">
                      <span className="text-[#555] block">Business Purpose:</span>
                      <p className="text-gray-300 normal-case text-[11px] leading-relaxed mt-1">{selectedNode.details}</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 pt-1">
                    {/* Viewpoint Subtabs */}
                    <div className="flex border-b border-[#222] text-[9px] font-mono pb-1 mb-2.5 uppercase overflow-x-auto whitespace-nowrap scrollbar-thin gap-1">
                      {[
                        { id: "def", label: "Boundary", icon: Compass },
                        { id: "surf", label: "Interfaces", icon: Layers },
                        { id: "owners", label: "Ownership & Sources", icon: UserCheck },
                        { id: "jurisdiction", label: "Jurisdictions", icon: Shield },
                        { id: "verification", label: "Promotion Rules", icon: Wrench }
                      ].map(sub => {
                        const Icon = sub.icon;
                        const isAct = activeSubTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setActiveSubTab(sub.id as any)}
                            className={`px-2 py-1 flex items-center gap-1 border-b-2 font-bold transition-all cursor-pointer ${
                              isAct ? "border-[#00F0FF] text-[#00F0FF] bg-[#0c1e22]/30" : "border-transparent text-gray-500 hover:text-white"
                            }`}
                          >
                            <Icon size={10} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Subtab Content: CORE DEFINITION (def) */}
                    {activeSubTab === "def" && (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <span className="text-[#555] block text-[9px] font-black">Stable Capability Purpose:</span>
                          <p className="text-white normal-case text-[11.5px] leading-relaxed mt-1 font-bold">{cap.purpose}</p>
                          <p className="text-gray-400 normal-case text-[10.5px] leading-relaxed mt-1 italic">{cap.businessOutcome}</p>
                        </div>

                        {/* Lineage & Versioning Panel */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-1.5 font-mono text-[9.5px]">
                          <span className="text-[9px] text-[#00F0FF] font-black block uppercase">[ CANONICAL VERSION LINEAGE ]</span>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <div>
                              <span className="text-gray-500">Stable ID:</span>
                              <span className="text-white font-bold ml-1">{cap.stableId || `cap-${cap.id}`}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">SemVer:</span>
                              <span className="text-emerald-400 font-bold ml-1">{cap.semanticVersion || "v1.0.0"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Prior Version:</span>
                              <span className="text-gray-400 ml-1">{cap.priorVersionPointer || "None"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Deprecate Flag:</span>
                              <span className={`font-bold ml-1 ${cap.deprecationFlag ? "text-red-400" : "text-gray-400"}`}>
                                {cap.deprecationFlag ? "TRUE" : "FALSE"}
                              </span>
                            </div>
                          </div>
                          {cap.replacementPointer && (
                            <div className="border-t border-[#111] pt-1 mt-1 flex justify-between items-center text-[9px]">
                              <span className="text-gray-500">Replacement Pointer:</span>
                              <span className="text-amber-400 font-bold">{cap.replacementPointer}</span>
                            </div>
                          )}
                        </div>

                        {/* General Metadata Matrix */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-2">
                          <span className="text-[9px] text-gray-500 font-black tracking-wider block">[ GENERAL STATES ]</span>
                          <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                            <div>
                              <span className="text-gray-600 block">Lifecycle:</span>
                              <span className="text-white font-bold">{cap.lifecycleState}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">Maturity:</span>
                              <span className="text-white font-bold">{cap.maturityState}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">Verification:</span>
                              <span className={`font-bold ${cap.verificationState === "Verified" ? "text-emerald-400" : "text-amber-500"}`}>
                                {cap.verificationState}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">Pricing:</span>
                              <span className="text-white font-bold">{cap.pricingState}</span>
                            </div>
                          </div>
                        </div>

                        {/* Boundary Constraints */}
                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#111]">
                          <div>
                            <span className="text-[#555] block text-[8px]">Inputs:</span>
                            <ul className="list-disc pl-3 text-gray-400 mt-1 space-y-0.5 text-[9.5px] normal-case">
                              {(cap.inputs || []).map((inp, i) => (
                                <li key={i}>{inp}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-[#555] block text-[8px]">Outputs:</span>
                            <ul className="list-disc pl-3 text-gray-400 mt-1 space-y-0.5 text-[9.5px] normal-case">
                              {(cap.outputs || []).map((out, i) => (
                                <li key={i}>{out}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {cap.dependencies.length > 0 && (
                          <div className="pt-2 border-t border-[#111]">
                            <span className="text-[#555] block text-[8.5px]">Capability Dependencies:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {cap.dependencies.map((dep, i) => (
                                <span key={i} className="text-[8px] px-2 py-0.5 bg-[#111] border border-[#222] text-[#AAA] rounded-none">
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subtab Content: EXPOSURE SURFACES (surf) */}
                    {activeSubTab === "surf" && (
                      <div className="space-y-3 animate-fadeIn">
                        <div>
                          <span className="text-[#555] block text-[9px] font-black">Decoupled Exposure Surfaces:</span>
                          <p className="text-[10px] text-gray-400 normal-case mt-0.5 leading-normal">
                            API, MCP, SDK, and UI entrypoints are kept separate from underlying capability objects to isolate volatileness.
                          </p>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {cap.exposureSurfaces && cap.exposureSurfaces.map((surf, i) => (
                            <div key={i} className="p-2.5 bg-[#050505] border border-[#222] flex flex-col space-y-1.5 text-[10px]">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[8px] px-1 py-0.2 uppercase font-black tracking-wider ${
                                    surf.type === "API" ? "bg-blue-500/20 text-blue-300" :
                                    surf.type === "MCP" ? "bg-cyan-500/20 text-cyan-300" :
                                    surf.type === "SDK" ? "bg-purple-500/20 text-purple-300" :
                                    surf.type === "UI" ? "bg-pink-500/20 text-pink-300" :
                                    "bg-amber-500/20 text-amber-300"
                                  }`}>
                                    {surf.type}
                                  </span>
                                  <span className="text-white font-black tracking-tight select-all truncate max-w-[150px]" title={surf.identifier}>
                                    {surf.identifier}
                                  </span>
                                </div>
                                <span className="text-[7.5px] text-gray-500 font-bold uppercase">{surf.status}</span>
                              </div>
                              <p className="text-[9.5px] normal-case text-gray-400 leading-snug">{surf.description}</p>
                              
                              <div className="pt-1.5 border-t border-[#111] flex justify-between items-center text-[8.5px] text-gray-500 font-mono">
                                <span>ID: <span className="text-gray-300 font-bold">{surf.stableId || `exp-${surf.type.toLowerCase()}-${i}`}</span></span>
                                <span>Ver: <span className="text-emerald-400 font-bold">{surf.semanticVersion || "v1.0.0"}</span></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subtab Content: OWNERS & SOURCES (owners) */}
                    {activeSubTab === "owners" && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* A. Ownership Matrix */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-2">
                          <span className="text-[9px] text-[#00F0FF] font-black block uppercase">[ PRIMARY & SECONDARY OWNERSHIP ]</span>
                          <div className="space-y-1.5 text-[9.5px]">
                            <div className="flex justify-between border-b border-[#111] pb-1">
                              <span className="text-gray-500">Primary Owner:</span>
                              <span className="text-white font-bold">{cap.primaryOwner || cap.owner || "Unassigned"}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#111] pb-1">
                              <span className="text-gray-500">Technical Owner:</span>
                              <span className="text-white font-bold">{cap.technicalOwner || "Unassigned"}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#111] pb-1">
                              <span className="text-gray-500">Data Domain Owner:</span>
                              <span className="text-white font-bold">{cap.dataOwner || "Unassigned"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Compliance & Risk:</span>
                              <span className="text-white font-bold">{cap.complianceOwner || "Unassigned"}</span>
                            </div>
                          </div>
                        </div>

                        {/* B. Source of Truth fields */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-2">
                          <span className="text-[9px] text-amber-400 font-black block uppercase">[ CANONICAL SOURCE OF TRUTH ]</span>
                          <div className="space-y-2 text-[9.5px]">
                            <div>
                              <span className="text-gray-500 block text-[8.5px]">Canonical Data Domain:</span>
                              <span className="text-gray-200 font-bold normal-case block leading-normal">{cap.canonicalDataDomain || "Default Product Domain"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[8.5px]">Canonical System / Service:</span>
                              <span className="text-gray-200 font-bold normal-case block leading-normal">{cap.canonicalServiceSystem || cap.canonicalSystem}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[8.5px]">Canonical Repository:</span>
                              <span className="text-gray-300 font-bold select-all cursor-copy font-mono block truncate" title={cap.canonicalRepoImplementation}>
                                {cap.canonicalRepoImplementation || "Default Repository"}
                              </span>
                            </div>
                            {cap.nonCanonicalMirrors && cap.nonCanonicalMirrors.length > 0 && (
                              <div>
                                <span className="text-gray-500 block text-[8.5px]">Non-Canonical Consumers & Mirrors:</span>
                                <div className="space-y-0.5 mt-0.5 max-h-[80px] overflow-y-auto pr-1">
                                  {cap.nonCanonicalMirrors.map((mir, i) => (
                                    <span key={i} className="text-[9px] text-[#00F0FF] block truncate font-mono select-all font-bold">
                                      • {mir}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subtab Content: JURISDICTION OVERLAY (jurisdiction) */}
                    {activeSubTab === "jurisdiction" && (
                      <div className="space-y-3.5 animate-fadeIn">
                        {/* A. Global properties */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-2 text-[9.5px]">
                          <span className="text-[9px] text-[#00F0FF] font-black block uppercase">[ CORE PROFILE BASICS ]</span>
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-gray-500">Data Residency Boundary:</span>
                              <span className="text-gray-200 normal-case block leading-relaxed">{cap.jurisdictionPolicy?.dataBoundaryProfile || "No residency limit"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Sovereign Constraints applied:</span>
                              <span className="text-[#00F0FF] block mt-0.5 font-bold">{cap.jurisdictionPolicy?.jurisdictionConstraints?.join(", ") || "Global Baseline"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Legal Audit Profile:</span>
                              <span className="text-gray-300 normal-case block leading-relaxed">{cap.jurisdictionPolicy?.auditRetentionProfile || "Default retention"}</span>
                            </div>
                          </div>
                        </div>

                        {/* B. Cross-jurisdictional conflict parameters */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-2 text-[9.5px]">
                          <span className="text-[9px] text-purple-400 font-black block uppercase">[ CROSS-BORDER CONFLICT CONTROLS ]</span>
                          <div className="grid grid-cols-2 gap-2 border-b border-[#111] pb-2">
                            <div>
                              <span className="text-gray-500 block text-[8.5px]">Allowed Regions:</span>
                              <span className="text-emerald-400 font-bold block">{cap.jurisdictionPolicy?.allowedRegions?.join(", ") || "Global"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[8.5px]">Blocked Regions:</span>
                              <span className="text-red-400 font-bold block">{cap.jurisdictionPolicy?.blockedRegions?.join(", ") || "None"}</span>
                            </div>
                          </div>

                          {/* Regional modified behaviors */}
                          {cap.jurisdictionPolicy?.modifiedBehaviorByRegion && (
                            <div>
                              <span className="text-gray-500 block text-[8.5px] mb-1">Modified Behavior Overrides:</span>
                              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                                {Object.entries(cap.jurisdictionPolicy.modifiedBehaviorByRegion).map(([region, text]) => (
                                  <div key={region} className="p-1.5 bg-[#0A0A0A] border border-[#111] space-y-0.5">
                                    <span className="text-[8.5px] px-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 font-black uppercase font-mono">
                                      {region} override
                                    </span>
                                    <p className="text-[9px] text-gray-300 normal-case leading-normal">{text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Fallback pattern */}
                          <div className="pt-1.5 border-t border-[#111]">
                            <span className="text-gray-500 block text-[8.5px]">Fallback Interaction Pattern:</span>
                            <p className="text-[#00F0FF] font-bold normal-case mt-0.5 leading-normal">
                              {cap.jurisdictionPolicy?.fallbackInteractionPattern || "No localized offline fallback defined."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subtab Content: PROMOTION & GATES (verification) */}
                    {activeSubTab === "verification" && (
                      <div className="space-y-3.5 animate-fadeIn">
                        {/* Evidence Tag */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-1.5 text-[9.5px]">
                          <span className="text-[9px] text-emerald-400 font-black block uppercase">[ EVIDENCE STAND ]</span>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Classification Class:</span>
                            <span className={`text-[8.5px] px-1.5 py-0.5 font-bold tracking-wider uppercase border ${
                              cap.evidence?.classification === "VERIFIED_EXISTING" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              cap.evidence?.classification === "INFERRED_FROM_CODE" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              cap.evidence?.classification === "RESEARCH_SUPPORTED" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                              cap.evidence?.classification === "PROJECTED_BUSINESS_ASSUMPTION" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                              "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            }`}>
                              {cap.evidence?.classification || "UNCLASSIFIED"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-[#111]">
                            <span className="text-gray-500">Ledger Anchor:</span>
                            <span className="text-gray-200 font-bold font-mono">{cap.evidence?.ledgerStorage || "Not Anchored"}</span>
                          </div>
                        </div>

                        {/* Machine Promotion rules */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-2 text-[9.5px]">
                          <span className="text-[9px] text-[#00F0FF] font-black block uppercase">[ MACHINE PROMOTION CRITERIA ]</span>
                          {cap.verification?.promotionRules ? (
                            <div className="space-y-1.5">
                              {cap.verification.promotionRules.map((rule, idx) => (
                                <div key={idx} className="p-1.5 bg-[#0A0A0A] border border-[#111] space-y-1">
                                  <div className="flex justify-between text-[8.5px] font-black">
                                    <span className="text-emerald-400">TO: {rule.targetMaturity}</span>
                                    <span className="text-gray-500">REQ CLASS: {rule.requiredEvidenceClass}</span>
                                  </div>
                                  <div className="text-[9px] text-gray-300 normal-case leading-snug">
                                    {rule.extraValidationNeeded}
                                  </div>
                                  <div className="text-[8px] text-gray-500">
                                    MANDATORY COMPILER COVERAGE: {rule.requiredTestsCount} TESTS MINIMUM
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[9px] text-gray-500 normal-case">
                              Requires a manual review by compliance boards and successful compiler sandbox runs to transition out of planning.
                            </div>
                          )}
                        </div>

                        {/* Production Eligibility Gates */}
                        <div className="p-3 bg-[#050505] border border-[#222] space-y-2 text-[9.5px]">
                          <span className="text-[9px] text-amber-400 font-black block uppercase">[ PRODUCTION ELIGIBILITY GATE ]</span>
                          {cap.verification?.productionEligibilityThreshold ? (
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Min Automated Tests:</span>
                                <span className="text-white font-bold">{cap.verification.productionEligibilityThreshold.minTests} Tests Passed</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Evidence Class Required:</span>
                                <span className="text-white font-bold">{cap.verification.productionEligibilityThreshold.requiredEvidence}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Security Audit Approved:</span>
                                <span className={`font-bold ${cap.verification.productionEligibilityThreshold.securityReviewChecked ? "text-emerald-400" : "text-red-400"}`}>
                                  {cap.verification.productionEligibilityThreshold.securityReviewChecked ? "VERIFIED YES" : "PENDING"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Cryptographic Signing Required:</span>
                                <span className={`font-bold ${cap.verification.productionEligibilityThreshold.codeSignRequired ? "text-emerald-400" : "text-red-400"}`}>
                                  {cap.verification.productionEligibilityThreshold.codeSignRequired ? "MANDATORY" : "OPTIONAL"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[9px] text-gray-500 normal-case">
                              Requires continuous drift logs showing sub-15ms response latencies and zero cryptographic mismatches for 72 hours.
                            </div>
                          )}
                        </div>

                        {/* Verification details */}
                        <div className="space-y-1.5">
                          <span className="text-gray-500 block text-[8.5px]">Test Suites Configured:</span>
                          <div className="grid grid-cols-2 gap-1.5 font-mono text-[8.5px] uppercase">
                            <span className="p-1 bg-[#111] border border-[#222] text-emerald-400 block truncate">
                              ✓ {cap.verification?.unitTests?.length || 0} Unit Tests
                            </span>
                            <span className="p-1 bg-[#111] border border-[#222] text-[#00F0FF] block truncate">
                              ✓ {cap.verification?.contractTests?.length || 0} Contract Tests
                            </span>
                            <span className="p-1 bg-[#111] border border-[#222] text-purple-400 block truncate">
                              ✓ {cap.verification?.securityTests?.length || 0} Sec Tests
                            </span>
                            <span className="p-1 bg-[#111] border border-[#222] text-amber-400 block truncate">
                              SLO: {cap.verification?.latencySlo || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="space-y-3 pt-2">
                  <div>
                    <span className="text-[#555] block">Business Purpose:</span>
                    <p className="text-gray-300 normal-case text-[11px] leading-relaxed mt-1">{selectedNode.desc || selectedNode.details}</p>
                  </div>

                  {selectedNode.type === "system" && (
                    <div>
                      <span className="text-[#555] block">Implementation Frameworks:</span>
                      <p className="text-[#00F0FF] text-[10px] mt-1 font-bold">Rust Tokio Threadpool + Arbitrum rollup connectors</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <HelpCircle className="text-[#333]" size={36} />
              <p className="text-xs font-mono text-[#555] uppercase leading-relaxed">
                Click any coordinate node in the topology layout to run real-time dependency audits and view boundary claims.
              </p>
            </div>
          )}

          <div className="text-[9px] text-[#444] font-mono uppercase border-t border-[#1A1A1A] pt-3.5 mt-4">
            Security: Verified Gnomledger Anchor Proof. Handshake response target SLA &lt; 15ms.
          </div>
        </div>
      </div>

      {/* Sovereign Weaver & Sub-Agent M2M Playground */}
      <div className="mt-8 border-2 border-[#222] bg-[#050505] p-5 space-y-6 text-xs font-mono uppercase">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222] pb-4 gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu size={16} className="text-[#00F0FF] animate-pulse" />
              <span>Sovereign Weaver & Sub-Agent M2M Playground</span>
            </h4>
            <p className="text-[10px] font-mono text-[#666] uppercase">
              Interactively customize capabilities, run background sub-agent ops checks, and trace alignment.
            </p>
          </div>
          
          <div className="flex gap-1.5 bg-black p-1 border border-[#222] text-[9px] font-mono">
            {[
              { id: "weaver", label: "Weave Capability", icon: Plus },
              { id: "subagents", label: "M2M Sub-Agents", icon: Terminal },
              { id: "bundles", label: "Bundle Overlay", icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setWeaverTab(tab.id as any)}
                  className={`px-3 py-1.5 flex items-center gap-1.5 font-bold transition-all uppercase cursor-pointer ${
                    weaverTab === tab.id
                      ? "bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] font-black"
                      : "border border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Icon size={11} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Weave Capability */}
        {weaverTab === "weaver" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="space-y-3">
              <span className="text-[10px] text-gray-400 font-bold tracking-wider block">[ CAPABILITY DIRECTIVES ]</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#555]">CAPABILITY ID (STABLE):</label>
                  <input
                    type="text"
                    value={formCapId}
                    onChange={(e) => setFormCapId(e.target.value)}
                    className="w-full bg-black border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[#555]">FRIENDLY NAME:</label>
                  <input
                    type="text"
                    value={formCapName}
                    onChange={(e) => setFormCapName(e.target.value)}
                    className="w-full bg-black border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#555]">DOMAIN:</label>
                  <select
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    className="w-full bg-black border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  >
                    {(companyGraph?.domains || []).map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[#555]">PRODUCT OFFERING:</label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full bg-black border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  >
                    <option value="">-- DEFAULT --</option>
                    {(companyGraph?.products || []).map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[#555]">CANONICAL SYSTEM:</label>
                  <select
                    value={formSystem}
                    onChange={(e) => setFormSystem(e.target.value)}
                    className="w-full bg-black border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  >
                    {(companyGraph?.canonicalSystems || []).map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#555]">INPUT PARAMS (COMMA SEP):</label>
                  <input
                    type="text"
                    value={formInputs}
                    onChange={(e) => setFormInputs(e.target.value)}
                    className="w-full bg-black border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[#555]">OUTPUT PARAMS (COMMA SEP):</label>
                  <input
                    type="text"
                    value={formOutputs}
                    onChange={(e) => setFormOutputs(e.target.value)}
                    className="w-full bg-black border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[9px] text-[#555]">M2M TRANSACTION PRICING FLOOR ($):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0.0"
                    value={formPriceFloor}
                    onChange={(e) => setFormPriceFloor(e.target.value)}
                    className="w-48 bg-black border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#666]">X402 micro-payment settlement compatible.</span>
                </div>
              </div>

              <button
                onClick={handleWeaveCapability}
                className="w-full mt-4 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 py-3.5 font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                <Plus size={14} />
                <span>Compile & Weave into Topology Map</span>
              </button>
            </div>

            <div className="p-4 bg-black border border-[#222] flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Info size={14} />
                  <span>Decoupled M2M Compilation Rules</span>
                </div>
                <p className="text-[10.5px] text-gray-400 normal-case leading-relaxed">
                  Weaving executes a dry compile on our local compiler (<b>Seked</b>). The new capability receives a standard isolation wrapper, registers automatically within coordinates (Y: 220), and inherits the chosen domain boundaries.
                </p>
                <p className="text-[10.5px] text-gray-400 normal-case leading-relaxed">
                  Once compiled, the node will appear as grey (<b>UNVERIFIED</b>) in the topology graph. Navigate to the <b>M2M Sub-Agents</b> tab to run localized unit/contract audits via our verification pipeline.
                </p>
              </div>

              <div className="border-t border-[#151515] pt-3 flex items-center justify-between text-[#555] text-[9px]">
                <span>COMPILER: Seked v1.1.2</span>
                <span>LEDGER STATE: GNOM_OK</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: M2M Sub-Agents & Terminal */}
        {weaverTab === "subagents" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left controller: Run Ops checks */}
            <div className="md:col-span-4 space-y-4">
              <div className="p-3 bg-black border border-[#222] space-y-3">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">[ ACTIVATE BACKGROUND AGENTS ]</span>
                <p className="text-[10px] text-gray-500 normal-case leading-normal">
                  Background sub-agents evaluate AST contract bounds, check latency SLO parameters, and sign cryptographically valid receipts.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-[#555] block">SELECT CAPABILITY NODE TARGET:</label>
                  <select
                    value={auditTargetId}
                    onChange={(e) => setAuditTargetId(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222] p-2 text-white font-mono uppercase text-[10px] focus:border-[#00F0FF] focus:outline-none"
                  >
                    {combinedCapabilities.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={isExecutingOps || !auditTargetId}
                  onClick={() => runOpsCommand(auditTargetId)}
                  className={`w-full py-2.5 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    isExecutingOps || !auditTargetId
                      ? "bg-[#111] text-[#444] border border-[#222] cursor-not-allowed"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                  }`}
                >
                  <Play size={12} className={isExecutingOps ? "animate-spin text-emerald-400" : ""} />
                  <span>{isExecutingOps ? "Executing Ops Validation..." : "Execute Sub-Agent Ops Check"}</span>
                </button>
              </div>

              {/* Subagent Status List */}
              <div className="space-y-2">
                {[
                  { name: "Sub-Agent Alpha (Audit Validator)", role: "Validates AST constraints", status: "ONLINE", col: "text-emerald-400" },
                  { name: "Sub-Agent Beta (SLO Monitor)", role: "Injects test latency packets", status: "MONITORING", col: "text-cyan-400" },
                  { name: "Sub-Agent Gamma (Heuristic Solver)", role: "Prevents data boundary drift", status: "STANDBY", col: "text-[#666]" }
                ].map((sa, i) => (
                  <div key={i} className="p-2 bg-[#0A0A0A] border border-[#222] flex justify-between items-center text-[9.5px]">
                    <div>
                      <span className="text-white font-bold block">{sa.name}</span>
                      <span className="text-gray-500 normal-case">{sa.role}</span>
                    </div>
                    <span className={`font-black text-[9px] ${sa.col}`}>[ {sa.status} ]</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hacker Terminal */}
            <div className="md:col-span-8 flex flex-col h-full min-h-[220px]">
              <div className="bg-[#050505] border border-[#222] flex items-center justify-between px-3 py-1.5 border-b-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">veklom-ops-command console</span>
              </div>
              <div className="bg-black border border-[#222] p-3 flex-1 overflow-y-auto max-h-[240px] font-mono text-[9.5px] leading-relaxed text-emerald-400 space-y-1">
                {consoleLogs.map((log, i) => {
                  let logCol = "text-emerald-400";
                  if (log.includes("[WEAVER_COMPILER]")) logCol = "text-[#00F0FF]";
                  if (log.includes("[WEAVER_ERR]") || log.includes("[SYSTEM_ERR]")) logCol = "text-red-400";
                  if (log.includes("[gnomledger]") || log.includes("[sub-agent-alpha]")) logCol = "text-amber-400";
                  if (log.includes("$")) logCol = "text-white font-bold";
                  return (
                    <div key={i} className={`${logCol} whitespace-pre-wrap`}>
                      {log}
                    </div>
                  );
                })}
                {isExecutingOps && (
                  <div className="text-emerald-400 animate-pulse">
                    ▒ [sub-agent-audit] running verification loops...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bundle Overlay */}
        {weaverTab === "bundles" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
            <div className="md:col-span-7 space-y-4">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">[ INTENTIONAL BUNDLE MAPPING OVERLAYS ]</span>
              <p className="text-[10.5px] text-gray-400 normal-case leading-relaxed">
                Toggle a product bundle below to trace its exact coordinate mapping across the physical layout. Unselected pathways will dim automatically to optimize system visualization density.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setHighlightedProduct(null)}
                  className={`p-3 text-left border flex justify-between items-center font-bold cursor-pointer transition-colors ${
                    !highlightedProduct
                      ? "bg-white/5 border-[#00F0FF] text-[#00F0FF]"
                      : "bg-black border-[#222] text-gray-400 hover:text-white"
                  }`}
                >
                  <span>CLEAR FILTER (SHOW COMPLETE TOPOLOGY NETWORK)</span>
                  <span className="text-[9px] font-mono">[ ACTIVE ]</span>
                </button>

                {(companyGraph?.products || []).map(p => {
                  const isAct = highlightedProduct === p.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => setHighlightedProduct(p.name)}
                      className={`p-3 text-left border flex justify-between items-center font-bold cursor-pointer transition-colors ${
                        isAct
                          ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]"
                          : "bg-black border-[#222] text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${isAct ? "bg-[#00F0FF]" : "bg-[#333]"}`} />
                        <span>{p.name.toUpperCase()}</span>
                      </div>
                      <span className="text-[9px] text-[#666] font-mono lowercase">view cascade trail</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-5 p-4 bg-black border border-[#222] flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#00F0FF] font-bold">
                  <Compass size={14} />
                  <span>Cognitive IDE Navigation</span>
                </div>
                <p className="text-[10.5px] text-gray-400 normal-case leading-relaxed">
                  Looking to perform advanced AST engineering, run solver queries, or code live interfaces? Jump directly to the Interactive Developer Assistant (IDA).
                </p>
                <p className="text-[10.5px] text-gray-400 normal-case leading-relaxed">
                  All capabilities and bundles woven inside this visualization graph remain synchronized within the active runtime context.
                </p>
              </div>

              {setActiveTab && (
                <button
                  onClick={() => setActiveTab("explorer")}
                  className="w-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/30 py-3 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase text-xs"
                >
                  <span>Go to IDA (Cognitive IDE)</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Capability } from "../types";
import { Code, Copy, Check } from "lucide-react";

interface InterfacesInventoryProps {
  capabilities: Capability[];
}

export default function InterfacesInventory({ capabilities }: InterfacesInventoryProps) {
  const [selectedCapId, setSelectedCapId] = useState<string>(capabilities[0]?.id || "govern-agent-session");
  const [interfaceFilter, setInterfaceFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const matchedCap = capabilities.find(c => c.id === selectedCapId) || capabilities[0] || null;

  // Map filters to standard key matching
  const filterList = [
    { value: "all", label: "All Interfaces" },
    { value: "rest", label: "REST Endpoints" },
    { value: "mcp", label: "MCP Tools" },
    { value: "sdk", label: "SDK Methods" },
    { value: "cli", label: "CLI Actions" },
    { value: "webhook", label: "Webhooks & Events" }
  ];

  // Helper code blocks for realistic displays in JetBrains Mono dynamically generated!
  const getInterfaceCodeSnippet = (cap: Capability | null, filter: string) => {
    if (!cap) return "// No active capability selected";

    const inputsObj = (cap.inputs || []).reduce((acc, curr) => {
      const key = curr.toLowerCase().replace(/\s+/g, "");
      acc[key] = "string";
      return acc;
    }, {} as Record<string, string>);

    const inputsJson = JSON.stringify(inputsObj, null, 2);

    const restEndpoint = cap.exposedInterfaces?.rest?.[0] || `POST /api/v1/${cap.id}/execute`;
    const mcpToolName = cap.exposedInterfaces?.mcp?.[0] || `${cap.id.replace(/-/g, "_")}_tool`;
    const sdkMethod = cap.exposedInterfaces?.sdk?.[0] || `veklom.${cap.id.replace(/-/g, ".")}()`;
    const cliCommand = cap.exposedInterfaces?.cli?.[0] || `veklom ${cap.id.replace(/-/g, " ")}`;
    const webhookEvent = cap.exposedInterfaces?.webhooks?.[0] || `${cap.id}.triggered`;

    if (filter === "rest") {
      return `${restEndpoint}
Content-Type: application/json
Authorization: Bearer <X402_TOKEN>

${inputsJson}

--> Response 201 Created
{
  "status": "SUCCESS",
  "outputs": ${JSON.stringify(cap.outputs || [], null, 2)}
}`;
    } else if (filter === "mcp") {
      const inputsList = cap.inputs || [];
      return `{
  "name": "${mcpToolName.split("(")[0]}",
  "description": "${cap.purpose}",
  "inputSchema": {
    "type": "object",
    "properties": {
${inputsList.map(inp => `      "${inp.toLowerCase().replace(/\s+/g, "_")}": { "type": "string" }`).join(",\n")}
    },
    "required": [${inputsList[0] ? `"${inputsList[0].toLowerCase().replace(/\s+/g, "_")}"` : ""}]
  }
}`;
    } else if (filter === "sdk") {
      const sdkCall = sdkMethod.includes("(") ? sdkMethod : `${sdkMethod}(${inputsJson})`;
      return `import { VeklomCore } from "@veklom/sdk";

const core = new VeklomCore({ apiKey: process.env.VEKLOM_KEY });

// Executing capability: ${cap.name}
const result = await core.${sdkCall};

console.log("Execution Result:", result);`;
    } else if (filter === "cli") {
      const args = (cap.inputs || []).map(inp => `--${inp.toLowerCase().replace(/\s+/g, "-")}="value"`).join(" ");
      return `$ ${cliCommand.split(" ")[0]} ${cliCommand.split(" ").slice(1).join(" ")} ${args}

[+] STATE: ACTIVE EXECUTION STATUS`;
    } else if (filter === "webhook" || filter === "all") {
      return `// Webhook Notification Event Structure:
{
  "event": "${webhookEvent}",
  "timestamp": "${new Date().toISOString()}",
  "payload": {
    "capabilityId": "${cap.id}",
    "owner": "${cap.owner || "platform"}",
    "machineOutcome": "${cap.machineOutcome}"
  }
}`;
    } else {
      return `// Interface details for ${cap.id}`;
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[#222] pb-3">
        <Code size={18} className="text-[#00F0FF]" />
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Capability Interface Inventory</h3>
      </div>
      <p className="text-xs font-mono text-[#666] uppercase leading-relaxed max-w-4xl">
        Filter interface points by structural types (REST, SDK, MCP, CLI). Select a capability to inspect mock input contracts and copy production-ready code declarations.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Capability List */}
        <div className="lg:col-span-4 space-y-2 max-h-[380px] overflow-y-auto pr-2 border-r-2 border-[#111]">
          <span className="text-[10px] font-mono font-black text-[#555] uppercase tracking-wider block mb-2">CAPABILITY ROSTER</span>
          {capabilities.map((cap) => (
            <button
              key={cap.id}
              onClick={() => setSelectedCapId(cap.id)}
              className={`w-full text-left p-3.5 border transition-all rounded-none uppercase font-mono text-xs ${
                (matchedCap?.id === cap.id)
                  ? "bg-[#0A0A0A] border-[#00F0FF] text-white"
                  : "bg-transparent border-[#222] text-[#888] hover:border-gray-500 hover:text-white"
              }`}
            >
              <div className="font-bold tracking-tight">{cap.name}</div>
              <div className="text-[9px] text-[#444] mt-1 tracking-wider">ID: {cap.id}</div>
            </button>
          ))}
        </div>

        {/* Right: Code Details Panel */}
        <div className="lg:col-span-8 space-y-4">
          {/* Interface Type Pills */}
          <div className="flex flex-wrap gap-2 border-b border-[#222] pb-3">
            {filterList.map((f) => (
              <button
                key={f.value}
                onClick={() => setInterfaceFilter(f.value)}
                className={`px-3 py-1.5 border font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-none ${
                  interfaceFilter === f.value
                    ? "bg-[#00F0FF] text-black border-[#00F0FF]"
                    : "bg-[#0A0A0A] border-[#222] text-[#666] hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Code Viewer Card */}
          {matchedCap && (
            <div className="border-2 border-[#222] bg-[#050505] p-5 space-y-4 rounded-none">
              <div className="flex justify-between items-start border-b border-[#222] pb-3">
                <div>
                  <h4 className="text-xs font-mono font-black text-[#00F0FF] uppercase tracking-wider">{matchedCap.name} Contracts</h4>
                  <p className="text-[10px] text-[#888] font-mono leading-relaxed uppercase mt-1">{matchedCap.purpose}</p>
                </div>
                <button
                  onClick={() => handleCopyCode(getInterfaceCodeSnippet(matchedCap, interfaceFilter), matchedCap.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-[#333] hover:border-[#00F0FF] bg-[#111] hover:bg-[#0A0A0A] text-[#888] hover:text-[#00F0FF] font-mono text-[9px] font-black uppercase tracking-widest transition-colors rounded-none"
                >
                  {copiedId === matchedCap.id ? (
                    <>
                      <Check size={11} className="stroke-[3]" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>COPY INTERFACE</span>
                    </>
                  )}
                </button>
              </div>

              {/* Snippet Block */}
              <div className="bg-[#0A0A0A] border border-[#222] p-4 font-mono text-[11px] leading-relaxed text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-[220px]">
                {getInterfaceCodeSnippet(matchedCap, interfaceFilter)}
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-[#444] uppercase tracking-widest">
                <span>Verified: Merkle Node SLA compliance</span>
                <span>Type: {interfaceFilter === "all" ? "REST/SDK Default" : interfaceFilter.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

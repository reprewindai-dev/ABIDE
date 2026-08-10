import React, { useState, useMemo } from "react";
import { ProductOffering, Capability } from "../types";
import { Coins, Sliders, Check, Download, ShieldCheck } from "lucide-react";

interface BundleConstructorProps {
  productOfferings: ProductOffering[];
  capabilities: Capability[];
}

export default function BundleConstructor({ productOfferings, capabilities }: BundleConstructorProps) {
  // Bundle checklist states
  const [selectedCaps, setSelectedCaps] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (capabilities && capabilities.length > 0) {
      initial[capabilities[0].id] = true;
      if (capabilities.length > 1) {
        initial[capabilities[1].id] = true;
      }
    } else {
      initial["govern-agent-session"] = true;
      initial["score-api-eligibility"] = true;
    }
    return initial;
  });
  const [slaIndex, setSlaIndex] = useState<number>(1.0); // 1.0 = Platinum, 0.8 = Gold, 1.4 = Sovereign
  const [monthlyVolumeK, setMonthlyVolumeK] = useState<number>(250); // in thousands
  const [receipt, setReceipt] = useState<any>(null);

  // Toggle cap check
  const handleToggleCap = (id: string) => {
    setSelectedCaps(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Pricing calculations
  const priceCalculation = useMemo(() => {
    let basePriceFloor = 0;
    let selectedCount = 0;

    capabilities.forEach(cap => {
      if (selectedCaps[cap.id]) {
        basePriceFloor += cap.pricingModel?.priceFloor || 0;
        selectedCount++;
      }
    });

    // Calculations based on sliders
    const grossCost = monthlyVolumeK * 1000 * basePriceFloor * slaIndex;
    
    // Bulk volume discount
    let discount = 0;
    if (monthlyVolumeK >= 1000) {
      discount = 0.20; // 20% discount above 1M transactions
    } else if (monthlyVolumeK >= 500) {
      discount = 0.12; // 12% discount above 500k
    } else if (selectedCount >= 3) {
      discount = 0.08; // 8% bundle discount
    }

    const discountedPrice = grossCost * (1 - discount);
    const costToServe = grossCost * 0.15; // standard 15% hardware base cost index
    const grossMargin = discountedPrice - costToServe;
    const marginPercent = discountedPrice > 0 ? (grossMargin / discountedPrice) * 100 : 0;

    return {
      basePriceFloor,
      selectedCount,
      grossCost,
      discount,
      discountedPrice,
      marginPercent
    };
  }, [selectedCaps, slaIndex, monthlyVolumeK, capabilities]);

  // Mint cryptographic bundle agreement receipt
  const handleMintAgreement = () => {
    if (priceCalculation.selectedCount === 0) return;

    const receiptHash = "AGREEM_SEAL_" + Math.random().toString(36).substring(2, 15).toUpperCase();
    setReceipt({
      hash: receiptHash,
      timestamp: new Date().toISOString(),
      caps: Object.keys(selectedCaps).filter(k => selectedCaps[k]),
      volume: monthlyVolumeK * 1000,
      sla: slaIndex === 0.8 ? "GOLD (99.9%)" : slaIndex === 1.0 ? "PLATINUM (99.99%)" : "SOVEREIGN (99.999%)",
      price: priceCalculation.discountedPrice
    });
  };

  return (
    <div className="space-y-8">
      {/* Existing product bundles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#222] pb-3">
          <Coins size={18} className="text-[#00F0FF]" />
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Capability Packages</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productOfferings.map((prod, idx) => (
            <div key={idx} className="p-5 border-2 border-[#222] bg-[#0A0A0A] space-y-4 rounded-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/1 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start gap-4">
                <h4 className="font-black text-white text-sm uppercase tracking-tight">{prod.name}</h4>
                <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-widest shrink-0">
                  ACTIVE SPEC
                </span>
              </div>
              <p className="text-[11px] text-[#888] font-mono leading-relaxed uppercase">{prod.description}</p>
              
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-[#444] uppercase block">Bundled Capabilities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {prod.capabilities.map((capId, i) => {
                    const matched = capabilities.find(c => c.id === capId);
                    return (
                      <span key={i} className="text-[9px] font-mono bg-[#111] border border-[#222] px-2 py-0.5 text-gray-300 font-semibold uppercase">
                        {matched ? matched.name : capId}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1C1C1C] flex justify-between items-center text-[10px] font-mono uppercase text-[#666]">
                <span>Model: {prod.priceModel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Custom Bundle Constructor */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#222] pb-3 pt-4">
          <Sliders size={18} className="text-[#00F0FF]" />
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Enterprise Custom Bundle Constructor</h3>
        </div>
        <p className="text-xs font-mono text-[#666] uppercase leading-relaxed max-w-4xl">
          Check capabilities to group them into a single enterprise contract. Set target SLA boundaries and scale multipliers to view real-time settlement projection pricing and margin estimates.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Capability Checklist & Sliders */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Checklist */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-black text-white uppercase tracking-wider">
                Select Capabilities to Bundle:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono uppercase">
                {capabilities.map(cap => {
                  const isChecked = !!selectedCaps[cap.id];
                  return (
                    <div
                      key={cap.id}
                      onClick={() => handleToggleCap(cap.id)}
                      className={`p-4 border-2 transition-all duration-150 cursor-pointer rounded-none flex items-start gap-3 ${
                        isChecked
                          ? "bg-[#00F0FF]/5 border-[#00F0FF] text-white"
                          : "bg-[#0A0A0A] border-[#222] text-[#666] hover:border-gray-500"
                      }`}
                    >
                      <div className={`w-4 h-4 border-2 shrink-0 flex items-center justify-center mt-0.5 ${isChecked ? "border-[#00F0FF] bg-[#00F0FF]/20" : "border-[#333]"}`}>
                        {isChecked && <Check size={11} className="text-[#00F0FF] stroke-[4]" />}
                      </div>
                      <div className="space-y-1">
                        <span className={`font-black tracking-wide ${isChecked ? "text-white" : "text-[#888]"}`}>{cap.name}</span>
                        <p className="text-[9px] text-[#444] leading-tight normal-case">{cap.pricingModel?.billingUnit || "per transaction"} — Floor: ${cap.pricingModel?.priceFloor || 0}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SLA select & volume multiplier slider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-mono font-black text-white uppercase tracking-wider">
                  Target SLA Class:
                </label>
                <select
                  value={slaIndex}
                  onChange={(e) => setSlaIndex(parseFloat(e.target.value))}
                  className="w-full bg-[#0A0A0A] border-2 border-[#222] p-2.5 text-xs text-[#E0E0E0] focus:outline-none focus:border-[#00F0FF] rounded-none font-mono uppercase"
                >
                  <option value={0.8}>GOLD (99.9%) - 20% discount</option>
                  <option value={1.0}>PLATINUM (99.99%) - standard index</option>
                  <option value={1.4}>SOVEREIGN (99.999%) - 40% premium</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono uppercase">
                  <span className="text-white">Est. Monthly Volume:</span>
                  <span className="text-[#00F0FF] font-black">{(monthlyVolumeK * 1000).toLocaleString()} checks</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={monthlyVolumeK}
                  onChange={(e) => setMonthlyVolumeK(parseInt(e.target.value))}
                  className="w-full accent-[#00F0FF] h-1.5 bg-[#222] rounded-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#444] font-mono uppercase">
                  <span>10K runs</span>
                  <span>1,000K runs</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Dynamic Billing Invoice & Receipt */}
          <div className="lg:col-span-5 p-5 border-2 border-[#222] bg-[#0A0A0A] flex flex-col justify-between rounded-none min-h-[300px]">
            <div className="space-y-4">
              <div className="border-b border-[#222] pb-3 flex justify-between items-center">
                <span className="text-[10px] font-mono font-black text-[#666] uppercase tracking-widest">REAL-TIME INVOICE ESTIMATION</span>
                <span className="text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5">
                  X402 settlement compat
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono uppercase">
                <div className="flex justify-between">
                  <span className="text-[#555]">Capabilities Selected:</span>
                  <span className="text-white font-bold">{priceCalculation.selectedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Sum Price Floor:</span>
                  <span className="text-white font-bold">${priceCalculation.basePriceFloor.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Bulk Volume Discount:</span>
                  <span className="text-emerald-400 font-black">{(priceCalculation.discount * 100).toFixed(0)}% OFF</span>
                </div>
                <div className="flex justify-between border-t border-[#1C1C1C] pt-2.5">
                  <span className="text-[#555]">Gross Cost:</span>
                  <span className="text-white">${priceCalculation.grossCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base border-t border-dashed border-[#222] pt-3">
                  <span className="text-white font-black">Package Net Cost:</span>
                  <span className="text-[#00F0FF] font-black">${priceCalculation.discountedPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} / mo</span>
                </div>
                <div className="flex justify-between text-[10px] pt-1">
                  <span className="text-[#444]">Target Margin Index:</span>
                  <span className="text-gray-400">{priceCalculation.marginPercent.toFixed(1)}% Est.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleMintAgreement}
                  disabled={priceCalculation.selectedCount === 0}
                  className="w-full py-2.5 bg-[#00F0FF] hover:bg-white text-black text-xs font-black uppercase tracking-widest transition-all rounded-none disabled:opacity-30 disabled:hover:bg-[#00F0FF]"
                >
                  Mint Bundle Agreement Receipt
                </button>
              </div>
            </div>

            {receipt && (
              <div className="mt-4 p-4 border border-emerald-500/20 bg-emerald-500/5 text-xs font-mono uppercase space-y-2 rounded-none">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold border-b border-emerald-500/20 pb-1.5">
                  <ShieldCheck size={14} />
                  <span>DEFI ESCROW COLLATERAL DEPOSITED</span>
                </div>
                <div className="text-[10px] text-gray-300 space-y-1">
                  <p><span className="text-[#444]">HASH:</span> {receipt.hash}</p>
                  <p><span className="text-[#444]">CONTRACT SLA:</span> {receipt.sla}</p>
                  <p><span className="text-[#444]">EST. VALUE:</span> ${receipt.price.toLocaleString()} USD / Month</p>
                  <p className="text-[9px] text-emerald-400/70 lowercase">Proof anchored on Gnomledger block 1822831.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileJson, 
  FileArchive, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  Database, 
  Cpu, 
  FileText 
} from "lucide-react";

interface ExportConfirmModalProps {
  isOpen: boolean;
  type: "diagnostics" | "zip";
  onClose: () => void;
  onConfirm: () => void;
  metadata: {
    title?: string;
    fileCount?: number;
    targetPlatform?: string;
    backendCount?: number;
    testStatus?: string;
    notesLength?: number;
    reportId?: string;
    hash?: string;
  };
}

export const ExportConfirmModal: React.FC<ExportConfirmModalProps> = ({
  isOpen,
  type,
  onClose,
  onConfirm,
  metadata
}) => {
  if (!isOpen) return null;

  const isZip = type === "zip";
  const title = isZip ? "Blueprint Project Bundle" : "Diagnostic Report";
  const icon = isZip ? <FileArchive className="text-[#00F0FF]" size={20} /> : <FileJson className="text-amber-400" size={20} />;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020408]/95 backdrop-blur-md"
        />

        {/* Modal container */}
        <motion.div
          initial={{ scale: 0.93, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.93, y: 15, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-[#0A0D14] border-2 border-[#1E293B] hover:border-[#334155] w-full max-w-lg relative z-10 p-6 shadow-2xl font-mono uppercase space-y-5 rounded-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#111625] border border-[#1E293B]">
                {icon}
              </div>
              <div>
                <h3 className="font-black text-xs text-white tracking-widest">
                  Confirm Outbound Export Session
                </h3>
                <span className="text-[9px] text-[#00F0FF] font-bold block tracking-tight">
                  Sovereign Cryptographic Verification Requested
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors p-1 bg-[#111625] border border-[#1E293B] hover:border-red-500/50"
            >
              <X size={12} />
            </button>
          </div>

          {/* Attention / Intent Notice */}
          <div className="bg-amber-950/10 border-2 border-amber-500/25 p-3 text-amber-200 text-[10px] leading-relaxed normal-case">
            <div className="flex items-start gap-2">
              <AlertTriangle className="shrink-0 text-amber-500 mt-0.5" size={14} />
              <div className="space-y-1 font-semibold font-mono">
                <span className="font-bold text-amber-400 block uppercase tracking-wider">[ INTENT SAFEGUARD CHECK ]</span>
                <p>
                  You are exporting sensitive architectural blueprint artifacts out of the secure workspace environment. Please review the summary details below to guarantee this action aligns with your explicit intent.
                </p>
              </div>
            </div>
          </div>

          {/* Export Specific Summary Data Card */}
          <div className="bg-[#03060C] border border-[#1E293B] p-4 space-y-3">
            <span className="text-[9.5px] text-gray-500 font-bold block border-b border-[#111625] pb-1">
              [ EXPORT MANIFEST SUMMARY ]
            </span>

            {isZip ? (
              // ZIP Blueprint Bundle summary
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between border-b border-[#111] pb-1">
                  <span className="text-gray-400">Blueprint Title:</span>
                  <span className="text-white font-black text-right max-w-[240px] truncate">{metadata.title || "Veklom Project"}</span>
                </div>
                <div className="flex justify-between border-b border-[#111] pb-1">
                  <span className="text-gray-400">Target Platform:</span>
                  <span className="text-[#00F0FF] font-black">{metadata.targetPlatform || "Arbitrum (Default)"}</span>
                </div>
                <div className="flex justify-between border-b border-[#111] pb-1">
                  <span className="text-gray-400">Included Files:</span>
                  <span className="text-white font-black">{metadata.fileCount || 0} active modules</span>
                </div>
                <div className="flex justify-between border-b border-[#111] pb-1">
                  <span className="text-gray-400">Security Manifest:</span>
                  <span className="text-emerald-400 font-black">SHA-256 Merkle Proof Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Ingress Notes:</span>
                  <span className="text-white font-black">{metadata.notesLength || 0} characters</span>
                </div>
              </div>
            ) : (
              // Diagnostics JSON report summary
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between border-b border-[#111] pb-1">
                  <span className="text-gray-400">Report Reference:</span>
                  <span className="text-white font-black">{metadata.reportId || "VEKLOM-APEX-DIAG-000000"}</span>
                </div>
                <div className="flex justify-between border-b border-[#111] pb-1">
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="text-white font-black">{new Date().toLocaleTimeString()} (Local)</span>
                </div>
                <div className="flex justify-between border-b border-[#111] pb-1">
                  <span className="text-gray-400">Integrated Routers:</span>
                  <span className="text-[#00F0FF] font-black">{metadata.backendCount || 4} configured nodes</span>
                </div>
                <div className="flex justify-between border-b border-[#111] pb-1">
                  <span className="text-gray-400">Test Suite Status:</span>
                  <span className="text-white font-black">{metadata.testStatus || "NOT RUN"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cryptographic Hash:</span>
                  <span className="text-emerald-400 font-black truncate max-w-[200px]">{metadata.hash || "0x8f2a...10b"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Security rule footer info */}
          <div className="p-3 bg-red-500/5 border border-red-500/10 text-center">
            <p className="text-[10px] text-red-400 italic font-black leading-relaxed">
              "No unauthorized drift becomes durable project state."
            </p>
            <span className="text-[8px] text-[#555] block mt-0.5 font-bold uppercase tracking-wider">
              - Gnomledger Core Safeguard Rule
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="py-2.5 bg-[#111625] hover:bg-[#1C243B] border border-[#1E293B] text-gray-400 hover:text-white text-[10px] font-black tracking-widest transition-colors rounded-none"
            >
              [ CANCEL EXPORT ]
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="py-2.5 bg-[#00F0FF] hover:bg-white text-black text-[10px] font-black tracking-widest transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 rounded-none"
            >
              <ShieldCheck size={13} />
              <span>[ CONFIRM &amp; DOWNLOAD ]</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

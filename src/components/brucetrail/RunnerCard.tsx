"use client";
import { Runner } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

interface RunnerCardProps {
  runners: Runner[];
  onClose: () => void;
}

export default function RunnerCard({ runners, onClose }: RunnerCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const runner = runners[currentIndex];
  if (!runner) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-black/90 border border-[#ff003c] p-4 shadow-[0_0_15px_rgba(255,0,60,0.4)] backdrop-blur-sm z-50 text-left cursor-default font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-[#ff003c] transition-colors"
      >
        <X size={16} />
      </button>

      {runners.length > 1 && (
        <div className="flex justify-between items-center mb-2 border-b border-[#cca571]/30 pb-2">
          <button 
            disabled={currentIndex === 0} 
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            className="text-[#cca571] disabled:opacity-30 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-mono text-gray-400">
            TEAM MEMBER {currentIndex + 1} / {runners.length}
          </span>
          <button 
            disabled={currentIndex === runners.length - 1} 
            onClick={() => setCurrentIndex(i => Math.min(runners.length - 1, i + 1))}
            className="text-[#cca571] disabled:opacity-30 hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="flex gap-4 items-center mb-3 mt-2">
        <div className="w-12 h-12 rounded-full border-2 border-[#00f0ff] overflow-hidden bg-gray-800 shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.5)] flex items-center justify-center">
          {runner.avatar ? (
            <img src={runner.avatar} alt={runner.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#00f0ff] font-bold text-lg">{runner.name[0]}</span>
          )}
        </div>
        <div>
          <h3 className="text-[#00f0ff] font-display font-bold text-lg leading-tight">{runner.name}</h3>
          <p className="text-gray-400 text-xs font-mono">{runner.class}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="bg-[#111] p-2 border-l-2 border-[#ff003c] hover:bg-[#1a0505] transition-colors">
          <p className="text-[10px] text-gray-500 font-mono mb-1">LOCATION_DATA</p>
          <p className="text-white font-bold">{runner.dist.toFixed(1)} <span className="text-xs text-[#ff003c]">/ 900 KM</span></p>
        </div>
        
        <div className="bg-[#111] p-2 border-l-2 border-[#00f0ff] hover:bg-[#051a1a] transition-colors">
          <p className="text-[10px] text-gray-500 font-mono mb-1">COMMS_LINK</p>
          <p className="text-gray-200 text-sm italic">&quot;{runner.status}&quot;</p>
        </div>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff003c]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ff003c]" />
    </motion.div>
  );
}

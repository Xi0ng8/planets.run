"use client";
import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number; // Leader distance
  total: number; // Total distance
  cumulative: number; // Sum of all runners
}

export default function ProgressBar({ current, total, cumulative }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 relative z-10 p-4 bg-black/40 backdrop-blur-md border border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] overflow-hidden">
      
      {/* Anime Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.1)_50%)] bg-[length:100%_4px]" />

      <div className="flex justify-between items-end mb-2 font-display">
        <div className="flex flex-col">
          <span className="text-[#00f0ff] text-xs font-bold tracking-widest hidden md:block">LEADER PROGRESS</span>
          <span className="text-white text-2xl font-bold">BRUCE TRAIL</span>
        </div>
        <div className="text-right">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#ff003c] text-3xl font-bold drop-shadow-[0_0_8px_rgba(255,0,60,0.8)]"
          >
            {current.toFixed(1)}
          </motion.span>
          <span className="text-gray-400 text-sm ml-1">/ {total} KM</span>
        </div>
      </div>

      {/* Cyberpunk Bar */}
      <div className="h-4 w-full bg-[#050510] border border-[#00f0ff]/20 relative overflow-hidden mb-2">
        {/* Fill */}
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00f0ff] to-[#ff003c]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        >
          <motion.div 
            className="absolute top-0 right-0 w-8 h-full bg-white opacity-50 blur-[4px]"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </motion.div>
        
        <div className="absolute inset-0 flex justify-between px-[10%] opacity-20 pointer-events-none">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-[1px] h-full bg-white" />
          ))}
        </div>
      </div>
      
      <div className="text-right text-xs font-mono text-gray-500">
        [ TEAM CUMULATIVE: <span className="text-[#cca571] font-bold">{cumulative} KM</span> ]
      </div>
    </div>
  );
}

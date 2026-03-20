"use client";
import React, { useState, useEffect } from "react";
import ProgressBar from "@/components/brucetrail/ProgressBar";
import { MoveLeft, UserPlus, X, FileText } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import ReactMarkdown from 'react-markdown';
import yaml from 'js-yaml';

const TrackerMap = dynamic(() => import("@/components/brucetrail/TrackerMap"), {
  ssr: false,
  loading: () => <div className="h-[650px] w-full bg-[#050510] flex items-center justify-center text-[#00f0ff] animate-pulse font-mono tracking-widest relative rounded-xl border border-[#00f0ff]/20">INITIALIZING SATELLITE LINK...</div>
});

export default function BruceTrailPage() {
  const [showQR, setShowQR] = useState(false);
  const [showLog, setShowLog] = useState(false);
  
  const [logData, setLogData] = useState<any>(null);
  const [markdownBody, setMarkdownBody] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the dynamically managed markdown file
    fetch('/brucetrail_log.md?t=' + Date.now()) // cache bust to allow instant local updates
      .then(res => {
        if (!res.ok) throw new Error("Log not found");
        return res.text();
      })
      .then(text => {
        // Simple frontmatter parsing via regex
        const contentMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (contentMatch) {
          try {
            const dataObj = yaml.load(contentMatch[1]);
            setLogData(dataObj);
            setMarkdownBody(contentMatch[2]);
          } catch (e) {
            console.error("YAML Parse Error:", e);
          }
        } else {
          // No frontmatter, just text
          setMarkdownBody(text);
          setLogData({});
        }
      })
      .catch(err => {
         console.warn("Could not load markdown log file", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-[#cca571] font-sans relative flex justify-center">
      {/* Background Anime/Cyberpunk atmospheric elements - Full Width */}
      <div className="absolute top-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,60,0.1),_transparent_70%)]" />
      <div className="absolute top-0 w-full h-[200px] bg-gradient-to-b from-[#ff003c]/20 to-transparent pointer-events-none" />

      {/* Mobile Constrained Wrapper */}
      <div className="w-full max-w-md min-h-screen flex flex-col py-8 px-4 relative z-10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-[#050505]/50 backdrop-blur border-x border-[#ff003c]/20">
        
        {/* Nav & Header */}
        <header className="w-full mb-8 flex justify-between items-center px-2">
          <Link href="/">
            <motion.div 
              whileHover={{ x: -5 }} 
              className="flex items-center gap-2 text-[#00f0ff] font-display hover:text-white transition-colors"
            >
              <MoveLeft size={20} />
              <span>RETURN TO HUB</span>
            </motion.div>
          </Link>
          <div className="text-right">
            <h1 className="text-3xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#cca571] to-[#fff] drop-shadow-[0_0_10px_rgba(204,165,113,0.5)] tracking-wider">
              BRUCE TRAIL
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-2 tracking-widest">[EXPEDITION_TRACKER_V2.0]</p>
          </div>
        </header>

        {loading ? (
          <div className="text-center text-[#ff003c] animate-pulse py-10">DECRYPTING DATA CORE...</div>
        ) : (
          <>
            {logData && (
              <motion.div
                className="w-full"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ProgressBar 
                  current={logData.totalProgress || 0} 
                  total={logData.totalDistance || 900} 
                  cumulative={logData.cumulativeTeamDistance || 0}
                />
              </motion.div>
            )}

            <motion.div
              className="w-full relative z-0"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TrackerMap 
                runners={logData?.runners || []} 
                waypoints={logData?.waypoints || []} 
                totalDistance={logData?.totalDistance || 900} 
              />
            </motion.div>
          </>
        )}

        {/* Call to Action Footer */}
        <motion.div 
          className="w-full text-center mt-6 mb-12 flex flex-col gap-4 relative z-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button 
            className="group relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#ff003c]/10 border border-[#ff003c] text-[#ff003c] font-display font-bold text-lg hover:bg-[#ff003c] hover:text-white transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(255,0,60,0.3)] hover:shadow-[0_0_40px_rgba(255,0,60,0.6)] cursor-pointer"
            onClick={() => setShowQR(true)}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            <UserPlus size={20} />
            <span>JOIN THE QUEST</span>
          </button>
          
          <button 
            className="group relative w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] font-display font-bold text-md hover:bg-[#00f0ff] hover:text-black transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] cursor-pointer"
            onClick={() => setShowLog(true)}
          >
            <FileText size={18} />
            <span>OPEN EXPEDITION LOG</span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] border border-[#ff003c] p-6 max-w-sm w-full shadow-[0_0_30px_rgba(255,0,60,0.3)] relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowQR(false)} 
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-[#00f0ff] font-display text-xl font-bold mb-4 text-center tracking-widest border-b border-[#00f0ff]/30 pb-3">ACCESS GRANTED</h2>
              
              <div className="bg-white p-2 rounded flex justify-center items-center mb-6 mt-2 relative overflow-hidden group">
                <img src="/brucetrail_qr.png" alt="Scan to Join" className="w-[200px] h-[200px] object-contain" />
                <div className="absolute top-0 left-0 w-full h-[5px] bg-[#00f0ff]/50 shadow-[0_0_10px_#00f0ff] animate-[moveDown_2s_linear_infinite]" />
              </div>
              
              <div className="text-center">
                <p className="text-gray-300 font-sans text-sm mb-2">Scan the QR code to join our expedition team.</p>
                <p className="text-[#ff003c] font-mono text-xs animate-pulse">Awaiting new runners...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex justify-center bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowLog(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md min-h-screen bg-[#050a0f] border-x border-[#00f0ff]/30 p-6 relative shadow-[0_0_100px_rgba(0,240,255,0.2)] mt-12 mb-0 rounded-t-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowLog(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-[#ff003c] transition-colors p-2 bg-[#111] rounded-full border border-gray-700"
              >
                <X size={18} />
              </button>
              
              <div className="mb-8 border-b border-[#00f0ff]/30 pb-4 pr-10">
                <h2 className="text-[#00f0ff] font-display text-2xl font-bold">EXPEDITION LOG</h2>
                <p className="text-[#cca571] text-xs font-mono mt-1">:: TERMINAL_ACCESS / PUBLIC_RECORDS</p>
              </div>

              {/* MD Render */}
              <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-[#00f0ff] prose-a:text-[#ff003c] prose-strong:text-white prose-blockquote:border-l-[#cca571] prose-blockquote:bg-[#111] prose-blockquote:py-1 prose-blockquote:px-4 prose-li:text-gray-300 font-sans text-sm max-w-none">
                <ReactMarkdown>{markdownBody}</ReactMarkdown>
              </div>

              <div className="mt-12 text-center text-[10px] text-gray-600 font-mono">
                [END OF TRANSMISSION]
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Config } from "../types";
import { unlockAudio, playStartEvent } from "../utils/audio";
import { ICE_BREAKERS } from "../constants/icebreakers";

export function SetupScreen({ onStart }: { onStart: (cfg: Config) => void }) {
  const [rounds, setRounds] = useState(6);
  const [duration, setDuration] = useState(5);
  const [breakDuration, setBreakDuration] = useState(30);
  const [showPreview, setShowPreview] = useState(false);

  const click = (fn: () => void) => () => { unlockAudio(); fn(); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center p-6 h-full w-full"
      style={{
        background: "radial-gradient(ellipse at 20% 50%, #1a0a2e 0%, #0d0d0d 50%, #0a0a0a 100%)",
      }}
    >
      {/* ── Help / Preview Trigger ── */}
      <button
        onClick={() => setShowPreview(true)}
        className="absolute bottom-6 z-40 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-[#f97316] hover:border-[#f97316]/50 transition-all cursor-pointer backdrop-blur-md flex items-center gap-3"
        title="Preview Questions"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span className="text-sm font-bold tracking-wider uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Preview Questions
        </span>
      </button>

      {/* ── Preview Modal Overlay ── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-12 overflow-hidden"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* ── Modal Container ── */}
            <motion.div
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 30, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(30,20,40,0.8) 0%, rgba(10,5,15,0.95) 100%)",
                border: "1px solid rgba(249,115,22,0.2)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(249,115,22,0.1)",
              }}
            >
              <div className="flex-shrink-0 p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Instrument Sans', sans-serif", color: "#fff" }}>
                    Icebreakers Preview
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] mt-2" style={{ color: "#f97316", fontFamily: "'JetBrains Mono', monospace" }}>
                    {ICE_BREAKERS.length} curated questions
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* ── Scrolling List ── */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 custom-scrollbar">
                {ICE_BREAKERS.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-5 rounded-xl transition-colors group"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span className="text-[#f97316] text-xs font-bold mr-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg text-white/90 font-medium tracking-wide group-hover:text-white transition-colors" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                      {q}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg relative z-10 transition-all" style={{ filter: showPreview ? "blur(8px)" : "none", opacity: showPreview ? 0.3 : 1 }}>
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7, type: "spring" }}
          className="text-center mb-12"
        >
          <h1
            className="text-6xl font-black tracking-tighter mb-2"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              background: "linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Dev Roulette
          </h1>
          <p
            className="text-sm tracking-[0.3em] uppercase"
            style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace" }}
          >
            speed networking for developers
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="rounded-2xl p-8 space-y-8"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Rounds */}
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase mb-4"
              style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>Rounds</label>
            <div className="flex items-center gap-4">
              <button onClick={click(() => setRounds(Math.max(1, rounds - 1)))}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-90"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f97316" }}>−</button>
              <div className="flex-1 text-center text-5xl font-black"
                style={{ fontFamily: "'Instrument Sans', sans-serif", color: "#fff" }}>{rounds}</div>
              <button onClick={click(() => setRounds(Math.min(20, rounds + 1)))}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-90"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f97316" }}>+</button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase mb-4"
              style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>Minutes per round</label>
            <div className="flex gap-2 flex-wrap">
              {[3, 5, 7, 10, 15].map((m) => (
                <button key={m} onClick={click(() => setDuration(m))}
                  className="px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: duration === m ? "linear-gradient(135deg, #f97316, #fb923c)" : "rgba(255,255,255,0.04)",
                    border: duration === m ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.08)",
                    color: duration === m ? "#000" : "#aaa",
                  }}>{m} min</button>
              ))}
            </div>
          </div>

          {/* Break */}
          <div>
            <label className="block text-xs tracking-[0.2em] uppercase mb-4"
              style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>Break between rounds (seconds)</label>
            <div className="flex gap-2 flex-wrap">
              {[15, 30, 45, 60, 90].map((s) => (
                <button key={s} onClick={click(() => setBreakDuration(s))}
                  className="px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: breakDuration === s ? "linear-gradient(135deg, #f97316, #fb923c)" : "rgba(255,255,255,0.04)",
                    border: breakDuration === s ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.08)",
                    color: breakDuration === s ? "#000" : "#aaa",
                  }}>{s}s</button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="mt-8">
          <button
            onClick={() => { 
              unlockAudio(); 
              playStartEvent();
              onStart({ rounds, duration: duration * 60, breakDuration }); 
            }}
            className="w-full py-5 rounded-2xl text-lg font-black tracking-wider uppercase transition-all active:scale-[0.98]"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#000",
              boxShadow: "0 0 40px rgba(249,115,22,0.3), 0 0 80px rgba(249,115,22,0.1)",
            }}>Start Event</button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-center mt-6 text-xs" style={{ color: "#444", fontFamily: "'JetBrains Mono', monospace" }}>
          Total time: ~{Math.ceil(rounds * duration + (rounds - 1) * (breakDuration / 60))} min
        </motion.p>
      </div>
{/* ── Inject Scrollbar CSS manually on load ── */}
<style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(249,115,22,0.5);
  }
`}</style>
    </motion.div>
  );
}

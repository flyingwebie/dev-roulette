import { useState } from "react";
import { motion } from "framer-motion";
import type { Config } from "../types";
import { unlockAudio } from "../utils/audio";

export function SetupScreen({ onStart }: { onStart: (cfg: Config) => void }) {
  const [rounds, setRounds] = useState(6);
  const [duration, setDuration] = useState(5);
  const [breakDuration, setBreakDuration] = useState(30);

  const click = (fn: () => void) => () => { unlockAudio(); fn(); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "radial-gradient(ellipse at 20% 50%, #1a0a2e 0%, #0d0d0d 50%, #0a0a0a 100%)",
      }}
    >
      <div className="w-full max-w-lg">
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
            onClick={() => { unlockAudio(); onStart({ rounds, duration: duration * 60, breakDuration }); }}
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
    </motion.div>
  );
}

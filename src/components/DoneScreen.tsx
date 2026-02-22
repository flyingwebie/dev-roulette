import { motion } from "framer-motion";

export function DoneScreen({ totalRounds, onRestart }: { totalRounds: number; onRestart: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0a 70%)" }}>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }} className="text-center">
        <div className="text-7xl md:text-9xl font-black tracking-tighter mb-6"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            background: "linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f97316 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>That's a wrap!</div>
        <p className="text-xl mb-2" style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>{totalRounds} rounds completed</p>
        <p className="text-sm mb-12" style={{ color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Now go ship something together</p>
        <button onClick={onRestart}
          className="px-10 py-4 rounded-2xl text-base font-bold tracking-wider uppercase transition-all active:scale-95"
          style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", color: "#f97316" }}>Start New Event</button>
      </motion.div>
    </motion.div>
  );
}

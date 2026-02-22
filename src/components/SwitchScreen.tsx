import { motion } from "framer-motion";

export function SwitchScreen({ roundNumber, totalRounds }: { roundNumber: number; totalRounds: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0a 70%)" }}>
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 150 }}
        className="text-center">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            background: "linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f97316 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>SWITCH!</motion.div>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-6 text-lg tracking-[0.2em] uppercase"
          style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>Move to your next conversation</motion.p>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-4 text-sm" style={{ color: "#444", fontFamily: "'JetBrains Mono', monospace" }}>
          Next: Round {roundNumber} of {totalRounds}
        </motion.div>
      </motion.div>
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 4 + Math.random() * 6, height: 4 + Math.random() * 6, background: "#f97316", opacity: 0.3,
            left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, delay: Math.random() * 2 }} />
      ))}
    </motion.div>
  );
}

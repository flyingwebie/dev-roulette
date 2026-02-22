import { AnimatePresence, motion } from "framer-motion";
import { formatTime } from "../utils/helpers";

export function RoundScreen({
  round,
  totalRounds,
  timeLeft,
  totalTime,
  iceBreaker,
  isPaused,
  onPause,
  onResume,
  onSkip,
}: {
  round: number;
  totalRounds: number;
  timeLeft: number;
  totalTime: number;
  iceBreaker: string;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
}) {
  const progress = 1 - timeLeft / totalTime;
  const isUrgent = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  // Circle dimensions for the different states
  const smallR = 46;
  const smallCirc = 2 * Math.PI * smallR;
  const bigR = 160;
  const bigCirc = 2 * Math.PI * bigR;
  const bigSize = 480;

  const ringColor = isCritical ? "#ef4444" : isUrgent ? "#f97316" : "#f97316";
  const ringGlow = isCritical ? "drop-shadow(0 0 20px rgba(239,68,68,0.6))" : "drop-shadow(0 0 6px rgba(249,115,22,0.3))";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 w-full flex flex-col justify-center items-center p-6 min-h-0"
      style={{
        background: isCritical ? "radial-gradient(ellipse at center, #2a0505 0%, #0a0a0a 70%)" : isUrgent ? "radial-gradient(ellipse at center, #1a0a05 0%, #0a0a0a 70%)" : "radial-gradient(ellipse at center, #0a0a1a 0%, #0a0a0a 70%)",
        transition: "background 1s ease",
        minHeight: 0,
      }}>
      {/* Round indicator — top */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-8 left-0 right-0 text-center">
        <span
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
          Round {round} of {totalRounds}
        </span>
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i < round - 1 ? "#f97316" : i === round - 1 ? "#fb923c" : "rgba(255,255,255,0.1)",
                boxShadow: i === round - 1 ? "0 0 8px rgba(249,115,22,0.5)" : "none",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Main content ── */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl">
        {/* ICE BREAKER — THE HERO (visible when NOT urgent) */}
        <AnimatePresence mode="wait">
          {!isUrgent && (
            <motion.div
              key="icebreaker"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="text-center px-6 mb-16">
              <motion.p
                className="text-xs tracking-[0.25em] uppercase mb-6"
                style={{ color: "#f97316", fontFamily: "'JetBrains Mono', monospace" }}>
                Talk about this
              </motion.p>
              <p
                className="text-4xl md:text-6xl lg:text-7xl leading-tight font-bold"
                style={{ fontFamily: "'Instrument Sans', sans-serif", color: "#ffffff", lineHeight: 1.15 }}>
                {iceBreaker}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TIMER */}
        <AnimatePresence mode="wait">
          {/* ─── Normal: small circle + time ─── */}
          {!isUrgent && (
            <motion.div
              key="timer-normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4">
              <svg
                width="100"
                height="100"
                className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r={smallR}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={smallR}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={smallCirc}
                  strokeDashoffset={smallCirc * (1 - progress)}
                  style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.3))", transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <span
                className="text-4xl md:text-5xl font-bold"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
                {formatTime(timeLeft)}
              </span>
            </motion.div>
          )}

          {/* ─── Urgent: BIG circle with timer centered inside ─── */}
          {isUrgent && (
            <motion.div
              key="timer-urgent"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 180 }}
              className="relative flex flex-col items-center justify-center">
              {/* Big ring */}
              <svg
                width={bigSize}
                height={bigSize}
                className="transform -rotate-90">
                <circle
                  cx={bigSize / 2}
                  cy={bigSize / 2}
                  r={bigR}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx={bigSize / 2}
                  cy={bigSize / 2}
                  r={bigR}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={bigCirc}
                  strokeDashoffset={bigCirc * (1 - progress)}
                  style={{ filter: ringGlow, transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
                />
              </svg>

              {/* Number centered in the ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="font-black leading-none"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: isCritical ? "clamp(8rem, 20vw, 14rem)" : "clamp(5rem, 14vw, 9rem)",
                    color: ringColor,
                    textShadow: isCritical ? "0 0 60px rgba(239,68,68,0.6), 0 0 120px rgba(239,68,68,0.15)" : "0 0 40px rgba(249,115,22,0.4)",
                    transition: "color 0.3s ease, font-size 0.3s ease",
                  }}>
                  {formatTime(timeLeft)}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  className="mt-2 text-sm tracking-[0.3em] uppercase"
                  style={{ color: ringColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {isCritical ? "Finish up!" : "Wrapping up..."}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paused */}
        {isPaused && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mt-6 text-xs tracking-[0.3em] uppercase"
            style={{ color: "#f97316", fontFamily: "'JetBrains Mono', monospace" }}>
            Paused
          </motion.span>
        )}
      </div>

      {/* Controls — bottom */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bottom-8 flex gap-4">
        <button
          onClick={isPaused ? onResume : onPause}
          className="px-8 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all active:scale-95"
          style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#888" }}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={onSkip}
          className="px-8 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all active:scale-95"
          style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#f97316" }}>
          Skip Round
        </button>
      </motion.div>

      {/* Critical pulse */}
      {isCritical && (
        <motion.div
          animate={{ opacity: [0, 0.04, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: "#ef4444" }}
        />
      )}
    </motion.div>
  );
}

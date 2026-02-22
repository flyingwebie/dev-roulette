import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Ice breaker sentences ──
const ICE_BREAKERS = [
  "What do you build at work?",
  "What are you learning lately?",
  "What’s your tech stack?",
  "What are you building for fun?",
  "What’s one tool you love?",
  "What tool should I try?",
  "What’s your favorite shortcut?",
  "What’s your go-to editor/IDE?",
  "Dark mode or light mode?",
  "Tabs or spaces?",
  "Mac, Windows, or Linux?",
  "Frontend, backend, or both?",
  "What’s your current project?",
  "What’s your next project idea?",
  "What’s a tiny win this week?",
  "What problem are you solving?",
  "What’s a good resource you found?",
  "Any podcast/newsletter you like?",
  "What’s a library you recommend?",
  "What’s your favorite API?",
  "What’s your usual debugging move?",
  "Best “aha!” moment recently?",
  "What’s something you automated?",
  "What’s your best dev habit?",
  "What’s one habit you want?",
  "What do you want to get better at?",
  "What’s your role right now?",
  "What’s your dream role?",
  "What brought you here today?",
  "What’s one thing you want help with?",
  "Want to swap GitHub/LinkedIn?",
  "What meetup would you love next?",
  "If you had 1 free hour, what would you code?",
  "What’s your favorite “small” project?",
  "What’s one tip for new devs?",
];

// ══════════════════════════════════════════════
// SOUND SYSTEM
// We keep a persistent AudioContext ref that gets
// initialized on the FIRST user gesture (button click).
// All sounds go through this single context.
// ══════════════════════════════════════════════
let _audioCtx: AudioContext | null = null;
let _audioUnlocked = false;

function ensureAudio() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser policy)
  if (_audioCtx.state === "suspended") {
    _audioCtx.resume();
  }
  _audioUnlocked = true;
  return _audioCtx;
}

// Call this on any user click to unlock audio
function unlockAudio() {
  const ctx = ensureAudio();
  // Play a silent buffer to fully unlock on iOS/Safari
  if (!_audioUnlocked) {
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  }
  _audioUnlocked = true;
}

function playBuzzer() {
  try {
    const ctx = ensureAudio();
    if (!ctx || ctx.state === "closed") return;
    const now = ctx.currentTime;

    // Layer 1 - main buzz
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = "sawtooth";
    o1.frequency.setValueAtTime(200, now);
    o1.frequency.exponentialRampToValueAtTime(100, now + 0.5);
    g1.gain.setValueAtTime(0.5, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    o1.connect(g1).connect(ctx.destination);
    o1.start(now);
    o1.stop(now + 0.7);

    // Layer 2 - overtone
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.type = "square";
    o2.frequency.setValueAtTime(260, now);
    o2.frequency.exponentialRampToValueAtTime(140, now + 0.4);
    g2.gain.setValueAtTime(0.25, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o2.connect(g2).connect(ctx.destination);
    o2.start(now);
    o2.stop(now + 0.6);

    // Layer 3 - repeat hit after 300ms
    const o3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    o3.type = "sawtooth";
    o3.frequency.setValueAtTime(200, now + 0.35);
    o3.frequency.exponentialRampToValueAtTime(100, now + 0.75);
    g3.gain.setValueAtTime(0.001, now);
    g3.gain.linearRampToValueAtTime(0.001, now + 0.34);
    g3.gain.linearRampToValueAtTime(0.4, now + 0.35);
    g3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    o3.connect(g3).connect(ctx.destination);
    o3.start(now + 0.35);
    o3.stop(now + 0.9);
  } catch (e) {
    console.warn("Buzzer failed:", e);
  }
}

function playTick() {
  try {
    const ctx = ensureAudio();
    if (!ctx || ctx.state === "closed") return;
    const now = ctx.currentTime;

    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(1100, now);
    o.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    g.gain.setValueAtTime(0.35, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.15);
  } catch (e) {
    console.warn("Tick failed:", e);
  }
}

// ── Utilities ──
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ── Phases ──
const PHASE_SETUP = "setup";
const PHASE_ROUND = "round";
const PHASE_SWITCH = "switch";
const PHASE_DONE = "done";

// ═══════════════════════════════════════
// SETUP SCREEN
// ═══════════════════════════════════════
interface Config {
  rounds: number;
  duration: number;
  breakDuration: number;
}

function SetupScreen({ onStart }: { onStart: (cfg: Config) => void }) {
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

// ═══════════════════════════════════════
// SWITCH SCREEN
// ═══════════════════════════════════════
function SwitchScreen({ roundNumber, totalRounds }: { roundNumber: number; totalRounds: number }) {
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

// ═══════════════════════════════════════
// DONE SCREEN
// ═══════════════════════════════════════
function DoneScreen({ totalRounds, onRestart }: { totalRounds: number; onRestart: () => void }) {
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

// ═══════════════════════════════════════
// ROUND SCREEN
// Hero = ice breaker sentence
// Timer = secondary, grows into big circle at last 10s
// ═══════════════════════════════════════
function RoundScreen({ round, totalRounds, timeLeft, totalTime, iceBreaker, isPaused, onPause, onResume, onSkip }: { round: number; totalRounds: number; timeLeft: number; totalTime: number; iceBreaker: string; isPaused: boolean; onPause: () => void; onResume: () => void; onSkip: () => void }) {
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
  const ringGlow = isCritical
    ? "drop-shadow(0 0 20px rgba(239,68,68,0.6))"
    : "drop-shadow(0 0 6px rgba(249,115,22,0.3))";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: isCritical
          ? "radial-gradient(ellipse at center, #2a0505 0%, #0a0a0a 70%)"
          : isUrgent
            ? "radial-gradient(ellipse at center, #1a0a05 0%, #0a0a0a 70%)"
            : "radial-gradient(ellipse at center, #0a0a1a 0%, #0a0a0a 70%)",
        transition: "background 1s ease",
      }}>

      {/* Round indicator — top */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-8 left-0 right-0 text-center">
        <span className="text-xs tracking-[0.3em] uppercase"
          style={{ color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Round {round} of {totalRounds}</span>
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i < round - 1 ? "#f97316" : i === round - 1 ? "#fb923c" : "rgba(255,255,255,0.1)",
                boxShadow: i === round - 1 ? "0 0 8px rgba(249,115,22,0.5)" : "none",
              }} />
          ))}
        </div>
      </motion.div>

      {/* ── Main content ── */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl">

        {/* ICE BREAKER — THE HERO (visible when NOT urgent) */}
        <AnimatePresence mode="wait">
          {!isUrgent && (
            <motion.div key="icebreaker"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
              className="text-center px-6 mb-16">
              <motion.p className="text-xs tracking-[0.25em] uppercase mb-6"
                style={{ color: "#f97316", fontFamily: "'JetBrains Mono', monospace" }}>Talk about this</motion.p>
              <p className="text-4xl md:text-6xl lg:text-7xl leading-tight font-bold"
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
            <motion.div key="timer-normal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4">
              <svg width="100" height="100" className="transform -rotate-90">
                <circle cx="50" cy="50" r={smallR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle cx="50" cy="50" r={smallR} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={smallCirc} strokeDashoffset={smallCirc * (1 - progress)}
                  style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.3))", transition: "stroke-dashoffset 0.5s ease" }} />
              </svg>
              <span className="text-4xl md:text-5xl font-bold"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
                {formatTime(timeLeft)}
              </span>
            </motion.div>
          )}

          {/* ─── Urgent: BIG circle with timer centered inside ─── */}
          {isUrgent && (
            <motion.div key="timer-urgent"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 180 }}
              className="relative flex flex-col items-center justify-center">

              {/* Big ring */}
              <svg width={bigSize} height={bigSize} className="transform -rotate-90">
                <circle cx={bigSize / 2} cy={bigSize / 2} r={bigR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                <motion.circle
                  cx={bigSize / 2} cy={bigSize / 2} r={bigR} fill="none"
                  stroke={ringColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={bigCirc} strokeDashoffset={bigCirc * (1 - progress)}
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
                    textShadow: isCritical
                      ? "0 0 60px rgba(239,68,68,0.6), 0 0 120px rgba(239,68,68,0.15)"
                      : "0 0 40px rgba(249,115,22,0.4)",
                    transition: "color 0.3s ease, font-size 0.3s ease",
                  }}>
                  {formatTime(timeLeft)}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.7, y: 0 }}
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
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mt-6 text-xs tracking-[0.3em] uppercase"
            style={{ color: "#f97316", fontFamily: "'JetBrains Mono', monospace" }}>Paused</motion.span>
        )}
      </div>

      {/* Controls — bottom */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        className="absolute bottom-8 flex gap-4">
        <button onClick={isPaused ? onResume : onPause}
          className="px-8 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all active:scale-95"
          style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", color: "#888" }}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button onClick={onSkip}
          className="px-8 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all active:scale-95"
          style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.2)", color: "#f97316" }}>
          Skip Round
        </button>
      </motion.div>

      {/* Critical pulse */}
      {isCritical && (
        <motion.div animate={{ opacity: [0, 0.04, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}
          className="absolute inset-0 pointer-events-none" style={{ background: "#ef4444" }} />
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function DevRoulette() {
  const [phase, setPhase] = useState(PHASE_SETUP);
  const [config, setConfig] = useState<Config | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [iceBreakers, setIceBreakers] = useState<string[]>([]);

  const timerRef = useRef<any>(null);
  const switchTimerRef = useRef<any>(null);
  const timeLeftRef = useRef(0);
  const currentRoundRef = useRef(1);
  const configRef = useRef<Config | null>(null);

  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { configRef.current = config; }, [config]);

  const endRound = useCallback(() => {
    clearInterval(timerRef.current);
    playBuzzer();
    const cfg = configRef.current;
    if (!cfg) return;
    const round = currentRoundRef.current;
    if (round < cfg.rounds) {
      setPhase(PHASE_SWITCH);
      switchTimerRef.current = setTimeout(() => {
        setCurrentRound((r) => r + 1);
        setTimeLeft(cfg.duration);
        setPhase(PHASE_ROUND);
      }, cfg.breakDuration * 1000);
    } else {
      setPhase(PHASE_DONE);
    }
  }, []);

  const handleStart = useCallback((cfg: Config) => {
    const shuffled = shuffleArray(ICE_BREAKERS).slice(0, cfg.rounds);
    setConfig(cfg);
    setIceBreakers(shuffled);
    setCurrentRound(1);
    setTimeLeft(cfg.duration);
    setPhase(PHASE_ROUND);
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    setPhase(PHASE_SETUP);
    setConfig(null);
    setCurrentRound(1);
    setTimeLeft(0);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
  }, []);

  // ── Core timer ──
  useEffect(() => {
    if (phase !== PHASE_ROUND || isPaused) return;

    timerRef.current = setInterval(() => {
      const t = timeLeftRef.current;

      if (t <= 1) {
        setTimeLeft(0);
        endRound();
        return;
      }

      // Tick at 5, 4, 3, 2, 1 (when t is 6→5, 5→4, 4→3, 3→2, 2→1)
      if (t <= 6 && t > 1) {
        playTick();
      }

      setTimeLeft(t - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, isPaused, endRound]);

  const handlePause = () => { setIsPaused(true); clearInterval(timerRef.current); };
  const handleResume = () => { setIsPaused(false); };

  const handleSkip = () => {
    if (!config) return;
    clearInterval(timerRef.current);
    playBuzzer();
    if (currentRound < config.rounds) {
      setPhase(PHASE_SWITCH);
      switchTimerRef.current = setTimeout(() => {
        setCurrentRound((r) => r + 1);
        setTimeLeft(config.duration);
        setPhase(PHASE_ROUND);
        setIsPaused(false);
      }, config.breakDuration * 1000);
    } else {
      setPhase(PHASE_DONE);
    }
  };

  return (
    <div className="w-full h-full" style={{ background: "#0a0a0a" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      <AnimatePresence mode="wait">
        {phase === PHASE_SETUP && <SetupScreen key="setup" onStart={handleStart} />}
        {phase === PHASE_ROUND && config && (
          <RoundScreen key={`round-${currentRound}`}
            round={currentRound} totalRounds={config.rounds}
            timeLeft={timeLeft} totalTime={config.duration}
            iceBreaker={iceBreakers[currentRound - 1] || ICE_BREAKERS[0]}
            isPaused={isPaused} onPause={handlePause} onResume={handleResume} onSkip={handleSkip} />
        )}
        {phase === PHASE_SWITCH && config && <SwitchScreen key="switch" roundNumber={currentRound + 1} totalRounds={config.rounds} />}
        {phase === PHASE_DONE && config && <DoneScreen key="done" totalRounds={config.rounds} onRestart={handleRestart} />}
      </AnimatePresence>
      <div className="text-center w-full align-center justify-center pb-4">
        <p className="text-gray-500 text-sm">Made with ❤️ by <a href="https://www.meetup.com/corkdevs" target="_blank" rel="noopener noreferrer">Cork Devs</a></p>
      </div>
    </div>
  );
}
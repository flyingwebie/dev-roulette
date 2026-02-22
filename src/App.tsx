import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import type { Config } from "./types";
import { ICE_BREAKERS } from "./constants/icebreakers";
import { PHASE_SETUP, PHASE_ROUND, PHASE_SWITCH, PHASE_DONE } from "./constants/phases";
import { playBuzzer, playTick } from "./utils/audio";
import { shuffleArray } from "./utils/helpers";

import { SetupScreen } from "./components/SetupScreen";
import { RoundScreen } from "./components/RoundScreen";
import { SwitchScreen } from "./components/SwitchScreen";
import { DoneScreen } from "./components/DoneScreen";

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

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

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

  const handlePause = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
  };
  const handleResume = () => {
    setIsPaused(false);
  };

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
    <div
      className="app-root relative flex flex-col items-center justify-between overflow-auto"
      style={{ background: "#0a0a0a" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {phase !== PHASE_SETUP && (
        <button
          onClick={handleRestart}
          className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
          title="End Event">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"></line>
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"></line>
          </svg>
        </button>
      )}

      <div className="flex-1 relative w-full h-full">
        <AnimatePresence mode="wait">
          {phase === PHASE_SETUP && (
            <SetupScreen
              key="setup"
              onStart={handleStart}
            />
          )}
          {phase === PHASE_ROUND && config && (
            <RoundScreen
              key={`round-${currentRound}`}
              round={currentRound}
              totalRounds={config.rounds}
              timeLeft={timeLeft}
              totalTime={config.duration}
              iceBreaker={iceBreakers[currentRound - 1] || ICE_BREAKERS[0]}
              isPaused={isPaused}
              onPause={handlePause}
              onResume={handleResume}
              onSkip={handleSkip}
            />
          )}
          {phase === PHASE_SWITCH && config && (
            <SwitchScreen
              key="switch"
              roundNumber={currentRound + 1}
              totalRounds={config.rounds}
            />
          )}
          {phase === PHASE_DONE && config && (
            <DoneScreen
              key="done"
              totalRounds={config.rounds}
              onRestart={handleRestart}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="text-center w-full shrink-0 pb-4 z-10 relative">
        <p className="text-gray-500 text-sm">
          Made with ❤️ by{" "}
          <a
            href="http://www.meetup.com/corkdevs"
            target="_blank"
            rel="noopener noreferrer">
            Cork Devs
          </a>{" "}
          - Version 1.2.1
        </p>
      </div>
    </div>
  );
}

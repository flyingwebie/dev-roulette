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
export function unlockAudio() {
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

export function playBuzzer() {
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

export function playTick() {
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

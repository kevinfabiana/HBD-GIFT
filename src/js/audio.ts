/** Tiny synthesized paper-craft sounds — all very quiet, all optional. */
let ctx: AudioContext | null = null;

/** Shared AudioContext for every synthesized voice in the story. */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function audio() {
  return getAudioContext();
}

function noise(duration: number, filterFreq: number, gain: number) {
  const ac = audio();
  if (!ac) return;
  const frames = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.8;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start();
}

export const paperSound = () => noise(0.28, 2600, 0.035);
export const tapeSound = () => noise(0.18, 4200, 0.03);
export const pencilSound = () => noise(0.14, 1800, 0.022);
export const pageSound = () => noise(0.42, 1200, 0.04);

export function chime(freq = 880) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 1.1);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + 1.2);
}

/** The three-note chime that plays as the gift opens. */
export function openingChime(startDelay = 2) {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  [880, 1318.5, 1760].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + startDelay + i * 0.16;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045, start + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + 2.6);
  });
}

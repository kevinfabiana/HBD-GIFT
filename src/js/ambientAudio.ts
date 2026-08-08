/**
 * A soft, generative ambient soundtrack for Side B.
 *
 * No audio files are needed — each track becomes a living, evolving pad
 * plus occasional warm bell notes drawn from a pentatonic scale. The mood
 * follows the emotional keywords of the project: warm, peaceful, dreamy.
 * Everything is very quiet and fades in / out slowly so it never startles.
 */
import { getAudioContext } from "./audio";

type VoiceConfig = {
  /** Chord tones (Hz) for the sustained pad. */
  chord: number[];
  /** Pentatonic scale degrees (Hz) for the wandering melody. */
  scale: number[];
  /** Lowpass cutoff for the pad, gently modulated by an LFO. */
  cutoff: number;
  /** Oscillator waveform for the pad. */
  wave: OscillatorType;
  /** Overall loudness (kept low). */
  volume: number;
  /** Average seconds between melody notes. */
  pace: number;
};

const midi = (n: number) => 440 * 2 ** ((n - 69) / 32);

/** The four soundtrack tracks, each with its own warm colour. */
const VOICES: VoiceConfig[] = [
  {
    // "Morning, unhurried" — bright major pentatonic, like early light.
    chord: [midi(60), midi(64), midi(67)],
    scale: [60, 62, 64, 67, 69, 72].map(midi),
    cutoff: 1100,
    wave: "sine",
    volume: 0.085,
    pace: 3.4,
  },
  {
    // "The long drive home" — golden, warmer, slightly lower.
    chord: [midi(57), midi(60), midi(64)],
    scale: [57, 60, 62, 64, 67, 69].map(midi),
    cutoff: 900,
    wave: "triangle",
    volume: 0.09,
    pace: 3.0,
  },
  {
    // "Somewhere quieter" — minor pentatonic, soft and introspective.
    chord: [midi(53), midi(56), midi(60)],
    scale: [53, 56, 58, 60, 63, 65].map(midi),
    cutoff: 760,
    wave: "sine",
    volume: 0.075,
    pace: 4.0,
  },
  {
    // "Still here" — gentle major pentatonic, a quiet promise.
    chord: [midi(62), midi(65), midi(69)],
    scale: [62, 65, 67, 69, 72, 74].map(midi),
    cutoff: 820,
    wave: "triangle",
    volume: 0.08,
    pace: 3.6,
  },
];

type ActiveVoice = {
  master: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  oscillators: OscillatorNode[];
  melodyTimer: number;
};

let active: ActiveVoice | null = null;

function clearActive() {
  if (!active) return;
  active.oscillators.forEach((o) => {
    try {
      o.stop();
    } catch {
      /* already stopped */
    }
    o.disconnect();
  });
  try {
    active.lfo.stop();
  } catch {
    /* already stopped */
  }
  active.lfo.disconnect();
  active.lfoGain.disconnect();
  active.master.disconnect();
  window.clearTimeout(active.melodyTimer);
  active = null;
}

/** Plays one soft bell note from the scale, with a touch of echo. */
function playNote(
  ac: AudioContext,
  freq: number,
  config: VoiceConfig,
  out: AudioNode,
) {
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = config.wave;
  osc.frequency.value = freq;
  osc.detune.value = (Math.random() * 8 - 4) | 0;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

  osc.connect(gain).connect(out);
  osc.start(now);
  osc.stop(now + 2.8);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

/** Schedules the next melody note and reschedules itself. */
function scheduleMelody(ac: AudioContext, config: VoiceConfig, out: AudioNode) {
  if (!active) return;
  // Pick a gentle, wandering note — avoid huge leaps.
  const note = config.scale[(Math.random() * config.scale.length) | 0];
  playNote(ac, note, config, out);
  const jitter = (Math.random() * 0.6 - 0.3) * config.pace;
  const next = Math.max(1.4, config.pace + jitter) * 1000;
  active.melodyTimer = window.setTimeout(
    () => scheduleMelody(ac, config, out),
    next,
  );
}

/** Begins the ambient soundtrack for a given track index. */
export function startAmbient(index: number) {
  const ac = getAudioContext();
  if (!ac) return;
  stopAmbient();

  const config = VOICES[index] ?? VOICES[0]!;

  const master = ac.createGain();
  master.gain.value = 0.0001;
  master.connect(ac.destination);

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = config.cutoff;
  filter.Q.value = 0.7;
  filter.connect(master);

  // A slow LFO breathes the cutoff so the pad never feels static.
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.frequency.value = 0.045;
  lfoGain.gain.value = config.cutoff * 0.22;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  // A little echo for the melody — gives the bells room to live in.
  const delay = ac.createDelay(1.0);
  delay.delayTime.value = 0.34;
  const feedback = ac.createGain();
  feedback.gain.value = 0.33;
  const wet = ac.createGain();
  wet.gain.value = 0.28;
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(filter);

  const oscillators: OscillatorNode[] = [];
  for (const freq of config.chord) {
    for (const detune of [-6, 6]) {
      const o = ac.createOscillator();
      o.type = config.wave;
      o.frequency.value = freq;
      o.detune.value = detune;
      const g = ac.createGain();
      g.gain.value = 0.42 / config.chord.length;
      o.connect(g).connect(filter);
      o.start();
      oscillators.push(o);
    }
  }

  // Soft fade-in.
  master.gain.setValueAtTime(0.0001, ac.currentTime);
  master.gain.exponentialRampToValueAtTime(config.volume, ac.currentTime + 3);

  active = { master, lfo, lfoGain, oscillators, melodyTimer: 0 };

  // Delay the first melody note so the pad settles first.
  active.melodyTimer = window.setTimeout(
    () => scheduleMelody(ac, config, delay),
    2400,
  );
}

/** Fades the soundtrack out gently, then tears it down. */
export function stopAmbient() {
  const ac = getAudioContext();
  const current = active;
  if (!ac || !current) {
    clearActive();
    return;
  }
  window.clearTimeout(current.melodyTimer);
  const now = ac.currentTime;
  current.master.gain.cancelScheduledValues(now);
  current.master.gain.setValueAtTime(current.master.gain.value, now);
  current.master.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
  window.setTimeout(clearActive, 1700);
}

/** Smoothly swaps to a different track without a hard cut. */
export function changeAmbient(index: number) {
  // A quick crossfade: fade out, then start the new voice.
  startAmbient(index);
}

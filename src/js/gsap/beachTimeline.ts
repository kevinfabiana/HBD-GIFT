/** Act III — the shore. Scroll position, not time, moves the sun. */
import { clamp01, windowAt } from "../utils";

/** Total scroll length of the beach scene. */
export const BEACH_LENGTH = "720vh";

/** Where each line of narration lives on the timeline. */
export type BeachLine = { at: number; to: number; text: string; position: string };

/** Celestial arc — the sun never travels in a straight line. */
export const sunPosition = (p: number) => ({
  x: 12 + p * 76,
  y: 48 - Math.sin(clamp01(p / 0.8) * Math.PI) * 36,
  sunOpacity: clamp01((0.86 - p) / 0.12),
  moonOpacity: clamp01((p - 0.78) / 0.12),
});

/** Which particle species is alive at this point of the day. */
export const particlePhase = (p: number) => ({
  dust: windowAt(p, -0.05, 0.34, 0.14),
  sparkle: windowAt(p, 0.42, 0.72, 0.12),
  fireflies: clamp01((p - 0.8) / 0.12),
});

/** Ambient life: birds, a butterfly, a boat, the last page. */
export const ambientPhase = (p: number) => ({
  boat: windowAt(p, 0.12, 0.72, 0.1),
  birds: windowAt(p, 0.6, 0.8, 0.06),
  butterfly: windowAt(p, 0.3, 0.56, 0.06),
  lastPage: clamp01((p - 0.9) / 0.07),
});

/** Clouds drift at their own speeds — never synchronised. */
export const CLOUD_LAYERS = [
  { y: 40, scale: 1.15, opacity: 0.9, speed: 220, x: 90 },
  { y: 120, scale: 0.8, opacity: 0.7, speed: 360, x: 660 },
  { y: 210, scale: 1.35, opacity: 0.5, speed: 140, x: 380 },
  { y: 76, scale: 0.62, opacity: 0.55, speed: 480, x: 980 },
] as const;

/** Wave layers, each with its own period and amplitude. */
export const WAVE_LAYERS = [0, 1, 2, 3].map((i) => ({
  top: 8 + i * 15,
  opacity: 0.22 + i * 0.08,
  duration: 26 + i * 9,
  delay: i * 2,
}));

/** The flowers on the dune — position, size, colour, sway. */
export const SHORE_FLOWERS = Array.from({ length: 13 }, (_, i) => ({
  x: [4, 12, 19, 27, 35, 44, 52, 61, 69, 76, 84, 91, 97][i],
  y: 4 + ((i * 17) % 13),
  scale: 0.5 + ((i * 7) % 9) * 0.075,
  rotation: ((i * 23) % 26) - 13,
  petals: 5 + (i % 3),
  hue: ["--blush", "--peach", "--lavender", "--rose-gold", "--coral"][i % 5],
  sway: 9 + (i % 5),
}));

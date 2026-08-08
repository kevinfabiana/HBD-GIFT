/** Particle field generators. Pure data — the renderers stay in components. */
import { densityFor } from "./utils";

export type Mote = {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  dx: string;
  opacity: number;
};

export type Star = { x: number; y: number; r: number; twinkle: number; delay: number };

const field = (count: number, make: (i: number) => Mote): Mote[] =>
  Array.from({ length: densityFor(count) }, (_, i) => make(i));

/** Slow golden dust — mornings and interiors. */
export const dustField = (count = 22) =>
  field(count, (i) => ({
    x: (i * 41) % 100,
    y: 100,
    size: 2 + ((i * 5) % 4),
    duration: 34 + ((i * 11) % 26),
    delay: (i * 3.1) % 34,
    dx: `${((i % 7) - 3) * 26}px`,
    opacity: 0.16 + (i % 5) * 0.06,
  }));

/** Blossom petals drifting upward across the whole journey. */
export const petalField = (count = 16) =>
  field(count, (i) => ({
    x: (i * 97) % 100,
    y: 100,
    size: 6 + ((i * 13) % 10),
    duration: 26 + ((i * 7) % 18),
    delay: (i * 2.3) % 26,
    dx: `${((i % 5) - 2) * 40}px`,
    opacity: 0.25 + (i % 4) * 0.12,
  }));

/** Points of light that twinkle in place rather than travel. */
export const sparkleField = (count = 14) =>
  field(count, (i) => ({
    x: 12 + ((i * 53) % 76),
    y: 14 + ((i * 37) % 66),
    size: 3 + ((i * 2) % 3),
    duration: 5 + ((i * 3) % 6),
    delay: (i * 1.7) % 9,
    dx: "0px",
    opacity: 1,
  }));

/** The shore's ambient motes: dust, then sparkles, then fireflies. */
export const shoreField = (count = 34) =>
  field(count, (i) => ({
    x: (i * 43.1) % 100,
    y: 30 + ((i * 29) % 66),
    size: 2 + ((i * 11) % 4),
    duration: 18 + ((i * 5) % 16),
    delay: (i * 1.7) % 20,
    dx: `${((i % 5) - 2) * 30}px`,
    opacity: 1,
  }));

export const starField = (count = 90): Star[] =>
  Array.from({ length: densityFor(count) }, (_, i) => ({
    x: (i * 61.7) % 100,
    y: ((i * 37.3) % 52) + 2,
    r: 0.6 + ((i * 13) % 5) * 0.28,
    twinkle: 2.6 + ((i * 7) % 9) * 0.7,
    delay: (i * 0.43) % 6,
  }));

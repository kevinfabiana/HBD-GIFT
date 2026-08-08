/** Small, dependency-free helpers shared by every story module. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Fade in, hold, fade out — the shape of every line of narration. */
export const windowAt = (p: number, from: number, to: number, feather = 0.05) =>
  clamp01((p - from) / feather) * clamp01((to - p) / feather);

/** Deterministic pseudo-random sequence so SSR and the client agree. */
export const seeded = (i: number, step: number, mod: number) => (i * step) % mod;

export const isBrowser = typeof window !== "undefined";

export const prefersReducedMotion = () =>
  isBrowser && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isFinePointer = () => isBrowser && window.matchMedia("(pointer: fine)").matches;

export const isMobileViewport = () => isBrowser && window.innerWidth < 768;

/** Collapse bursts of events into one frame of work. */
export function rafThrottle<T extends unknown[]>(fn: (...args: T) => void) {
  let frame = 0;
  const wrapped = (...args: T) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      fn(...args);
    });
  };
  wrapped.cancel = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  return wrapped;
}

/** Particle counts are halved on phones so the frame budget survives. */
export const densityFor = (count: number) => (isMobileViewport() ? Math.ceil(count / 2) : count);

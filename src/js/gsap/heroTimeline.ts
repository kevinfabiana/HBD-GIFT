/** Act I — the hero settles into place before anything is clicked. */
export const HERO_BEATS = {
  background: 0,
  particles: 0.5,
  gift: 1,
  ribbon: 1.5,
  ambientLight: 2.5,
  idle: 3.2,
} as const;

export type HeroBeat = keyof typeof HERO_BEATS;

/** Delay, in ms, before a hero element should appear. */
export const heroDelay = (beat: HeroBeat) => HERO_BEATS[beat] * 1000;

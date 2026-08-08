/**
 * Act I (b) — opening the gift.
 *
 * A single 7.5s score, expressed as named beats so the component never
 * hard-codes a magic number.
 */
export const GIFT_BEATS = {
  anticipation: 0.15,
  ribbonReacts: 0.35,
  dust: 0.8,
  ribbonFalls: 1.5,
  glow: 2.0,
  petals: 2.6,
  lid: 3.2,
  copyOut: 4.0,
  bloom: 4.8,
  cameraIn: 5.5,
  cameraThrough: 6.5,
  handover: 7.5,
} as const;

export type GiftBeat = keyof typeof GIFT_BEATS;

/** Every mark the opening sequence needs to schedule, in order. */
export const GIFT_MARKS: number[] = [
  GIFT_BEATS.ribbonReacts,
  GIFT_BEATS.dust,
  GIFT_BEATS.ribbonFalls,
  GIFT_BEATS.glow,
  GIFT_BEATS.petals,
  GIFT_BEATS.lid,
  GIFT_BEATS.copyOut,
  GIFT_BEATS.bloom,
];

/** Normalised 0..1 strength of the golden light leaking out of the box. */
export const glowAt = (t: number) =>
  t < GIFT_BEATS.glow ? 0 : Math.min(1, (t - GIFT_BEATS.glow) / 2.4);

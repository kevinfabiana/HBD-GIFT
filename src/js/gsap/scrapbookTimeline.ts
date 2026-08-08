/** Act II — each photograph drops, tapes itself down and signs its caption. */
export const PHOTO_DROP = {
  /** Stagger between photographs, in ms. */
  stagger: 420,
  /** The drop animation itself. */
  duration: 1200,
  /** Sound cues, relative to the start of the drop. */
  tapeAt: 700,
  captionAt: 1050,
} as const;

export const photoDelay = (index: number) => index * PHOTO_DROP.stagger;

/** Heading particles gather, then the words resolve. */
export const HEADING_BEATS = [200, 1400, 2200] as const;

/** The world draws itself: clouds, particles, flowers, photo, words. */
export const WORLD_BUILD_BEATS = [400, 1500, 2600, 3700, 4900] as const;

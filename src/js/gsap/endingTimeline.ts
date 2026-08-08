/** The hand-off between acts: photographs → petals → clouds → the shore. */
import { clamp01 } from "../utils";

export const FINALE_LENGTH = "230vh";

export const finalePhase = (p: number) => ({
  /** Photographs lift and lose their edges. */
  petalize: clamp01((p - 0.08) / 0.26),
  /** The wind takes them sideways. */
  wind: clamp01((p - 0.22) / 0.4),
  /** Petals soften into cloud shapes. */
  cloud: clamp01((p - 0.48) / 0.3),
  /** The next heading is already there. */
  wishes: clamp01((p - 0.55) / 0.3),
});

import { useEffect, useState } from "react";

import { preloadImages } from "@/js/loader";
import { prefersReducedMotion } from "@/js/utils";

import gift from "@/assets/illustrations/gift-premium.png";
import letter from "@/assets/illustrations/letter.jpg";
import photo1 from "@/assets/images/photo-1.jpg";
import photo2 from "@/assets/images/photo-2.jpg";
import cover1 from "@/assets/images/cover-1.jpg";

/** Only the assets the first two scenes actually need. */
const FIRST_PAINT = [gift, letter, photo1, photo2, cover1];

/** Minimum time on screen, so the curtain never flickers. */
const MIN_MS = 900;

/**
 * The first beat of the story: a held breath.
 *
 * It preloads the opening assets, then lifts like a curtain — no spinner,
 * no percentage, just a line drawing itself and a single quiet sentence.
 */
export function StoryLoader({ onDone }: { onDone?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let done = 0;
    let cancelled = false;

    // Progress advances per decoded image so the line reflects real work.
    FIRST_PAINT.forEach((src) => {
      void preloadImages([src]).then(() => {
        if (cancelled) return;
        done += 1;
        setProgress(done / FIRST_PAINT.length);
      });
    });

    void preloadImages(FIRST_PAINT).then(() => {
      if (cancelled) return;
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      window.setTimeout(() => {
        if (cancelled) return;
        setProgress(1);
        setLeaving(true);
        window.setTimeout(
          () => {
            if (cancelled) return;
            setGone(true);
            onDone?.();
          },
          prefersReducedMotion() ? 0 : 900,
        );
      }, wait);
    });

    return () => {
      cancelled = true;
    };
  }, [onDone]);

  useEffect(() => {
    if (gone) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div
      className="story-loader"
      data-leaving={leaving ? "true" : undefined}
      role="status"
      aria-live="polite"
      aria-label="Preparing the story"
    >
      <div className="story-loader__inner">
        <p className="story-loader__eyebrow">A letter is being written</p>
        <p className="story-loader__line">
          Give it a moment,
          <span className="story-loader__accent"> it is worth reading slowly.</span>
        </p>
        <span aria-hidden className="story-loader__rule">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
      </div>
    </div>
  );
}

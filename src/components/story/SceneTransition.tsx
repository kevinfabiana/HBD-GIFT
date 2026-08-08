/**
 * Scene hand-off. Two acts never cut.
 *
 * A masked veil wipes across the seam while a soft light bloom swells and
 * fades at the midpoint — the transition reads as light changing, not as a
 * slide or a fade to black.
 */
import { useEffect, useRef } from "react";

import { gsap, initGsap } from "@/js/gsap/masterTimeline";
import { prefersReducedMotion } from "@/js/utils";

export function SceneTransition({
  from = "var(--cream)",
  to = "var(--blush)",
  bloom = "var(--rose-gold)",
}: {
  from?: string;
  to?: string;
  bloom?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLSpanElement>(null);
  const light = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    const mask = veil.current;
    const glow = light.current;
    if (!node || !mask || !glow || prefersReducedMotion()) return;
    initGsap();

    const trigger = { trigger: node, start: "top bottom", end: "bottom top", scrub: 0.8 };

    const wipe = gsap.fromTo(
      mask,
      { scaleY: 0.25, yPercent: -30, opacity: 0.25 },
      { scaleY: 1.15, yPercent: 12, opacity: 1, ease: "none", scrollTrigger: trigger },
    );

    // The bloom peaks exactly on the seam, then gives the light back.
    const flare = gsap.timeline({ scrollTrigger: trigger });
    flare
      .fromTo(glow, { opacity: 0, scale: 0.7 }, { opacity: 0.55, scale: 1.15, ease: "sine.inOut" })
      .to(glow, { opacity: 0, scale: 1.4, ease: "sine.inOut" });

    return () => {
      wipe.scrollTrigger?.kill();
      wipe.kill();
      flare.scrollTrigger?.kill();
      flare.kill();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="scene-seam">
      <span
        ref={veil}
        className="scene-seam-veil"
        style={{ background: `linear-gradient(180deg, ${from}, ${to})` }}
      />
      <span
        ref={light}
        className="scene-seam-bloom"
        style={{
          background: `radial-gradient(closest-side, color-mix(in oklab, ${bloom} 55%, transparent), transparent)`,
        }}
      />
    </div>
  );
}

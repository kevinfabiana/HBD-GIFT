import { useEffect, useRef } from "react";

import { gsap, initGsap } from "@/js/gsap/masterTimeline";
import { prefersReducedMotion } from "@/js/utils";

/**
 * Hero reveal — the last act of the opening.
 *
 * The hero is not faded in as one block: each marked layer arrives in turn
 * (background → particles → constellation → title → subtitle → scroll cue)
 * while the whole frame settles from 1.08 to 1.00 over 2.5s.
 *
 * Mark layers with `data-reveal="1".."6"`; a warm cream veil (rendered by
 * <HeroVeil />) carries the light over from the gift transition.
 */
export function useHeroReveal<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  const played = useRef(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")).sort(
      (a, b) => Number(a.dataset["reveal"]) - Number(b.dataset["reveal"]),
    );
    const veil = root.querySelector<HTMLElement>("[data-hero-veil]");

    if (!active) {
      played.current = false;
      gsap.set(layers, { autoAlpha: 0, y: (_i, el) => (el.dataset["revealLift"] ? 22 : 0) });
      if (veil) gsap.set(veil, { autoAlpha: 1 });
      gsap.set(root, { scale: 1.08 });
      return;
    }

    if (played.current) return;
    played.current = true;

    initGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Cinematic settle.
      tl.fromTo(root, { scale: 1.08 }, { scale: 1, duration: 2.5, ease: "power2.out" }, 0);
      if (veil) tl.to(veil, { autoAlpha: 0, duration: 1.2, ease: "sine.out" }, 0);

      layers.forEach((el, i) => {
        tl.to(
          el,
          {
            autoAlpha: 1,
            y: 0,
            duration: el.dataset["revealLift"] ? 1 : 1.4,
          },
          0.2 + i * 0.3,
        );
      });

      if (prefersReducedMotion()) tl.timeScale(6);
    }, root);

    return () => ctx.revert();
  }, [active]);

  return ref;
}

/** The warm cream light carried over from the gift, sitting above the hero. */
export function HeroVeil() {
  return (
    <div
      aria-hidden
      data-hero-veil
      className="pointer-events-none absolute inset-0"
      style={{
        zIndex: 40,
        background:
          "radial-gradient(70% 60% at 50% 46%, color-mix(in oklab, var(--ivory) 96%, white), color-mix(in oklab, var(--cream) 92%, white) 55%, color-mix(in oklab, var(--peach) 40%, white) 100%)",
      }}
    />
  );
}

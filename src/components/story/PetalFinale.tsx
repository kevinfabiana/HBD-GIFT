import { useEffect, useRef, useState } from "react";

import { story } from "@/data/story";

/**
 * No cut, no fade: the photographs lift, become petals, the wind takes them,
 * the petals soften into clouds, and the clouds are already the next scene.
 */
export function PetalFinale() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const node = ref.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      setP(progress);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const petalize = Math.min(1, Math.max(0, (p - 0.08) / 0.26));
  const wind = Math.min(1, Math.max(0, (p - 0.22) / 0.4));
  const cloud = Math.min(1, Math.max(0, (p - 0.48) / 0.3));
  const wishes = Math.min(1, Math.max(0, (p - 0.55) / 0.3));

  return (
    <section
      ref={ref}
      className="paper-grain relative isolate h-[230vh] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--sand), var(--blush) 60%, var(--soft-blue))",
      }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        {/* petals in the wind */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: 58 }).map((_, i) => {
            const seedX = (i * 47) % 100;
            const seedY = (i * 29) % 100;
            return (
              <span
                key={i}
                className="absolute block"
                style={{
                  left: `${seedX}%`,
                  top: `${seedY}%`,
                  width: 16 + (i % 4) * 8,
                  height: (10 + (i % 4) * 4) * (cloud > 0.4 ? 0.9 : 0.7),
                  borderRadius: cloud > 0.4 ? "50%" : "62% 38% 55% 45% / 55% 62% 38% 45%",
                  background:
                    cloud > 0.4
                      ? "color-mix(in oklab, white 96%, var(--soft-blue))"
                      : `color-mix(in oklab, var(--${i % 2 ? "coral" : "rose-gold"}) 62%, white)`,
                  filter: `blur(${cloud * 5}px)`,
                  opacity: petalize * (1 - wishes * 0.35) * 0.95,
                  transform: `translate(${(seedX - 50) * wind * 0.9 + wind * 90}px, ${-wind * 260}px) rotate(${wind * 320 + i * 9}deg) scale(${1 + cloud * 1.4})`,
                  transition:
                    "border-radius 900ms var(--ease-story), background 900ms var(--ease-story)",
                }}
              />
            );
          })}
        </div>

        {/* the next chapter, already here */}
        <div
          className="relative z-10 mx-auto max-w-2xl text-center"
          style={{
            opacity: wishes,
            transform: `translateY(${(1 - wishes) * 40}px) scale(${0.97 + wishes * 0.03})`,
          }}
        >
          <p className="text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground">
            {story.finale.eyebrow}
          </p>
          <h2 className="mt-6 text-[clamp(2.2rem,5.6vw,3.8rem)] leading-[1.06]">
            {story.finale.title}
            <span className="block italic" style={{ color: "var(--dusty-purple)" }}>
              {story.finale.accent}
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}

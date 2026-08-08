import { useEffect, useRef, useState } from "react";

/**
 * The previous scene doesn't fade — it scatters. Particles fly up,
 * gather, and settle into the next heading.
 */
export function ParticleHeading({
  eyebrow,
  title,
  accent,
}: {
  eyebrow: string;
  title: string;
  accent: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        [200, 1400, 2200].forEach((ms, i) => window.setTimeout(() => setStage(i + 1), ms));
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 26 }).map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full"
            style={{
              left: `${(i * 41) % 96}%`,
              bottom: 0,
              width: 4 + (i % 3) * 2,
              height: 4 + (i % 3) * 2,
              background: `color-mix(in oklab, var(--${i % 3 === 0 ? "rose-gold" : i % 3 === 1 ? "lavender" : "soft-gold"}) 82%, white)`,
              opacity: stage >= 1 && stage < 3 ? 0.75 : 0,
              transform:
                stage >= 1
                  ? `translate(${((i % 7) - 3) * 26}px, ${-120 - (i % 5) * 40}px)`
                  : "none",
              transition: "transform 2200ms var(--ease-story), opacity 1400ms var(--ease-story)",
              transitionDelay: `${(i % 9) * 70}ms`,
            }}
          />
        ))}
      </div>

      <div
        className="relative z-10 max-w-2xl"
        style={{
          opacity: stage >= 2 ? 1 : 0,
          filter: stage >= 3 ? "blur(0px)" : "blur(9px)",
          transform: stage >= 2 ? "translateY(0)" : "translateY(22px)",
          transition:
            "opacity 1400ms var(--ease-story), transform 1600ms var(--ease-story), filter 1600ms var(--ease-story)",
        }}
      >
        <p className="text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-6 text-[clamp(2.1rem,5.2vw,3.5rem)] leading-[1.06]">
          {title}
          <span className="mt-2 block italic" style={{ color: "var(--dusty-purple)" }}>
            {accent}
          </span>
        </h2>
      </div>
    </div>
  );
}

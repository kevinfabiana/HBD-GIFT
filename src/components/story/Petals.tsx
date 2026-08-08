import { useMemo } from "react";

/**
 * Petals drift upward across the whole journey, carrying continuity
 * from one scene to the next.
 */
export function Petals({ count = 16, tone = "blush" }: { count?: number; tone?: string }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 97) % 100,
        size: 6 + ((i * 13) % 10),
        delay: (i * 2.3) % 26,
        duration: 26 + ((i * 7) % 18),
        dx: `${((i % 5) - 2) * 40}px`,
        opacity: 0.25 + (i % 4) * 0.12,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-[-10vh] block"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.72,
              opacity: p.opacity,
              borderRadius: "60% 40% 55% 45% / 55% 60% 40% 45%",
              background: `color-mix(in oklab, var(--${tone}) 82%, white)`,
              animation: `drift-up ${p.duration}s linear ${p.delay}s infinite`,
              "--dx": p.dx,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

import { story } from "@/data/story";
import photo1 from "@/assets/images/photo-1.jpg";

/**
 * The world does not exist yet. It is drawn, one layer at a time:
 * clouds -> particles -> flowers -> the first polaroid -> the heading.
 */
export function WorldBuild({ active }: { active: boolean }) {
  const [stage, setStage] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!active) return;
    const steps = [400, 1500, 2600, 3700, 4900];
    timers.current = steps.map((ms, i) => window.setTimeout(() => setStage(i + 1), ms));
    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  const on = (n: number) => (stage >= n ? 1 : 0);

  return (
    <section
      className="paper-grain relative flex min-h-[110vh] items-center overflow-hidden px-6 py-32"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--cream) 88%, var(--peach)), var(--sand))",
      }}
    >
      {/* clouds */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{ opacity: on(1), transition: "opacity 2200ms var(--ease-story)" }}
      >
        {[
          { t: "6%", l: "4%", w: 420, o: 0.5, d: 90 },
          { t: "18%", l: "48%", w: 560, o: 0.38, d: 120 },
          { t: "34%", l: "22%", w: 320, o: 0.3, d: 105 },
        ].map((c, i) => (
          <span
            key={i}
            className="absolute block"
            style={{
              top: c.t,
              left: c.l,
              width: c.w,
              height: c.w * 0.32,
              opacity: c.o,
              borderRadius: "50%",
              filter: "blur(28px)",
              background:
                "radial-gradient(circle at 40% 50%, color-mix(in oklab, white 92%, var(--blush)), transparent 70%)",
              animation: `cloud-drift-x ${c.d}s var(--ease-story) infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: on(2), transition: "opacity 1800ms var(--ease-story)" }}
      >
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full"
            style={{
              left: `${(i * 37) % 100}%`,
              bottom: "-8vh",
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              background: "color-mix(in oklab, var(--soft-gold) 80%, white)",
              opacity: 0.5,
              animation: `drift-up ${22 + (i % 9) * 3}s linear ${(i * 1.6) % 18}s infinite`,
              ["--dx" as string]: `${((i % 5) - 2) * 34}px`,
            }}
          />
        ))}
      </div>

      {/* flowers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
        style={{ opacity: on(3), transition: "opacity 2000ms var(--ease-story)" }}
      >
        {[8, 27, 52, 74, 91].map((l, i) => (
          <span
            key={l}
            className="float-slow absolute block"
            style={{
              left: `${l}%`,
              bottom: `${6 + (i % 3) * 14}%`,
              width: 16 + (i % 3) * 6,
              height: 16 + (i % 3) * 6,
              borderRadius: "62% 38% 55% 45% / 55% 62% 38% 45%",
              background: `color-mix(in oklab, var(--${i % 2 ? "blush" : "lavender"}) 84%, white)`,
              opacity: 0.65,
              animationDelay: `${i * 1.4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-14 md:grid-cols-[1fr_0.85fr]">
        <div
          style={{
            opacity: on(5),
            transform: stage >= 5 ? "translateY(0)" : "translateY(26px)",
            transition: "opacity 1600ms var(--ease-story), transform 1600ms var(--ease-story)",
          }}
        >
          <p className="text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground">
            {story.world.eyebrow}
          </p>
          <h2 className="mt-6 text-[clamp(2.2rem,5.4vw,3.6rem)] leading-[1.05]">
            {story.world.title}
            <span className="mt-2 block italic" style={{ color: "var(--dusty-purple)" }}>
              {story.world.accent}
            </span>
          </h2>
          <p className="hand mt-8 max-w-sm text-2xl" style={{ color: "var(--rose-gold)" }}>
            {story.world.hand}
          </p>
        </div>

        <div
          className="relative mx-auto w-[min(74vw,320px)]"
          style={{
            opacity: on(4),
            transform:
              stage >= 4 ? "rotate(-2.4deg) translateY(0)" : "rotate(-9deg) translateY(-40px)",
            transition: "opacity 1400ms var(--ease-story), transform 1400ms var(--ease-story)",
          }}
        >
          <div className="polaroid">
            <img
              src={photo1}
              alt="Two friends sitting under a blossom tree"
              width={768}
              height={768}
              loading="lazy"
              className="block w-full rounded-[4px] object-cover"
            />
            <p className="hand py-4 text-center text-xl" style={{ color: "var(--foreground)" }}>
              {story.world.openingPhotoCaption}
            </p>
          </div>
          <span
            className="tape"
            style={{
              top: -12,
              width: 118,
              ["--trot" as string]: "-7deg",
              transform: "translate(-50%, 0) rotate(-7deg)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

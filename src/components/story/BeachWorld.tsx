import { useEffect, useMemo, useRef, useState } from "react";

import { story } from "@/data/story";
import { beachLines } from "@/data/storyLines";
import { skyAt } from "@/js/beachPalette";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** fade in, hold, fade out — used for story lines and ambient details */
const win = (p: number, a: number, b: number, f = 0.05) => clamp((p - a) / f) * clamp((b - p) / f);

export function BeachWorld() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const node = ref.current;
        if (!node) return;
        const r = node.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        setP(total > 0 ? clamp(-r.top / total) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const s = skyAt(p);

  // celestial arc: sun rises, crosses, sets; moon takes over
  const sunX = 12 + p * 76;
  const sunY = 48 - Math.sin(clamp(p / 0.8) * Math.PI) * 36;
  const sunOpacity = clamp((0.86 - p) / 0.12);
  const moonOpacity = clamp((p - 0.78) / 0.12);
  const dust = win(p, -0.05, 0.34, 0.14);
  const sparkle = win(p, 0.42, 0.72, 0.12);
  const fireflies = clamp((p - 0.8) / 0.12);

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        x: (i * 61.7) % 100,
        y: ((i * 37.3) % 52) + 2,
        r: 0.6 + ((i * 13) % 5) * 0.28,
        tw: 2.6 + ((i * 7) % 9) * 0.7,
        d: (i * 0.43) % 6,
      })),
    [],
  );
  const motes = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        x: (i * 43.1) % 100,
        y: 30 + ((i * 29) % 66),
        size: 2 + ((i * 11) % 4),
        dur: 18 + ((i * 5) % 16),
        delay: (i * 1.7) % 20,
        dx: `${((i % 5) - 2) * 30}px`,
      })),
    [],
  );
  const flowers = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => ({
        x: [4, 12, 19, 27, 35, 44, 52, 61, 69, 76, 84, 91, 97][i],
        y: 4 + ((i * 17) % 13),
        scale: 0.5 + ((i * 7) % 9) * 0.075,
        rot: ((i * 23) % 26) - 13,
        petals: 5 + (i % 3),
        hue: ["--blush", "--peach", "--lavender", "--rose-gold", "--coral"][i % 5],
        sway: 5 + (i % 5),
      })),
    [],
  );

  return (
    <section ref={ref} className="relative h-[720vh]" aria-label="A day passing by the sea">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ── sky ── */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${s.skyTop} 0%, ${s.skyMid} 46%, ${s.skyLow} 72%)`,
          }}
        />
        {/* atmospheric light bloom around the sun */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(42vw 34vh at ${sunX}% ${sunY}%, color-mix(in oklab, ${s.glow} 55%, transparent), transparent 72%)`,
            opacity: 0.6,
            mixBlendMode: "screen",
          }}
        />

        {/* ── stars ── */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          style={{ opacity: s.star }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {stars.map((st, i) => (
            <circle
              key={i}
              cx={st.x}
              cy={st.y}
              r={st.r * 0.12}
              fill={s.light}
              style={{ animation: `star-tw ${st.tw}s ease-in-out ${st.d}s infinite` }}
            />
          ))}
        </svg>

        {/* ── sun / moon ── */}
        <div
          aria-hidden
          className="absolute"
          style={{
            left: `${sunX}%`,
            top: `${sunY}%`,
            transform: "translate(-50%,-50%)",
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: "clamp(70px, 9vw, 132px)",
              aspectRatio: "1",
              background: `radial-gradient(circle at 40% 38%, color-mix(in oklab, white 70%, ${s.glow}), ${s.glow})`,
              boxShadow: `0 0 90px 30px color-mix(in oklab, ${s.glow} 45%, transparent)`,
              opacity: sunOpacity,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 36% 34%, #fbf7ff, #ded4f5)`,
              boxShadow: "0 0 70px 22px rgba(220,210,247,0.35)",
              opacity: moonOpacity,
              maskImage: "radial-gradient(circle at 78% 30%, transparent 42%, black 44%)",
              WebkitMaskImage: "radial-gradient(circle at 78% 30%, transparent 42%, black 44%)",
            }}
          />
        </div>

        {/* ── clouds: paper-cut layers ── */}
        <svg
          aria-hidden
          className="absolute inset-x-0 top-0 h-[62vh] w-full"
          viewBox="0 0 1200 420"
          preserveAspectRatio="xMidYMid slice"
        >
          {[
            { y: 40, sc: 1.15, o: 0.9, speed: 220, x: 90 },
            { y: 120, sc: 0.8, o: 0.7, speed: 360, x: 660 },
            { y: 210, sc: 1.35, o: 0.5, speed: 140, x: 380 },
            { y: 76, sc: 0.62, o: 0.55, speed: 480, x: 980 },
          ].map((c, i) => (
            <g
              key={i}
              transform={`translate(${c.x - p * c.speed} ${c.y}) scale(${c.sc})`}
              opacity={c.o * (1 - s.star * 0.78)}
            >
              <path
                d="M0 60 C 6 30 34 14 62 22 C 78 -2 118 -6 138 16 C 168 8 196 26 196 48 C 214 52 222 62 214 72 L 8 72 C -2 70 -4 66 0 60 Z"
                fill={s.foam}
                opacity="0.95"
              />
              <path
                d="M14 66 C 40 46 70 44 96 58 C 124 44 158 48 178 66 Z"
                fill={s.light}
                opacity="0.5"
              />
              <path d="M8 72 L214 72 C 200 82 24 82 8 72 Z" fill={s.nearMtn} opacity="0.18" />
            </g>
          ))}
        </svg>

        {/* ── mountains: far / mid / near ── */}
        <svg
          aria-hidden
          className="absolute inset-x-0 w-full"
          style={{ bottom: "42%", height: "34vh", transform: `translateY(${p * 14}px)` }}
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
        >
          <path
            d="M0 300 L0 176 C 90 150 150 96 236 106 C 320 116 372 62 452 74 C 540 88 594 132 686 118 C 790 102 852 60 940 78 C 1040 98 1120 148 1200 158 L1200 300 Z"
            fill={s.farMtn}
            opacity="0.7"
          />
          <path
            d="M0 300 L0 210 C 120 196 196 138 300 152 C 402 166 452 122 552 140 C 660 160 726 200 830 186 C 940 172 1052 142 1200 190 L1200 300 Z"
            fill={s.midMtn}
            opacity="0.85"
          />
          <path
            d="M0 300 L0 250 C 140 240 250 200 366 216 C 478 232 560 206 668 224 C 790 244 900 232 1200 246 L1200 300 Z"
            fill={s.nearMtn}
          />
        </svg>

        {/* ── ocean ── */}
        <div className="absolute inset-x-0" style={{ bottom: 0, height: "45%" }}>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${s.oceanFar}, ${s.oceanNear} 62%, ${s.oceanNear})`,
            }}
          />
          {/* horizon haze so the waterline never reads as a hard edge */}
          <div
            className="absolute inset-x-0 top-0 h-[9%]"
            style={{
              background: `linear-gradient(180deg, color-mix(in oklab, ${s.skyLow} 85%, transparent), transparent)`,
            }}
          />
          {/* sun path on the water */}
          <div
            className="absolute inset-x-0 top-0 h-full"
            style={{
              background: `radial-gradient(26vw 40vh at ${sunX}% -6%, color-mix(in oklab, ${s.glow} 70%, transparent), transparent 72%)`,
              opacity: 0.7,
              mixBlendMode: "screen",
            }}
          />
          {[0, 1, 2, 3].map((i) => (
            <svg
              key={i}
              aria-hidden
              className="absolute inset-x-[-10%] w-[120%]"
              style={{
                top: `${8 + i * 15}%`,
                height: "18%",
                opacity: 0.22 + i * 0.08,
                animation: `swell ${26 + i * 9}s ease-in-out ${i * 2}s infinite alternate`,
              }}
              viewBox="0 0 1200 80"
              preserveAspectRatio="none"
            >
              <path
                d="M0 46 C 120 20 220 66 340 44 C 470 20 560 62 700 46 C 840 30 940 66 1060 46 C 1130 34 1170 40 1200 44 L1200 80 L0 80 Z"
                fill={s.foam}
                opacity="0.32"
              />
            </svg>
          ))}
          {/* sparkles */}
          <div className="absolute inset-0" style={{ opacity: 0.35 + sparkle * 0.5 }}>
            {Array.from({ length: 26 }).map((_, i) => (
              <span
                key={i}
                className="absolute block rounded-full"
                style={{
                  left: `${(i * 39.7) % 100}%`,
                  top: `${6 + ((i * 23) % 46)}%`,
                  width: 2 + (i % 3),
                  height: 2 + (i % 3),
                  background: s.foam,
                  animation: `star-tw ${2 + (i % 5) * 0.6}s ease-in-out ${(i * 0.3) % 4}s infinite`,
                }}
              />
            ))}
          </div>

          {/* paper boat, drifting the whole day */}
          <svg
            aria-hidden
            className="absolute"
            style={{
              left: `${10 + p * 62}%`,
              top: "26%",
              width: "clamp(38px,4vw,62px)",
              opacity: win(p, 0.12, 0.72, 0.1),
              animation: "boat-bob 9s ease-in-out infinite",
            }}
            viewBox="0 0 60 40"
          >
            <path d="M2 22 L58 22 L46 36 L14 36 Z" fill={s.foam} />
            <path d="M30 22 L30 4 L52 22 Z" fill={s.shore} opacity="0.9" />
            <path d="M28 22 L28 6 L8 22 Z" fill={s.light} opacity="0.85" />
          </svg>
        </div>

        {/* ── shore ── */}
        <svg
          aria-hidden
          className="absolute inset-x-0 bottom-0 w-full"
          style={{ height: "34vh" }}
          viewBox="0 0 1200 340"
          preserveAspectRatio="none"
        >
          <path
            d="M0 340 L0 118 C 160 86 300 132 460 108 C 640 82 760 128 920 106 C 1050 88 1140 104 1200 96 L1200 340 Z"
            fill={s.foam}
            opacity="0.55"
          />
          <path
            d="M0 340 L0 152 C 180 128 320 172 500 148 C 690 122 820 166 1000 146 C 1090 136 1150 144 1200 138 L1200 340 Z"
            fill={s.shore}
          />
          <path
            d="M0 340 L0 226 C 220 204 380 244 600 226 C 820 208 980 240 1200 220 L1200 340 Z"
            fill={s.land}
          />
        </svg>

        {/* shells, pebbles, footprints */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[24vh]">
          {[
            [16, 44],
            [23, 38],
            [31, 47],
            [39, 41],
            [47, 35],
            [55, 30],
          ].map(([x, y], i) => (
            <span
              key={i}
              className="absolute block"
              style={{
                left: `${x}%`,
                bottom: `${y}%`,
                width: 13,
                height: 8,
                borderRadius: "50%",
                background: `color-mix(in oklab, ${s.land} 70%, black)`,
                opacity: 0.16,
                transform: `rotate(${i % 2 ? 12 : -8}deg)`,
              }}
            />
          ))}
          {[
            [70, 30, 9],
            [78, 20, 12],
            [64, 16, 7],
            [86, 34, 10],
          ].map(([x, y, w], i) => (
            <span
              key={`p${i}`}
              className="absolute block rounded-full"
              style={{
                left: `${x}%`,
                bottom: `${y}%`,
                width: w,
                height: w * 0.7,
                background: `color-mix(in oklab, ${s.shore} 60%, ${s.ink})`,
                opacity: 0.2,
              }}
            />
          ))}
        </div>

        {/* ── flowers (foreground, bloom with the light) ── */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[26vh]">
          {flowers.map((f, i) => {
            const open = 0.42 + s.bloom * 0.58;
            return (
              <div
                key={i}
                className="absolute origin-bottom"
                style={{
                  left: `${f.x}%`,
                  bottom: `${f.y}%`,
                  transform: `rotate(${f.rot}deg) scale(${f.scale})`,
                }}
              >
                <div
                  className="origin-bottom"
                  style={{
                    animation: `flower-sway ${f.sway + 4}s ease-in-out ${i * 0.6}s infinite alternate`,
                  }}
                >
                  <span
                    className="block w-[3px] origin-bottom rounded-full"
                    style={{
                      height: 66 + (i % 4) * 18,
                      background: `color-mix(in oklab, var(--dusty-purple) 24%, ${s.land})`,
                      opacity: 0.9,
                    }}
                  />
                  <span
                    className="absolute block"
                    style={{
                      left: 2,
                      bottom: `${26 + (i % 3) * 12}%`,
                      width: 24,
                      height: 12,
                      borderRadius: "0 100% 0 100%",
                      background: `color-mix(in oklab, var(--dusty-purple) 28%, ${s.land})`,
                      transform: `rotate(${i % 2 ? -22 : 18}deg) scaleX(${i % 2 ? 1 : -1})`,
                      opacity: 0.75,
                    }}
                  />
                  <span
                    className="absolute left-1/2 block"
                    style={{
                      top: -24,
                      width: 40,
                      height: 40,
                      transform: `translate(-50%,0) scale(${open})`,
                      transition: "transform 700ms var(--ease-story)",
                    }}
                  >
                    {Array.from({ length: f.petals }).map((_, k) => (
                      <span
                        key={k}
                        className="absolute left-1/2 top-1/2 block"
                        style={{
                          width: 18,
                          height: 25,
                          borderRadius: "60% 40% 55% 45% / 62% 58% 42% 38%",
                          background: `color-mix(in oklab, var(${f.hue}) 82%, ${s.light})`,
                          transform: `translate(-50%,-50%) rotate(${(360 / f.petals) * k + (i % 5) * 4}deg) translateY(-12px)`,
                          opacity: 0.94,
                          boxShadow: `0 6px 12px -8px color-mix(in oklab, ${s.ink} 40%, transparent)`,
                        }}
                      />
                    ))}
                    <span
                      className="absolute left-1/2 top-1/2 block h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        background: `color-mix(in oklab, var(--soft-gold) 80%, ${s.light})`,
                      }}
                    />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── foreground leaves framing the composition ── */}
        <svg
          aria-hidden
          className="absolute bottom-[-4vh] left-[-4vw] h-[38vh]"
          viewBox="0 0 300 300"
          style={{ opacity: 0.9 }}
        >
          <g fill={`color-mix(in oklab, ${s.land} 58%, var(--indigo))`} opacity="0.45">
            <path d="M20 300 C 40 210 90 160 150 130 C 110 190 96 240 92 300 Z" />
            <path d="M-10 300 C 10 240 30 196 74 158 C 46 214 34 258 34 300 Z" />
            <path d="M70 300 C 96 236 140 200 196 182 C 150 222 124 258 116 300 Z" />
          </g>
        </svg>
        <svg
          aria-hidden
          className="absolute bottom-[-6vh] right-[-4vw] h-[34vh]"
          viewBox="0 0 300 300"
          style={{ opacity: 0.85 }}
        >
          <g fill={`color-mix(in oklab, ${s.land} 52%, var(--indigo))`} opacity="0.4">
            <path d="M280 300 C 260 214 210 168 150 140 C 190 198 204 244 208 300 Z" />
            <path d="M310 300 C 292 246 268 200 226 166 C 254 220 266 260 266 300 Z" />
          </g>
        </svg>

        {/* ── particles: dust → sparkles → fireflies ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {motes.map((m, i) => {
            const isFly = i % 3 === 0;
            const opacity = dust * 0.5 + sparkle * 0.6 + (isFly ? fireflies * 0.95 : 0);
            return (
              <span
                key={i}
                className="absolute block rounded-full"
                style={{
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  width: m.size + fireflies * 1.5,
                  height: m.size + fireflies * 1.5,
                  opacity,
                  background: fireflies > 0.3 && isFly ? "#f7e6a8" : s.light,
                  boxShadow:
                    fireflies > 0.3 && isFly ? "0 0 12px 3px rgba(247,230,168,0.65)" : "none",
                  animation: `drift-up ${m.dur}s linear ${m.delay}s infinite${
                    isFly ? `, star-tw ${2 + (i % 4)}s ease-in-out infinite` : ""
                  }`,
                  ["--dx" as string]: m.dx,
                }}
              />
            );
          })}
        </div>

        {/* ── ambient: birds, butterfly, feather ── */}
        <svg
          aria-hidden
          className="absolute"
          style={{
            left: `${72 - p * 46}%`,
            top: `${16 + Math.sin(p * 7) * 4}%`,
            width: 110,
            opacity: win(p, 0.6, 0.8, 0.06),
          }}
          viewBox="0 0 120 40"
          fill="none"
          stroke={s.ink}
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M6 18 C 12 10 18 10 24 18" opacity="0.7" />
          <path d="M40 26 C 47 17 54 17 61 26" opacity="0.55" />
          <path d="M76 12 C 82 5 88 5 94 12" opacity="0.45" />
        </svg>
        <span
          aria-hidden
          className="absolute block"
          style={{
            left: `${24 + p * 12}%`,
            top: `${52 - p * 8}%`,
            width: 14,
            height: 11,
            opacity: win(p, 0.3, 0.56, 0.06),
            background: "color-mix(in oklab, var(--lavender) 80%, white)",
            borderRadius: "70% 30% 60% 40% / 60% 70% 30% 40%",
            animation: "flutter 3.4s ease-in-out infinite",
          }}
        />

        {/* ── story text ── */}
        {beachLines.map((l, i) => {
          const o = win(p, l.at, l.to, 0.05);
          return (
            <p
              key={i}
              className={`absolute z-10 text-[clamp(1.35rem,2.9vw,2.3rem)] leading-[1.35] ${l.position}`}
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                color: s.ink,
                opacity: o,
                transform: `translateY(${(1 - o) * 18}px)`,
                textShadow: `0 2px 28px color-mix(in oklab, ${s.oceanNear} 60%, transparent), 0 0 60px color-mix(in oklab, ${s.skyLow} 45%, transparent)`,
              }}
            >
              {l.text}
            </p>
          );
        })}

        {/* ── the last page, held in the night ── */}
        <div
          className="absolute inset-x-0 top-[18%] z-10 px-6 text-center"
          data-lastpage="true"
          style={{
            opacity: clamp((p - 0.9) / 0.07),
            transform: `translateY(${(1 - clamp((p - 0.9) / 0.07)) * 24}px)`,
          }}
        >
          <p
            className="text-[0.62rem] uppercase tracking-[0.4em]"
            style={{ color: "color-mix(in oklab, var(--lavender) 80%, white)" }}
          >
            {story.beach.lastPage.eyebrow}
          </p>
          <h2
            className="mx-auto mt-7 max-w-2xl text-[clamp(1.9rem,4.6vw,3.2rem)] leading-tight"
            style={{ color: s.ink }}
          >
            {story.beach.lastPage.title}
            <span className="block italic" style={{ color: "var(--lavender)" }}>
              {story.beach.lastPage.accent}
            </span>
          </h2>
          <p
            className="mx-auto mt-7 max-w-md text-[0.95rem] leading-8"
            style={{ color: "color-mix(in oklab, var(--blush) 84%, white)" }}
          >
            {story.beach.lastPage.body}
          </p>
        </div>

        {/* paper grain over the entire world */}
        <div className="paper-grain pointer-events-none absolute inset-0" />
      </div>
    </section>
  );
}

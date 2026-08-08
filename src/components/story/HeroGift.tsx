import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { story } from "@/data/story";
import giftImg from "@/assets/illustrations/gift-premium.png";
import { gsap, initGsap } from "@/js/gsap/masterTimeline";
import { prefersReducedMotion } from "@/js/utils";

type Phase = "idle" | "opening" | "entering" | "done";

/** A very soft synthesized chime — no audio asset, plays only after a click. */
function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1318.5, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + 2.0 + i * 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 2.6);
    });
    window.setTimeout(() => void ctx.close(), 7000);
  } catch {
    /* audio is a nicety, never a requirement */
  }
}

/** Three independent particle layers: dust, petals, sparkles. */
function Atmosphere({ lit }: { lit: number }) {
  const dust = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: (i * 41) % 100,
        size: 2 + ((i * 5) % 4),
        delay: (i * 3.1) % 34,
        duration: 34 + ((i * 11) % 26),
        dx: `${((i % 7) - 3) * 26}px`,
        opacity: 0.16 + (i % 5) * 0.06,
      })),
    [],
  );
  const petals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: (i * 67 + 9) % 100,
        size: 7 + ((i * 9) % 9),
        delay: (i * 4.7) % 30,
        duration: 28 + ((i * 13) % 20),
        dx: `${((i % 5) - 2) * 52}px`,
        opacity: 0.3 + (i % 4) * 0.12,
      })),
    [],
  );
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: 12 + ((i * 53) % 76),
        top: 14 + ((i * 37) % 66),
        delay: (i * 1.7) % 9,
        duration: 5 + ((i * 3) % 6),
        size: 3 + ((i * 2) % 3),
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dust.map((p, i) => (
        <span
          key={`d${i}`}
          className="absolute bottom-[-8vh] block rounded-full"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              background: "color-mix(in oklab, var(--soft-gold) 70%, white)",
              animation: `drift-up ${p.duration}s linear ${p.delay}s infinite`,
              "--dx": p.dx,
            } as React.CSSProperties
          }
        />
      ))}
      {petals.map((p, i) => (
        <span
          key={`p${i}`}
          className="absolute bottom-[-10vh] block"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.72,
              opacity: p.opacity,
              borderRadius: "60% 40% 55% 45% / 55% 60% 40% 45%",
              background: "color-mix(in oklab, var(--blush) 78%, white)",
              animation: `drift-up ${p.duration}s linear ${p.delay}s infinite`,
              "--dx": p.dx,
            } as React.CSSProperties
          }
        />
      ))}
      {sparkles.map((s, i) => (
        <span
          key={`s${i}`}
          className="absolute block rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: "color-mix(in oklab, var(--soft-gold) 85%, white)",
            boxShadow: `0 0 ${8 + lit * 14}px ${2 + lit * 4}px color-mix(in oklab, var(--soft-gold) ${30 + lit * 45}%, transparent)`,
            animation: `sparkle-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── what comes out of the box ─────────────────────────────────
 * Elegant, never confetti: petals, light orbs, soft dust,
 * tiny paper stars and a handful of mini polaroids. */
type BurstKind = "petal" | "orb" | "dust" | "star" | "polaroid";

type BurstSeed = {
  kind: BurstKind;
  size: number;
  angle: number;
  radius: number;
  rise: number;
  spin: number;
  delay: number;
  duration: number;
  opacity: number;
};

const rand = (n: number) => {
  const s = Math.sin(n * 91.7) * 43758.5453;
  return s - Math.floor(s);
};

function makeBurst(): BurstSeed[] {
  const kinds: BurstKind[] = [
    "petal",
    "orb",
    "dust",
    "star",
    "petal",
    "orb",
    "dust",
    "petal",
    "polaroid",
    "orb",
  ];
  return Array.from({ length: 34 }, (_, i) => {
    const kind = kinds[i % kinds.length];
    const r = rand(i + 3);
    const r2 = rand(i + 41);
    return {
      kind,
      size: Math.round(
        kind === "polaroid"
          ? 22 + r * 12
          : kind === "petal"
            ? 9 + r * 9
            : kind === "orb"
              ? 5 + r * 6
              : kind === "star"
                ? 7 + r * 5
                : 2 + r * 3,
      ),
      angle: (i / 34) * Math.PI * 2 + r2 * 0.9,
      radius: 90 + r2 * 190,
      rise: 150 + r * 300,
      spin: (r2 - 0.5) * 520,
      delay: r * 1.5,
      duration: 3.4 + r2 * 3.2,
      opacity: kind === "dust" ? 0.18 + r * 0.14 : 0.4 + r * 0.45,
    };
  });
}

function burstStyle(seed: BurstSeed): React.CSSProperties {
  const base: React.CSSProperties = {
    width: seed.size,
    height: seed.size,
    opacity: 0,
  };
  switch (seed.kind) {
    case "petal":
      return {
        ...base,
        height: seed.size * 0.74,
        borderRadius: "60% 40% 55% 45% / 55% 60% 40% 45%",
        background:
          "linear-gradient(140deg, color-mix(in oklab, var(--blush) 90%, white), color-mix(in oklab, var(--coral) 42%, white))",
        filter: "drop-shadow(0 2px 4px color-mix(in oklab, var(--rose-gold) 30%, transparent))",
      };
    case "orb":
      return {
        ...base,
        borderRadius: 999,
        background:
          "radial-gradient(circle at 36% 32%, white, color-mix(in oklab, var(--soft-gold) 78%, white))",
        boxShadow: "0 0 16px 4px color-mix(in oklab, var(--soft-gold) 32%, transparent)",
      };
    case "dust":
      return {
        ...base,
        borderRadius: 999,
        background: "color-mix(in oklab, var(--soft-gold) 60%, white)",
      };
    case "star":
      return {
        ...base,
        background: "color-mix(in oklab, white 82%, var(--peach))",
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        filter: "drop-shadow(0 0 5px color-mix(in oklab, var(--soft-gold) 45%, transparent))",
      };
    default:
      return {
        ...base,
        height: seed.size * 1.2,
        borderRadius: 2,
        background: "color-mix(in oklab, white 88%, var(--ivory))",
        border: "1px solid color-mix(in oklab, var(--rose-gold) 22%, transparent)",
        boxShadow: "0 6px 14px -8px color-mix(in oklab, var(--rose-gold) 55%, transparent)",
      };
  }
}

export function HeroGift({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [t, setT] = useState(0); // seconds into the opening timeline
  const [hover, setHover] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const timers = useRef<number[]>([]);

  const burst = useMemo(makeBurst, []);

  const cameraRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const knotRef = useRef<HTMLSpanElement>(null);
  const tailLeftRef = useRef<HTMLSpanElement>(null);
  const tailRightRef = useRef<HTMLSpanElement>(null);
  const lidLightRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);

  const at = useCallback((s: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, s * 1000));
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const hint = window.setTimeout(() => setHintVisible(false), 9000);
    timers.current.push(hint);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduced) return () => undefined;

    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x, y });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* Weightless float — 7s sine, with the ground shadow breathing along. */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    initGsap();
    const ctx = gsap.context(() => {
      gsap.to(floatRef.current, {
        y: -16,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(shadowRef.current, {
        scaleX: 0.9,
        opacity: 0.32,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      // ribbon touched by soft wind — almost unnoticeable
      gsap.to([tailLeftRef.current, tailRightRef.current], {
        rotate: (i: number) => (i === 0 ? -2.4 : 2.4),
        duration: 4.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.4,
      });
    });
    return () => ctx.revert();
  }, []);

  /* Cursor-aware tilt: 3 degrees maximum, eased. */
  useEffect(() => {
    const el = tiltRef.current;
    if (!el || prefersReducedMotion()) return;
    initGsap();
    const rx = gsap.quickTo(el, "rotateX", { duration: 0.9, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotateY", { duration: 0.9, ease: "power3.out" });
    const onMove = (e: MouseEvent) => {
      if (phase !== "idle") return;
      const r = el.getBoundingClientRect();
      const cx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const cy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      ry(gsap.utils.clamp(-3, 3, cx * 3));
      rx(gsap.utils.clamp(-3, 3, -cy * 3));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [phase]);

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      document.body.style.overflow = "";
    },
    [],
  );

  const finish = useCallback(() => {
    document.body.style.overflow = "";
    window.scrollTo({ top: 0 });
    setPhase("done");
    onEnter();
  }, [onEnter]);

  const skip = () => {
    timers.current.forEach(window.clearTimeout);
    gsap.killTweensOf([cameraRef.current, floatRef.current, tiltRef.current, flashRef.current]);
    finish();
  };

  /** The staged opening — nothing happens at once. */
  const runSequence = () => {
    initGsap();
    const reduced = prefersReducedMotion();
    gsap.killTweensOf([floatRef.current, shadowRef.current]);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Step 1 — the camera leans in.
    tl.to(cameraRef.current, { scale: 1.18, duration: 0.9 }, 0.15)
      // Step 2 — the knot loosens, the ribbon unfolds and slides away.
      .to(knotRef.current, { scale: 1.14, rotate: -6, duration: 0.5, ease: "back.out(2)" }, 0.3)
      .to(
        knotRef.current,
        { scale: 0.6, opacity: 0, y: 26, rotate: -22, duration: 1.1, ease: "power2.in" },
        0.9,
      )
      .to(
        tailLeftRef.current,
        { rotate: -34, x: -46, y: 92, opacity: 0, duration: 1.5, ease: "power1.in" },
        0.85,
      )
      .to(
        tailRightRef.current,
        { rotate: 40, x: 52, y: 104, opacity: 0, duration: 1.6, ease: "power1.in" },
        1.0,
      )
      // Step 3 — the lid tips back from its rear hinge, with a little overshoot.
      .to(
        tiltRef.current,
        { y: -30, rotateX: -6, duration: 1.5, ease: "back.out(1.2)" },
        2.9,
      )
      .fromTo(
        lidLightRef.current,
        { opacity: 0, scaleY: 0.2 },
        { opacity: 1, scaleY: 1, duration: 1.6, ease: "power2.out" },
        3.0,
      )
      // Camera keeps creeping in until the gift nearly fills the frame.
      .to(cameraRef.current, { scale: 1.55, duration: 3.4, ease: "sine.inOut" }, 2.6)
      .to(cameraRef.current, { scale: 2.4, duration: 2.2, ease: "power2.in" }, 5.6);

    // The contents leave the box in a slow spiral.
    if (!reduced && burstRef.current) {
      const items = Array.from(burstRef.current.children) as HTMLElement[];
      items.forEach((el, i) => {
        const s = burst[i];
        if (!s) return;
        const midX = Math.cos(s.angle) * s.radius * 0.45;
        const midY = -s.rise * 0.4;
        const endX = Math.cos(s.angle + 1.6) * s.radius;
        const endY = -s.rise;
        tl.fromTo(
          el,
          { x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 },
          {
            keyframes: {
              "0%": { x: 0, y: 0, scale: 0.3, opacity: 0 },
              "22%": { opacity: s.opacity, scale: 1 },
              "70%": { x: midX, y: midY, opacity: s.opacity },
              "100%": { x: endX, y: endY, opacity: 0, scale: 0.86 },
            },
            rotate: s.spin,
            duration: s.duration,
            ease: "sine.out",
          },
          2.5 + s.delay,
        );
      });
    }

    // Magic transition — warm cream light floods the screen, never pure white.
    tl.to(flashRef.current, { opacity: 1, duration: 1.0, ease: "power2.in" }, 6.4);

    if (reduced) tl.timeScale(6);
    return tl;
  };

  const open = (e: React.MouseEvent) => {
    if (phase !== "idle") return;
    setRipple({ x: e.clientX, y: e.clientY, key: Date.now() });
    setHintVisible(false);
    runSequence();

    // 0.15s of deliberate silence before anything moves — anticipation.
    at(0.15, () => {
      setPhase("opening");
      playChime();
    });
    [0.35, 0.8, 1.5, 2.0, 2.6, 3.2, 4.0, 4.8].forEach((mark) => at(mark, () => setT(mark)));
    at(5.5, () => {
      setT(5.5);
      setPhase("entering");
    });
    at(6.5, () => setT(6.5));
    at(7.6, finish);
  };

  if (phase === "done") return null;

  const opening = phase === "opening" || phase === "entering";
  const glow = t >= 2.0 ? Math.min(1, (t - 2.0) / 2.4) : 0;
  const lidUp = t >= 3.2;
  const world = t >= 4.8;

  const px = parallax.x;
  const py = parallax.y;

  return (
    <div className="paper-grain fixed inset-0 z-[80] overflow-hidden">
      {/* Layer 1 — slowly drifting gradient sky */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, color-mix(in oklab, var(--cream) 94%, white) 0%, var(--blush) 42%, color-mix(in oklab, var(--peach) 84%, white) 72%, color-mix(in oklab, var(--lavender) 70%, white) 100%)",
          animation: "sky-drift 110s ease-in-out infinite",
        }}
      />

      {/* Layer 2 — pastel blobs */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {[
          { c: "--lavender", top: "8%", left: "6%", s: 460, bx: "4%", by: "-3%", d: 46 },
          { c: "--peach", top: "52%", left: "62%", s: 520, bx: "-3%", by: "3%", d: 58 },
          { c: "--soft-blue", top: "62%", left: "8%", s: 380, bx: "3%", by: "-4%", d: 64 },
          { c: "--blush", top: "4%", left: "58%", s: 420, bx: "-4%", by: "4%", d: 52 },
        ].map((b, i) => (
          <span
            key={i}
            className="absolute block rounded-full"
            style={
              {
                top: b.top,
                left: b.left,
                width: b.s,
                height: b.s,
                background: `radial-gradient(circle, color-mix(in oklab, var(${b.c}) 62%, transparent), transparent 70%)`,
                filter: "blur(28px)",
                opacity: 0.55,
                animation: `blob-float ${b.d}s ease-in-out infinite`,
                transform: `translate3d(${px * -8}px, ${py * -8}px, 0)`,
                "--bx": b.bx,
                "--by": b.by,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Layer 3 + 4 — particles and blurred flowers */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate3d(${px * -6}px, ${py * -6}px, 0)` }}
      >
        <Atmosphere lit={glow} />
      </div>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ transform: `translate3d(${px * -10}px, ${py * -10}px, 0)` }}
      >
        {[
          { left: "12%", top: "68%", s: 90 },
          { left: "82%", top: "22%", s: 72 },
          { left: "74%", top: "76%", s: 108 },
          { left: "22%", top: "18%", s: 64 },
        ].map((f, i) => (
          <span
            key={i}
            className="absolute block"
            style={{
              left: f.left,
              top: f.top,
              width: f.s,
              height: f.s,
              filter: "blur(10px)",
              opacity: 0.32 + glow * 0.25,
              borderRadius: "58% 42% 46% 54% / 52% 58% 42% 48%",
              background: `radial-gradient(circle at 40% 35%, color-mix(in oklab, var(--blush) 88%, white), color-mix(in oklab, var(--coral) 45%, transparent))`,
              animation: `breathe ${11 + i * 2}s var(--ease-story) infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 5 — soft studio light: brighter centre, gently darker edges */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 48% at 50% 44%, color-mix(in oklab, white 42%, transparent), transparent 68%), radial-gradient(120% 100% at 50% 50%, transparent 62%, color-mix(in oklab, var(--rose-gold) 16%, transparent))",
        }}
      />

      {/* ---------- The scene ---------- */}
      <div
        ref={cameraRef}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6"
        style={{ transformOrigin: "50% 52%", willChange: "transform" }}
      >
        <div
          className="flex flex-col items-center"
          style={{
            opacity: opening && t >= 4.0 ? 0 : 1,
            transition: "opacity 1200ms var(--ease-story)",
          }}
        >
          <span
            className="block h-px w-16"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--rose-gold) 75%, transparent), transparent)",
            }}
          />
          <p className="mt-10 text-[0.62rem] uppercase tracking-[0.44em] text-muted-foreground">
            {story.heroGift.eyebrow}
          </p>
          <p
            className="mt-6 text-center text-[clamp(1.6rem,3.6vw,2.5rem)] font-light leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {story.heroGift.lead}
          </p>
        </div>

        {/* Gift + light */}
        <div
          className="relative mt-14 flex items-center justify-center"
          style={{
            transform: `translate3d(${px * -12}px, ${py * -12}px, 0)`,
            transition: "transform 900ms var(--ease-story)",
          }}
        >
          {/* golden light leaking out, then blooming */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${34 + glow * 190}vmin`,
              height: `${34 + glow * 190}vmin`,
              opacity: glow * 0.95,
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--soft-gold) 78%, white) 0%, color-mix(in oklab, var(--peach) 52%, transparent) 34%, transparent 68%)",
              filter: "blur(18px)",
              transition: "all 1800ms var(--ease-story)",
            }}
          />

          {/* the mini sky revealed inside the box */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: world ? "180vmin" : "10vmin",
              height: world ? "180vmin" : "10vmin",
              opacity: world ? 1 : 0,
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--cream) 96%, white) 0%, color-mix(in oklab, var(--blush) 72%, white) 46%, color-mix(in oklab, var(--lavender) 62%, white) 78%, color-mix(in oklab, var(--peach) 50%, white) 100%)",
              transition: "all 2600ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {/* what comes out of the box — a slow spiral, never an explosion */}
          <div
            aria-hidden
            ref={burstRef}
            className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
            style={{ zIndex: 4 }}
          >
            {burst.map((s, i) => (
              <span key={i} className="absolute block" style={burstStyle(s)} />
            ))}
          </div>

          <div ref={floatRef} className="relative" style={{ willChange: "transform" }}>
            <button
              type="button"
              data-hoverable
              aria-label="Open the gift"
              onClick={open}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              className="relative block bg-transparent p-6 sm:p-8"
              style={{
                perspective: 900,
                // the box stays visible while the lid lifts; it only dissolves
                // once the little sky inside has taken over the frame
                opacity: world ? 0 : 1,
                transition: "opacity 1600ms var(--ease-story)",
              }}
            >
              <div
                ref={tiltRef}
                className="relative"
                style={{
                  transformStyle: "preserve-3d",
                  transform: hover && !opening ? "scale(1.03)" : undefined,
                  transition: "transform 700ms var(--ease-story)",
                  willChange: "transform",
                }}
              >
                <img
                  src={giftImg}
                  alt="A handcrafted ivory and blush gift box tied with a dusty rose ribbon"
                  width={1280}
                  height={1024}
                  style={{
                    height: "clamp(150px, 26vh, 300px)",
                    width: "auto",
                    filter: `drop-shadow(0 30px 44px color-mix(in oklab, var(--rose-gold) ${hover ? 26 : 34}%, transparent)) brightness(${1 + glow * 0.25})`,
                    transition: "filter 900ms var(--ease-story)",
                  }}
                />

                {/* warm light spilling from under the lifted lid */}
                <span
                  aria-hidden
                  ref={lidLightRef}
                  className="pointer-events-none absolute left-1/2 top-[26%] block h-[26%] w-[64%] -translate-x-1/2 rounded-[999px]"
                  style={{
                    opacity: 0,
                    transformOrigin: "50% 100%",
                    background:
                      "radial-gradient(60% 100% at 50% 100%, color-mix(in oklab, var(--soft-gold) 80%, white), color-mix(in oklab, var(--peach) 50%, transparent) 60%, transparent 78%)",
                    filter: "blur(8px)",
                  }}
                />

                {/* the ribbon: a knot and two tails that untie for real */}
                <span
                  aria-hidden
                  ref={knotRef}
                  className="pointer-events-none absolute left-1/2 top-[34%] block h-[14px] w-[16%] -translate-x-1/2 rounded-full"
                  style={{
                    background:
                      "linear-gradient(120deg, color-mix(in oklab, var(--coral) 78%, white), color-mix(in oklab, var(--rose-gold) 70%, white))",
                    boxShadow: "0 3px 8px -5px color-mix(in oklab, var(--sunset) 70%, transparent)",
                    opacity: 0.55,
                    filter: "blur(0.6px)",
                  }}
                />
                <span
                  aria-hidden
                  ref={tailLeftRef}
                  className="pointer-events-none absolute left-1/2 top-[38%] block h-[8px] w-[26%] rounded-full"
                  style={{
                    transformOrigin: "100% 50%",
                    marginLeft: "-26%",
                    background:
                      "linear-gradient(90deg, transparent, color-mix(in oklab, var(--coral) 60%, white))",
                    opacity: 0.45,
                    filter: "blur(1.4px)",
                  }}
                />
                <span
                  aria-hidden
                  ref={tailRightRef}
                  className="pointer-events-none absolute left-1/2 top-[38%] block h-[8px] w-[26%] rounded-full"
                  style={{
                    transformOrigin: "0% 50%",
                    background:
                      "linear-gradient(270deg, transparent, color-mix(in oklab, var(--coral) 60%, white))",
                    opacity: 0.45,
                    filter: "blur(1.4px)",
                  }}
                />
              </div>
            </button>
          </div>

          {/* breathing shadow beneath the box */}
          <span
            aria-hidden
            ref={shadowRef}
            className="absolute -bottom-2 left-1/2 block h-4 w-[46%] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, color-mix(in oklab, var(--rose-gold) 42%, transparent), transparent 70%)",
              filter: "blur(10px)",
              opacity: lidUp ? 0 : 0.45,
              transition: "opacity 1200ms var(--ease-story)",
            }}
          />
        </div>

        <div
          className="mt-16 flex flex-col items-center gap-6"
          style={{
            opacity: opening ? 0 : 1,
            transition: "opacity 900ms var(--ease-story)",
          }}
        >
          <p className="text-[0.86rem] italic text-muted-foreground">{story.heroGift.hint}</p>
          <p
            className="text-[0.58rem] uppercase tracking-[0.36em] text-muted-foreground transition-opacity duration-[1200ms]"
            style={{ opacity: hintVisible ? 0.75 : 0 }}
          >
            {story.heroGift.cta}
          </p>
        </div>
      </div>

      {/* the magic transition — sunlight through paper, never pure white */}
      <div
        aria-hidden
        ref={flashRef}
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          opacity: 0,
          background:
            "radial-gradient(70% 60% at 50% 50%, color-mix(in oklab, var(--ivory) 96%, white), color-mix(in oklab, var(--cream) 92%, white) 55%, color-mix(in oklab, var(--peach) 40%, white) 100%)",
        }}
      />

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-8 right-8 z-40 text-[0.58rem] uppercase tracking-[0.3em] text-muted-foreground transition-opacity duration-700 hover:opacity-100"
        style={{ opacity: opening ? 0 : 0.6 }}
      >
        {story.heroGift.skip}
      </button>

      {ripple && (
        <span
          key={ripple.key}
          aria-hidden
          className="pointer-events-none absolute z-20 block h-40 w-40 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            border: "1px solid color-mix(in oklab, var(--rose-gold) 60%, transparent)",
            animation: "ripple-out 1100ms var(--ease-story) forwards",
          }}
        />
      )}
    </div>
  );
}

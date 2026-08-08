/**
 * Dream Aquarium — the closing epilogue.
 *
 * A calm, spacious section whose centrepiece is a single premium glass tank.
 * The section keeps the site's pastel daylight palette; only the tank is
 * underwater. Everything inside is layered SVG moved by GSAP transforms, so
 * the scene holds 60fps and never touches layout:
 *
 *   water → hardscape → plants → fish → foreground carpet → bubbles → glass
 *
 * There is no game here. Fish drift, grow curious about the cursor, gather
 * around food you drop, and keep living once the message has been read.
 */
import { useEffect, useMemo, useRef } from "react";

import { gsap, initGsap } from "@/js/gsap/masterTimeline";
import { isMobileViewport, prefersReducedMotion } from "@/js/utils";

import {
  BettaFish,
  Coral,
  Driftwood,
  Fish,
  FISH_LOOK,
  FloatingLeaf,
  MossRock,
  PlantGrass,
  PlantTall,
  Shrimp,
  Snail,
  type FishSpecies,
} from "./AquariumSprites";

const COPY = {
  title: "thank you for making it to the end.",
  subtitle: "i hope your next chapter is filled with beautiful memories and endless happiness.",
  caption: ["stay here for a while.", "the little fish love having visitors."],
};

/** A tiny deterministic generator so the scene is stable between renders. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Swimmer = {
  species: FishSpecies;
  scale: number;
  /** Percentage start position inside the tank. */
  left: number;
  top: number;
  /** Vertical band the fish keeps to, as a fraction of the tank. */
  bandTop: number;
  bandBottom: number;
  /** Fish in the same school share a destination bias. */
  school: number;
  /** Loners wander much further per leg. */
  solo: boolean;
};

/** Builds the cast once: schools, loners, micro life. Sized for a tank, not an ocean. */
function buildSwimmers(): Swimmer[] {
  const rand = makeRandom(20260802);
  const out: Swimmer[] = [];

  const schools: { species: FishSpecies; size: number; band: [number, number] }[] = [
    { species: "neonTetra", size: 6, band: [0.24, 0.5] },
    { species: "cardinalTetra", size: 5, band: [0.38, 0.62] },
    { species: "micro", size: 5, band: [0.5, 0.76] },
    { species: "glass", size: 3, band: [0.2, 0.44] },
  ];

  let schoolId = 1;
  for (const school of schools) {
    for (let i = 0; i < school.size; i += 1) {
      out.push({
        species: school.species,
        scale: 0.5 + rand() * 0.2,
        left: 10 + rand() * 76,
        top: (school.band[0] + rand() * (school.band[1] - school.band[0])) * 100,
        bandTop: school.band[0],
        bandBottom: school.band[1],
        school: schoolId,
        solo: false,
      });
    }
    schoolId += 1;
  }

  const loners: { species: FishSpecies; band: [number, number]; scale: number }[] = [
    { species: "guppy", band: [0.28, 0.56], scale: 0.62 },
    { species: "guppy", band: [0.34, 0.6], scale: 0.54 },
    { species: "goldRam", band: [0.46, 0.72], scale: 0.66 },
    { species: "pastel", band: [0.3, 0.66], scale: 0.6 },
  ];

  for (const fish of loners) {
    out.push({
      species: fish.species,
      scale: fish.scale,
      left: 14 + rand() * 68,
      top: (fish.band[0] + rand() * (fish.band[1] - fish.band[0])) * 100,
      bandTop: fish.band[0],
      bandBottom: fish.band[1],
      school: 0,
      solo: true,
    });
  }

  return out;
}

export function DreamAquarium({ onReplay }: { onReplay?: () => void }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const bettaRef = useRef<HTMLDivElement | null>(null);
  const bettaVeil = useRef<SVGGElement | null>(null);
  const bettaTail = useRef<SVGGElement | null>(null);

  const swimmers = useMemo(buildSwimmers, []);
  const bubbleCount = useMemo(() => 16, []);
  const moteCount = useMemo(() => 20, []);

  /* ---------- the living scene ---------- */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    initGsap();

    const reduced = prefersReducedMotion();
    const registry = new Set<gsap.core.Tween | gsap.core.Timeline>();
    const timers = new Set<gsap.core.Tween>();
    let disposed = false;

    const track = <T extends gsap.core.Tween | gsap.core.Timeline>(t: T) => {
      registry.add(t);
      return t;
    };

    const bounds = () => stage.getBoundingClientRect();

    type Agent = {
      el: HTMLElement;
      spec: Swimmer;
      x: number;
      y: number;
      current?: gsap.core.Tween;
      wait?: gsap.core.Tween;
      busy: boolean;
    };

    const fishEls = Array.from(stage.querySelectorAll<HTMLElement>("[data-aq-fish]"));
    const rand = makeRandom(77123);
    const schoolAnchors = new Map<number, { x: number; y: number }>();

    const agents: Agent[] = fishEls.map((el, i) => {
      const spec = swimmers[i];
      const rect = bounds();
      const x = (spec.left / 100) * rect.width;
      const y = (spec.top / 100) * rect.height;
      gsap.set(el, { x, y, scaleX: spec.scale, scaleY: spec.scale });
      return { el, spec, x, y, busy: false };
    });

    const margin = 26;

    /** Where a fish would like to go next — schools bias toward a shared point. */
    const pickTarget = (agent: Agent) => {
      const rect = bounds();
      const { spec } = agent;
      if (spec.school) {
        let anchor = schoolAnchors.get(spec.school);
        if (!anchor || rand() < 0.14) {
          anchor = {
            x: rect.width * (0.12 + rand() * 0.76),
            y: rect.height * (spec.bandTop + rand() * (spec.bandBottom - spec.bandTop)),
          };
          schoolAnchors.set(spec.school, anchor);
        }
        return {
          x: gsap.utils.clamp(margin, rect.width - margin, anchor.x + (rand() - 0.5) * 120),
          y: gsap.utils.clamp(margin, rect.height - margin, anchor.y + (rand() - 0.5) * 70),
        };
      }
      const reach = spec.solo ? 0.5 : 0.3;
      return {
        x: gsap.utils.clamp(
          margin,
          rect.width - margin,
          agent.x + (rand() - 0.5) * rect.width * reach * 2,
        ),
        y: gsap.utils.clamp(
          Math.max(margin, rect.height * spec.bandTop),
          Math.min(rect.height - margin, rect.height * spec.bandBottom),
          agent.y + (rand() - 0.5) * rect.height * 0.24,
        ),
      };
    };

    const face = (agent: Agent, targetX: number) => {
      const dir = targetX >= agent.x ? 1 : -1;
      gsap.to(agent.el, {
        scaleX: dir * agent.spec.scale,
        duration: 0.9,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };

    /** One leg of a journey, then a pause, then another. Never a straight repeat. */
    const swim = (
      agent: Agent,
      override?: { x: number; y: number; duration?: number; ease?: string },
    ) => {
      if (disposed) return;
      const target = override ?? pickTarget(agent);
      const dist = Math.hypot(target.x - agent.x, target.y - agent.y);
      const speed = FISH_LOOK[agent.spec.species].speed;
      const duration =
        override?.duration ?? gsap.utils.clamp(2, 11, dist / (30 * speed) + rand() * 1.6);

      face(agent, target.x);
      agent.current?.kill();
      agent.current = track(
        gsap.to(agent.el, {
          x: target.x,
          y: target.y,
          duration,
          ease: override?.ease ?? "power1.inOut",
          onUpdate: () => {
            agent.x = Number(gsap.getProperty(agent.el, "x"));
            agent.y = Number(gsap.getProperty(agent.el, "y"));
          },
          onComplete: () => {
            agent.x = target.x;
            agent.y = target.y;
            agent.busy = false;
            // Some fish rest, some turn immediately, some linger by a plant.
            const rest = rand();
            const pause = rest < 0.2 ? 1.8 + rand() * 3.4 : rand() * 1.2;
            agent.wait = track(
              gsap.delayedCall(pause, () => swim(agent)) as unknown as gsap.core.Tween,
            );
            timers.add(agent.wait);
          },
        }),
      );
    };

    // A soft body undulation, independent of the travel tween.
    for (const agent of agents) {
      const inner = agent.el.firstElementChild as HTMLElement | null;
      if (inner && !reduced) {
        track(
          gsap.to(inner, {
            rotate: 3 + rand() * 3,
            y: 1 + rand() * 2,
            duration: 1.3 + rand() * 1.3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );
      }
      const start = track(
        gsap.delayedCall(rand() * 3.5, () => swim(agent)) as unknown as gsap.core.Tween,
      );
      timers.add(start);
    }

    /* ---------- the betta: the centrepiece, always graceful ---------- */
    if (bettaRef.current) {
      const rect = bounds();
      const bettaScale = isMobileViewport() ? 0.5 : 0.72;
      gsap.set(bettaRef.current, {
        x: rect.width * 0.5,
        y: rect.height * 0.52,
        scaleX: bettaScale,
        scaleY: bettaScale,
      });
      const bettaAgent: Agent = {
        el: bettaRef.current,
        spec: {
          species: "koi",
          scale: bettaScale,
          left: 50,
          top: 52,
          bandTop: 0.3,
          bandBottom: 0.66,
          school: 0,
          solo: true,
        },
        x: rect.width * 0.5,
        y: rect.height * 0.52,
        busy: false,
      };
      agents.push(bettaAgent);
      timers.add(
        track(gsap.delayedCall(1.2, () => swim(bettaAgent)) as unknown as gsap.core.Tween),
      );

      if (!reduced) {
        if (bettaVeil.current) {
          track(
            gsap.to(bettaVeil.current, {
              scaleY: 1.06,
              rotate: 2.4,
              duration: 3.2,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
        }
        if (bettaTail.current) {
          track(
            gsap.to(bettaTail.current, {
              skewY: 4,
              scaleX: 1.05,
              duration: 2.6,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
        }
      }
    }

    /* ---------- swaying aquascape ---------- */
    if (!reduced) {
      stage.querySelectorAll<HTMLElement>("[data-aq-sway]").forEach((el, i) => {
        const amount = Number(el.dataset.aqSway ?? 2);
        track(
          gsap.to(el, {
            rotate: amount,
            duration: 4 + (i % 5) * 0.9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            transformOrigin: "50% 100%",
            delay: i * 0.18,
          }),
        );
      });

      /* ---------- micro life: shrimp walking, snail crawling ---------- */
      stage.querySelectorAll<HTMLElement>("[data-aq-crawl]").forEach((el, i) => {
        const span = Number(el.dataset.aqCrawl ?? 40);
        track(
          gsap.to(el, {
            x: span,
            duration: 16 + i * 5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );
        track(
          gsap.to(el, {
            y: -2,
            duration: 0.6 + i * 0.1,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );
      });

      /* ---------- bubbles: rise, wobble, occasionally split ---------- */
      stage.querySelectorAll<HTMLElement>("[data-aq-bubble]").forEach((el, i) => {
        const rect = bounds();
        const size = 2 + (i % 6) * 1.4;
        gsap.set(el, { width: size, height: size, x: rect.width * 0.5, y: rect.height + 20 });
        const loop = () => {
          if (disposed) return;
          const b = bounds();
          const startX = b.width * (0.05 + rand() * 0.9);
          const drift = (rand() - 0.5) * 40;
          const scale = 0.6 + rand() * 1.2;
          gsap.set(el, { x: startX, y: b.height + 14, scale, opacity: 0 });
          track(
            gsap
              .timeline({ onComplete: loop })
              .to(el, { opacity: 0.45 + rand() * 0.3, duration: 1, ease: "sine.out" })
              .to(el, { y: -20, x: startX + drift, duration: 9 + rand() * 10, ease: "none" }, 0)
              .to(el, { opacity: 0, duration: 1.6 }, "-=1.8"),
          );
        };
        timers.add(track(gsap.delayedCall(rand() * 10, loop) as unknown as gsap.core.Tween));
      });

      /* ---------- plankton motes ---------- */
      stage.querySelectorAll<HTMLElement>("[data-aq-mote]").forEach((el) => {
        const rect = bounds();
        gsap.set(el, {
          x: rect.width * rand(),
          y: rect.height * rand(),
          opacity: 0.15 + rand() * 0.35,
        });
        track(
          gsap.to(el, {
            x: `+=${(rand() - 0.5) * 70}`,
            y: `-=${25 + rand() * 70}`,
            duration: 16 + rand() * 18,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );
      });

      /* ---------- floating leaves ---------- */
      stage.querySelectorAll<HTMLElement>("[data-aq-leaf]").forEach((el, i) => {
        track(
          gsap.to(el, {
            x: (i % 2 ? -1 : 1) * (18 + rand() * 22),
            y: 10 + rand() * 16,
            rotate: (i % 2 ? -1 : 1) * 16,
            duration: 12 + rand() * 8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );
      });
    }

    /* ---------- cursor: some fish grow curious, some drift away ---------- */
    const onPointerMove = (event: PointerEvent) => {
      const rect = bounds();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      for (const agent of agents) {
        if (agent.busy) continue;
        const dx = agent.x - px;
        const dy = agent.y - py;
        const dist = Math.hypot(dx, dy);
        if (dist > 110) continue;
        const angle = Math.atan2(dy, dx || 0.001);
        // roughly a third of the fish come to look, the rest keep their distance
        const curious = rand() < 0.34;
        const reach = curious ? -(30 + rand() * 40) : 80 + rand() * 90;
        agent.busy = true;
        agent.wait?.kill();
        swim(agent, {
          x: gsap.utils.clamp(margin, rect.width - margin, agent.x + Math.cos(angle) * reach),
          y: gsap.utils.clamp(
            margin,
            rect.height - margin,
            agent.y + Math.sin(angle) * reach * 0.6,
          ),
          duration: curious ? 1.6 + rand() * 1 : 1 + rand() * 0.7,
          ease: curious ? "power2.inOut" : "power3.out",
        });
        timers.add(
          track(
            gsap.delayedCall(2.4, () => {
              agent.busy = false;
            }) as unknown as gsap.core.Tween,
          ),
        );
      }
    };

    /* ---------- click: a little food drifts down and the fish gather ---------- */
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("a,button")) return;
      const rect = bounds();
      const px = gsap.utils.clamp(10, rect.width - 10, event.clientX - rect.left);
      const host = stage.querySelector<HTMLElement>("[data-aq-food-layer]");
      if (!host) return;

      const total = isMobileViewport() ? 4 : 7;
      for (let i = 0; i < total; i += 1) {
        const crumb = document.createElement("span");
        crumb.className = "aq-food";
        host.appendChild(crumb);
        const fallY = rect.height * (0.6 + rand() * 0.3);
        gsap.set(crumb, { x: px + (rand() - 0.5) * 26, y: -6, opacity: 0 });
        track(
          gsap
            .timeline({ onComplete: () => crumb.remove() })
            .to(crumb, { opacity: 0.9, duration: 0.4 })
            .to(
              crumb,
              {
                x: `+=${(rand() - 0.5) * 40}`,
                y: fallY,
                duration: 4 + rand() * 3,
                ease: "sine.in",
              },
              0,
            )
            .to(crumb, { opacity: 0, duration: 1.2 }, "-=1.2"),
        );
      }

      // The closest few come over, nibble, and then drift back to their lives.
      const feedY = rect.height * 0.34;
      const nearby = agents
        .map((agent) => ({ agent, d: Math.hypot(agent.x - px, agent.y - feedY) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 7);

      for (const { agent } of nearby) {
        agent.busy = true;
        agent.wait?.kill();
        swim(agent, {
          x: gsap.utils.clamp(margin, rect.width - margin, px + (rand() - 0.5) * 70),
          y: gsap.utils.clamp(margin, rect.height - margin, feedY + (rand() - 0.5) * 70),
          duration: 1.6 + rand() * 1.2,
          ease: "power2.inOut",
        });
        const inner = agent.el.firstElementChild as HTMLElement | null;
        if (inner && !reduced) {
          track(
            gsap.to(inner, {
              scale: 1.06,
              duration: 0.22,
              repeat: 5,
              yoyo: true,
              delay: 1.8,
              ease: "sine.inOut",
            }),
          );
        }
        timers.add(
          track(
            gsap.delayedCall(4 + rand() * 2, () => {
              agent.busy = false;
            }) as unknown as gsap.core.Tween,
          ),
        );
      }
    };

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerdown", onPointerDown);

    /* ---------- pause everything while the aquarium is off-screen ---------- */
    let observer: IntersectionObserver | undefined;
    const setPaused = (paused: boolean) => {
      registry.forEach((t) => (paused ? t.pause() : t.resume()));
      timers.forEach((t) => (paused ? t.pause() : t.resume()));
    };

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => setPaused(!entry.isIntersecting)),
        { threshold: 0 },
      );
      observer.observe(stage);
    }
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerdown", onPointerDown);
      timers.forEach((t) => t.kill());
      registry.forEach((t) => t.kill());
      registry.clear();
      timers.clear();
    };
  }, [swimmers]);

  /* ---------- the closing words ---------- */
  useEffect(() => {
    const node = copyRef.current;
    if (!node) return;
    initGsap();
    const items = Array.from(node.querySelectorAll<HTMLElement>("[data-aq-reveal]"));
    gsap.set(items, { opacity: 0, y: 24 });

    let tween: gsap.core.Tween | undefined;
    const reveal = () => {
      tween = gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.28,
        ease: "power2.out",
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="aquarium paper-grain" aria-labelledby="dream-aquarium-title">
      {/* ---------- soft daylight ambience, kept behind everything ---------- */}
      <div aria-hidden className="aq-ambience">
        <span className="aq-sun" />
        <span className="aq-glow aq-glow--left" />
        <span className="aq-glow aq-glow--right" />
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={`p-${i}`} className={`aq-dust aq-dust--${(i % 4) + 1}`} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={`pet-${i}`} className={`aq-petal aq-petal--${(i % 6) + 1}`} />
        ))}
      </div>

      <div ref={copyRef} className="aq-shell">
        <h2 id="dream-aquarium-title" className="aq-title" data-aq-reveal>
          {COPY.title}
        </h2>
        <p className="aq-subtitle" data-aq-reveal>
          {COPY.subtitle}
        </p>

        {/* ---------- the tank ---------- */}
        <div className="aq-tank" data-aq-reveal>
          <div ref={stageRef} className="aq-stage">
            {/* water + light */}
            <div aria-hidden className="aq-layer aq-water">
              <div className="aq-water__gradient" />
              <div className="aq-caustics" />
              <div className="aq-caustics aq-caustics--slow" />
              <div className="aq-beams" />
              <div className="aq-substrate" />
            </div>

            {/* background: tall plants and the far stone */}
            <div aria-hidden className="aq-layer aq-back">
              <span className="aq-item" style={{ left: "3%", bottom: "4%", width: 130, height: "72%" }} data-aq-sway="2.2">
                <PlantTall tone="#7fb7a2" />
              </span>
              <span className="aq-item" style={{ left: "12%", bottom: "4%", width: 104, height: "58%" }} data-aq-sway="2.8">
                <PlantTall tone="#93c7b1" />
              </span>
              <span className="aq-item" style={{ left: "24%", bottom: "5%", width: 82, height: "40%" }} data-aq-sway="2.4">
                <PlantTall tone="#8cc2ac" />
              </span>
              <span className="aq-item" style={{ right: "4%", bottom: "4%", width: 138, height: "68%" }} data-aq-sway="-2.4">
                <PlantTall tone="#82bda6" />
              </span>
              <span className="aq-item" style={{ right: "14%", bottom: "4%", width: 98, height: "50%" }} data-aq-sway="-3">
                <PlantTall tone="#9ccfba" />
              </span>
              <span className="aq-item" style={{ right: "26%", bottom: "5%", width: 76, height: "34%" }} data-aq-sway="-2.6">
                <PlantTall tone="#90c8b2" />
              </span>
              <span className="aq-item" style={{ left: "42%", bottom: "5%", width: 200 }}>
                <MossRock tone="#a9bcc6" />
              </span>
            </div>

            {/* hardscape: stones and driftwood, following the golden ratio */}
            <div aria-hidden className="aq-layer aq-hardscape">
              <span className="aq-item" style={{ left: "14%", bottom: "3%", width: 168 }}>
                <MossRock tone="#93a6b1" />
              </span>
              <span className="aq-item" style={{ left: "31%", bottom: "4%", width: 96 }}>
                <MossRock tone="#a3b5bf" />
              </span>
              <span className="aq-item" style={{ right: "16%", bottom: "3%", width: 140 }}>
                <MossRock tone="#9bafba" />
              </span>
              <span className="aq-item" style={{ right: "31%", bottom: "4%", width: 78 }}>
                <MossRock tone="#aabcc5" />
              </span>
              <span className="aq-item" style={{ left: "7%", bottom: "9%", width: 240, opacity: 0.95 }}>
                <Driftwood />
              </span>
              <span className="aq-item" style={{ right: "5%", bottom: "11%", width: 180, transform: "scaleX(-1)" }}>
                <Driftwood />
              </span>
              <span className="aq-item" style={{ left: "35%", bottom: "7%", width: 96 }} data-aq-sway="2">
                <Coral tone="#cbb6d8" variant={1} />
              </span>
              <span className="aq-item" style={{ left: "61%", bottom: "6%", width: 86 }} data-aq-sway="2.4">
                <Coral tone="#e8c3cf" variant={0} />
              </span>

            </div>

            {/* fish */}
            <div aria-hidden className="aq-layer aq-fishlayer">
              {swimmers.map((fish, i) => (
                <span key={`${fish.species}-${i}`} className="aq-fish" data-aq-fish>
                  <span
                    className="aq-fish__inner"
                    style={{ width: FISH_LOOK[fish.species].length * 2 }}
                  >
                    <Fish species={fish.species} />
                  </span>
                </span>
              ))}

              <div ref={bettaRef} className="aq-fish aq-fish--betta">
                <span className="aq-fish__inner">
                  <BettaFish veilRef={bettaVeil} tailRef={bettaTail} />
                </span>
              </div>
            </div>

            {/* foreground: carpet, moss and micro life */}
            <div aria-hidden className="aq-layer aq-front">
              <span className="aq-item" style={{ left: "-2%", bottom: "0%", width: "52%", height: "17%" }} data-aq-sway="1.3">
                <PlantGrass />
              </span>
              <span className="aq-item" style={{ right: "-2%", bottom: "0%", width: "50%", height: "15%" }} data-aq-sway="-1.3">
                <PlantGrass tone="#8ec5ae" />
              </span>
              <span className="aq-item" style={{ left: "28%", bottom: "0%", width: "34%", height: "10%" }} data-aq-sway="1">
                <PlantGrass tone="#9ad2b9" />
              </span>
              <span className="aq-item aq-item--micro" style={{ left: "26%", bottom: "9%", width: 22 }} data-aq-crawl="70">
                <Shrimp />
              </span>
              <span className="aq-item aq-item--micro" style={{ left: "58%", bottom: "7%", width: 20 }} data-aq-crawl="-46">
                <Snail />
              </span>
              <span className="aq-item aq-item--micro" style={{ left: "78%", bottom: "11%", width: 18 }} data-aq-crawl="40">
                <Shrimp />
              </span>

              <span className="aq-item aq-leaf" style={{ left: "36%", top: "20%", width: 26 }} data-aq-leaf>
                <FloatingLeaf />
              </span>
              <span className="aq-item aq-leaf" style={{ left: "70%", top: "32%", width: 22 }} data-aq-leaf>
                <FloatingLeaf tone="#cfe0cc" />
              </span>
            </div>

            {/* bubbles + plankton */}
            <div aria-hidden className="aq-layer aq-bubbles">
              {Array.from({ length: bubbleCount }).map((_, i) => (
                <span key={`b-${i}`} className="aq-bubble" data-aq-bubble />
              ))}
              {Array.from({ length: moteCount }).map((_, i) => (
                <span key={`m-${i}`} className="aq-mote" data-aq-mote />
              ))}
            </div>

            <div aria-hidden className="aq-layer aq-food-layer" data-aq-food-layer />

            {/* the glass itself */}
            <div aria-hidden className="aq-glass" />
            <div aria-hidden className="aq-glass__sheen" />
            <div aria-hidden className="aq-waterline" />
          </div>
        </div>

        <p className="aq-caption" data-aq-reveal>
          {COPY.caption[0]}
          <br />
          {COPY.caption[1]}
        </p>

        {onReplay ? (
          <button type="button" className="aq-replay hover-lift" data-aq-reveal onClick={onReplay}>
            Replay Journey
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default DreamAquarium;

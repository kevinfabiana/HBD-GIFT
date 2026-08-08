import { useEffect, useRef } from "react";

import redPanda from "@/assets/mascots/red-panda.png";
import cat from "@/assets/mascots/cat.png";
import grizzly from "@/assets/mascots/grizzly.png";
import iceBear from "@/assets/mascots/ice-bear.png";

import type { MascotId } from "@/data/letters";
import { gsap, initGsap } from "@/js/gsap/masterTimeline";
import { prefersReducedMotion } from "@/js/utils";

const ART: Record<MascotId, string> = {
  "red-panda": redPanda,
  cat,
  grizzly,
  "ice-bear": iceBear,
};

/** Personality: each mascot enters, idles and reacts a little differently. */
const PERSONALITY: Record<
  MascotId,
  { enter: number; sway: number; tilt: number; blinkEvery: number; wave: boolean }
> = {
  "red-panda": { enter: 0.35, sway: 2.4, tilt: -4, blinkEvery: 6.5, wave: false },
  cat: { enter: 0.35, sway: 3.2, tilt: 5, blinkEvery: 4.5, wave: false },
  grizzly: { enter: 0.35, sway: 1.8, tilt: 3, blinkEvery: 7.5, wave: true },
  "ice-bear": { enter: 0.35, sway: 1.2, tilt: -2.5, blinkEvery: 9, wave: false },
};

/**
 * The mascot who lives behind the letter. Only the upper ~35% of the body
 * shows above the paper — the paper always paints over the rest.
 *
 * Everything is transform/opacity only, on a single GSAP timeline.
 */
export function LetterMascot({ mascot, name }: { mascot: MascotId; name: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLImageElement>(null);
  const sparkRef = useRef<HTMLSpanElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const body = bodyRef.current;
    const art = artRef.current;
    if (!wrap || !body || !art) return;

    const p = PERSONALITY[mascot];
    initGsap();

    if (prefersReducedMotion()) {
      gsap.set(body, { y: 0, autoAlpha: 1 });
      return;
    }

    gsap.set(body, { y: "100%", autoAlpha: 0, rotate: 0 });
    gsap.set(art, { transformOrigin: "50% 100%" });

    const ctx = gsap.context(() => {
      /* ── entrance: ears → eyes → head up → paws → half body (±1.5s) ── */
      const enter = gsap
        .timeline({ delay: p.enter })
        .set(body, { autoAlpha: 1 })
        .to(body, { y: "78%", duration: 0.2, ease: "power2.out" })
        .to(body, { y: "62%", duration: 0.3, ease: "power2.out" })
        .to(body, { y: "22%", rotate: p.tilt * 0.6, duration: 0.4, ease: "back.out(1.6)" })
        .to(body, { y: "8%", rotate: p.tilt * -0.4, duration: 0.3, ease: "power2.out" })
        .to(body, { y: "0%", rotate: 0, duration: 0.3, ease: "power2.out" });

      /* ── idle loops ── */
      const breathe = gsap.to(body, {
        y: "-2%",
        scaleY: 1.015,
        duration: 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: p.enter + 1.6,
      });
      const sway = gsap.to(art, {
        rotate: p.sway,
        duration: 3.6 + p.sway,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: p.enter + 1.8,
      });
      const blink = gsap.to(art, {
        scaleY: 0.985,
        duration: 0.1,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        repeatDelay: p.blinkEvery,
        delay: p.enter + 2.4,
      });
      const wave = p.wave
        ? gsap.to(art, {
            rotate: `+=${p.sway * 1.6}`,
            duration: 0.4,
            ease: "sine.inOut",
            repeat: 3,
            yoyo: true,
            repeatDelay: 0,
            delay: p.enter + 3.4,
          })
        : null;

      /* ── cursor interaction ── */
      let near = false;
      let closeTimer = 0;
      const onMove = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.4;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < 120) {
          if (!near) {
            near = true;
            sway.pause();
            closeTimer = window.setTimeout(() => {
              gsap.to(body, { y: "-4%", scale: 1.03, duration: 0.5, ease: "power2.out" });
              gsap.fromTo(
                sparkRef.current,
                { autoAlpha: 0, scale: 0.5, rotate: -20 },
                { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2)" },
              );
            }, 2000);
          }
          gsap.to(art, {
            rotate: gsap.utils.clamp(-8, 8, dx / 14),
            x: gsap.utils.clamp(-5, 5, dx / 26),
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else if (near) {
          near = false;
          window.clearTimeout(closeTimer);
          gsap.to(art, { rotate: 0, x: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
          gsap.to(body, { y: "0%", scale: 1, duration: 0.6, ease: "power2.out" });
          gsap.to(sparkRef.current, { autoAlpha: 0, duration: 0.4 });
          sway.play();
        }
      };

      const onClick = () => {
        gsap
          .timeline()
          .to(body, { y: "-10%", duration: 0.24, ease: "power2.out" })
          .to(body, { y: "0%", duration: 0.5, ease: "bounce.out" })
          .fromTo(
            heartRef.current,
            { autoAlpha: 0, y: 0, scale: 0.4 },
            { autoAlpha: 1, y: -26, scale: 1, duration: 0.7, ease: "power2.out" },
            0,
          )
          .to(heartRef.current, { autoAlpha: 0, y: -44, duration: 0.5, ease: "power1.in" }, 0.7)
          .fromTo(
            sparkRef.current,
            { autoAlpha: 0, scale: 0.5 },
            { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
            0.05,
          )
          .to(sparkRef.current, { autoAlpha: 0, duration: 0.4 }, 0.9);
      };

      window.addEventListener("pointermove", onMove);
      wrap.addEventListener("click", onClick);

      return () => {
        window.clearTimeout(closeTimer);
        window.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("click", onClick);
        enter.kill();
        breathe.kill();
        sway.kill();
        blink.kill();
        wave?.kill();
      };
    }, wrap);

    return () => ctx.revert();
  }, [mascot]);

  return (
    <div ref={wrapRef} className="letter-mascot" aria-hidden>
      <div ref={bodyRef} className="letter-mascot__body">
        <span ref={sparkRef} className="letter-mascot__spark">
          ✦
        </span>
        <span ref={heartRef} className="letter-mascot__heart">
          ♥
        </span>
        <img
          ref={artRef}
          src={ART[mascot]}
          alt={name}
          width={816}
          height={816}
          loading="lazy"
          className="letter-mascot__art"
          draggable={false}
        />
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { letters, lettersSection, type Letter } from "@/data/letters";
import { LetterMascot } from "@/components/story/LetterMascot";
import { Petals } from "@/components/story/Petals";

import { StoryHeading } from "@/components/story/StoryHeading";
import { gsap, initGsap } from "@/js/gsap/masterTimeline";
import { prefersReducedMotion } from "@/js/utils";

function Decoration({ decor }: { decor: Letter["decor"] }) {
  if (decor === "flower") {
    return (
      <svg className="decor-flower" width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <g stroke="color-mix(in oklab, var(--rose-gold) 70%, transparent)" fill="none" strokeWidth="0.9">
          <path d="M15 27V13" />
          <path d="M15 18c-3-1-5-3-6-6" />
          <path d="M15 21c3-1 5-3 6-6" />
        </g>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx="15"
            cy="7.5"
            rx="2.4"
            ry="4"
            transform={`rotate(${a} 15 12)`}
            fill="color-mix(in oklab, var(--blush) 78%, white)"
            opacity="0.9"
          />
        ))}
        <circle cx="15" cy="12" r="1.6" fill="color-mix(in oklab, var(--soft-gold) 80%, white)" />
      </svg>
    );
  }
  if (decor === "ribbon") {
    return (
      <svg className="decor-ribbon" width="34" height="24" viewBox="0 0 34 24" aria-hidden>
        <path
          d="M17 12c-5-7-13-8-13-3s8 5 13 3 13 2 13 3-8-4-13 3"
          fill="none"
          stroke="color-mix(in oklab, var(--coral) 70%, transparent)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="17" cy="12" r="1.7" fill="color-mix(in oklab, var(--coral) 78%, white)" />
      </svg>
    );
  }
  if (decor === "sticker") {
    return <span className="decor-sticker">for cipaa</span>;
  }
  return <span className="decor-stampmark">skb</span>;
}

/**
 * Four sealed letters from the SKB Surabaya team. Each envelope breathes
 * on its own rhythm, opens with GSAP, and folds itself back on close.
 */
export function FriendLetters() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const [open, setOpen] = useState<Letter | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const dust = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: (i * 41) % 100,
        top: (i * 67) % 100,
        size: 1.5 + ((i * 5) % 3),
        dx: `${((i % 5) - 2) * 12}px`,
        dy: `${-18 - ((i * 7) % 26)}px`,
        dur: `${14 + ((i * 3) % 12)}s`,
        delay: `${(i * 1.7) % 9}s`,
      })),
    [],
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: 8 + ((i * 27) % 84),
        top: 12 + ((i * 43) % 74),
        delay: `${(i * 1.9) % 7}s`,
      })),
    [],
  );

  /* every closed envelope breathes on its own timing */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return;
    initGsap();

    const nodes = Array.from(grid.querySelectorAll<HTMLElement>(".envelope"));
    const tweens = nodes.map((node, i) =>
      gsap.to(node, {
        y: -7 - (i % 3) * 2,
        rotate: i % 2 === 0 ? 0.5 : -0.6,
        duration: 3.4 + i * 0.55,
        delay: i * 0.42,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      }),
    );

    const reveal = gsap.from(nodes, {
      opacity: 0,
      y: 46,
      rotate: 1.5,
      duration: 1.1,
      stagger: 0.16,
      ease: "power3.out",
      scrollTrigger: { trigger: grid, start: "top 82%", once: true },
    });

    return () => {
      tweens.forEach((t) => t.kill());
      reveal.scrollTrigger?.kill();
      reveal.kill();
    };
  }, []);

  /* paper-like sympathy: neighbours tilt slightly toward a hovered envelope */
  const handleHover = useCallback((index: number, active: boolean) => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return;
    const nodes = Array.from(grid.querySelectorAll<HTMLElement>(".envelope"));

    nodes.forEach((node, i) => {
      if (i === index) {
        gsap.to(node, {
          scale: active ? 1.035 : 1,
          duration: 0.55,
          ease: "power2.out",
          overwrite: "auto",
        });
        return;
      }
      const distance = Math.abs(i - index);
      gsap.to(node, {
        rotate: active ? (i < index ? -1.1 : 1.1) / distance : 0,
        x: active ? ((i < index ? -1 : 1) * 5) / distance : 0,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }, []);

  /* the opening: a small rotation, the seal cracking, the flap lifting,
   * and the paper sliding out before the letter takes over */
  const handleOpen = useCallback((letter: Letter, node: HTMLElement) => {
    if (prefersReducedMotion()) {
      setOpen(letter);
      setOpenId(letter.id);
      return;
    }
    initGsap();

    const flap = node.querySelector(".envelope__flap");
    const seal = node.querySelector(".envelope__seal");
    const peek = node.querySelector(".envelope__peek");

    gsap
      .timeline({ onComplete: () => { setOpen(letter); setOpenId(letter.id); } })
      .to(node, { rotate: -1.6, scale: 1.03, duration: 0.32, ease: "power2.out" }, 0)
      .to(seal, { scale: 1.28, duration: 0.18, ease: "power2.out" }, 0)
      .to(seal, { scale: 0.4, opacity: 0, rotate: 26, duration: 0.4, ease: "power3.in" }, 0.18)
      .to(flap, { rotateX: -164, duration: 0.7, ease: "power3.inOut", transformPerspective: 700 }, 0.3)
      .fromTo(
        peek,
        { opacity: 0, y: "30%", scaleY: 0.92 },
        { opacity: 1, y: "-24%", scaleY: 1, duration: 0.62, ease: "power2.out" },
        0.52,
      );
  }, []);

  /* the letter unfolds itself into view */
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    initGsap();
    const card = cardRef.current;
    const overlay = overlayRef.current;
    if (!card || !overlay) return;

    const lines = card.querySelectorAll(".letter-card__line, .letter-card__title, .letter-card__sign");
    const tl = gsap
      .timeline()
      .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0)
      .fromTo(
        card,
        { opacity: 0, y: 34, scaleY: 0.5, rotateX: -34, transformPerspective: 900 },
        { opacity: 1, y: 0, scaleY: 1, rotateX: 0, duration: 0.95, ease: "power3.out" },
        0.08,
      )
      .fromTo(
        lines,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.09, ease: "power2.out" },
        0.5,
      );

    return () => {
      tl.kill();
    };
  }, [open]);

  /* closing folds the paper away and reforms the wax seal */
  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    const grid = gridRef.current;
    const node = openId
      ? grid?.querySelector<HTMLElement>(`[data-letter="${openId}"]`)
      : null;

    const restore = () => {
      setOpen(null);
      setOpenId(null);
      if (!node) return;
      const flap = node.querySelector(".envelope__flap");
      const seal = node.querySelector(".envelope__seal");
      const peek = node.querySelector(".envelope__peek");
      if (prefersReducedMotion()) {
        gsap.set([flap], { rotateX: 0 });
        gsap.set([seal], { opacity: 1, scale: 1, rotate: 0 });
        gsap.set([peek], { opacity: 0, y: "30%" });
        gsap.set(node, { rotate: 0, scale: 1 });
        return;
      }
      gsap
        .timeline()
        .to(peek, { opacity: 0, y: "30%", scaleY: 0.9, duration: 0.42, ease: "power2.in" }, 0)
        .to(flap, { rotateX: 0, duration: 0.66, ease: "power3.inOut" }, 0.18)
        .to(node, { rotate: 0, scale: 1, duration: 0.5, ease: "power2.out" }, 0.18)
        .fromTo(
          seal,
          { opacity: 0, scale: 0.4, rotate: -22 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2)" },
          0.62,
        );
    };

    if (prefersReducedMotion() || !cardRef.current || !overlayRef.current) {
      restore();
      return;
    }

    closingRef.current = true;
    const mascotBody = overlayRef.current.querySelector(".letter-mascot__body");
    gsap
      .timeline({
        onComplete: () => {
          closingRef.current = false;
          restore();
        },
      })
      .to(mascotBody, { y: "100%", autoAlpha: 0, duration: 0.34, ease: "power2.in" }, 0)
      .to(
        cardRef.current,
        { opacity: 0, y: 22, scaleY: 0.55, rotateX: -28, duration: 0.5, ease: "power2.in" },
        0.14,
      )
      .to(overlayRef.current, { opacity: 0, duration: 0.36, ease: "power2.in" }, 0.3);

  }, [openId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  return (
    <section ref={sectionRef} className="letters" aria-label={lettersSection.title}>
      <div aria-hidden className="letters__sun" />
      <div aria-hidden className="letters__paper-texture" />
      <Petals count={12} tone="blush" />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {dust.map((d, i) => (
          <span
            key={`d-${i}`}
            className="letters__dust"
            style={
              {
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: d.size,
                height: d.size,
                "--dx": d.dx,
                "--dy": d.dy,
                "--dur": d.dur,
                "--delay": d.delay,
              } as React.CSSProperties
            }
          />
        ))}
        {sparkles.map((s, i) => (
          <span
            key={`s-${i}`}
            className="letters__sparkle"
            style={
              { left: `${s.left}%`, top: `${s.top}%`, "--delay": s.delay } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-[2] mx-auto max-w-3xl text-center">
        <StoryHeading
          eyebrow={lettersSection.eyebrow}
          title={lettersSection.title}
          className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.1rem,6vw,3.6rem)] leading-[1.05] text-foreground"
        />
        <p className="mx-auto mt-5 max-w-xl font-[family-name:var(--font-body)] text-sm leading-relaxed text-muted-foreground">
          {lettersSection.subtitle}
        </p>
        <p className="mt-3 font-[family-name:var(--font-hand)] text-base text-[color-mix(in_oklab,var(--coral)_78%,var(--foreground))]">
          {lettersSection.hint}
        </p>
      </div>

      <div ref={gridRef} className="letters__grid relative z-[2]">
        {letters.map((letter, i) => (
          <button
            key={letter.id}
            type="button"
            data-letter={letter.id}
            className="envelope"
            aria-label={`Buka ${letter.from}`}
            onMouseEnter={() => handleHover(i, true)}
            onMouseLeave={() => handleHover(i, false)}
            onFocus={() => handleHover(i, true)}
            onBlur={() => handleHover(i, false)}
            onClick={(e) => handleOpen(letter, e.currentTarget)}
          >
            <span className="envelope__body">
              <span aria-hidden className="envelope__fold" />
              <span className="envelope__peek" aria-hidden />
              <span className="envelope__decor">
                <Decoration decor={letter.decor} />
              </span>
              <span className="envelope__stamp">{letter.stamp}</span>
              <span className="envelope__meta">
                <span className="block font-[family-name:var(--font-hand)] text-base text-[color-mix(in_oklab,var(--foreground)_80%,var(--rose-gold))]">
                  {letter.from}
                </span>
                <span className="mt-1 block text-[0.5rem] uppercase tracking-[0.28em] text-muted-foreground">
                  sealed with love
                </span>
              </span>
            </span>
            <span className="envelope__flap" aria-hidden />
            <span className="envelope__seal" aria-hidden>
              {letter.seal}
            </span>
          </button>
        ))}
      </div>

      {open ? (
        <div
          ref={overlayRef}
          className="letters__overlay"
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          onClick={handleClose}
        >
          <div className="letter-stage" onClick={(e) => e.stopPropagation()}>
            <LetterMascot key={open.id} mascot={open.mascot} name={open.mascotName} />
            <div ref={cardRef} className="letter-card paper-grain">

            <button
              type="button"
              className="letter-card__close"
              aria-label="Tutup surat"
              onClick={handleClose}
            >
              <span aria-hidden>×</span>
            </button>

            <div className="flex justify-center">
              <Decoration decor="flower" />
            </div>

            <p className="letter-card__title mt-3 text-center font-[family-name:var(--font-hand)] text-[clamp(1.6rem,4.4vw,2.2rem)] text-[color-mix(in_oklab,var(--foreground)_88%,var(--coral))]">
              {open.title}
            </p>
            <p className="mt-1 text-center text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">
              {open.stamp} · {open.from}
            </p>

            <div className="mt-6 space-y-4 text-left">
              {open.body.map((line, i) => (
                <p key={i} className="letter-card__line">
                  {line}
                </p>
              ))}
            </div>

            <p className="letter-card__sign mt-7 text-right font-[family-name:var(--font-hand)] text-lg text-[color-mix(in_oklab,var(--foreground)_82%,var(--rose-gold))]">
              {open.sign}
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-[color-mix(in_oklab,var(--rose-gold)_35%,transparent)] px-5 py-2 text-[0.6rem] uppercase tracking-[0.26em] text-muted-foreground transition-transform duration-300 hover:scale-[1.04]"
              >
                Close
              </button>
            </div>
            </div>
          </div>

        </div>
      ) : null}
    </section>
  );
}

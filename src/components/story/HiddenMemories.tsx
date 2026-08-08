import { useEffect, useRef, useState } from "react";

import { chime } from "@/js/audio";

const quotes = [
  "thank you for being here.",
  "some people are just good weather.",
  "this page exists because you do.",
];

/** Small things that only reward curiosity: a flower, a star, and a very slow scroll. */
export function HiddenMemories() {
  const [note, setNote] = useState<string | null>(null);
  const [hearts, setHearts] = useState(false);
  const last = useRef({ y: 0, t: 0, slow: 0 });

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 3800);
    return () => clearTimeout(t);
  }, [note]);

  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = now - last.current.t;
      if (dt > 90) {
        const speed = Math.abs(y - last.current.y) / dt;
        last.current = {
          y,
          t: now,
          slow: speed > 0.004 && speed < 0.08 ? last.current.slow + 1 : 0,
        };
        if (last.current.slow > 22 && !hearts) {
          setHearts(true);
          window.setTimeout(() => setHearts(false), 4200);
          last.current.slow = -120;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hearts]);

  const reveal = (text: string) => {
    chime(1180);
    setNote(text);
  };

  return (
    <>
      <button
        type="button"
        data-hoverable
        aria-label="A small flower"
        onClick={() => reveal("thank you for being here.")}
        className="float-slow fixed bottom-10 left-8 z-40 h-8 w-8 opacity-60 transition-transform duration-500 hover:scale-125"
        style={{
          borderRadius: "62% 38% 55% 45% / 55% 62% 38% 45%",
          background: "color-mix(in oklab, var(--blush) 88%, white)",
        }}
      />
      <button
        type="button"
        data-hoverable
        aria-label="A small star"
        onClick={() => reveal(quotes[Math.floor(Math.random() * quotes.length)])}
        className="fixed bottom-24 left-14 z-40 h-4 w-4 opacity-70 transition-transform duration-500 hover:rotate-45"
        style={{
          background: "color-mix(in oklab, var(--soft-gold) 92%, white)",
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        }}
      />

      {note && (
        <div
          className="hand pointer-events-none fixed bottom-12 left-24 z-40 max-w-xs text-2xl"
          style={{
            color: "var(--dusty-purple)",
            animation: "fade-in 800ms var(--ease-story) both",
          }}
        >
          {note}
        </div>
      )}

      {hearts && (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[60vh]">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-lg"
              style={{
                left: `${42 + Math.sin(i) * 12}%`,
                bottom: "10%",
                color: "color-mix(in oklab, var(--coral) 80%, white)",
                ["--hx" as string]: `${(i % 5) * 18 - 36}px`,
                animation: `heart-rise ${3 + (i % 4) * 0.4}s var(--ease-story) ${i * 0.14}s both`,
              }}
            >
              ♥
            </span>
          ))}
        </div>
      )}
    </>
  );
}

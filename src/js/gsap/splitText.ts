/**
 * SplitType-style text splitting, done in-house so no extra runtime is
 * shipped. Every heading is split into lines → words → characters, and each
 * level is animated differently.
 */
import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "../utils";
import { gsap, initGsap, ScrollTrigger } from "./masterTimeline";

export type SplitMode = "chars" | "words" | "lines";

type SplitResult = { lines: HTMLElement[]; words: HTMLElement[]; chars: HTMLElement[] };

const span = (className: string, text?: string) => {
  const el = document.createElement("span");
  el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};

/**
 * Rewrites a node's text into nested line / word / char spans.
 * Returns the created elements plus a restore function.
 */
export function splitText(node: HTMLElement) {
  const original = node.innerHTML;
  const source = node.textContent ?? "";
  const result: SplitResult = { lines: [], words: [], chars: [] };

  node.innerHTML = "";
  const line = span("split-line");
  node.appendChild(line);
  result.lines.push(line);

  source.split(/(\s+)/).forEach((token) => {
    if (!token) return;
    if (/^\s+$/.test(token)) {
      line.appendChild(document.createTextNode(" "));
      return;
    }
    const word = span("split-word");
    [...token].forEach((character) => {
      const char = span("split-char", character);
      word.appendChild(char);
      result.chars.push(char);
    });
    line.appendChild(word);
    result.words.push(word);
  });

  return {
    ...result,
    restore: () => {
      node.innerHTML = original;
    },
  };
}

/**
 * Splits a heading and plays its reveal when it scrolls into view.
 * `mode` chooses which granularity actually animates.
 */
export function useSplitReveal<T extends HTMLElement>(mode: SplitMode = "chars", delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    initGsap();

    if (prefersReducedMotion()) {
      gsap.set(node, { opacity: 1 });
      return;
    }

    const split = splitText(node);
    const targets =
      mode === "chars" ? split.chars : mode === "words" ? split.words : split.lines;
    if (!targets.length) return split.restore;

    gsap.set(node, { opacity: 1 });

    const tween = gsap.fromTo(
      targets,
      {
        yPercent: mode === "chars" ? 110 : 60,
        opacity: 0,
        rotate: mode === "chars" ? 2.5 : 0,
        filter: "blur(6px)",
      },
      {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        filter: "blur(0px)",
        duration: mode === "chars" ? 0.9 : 1.2,
        delay: delay / 1000,
        ease: "power3.out",
        stagger: mode === "chars" ? 0.022 : 0.09,
        scrollTrigger: { trigger: node, start: "top 88%", once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.restore();
      ScrollTrigger.refresh();
    };
  }, [mode, delay]);

  return ref;
}

/** Deck state for the soundtrack: selection, playback and the visualizer. */
import { useEffect, useRef, useState } from "react";

import { chime } from "./audio";

export const VISUALIZER_BARS = 22;

/** Bar heights are stable between renders so the deck never jitters. */
export const visualizerBars = Array.from({ length: VISUALIZER_BARS }, (_, i) => ({
  height: 18 + ((i * 37) % 30),
  duration: 1.1 + (i % 5) * 0.22,
  delay: i * 0.06,
}));

export function useMusicPlayer(trackCount: number) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [changing, setChanging] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    if (playing) chime(660);
  }, [playing]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Swapping records blurs the label out, then back in. */
  const select = (next: number) => {
    if (next === index || next < 0 || next >= trackCount) return;
    setChanging(true);
    timer.current = window.setTimeout(() => {
      setIndex(next);
      setChanging(false);
    }, 520);
  };

  return { index, playing, changing, select, toggle: () => setPlaying((p) => !p) };
}

/** 3° maximum tilt, plus a highlight that follows the pointer. */
export function tiltFromPointer(el: HTMLElement, clientX: number, clientY: number) {
  const rect = el.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width - 0.5;
  const y = (clientY - rect.top) / rect.height - 0.5;
  el.style.transform = `perspective(1100px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
  el.style.setProperty("--hl-x", `${((x + 0.5) * 100).toFixed(1)}%`);
  el.style.setProperty("--hl-y", `${((y + 0.5) * 100).toFixed(1)}%`);
}

export function resetTilt(el: HTMLElement | null) {
  if (el) el.style.transform = "";
}

/**
 * Scene hand-offs. Scenes never "start" or "end" — they overlap, driven by
 * a single normalised progress value per scene.
 */
import { useEffect, useRef, useState } from "react";

import { createSceneTimeline, initGsap, killScene, type SceneName } from "./gsap/masterTimeline";

/**
 * Returns 0..1 progress for a scroll-driven scene, using ScrollTrigger so
 * every scene shares one scroll listener and one refresh cycle.
 */
export function useSceneProgress<T extends HTMLElement>(name: SceneName) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    initGsap();

    const timeline = createSceneTimeline(name, {
      scrollTrigger: {
        trigger: node,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => setProgress(self.progress),
        onRefresh: (self) => setProgress(self.progress),
      },
    });

    return () => {
      timeline.scrollTrigger?.kill();
      killScene(name);
    };
  }, [name]);

  return { ref, progress };
}

/** True once the component has hydrated — safe place to read the DOM. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

/** Reveals an element the first time it enters the viewport. */
export function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/** Runs a list of millisecond marks once the element is on screen. */
export function useStagedEntrance<T extends HTMLElement>(
  marks: readonly number[],
  threshold = 0.35,
) {
  const ref = useRef<T>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        marks.forEach((ms, i) => {
          timers.push(window.setTimeout(() => setStage(i + 1), ms));
        });
      },
      { threshold },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [marks, threshold]);

  return { ref, stage };
}

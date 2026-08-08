/** Application-level wiring: locks, scroll ownership and teardown. */
import { useEffect } from "react";

import { initGsap, killAllScenes, refreshStory } from "./gsap/masterTimeline";

/** Boots GSAP once and keeps scroll-driven scenes measured correctly. */
export function useStoryRuntime() {
  useEffect(() => {
    initGsap();
    const onResize = () => refreshStory();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      killAllScenes();
    };
  }, []);
}

/** Freezes the page while the gift is still closed. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

/**
 * The master timeline.
 *
 * Nothing animates "globally": every scene owns an independent timeline and
 * registers itself here so the story can be inspected, paused or torn down
 * as one piece.
 *
 *   MasterTimeline
 *   ├── hero
 *   ├── gift
 *   ├── scroll
 *   ├── scrapbook
 *   ├── beach
 *   └── ending
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { prefersReducedMotion } from "../utils";

export type SceneName = "hero" | "gift" | "scroll" | "scrapbook" | "beach" | "ending";

let ready = false;

/** Registers plugins once, on the client only. */
export function initGsap() {
  if (ready || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power2.out", duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  ready = true;
  return gsap;
}

const scenes = new Map<SceneName, gsap.core.Timeline>();

/** Creates an empty, independent timeline for a scene and tracks it. */
export function createSceneTimeline(name: SceneName, vars: gsap.TimelineVars = {}) {
  initGsap();
  killScene(name);
  const timeline = gsap.timeline({
    paused: true,
    ...vars,
    ...(prefersReducedMotion() ? { timeScale: 8 } : null),
  });
  scenes.set(name, timeline);
  return timeline;
}

export const getScene = (name: SceneName) => scenes.get(name);

export function killScene(name: SceneName) {
  const existing = scenes.get(name);
  if (!existing) return;
  existing.scrollTrigger?.kill();
  existing.kill();
  scenes.delete(name);
}

export function killAllScenes() {
  [...scenes.keys()].forEach(killScene);
}

/** Recalculates every scroll-driven scene — call after layout changes. */
export const refreshStory = () => ready && ScrollTrigger.refresh();

export { gsap, ScrollTrigger };

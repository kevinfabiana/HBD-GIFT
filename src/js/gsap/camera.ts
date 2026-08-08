/**
 * The virtual camera.
 *
 * One rig per act, each with its own camera language. Movement is deliberately
 * tiny — the caps live in the `.camera-rig` utility (x ±1%, y ±2%,
 * scale 1 → 1.02, rotation ±0.3°) so no preset can ever become distracting.
 *
 *   breathe  hero        almost invisible, alive
 *   push     gift/letter leans the viewer closer
 *   follow   scrapbook   eases after the active memory, never snaps
 *   float    beach       standing quietly beside the ocean
 *   pull     ending      steps back, gives closure
 */
import { useEffect, useRef } from "react";

import { clamp, clamp01, isFinePointer, isMobileViewport, prefersReducedMotion } from "../utils";
import { gsap, initGsap } from "./masterTimeline";

export type CameraPreset = "breathe" | "push" | "follow" | "float" | "pull";

type Frame = { x: number; y: number; zoom: number; rot: number };

/** How each act reads the same scroll progress. `t` is seconds since mount. */
const LANGUAGE: Record<CameraPreset, (p: number, t: number) => Frame> = {
  // Hero: the camera breathes. Scroll barely registers.
  breathe: (p, t) => ({
    x: Math.sin(t * 0.21) * 0.22,
    y: Math.sin(t * 0.16 + 1.2) * 0.3 + p * 0.25,
    zoom: 0.12 + Math.sin(t * 0.13) * 0.06,
    rot: Math.sin(t * 0.09) * 0.18,
  }),
  // Gift / letter: a slow lean forward that accelerates late.
  push: (p, t) => {
    const eased = Math.pow(clamp01((p - 0.12) / 0.88), 1.7);
    return {
      x: Math.sin(t * 0.18) * 0.12,
      y: -eased * 0.34 + Math.sin(t * 0.14) * 0.14,
      zoom: eased,
      rot: Math.sin(t * 0.11) * 0.1,
    };
  },
  // Scrapbook: the camera trails the memory in view. Handled by the easing pass.
  follow: (p, t) => ({
    x: (p - 0.5) * 0.7 + Math.sin(t * 0.19) * 0.12,
    y: (p - 0.5) * -0.5,
    zoom: 0.2 + Math.sin(p * Math.PI) * 0.35,
    rot: (p - 0.5) * 0.4,
  }),
  // Beach: floating. Long, unsynchronised periods, nothing on the beat.
  float: (p, t) => ({
    x: Math.sin(t * 0.077) * 0.5,
    y: Math.sin(t * 0.052 + 0.8) * 0.45 + Math.sin(p * Math.PI) * -0.2,
    zoom: 0.18 + Math.sin(t * 0.041) * 0.14,
    rot: Math.sin(t * 0.033) * 0.22,
  }),
  // Ending: pulling away.
  pull: (p, t) => ({
    x: Math.sin(t * 0.12) * 0.1,
    y: p * 0.5,
    zoom: (1 - clamp01(p * 1.2)) * 0.6,
    rot: Math.sin(t * 0.07) * 0.08,
  }),
};

/** Where the element sits in its own scroll window: 0 entering, 1 leaving. */
function progressOf(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const span = rect.height + window.innerHeight;
  return clamp01((window.innerHeight - rect.top) / span);
}

/**
 * Attaches a scroll- and time-driven camera to a `.camera-rig` element.
 * Every frame is eased toward its target, so the camera never snaps and
 * never fully stops.
 */
export function useSceneCamera<T extends HTMLElement>(
  preset: CameraPreset = "breathe",
  options: { pointer?: number } = {},
) {
  const ref = useRef<T>(null);
  const pointerWeight = options.pointer ?? 0.35;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) {
      node.style.setProperty("--cam-zoom", "0");
      return;
    }
    initGsap();

    // Mobile keeps the same language at a smaller amplitude.
    const amp = isMobileViewport() ? 0.45 : 1;
    const usePointer = isFinePointer();
    const language = LANGUAGE[preset];

    const current: Frame = { x: 0, y: 0, zoom: 0, rot: 0 };
    const pointer = { x: 0, y: 0 };
    const start = performance.now();

    const onMove = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (usePointer) window.addEventListener("mousemove", onMove, { passive: true });

    const tick = () => {
      const rect = node.getBoundingClientRect();
      // Off-screen rigs cost nothing.
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      const t = (performance.now() - start) / 1000;
      const target = language(progressOf(node), t);

      if (usePointer) {
        target.x += pointer.x * pointerWeight;
        target.y += pointer.y * pointerWeight * 0.7;
        target.rot += pointer.x * pointerWeight * 0.4;
      }

      // Heavy easing: a real camera has mass.
      current.x += (target.x * amp - current.x) * 0.045;
      current.y += (target.y * amp - current.y) * 0.045;
      current.zoom += (target.zoom * amp - current.zoom) * 0.035;
      current.rot += (target.rot * amp - current.rot) * 0.04;

      node.style.setProperty("--cam-x", clamp(current.x, -1, 1).toFixed(4));
      node.style.setProperty("--cam-y", clamp(current.y, -1, 1).toFixed(4));
      node.style.setProperty("--cam-zoom", clamp01(current.zoom).toFixed(4));
      node.style.setProperty("--cam-rot", clamp(current.rot, -1, 1).toFixed(4));
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      if (usePointer) window.removeEventListener("mousemove", onMove);
    };
  }, [preset, pointerWeight]);

  return ref;
}

/**
 * Publishes one number the whole story can listen to: how far the reader has
 * travelled, 0 → 1, as `--story-progress` on <html>. Light, weather, wind and
 * music intensity all read from the same value so nothing drifts out of sync.
 */
export function useStoryProgress() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    initGsap();
    const root = document.documentElement;
    let value = 0;

    const tick = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const target = max > 0 ? clamp01(window.scrollY / max) : 0;
      // Lag the published value so downstream systems catch up, never lead.
      value += (target - value) * 0.08;
      root.style.setProperty("--story-progress", value.toFixed(4));
      root.dataset.storyPhase =
        value < 0.18 ? "morning" : value < 0.42 ? "midday" : value < 0.72 ? "golden" : "dusk";
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      delete root.dataset.storyPhase;
    };
  }, []);
}

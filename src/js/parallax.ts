/** The global depth system. One source of truth for how fast a layer moves. */
import { useEffect, useRef, type CSSProperties } from "react";

import { isFinePointer, prefersReducedMotion, rafThrottle } from "./utils";

export const LAYER_DEPTH = {
  sky: 0.05,
  clouds: 0.1,
  sun: 0.15,
  farMountains: 0.2,
  nearMountains: 0.35,
  ocean: 0.45,
  flowers: 0.6,
  foreground: 0.8,
  cursor: 1,
} as const;

export type LayerName = keyof typeof LAYER_DEPTH;

/** Style payload for a `.parallax-layer` element. */
export const depth = (layer: LayerName) =>
  ({ "--depth": LAYER_DEPTH[layer] }) as CSSProperties;

/**
 * Publishes the scene's scroll offset as `--scroll-y` on the scope element,
 * so every child `.parallax-layer` can translate by its own depth.
 */
export function useParallaxScope<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = rafThrottle(() => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--scroll-y", `${-rect.top * 0.12}px`);
    });

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      update.cancel();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return ref;
}

/**
 * A virtual camera driven by the pointer. Movement is capped at 3% of the
 * viewport by the `.camera-rig` utility — this only supplies -1..1 input.
 */
export function useCameraRig<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !isFinePointer() || prefersReducedMotion()) return;

    const move = rafThrottle((e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      node.style.setProperty("--cam-x", x.toFixed(3));
      node.style.setProperty("--cam-y", y.toFixed(3));
      node.style.setProperty("--cam-rot", (x * 0.4).toFixed(3));
    });

    window.addEventListener("mousemove", move);
    return () => {
      move.cancel();
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return ref;
}

/**
 * Paper reacting to the pointer: a 3D tilt capped at 3 degrees, with a
 * soft return to rest. Used by polaroids and framed images.
 */
export function usePointerTilt<T extends HTMLElement>(max = 3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !isFinePointer() || prefersReducedMotion()) return;

    node.style.transformStyle = "preserve-3d";
    node.style.transition = "transform 600ms var(--ease-story)";

    const move = rafThrottle((e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(900px) rotateY(${(x * max).toFixed(2)}deg) rotateX(${(-y * max).toFixed(2)}deg) translateZ(0)`;
    });

    const leave = () => {
      move.cancel();
      node.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
    };

    node.addEventListener("mousemove", move);
    node.addEventListener("mouseleave", leave);
    return () => {
      move.cancel();
      node.removeEventListener("mousemove", move);
      node.removeEventListener("mouseleave", leave);
    };
  }, [max]);

  return ref;
}

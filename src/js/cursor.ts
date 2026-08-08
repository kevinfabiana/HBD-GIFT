/** The custom cursor: a glowing dot with a ring that lags behind it. */
import { useEffect, useRef, useState } from "react";

import { isFinePointer } from "./utils";

export type Ripple = { id: number; x: number; y: number };

let rippleId = 0;

export function useCursor() {
  const dot = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    if (!isFinePointer()) return;
    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trail = { ...target };
    let frame = 0;

    const move = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target as HTMLElement | null;
      setHovering(Boolean(el?.closest("a, button, [data-hoverable]")));
    };

    const loop = () => {
      trail.x += (target.x - trail.x) * 0.14;
      trail.y += (target.y - trail.y) * 0.14;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const down = (e: MouseEvent) => {
      setPressed(true);
      setRipples((current) => [...current.slice(-4), { id: ++rippleId, x: e.clientX, y: e.clientY }]);
    };
    const up = () => setPressed(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  /** Ripples clean themselves up once their animation has played out. */
  useEffect(() => {
    if (!ripples.length) return;
    const timer = window.setTimeout(
      () => setRipples((current) => current.slice(1)),
      760,
    );
    return () => window.clearTimeout(timer);
  }, [ripples]);

  const ringSize = pressed ? 46 : hovering ? 54 : 34;

  return { dot, ring, enabled, hovering, pressed, ringSize, ripples };
}


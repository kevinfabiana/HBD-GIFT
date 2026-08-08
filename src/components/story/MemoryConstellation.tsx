import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/js/utils";

type Particle = {
  bx: number;
  by: number;
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  tone: number;
};

const LINK_DISTANCE = 130;

/**
 * Memory Constellation — one canvas layer sitting directly above the hero
 * gradient (z-index 1) and below the floating petals and text. Particles are
 * warm rose/white so they stay visible against the cream sky. No DOM nodes.
 */
export function MemoryConstellation({ count = 100 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let frame = 0;

    const pointer = { x: -9999, y: -9999, strength: 0, inside: false };
    // Parallax drift for the whole layer (max ~8px), eased toward the target.
    const shift = { x: 0, y: 0, tx: 0, ty: 0 };
    let fade = 1;

    const seed = (n: number) => {
      const s = Math.sin(n * 127.1) * 43758.5453;
      return s - Math.floor(s);
    };

    const build = () => {
      // Keep the constellation dense enough to actually link on tall screens.
      const total = Math.round(
        Math.min(180, Math.max(count, (width * height) / 14000)),
      );
      particles = Array.from({ length: total }, (_, i) => {
        const x = seed(i + 1) * width;
        const y = seed(i + 97) * height;
        return {
          bx: x,
          by: y,
          x,
          y,
          ox: 0,
          oy: 0,
          vx: (seed(i + 31) - 0.5) * 0.07,
          vy: (seed(i + 53) - 0.5) * 0.07,
          r: 1.2 + seed(i + 11) * 1.9,
          a: 0.42 + seed(i + 71) * 0.4,
          tone: seed(i + 7),
        };
      });
    };

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = Math.round(rect?.width ?? window.innerWidth);
      height = Math.round(rect?.height ?? window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    resize();

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.inside =
        pointer.x >= -40 &&
        pointer.y >= -40 &&
        pointer.x <= width + 40 &&
        pointer.y <= height + 40;
      shift.tx = ((pointer.x / Math.max(1, width)) * 2 - 1) * 8;
      shift.ty = ((pointer.y / Math.max(1, height)) * 2 - 1) * 8;
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      shift.tx = 0;
      shift.ty = 0;
    };

    const onScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const visible = Math.min(1, Math.max(0, (rect.bottom - 40) / Math.max(1, rect.height)));
      fade = visible * visible;
    };
    onScroll();

    const fill = (tone: number, alpha: number) => {
      if (tone > 0.66) return `rgba(214, 148, 176, ${alpha})`; // #f7dce9, deepened for cream
      if (tone > 0.33) return `rgba(246, 226, 232, ${alpha})`; // #fdf5f7
      return `rgba(255, 255, 255, ${alpha})`;
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * 0.05;
      shift.x += (shift.tx - shift.x) * 0.06;
      shift.y += (shift.ty - shift.y) * 0.06;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (fade <= 0.001) return;
      ctx.translate(shift.x, shift.y);

      for (const p of particles) {
        if (!reduced) {
          p.bx += p.vx;
          p.by += p.vy;
          if (p.bx < -20) p.bx = width + 20;
          if (p.bx > width + 20) p.bx = -20;
          if (p.by < -20) p.by = height + 20;
          if (p.by > height + 20) p.by = -20;
        }

        let tx = 0;
        let ty = 0;
        if (pointer.strength > 0.01) {
          const dx = p.bx - pointer.x;
          const dy = p.by - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.01 && d < 150) {
            const push = (1 - d / 150) * 14 * pointer.strength;
            tx = (dx / d) * push;
            ty = (dy / d) * push;
          }
        }
        p.ox += (tx - p.ox) * 0.05;
        p.oy += (ty - p.oy) * 0.05;
        p.x = p.bx + p.ox;
        p.y = p.by + p.oy;
      }

      // Constellation lines near the cursor, fading out once it leaves.
      if (pointer.strength > 0.02) {
        ctx.lineCap = "round";
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i += 1) {
          const a = particles[i];
          if (Math.hypot(a.x - pointer.x, a.y - pointer.y) > 190) continue;
          for (let j = i + 1; j < particles.length; j += 1) {
            const b = particles[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d > LINK_DISTANCE) continue;
            const mid = Math.hypot((a.x + b.x) / 2 - pointer.x, (a.y + b.y) / 2 - pointer.y);
            const near = 1 - mid / 210;
            if (near <= 0) continue;
            const alpha = (1 - d / LINK_DISTANCE) * near * 0.8 * pointer.strength * fade;
            ctx.strokeStyle = `rgba(190, 130, 158, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const alpha = p.a * fade;
        ctx.beginPath();
        ctx.fillStyle = fill(p.tone, alpha);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
      style={{ zIndex: 1 }}
    />
  );
}

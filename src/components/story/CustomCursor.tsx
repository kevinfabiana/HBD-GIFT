import { useCursor } from "@/js/cursor";

/** A glowing dot, a trailing ring, and a ripple on every click. */
export function CustomCursor() {
  const { dot, ring, enabled, hovering, ringSize, ripples } = useCursor();
  if (!enabled) return null;

  return (
    <div aria-hidden className="cursor-root">
      <span ref={dot} className="cursor-dot" />
      <span
        ref={ring}
        className={`cursor-ring ${hovering ? "cursor-ring-active" : ""}`}
        style={{ width: ringSize, height: ringSize }}
      />
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="cursor-ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </div>
  );
}

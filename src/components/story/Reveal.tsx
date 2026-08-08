import { useEffect, useRef, type ReactNode } from "react";

import { gsap, initGsap } from "@/js/gsap/masterTimeline";
import { prefersReducedMotion } from "@/js/utils";

/** Rises into place on first entry — GSAP driven, ScrollTrigger scheduled. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    initGsap();

    if (prefersReducedMotion()) {
      gsap.set(node, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(
      node,
      { opacity: 0, y: 34, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.3,
        delay: delay / 1000,
        ease: "power3.out",
        scrollTrigger: { trigger: node, start: "top 90%", once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal-root ${className}`}>
      {children}
    </div>
  );
}

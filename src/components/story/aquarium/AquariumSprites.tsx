/**
 * Dream Aquarium — the illustration set.
 *
 * Every living thing and every plant in the aquarium is drawn once here as a
 * tiny, reusable SVG so the scene stays light: no bitmaps, no video, and the
 * same sprite can be instanced dozens of times by the scene component.
 *
 * Palette is deliberately pastel and desaturated — pink, turquoise, lavender,
 * cream and deep blue — so nothing reads as cartoon.
 */

export type FishSpecies =
  | "clown"
  | "neonTetra"
  | "cardinalTetra"
  | "guppy"
  | "goldRam"
  | "angel"
  | "koi"
  | "glass"
  | "pastel"
  | "micro";

/** Species tuning used by both the drawing and the swimming behaviour. */
export const FISH_LOOK: Record<
  FishSpecies,
  { body: string; fin: string; accent: string; length: number; speed: number }
> = {
  clown: { body: "#f6c3a4", fin: "#fdeadd", accent: "#fff6ee", length: 46, speed: 1 },
  neonTetra: { body: "#a9dfe6", fin: "#d9f2f3", accent: "#f4b8c4", length: 30, speed: 1.25 },
  cardinalTetra: { body: "#e9b3bd", fin: "#f8dde2", accent: "#bfe3e8", length: 30, speed: 1.25 },
  guppy: { body: "#cbb8e6", fin: "#eadff6", accent: "#f7d9e2", length: 34, speed: 1.1 },
  goldRam: { body: "#efd7a8", fin: "#faeed3", accent: "#cfe6dd", length: 40, speed: 0.9 },
  angel: { body: "#e4e9f2", fin: "#f6f8fb", accent: "#c3d3e8", length: 44, speed: 0.75 },
  koi: { body: "#fbf3ea", fin: "#f7d3cc", accent: "#e9b3a4", length: 52, speed: 0.7 },
  glass: { body: "rgba(220,238,242,0.55)", fin: "rgba(240,250,252,0.5)", accent: "#cfeaf0", length: 34, speed: 1.15 },
  pastel: { body: "#bfe0da", fin: "#e6f4f0", accent: "#f2cdd8", length: 36, speed: 1 },
  micro: { body: "#d8e8f0", fin: "#eef6fa", accent: "#c9dfe8", length: 18, speed: 1.4 },
};

/** A single fish, drawn nose-first to the right so a scaleX flip turns it. */
export function Fish({ species }: { species: FishSpecies }) {
  const look = FISH_LOOK[species];

  if (species === "angel") {
    return (
      <svg viewBox="0 0 100 100" aria-hidden className="aq-fish__svg">
        <path d="M50 8 C 58 30 66 42 74 50 C 66 58 58 72 50 92 C 42 72 34 58 26 50 C 34 42 42 30 50 8Z" fill={look.fin} opacity="0.75" />
        <ellipse cx="50" cy="50" rx="20" ry="15" fill={look.body} />
        <path d="M30 50 L12 40 L14 60 Z" fill={look.fin} />
        <path d="M44 38 q 8 12 0 24" stroke={look.accent} strokeWidth="3" fill="none" opacity="0.8" />
        <circle cx="60" cy="46" r="2.6" fill="#4a5568" />
      </svg>
    );
  }

  if (species === "koi") {
    return (
      <svg viewBox="0 0 120 70" aria-hidden className="aq-fish__svg">
        <path d="M34 35 C 6 12 0 44 26 46 C 12 58 30 62 38 44Z" fill={look.fin} opacity="0.8" />
        <ellipse cx="70" cy="35" rx="34" ry="17" fill={look.body} />
        <path d="M74 22 q 12 4 16 13 q -12 -2 -16 -13Z" fill={look.accent} opacity="0.75" />
        <path d="M56 40 q 10 6 20 2" stroke={look.accent} strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M70 52 q 6 12 16 8" stroke={look.fin} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="96" cy="31" r="2.8" fill="#5a4a52" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 60" aria-hidden className="aq-fish__svg">
      <path d="M30 30 L6 16 L10 44 Z" fill={look.fin} opacity="0.85" />
      <ellipse cx="66" cy="30" rx="36" ry="16" fill={look.body} />
      <path d="M60 14 q 10 -10 20 -2 q -10 2 -20 2Z" fill={look.fin} opacity="0.9" />
      <path d="M60 46 q 10 10 20 2 q -10 -2 -20 -2Z" fill={look.fin} opacity="0.75" />
      <path d="M52 30 q 8 -8 8 0 q 0 8 -8 0Z" fill={look.accent} opacity="0.7" />
      <path d="M42 22 q 4 8 0 16" stroke={look.accent} strokeWidth="3" fill="none" opacity="0.55" />
      <circle cx="92" cy="26" r="2.6" fill="#4a5568" />
      <ellipse cx="90" cy="24.6" r="0.9" fill="#fff" rx="0.9" ry="0.9" />
    </svg>
  );
}

/** The centrepiece: one white betta with long, trailing fins. */
export function BettaFish({
  veilRef,
  tailRef,
}: {
  veilRef?: React.Ref<SVGGElement>;
  tailRef?: React.Ref<SVGGElement>;
}) {
  return (
    <svg viewBox="0 0 220 160" aria-hidden className="aq-fish__svg">
      <defs>
        <radialGradient id="aq-betta-body" cx="60%" cy="40%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f2f7fb" />
          <stop offset="100%" stopColor="#dfeaf3" />
        </radialGradient>
        <linearGradient id="aq-betta-veil" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="60%" stopColor="rgba(233,242,250,0.55)" />
          <stop offset="100%" stopColor="rgba(214,231,244,0.12)" />
        </linearGradient>
      </defs>

      <g ref={tailRef} style={{ transformOrigin: "62% 50%" }}>
        <path
          d="M96 80 C 60 26 8 30 14 76 C 4 100 26 132 60 118 C 44 142 82 148 96 96Z"
          fill="url(#aq-betta-veil)"
        />
        <path d="M92 80 C 66 44 32 44 34 78 C 28 100 48 118 72 106" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
      </g>

      <g ref={veilRef} style={{ transformOrigin: "60% 50%" }}>
        <path d="M112 62 C 128 22 168 20 176 44 C 150 40 128 48 116 70Z" fill="url(#aq-betta-veil)" />
        <path d="M112 100 C 124 138 164 146 176 122 C 148 124 128 116 116 94Z" fill="url(#aq-betta-veil)" />
      </g>

      <ellipse cx="140" cy="80" rx="46" ry="26" fill="url(#aq-betta-body)" />
      <path d="M150 60 q 22 4 30 16 q -20 0 -30 -16Z" fill="rgba(255,255,255,0.75)" />
      <path d="M124 86 q 18 10 36 4" stroke="rgba(196,216,232,0.7)" strokeWidth="2" fill="none" />
      <circle cx="172" cy="74" r="3.4" fill="#41505f" />
      <circle cx="170.6" cy="72.6" r="1.2" fill="#fff" />
    </svg>
  );
}

/** Slow, translucent jellyfish drift. */
export function Jellyfish() {
  return (
    <svg viewBox="0 0 80 130" aria-hidden className="aq-jelly__svg">
      <path d="M10 46 a30 30 0 0 1 60 0 q -30 12 -60 0Z" fill="rgba(233,214,240,0.55)" />
      <path d="M14 46 q 26 10 52 0" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" fill="none" />
      <g stroke="rgba(226,210,238,0.5)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M24 50 q -6 30 2 52" />
        <path d="M36 52 q 4 28 -2 50" />
        <path d="M48 52 q 8 26 0 46" />
        <path d="M58 50 q 10 24 4 44" />
      </g>
    </svg>
  );
}

/** A shy seahorse that occasionally crosses the scene. */
export function Seahorse() {
  return (
    <svg viewBox="0 0 60 110" aria-hidden>
      <path
        d="M30 12 q 14 2 12 18 q -2 14 -12 22 q -10 8 -8 22 q 2 14 14 12 q -6 8 -16 4 q -12 -6 -10 -22 q 2 -16 12 -24 q 8 -8 8 -18 q 0 -8 -8 -10Z"
        fill="#e6d6ea"
      />
      <path d="M30 12 q 8 -8 14 -2 q -6 0 -8 6Z" fill="#f0e2f2" />
      <circle cx="34" cy="22" r="2.2" fill="#5d5566" />
    </svg>
  );
}

/** Micro life: shrimp and snail. */
export function Shrimp() {
  return (
    <svg viewBox="0 0 60 34" aria-hidden>
      <path d="M46 12 q -20 -8 -32 6 q -8 10 4 12 q 14 2 28 -6Z" fill="rgba(246,205,214,0.85)" />
      <path d="M18 18 q -10 4 -14 -4" stroke="rgba(246,205,214,0.8)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g stroke="rgba(200,214,224,0.9)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M46 12 l10 -6 M46 14 l10 2" />
      </g>
      <circle cx="44" cy="14" r="1.6" fill="#6b5b63" />
    </svg>
  );
}

export function Snail() {
  return (
    <svg viewBox="0 0 54 40" aria-hidden>
      <path d="M6 32 q 10 6 24 2" stroke="#e3e9ef" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="20" r="14" fill="#f0dfd2" />
      <path d="M30 20 a8 8 0 1 0 6 -6 a5 5 0 1 1 -3 4" fill="none" stroke="#dcc4b2" strokeWidth="2.4" />
      <path d="M8 30 l-4 -8 M12 30 l-1 -9" stroke="#e3e9ef" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Aquascaping: tall plants, moss, grass, driftwood, rocks and corals. */
export function PlantTall({ tone = "#8fc9b6" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 120 300" aria-hidden preserveAspectRatio="none">
      <g fill="none" stroke={tone} strokeLinecap="round">
        <path d="M60 300 C 44 220 74 160 58 90 C 52 62 62 40 68 22" strokeWidth="9" opacity="0.85" />
        <path d="M60 300 C 82 230 46 170 70 108 C 84 74 78 50 74 34" strokeWidth="7" opacity="0.6" />
        <path d="M60 300 C 34 240 52 180 38 130 C 28 96 36 70 42 50" strokeWidth="6" opacity="0.5" />
      </g>
      <g fill={tone} opacity="0.35">
        <ellipse cx="58" cy="120" rx="16" ry="34" />
        <ellipse cx="74" cy="190" rx="13" ry="28" />
        <ellipse cx="42" cy="215" rx="12" ry="26" />
      </g>
    </svg>
  );
}

export function PlantGrass({ tone = "#9fd3c0" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden preserveAspectRatio="none">
      <g fill="none" stroke={tone} strokeWidth="4" strokeLinecap="round" opacity="0.75">
        <path d="M12 120 C 16 80 8 56 18 30" />
        <path d="M34 120 C 42 84 34 58 46 34" />
        <path d="M58 120 C 60 78 54 52 62 26" />
        <path d="M82 120 C 92 86 84 58 96 36" />
        <path d="M106 120 C 108 80 102 56 112 30" />
        <path d="M132 120 C 142 88 134 62 146 40" />
      </g>
    </svg>
  );
}

export function MossRock({ tone = "#c9d6de" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 200 110" aria-hidden preserveAspectRatio="none">
      <path d="M8 108 C 18 66 54 46 96 52 C 140 58 176 76 194 108Z" fill={tone} />
      <path d="M40 92 q 22 -22 52 -18 q -26 4 -52 18Z" fill="rgba(255,255,255,0.25)" />
      <g fill="#8fc0ab" opacity="0.55">
        <ellipse cx="70" cy="60" rx="24" ry="10" />
        <ellipse cx="128" cy="70" rx="28" ry="11" />
      </g>
    </svg>
  );
}

export function Driftwood() {
  return (
    <svg viewBox="0 0 260 140" aria-hidden preserveAspectRatio="none">
      <path
        d="M4 132 C 60 122 92 96 128 76 C 158 60 196 54 250 58 C 200 74 176 82 146 100 C 112 120 62 136 4 132Z"
        fill="#c8a98f"
        opacity="0.9"
      />
      <path d="M120 84 C 150 62 176 40 214 24" stroke="#c8a98f" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M60 118 C 82 104 96 92 112 84" stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none" />
    </svg>
  );
}

export function Coral({ tone = "#f2c4d2", variant = 0 }: { tone?: string; variant?: number }) {
  if (variant % 3 === 1) {
    return (
      <svg viewBox="0 0 160 160" aria-hidden preserveAspectRatio="none">
        <g fill="none" stroke={tone} strokeWidth="9" strokeLinecap="round" opacity="0.8">
          <path d="M80 158 C 78 120 60 108 52 82" />
          <path d="M80 158 C 84 118 104 106 112 78" />
          <path d="M80 130 C 66 112 44 108 30 96" />
          <path d="M80 126 C 96 108 120 104 134 92" />
        </g>
        <g fill={tone} opacity="0.5">
          <circle cx="52" cy="78" r="10" />
          <circle cx="112" cy="74" r="11" />
          <circle cx="30" cy="92" r="8" />
          <circle cx="134" cy="88" r="8" />
        </g>
      </svg>
    );
  }
  if (variant % 3 === 2) {
    return (
      <svg viewBox="0 0 160 160" aria-hidden preserveAspectRatio="none">
        <g fill={tone} opacity="0.55">
          <ellipse cx="52" cy="112" rx="20" ry="46" />
          <ellipse cx="82" cy="98" rx="18" ry="58" />
          <ellipse cx="112" cy="118" rx="16" ry="42" />
        </g>
        <g stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none">
          <path d="M52 150 v-70 M82 152 v-88 M112 150 v-62" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 160" aria-hidden preserveAspectRatio="none">
      <path
        d="M80 158 C 62 130 34 128 26 100 C 20 78 44 68 56 84 C 52 56 74 44 86 62 C 92 40 122 44 122 68 C 138 74 138 104 118 112 C 104 120 96 138 80 158Z"
        fill={tone}
        opacity="0.6"
      />
      <g fill="rgba(255,255,255,0.4)">
        <circle cx="60" cy="92" r="4" />
        <circle cx="88" cy="74" r="3.4" />
        <circle cx="110" cy="96" r="3" />
      </g>
    </svg>
  );
}

/** A drifting leaf, used sparsely in the mid layers. */
export function FloatingLeaf({ tone = "#b9d8c6" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 60 30" aria-hidden>
      <path d="M2 16 C 18 0 46 0 58 12 C 42 28 16 28 2 16Z" fill={tone} opacity="0.75" />
      <path d="M6 16 C 22 12 42 12 56 13" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

/** A shell that opens now and then, releasing one sparkle. */
export function Shell({ lidRef }: { lidRef?: React.Ref<SVGGElement> }) {
  return (
    <svg viewBox="0 0 90 60" aria-hidden>
      <path d="M6 52 C 10 30 26 20 45 20 C 64 20 80 30 84 52Z" fill="#e7d8e4" />
      <g ref={lidRef} style={{ transformOrigin: "50% 88%" }}>
        <path d="M6 52 C 10 32 26 22 45 22 C 64 22 80 32 84 52 C 60 44 30 44 6 52Z" fill="#f4e9f1" />
        <path d="M20 46 q 25 -14 50 0" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" fill="none" />
      </g>
      <circle cx="45" cy="50" r="4" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

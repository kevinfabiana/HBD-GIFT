/** Time-of-day palette keyframes for the continuous beach world. */
export type Phase = {
  at: number;
  label: string;
  skyTop: string;
  skyMid: string;
  skyLow: string;
  light: string;
  farMtn: string;
  midMtn: string;
  nearMtn: string;
  oceanFar: string;
  oceanNear: string;
  foam: string;
  shore: string;
  land: string;
  ink: string;
  star: number;
  bloom: number;
  glow: string;
};

export const PHASES: Phase[] = [
  {
    at: 0,
    label: "morning",
    skyTop: "#dfe9f4",
    skyMid: "#fbeee4",
    skyLow: "#fdf6ec",
    light: "#ffe9cf",
    farMtn: "#cdd8e6",
    midMtn: "#c3cfdd",
    nearMtn: "#b3c0cf",
    oceanFar: "#bcd2df",
    oceanNear: "#a8c3d3",
    foam: "#fbf4ea",
    shore: "#f2e2cd",
    land: "#e6d2b6",
    ink: "#4a4038",
    star: 0,
    bloom: 0.15,
    glow: "#ffd9b0",
  },
  {
    at: 0.18,
    label: "late morning",
    skyTop: "#cfe1f2",
    skyMid: "#eaf1f7",
    skyLow: "#fdf8f0",
    light: "#fff3dc",
    farMtn: "#c6d5e6",
    midMtn: "#b7c8da",
    nearMtn: "#a3b6c9",
    oceanFar: "#96c3de",
    oceanNear: "#74a9c8",
    foam: "#fdf8f1",
    shore: "#f4e5d0",
    land: "#e8d5ba",
    ink: "#463c34",
    star: 0,
    bloom: 0.55,
    glow: "#ffeccb",
  },
  {
    at: 0.36,
    label: "afternoon",
    skyTop: "#a8cfef",
    skyMid: "#e6eef6",
    skyLow: "#fdf6ea",
    light: "#fff6e2",
    farMtn: "#b4cce6",
    midMtn: "#9ab6d2",
    nearMtn: "#7f9dba",
    oceanFar: "#84bcdb",
    oceanNear: "#5f9dc2",
    foam: "#fefaf3",
    shore: "#f3e2ca",
    land: "#e7d2b3",
    ink: "#443a32",
    star: 0,
    bloom: 1,
    glow: "#fff0cd",
  },
  {
    at: 0.54,
    label: "golden hour",
    skyTop: "#f3cdb2",
    skyMid: "#fadfc4",
    skyLow: "#fceedd",
    light: "#ffd9a0",
    farMtn: "#e0c3b6",
    midMtn: "#cdaba1",
    nearMtn: "#b3908a",
    oceanFar: "#d9b8a6",
    oceanNear: "#c19c8f",
    foam: "#fdeedd",
    shore: "#f0d7b8",
    land: "#e0c39f",
    ink: "#4d3a31",
    star: 0,
    bloom: 0.95,
    glow: "#ffc98a",
  },
  {
    at: 0.68,
    label: "sunset",
    skyTop: "#a98cb5",
    skyMid: "#e6a999",
    skyLow: "#f6c9a6",
    light: "#ff9f74",
    farMtn: "#9d85a3",
    midMtn: "#83698c",
    nearMtn: "#66516f",
    oceanFar: "#b98c8d",
    oceanNear: "#8d6a76",
    foam: "#f2cdb4",
    shore: "#d9b193",
    land: "#bb9179",
    ink: "#3b2c33",
    star: 0.1,
    bloom: 0.7,
    glow: "#ff9e70",
  },
  {
    at: 0.82,
    label: "blue hour",
    skyTop: "#4b5a86",
    skyMid: "#7c85ab",
    skyLow: "#b0a6b8",
    light: "#cbb6d6",
    farMtn: "#5b658c",
    midMtn: "#48507199",
    nearMtn: "#343a56",
    oceanFar: "#57638c",
    oceanNear: "#3f4a6e",
    foam: "#c9c6db",
    shore: "#8f8798",
    land: "#6f6879",
    ink: "#efeaf2",
    star: 0.55,
    bloom: 0.35,
    glow: "#c3b2e0",
  },
  {
    at: 1,
    label: "night",
    skyTop: "#1a1e3c",
    skyMid: "#2b2b52",
    skyLow: "#4a3f63",
    light: "#e8e2f6",
    farMtn: "#2c3055",
    midMtn: "#222647",
    nearMtn: "#171a34",
    oceanFar: "#242a4e",
    oceanNear: "#1a1f3c",
    foam: "#8f8bb8",
    shore: "#4a4361",
    land: "#332e49",
    ink: "#f2eef8",
    star: 1,
    bloom: 0.2,
    glow: "#dcd2f7",
  },
];

const hex = (c: string) => {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
};

export type Sky = Omit<Phase, "at" | "label"> & { label: string };

/** Continuous interpolation across the day. */
export function skyAt(p: number): Sky {
  let i = 0;
  while (i < PHASES.length - 2 && p > PHASES[i + 1].at) i++;
  const a = PHASES[i];
  const b = PHASES[i + 1];
  const t = Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at)));
  const e = t * t * (3 - 2 * t);
  return {
    label: e < 0.5 ? a.label : b.label,
    skyTop: mix(a.skyTop, b.skyTop, e),
    skyMid: mix(a.skyMid, b.skyMid, e),
    skyLow: mix(a.skyLow, b.skyLow, e),
    light: mix(a.light, b.light, e),
    farMtn: mix(a.farMtn, b.farMtn, e),
    midMtn: mix(a.midMtn.slice(0, 7), b.midMtn.slice(0, 7), e),
    nearMtn: mix(a.nearMtn, b.nearMtn, e),
    oceanFar: mix(a.oceanFar, b.oceanFar, e),
    oceanNear: mix(a.oceanNear, b.oceanNear, e),
    foam: mix(a.foam, b.foam, e),
    shore: mix(a.shore, b.shore, e),
    land: mix(a.land, b.land, e),
    ink: mix(a.ink, b.ink, e),
    glow: mix(a.glow, b.glow, e),
    star: a.star + (b.star - a.star) * e,
    bloom: a.bloom + (b.bloom - a.bloom) * e,
  };
}

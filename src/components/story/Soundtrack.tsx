import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { story } from "@/data/story";
import { tracks } from "@/data/tracks";
import { ParticleHeading } from "./ParticleHeading";
import { chime } from "@/js/audio";

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export function Soundtrack() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [changing, setChanging] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const coverRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const track = tracks[index];

  const select = (i: number) => {
    if (i === index) return;
    setChanging(true);
    // Artwork tilts and the words fade while the record is swapped.
    if (coverRef.current) {
      gsap.to(coverRef.current, {
        rotate: 26,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
    if (textRef.current) {
      gsap.to(textRef.current, { autoAlpha: 0.15, duration: 0.4, ease: "power2.out" });
    }
    window.setTimeout(() => {
      setIndex(i);
      setChanging(false);
      setTime(0);
      setDuration(0);
      if (coverRef.current) {
        gsap.fromTo(
          coverRef.current,
          { rotate: -14, scale: 0.94 },
          { rotate: 0, scale: 1, duration: 0.9, ease: "power3.out" },
        );
      }
      if (textRef.current) {
        gsap.to(textRef.current, { autoAlpha: 1, duration: 0.7, ease: "power2.out" });
      }
    }, 520);
  };

  // Load the newly selected record, and keep playing if the deck was running.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.load();
    if (playing) void el.play().catch(() => setPlaying(false));
  }, [index]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      chime(660);
      void el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [playing]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
    el.style.setProperty("--hl-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--hl-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const progress = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <section
      className="paper-grain camera-breathing relative overflow-hidden px-6 py-28 sm:py-36"
      style={{ background: "var(--sand)" }}
    >
      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: playing
            ? "radial-gradient(60% 50% at 50% 55%, color-mix(in oklab, var(--lavender) 44%, transparent), transparent 72%)"
            : "radial-gradient(60% 50% at 50% 55%, color-mix(in oklab, var(--lavender) 14%, transparent), transparent 72%)",
          transition: "background 1600ms var(--ease-story)",
        }}
      />
      {/* particles that drift with the beat */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full"
            style={{
              left: `${(i * 53) % 98}%`,
              top: `${(i * 31) % 92}%`,
              width: 5 + (i % 3) * 3,
              height: 5 + (i % 3) * 3,
              background: "color-mix(in oklab, var(--lavender) 70%, white)",
              opacity: playing ? 0.55 : 0.22,
              filter: "blur(1px)",
              animation: `breathe ${playing ? 2.4 + (i % 4) * 0.35 : 9}s var(--ease-story) ${i * 0.2}s infinite`,
              transition: "opacity 1200ms var(--ease-story)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <ParticleHeading
          eyebrow={story.soundtrack.eyebrow}
          title={story.soundtrack.title}
          accent={story.soundtrack.accent}
        />

        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={() => {
            if (cardRef.current) cardRef.current.style.transform = "";
          }}
          data-hoverable
          className="glass-card relative mt-6 overflow-hidden p-8 transition-transform duration-500 md:p-12"
          style={{ transitionTimingFunction: "var(--ease-story)" }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(36% 46% at var(--hl-x, 50%) var(--hl-y, 40%), color-mix(in oklab, white 55%, transparent), transparent 70%)",
            }}
          />

          <div className="relative grid gap-12 md:grid-cols-[280px_1fr] md:items-center">
            {/* vinyl / cassette deck */}
            <div className="relative mx-auto h-[260px] w-[260px]">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--indigo) 88%, black) 32%, color-mix(in oklab, var(--indigo) 70%, transparent) 33%, color-mix(in oklab, var(--indigo) 82%, black) 100%)",
                  boxShadow: "var(--shadow-lift)",
                  animation: playing ? "vinyl-spin 6.5s linear infinite" : undefined,
                }}
              />
              <img
                ref={coverRef}
                src={track.cover}
                alt={`Cover art for ${track.title}`}
                width={512}
                height={512}
                loading="lazy"
                className="absolute left-1/2 top-1/2 h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
                style={{
                  filter: changing ? "blur(14px)" : "blur(0px)",
                  opacity: changing ? 0.25 : 1,
                  transition:
                    "filter 520ms var(--ease-story), opacity 520ms var(--ease-story)",
                  animation: playing && !changing ? "vinyl-spin 6.5s linear infinite" : undefined,
                }}
              />
              {/* tonearm */}
              <span
                aria-hidden
                className="absolute right-[-6px] top-3 h-[136px] w-[6px] origin-top rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, var(--rose-gold), color-mix(in oklab, var(--sand) 80%, white))",
                  transform: `rotate(${playing ? 26 : 6}deg)`,
                  transition: "transform 1400ms var(--ease-story)",
                  boxShadow: "var(--shadow-soft)",
                }}
              />
            </div>

            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.38em] text-muted-foreground">
                now {playing ? "playing" : "resting"}
              </p>
              <div ref={textRef}>
                <h3 className="mt-4 text-3xl leading-snug">{track.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{track.artist}</p>
                <p className="hand mt-6 max-w-sm text-2xl" style={{ color: "var(--dusty-purple)" }}>
                  {track.reason}
                </p>
              </div>

              {/* soft-line visualizer */}
              <div className="mt-8 flex h-12 items-end gap-[6px]">
                {Array.from({ length: 22 }).map((_, i) => (
                  <span
                    key={i}
                    className="block flex-1 rounded-full"
                    style={{
                      height: `${18 + ((i * 37) % 30)}px`,
                      background:
                        "linear-gradient(180deg, color-mix(in oklab, var(--lavender) 90%, white), color-mix(in oklab, var(--rose-gold) 70%, transparent))",
                      opacity: playing ? 0.9 : 0.25,
                      transformOrigin: "bottom",
                      animation: playing
                        ? `wave-breathe ${1.1 + (i % 5) * 0.22}s var(--ease-story) ${i * 0.06}s infinite`
                        : undefined,
                      transition: "opacity 900ms var(--ease-story)",
                    }}
                  />
                ))}
              </div>

              {/* seek + time */}
              <div className="mt-6 max-w-sm">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={time}
                  aria-label="Seek"
                  data-hoverable
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setTime(next);
                    if (audioRef.current) audioRef.current.currentTime = next;
                  }}
                  className="h-[6px] w-full cursor-pointer appearance-none rounded-full"
                  style={{
                    background: `linear-gradient(90deg, color-mix(in oklab, var(--dusty-purple) 70%, white) ${progress}%, color-mix(in oklab, var(--sand) 70%, white) ${progress}%)`,
                  }}
                />
                <div className="mt-2 flex items-center justify-between text-[0.66rem] uppercase tracking-[0.24em] text-muted-foreground">
                  <span>{fmt(time)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  data-hoverable
                  onClick={() => setPlaying((p) => !p)}
                  className="btn-ribbon"
                >
                  {playing ? "pause" : "play"}
                </button>
                <label className="flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">
                  volume
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    aria-label="Volume"
                    data-hoverable
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="h-[6px] w-24 cursor-pointer appearance-none rounded-full"
                    style={{
                      background: `linear-gradient(90deg, color-mix(in oklab, var(--dusty-purple) 70%, white) ${volume * 100}%, color-mix(in oklab, var(--sand) 70%, white) ${volume * 100}%)`,
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {tracks.map((t, i) => (
            <li key={t.title}>
              <button
                type="button"
                data-hoverable
                onClick={() => select(i)}
                className="story-card flex w-full items-center gap-5 p-4 text-left"
                style={{
                  opacity: i === index ? 1 : 0.78,
                  boxShadow:
                    i === index
                      ? "0 0 0 1px color-mix(in oklab, var(--lavender) 55%, transparent), 0 18px 40px -28px color-mix(in oklab, var(--dusty-purple) 70%, transparent)"
                      : undefined,
                  transition: "opacity 600ms var(--ease-story), box-shadow 600ms var(--ease-story)",
                }}
              >
                <img
                  src={t.cover}
                  alt=""
                  width={512}
                  height={512}
                  loading="lazy"
                  className="h-14 w-14 rounded-full object-cover transition-transform duration-700 hover:rotate-[18deg]"
                />
                <span className="min-w-0">
                  <span
                    className="block truncate text-lg"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {t.title}
                  </span>
                  <span className="block truncate text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                    {t.reason}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { melody } from "@/data/melody";
import { Petals } from "@/components/story/Petals";
import { gsap, initGsap } from "@/js/gsap/masterTimeline";
import { prefersReducedMotion } from "@/js/utils";

import melodyThumb from "@/assets/illustrations/melody-thumb.jpg";

function time(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * The emotional bridge between the beach ending and the aquarium.
 * A handwritten note, an original instrumental, and light that slowly
 * cools from warm cream into the first blue of deep water.
 */
export function OneMoreMelody() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimer = useRef<number>(0);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controls, setControls] = useState(true);
  const [missing, setMissing] = useState(false);

  /* Title + subtitle: a soft fade and a slow rise, nothing more. */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || prefersReducedMotion()) return;
    initGsap();

    const targets = [iconRef.current, titleRef.current, subtitleRef.current].filter(
      Boolean,
    ) as HTMLElement[];

    const tl = gsap.timeline({
      scrollTrigger: { trigger: node, start: "top 72%", once: true },
    });
    tl.fromTo(
      targets,
      { opacity: 0, y: 34, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.5,
        ease: "power3.out",
        stagger: 0.24,
      },
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  /* Warm light cools toward the aquarium as the section leaves the screen. */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const onScroll = () => {
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const enter = Math.min(1, Math.max(0, 1 - r.top / vh));
      const dive = Math.min(1, Math.max(0, 1 - (r.bottom - vh * 0.15) / (r.height || 1)));
      node.style.setProperty("--melody-light", enter.toFixed(3));
      node.style.setProperty("--melody-dive", dive.toFixed(3));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const wake = useCallback(() => {
    setControls(true);
    window.clearTimeout(idleTimer.current);
    if (videoRef.current && !videoRef.current.paused) {
      idleTimer.current = window.setTimeout(() => setControls(false), 2400);
    }
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    if (v.paused) {
      setLoading(true);
      void v.play().catch(() => {
        setLoading(false);
        setMissing(true);
      });
    } else {
      v.pause();
    }
  }, []);

  const seek = (e: React.MouseEvent<HTMLButtonElement>) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
  };

  /* Music notes that only exist while the song does. */
  const notes = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        glyph: ["♪", "♫", "♩", "♬"][i % 4],
        left: 6 + ((i * 11.3) % 88),
        delay: (i * 1.4) % 9,
        duration: 12 + ((i * 3) % 7),
        size: 0.75 + ((i % 3) * 0.28),
      })),
    [],
  );

  const bubbles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: (i * 8.7 + 4) % 96,
        size: 4 + ((i * 5) % 11),
        delay: (i * 1.1) % 8,
        duration: 9 + ((i * 2.6) % 8),
      })),
    [],
  );

  return (
    <section
      ref={sectionRef}
      className="melody paper-grain"
      aria-labelledby="melody-title"
      data-playing={playing}
      style={{ ["--melody-light" as string]: 0, ["--melody-dive" as string]: 0 }}
    >
      <div aria-hidden className="melody__sun" />
      <div aria-hidden className="melody__cool" />

      <div aria-hidden className="melody__petals">
        <Petals count={9} tone="blush" />
      </div>

      <div aria-hidden className="melody__sparks">
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 6.4 + 3) % 97}%`,
              animationDelay: `${(i * 1.3) % 11}s`,
              animationDuration: `${13 + ((i * 2.2) % 9)}s`,
            }}
          />
        ))}
      </div>

      <div aria-hidden className="melody__notes">
        {notes.map((n, i) => (
          <span
            key={i}
            style={{
              left: `${n.left}%`,
              fontSize: `${n.size}rem`,
              animationDelay: `${n.delay}s`,
              animationDuration: `${n.duration}s`,
            }}
          >
            {n.glyph}
          </span>
        ))}
      </div>

      <div aria-hidden className="melody__bubbles">
        {bubbles.map((b, i) => (
          <span
            key={i}
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="melody__inner">
        <span ref={iconRef} className="melody__icon" aria-hidden>
          {melody.eyebrow}
        </span>

        <h2 ref={titleRef} id="melody-title" className="melody__title">
          {melody.title}
        </h2>

        <p ref={subtitleRef} className="melody__subtitle">
          {melody.subtitle}
        </p>

        <div className="melody__player">
          <div
            className="melody__stage"
            data-started={started && !missing}
            data-controls={controls || !playing}
            onMouseMove={wake}
            onMouseLeave={() => playing && setControls(false)}
          >
            <video
              ref={videoRef}
              className="melody__video"
              src={melody.src}
              poster={melodyThumb}
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onWaiting={() => setLoading(true)}
              onPlaying={() => setLoading(false)}
              onCanPlay={() => setLoading(false)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setCurrent(v.currentTime);
                setProgress(v.duration ? v.currentTime / v.duration : 0);
              }}
              onPlay={() => {
                setPlaying(true);
                wake();
              }}
              onPause={() => {
                setPlaying(false);
                setControls(true);
              }}
              onEnded={() => {
                setPlaying(false);
                setControls(true);
              }}
              onError={() => {
                setLoading(false);
                setMissing(true);
              }}
            />
            <img
              aria-hidden
              className="melody__poster"
              src={melodyThumb}
              alt=""
              width={1600}
              height={912}
              loading="lazy"
            />

            {loading && !missing && (
              <span aria-hidden className="melody__loader">
                <span />
                <span />
                <span />
              </span>
            )}

            {!playing && (
              <button
                type="button"
                data-hoverable
                className="melody__play"
                onClick={toggle}
                aria-label={started ? "Resume the melody" : "Play the melody"}
              >
                <span aria-hidden className="melody__play-ring" />
                <svg width="20" height="22" viewBox="0 0 22 24" aria-hidden fill="currentColor">
                  <path d="M2 2.6c0-1.2 1.3-2 2.4-1.4l15 9.4a1.6 1.6 0 0 1 0 2.8l-15 9.4A1.6 1.6 0 0 1 2 21.4Z" />
                </svg>
              </button>
            )}

            <div className="melody__controls">
              <button
                type="button"
                data-hoverable
                className="melody__ctl"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? "❚❚" : "▶"}
              </button>
              <button
                type="button"
                className="melody__scrub"
                onClick={seek}
                aria-label="Seek through the melody"
              >
                <span style={{ width: `${progress * 100}%` }} />
              </button>
              <span className="melody__time">
                {time(current)} / {time(duration)}
              </span>
              <button
                type="button"
                data-hoverable
                className="melody__ctl"
                aria-label={muted ? "Unmute" : "Mute"}
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.muted = !v.muted;
                  setMuted(v.muted);
                }}
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <button
                type="button"
                data-hoverable
                className="melody__ctl"
                aria-label="Fullscreen"
                onClick={() => void videoRef.current?.requestFullscreen?.().catch(() => {})}
              >
                ⛶
              </button>
            </div>
          </div>
        </div>

        <p className="melody__hint">{missing ? melody.missingHint : melody.playHint}</p>

        <article className="melody__note" data-glow={playing} data-hoverable>
          <span aria-hidden className="melody__tape" />
          <svg
            aria-hidden
            className="melody__flower"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          >
            <path d="M24 44V26" />
            <path d="M24 33c-5 0-8-2.4-9.4-6.2 3.8-1.2 7.6.4 9.4 6.2Z" />
            <path d="M24 30c4.6-.6 7.2-3.2 8-7.2-3.9-.6-7.2 1.6-8 7.2Z" />
            <circle cx="24" cy="16" r="4.4" />
            <path d="M24 11.6c.8-3 2.8-4.6 5.4-4.6-.2 3-2.2 4.8-5.4 4.6Z" />
            <path d="M19.6 13.2c-2.6-1.4-3.6-3.6-3-6.2 2.8.8 4.2 3 3 6.2Z" />
            <path d="M28.4 13.2c2.6-1.4 3.6-3.6 3-6.2-2.8.8-4.2 3-3 6.2Z" />
          </svg>

          <h3 className="melody__note-title">{melody.note.title}</h3>
          <span aria-hidden className="melody__rule" />

          <div className="melody__note-body">
            {melody.note.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <span className="melody__note-sign">{melody.note.signature}</span>
        </article>

        <span aria-hidden className="melody__coda">
          ♪ ─ ♫ ─ ♪
        </span>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

import { story } from "@/data/story";
import guitarStage from "@/assets/illustrations/guitar-stage.jpg";

/** Drop the recording at public/media/guitar-song.mp4 to replace the placeholder. */
const SONG_SRC = "/media/guitar-song.mp4";

function time(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * The emotional bridge: after the songs someone else wrote, one that was
 * played for her. A private performance, not a media player.
 */
export function GuitarSerenade() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimer = useRef<number>(0);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controls, setControls] = useState(true);
  const [note, setNote] = useState(false);
  const [missing, setMissing] = useState(false);

  /* The spotlight rises as the scene enters — light before title. */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const onScroll = () => {
      const r = node.getBoundingClientRect();
      const p = 1 - Math.min(1, Math.max(0, r.top / window.innerHeight));
      node.style.setProperty("--guitar-light", (p * p).toFixed(3));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Everything else quiets down while the song is playing. */
  useEffect(() => {
    const root = document.documentElement;
    if (playing) root.dataset.performance = "on";
    else delete root.dataset.performance;
    return () => {
      delete root.dataset.performance;
    };
  }, [playing]);

  const wake = useCallback(() => {
    setControls(true);
    window.clearTimeout(idleTimer.current);
    if (videoRef.current && !videoRef.current.paused) {
      idleTimer.current = window.setTimeout(() => setControls(false), 2200);
    }
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    if (v.paused) void v.play().catch(() => setMissing(true));
    else v.pause();
  }, []);

  const seek = (e: React.MouseEvent<HTMLButtonElement>) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
  };

  /* A tiny 3D tilt — the frame is an object on a table, not a div. */
  const tilt = (e: React.MouseEvent) => {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1200px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3.6).toFixed(2)}deg) translateZ(0)`;
  };

  return (
    <section
      ref={sectionRef}
      className="guitar paper-grain"
      aria-labelledby="guitar-title"
      style={{ ["--guitar-light" as string]: 0 }}
    >
      <div aria-hidden className="guitar__spot" />
      <div className="guitar__inner">
        <p className="guitar__eyebrow">{story.guitar.eyebrow}</p>
        <h2 id="guitar-title" className="guitar__title">
          {story.guitar.title}
          <span className="block italic" style={{ color: "var(--dusty-purple)" }}>
            {story.guitar.accent}
          </span>
        </h2>
        <p className="guitar__subtitle">{story.guitar.subtitle}</p>

        <div
          ref={frameRef}
          className="guitar__frame"
          onMouseMove={tilt}
          onMouseLeave={() => {
            if (frameRef.current) frameRef.current.style.transform = "";
          }}
        >
          <div
            className="guitar__stage"
            data-started={started && !missing}
            data-controls={controls || !playing}
            onMouseMove={wake}
            onMouseLeave={() => playing && setControls(false)}
          >
            <video
              ref={videoRef}
              className="guitar__video"
              src={SONG_SRC}
              poster={guitarStage}
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setCurrent(v.currentTime);
                setProgress(v.duration ? v.currentTime / v.duration : 0);
              }}
              onPlay={() => {
                setPlaying(true);
                setNote(false);
                wake();
              }}
              onPause={() => {
                setPlaying(false);
                setControls(true);
              }}
              onEnded={() => {
                setPlaying(false);
                setControls(true);
                // Let the last chord hang in the room before anything speaks.
                window.setTimeout(() => setNote(true), 2600);
              }}
              onError={() => setMissing(true)}
            />
            <img
              aria-hidden
              className="guitar__poster"
              src={guitarStage}
              alt=""
              width={1600}
              height={912}
              loading="lazy"
            />

            {!playing && (
              <button
                type="button"
                data-hoverable
                className="guitar__play"
                onClick={toggle}
                aria-label={started ? "Resume the song" : "Play the song"}
              >
                <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden fill="currentColor">
                  <path d="M2 2.6c0-1.2 1.3-2 2.4-1.4l15 9.4a1.6 1.6 0 0 1 0 2.8l-15 9.4A1.6 1.6 0 0 1 2 21.4Z" />
                </svg>
              </button>
            )}

            <div className="guitar__controls">
              <button
                type="button"
                data-hoverable
                className="guitar__ctl"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? "❚❚" : "▶"}
              </button>
              <button
                type="button"
                className="guitar__scrub"
                onClick={seek}
                aria-label="Seek through the song"
              >
                <span style={{ width: `${progress * 100}%` }} />
              </button>
              <span className="guitar__time">
                {time(current)} / {time(duration)}
              </span>
              <button
                type="button"
                data-hoverable
                className="guitar__ctl"
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
                className="guitar__ctl"
                aria-label="Play from the beginning"
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.currentTime = 0;
                  void v.play().catch(() => setMissing(true));
                }}
              >
                ↺
              </button>
              <button
                type="button"
                data-hoverable
                className="guitar__ctl"
                aria-label="Fullscreen"
                onClick={() => void videoRef.current?.requestFullscreen?.().catch(() => {})}
              >
                ⛶
              </button>
            </div>
          </div>
        </div>

        <p className="guitar__caption">
          {missing ? story.guitar.missingCaption : story.guitar.playingCaption}
        </p>

        <div className="guitar__note" data-visible={note} aria-live="polite">
          <p>
            {story.guitar.note.split(" ").map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="guitar__note-word"
                style={{ animationDelay: `${i * 110}ms`, marginRight: "0.32em" }}
              >
                {word}
              </span>
            ))}
          </p>
          <span className="guitar__signature">{story.guitar.signature}</span>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { useSceneCamera } from "@/js/gsap/camera";

import { story } from "@/data/story";
import { memories, type Memory } from "@/data/memories";
import { pageSound, paperSound, pencilSound, tapeSound } from "@/js/audio";
import { PHOTO_DROP, photoDelay } from "@/js/gsap/scrapbookTimeline";

/** One photograph: drops in, tapes itself down, opens its story on click. */
function PhotoCard({
  memory,
  index,
  onOpen,
}: {
  memory: Memory;
  index: number;
  onOpen: (memory: Memory, secret: boolean) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [dropped, setDropped] = useState(false);
  const clicks = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        window.setTimeout(() => {
          setDropped(true);
          paperSound();
          window.setTimeout(tapeSound, PHOTO_DROP.tapeAt);
          window.setTimeout(pencilSound, PHOTO_DROP.captionAt);
        }, photoDelay(index));
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [index]);

  const handleClick = () => {
    clicks.current += 1;
    pageSound();
    onOpen(memory, Boolean(memory.secret) && clicks.current >= 5);
  };

  return (
    <article className={memory.offset}>
      <button
        ref={ref}
        type="button"
        data-hoverable
        onClick={handleClick}
        aria-label={`Open memory: ${memory.caption}`}
        className={`group relative block w-full text-left ${dropped ? "photo-dropping" : "opacity-0"}`}
        style={{ ["--rot" as string]: `${memory.rotation}deg` }}
      >
        <span
          aria-hidden
          className={`photo-shadow absolute inset-x-6 bottom-1 -z-10 block h-8 ${dropped ? "photo-shadow-settling" : ""}`}
        />
        <figure className="polaroid block group-hover:-translate-y-2 group-hover:brightness-[1.04]">
          <img
            src={memory.src}
            alt={memory.alt}
            width={768}
            height={768}
            loading="lazy"
            className="polaroid-photo"
          />
          <figcaption className="hand block py-4 text-center text-xl opacity-80 transition-opacity duration-500 group-hover:opacity-100">
            {memory.caption}
          </figcaption>
        </figure>
        <span
          aria-hidden
          className={`tape group-hover:rotate-[calc(var(--trot)*1.25)] ${dropped ? "tape-dropping" : ""}`}
          style={{
            top: -12,
            width: memory.tapeWidth,
            ["--trot" as string]: `${memory.tapeRotation}deg`,
            transform: `translate(-50%, 0) rotate(${memory.tapeRotation}deg)`,
          }}
        />
      </button>
    </article>
  );
}

/** The story behind a photograph, opened from the grid. */
function MemoryLightbox({
  memory,
  secret,
  onClose,
}: {
  memory: Memory;
  secret: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="lightbox-backdrop fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label={memory.caption}
      onClick={onClose}
    >
      <div
        className="glass-card lightbox-panel grid max-h-[86vh] w-full max-w-3xl gap-8 overflow-auto p-8 md:grid-cols-[1fr_1fr] md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <figure className="polaroid">
          <img
            src={memory.src}
            alt={memory.alt}
            width={768}
            height={768}
            loading="lazy"
            className="polaroid-photo"
          />
          <figcaption className="hand py-4 text-center text-xl">{memory.caption}</figcaption>
        </figure>
        <div className="flex flex-col justify-center">
          <p className="eyebrow">{memory.date}</p>
          <h3 className="mt-5 text-3xl leading-snug">{memory.caption}</h3>
          <p className="body-copy mt-6">{memory.story}</p>
          {secret && memory.secret && (
            <p
              className="hand mt-6 text-2xl"
              style={{
                color: "var(--dusty-purple)",
                animation: "fade-in 900ms var(--ease-story) both",
              }}
            >
              {memory.secret}
            </p>
          )}
          <button type="button" data-hoverable onClick={onClose} className="btn-ribbon mt-10 self-start">
            {story.scrapbook.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Act II — the scrapbook page. */
export function Scrapbook() {
  const [open, setOpen] = useState<{ memory: Memory; secret: boolean } | null>(null);
  // The camera trails the memory in view — the lightbox stays outside the rig
  // so its fixed positioning is never trapped by a transformed ancestor.
  const camera = useSceneCamera<HTMLDivElement>("follow", { pointer: 0.25 });
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <section
      aria-label="Scrapbook of memories"
      className="paper-grain camera-breathing bg-sand relative overflow-hidden px-6 py-28 sm:py-36"
    >
      <span aria-hidden className="deco-petal float-slow absolute left-[6%] top-[12%] h-10 w-10 opacity-55" />
      <span aria-hidden className="deco-leaf sway-slow absolute right-[9%] top-[26%] h-14 w-6 opacity-45" />
      <span aria-hidden className="deco-paper absolute bottom-[14%] left-[12%] h-16 w-24 opacity-35" />

      <div
        ref={camera}
        className="camera-rig relative z-10 mx-auto grid max-w-5xl gap-x-16 gap-y-24 sm:grid-cols-2"
      >
        {memories.map((memory, i) => (
          <PhotoCard
            key={memory.caption}
            memory={memory}
            index={i}
            onOpen={(m, secret) => setOpen({ memory: m, secret })}
          />
        ))}
      </div>

      {open && <MemoryLightbox memory={open.memory} secret={open.secret} onClose={close} />}
    </section>
  );
}

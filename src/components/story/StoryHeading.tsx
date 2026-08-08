import { useSplitReveal, type SplitMode } from "@/js/gsap/splitText";

/**
 * A heading whose title and accent line are split into characters and
 * revealed independently. Semantic level is caller-controlled.
 */
export function StoryHeading({
  eyebrow,
  title,
  accent,
  as: Tag = "h2",
  mode = "chars",
  className = "",
  accentClassName = "",
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  as?: "h1" | "h2" | "h3";
  mode?: SplitMode;
  className?: string;
  accentClassName?: string;
}) {
  const eyebrowRef = useSplitReveal<HTMLParagraphElement>("words");
  const titleRef = useSplitReveal<HTMLSpanElement>(mode);
  const accentRef = useSplitReveal<HTMLSpanElement>(mode, 260);

  return (
    <>
      {eyebrow ? (
        <p
          ref={eyebrowRef}
          className="split-root text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground"
        >
          {eyebrow}
        </p>
      ) : null}
      <Tag className={className}>
        <span ref={titleRef} className="split-root block">
          {title}
        </span>
        {accent ? (
          <span
            ref={accentRef}
            className={`split-root mt-2 block italic ${accentClassName}`}
            style={{ color: "var(--dusty-purple)" }}
          >
            {accent}
          </span>
        ) : null}
      </Tag>
    </>
  );
}

/** The closing beat: the story offers itself again. */
import { story } from "@/data/story";
export function Replay({ onReplay }: { onReplay: () => void }) {
  return (
    <section
      className="replay paper-grain"
      aria-labelledby="replay-title"
      style={{
        background:
          "linear-gradient(180deg, var(--indigo, #2b2c4a), color-mix(in oklab, var(--lavender) 26%, var(--cream)) 34%, var(--cream) 62%)",
      }}
    >
      <div className="replay__inner">
        <p className="replay__eyebrow">{story.replay.eyebrow}</p>
        <h2 id="replay-title" className="replay__title">
          {story.replay.title}
          <span className="replay__accent">{story.replay.accent}</span>
        </h2>
        <button type="button" className="replay__button hover-lift" onClick={onReplay}>
          {story.replay.cta}
        </button>
      </div>

    </section>
  );
}

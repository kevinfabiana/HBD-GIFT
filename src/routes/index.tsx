import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { story } from "@/data/story";

import { CustomCursor } from "@/components/story/CustomCursor";
import { FriendLetters } from "@/components/story/FriendLetters";
import { GuitarSerenade } from "@/components/story/GuitarSerenade";
import { HeroGift } from "@/components/story/HeroGift";
import { HeroVeil, useHeroReveal } from "@/components/story/HeroReveal";
import { HiddenMemories } from "@/components/story/HiddenMemories";
import { OneMoreMelody } from "@/components/story/OneMoreMelody";
import { DreamAquarium } from "@/components/story/aquarium/DreamAquarium";

import { BeachWorld } from "@/components/story/BeachWorld";
import { MemoryConstellation } from "@/components/story/MemoryConstellation";
import { PetalFinale } from "@/components/story/PetalFinale";
import { Petals } from "@/components/story/Petals";
import { Reveal } from "@/components/story/Reveal";
import { SceneTransition } from "@/components/story/SceneTransition";
import { Scrapbook } from "@/components/story/Scrapbook";
import { Soundtrack } from "@/components/story/Soundtrack";
import { StoryHeading } from "@/components/story/StoryHeading";
import { StoryLoader } from "@/components/story/StoryLoader";
import { WorldBuild } from "@/components/story/WorldBuild";

import { useStoryRuntime } from "@/js/app";
import { depth, useParallaxScope, usePointerTilt } from "@/js/parallax";
import { useSceneCamera, useStoryProgress } from "@/js/gsap/camera";

import { refreshStory } from "@/js/gsap/masterTimeline";

import letterImg from "@/assets/illustrations/letter.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: story.meta.title },
      { name: "description", content: story.meta.description },
      { property: "og:title", content: story.meta.ogTitle },
      { property: "og:description", content: story.meta.ogDescription },
    ],
  }),
  component: Index,
});

function Index() {
  const [entered, setEntered] = useState(false);
  // Bumping the key remounts the gift so a replay starts from a closed box.
  const [run, setRun] = useState(0);
  useStoryRuntime();
  useStoryProgress();

  // One camera per act, each with its own language.
  const heroScope = useParallaxScope<HTMLElement>();
  const heroCamera = useSceneCamera<HTMLDivElement>("breathe");
  const heroReveal = useHeroReveal<HTMLDivElement>(entered);
  const letterCamera = useSceneCamera<HTMLDivElement>("push", { pointer: 0.2 });
  const beachCamera = useSceneCamera<HTMLDivElement>("float", { pointer: 0.15 });
  const endingCamera = useSceneCamera<HTMLDivElement>("pull", { pointer: 0.1 });
  const letterTilt = usePointerTilt<HTMLImageElement>();

  /** Rewinds the story: the gift curtain returns, then the page is at page one. */
  const handleReplay = useCallback(() => {
    // The remounted gift is a full-screen curtain, so the jump is never seen —
    // a smooth scroll across the whole story would take many seconds instead.
    setEntered(false);
    setRun((n) => n + 1);
    const toTop = () => window.scrollTo({ top: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      toTop();
      refreshStory();
      // ScrollTrigger can restore the previous offset while re-measuring.
      requestAnimationFrame(toTop);
      window.setTimeout(toTop, 120);
    });
  }, []);



  return (
    <div className="relative overflow-x-clip">
      <StoryLoader />
      <a className="skip-link" href="#story">
        Skip to the story
      </a>
      <CustomCursor />
      {/* Global light grade — sky-first colour blending driven by scroll depth.
          Morning diffuse → afternoon contrast → golden rim → cool moonlight. */}
      <div aria-hidden className="light-grade" />
      <HiddenMemories />
      {!entered && <HeroGift key={run} onEnter={() => setEntered(true)} />}



      {/* ---------- Morning: the invitation ---------- */}
      <header
        id="story"
        ref={heroScope}

        className="paper-grain relative flex min-h-screen items-center justify-center overflow-hidden px-6"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--ivory) 96%, white), var(--cream) 52%, var(--blush))",
        }}
      >
        <div ref={heroReveal} className="absolute inset-0 flex items-center justify-center">
          {/* Layer 1 — the gradient itself settles in */}
          <div
            aria-hidden
            data-reveal="1"
            className="absolute inset-0"
            style={{
              zIndex: 0,
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--ivory) 96%, white), var(--cream) 52%, var(--blush))",
            }}
          />
          {/* Layer 3 — memories connecting */}
          <div aria-hidden data-reveal="3" className="absolute inset-0" style={{ zIndex: 1 }}>
            <MemoryConstellation />
          </div>
          {/* Layer 2 — floating petals */}
          <div
            aria-hidden
            data-reveal="2"
            className="parallax-layer absolute inset-0"
            style={{ ...depth("clouds"), zIndex: 2 }}
          >
            <Petals count={14} tone="blush" />
          </div>
          <div
            ref={heroCamera}
            className="camera-rig parallax-layer relative mx-auto max-w-2xl px-6 text-center"
            style={{ ...depth("foreground"), zIndex: 10 }}
          >
            <div data-reveal="4" data-reveal-lift="">
              <StoryHeading
                as="h1"
                eyebrow={story.hero.eyebrow}
                title={story.hero.title}
                accent={story.hero.accent}
                className="mt-8 text-[clamp(2.6rem,7vw,4.75rem)] leading-[1.08] text-foreground"
              />
            </div>
            <p
              data-reveal="5"
              data-reveal-lift=""
              className="mx-auto mt-8 max-w-md whitespace-pre-line text-[0.98rem] leading-8 text-muted-foreground"
            >
              {story.hero.tagline}
            </p>
            <div data-reveal="6" className="mt-16 flex flex-col items-center gap-4">
              <span className="text-[0.6rem] uppercase tracking-[0.34em] text-muted-foreground">
                {story.hero.scrollHint}
              </span>
              <span className="hero-scroll-track">
                <span className="hero-scroll-dot" />
              </span>
            </div>
          </div>
          <HeroVeil />
        </div>
      </header>


      <SceneTransition from="var(--cream)" to="var(--blush)" />

      {/* ---------- The letter ---------- */}
      <section
        className="paper-grain relative overflow-hidden px-6 py-32 sm:py-40"
        style={{
          background:
            "linear-gradient(180deg, var(--blush), color-mix(in oklab, var(--cream) 88%, var(--peach)))",
        }}
      >
        <Petals count={8} tone="peach" />
        <div
          ref={letterCamera}
          className="camera-rig relative z-10 mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2"
        >
          <Reveal>
            <img
              ref={letterTilt}
              src={letterImg}
              alt="An open handwritten letter resting beside a pressed flower"
              width={1280}
              height={960}
              loading="lazy"
              className="hover-photo w-full object-cover"
              style={{ borderRadius: 20, boxShadow: "var(--shadow-lift)" }}
            />
          </Reveal>
          <Reveal delay={160}>
            <StoryHeading
              eyebrow={story.letter.eyebrow}
              title={story.letter.title}
              mode="words"
              className="mt-6 text-[clamp(1.9rem,4vw,2.9rem)] leading-tight"
            />

            <div className="mt-8 space-y-6 text-[0.98rem] leading-8 text-muted-foreground">
              {story.letter.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="italic" style={{ color: "var(--dusty-purple)" }}>
                {story.letter.closing}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <SceneTransition from="var(--peach)" to="var(--ivory)" />

      <WorldBuild active={entered} />

      <SceneTransition from="var(--ivory)" to="var(--cream)" />

      <Scrapbook />

      <Soundtrack />

      {/* ---------- The emotional bridge: a song played for her ---------- */}
      <SceneTransition from="var(--sand)" to="var(--peach)" />

      <GuitarSerenade />

      {/* ---------- Letters collected from the SKB Surabaya team ---------- */}
      <FriendLetters />

      <PetalFinale />


      <SceneTransition from="var(--blush)" to="var(--soft-blue)" />

      <div ref={beachCamera} className="camera-rig">
        <BeachWorld />
      </div>

      {/* ---------- One more melody: the last handwritten page ---------- */}
      <OneMoreMelody />

      {/* ---------- Epilogue: the dream aquarium, always living ---------- */}
      <DreamAquarium onReplay={handleReplay} />


      <footer
        ref={endingCamera}
        className="camera-rig paper-grain px-6 py-16 text-center"
        style={{ background: "var(--cream)" }}
      >
        <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted-foreground">
          {story.footer}
        </p>
      </footer>

    </div>
  );
}

/** Asset preloading, so the story never stutters mid-scene. */
import { useEffect, useState } from "react";

export function preloadImages(sources: string[]) {
  return Promise.all(
    sources.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  );
}

/** Resolves once the given images are decoded (or immediately on the server). */
export function usePreloadedImages(sources: string[]) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void preloadImages(sources).then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources.join("|")]);

  return loaded;
}

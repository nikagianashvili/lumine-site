import { useEffect, useRef, useState } from "react";

const SHOW_DELAY_MS = 200; // don't show a spinner for a fetch that resolves almost instantly
const MIN_VISIBLE_MS = 400; // once shown, don't flicker it away faster than the eye can register

// A query that resolves in 30ms and one that takes 3s both deserve
// different loading UI: the fast one should show nothing (a flash of
// "Loading…" reads as jank), the slow one needs a stable, non-flickering
// spinner. This hook is the two-timer pattern for that.
export function useDelayedLoading(isLoading: boolean): boolean {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const showTimer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, SHOW_DELAY_MS);
      return () => clearTimeout(showTimer);
    }

    if (!visible) return;
    const elapsed = shownAt.current ? Date.now() - shownAt.current : MIN_VISIBLE_MS;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const hideTimer = setTimeout(() => {
      shownAt.current = null;
      setVisible(false);
    }, remaining);
    return () => clearTimeout(hideTimer);
  }, [isLoading, visible]);

  return visible;
}

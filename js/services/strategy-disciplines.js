// "In Detail" — the three disciplines take turns pinned center-stage and
// flip from name+tagline to the full description as the reader scrolls,
// instead of a static footnoted list. 3D flip-card technique adapted from
// the Codegrid sticky-cards effect, retimed to one card per scroll third.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function init() {
  const section = document.getElementById("stratDisciplines");
  if (!section) return;
  if (window.matchMedia("(max-width: 900px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cards = gsap.utils.toArray(".strat-disc-card", section);
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, scale: 0.92, rotateY: 0 });

  const clamp = gsap.utils.clamp(0, 1);
  const count = cards.length;

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const progress = self.progress;

      cards.forEach((card, i) => {
        const windowStart = i / count;
        const windowEnd = (i + 1) / count;
        const local = clamp((progress - windowStart) / (windowEnd - windowStart));

        const entryRamp = clamp(gsap.utils.mapRange(0, 0.12, 0, 1, local));
        const isLast = i === count - 1;
        // The last card has no next card to hand off to, so it gets a
        // later, shorter exit window instead of staying fully opaque and
        // cutting off abruptly when the pinned section ends.
        const exitRamp = isLast
          ? clamp(gsap.utils.mapRange(0.96, 1, 1, 0, local))
          : clamp(gsap.utils.mapRange(0.88, 1, 1, 0, local));
        const opacity = Math.min(entryRamp, exitRamp);
        const scale = gsap.utils.mapRange(0, 0.12, 0.92, 1, clamp(local));
        const rotateY = gsap.utils.mapRange(0.18, 0.78, 0, 180, clamp(local));

        gsap.set(card, {
          opacity,
          scale: Math.min(1, Math.max(0.92, scale)),
          rotateY: Math.min(180, Math.max(0, rotateY)),
          zIndex: i + 1,
        });
      });
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

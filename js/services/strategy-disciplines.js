// "In Detail" — the three disciplines take turns pinned center-stage and
// flip from name+tagline to the full description as the reader scrolls,
// instead of a static footnoted list. 3D flip-card technique adapted from
// the Codegrid sticky-cards effect, retimed to one card per scroll third.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Mobile stacks front + back of every card instead of flipping between
// them (there's no room to pin a card center-stage), so each card gets a
// one-time fade/slide-up as it scrolls into view instead of no motion at all.
function initMobileReveal(cards) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cards.forEach((card) => card.classList.add("is-inview"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );

  cards.forEach((card) => observer.observe(card));
}

function init() {
  const section = document.getElementById("stratDisciplines");
  if (!section) return;

  const cards = gsap.utils.toArray(".strat-disc-card", section);
  if (!cards.length) return;

  if (window.matchMedia("(max-width: 900px)").matches) {
    initMobileReveal(cards);
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
        const exitRamp = isLast ? 1 : clamp(gsap.utils.mapRange(0.88, 1, 1, 0, local));
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

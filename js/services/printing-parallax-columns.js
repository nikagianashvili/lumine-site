// Workflow steps drift upward at different scroll-linked speeds, reading
// as parallax depth rather than a pinned or stacked card list.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SPEEDS = [-50, -130, -80, -150];

function init() {
  const section = document.querySelector(".ink-workflow-section");
  const cols = gsap.utils.toArray(".ink-workflow-col");
  if (!section || !cols.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  cols.forEach((col, i) => {
    gsap.to(col, {
      y: SPEEDS[i % SPEEDS.length],
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

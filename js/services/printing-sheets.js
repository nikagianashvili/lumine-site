// Proof-of-concept stock samples start stacked like a pile of loose proof
// sheets and fan apart into their final resting positions as the section
// scrolls into view, scrubbed directly to scroll progress.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REST = [
  { x: -150, y: 12, rotation: -7 },
  { x: 0, y: -14, rotation: 0 },
  { x: 150, y: 12, rotation: 7 },
];
const STACKED = { x: 0, y: 0, rotation: -5, scale: 0.92 };

function init() {
  const section = document.querySelector(".ink-sheets-section");
  const sheets = gsap.utils.toArray(".ink-sheet");
  if (!section || !sheets.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sheets.forEach((el, i) => {
      const rest = REST[i] || { x: 0, y: 0, rotation: 0 };
      gsap.set(el, { ...rest, scale: 1 });
    });
    return;
  }

  sheets.forEach((el) => gsap.set(el, STACKED));

  ScrollTrigger.create({
    trigger: section,
    start: "top 75%",
    end: "bottom 55%",
    scrub: 0.6,
    onUpdate(self) {
      const p = self.progress;
      sheets.forEach((el, i) => {
        const rest = REST[i] || { x: 0, y: 0, rotation: 0 };
        gsap.set(el, {
          x: gsap.utils.interpolate(STACKED.x, rest.x, p),
          y: gsap.utils.interpolate(STACKED.y, rest.y, p),
          rotation: gsap.utils.interpolate(STACKED.rotation, rest.rotation, p),
          scale: gsap.utils.interpolate(STACKED.scale, 1, p),
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

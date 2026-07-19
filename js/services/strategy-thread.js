// The page's connective visual: a single accent-colored line, stroke-drawn
// on scroll rather than pre-rendered — reused twice (hero squiggle, workflow
// spine) via the same small helper. Adapted from the "draw SVG on scroll"
// technique in the Codegrid effect collection; Lenis + ScrollTrigger are
// already wired globally by lenis-scroll.js, so this file only needs GSAP.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function drawOnScroll(path, { trigger, start, end, scrub = 1 }) {
  if (!path) return;
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: { trigger, start, end, scrub },
  });
}

function initHeroThread() {
  const path = document.getElementById("stratHeroThread");
  const hero = document.querySelector(".strat-hero");
  if (!path || !hero) return;
  drawOnScroll(path, { trigger: hero, start: "top 80%", end: "bottom 40%" });
}

function initWorkflowSpine() {
  const path = document.getElementById("stratWfSpine");
  const list = document.querySelector(".strat-workflow-list");
  if (!path || !list) return;
  drawOnScroll(path, { trigger: list, start: "top 75%", end: "bottom 75%" });
}

function init() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  initHeroThread();
  initWorkflowSpine();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

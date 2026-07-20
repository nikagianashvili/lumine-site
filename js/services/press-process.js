// The job ticket gets ink-stamped "Passed" at each step as it scrolls
// into view, connected by a line that draws in alongside it — a routing
// slip getting initialed at every station on the way through the press.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function initLine() {
  const path = document.getElementById("pressProcessLine");
  const grid = document.getElementById("pressProcessGrid");
  if (!path || !grid) return;

  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: { trigger: grid, start: "top 75%", end: "bottom 75%", scrub: 1 },
  });
}

function initStamps() {
  const steps = document.querySelectorAll(".press-process-step");
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-stamped");
      });
    },
    { rootMargin: "0px 0px -15% 0px", threshold: 0.4 },
  );

  steps.forEach((step) => observer.observe(step));
}

function init() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".press-process-step").forEach((step) => step.classList.add("is-stamped"));
    return;
  }
  initLine();
  initStamps();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

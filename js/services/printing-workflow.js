// Printing workflow: a job ticket routed down the press, stamped "Passed"
// at each step as it scrolls into view, connected by a line that draws in
// alongside it — the print-shop equivalent of a routing slip getting
// initialed at every station.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function initWorkflowLine() {
  const path = document.getElementById("printWfLine");
  const grid = document.getElementById("printWfGrid");
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

function initWorkflowStamps() {
  const items = document.querySelectorAll(".print-wf-item");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-stamped");
      });
    },
    { rootMargin: "0px 0px -15% 0px", threshold: 0.4 },
  );

  items.forEach((item) => observer.observe(item));
}

function init() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".print-wf-item").forEach((item) => item.classList.add("is-stamped"));
    return;
  }
  initWorkflowLine();
  initWorkflowStamps();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

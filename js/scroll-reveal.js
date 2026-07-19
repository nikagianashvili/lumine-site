// Generic scroll-fade for any static page that marks elements .pd-reveal —
// same tier as lenis-scroll.js/cursor.js: shared plumbing, not a design
// template. Each service page still owns its own section markup, CSS, and
// signature interactions.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function init() {
  const els = document.querySelectorAll(".pd-reveal");
  if (!els.length) return;

  gsap.set(els, { opacity: 0, y: 30 });
  ScrollTrigger.batch(els, {
    start: "top 85%",
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" },
      ),
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

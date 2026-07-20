// The cover headline starts as a misregistered CMYK proof (three color-
// separated duplicate layers offset from the true black plate) and snaps
// into perfect register on load, like a press operator dialing in the
// alignment before a run starts.
import gsap from "gsap";

function init() {
  const wrap = document.querySelector(".press-title-wrap");
  const status = document.querySelector("#pressRegStatus span");
  if (!wrap) return;

  const c = wrap.querySelector(".press-title-c");
  const m = wrap.querySelector(".press-title-m");
  const y = wrap.querySelector(".press-title-y");
  if (!c || !m || !y) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    gsap.set([c, m, y], { x: 0, y: 0 });
    if (status) status.textContent = "In Register";
    return;
  }

  gsap.set(c, { x: -16, y: -7 });
  gsap.set(m, { x: 12, y: 9 });
  gsap.set(y, { x: -7, y: 11 });

  const tl = gsap.timeline({ delay: 0.5 });
  tl.to([c, m, y], {
    x: 0,
    y: 0,
    duration: 0.9,
    ease: "back.out(1.4)",
    stagger: 0.05,
  });

  if (status) {
    tl.call(() => {
      status.textContent = "In Register";
    }, null, "-=0.2");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

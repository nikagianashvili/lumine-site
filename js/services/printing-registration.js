// Printing hero: the headline starts as a misregistered CMYK proof (three
// color-separated duplicate layers offset from the true black plate) and
// snaps into perfect register on load, like a press operator dialing in
// the alignment before a run starts. Genuinely print-specific — nothing
// else on the site uses ink-separation as a motion device.
import gsap from "gsap";

function initPrintRegistration() {
  const wrap = document.querySelector(".print-reg-wrap");
  const status = document.querySelector("#printRegStatus span");
  if (!wrap) return;

  const c = wrap.querySelector(".print-reg-c");
  const m = wrap.querySelector(".print-reg-m");
  const y = wrap.querySelector(".print-reg-y");
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
  document.addEventListener("DOMContentLoaded", initPrintRegistration);
} else {
  initPrintRegistration();
}

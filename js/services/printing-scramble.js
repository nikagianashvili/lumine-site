// This page's own text-in signature: kickers/labels scramble through random
// glyphs before settling on the real characters, like a Linotype machine
// setting type - replaces the sitewide SplitText slide-up reveal for every
// [data-scramble] element on this page only.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CYCLES = 8;
const CYCLE_MS = 30;

function scrambleChar(el, finalChar, cycles) {
  if (finalChar.trim() === "") return;
  let i = 0;
  const interval = setInterval(() => {
    el.textContent = CHARSET[Math.floor(Math.random() * CHARSET.length)];
    i++;
    if (i >= cycles) {
      clearInterval(interval);
      el.textContent = finalChar;
    }
  }, CYCLE_MS);
}

function initOne(el) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const split = SplitText.create(el, { type: "chars", charsClass: "ink-scramble-char" });

  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter() {
      split.chars.forEach((charEl, i) => {
        const final = charEl.textContent;
        gsap.delayedCall(i * 0.02, () => scrambleChar(charEl, final, CYCLES));
      });
    },
  });
}

function init() {
  document.querySelectorAll("[data-scramble]").forEach(initOne);
}

function ready(fn) {
  const fontsReady = document.fonts?.ready;
  if (fontsReady && typeof fontsReady.then === "function") fontsReady.then(fn);
  else fn();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ready(init));
} else {
  ready(init);
}

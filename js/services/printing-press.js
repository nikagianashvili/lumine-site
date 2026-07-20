// Hero headline "prints" onto the page — a single ink-roller pass wipes a
// clip-path open left-to-right, instead of the sitewide SplitText
// line-slide reveal every other page uses for its h1.
import gsap from "gsap";

function init() {
  const h1 = document.getElementById("pressHeadline");
  const roller = h1 ? h1.querySelector(".press-roller") : null;
  if (!h1 || !roller) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(h1, { clipPath: "inset(0 0% 0 0)" });
    gsap.set(roller, { opacity: 0 });
    return;
  }

  gsap.set(roller, { left: "0%", opacity: 1 });

  const tl = gsap.timeline({ delay: 0.3 });
  tl.to(h1, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power2.inOut" }, 0);
  tl.to(roller, { left: "100%", duration: 1.1, ease: "power2.inOut" }, 0);
  tl.to(roller, { opacity: 0, duration: 0.25 }, 1.0);
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

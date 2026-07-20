// CMYK registration dots double as a scroll-progress readout — the small
// color-registration bar printers leave in a proof sheet's trim margin,
// standing in here for a generic progress bar.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function init() {
  const dots = gsap.utils.toArray(".press-reg-dot");
  if (!dots.length) return;

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate(self) {
      const active = Math.min(dots.length, Math.floor(self.progress * dots.length));
      dots.forEach((dot, i) => dot.classList.toggle("is-filled", i < active));
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

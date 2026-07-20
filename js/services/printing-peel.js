// Proof-of-concept centerpiece: three torn-edge sheets stacked over the
// finished stock-sample grid peel apart and fly off as the section pins
// and scrubs, revealing what's underneath - adapted from the "peel
// reveal" pinned scroll-scrub pattern, reskinned as proof sheets instead
// of a single photo.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EXITS = [
  { x: -420, y: 40, rotation: -22 },
  { x: 420, y: 40, rotation: 20 },
  { x: 0, y: -380, rotation: 6 },
];

function init() {
  const section = document.getElementById("inkPeelSection");
  const stage = document.getElementById("inkPeelStage");
  const layers = gsap.utils.toArray(".ink-peel-layer");
  if (!section || !stage || !layers.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(layers, { autoAlpha: 0 });
    return;
  }

  ScrollTrigger.create({
    trigger: section,
    start: "top top+=90",
    end: "+=140%",
    pin: true,
    scrub: 0.6,
    onUpdate(self) {
      const p = self.progress;
      layers.forEach((layer, i) => {
        const layerStart = i / layers.length;
        const layerEnd = (i + 1) / layers.length;
        const local = gsap.utils.clamp(0, 1, (p - layerStart) / (layerEnd - layerStart));
        const exit = EXITS[i % EXITS.length];
        gsap.set(layer, {
          x: exit.x * local,
          y: exit.y * local,
          rotation: exit.rotation * local,
          autoAlpha: 1 - local,
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

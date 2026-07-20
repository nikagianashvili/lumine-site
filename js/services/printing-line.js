// Workflow "press line" — a small sheet marker travels left-to-right
// through four stations as the section scrolls, scrubbed directly by
// scroll position rather than the sitewide fade-up used elsewhere.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function init() {
  const section = document.getElementById("pressLineSection");
  const fill = document.getElementById("pressLineFill");
  const sheet = document.getElementById("pressLineSheet");
  const stations = gsap.utils.toArray(".press-line-station");
  if (!section || !fill || !sheet || !stations.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(fill, { width: "100%" });
    gsap.set(sheet, { left: "100%" });
    stations.forEach((s) => s.classList.add("is-active"));
    return;
  }

  ScrollTrigger.create({
    trigger: section,
    start: "top 70%",
    end: "bottom 55%",
    scrub: 0.4,
    onUpdate(self) {
      const progress = self.progress;
      gsap.set(fill, { width: `${progress * 100}%` });
      gsap.set(sheet, { left: `${progress * 100}%` });
      const activeCount = Math.min(stations.length, Math.ceil(progress * stations.length));
      stations.forEach((s, i) => s.classList.toggle("is-active", i < activeCount));
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Subservices filmstrip: the section pins full-viewport while vertical
// scroll drives the track horizontally instead, so reading the five
// subservices is a guided tour rather than a wall of scroll. Adapted from
// the pinned/scrubbed-section pattern used across the Codegrid template
// collection (assets reference: maximatherapy-sticky-cards and others),
// simplified to a straight scrub-translate rather than a card-flip.
//
// Falls back to plain horizontal scroll-snap (the CSS default) on touch
// devices, narrow viewports, and prefers-reduced-motion - the pin only
// takes over once confirmed safe to run.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function initBrandSubs() {
  const section = document.getElementById("brndSubs");
  const pinEl = section?.querySelector(".brnd-subs-pin");
  const track = document.getElementById("brndSubsTrack");
  const railFill = document.getElementById("brndSubsRailFill");
  if (!section || !pinEl || !track || !railFill) return;

  const skipPin =
    window.matchMedia("(max-width: 700px)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (skipPin) return;

  function maxScroll() {
    return Math.max(0, track.scrollWidth - pinEl.clientWidth);
  }

  section.classList.add("is-pinned");

  const trigger = ScrollTrigger.create({
    trigger: pinEl,
    start: "top top",
    end: () => `+=${maxScroll() + window.innerHeight * 0.4}`,
    pin: true,
    scrub: 0.6,
    onUpdate(self) {
      const max = maxScroll();
      gsap.set(track, { x: -max * self.progress });
      railFill.style.width = `${16 + self.progress * 84}%`;
    },
  });

  window.addEventListener("resize", () => trigger.refresh());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBrandSubs);
} else {
  initBrandSubs();
}

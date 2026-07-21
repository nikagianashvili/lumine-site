import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenis = null;

gsap.registerPlugin(ScrollTrigger);

// initialization
// In production builds, this module can execute after DOMContentLoaded has
// already fired (depending on bundling/loading), so we must handle both cases.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initLenisScroll());
} else {
  initLenisScroll();
}

// smooth scroll setup with responsive config
function initLenisScroll() {
  if (lenis) return;

  const isMobile = window.innerWidth <= 1000;

  lenis = new Lenis({
    duration: isMobile ? 0.8 : 1.2,
    lerp: isMobile ? 0.075 : 0.1,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: isMobile ? 1.5 : 2,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.lenis = lenis;

  // Ensure any existing ScrollTriggers (including pinned ones) measure using
  // the final layout + active Lenis loop.
  requestAnimationFrame(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

  // Mobile pinch-zoom fires visualViewport resize events, not window
  // resize - ScrollTrigger's own default auto-refresh only listens on
  // window, so a zoom change mid-scroll leaves every cached trigger
  // start/end and pin distance stale against the new scale. Symptom:
  // scrub-driven reveals (e.g. the strategy ecosystem map's opacity
  // stagger) get stuck partway since the trigger's end point no longer
  // lines up with where the user can actually scroll to.
  let refreshTimer = null;
  const scheduleRefresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  window.visualViewport?.addEventListener("resize", scheduleRefresh);
  window.addEventListener("orientationchange", scheduleRefresh);
}

export { lenis };

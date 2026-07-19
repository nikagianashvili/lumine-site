// Marketing page signature: a ticker whose speed is driven by scroll
// velocity - scroll fast and the feed rips past like a live dashboard
// under load; sit still and it idles at a slow baseline crawl. Adapted
// from a velocity-reactive-marquee technique into plain scroll-delta math,
// no scroll library hook required.

function initMarketingTicker() {
  const track = document.getElementById("mktgTicker");
  if (!track) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Duplicate content once so the loop is seamless.
  track.innerHTML += track.innerHTML;

  const BASE_SPEED = 0.35; // px/frame at rest
  const VELOCITY_GAIN = 0.6;
  const MAX_SPEED = 9;

  let offset = 0;
  let trackWidth = 0;
  let lastScrollY = window.scrollY;
  let smoothVelocity = 0;
  let running = true;
  let rafId = null;

  function measure() {
    trackWidth = track.scrollWidth / 2;
  }

  function tick() {
    rafId = null;
    if (!running) return;

    const scrollY = window.scrollY;
    const rawVelocity = Math.abs(scrollY - lastScrollY);
    lastScrollY = scrollY;
    smoothVelocity = smoothVelocity * 0.85 + rawVelocity * 0.15;

    const speed = reduced
      ? BASE_SPEED
      : Math.min(MAX_SPEED, BASE_SPEED + smoothVelocity * VELOCITY_GAIN);

    offset -= speed;
    if (-offset >= trackWidth) offset += trackWidth;
    track.style.transform = `translateX(${offset}px)`;

    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener("resize", measure);
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
    if (running && rafId == null) rafId = requestAnimationFrame(tick);
  });

  measure();
  rafId = requestAnimationFrame(tick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMarketingTicker);
} else {
  initMarketingTicker();
}

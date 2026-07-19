// Brand page signature: the real Lumine mark as an interactive depth stage.
// Four masked copies of the mark, each a different brand color, trail the
// cursor with staggered delay behind the crisp static mark on top - a real
// brand-design artifact responding to touch, not an abstract effect standing
// in for the subject. Adapted from the moblinks-interactive-logo
// depth-parallax technique (assets reference folder), swapped to our own
// mark shape and palette.
import gsap from "gsap";

function initBrandMark() {
  const hero = document.querySelector(".brnd-hero");
  // only the four color-ring layers trail the cursor - the crisp mark on
  // top stays put, so it reads as the "real" logo rather than something
  // skittering around, and so its screen position stays scroll-only (see
  // initHeroMarkHandoff below, which needs that to hold true)
  const layers = gsap.utils.toArray(".brnd-depth-layer:not(.brnd-depth-layer-mark)");
  if (!hero || !layers.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const SENSITIVITY = 0.22;
  const LERP = 0.05;
  const STAGGER_DELAY = 7;
  const total = layers.length;

  const mouse = { x: 0, y: 0 };

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  hero.addEventListener("mouseleave", () => {
    mouse.x = 0;
    mouse.y = 0;
  });

  const bufferSize = total * STAGGER_DELAY + 1;
  const trail = [];

  const tracked = layers.map((el, i) => ({
    el,
    delay: (total - 1 - i) * STAGGER_DELAY,
    current: { x: 0, y: 0 },
  }));

  gsap.ticker.add(() => {
    const rect = hero.getBoundingClientRect();

    trail.push({
      x: mouse.x * rect.width * SENSITIVITY,
      y: mouse.y * rect.height * SENSITIVITY,
    });
    if (trail.length > bufferSize) trail.shift();

    tracked.forEach((layer) => {
      const idx = Math.max(0, trail.length - 1 - layer.delay);
      const target = trail[idx];

      layer.current.x += (target.x - layer.current.x) * LERP;
      layer.current.y += (target.y - layer.current.y) * LERP;

      gsap.set(layer.el, { x: layer.current.x, y: layer.current.y });
    });
  });
}

// Hero-to-nav handoff: the nav already has a centered mark slot
// (.nav-icon) that just sits there, always visible, on every page. Here it
// starts invisible, and as the hero's static mark scrolls up toward the
// nav, the two cross-fade in lockstep - by the time the hero mark reaches
// the nav's own center, it's fully handed off and the nav mark is the one
// that's visible. Pure scroll position, no scroll library dependency.
function initHeroMarkHandoff() {
  const heroMarkImg = document.querySelector(".brnd-hero-mark-img");
  const navIcon = document.querySelector(".nav-icon");
  const nav = document.querySelector("nav");
  if (!heroMarkImg || !navIcon || !nav) return;

  const FADE_RANGE = 140;

  function update() {
    const navRect = nav.getBoundingClientRect();
    const navCenter = navRect.top + navRect.height / 2;
    const markRect = heroMarkImg.getBoundingClientRect();
    const markCenter = markRect.top + markRect.height / 2;

    const t = Math.min(1, Math.max(0, (navCenter + FADE_RANGE - markCenter) / FADE_RANGE));

    heroMarkImg.style.opacity = String(1 - t);
    navIcon.style.opacity = String(t);
  }

  navIcon.style.opacity = "0";
  update();
  gsap.ticker.add(update);
}

// Workflow build-bar: each of the four segments scales in from the left as
// its own step, so the bar visibly accumulates - the four steps ARE the bar,
// not a separate diagram sitting next to it.
function initBuildBar() {
  const bar = document.querySelector(".brnd-buildbar");
  if (!bar) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    bar.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          bar.classList.add("is-visible");
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(bar);
}

function init() {
  initBrandMark();
  initHeroMarkHandoff();
  initBuildBar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

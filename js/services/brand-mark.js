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
  const layers = gsap.utils.toArray(".brnd-depth-layer");
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
  initBuildBar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

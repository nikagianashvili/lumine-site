// Brand page signature: the actual Lumine mark, drawn stroke-by-stroke like
// a vector tool constructing it, then filled solid - a real brand-design
// artifact in motion (this is literally what the service produces) rather
// than an abstract effect standing in for the subject. Vanilla SVG
// path-length stroke animation, no library.

function initBrandMark() {
  const svg = document.getElementById("brndMarkSvg");
  const path = document.getElementById("brndMarkPath");
  if (!svg || !path) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const length = path.getTotalLength();

  path.style.fill = "none";
  path.style.stroke = "var(--accent)";
  path.style.strokeWidth = "3";
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = reduced ? "0" : String(length);

  if (reduced) {
    path.style.fill = "var(--d)";
    path.style.stroke = "none";
    return;
  }

  let start = null;
  const DRAW_MS = 2200;
  const HOLD_MS = 300;
  const FILL_MS = 700;

  function frame(ts) {
    if (start == null) start = ts;
    const elapsed = ts - start;

    if (elapsed < DRAW_MS) {
      const t = elapsed / DRAW_MS;
      const eased = 1 - Math.pow(1 - t, 3);
      path.style.strokeDashoffset = String(length * (1 - eased));
      requestAnimationFrame(frame);
    } else if (elapsed < DRAW_MS + HOLD_MS) {
      path.style.strokeDashoffset = "0";
      requestAnimationFrame(frame);
    } else if (elapsed < DRAW_MS + HOLD_MS + FILL_MS) {
      const t = (elapsed - DRAW_MS - HOLD_MS) / FILL_MS;
      path.style.stroke = "var(--accent)";
      path.style.fill = "var(--d)";
      path.style.fillOpacity = String(t);
      path.style.strokeOpacity = String(1 - t * 0.7);
      requestAnimationFrame(frame);
    } else {
      path.style.fillOpacity = "1";
      path.style.strokeOpacity = "0.3";
      svg.classList.add("is-drawn");
    }
  }

  requestAnimationFrame(frame);
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

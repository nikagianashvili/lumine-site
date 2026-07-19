// Strategy page: small, self-contained interactions that don't need their
// own module — the masthead rail counter, the audit slider controls, the
// FAQ accordion, and the framework cards' cursor-lit spotlight.

// Rail counter: ticks to match whichever numbered block is in view, like a
// running page number.
function initRailCounter() {
  const counter = document.querySelector("[data-rail-current]");
  const blocks = document.querySelectorAll("[data-rail]");
  if (!counter || !blocks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const label = entry.target.getAttribute("data-rail") || "";
        const num = label.split(" ")[0];
        if (num) counter.textContent = num;
      });
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );

  blocks.forEach((block) => observer.observe(block));
}

// Audit slider: arrow buttons + dots drive the scroll-snap track.
function initAuditSlider() {
  const track = document.getElementById("stratProofSlider");
  const dotsWrap = document.getElementById("stratProofDots");
  if (!track || !dotsWrap) return;

  const panels = Array.from(track.children);
  const dots = Array.from(dotsWrap.children);
  const prevBtn = document.querySelector(".strat-proof-prev");
  const nextBtn = document.querySelector(".strat-proof-next");

  function goTo(index) {
    const clamped = Math.max(0, Math.min(panels.length - 1, index));
    panels[clamped].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  function currentIndex() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    panels.forEach((panel, i) => {
      const dist = Math.abs(panel.offsetLeft + panel.clientWidth / 2 - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function syncDots() {
    const idx = currentIndex();
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === idx));
  }

  prevBtn?.addEventListener("click", () => goTo(currentIndex() - 1));
  nextBtn?.addEventListener("click", () => goTo(currentIndex() + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
  track.addEventListener("scroll", () => {
    window.clearTimeout(track._syncTimer);
    track._syncTimer = window.setTimeout(syncDots, 80);
  });
}

// FAQ accordion: one open at a time.
function initFaqAccordion() {
  const items = document.querySelectorAll(".strat-faq-item");
  items.forEach((item) => {
    const q = item.querySelector(".strat-faq-q");
    q?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      items.forEach((other) => other.classList.remove("is-open"));
      if (willOpen) item.classList.add("is-open");
    });
  });
}

// Framework cards: cursor-lit spotlight via a CSS custom-property radial
// gradient, cheap to run since it's a plain mousemove, no canvas/WebGL.
function initFrameworkSpotlight() {
  const cards = document.querySelectorAll(".strat-fw-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    });
  });
}

function init() {
  initRailCounter();
  initAuditSlider();
  initFaqAccordion();
  initFrameworkSpotlight();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

import { fetchProjects } from "/js/api-client.js";
import { getServiceType, projectHref } from "/js/projects-data.js";

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

// Only real, published projects carry a testimonial (set via the admin's
// Publish to Portfolio flow). Until one does, the placeholder voices already
// in the markup stay put along with their disclaimer — no invented quotes.
function withTestimonial(projects) {
  return projects.filter((p) => p.testimonial && p.testimonial.quote);
}

// The rail's typographic idea: a quote is set at a size that follows how much
// was actually said. A one-liner lands like a headline; a paragraph settles
// back so it stays readable. Uniform sizing is what made the old three
// columns read as a wall.
// Thresholds are set against what people actually say in these quotes —
// they run 78 to 111 characters, so a generic 72/150 split never fired and
// every voice came out the same size.
function weightFor(quote) {
  if (quote.length <= 88) return "is-short";
  if (quote.length >= 105) return "is-long";
  return "";
}

function buildVoice(project, index) {
  const t = project.testimonial;
  const quote = isKa ? t.quote_ka || t.quote : t.quote;
  const author = isKa ? t.author_ka || t.author : t.author;
  const type = getServiceType(project.serviceType);
  const label = type ? (isKa ? type.label_ka : type.label) : "";

  const el = document.createElement("a");
  el.className = `voice ${weightFor(quote)}`.trim();
  el.href = projectHref(project, isKa);
  el.innerHTML = `
    <span class="voice-index">${String(index + 1).padStart(2, "0")}</span>
    <blockquote class="voice-quote">${quote}</blockquote>
    <span class="voice-author">${author}</span>
    <span class="voice-project">
      <span class="voice-plate"><img src="${project.cover}" alt="" loading="lazy" /></span>
      <span class="voice-project-meta">
        <span class="voice-project-label">${label}</span>
        <span class="voice-project-name">${project.title}</span>
      </span>
    </span>
  `;
  return el;
}

/* ── the rail ──────────────────────────────────────────────────────────────
   Drag with a pointer, flick with a trackpad, or tab in and use the arrow
   keys. The readout below reports which voice you are on and how far through
   the rail you are, so a growing list never feels bottomless. */
function initRail(rail) {
  const bar = document.getElementById("voicesBar");
  const count = document.getElementById("voicesCount");

  const report = () => {
    const voices = [...rail.querySelectorAll(".voice")];
    if (!voices.length) return;

    const max = rail.scrollWidth - rail.clientWidth;
    if (bar) bar.style.width = `${max > 0 ? (rail.scrollLeft / max) * 100 : 100}%`;

    // whichever voice sits nearest the rail's left edge is the one being read
    const edge = rail.getBoundingClientRect().left;
    let current = 0;
    let best = Infinity;
    voices.forEach((v, i) => {
      const d = Math.abs(v.getBoundingClientRect().left - edge);
      if (d < best) {
        best = d;
        current = i;
      }
    });
    if (count) {
      count.textContent = `${String(current + 1).padStart(2, "0")} / ${String(
        voices.length,
      ).padStart(2, "0")}`;
    }
  };

  rail.addEventListener("scroll", report, { passive: true });
  window.addEventListener("resize", report);
  report();

  // pointer drag — skipped on touch, where the native scroll is already right
  if (window.matchMedia("(pointer: coarse)").matches) return;

  let down = false;
  let startX = 0;
  let startScroll = 0;
  let moved = 0;

  rail.addEventListener("pointerdown", (e) => {
    down = true;
    moved = 0;
    startX = e.clientX;
    startScroll = rail.scrollLeft;
    rail.classList.add("is-dragging");
  });

  rail.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.abs(dx);
    rail.scrollLeft = startScroll - dx;
  });

  const release = () => {
    if (!down) return;
    down = false;
    rail.classList.remove("is-dragging");
  };

  rail.addEventListener("pointerup", release);
  rail.addEventListener("pointerleave", release);

  // a drag that ends on a link must not also count as a click on it
  rail.addEventListener(
    "click",
    (e) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );
}

async function init() {
  const rail = document.getElementById("testimonialTrack");
  if (!rail) return;

  initRail(rail);

  const projects = await fetchProjects();
  const real = withTestimonial(projects);
  if (!real.length) return;

  rail.innerHTML = "";
  real.forEach((proj, i) => rail.appendChild(buildVoice(proj, i)));

  const note = document.getElementById("testimonialNote");
  if (note) note.remove();

  rail.scrollLeft = 0;
  rail.dispatchEvent(new Event("scroll"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

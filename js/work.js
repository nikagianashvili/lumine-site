import gsap from "gsap";
import { projects, SERVICE_TYPES, INDUSTRIES, INDUSTRY_LABELS_KA, getServiceType } from "/js/projects-data.js";

const grid = document.getElementById("workGrid");
const emptyEl = document.getElementById("workEmpty");
const countEl = document.getElementById("workCount");
const typeFiltersEl = document.getElementById("typeFilters");
const industryFiltersEl = document.getElementById("industryFilters");

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

const UI = isKa
  ? { all: "ყველა", allTypes: "ყველა ტიპი", allIndustries: "ყველა ინდუსტრია", featured: "გამორჩეული" }
  : { all: "All", allTypes: "All Types", allIndustries: "All Industries", featured: "Featured" };

const state = { type: "all", industry: "all" };
let isAnimating = false;

// Legacy deep links from Services/Home (?service=Photography etc.) still
// resolve — mapped onto the 3 portfolio types. Social/Marketing have no
// portfolio format, so they fall back to "all" rather than an empty grid.
const LEGACY_SERVICE_MAP = {
  Photography: "photo-video",
  Video: "photo-video",
  Design: "design",
  Web: "web",
};

const params = new URLSearchParams(window.location.search);
const rawType = params.get("type") || LEGACY_SERVICE_MAP[params.get("service")];
if (SERVICE_TYPES.some((s) => s.id === rawType)) state.type = rawType;
if (INDUSTRIES.includes(params.get("industry"))) {
  state.industry = params.get("industry");
}

// ── card builders — one visual per service type ─────────────────────────────

function buildVisual(project) {
  if (project.serviceType === "web") {
    return `
      <div class="work-card-visual work-card-browser">
        <div class="browser-bar">
          <span class="browser-dot"></span>
          <span class="browser-dot"></span>
          <span class="browser-dot"></span>
          <span class="browser-url">${project.title.toLowerCase().replace(/\s+/g, "")}.ge</span>
        </div>
        <div class="browser-viewport">
          <img src="${project.cover}" alt="${project.title} website" loading="lazy" />
        </div>
      </div>
    `;
  }

  if (project.serviceType === "photo-video") {
    return `
      <div class="work-card-visual work-card-photo">
        <img src="${project.cover}" alt="${project.title}" loading="lazy" />
        <span class="play-button" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </div>
    `;
  }

  // design — stacked, offset posters
  return `
    <div class="work-card-visual work-card-stack">
      <div class="stack-poster stack-poster-back">
        <img src="${project.gallery ? project.gallery[0] : project.cover}" alt="" loading="lazy" />
      </div>
      <div class="stack-poster stack-poster-front">
        <img src="${project.cover}" alt="${project.title}" loading="lazy" />
      </div>
    </div>
  `;
}

function buildCard(project) {
  const type = getServiceType(project.serviceType);
  const label = isKa ? type.label_ka : type.label;
  const blurb = isKa ? project.blurb_ka : project.blurb;
  const card = document.createElement("a");
  card.className = "work-card" + (project.featured ? " is-featured" : "");
  card.href = `${p("/project")}?slug=${project.slug}`;
  card.dataset.type = project.serviceType;
  card.dataset.industry = project.industry;
  card.innerHTML = `
    ${project.featured ? `<span class="work-card-featured-tag">${UI.featured}</span>` : ""}
    ${buildVisual(project)}
    <div class="work-card-meta">
      <span class="work-card-badge" style="background-color:${type.color};color:${type.onColor}">${label}</span>
      <h6 class="work-card-title">${project.title}</h6>
      <p class="work-card-blurb">${blurb}</p>
    </div>
  `;
  return card;
}

function buildPill(group, value, label) {
  const pill = document.createElement("button");
  pill.className =
    "filter-pill" + (value === state[group] ? " is-active" : "");
  pill.dataset.group = group;
  pill.dataset.value = value;
  pill.textContent = label;
  pill.addEventListener("click", () => onFilter(group, value, pill));
  return pill;
}

function render() {
  projects.forEach((proj) => grid.appendChild(buildCard(proj)));

  typeFiltersEl.appendChild(buildPill("type", "all", UI.all));
  SERVICE_TYPES.forEach((s) =>
    typeFiltersEl.appendChild(buildPill("type", s.id, isKa ? s.label_ka : s.label)),
  );

  industryFiltersEl.appendChild(buildPill("industry", "all", UI.all));
  INDUSTRIES.forEach((s) =>
    industryFiltersEl.appendChild(buildPill("industry", s, isKa ? INDUSTRY_LABELS_KA[s] : s)),
  );
}

// ── filtering ────────────────────────────────────────────────────────────────

function matches(card) {
  const okType = state.type === "all" || card.dataset.type === state.type;
  const okIndustry =
    state.industry === "all" || card.dataset.industry === state.industry;
  return okType && okIndustry;
}

function updateCount(visible) {
  const total = String(projects.length).padStart(2, "0");
  const shown = String(visible).padStart(2, "0");
  const typePart =
    state.type === "all" ? UI.allTypes : isKa ? getServiceType(state.type).label_ka : getServiceType(state.type).label;
  const industryPart =
    state.industry === "all" ? UI.allIndustries : isKa ? INDUSTRY_LABELS_KA[state.industry] : state.industry;
  countEl.textContent = `${shown} / ${total} — ${typePart}, ${industryPart}`;
}

// "All / All" gets the curated spotlight rhythm; any active filter means
// the visitor is comparing within a bucket, so it collapses to a tight,
// uniform grid instead. Called while cards are faded out, so the reflow
// never happens in front of the visitor.
function applyGridMode() {
  const isDefaultView = state.type === "all" && state.industry === "all";
  grid.classList.toggle("work-grid--featured", isDefaultView);
  grid.classList.toggle("work-grid--dense", !isDefaultView);
}

function applyFilter() {
  if (isAnimating) return;
  isAnimating = true;

  const cards = Array.from(grid.querySelectorAll(".work-card"));
  const showing = cards.filter((c) => c.style.display !== "none");
  const toShow = cards.filter(matches);

  updateCount(toShow.length);

  gsap.to(showing, {
    opacity: 0,
    y: 24,
    duration: 0.3,
    stagger: 0.03,
    ease: "power2.in",
    onComplete: () => {
      cards.forEach((c) => {
        c.style.display = matches(c) ? "" : "none";
      });
      applyGridMode();

      emptyEl.hidden = toShow.length !== 0;

      gsap.fromTo(
        toShow,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "power3.out",
          onComplete: () => {
            isAnimating = false;
          },
        },
      );

      if (toShow.length === 0) isAnimating = false;
    },
  });
}

function onFilter(group, value, pill) {
  if (isAnimating || state[group] === value) return;
  state[group] = value;

  document
    .querySelectorAll(`.filter-pill[data-group="${group}"]`)
    .forEach((p) => p.classList.toggle("is-active", p === pill));

  applyFilter();
}

// ── entrance ─────────────────────────────────────────────────────────────────

function reveal() {
  const cards = Array.from(grid.querySelectorAll(".work-card")).filter(
    (c) => c.style.display !== "none",
  );
  gsap.fromTo(
    cards,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: "power3.out", delay: 0.5 },
  );
}

function init() {
  if (!grid) return;
  render();

  const cards = Array.from(grid.querySelectorAll(".work-card"));
  cards.forEach((c) => {
    c.style.display = matches(c) ? "" : "none";
  });
  const visible = cards.filter(matches);
  emptyEl.hidden = visible.length !== 0;

  applyGridMode();
  updateCount(visible.length);
  reveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

import gsap from "gsap";
import { SERVICE_TYPES, INDUSTRIES, INDUSTRY_LABELS_KA, getServiceType, projectHref } from "/js/projects-data.js";
import { fetchProjects } from "/js/api-client.js";

let projects = [];

const grid = document.getElementById("workGrid");
const emptyEl = document.getElementById("workEmpty");
const countEl = document.getElementById("workCount");
const typeFiltersEl = document.getElementById("typeFilters");
const industryFiltersEl = document.getElementById("industryFilters");
const tallyEl = document.getElementById("workTally");
const resetEl = document.getElementById("workReset");
const filtersEl = document.getElementById("workFilters");

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

const UI = isKa
  ? {
      all: "ყველა",
      allTypes: "ყველა ტიპი",
      allIndustries: "ყველა ინდუსტრია",
      featured: "გამორჩეული",
      projects: "პროექტი",
      disciplines: "მიმართულება",
      clients: "კლიენტი",
      years: "წლები",
    }
  : {
      all: "All",
      allTypes: "All Types",
      allIndustries: "All Industries",
      featured: "Featured",
      projects: "Projects",
      disciplines: "Disciplines",
      clients: "Clients",
      years: "Years",
    };

const state = { type: "all", industry: "all", view: "plates" };
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
if (params.get("view") === "index") state.view = "index";

// Filter choices live in the URL so a filtered archive is shareable, and so
// returning from a project (back button) lands on the same view the visitor
// left instead of resetting to everything.
function syncUrl() {
  const next = new URLSearchParams();
  if (state.type !== "all") next.set("type", state.type);
  if (state.industry !== "all") next.set("industry", state.industry);
  if (state.view !== "plates") next.set("view", state.view);
  const qs = next.toString();
  window.history.replaceState(
    null,
    "",
    qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
  );
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

// Delivered client work is shown in full colour; speculative concepts stay
// in the archive's grayscale treatment. The palette itself tells you which
// is which, so the status never has to be argued for in words.
function isDelivered(project) {
  return project.status === "Completed";
}

function buildCard(project, index) {
  const type = getServiceType(project.serviceType);
  const label = isKa ? type.label_ka : type.label;
  const blurb = isKa ? project.blurb_ka : project.blurb;
  const status = isKa ? project.status_ka || project.status : project.status;
  const plate = String(index + 1).padStart(2, "0");
  const card = document.createElement("a");
  card.className =
    "work-card" +
    (project.featured ? " is-featured" : "") +
    (isDelivered(project) ? " is-delivered" : " is-concept");
  card.href = projectHref(project, isKa);
  card.dataset.type = project.serviceType;
  card.dataset.industry = project.industry;
  card.dataset.plate = plate;
  card.innerHTML = `
    <div class="work-card-frame">
      ${buildVisual(project)}
      <span class="work-card-plate">${plate}</span>
    </div>
    <div class="work-card-meta">
      <div class="work-card-rule">
        <span class="work-card-badge"><i style="background-color:${type.color}"></i>${label}</span>
        <span class="work-card-status">${status}</span>
      </div>
      <h6 class="work-card-title">${project.title}</h6>
      <p class="work-card-blurb">${blurb}</p>
      <span class="work-card-foot">${project.client} · ${project.year}</span>
    </div>
  `;
  return card;
}

// How many projects a filter would actually yield, given the *other* axis'
// current selection — so the counts stay honest as you narrow down, and a
// combination that leads nowhere can be disabled before it's clicked.
function countFor(group, value) {
  return projects.filter((proj) => {
    const typeOk =
      group === "type"
        ? value === "all" || proj.serviceType === value
        : state.type === "all" || proj.serviceType === state.type;
    const industryOk =
      group === "industry"
        ? value === "all" || proj.industry === value
        : state.industry === "all" || proj.industry === state.industry;
    return typeOk && industryOk;
  }).length;
}

function buildTab(group, value, label) {
  const tab = document.createElement("button");
  tab.type = "button";
  tab.className = "filter-tab" + (value === state[group] ? " is-active" : "");
  tab.dataset.group = group;
  tab.dataset.value = value;
  tab.setAttribute("aria-pressed", String(value === state[group]));
  tab.innerHTML = `<span class="filter-tab-label">${label}</span><span class="filter-tab-count"></span>`;
  tab.addEventListener("click", () => onFilter(group, value, tab));
  return tab;
}

// Counts are recomputed after every filter change: an industry tab shows how
// many projects it holds *within* the current type, and empties disable
// themselves rather than leading to a dead end.
function refreshTabCounts() {
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    const { group, value } = tab.dataset;
    const n = countFor(group, value);
    tab.querySelector(".filter-tab-count").textContent = String(n).padStart(2, "0");
    const dead = n === 0 && value !== state[group];
    tab.disabled = dead;
    tab.classList.toggle("is-empty", dead);
  });
}

function renderTally() {
  if (!tallyEl) return;
  const years = projects.map((p) => parseInt(p.year, 10)).filter(Boolean);
  const rows = [
    [UI.projects, String(projects.length).padStart(2, "0")],
    [UI.disciplines, String(SERVICE_TYPES.length).padStart(2, "0")],
    [UI.clients, String(new Set(projects.map((p) => p.client)).size).padStart(2, "0")],
    [
      UI.years,
      years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—",
    ],
  ];
  tallyEl.innerHTML = rows
    .map(
      ([label, value]) =>
        `<div class="work-tally-item"><dt>${label}</dt><dd>${value}</dd></div>`,
    )
    .join("");
}

function render() {
  projects.forEach((proj, i) => grid.appendChild(buildCard(proj, i)));

  typeFiltersEl.appendChild(buildTab("type", "all", UI.all));
  SERVICE_TYPES.forEach((s) =>
    typeFiltersEl.appendChild(buildTab("type", s.id, isKa ? s.label_ka : s.label)),
  );

  industryFiltersEl.appendChild(buildTab("industry", "all", UI.all));
  INDUSTRIES.forEach((s) =>
    industryFiltersEl.appendChild(buildTab("industry", s, isKa ? INDUSTRY_LABELS_KA[s] : s)),
  );

  renderTally();
  refreshTabCounts();
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
  const isIndex = state.view === "index";
  const isDefaultView = state.type === "all" && state.industry === "all";
  grid.classList.toggle("work-grid--index", isIndex);
  grid.classList.toggle("work-grid--featured", !isIndex && isDefaultView);
  grid.classList.toggle("work-grid--dense", !isIndex && !isDefaultView);
}

function setView(view) {
  if (state.view === view) return;
  state.view = view;
  document.querySelectorAll(".work-view").forEach((btn) => {
    const on = btn.dataset.view === view;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", String(on));
  });
  applyGridMode();
  syncUrl();

  const shown = Array.from(grid.querySelectorAll(".work-card")).filter(
    (c) => c.style.display !== "none",
  );
  gsap.fromTo(
    shown,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.45, stagger: 0.02, ease: "power3.out" },
  );
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
          stagger: 0.03,
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

function onFilter(group, value, tab) {
  if (isAnimating || state[group] === value) return;
  state[group] = value;

  document
    .querySelectorAll(`.filter-tab[data-group="${group}"]`)
    .forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-pressed", String(on));
    });

  refreshTabCounts();
  syncUrl();
  if (resetEl) resetEl.hidden = state.type === "all" && state.industry === "all";
  applyFilter();
}

function resetFilters() {
  if (isAnimating) return;
  state.type = "all";
  state.industry = "all";
  document.querySelectorAll(".filter-tab").forEach((t) => {
    const on = t.dataset.value === "all";
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-pressed", String(on));
  });
  refreshTabCounts();
  syncUrl();
  if (resetEl) resetEl.hidden = true;
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

// The filter bar pins itself once the plates start scrolling past, so the
// active filters and the running count stay reachable through a long grid.
function initStickyFilters() {
  if (!filtersEl) return;
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  filtersEl.parentNode.insertBefore(sentinel, filtersEl);
  new IntersectionObserver(
    ([entry]) => filtersEl.classList.toggle("is-pinned", !entry.isIntersecting),
    { threshold: 0 },
  ).observe(sentinel);
}

async function init() {
  if (!grid) return;
  projects = await fetchProjects();
  render();

  const cards = Array.from(grid.querySelectorAll(".work-card"));
  cards.forEach((c) => {
    c.style.display = matches(c) ? "" : "none";
  });
  const visible = cards.filter(matches);
  emptyEl.hidden = visible.length !== 0;

  document.querySelectorAll(".work-view").forEach((btn) => {
    const on = btn.dataset.view === state.view;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });
  if (resetEl) {
    resetEl.hidden = state.type === "all" && state.industry === "all";
    resetEl.addEventListener("click", resetFilters);
  }

  applyGridMode();
  updateCount(visible.length);
  initStickyFilters();
  reveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

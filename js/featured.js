import { projects, SERVICE_TYPES, getServiceType } from "/js/projects-data.js";

const LANG_KEY = "lumine-lang";
const currentLang = () => localStorage.getItem(LANG_KEY) || "en";

// One project per service type, so the first thing a visitor sees on Home
// already shows Lumine's full range — not three projects from one bucket.
function pickFeatured() {
  return SERVICE_TYPES.map((type) =>
    projects.find((p) => p.serviceType === type.id),
  ).filter(Boolean);
}

function cardInnerHTML(project, index, lang) {
  const type = getServiceType(project.serviceType);
  const label = lang === "ka" ? type.label_ka : type.label;
  return `
    <div class="featured-card-img" style="background-image: url('${project.cover}')"></div>
    <div class="featured-card-scrim"></div>
    <span class="featured-card-index">${String(index + 1).padStart(2, "0")}</span>
    <div class="featured-card-label">
      <span>${label}</span>
      <h6>${project.title}</h6>
    </div>
  `;
}

function buildCard(project, index, lang) {
  const card = document.createElement("a");
  card.href = `/project?slug=${project.slug}`;
  card.className = "featured-card card-base";
  card.innerHTML = cardInnerHTML(project, index, lang);
  return card;
}

function init() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  const featured = pickFeatured();
  featured.forEach((p, i) => grid.appendChild(buildCard(p, i, currentLang())));

  document.documentElement.addEventListener("lumine:langchange", (e) => {
    Array.from(grid.children).forEach((card, i) => {
      if (featured[i]) card.innerHTML = cardInnerHTML(featured[i], i, e.detail.lang);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

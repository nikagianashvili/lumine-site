import { projects, SERVICE_TYPES, getServiceType } from "/js/projects-data.js";

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

// One project per service type, so the first thing a visitor sees on Home
// already shows Lumine's full range — not three projects from one bucket.
function pickFeatured() {
  return SERVICE_TYPES.map((type) =>
    projects.find((proj) => proj.serviceType === type.id),
  ).filter(Boolean);
}

function buildCard(project, index) {
  const type = getServiceType(project.serviceType);
  const label = isKa ? type.label_ka : type.label;
  const card = document.createElement("a");
  card.href = `${p("/project")}?slug=${project.slug}`;
  card.className = "featured-card card-base";
  card.innerHTML = `
    <div class="featured-card-img" style="background-image: url('${project.cover}')"></div>
    <div class="featured-card-scrim"></div>
    <span class="featured-card-index">${String(index + 1).padStart(2, "0")}</span>
    <div class="featured-card-label">
      <span>${label}</span>
      <h6>${project.title}</h6>
    </div>
  `;
  return card;
}

function init() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  pickFeatured().forEach((proj, i) => grid.appendChild(buildCard(proj, i)));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

import { projects, SERVICE_TYPES, getServiceType } from "/js/projects-data.js";

// One project per service type, so the first thing a visitor sees on Home
// already shows Lumine's full range — not three projects from one bucket.
function pickFeatured() {
  return SERVICE_TYPES.map((type) =>
    projects.find((p) => p.serviceType === type.id),
  ).filter(Boolean);
}

function buildCard(project, index) {
  const type = getServiceType(project.serviceType);
  const card = document.createElement("a");
  card.href = `/project?slug=${project.slug}`;
  card.className = "featured-card card-base";
  card.innerHTML = `
    <div class="featured-card-img" style="background-image: url('${project.cover}')"></div>
    <div class="featured-card-scrim"></div>
    <span class="featured-card-index">${String(index + 1).padStart(2, "0")}</span>
    <div class="featured-card-label">
      <span>${type.label}</span>
      <h6>${project.title}</h6>
    </div>
  `;
  return card;
}

function init() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  pickFeatured().forEach((p, i) => grid.appendChild(buildCard(p, i)));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

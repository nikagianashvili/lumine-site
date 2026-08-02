import { SERVICE_TYPES, getServiceType, projectHref } from "/js/projects-data.js";
import { fetchProjects } from "/js/api-client.js";

let projects = [];

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);
const p = (route) => (isKa ? `/ka${route}` : route);

// One project per service type, so the first thing a visitor sees on Home
// already shows Lumine's full range — not three projects from one bucket.
//
// Delivered client work wins its slot over a concept every time. Without
// this the picker simply took the first match in registry order, which put
// speculative projects on the homepage while real ones sat unseen on /work —
// the least convincing possible arrangement.
function pickFeatured() {
  return SERVICE_TYPES.map((type) => {
    const ofType = projects.filter((proj) => proj.serviceType === type.id);
    return ofType.find((proj) => proj.status === "Completed") || ofType[0];
  }).filter(Boolean);
}

function buildCard(project, index) {
  const type = getServiceType(project.serviceType);
  const label = isKa ? type.label_ka : type.label;
  const card = document.createElement("a");
  card.href = projectHref(project, isKa);
  // no card-base: these are plates, matching the archive on /work
  card.className = "featured-card";
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

async function init() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  projects = await fetchProjects();
  pickFeatured().forEach((proj, i) => grid.appendChild(buildCard(proj, i)));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

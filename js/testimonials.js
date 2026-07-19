import { fetchProjects } from "/js/api-client.js";

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

// Only real, published projects carry a testimonial (set via the admin's
// Publish to Portfolio flow) - none exist yet, so this quietly leaves the
// three placeholder cards and their "placeholder" disclaimer alone until
// a real one does. No fake quotes invented here.
function withTestimonial(projects) {
  return projects.filter((p) => p.testimonial && p.testimonial.quote);
}

function buildCard(testimonial) {
  const quote = isKa ? testimonial.quote_ka || testimonial.quote : testimonial.quote;
  const author = isKa ? testimonial.author_ka || testimonial.author : testimonial.author;
  const card = document.createElement("div");
  card.className = "testimonial-card card-base";
  card.innerHTML = `
    <p class="testimonial-quote">"${quote}"</p>
    <p class="testimonial-attr">— ${author}</p>
  `;
  return card;
}

async function init() {
  const track = document.getElementById("testimonialTrack");
  if (!track) return;

  const projects = await fetchProjects();
  const real = withTestimonial(projects).slice(0, 3);
  if (real.length === 0) return;

  track.innerHTML = "";
  real.forEach((proj) => track.appendChild(buildCard(proj.testimonial)));

  const note = document.getElementById("testimonialNote");
  if (note) note.remove();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

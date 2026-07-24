// js/project-design.js
// All section builders + post-render interactivity for the `design`
// service-type single-project template. Exports designTemplate(proj, projects)
// (HTML string) and initDesignTemplate(root, proj) (wires interactivity) —
// both consumed by js/project.js's TEMPLATES/POST_INIT dispatch.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLightbox } from "/js/pd-lightbox.js";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

function t(project, field) {
  if (isKa && project[`${field}_ka`] !== undefined) return project[`${field}_ka`];
  return project[field];
}

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fineHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// ── Hero: "Title as Window" ─────────────────────────────────────────────────
// The hero image is revealed *through* the massive title on load (CSS
// background-clip: text), then the title recedes to a faint watermark as
// the full image fades in behind it; a scroll-scrubbed parallax between
// the two layers continues as the hero passes.

export function heroDesign(project, heroBadge, factsRow) {
  const tagline = t(project, "heroTagline") || t(project, "blurb");
  return `
    <section class="pdx-hero" data-pdx-hero>
      <div class="pdx-hero-stage">
        <h1
          class="pdx-hero-title"
          style="background-image:url('${project.cover}')"
          data-pdx-hero-title
        >${project.title}</h1>
        <div class="pdx-hero-media" data-pdx-hero-media>
          <img src="${project.cover}" alt="${project.title}" />
        </div>
      </div>
      <div class="container pdx-hero-meta">
        ${heroBadge(project)}
        <p class="pdx-hero-tagline pd-reveal">${tagline}</p>
        ${factsRow(project)}
      </div>
    </section>
  `;
}

export function initHeroDesign(root) {
  const stage = root.querySelector("[data-pdx-hero]");
  if (!stage) return;
  const title = stage.querySelector("[data-pdx-hero-title]");
  const media = stage.querySelector("[data-pdx-hero-media]");

  if (reduceMotion()) {
    gsap.set(media, { opacity: 1, scale: 1 });
    gsap.set(title, { opacity: 0.14 });
    return;
  }

  gsap.set(media, { opacity: 0, scale: 1.08 });
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(title, { scale: 1.15, duration: 1.4 })
    .to(media, { opacity: 1, scale: 1, duration: 1.2 }, "-=0.5")
    .to(title, { opacity: 0.14, duration: 1 }, "-=0.6");

  ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: "+=60%",
    scrub: 0.6,
    onUpdate: (self) => {
      gsap.set(media, { scale: 1 + self.progress * 0.08 });
      gsap.set(title, { yPercent: self.progress * -12 });
    },
  });
}

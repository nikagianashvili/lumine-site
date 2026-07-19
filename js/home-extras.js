import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── services: hover-follow image preview ────────────────────────────────────

function initServicePreviews() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const section = document.querySelector(".services-list");
  if (!section) return;

  const rows = Array.from(section.querySelectorAll(".service-row[data-image]"));
  if (!rows.length) return;

  const preview = document.createElement("div");
  preview.className = "service-preview";
  rows.forEach((row) => {
    const img = document.createElement("img");
    img.src = row.dataset.image;
    img.alt = "";
    preview.appendChild(img);
  });
  document.body.appendChild(preview);

  const imgs = Array.from(preview.querySelectorAll("img"));

  const pos = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let rafId = null;
  let visible = false;

  const render = () => {
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;
    gsap.set(preview, {
      x: pos.x,
      y: pos.y,
      xPercent: 8,
      yPercent: -50,
      rotation: (target.x - pos.x) * 0.04,
    });
    rafId = requestAnimationFrame(render);
  };

  const show = () => {
    if (!visible) {
      visible = true;
      gsap.to(preview, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" });
    }
    if (!rafId) rafId = requestAnimationFrame(render);
  };

  const hide = () => {
    visible = false;
    gsap.to(preview, {
      opacity: 0,
      scale: 0.9,
      duration: 0.35,
      ease: "power3.out",
      onComplete: () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      },
    });
  };

  section.addEventListener("mousemove", (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });

  rows.forEach((row, i) => {
    row.addEventListener("mouseenter", (e) => {
      imgs.forEach((img, j) => img.classList.toggle("is-active", i === j));
      target.x = e.clientX;
      target.y = e.clientY;
      pos.x = e.clientX;
      pos.y = e.clientY;
      show();
    });
  });

  section.addEventListener("mouseleave", hide);
}

// ── stats: count-up on scroll ────────────────────────────────────────────────

function initStatsCountUp() {
  document.querySelectorAll(".stat-item h2[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const counter = { value: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          value: end,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.value) + suffix;
          },
        });
      },
    });
  });
}

// ── manifesto: image parallax ────────────────────────────────────────────────

function initManifestoParallax() {
  const img = document.querySelector(".manifesto-img img");
  if (!img) return;

  gsap.fromTo(
    img,
    { yPercent: -10 },
    {
      yPercent: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".manifesto-img",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
}

// ── magnetic buttons ─────────────────────────────────────────────────────────

// Exported so pages that inject buttons dynamically after this module's own
// DOMContentLoaded pass (e.g. service.js building service.html from data)
// can re-run it once their content actually exists in the DOM.
export function initMagneticButtons() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  document.querySelectorAll(".btn[data-magnetic]").forEach((btn) => {
    const strength = 0.35;

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: "power3.out",
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
      });
    });
  });
}

function init() {
  initServicePreviews();
  initStatsCountUp();
  initManifestoParallax();
  initMagneticButtons();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

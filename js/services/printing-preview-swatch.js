// Sub-services float a small preview panel that follows the cursor - the
// same lerped cursor-follow interaction as the homepage's service-row
// photo preview (js/home-extras.js initServicePreviews), reused here with
// a halftone swatch instead of a photo since there's no real client
// photography for these yet.
import gsap from "gsap";

function init() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const section = document.querySelector(".ink-services-list");
  if (!section) return;
  const rows = Array.from(section.querySelectorAll(".ink-service-row"));
  if (!rows.length) return;

  const preview = document.createElement("div");
  preview.className = "ink-service-preview";
  preview.innerHTML =
    '<span class="ink-service-preview-run"></span><span class="ink-service-preview-swatch"></span>';
  document.body.appendChild(preview);
  const runEl = preview.querySelector(".ink-service-preview-run");
  const swatchEl = preview.querySelector(".ink-service-preview-swatch");

  const pos = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let rafId = null;
  let visible = false;

  function render() {
    pos.x += (target.x - pos.x) * 0.14;
    pos.y += (target.y - pos.y) * 0.14;
    gsap.set(preview, { x: pos.x, y: pos.y, xPercent: 6, yPercent: -50 });
    rafId = requestAnimationFrame(render);
  }

  function show() {
    if (!visible) {
      visible = true;
      gsap.to(preview, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" });
    }
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  function hide() {
    visible = false;
    gsap.to(preview, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power3.out",
      onComplete() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      },
    });
  }

  section.addEventListener("mousemove", (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });

  rows.forEach((row) => {
    row.addEventListener("mouseenter", (e) => {
      runEl.textContent = row.dataset.run || "";
      swatchEl.className = "ink-service-preview-swatch " + (row.dataset.swatch || "");
      target.x = e.clientX;
      target.y = e.clientY;
      pos.x = e.clientX;
      pos.y = e.clientY;
      show();
    });
  });

  section.addEventListener("mouseleave", hide);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

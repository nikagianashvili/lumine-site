// js/pd-lightbox.js
// Reusable GSAP-Flip openable-image lightbox. Any <button class="pdx-frame"
// data-lightbox-group="NAME"> wrapping an <img> becomes openable; buttons
// sharing the same group name become one prev/next sequence. Call
// initLightbox(root) once after the group's HTML is in the DOM.
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

let overlay, overlayImg, overlayCounter, overlayCloseBtn, prevBtn, nextBtn;
let groups = new Map();
let activeGroup = null;
let activeIndex = 0;
let lastFocused = null;
let built = false;

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildOverlay() {
  if (built) return;
  built = true;
  overlay = document.createElement("div");
  overlay.className = "pdx-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="pdx-lightbox-scrim" data-pdx-close></div>
    <button type="button" class="pdx-lightbox-nav pdx-lightbox-prev" aria-label="Previous image">‹</button>
    <img class="pdx-lightbox-img" alt="" />
    <button type="button" class="pdx-lightbox-nav pdx-lightbox-next" aria-label="Next image">›</button>
    <button type="button" class="pdx-lightbox-close" aria-label="Close">✕</button>
    <span class="pdx-lightbox-counter"></span>
  `;
  document.body.appendChild(overlay);
  overlayImg = overlay.querySelector(".pdx-lightbox-img");
  overlayCounter = overlay.querySelector(".pdx-lightbox-counter");
  overlayCloseBtn = overlay.querySelector(".pdx-lightbox-close");
  prevBtn = overlay.querySelector(".pdx-lightbox-prev");
  nextBtn = overlay.querySelector(".pdx-lightbox-next");

  overlay.querySelector(".pdx-lightbox-scrim").addEventListener("click", close);
  overlayCloseBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  document.addEventListener("keydown", onKeydown);

  let touchStartX = null;
  overlay.addEventListener("touchstart", (e) => (touchStartX = e.touches[0].clientX), { passive: true });
  overlay.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      touchStartX = null;
    },
    { passive: true },
  );
}

function onKeydown(e) {
  if (!overlay || overlay.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
}

function open(groupName, index, triggerEl) {
  buildOverlay();
  activeGroup = groupName;
  activeIndex = index;
  lastFocused = document.activeElement;

  const state = Flip.getState(triggerEl.querySelector("img"));
  render();
  overlay.hidden = false;
  document.body.classList.add("pdx-lightbox-open");

  if (!reduceMotion()) {
    Flip.from(state, { targets: overlayImg, duration: 0.5, ease: "power3.inOut", absolute: true });
  }
  overlayCloseBtn.focus();
}

function render() {
  const list = groups.get(activeGroup) || [];
  const el = list[activeIndex];
  if (!el) return;
  const img = el.querySelector("img");
  overlayImg.src = img.src;
  overlayImg.alt = img.alt || "";
  overlayCounter.textContent = `${activeIndex + 1} / ${list.length}`;
  prevBtn.hidden = list.length < 2;
  nextBtn.hidden = list.length < 2;
}

function step(delta) {
  const list = groups.get(activeGroup) || [];
  if (!list.length) return;
  activeIndex = (activeIndex + delta + list.length) % list.length;
  if (reduceMotion()) {
    render();
    return;
  }
  gsap.to(overlayImg, {
    opacity: 0,
    duration: 0.15,
    onComplete: () => {
      render();
      gsap.to(overlayImg, { opacity: 1, duration: 0.25 });
    },
  });
}

function close() {
  if (!overlay || overlay.hidden) return;
  const list = groups.get(activeGroup) || [];
  const triggerEl = list[activeIndex];
  const returnImg = triggerEl ? triggerEl.querySelector("img") : null;

  const finish = () => {
    overlay.hidden = true;
    document.body.classList.remove("pdx-lightbox-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  if (returnImg && !reduceMotion()) {
    const state = Flip.getState(overlayImg);
    overlayImg.src = returnImg.src;
    Flip.from(state, {
      targets: returnImg,
      duration: 0.4,
      ease: "power3.inOut",
      absolute: true,
      onComplete: finish,
    });
  } else {
    finish();
  }
}

export function initLightbox(root) {
  const frames = root.querySelectorAll("[data-lightbox-group]");
  frames.forEach((el) => {
    const groupName = el.dataset.lightboxGroup;
    if (!groups.has(groupName)) groups.set(groupName, []);
    const list = groups.get(groupName);
    const index = list.length;
    list.push(el);
    el.addEventListener("click", () => open(groupName, index, el));
  });
}

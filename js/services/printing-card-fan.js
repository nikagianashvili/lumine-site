// Sub-services as a fanned deck of proof cards: cursor proximity repels
// nearby cards (inverse-cube falloff) with a damped echo carrying into
// neighboring cards, each one spring-settling back to its rest position -
// reads like riffling through a hand of loose proofs on a table.
import gsap from "gsap";

const REST = [
  { x: -100, y: 8, rotation: -8 },
  { x: -34, y: -8, rotation: -2 },
  { x: 34, y: -8, rotation: 2 },
  { x: 100, y: 8, rotation: 8 },
];

const REPEL_RADIUS = 230;
const REPEL_STRENGTH = 70;
const SPRING = 0.12;
const DAMPING = 0.82;
const NEIGHBOR_INFLUENCE = 0.35;

function init() {
  const deck = document.getElementById("inkCardDeck");
  if (!deck) return;
  const cards = Array.from(deck.querySelectorAll(".ink-card"));
  if (!cards.length) return;

  const state = cards.map((el, i) => ({
    el,
    rest: REST[i] || { x: 0, y: 0, rotation: 0 },
    x: 0,
    y: 0,
    rotation: (REST[i] || { rotation: 0 }).rotation,
    vx: 0,
    vy: 0,
    vr: 0,
  }));

  state.forEach((s) => gsap.set(s.el, { x: s.rest.x, y: s.rest.y, rotation: s.rest.rotation }));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let mouseX = null,
    mouseY = null;

  deck.addEventListener("mousemove", (e) => {
    const rect = deck.getBoundingClientRect();
    mouseX = e.clientX - rect.left - rect.width / 2;
    mouseY = e.clientY - rect.top - rect.height / 2;
  });
  deck.addEventListener("mouseleave", () => {
    mouseX = null;
    mouseY = null;
  });

  function tick() {
    const rawFx = new Array(state.length).fill(0);
    const rawFy = new Array(state.length).fill(0);

    if (mouseX != null) {
      state.forEach((s, i) => {
        const cx = s.rest.x + s.x;
        const cy = s.rest.y + s.y;
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_RADIUS) {
          const falloff = Math.pow(1 - dist / REPEL_RADIUS, 3);
          const angle = Math.atan2(dy, dx);
          rawFx[i] += Math.cos(angle) * falloff * REPEL_STRENGTH;
          rawFy[i] += Math.sin(angle) * falloff * REPEL_STRENGTH;
        }
      });
    }

    state.forEach((s, i) => {
      let targetX = rawFx[i];
      let targetY = rawFy[i];
      state.forEach((_, j) => {
        if (i === j) return;
        const echo = Math.pow(NEIGHBOR_INFLUENCE, Math.abs(i - j));
        targetX += rawFx[j] * echo;
        targetY += rawFy[j] * echo;
      });

      s.vx += (targetX - s.x) * SPRING;
      s.vy += (targetY - s.y) * SPRING;
      s.vx *= DAMPING;
      s.vy *= DAMPING;
      s.x += s.vx;
      s.y += s.vy;

      const targetRotation = s.rest.rotation + gsap.utils.clamp(-14, 14, targetX * 0.05);
      s.vr += (targetRotation - s.rotation) * SPRING;
      s.vr *= DAMPING;
      s.rotation += s.vr;

      gsap.set(s.el, { x: s.rest.x + s.x, y: s.rest.y + s.y, rotation: s.rotation });
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

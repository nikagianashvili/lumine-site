// Ink-blot pie wipe, established once and reused at two scales: a full
// section divider (scroll-scrubbed, with a scattered dot-spatter texture)
// and the CTA button's click impression. Same describePie() math both
// times - a Pantone-swatch-style ink blot expanding to fill its container.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SVG_NS = "http://www.w3.org/2000/svg";

function describePie(cx, cy, r, startAngle, endAngle) {
  if (endAngle - startAngle <= 0.001) return "";
  if (endAngle - startAngle >= 359.99) {
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0 Z`;
  }
  const toRad = (deg) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function buildDots(group, count) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("cx", (Math.random() * 100).toFixed(2));
    c.setAttribute("cy", (Math.random() * 100).toFixed(2));
    c.setAttribute("r", (0.25 + Math.random() * 0.85).toFixed(2));
    c.setAttribute("fill", "white");
    frag.appendChild(c);
  }
  group.appendChild(frag);
}

function initDivider() {
  const divider = document.getElementById("inkWipeDivider");
  const piePath = document.getElementById("inkWipePie");
  const dotsGroup = document.getElementById("inkWipeDots");
  if (!divider || !piePath || !dotsGroup) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    piePath.setAttribute("d", describePie(50, 50, 75, 0, 360));
    return;
  }

  buildDots(dotsGroup, 140);

  ScrollTrigger.create({
    trigger: divider,
    start: "top 90%",
    end: "bottom 20%",
    scrub: 0.5,
    onUpdate(self) {
      piePath.setAttribute("d", describePie(50, 50, 75, 0, self.progress * 360));
    },
  });
}

function initBlotButton() {
  const btn = document.getElementById("inkBlotBtn");
  const piePath = document.getElementById("inkBtnPie");
  if (!btn || !piePath) return;

  const href = btn.getAttribute("href");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let animating = false;
  btn.addEventListener("click", (e) => {
    if (animating) return;
    e.preventDefault();
    animating = true;

    const proxy = { angle: 0 };
    gsap.to(proxy, {
      angle: 360,
      duration: 0.42,
      ease: "power2.in",
      onUpdate() {
        piePath.setAttribute("d", describePie(50, 50, 75, 0, proxy.angle));
      },
      onComplete() {
        window.location.href = href;
      },
    });
  });
}

function init() {
  initDivider();
  initBlotButton();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

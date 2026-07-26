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

// ── process: the route draws itself ──────────────────────────────────────────
// The line is drawn by scroll position rather than by a timed animation, so
// the visitor is the one moving the project through the studio. The brand
// mark rides the head of the line via getPointAtLength, and each stage marks
// itself reached as the line passes its node — which is what turns a list of
// six labels into a journey with a position in it.

function initProcessRoute() {
  const route = document.querySelector(".process-route");
  const line = route?.querySelector(".route-line");
  const head = route?.querySelector(".route-head");
  const steps = route ? [...route.querySelectorAll(".process-step")] : [];
  if (!route || !line || !steps.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = () => window.matchMedia("(max-width: 1000px)").matches;

  // Reduced motion, or the mobile rail: show the finished state and stop.
  if (reduced || narrow()) {
    line.style.strokeDasharray = "none";
    steps.forEach((s) => s.classList.add("is-reached"));
    return;
  }

  const svg = line.ownerSVGElement;
  const total = line.getTotalLength();
  line.style.strokeDasharray = String(total);
  line.style.strokeDashoffset = String(total);

  // The rail drifts sideways as it descends, so a node pinned to a fixed x
  // would sit off the line. Sample the path once per layout and look each
  // node's x up from its own row's vertical centre.
  let samples = [];
  let marks = [];

  // Path points come out in the SVG's own coordinates. The rail is inset in
  // the route (right gutter), so everything has to be shifted by the SVG's
  // offset before it can be compared with element positions.
  const frame = () => {
    const routeBox = route.getBoundingClientRect();
    const svgBox = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return {
      dx: svgBox.left - routeBox.left,
      dy: svgBox.top - routeBox.top,
      sx: svgBox.width / vb.width,
      sy: svgBox.height / vb.height,
    };
  };

  const measure = () => {
    const f = frame();

    samples = [];
    for (let i = 0; i <= 240; i++) {
      const pt = line.getPointAtLength((total * i) / 240);
      samples.push({ x: f.dx + pt.x * f.sx, y: f.dy + pt.y * f.sy, t: i / 240 });
    }

    marks = steps.map((step) => {
      const centre = step.offsetTop + step.offsetHeight / 2;
      // nearest sampled point on the rail at this row's height
      let best = samples[0];
      for (const s of samples) {
        if (Math.abs(s.y - centre) < Math.abs(best.y - centre)) best = s;
      }
      const node = step.querySelector(".process-node");
      if (node) node.style.left = `${best.x - step.offsetLeft}px`;
      return best.t;
    });
  };

  const draw = (p) => {
    const clamped = Math.max(0, Math.min(1, p));
    line.style.strokeDashoffset = String(total * (1 - clamped));

    if (head && samples.length) {
      const pt = line.getPointAtLength(total * clamped);
      const f = frame();
      head.style.transform = `translate(${f.dx + pt.x * f.sx}px, ${
        f.dy + pt.y * f.sy
      }px)`;
      head.style.opacity = clamped > 0.004 && clamped < 0.996 ? "1" : "0";
    }

    steps.forEach((s, i) => s.classList.toggle("is-reached", clamped >= marks[i]));
  };

  measure();
  draw(0);

  // The window is deliberately inset at both ends. Starting the moment the
  // section's top touches the viewport meant the line was already running
  // before the stages were readable; finishing exactly at its bottom meant
  // the line reached its final stop as that stop left the screen. Both ends
  // now sit inside the section, so the whole journey happens while you are
  // actually looking at it.
  ScrollTrigger.create({
    trigger: route,
    start: "top 70%",
    end: "bottom 80%",
    scrub: 0.5,
    invalidateOnRefresh: true,
    onRefresh: measure,
    onUpdate: (self) => draw(self.progress),
  });
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
  initProcessRoute();
  initStatsCountUp();
  initManifestoParallax();
  initMagneticButtons();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

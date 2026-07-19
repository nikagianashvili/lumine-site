// Photography page signature: frames "develop" from grayscale into color
// as they enter view, ambiently — the site's real hover mechanic promoted
// to a passive reveal for frames nobody's actively pointing at.
function initEarnColor() {
  const frames = document.querySelectorAll("[data-photo-earn]");
  if (!frames.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add("is-color"), i * 90);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 },
  );

  frames.forEach((frame) => observer.observe(frame));
}

// Photography hero signature: a hand-drawn camera-iris animation — real
// canvas geometry (rotating overlapping blades, a breathing aperture hole,
// a slow diagonal light-leak sweep), not a CSS gradient standing in for a
// photo. Purpose-built for this page; nothing here is reused elsewhere.
function initApertureHero() {
  const canvas = document.getElementById("photoAperture");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BLADES = 8;
  const BLADE_COLOR_A = "#ff6b45";
  const BLADE_COLOR_B = "#7e2810";
  const HOLE_COLOR = "#17130f";

  let W = 1,
    H = 1,
    dpr = 1;
  let running = true;
  let rafId = null;
  let t = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBlade(cx, cy, angleStart, arcSpan, outerR, innerR, skew) {
    const a1 = angleStart;
    const a2 = angleStart + arcSpan;
    const o1x = cx + outerR * Math.cos(a1);
    const o1y = cy + outerR * Math.sin(a1);
    const o2x = cx + outerR * Math.cos(a2);
    const o2y = cy + outerR * Math.sin(a2);
    const i1x = cx + innerR * Math.cos(a1 + skew);
    const i1y = cy + innerR * Math.sin(a1 + skew);
    const i2x = cx + innerR * Math.cos(a2 + skew);
    const i2y = cy + innerR * Math.sin(a2 + skew);

    ctx.beginPath();
    ctx.moveTo(o1x, o1y);
    ctx.lineTo(o2x, o2y);
    ctx.lineTo(i2x, i2y);
    ctx.lineTo(i1x, i1y);
    ctx.closePath();

    const grad = ctx.createLinearGradient(o1x, o1y, i1x, i1y);
    grad.addColorStop(0, BLADE_COLOR_A);
    grad.addColorStop(1, BLADE_COLOR_B);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(23,19,15,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = HOLE_COLOR;
    ctx.fillRect(0, 0, W, H);

    const cx = W * 0.62;
    const cy = H * 0.42;
    const outerR = Math.max(W, H) * 0.62;
    const breathe = reduced ? 0 : Math.sin(t * 0.4) * 0.05 + Math.sin(t * 0.13) * 0.03;
    const innerR = outerR * (0.16 + breathe);
    const rotation = reduced ? 0 : t * 0.045;
    const arcSpan = (Math.PI * 2) / BLADES;
    const gap = arcSpan * 0.05;
    const skew = 0.22;

    for (let i = 0; i < BLADES; i++) {
      const start = i * arcSpan + rotation + gap / 2;
      drawBlade(cx, cy, start, arcSpan - gap, outerR, innerR, skew);
    }

    // aperture hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = HOLE_COLOR;
    ctx.fill();

    // slow diagonal light-leak sweep
    if (!reduced) {
      const sweepT = (t * 0.05) % 1;
      const lx = -W * 0.3 + sweepT * W * 1.6;
      const ly = H * 0.15;
      const leak = ctx.createRadialGradient(lx, ly, 0, lx, ly, W * 0.5);
      leak.addColorStop(0, "rgba(255,180,140,0.22)");
      leak.addColorStop(1, "rgba(255,180,140,0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = leak;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  function tick() {
    rafId = null;
    if (!running) return;
    t += 1 / 60;
    draw();
    if (!reduced) rafId = requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => {
    resize();
    draw();
  });
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
    if (running && rafId == null && !reduced) rafId = requestAnimationFrame(tick);
  });

  resize();
  draw();
  if (!reduced) rafId = requestAnimationFrame(tick);
}

function init() {
  initEarnColor();
  initApertureHero();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

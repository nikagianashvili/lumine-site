// Proof-of-concept signature: a cursor-driven material spotlight — a 2D
// overlay-blended radial gradient that trails the cursor over the stock
// samples, so the paper reads as something with a real surface instead
// of a flat swatch.
function initProofSpotlight() {
  const canvas = document.getElementById("pressProofSpotlight");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 1,
    H = 1,
    dpr = 1;
  let targetX = 0,
    targetY = 0;
  let curX = 0,
    curY = 0;
  let running = true;
  let rafId = null;
  let hovering = false;
  let hasPosition = false;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!hovering) return;

    const r = Math.max(W, H) * 0.32;
    const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, r);
    grad.addColorStop(0, "rgba(255,255,255,0.55)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.18)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // thin bright sheen line through the highlight, like light catching a
    // soft-touch/laminate finish at a grazing angle
    ctx.save();
    ctx.translate(curX, curY);
    ctx.rotate(-0.35);
    const sheen = ctx.createLinearGradient(-r * 0.6, 0, r * 0.6, 0);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.35)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(-r * 0.6, -6, r * 1.2, 12);
    ctx.restore();
  }

  function tick() {
    rafId = null;
    if (!running) return;
    curX += (targetX - curX) * 0.15;
    curY += (targetY - curY) * 0.15;
    draw();
    rafId = requestAnimationFrame(tick);
  }

  function ensureTick() {
    if (rafId == null && !reduced) rafId = requestAnimationFrame(tick);
  }

  const wrap = canvas.parentElement;
  wrap.addEventListener("mousemove", (e) => {
    const r = wrap.getBoundingClientRect();
    targetX = e.clientX - r.left;
    targetY = e.clientY - r.top;
    if (!hasPosition) {
      curX = targetX;
      curY = targetY;
      hasPosition = true;
    }
    hovering = true;
    ensureTick();
  });
  wrap.addEventListener("mouseleave", () => {
    hovering = false;
  });
  window.addEventListener("resize", () => {
    resize();
    draw();
  });
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
    if (running) ensureTick();
  });

  resize();
  ensureTick();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProofSpotlight);
} else {
  initProofSpotlight();
}

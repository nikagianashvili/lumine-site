// Web page hero signature: a literal responsive grid, alive. Adapted from
// the "grid deformation" technique (a displacement field that ripples out
// from the cursor and relaxes back) but built here as a plain mesh of
// points and connecting lines instead of a shader-warped image/video - no
// Three.js, no source media, just the grid math itself made visible,
// which is the actual point for a web-development page.

function initWebGrid() {
  const canvas = document.getElementById("webGridCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rs = getComputedStyle(document.documentElement);
  const ink = rs.getPropertyValue("--d").trim() || "#17130f";
  const accent = rs.getPropertyValue("--accent").trim() || "#f2542d";

  const CELL = 34;
  const RELAXATION = 0.9;
  const MOUSE_RADIUS = 130;
  const MOUSE_STRENGTH = 18;

  let W = 1,
    H = 1,
    dpr = 1;
  let cols = 0,
    rows = 0;
  let dx = null,
    dy = null,
    vx = null,
    vy = null;
  let mouseX = -9999,
    mouseY = -9999;
  let running = true;
  let rafId = null;

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

    cols = Math.ceil(W / CELL) + 1;
    rows = Math.ceil(H / CELL) + 1;
    dx = new Float32Array(cols * rows);
    dy = new Float32Array(cols * rows);
    vx = new Float32Array(cols * rows);
    vy = new Float32Array(cols * rows);
  }

  function point(rx, ry) {
    const i = ry * cols + rx;
    return [rx * CELL + dx[i], ry * CELL + dy[i]];
  }

  function step() {
    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        const i = ry * cols + rx;
        const px = rx * CELL;
        const py = ry * CELL;
        const ddx = px - mouseX;
        const ddy = py - mouseY;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < MOUSE_RADIUS && dist > 0.001) {
          const force = Math.pow(1 - dist / MOUSE_RADIUS, 2) * MOUSE_STRENGTH;
          vx[i] += (ddx / dist) * force;
          vy[i] += (ddy / dist) * force;
        }
        vx[i] *= RELAXATION;
        vy[i] *= RELAXATION;
        dx[i] += vx[i] * 0.12 - dx[i] * 0.06;
        dy[i] += vy[i] * 0.12 - dy[i] * 0.06;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(23,19,15,0.1)";
    ctx.lineWidth = 1;
    for (let ry = 0; ry < rows; ry++) {
      ctx.beginPath();
      for (let rx = 0; rx < cols; rx++) {
        const [x, y] = point(rx, ry);
        if (rx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let rx = 0; rx < cols; rx++) {
      ctx.beginPath();
      for (let ry = 0; ry < rows; ry++) {
        const [x, y] = point(rx, ry);
        if (ry === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        const i = ry * cols + rx;
        const disp = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]);
        if (disp < 0.4) continue;
        const [x, y] = point(rx, ry);
        ctx.fillStyle = accent;
        ctx.globalAlpha = Math.min(0.9, disp / 12);
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  function tick() {
    rafId = null;
    if (!running) return;
    step();
    draw();
    rafId = requestAnimationFrame(tick);
  }

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });
  canvas.addEventListener("mouseleave", () => {
    mouseX = -9999;
    mouseY = -9999;
  });
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWebGrid);
} else {
  initWebGrid();
}

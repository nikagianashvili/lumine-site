// AI page hero signature: reactive ASCII text field. "AI" is rendered to an
// offscreen canvas, sampled cell-by-cell for brightness, mapped onto a
// monospace character ramp (dense chars where the letterforms are, faint
// chars everywhere else), then pushed around by the cursor with simple
// spring physics and left to shimmer faintly at rest. Hand-built Canvas2D,
// no dependency - a from-scratch technique for this page, not a reuse of
// strategy's fluid sim or photography's iris.

const RAMP = " .:-=+*#%@"; // sparse -> dense
const CELL = 15;

function initAiAscii() {
  const canvas = document.getElementById("aiAsciiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rs = getComputedStyle(document.documentElement);
  const accent = rs.getPropertyValue("--accent").trim() || "#f2542d";
  const accentBright = rs.getPropertyValue("--accent-bright").trim() || "#ff6b45";
  const faint = "rgba(246, 241, 231, 0.18)";

  let W = 1,
    H = 1,
    dpr = 1;
  let cols = 0,
    rows = 0;
  let brightness = null; // Float32Array, 0 (dark/dense) .. 1 (light/sparse)
  let offX = null,
    offY = null,
    velX = null,
    velY = null; // per-cell spring offsets
  let shimmerPhase = null;

  let mouseX = -9999,
    mouseY = -9999;
  let running = true;
  let rafId = null;

  function sampleTextField() {
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const octx = off.getContext("2d");
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, W, H);
    octx.fillStyle = "#000000";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    const fontSize = Math.min(W * 0.42, H * 0.62);
    octx.font = `700 ${fontSize}px "LK Lumina", sans-serif`;
    octx.fillText("AI", W * 0.68, H * 0.52);

    const img = octx.getImageData(0, 0, W, H).data;
    cols = Math.ceil(W / CELL);
    rows = Math.ceil(H / CELL);
    brightness = new Float32Array(cols * rows);

    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        const px = Math.min(W - 1, rx * CELL + CELL / 2) | 0;
        const py = Math.min(H - 1, ry * CELL + CELL / 2) | 0;
        const idx = (py * W + px) * 4;
        const lum = (0.299 * img[idx] + 0.587 * img[idx + 1] + 0.114 * img[idx + 2]) / 255;
        brightness[ry * cols + rx] = lum;
      }
    }

    offX = new Float32Array(cols * rows);
    offY = new Float32Array(cols * rows);
    velX = new Float32Array(cols * rows);
    velY = new Float32Array(cols * rows);
    shimmerPhase = new Float32Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) shimmerPhase[i] = Math.random() * Math.PI * 2;
  }

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
    ctx.font = `${CELL}px "SF Mono", ui-monospace, Menlo, Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    sampleTextField();
  }

  const PUSH_RADIUS = 90;
  const PUSH_FORCE = 14;
  const SPRING = 0.06;
  const DAMPING = 0.85;

  function step() {
    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        const i = ry * cols + rx;
        const cx = rx * CELL + CELL / 2;
        const cy = ry * CELL + CELL / 2;

        if (!reduced) {
          const dx = cx - mouseX;
          const dy = cy - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < PUSH_RADIUS && dist > 0.001) {
            const force = Math.pow(1 - dist / PUSH_RADIUS, 2) * PUSH_FORCE;
            velX[i] += (dx / dist) * force;
            velY[i] += (dy / dist) * force;
          }
        }

        velX[i] += -offX[i] * SPRING;
        velY[i] += -offY[i] * SPRING;
        velX[i] *= DAMPING;
        velY[i] *= DAMPING;
        offX[i] += velX[i];
        offY[i] += velY[i];
      }
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        const i = ry * cols + rx;
        const b = brightness[i];
        if (b > 0.92) continue; // pure background, skip entirely

        const dense = b < 0.55;
        let rampIdx = Math.min(RAMP.length - 1, Math.floor((1 - b) * RAMP.length));
        if (dense && !reduced) {
          // gentle shimmer on the letterforms only
          const shimmer = Math.sin(t * 0.0025 + shimmerPhase[i]) * 0.5 + 0.5;
          rampIdx = Math.max(0, Math.min(RAMP.length - 1, rampIdx - Math.round(shimmer * 1.5)));
        }
        const ch = RAMP[rampIdx];
        if (ch === " ") continue;

        const cx = rx * CELL + CELL / 2 + (reduced ? 0 : offX[i]);
        const cy = ry * CELL + CELL / 2 + (reduced ? 0 : offY[i]);

        ctx.fillStyle = dense ? (rampIdx > RAMP.length - 3 ? accentBright : accent) : faint;
        ctx.fillText(ch, cx, cy);
      }
    }
  }

  function tick(t) {
    rafId = null;
    if (!running) return;
    step();
    draw(t);
    if (!reduced) rafId = requestAnimationFrame(tick);
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
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
    if (running && rafId == null) rafId = requestAnimationFrame(tick);
  });

  resize();
  draw(0);
  if (!reduced) rafId = requestAnimationFrame(tick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAiAscii);
} else {
  initAiAscii();
}

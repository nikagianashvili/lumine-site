// The Screen — an interactive halftone dot-render of the Lumine mark. A
// press doesn't reproduce continuous tone directly, it fakes it with dot
// size (bigger dot = darker). Adapted from the Codegrid ASCII-logo push-
// physics grid technique: swapped the cycling ASCII glyphs for actual ink
// dots sized by brightness, and dropped the glyph-cycling tick since real
// ink dots don't flicker, only scatter when disturbed.
function init() {
  const canvas = document.getElementById("pressScreenCanvas");
  const source = document.getElementById("pressScreenSource");
  if (!canvas || !source) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = canvas.parentElement;

  const CELL = 10;
  const GAP = 2;
  const STEP = CELL + GAP;
  const PUSH_RADIUS = 4.5;
  const PUSH_FORCE = 30;
  const SPRING = 0.025;
  const DAMPING = 0.5;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0,
    H = 0,
    cols = 0,
    rows = 0;
  let cells = [];

  function resize() {
    const rect = stage.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    cols = Math.max(1, Math.floor(W / STEP));
    rows = Math.max(1, Math.floor(H / STEP));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sample();
  }

  function sample() {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = cols;
    sampleCanvas.height = rows;
    const sctx = sampleCanvas.getContext("2d");
    sctx.fillStyle = "#fff";
    sctx.fillRect(0, 0, cols, rows);

    const iw = source.naturalWidth || source.width || 1;
    const ih = source.naturalHeight || source.height || 1;
    const scale = Math.min(cols / iw, rows / ih) * 0.72;
    const dw = iw * scale;
    const dh = ih * scale;
    sctx.drawImage(source, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
    const { data } = sctx.getImageData(0, 0, cols, rows);

    cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = (row * cols + col) * 4;
        const brightness = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
        cells.push({ col, row, ink: 1 - brightness, offsetX: 0, offsetY: 0, velX: 0, velY: 0 });
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(23, 19, 15, 0.88)";
    for (const c of cells) {
      if (c.ink <= 0.04) continue;
      const radius = (CELL / 2) * Math.min(1, c.ink * 1.15);
      const x = (c.col + c.offsetX) * STEP + CELL / 2;
      const y = (c.row + c.offsetY) * STEP + CELL / 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const mouse = { col: -999, row: -999, active: false };
  let idleTimer = null;

  function updatePhysics() {
    for (const c of cells) {
      if (c.ink <= 0.04) continue;
      if (mouse.active) {
        const dx = c.col + c.offsetX - mouse.col;
        const dy = c.row + c.offsetY - mouse.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PUSH_RADIUS && dist > 0) {
          const force = (1 - dist / PUSH_RADIUS) ** 2 * PUSH_FORCE;
          c.velX += (dx / dist) * force * 0.03;
          c.velY += (dy / dist) * force * 0.03;
        }
      }
      c.velX += -c.offsetX * SPRING;
      c.velY += -c.offsetY * SPRING;
      c.velX *= DAMPING;
      c.velY *= DAMPING;
      c.offsetX += c.velX;
      c.offsetY += c.velY;
    }
  }

  function tick() {
    updatePhysics();
    render();
    requestAnimationFrame(tick);
  }

  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    mouse.col = (e.clientX - rect.left) / STEP;
    mouse.row = (e.clientY - rect.top) / STEP;
    mouse.active = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      mouse.active = false;
    }, 60);
  });

  stage.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  window.addEventListener("resize", resize);

  function start() {
    resize();
    if (reduced) {
      render();
      return;
    }
    tick();
  }

  if (source.complete) start();
  else source.addEventListener("load", start);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

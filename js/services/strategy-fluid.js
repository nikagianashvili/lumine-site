// Strategy hero visual: the same GPU particle-fluid engine that drives the
// site-wide footer spectacle (wrappedgl.js + simulator.js, loaded globally
// in <head>), remounted into a dedicated hero panel with its own tuning —
// fewer particles, transparent canvas, accent-toned "flowing ink" instead
// of the footer's solid silhouette. Real-time GPU sim, not a video loop or
// a static image: mouse-reactive, runs continuously while the hero is on
// screen, pauses on tab-hide and respects reduced-motion.

const CFG = {
  targetParticles: 550,
  maxParticles: 900,
  particlesTextureWidth: 256,

  particleSize: 6.5,

  gridWidth: 30,
  gridHeight: 30,
  gridDepth: 10,
  particlesPerCell: 0.1,

  spawnAabbMin: [4, 4, 0],
  spawnAabbMax: [26, 26, 10],

  flipness: 0.55,
  timeStep: 1 / 60,
  gridCellDensity: 0.35,

  mouseForce: 1.0,
  mouseVelGain: 0.5,
  mouseVelMax: 5,
  mouseSmoothing: 0.25,

  separationMinDist: 0.75,
  separationStrength: 0.5,
  separationIters: 2,
};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function initStrategyFluid() {
  if (typeof WrappedGL === "undefined" || typeof Simulator === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Matches the CSS breakpoint that hides .strat-hero-fluid on narrow
  // viewports - skip mounting the GPU context entirely there rather than
  // creating one behind a display:none panel.
  if (window.matchMedia("(max-width: 900px)").matches) return;

  const mount = document.getElementById("stratHeroFluid");
  if (!mount) return;

  const rs = getComputedStyle(document.documentElement);
  const bright = hexToRgb(rs.getPropertyValue("--accent-bright").trim() || "#ff6b45");
  const deep = hexToRgb(rs.getPropertyValue("--accent-deep").trim() || "#7e2810");
  const base = hexToRgb(rs.getPropertyValue("--accent").trim() || "#f2542d");

  let CW = 1,
    CH = 1;
  let hover = false;
  let visible = true;
  let rafId = null;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  mount.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const starPath = new Path2D(
    "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  );
  const starScale = (CFG.particleSize * 1.4) / 24;

  let simCanvas, wgl, simulator, readState;
  let simReady = false;

  let N = 0,
    particlesWidth = 0,
    particlesHeight = 0;
  let positionPixels = null;
  let rotArr = null,
    rotVArr = null,
    densArr = null;

  let mouseX = 0,
    mouseY = 0,
    mousePrevX = 0,
    mousePrevY = 0;
  let mouseVelSmoothX = 0,
    mouseVelSmoothY = 0;
  const mouseVelocity = new Float32Array(3);
  const mouseRayOrigin = new Float32Array(3);
  const mouseRayDirection = new Float32Array([0, 0, 1]);

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function randomPointInAabb(min, max) {
    return [lerp(min[0], max[0], Math.random()), lerp(min[1], max[1], Math.random()), lerp(min[2], max[2], Math.random())];
  }

  function computeResolutions() {
    const gridCells = CFG.gridWidth * CFG.gridHeight * CFG.gridDepth * CFG.gridCellDensity;
    const gy = Math.ceil(Math.pow(gridCells / 2, 1 / 3));
    return { gridResolutionX: gy * 2, gridResolutionY: gy, gridResolutionZ: gy };
  }

  function buildInitialPositions() {
    const positions = new Array(particlesWidth * particlesHeight);
    for (let i = 0; i < N; i++) positions[i] = randomPointInAabb(CFG.spawnAabbMin, CFG.spawnAabbMax);
    for (let i = N; i < particlesWidth * particlesHeight; i++) {
      positions[i] = [Math.random() * CFG.gridWidth, Math.random() * CFG.gridHeight, Math.random() * CFG.gridDepth];
    }
    return positions;
  }

  function initCpuState() {
    const desired = Math.min(CFG.targetParticles, CFG.maxParticles);
    const w = CFG.particlesTextureWidth;
    const h = Math.max(1, Math.ceil(desired / w));
    particlesWidth = w;
    particlesHeight = h;
    N = desired;

    positionPixels = new Float32Array(particlesWidth * particlesHeight * 4);
    rotArr = new Float32Array(N);
    rotVArr = new Float32Array(N);
    densArr = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      rotArr[i] = Math.random() * Math.PI * 2;
      rotVArr[i] = (Math.random() - 0.5) * 0.12;
    }
  }

  function initGpuSim(onReady) {
    simReady = false;
    simCanvas = document.createElement("canvas");
    simCanvas.width = Math.max(1, Math.floor(CW));
    simCanvas.height = Math.max(1, Math.floor(CH));

    wgl = new WrappedGL(simCanvas, { alpha: false, antialias: false, premultipliedAlpha: false });
    wgl.getExtension("OES_texture_float");
    wgl.getExtension("OES_texture_float_linear");
    wgl.getExtension("WEBGL_color_buffer_float");
    wgl.getExtension("OES_texture_half_float");
    wgl.getExtension("OES_texture_half_float_linear");
    readState = wgl.createReadState();

    simulator = new Simulator(wgl, () => {
      simulator.flipness = CFG.flipness;
      const { gridResolutionX, gridResolutionY, gridResolutionZ } = computeResolutions();
      simulator.reset(
        particlesWidth,
        particlesHeight,
        buildInitialPositions(),
        [CFG.gridWidth, CFG.gridHeight, CFG.gridDepth],
        [gridResolutionX, gridResolutionY, gridResolutionZ],
        CFG.particlesPerCell,
      );
      simReady = true;
      onReady?.();
    });
  }

  function readBackPositions() {
    wgl.framebufferTexture2D(simulator.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, simulator.particlePositionTexture, 0);
    readState.bindFramebuffer(simulator.simulationFramebuffer);
    wgl.readPixels(readState, 0, 0, particlesWidth, particlesHeight, wgl.RGBA, wgl.FLOAT, positionPixels);
  }

  // Lightweight O(n^2) separation is fine at ~550 particles (footer's spatial
  // hash exists to handle 1500+; not worth the complexity here).
  function enforceSeparation() {
    const minDist = CFG.separationMinDist;
    const minDist2 = minDist * minDist;
    for (let iter = 0; iter < CFG.separationIters; iter++) {
      for (let i = 0; i < N; i++) {
        const i4 = i * 4;
        for (let j = i + 1; j < N; j++) {
          const j4 = j * 4;
          const dx = positionPixels[i4] - positionPixels[j4];
          const dy = positionPixels[i4 + 1] - positionPixels[j4 + 1];
          const d2 = dx * dx + dy * dy;
          if (d2 >= minDist2 || d2 < 1e-10) continue;
          const d = Math.sqrt(d2);
          const overlap = ((minDist - d) / d) * 0.5 * CFG.separationStrength;
          const px = dx * overlap;
          const py = dy * overlap;
          positionPixels[i4] += px;
          positionPixels[i4 + 1] += py;
          positionPixels[j4] -= px;
          positionPixels[j4 + 1] -= py;
        }
      }
    }
  }

  let uploadData = null;
  function uploadPositions() {
    if (!uploadData || uploadData.length !== positionPixels.length) uploadData = new Float32Array(positionPixels.length);
    uploadData.set(positionPixels);
    wgl.rebuildTexture(
      simulator.particlePositionTexture,
      wgl.RGBA,
      wgl.FLOAT,
      particlesWidth,
      particlesHeight,
      uploadData,
      wgl.CLAMP_TO_EDGE,
      wgl.CLAMP_TO_EDGE,
      wgl.NEAREST,
      wgl.NEAREST,
    );
  }

  function updateDerived(dt) {
    for (let i = 0; i < N; i++) {
      rotArr[i] += rotVArr[i] * dt * 60;
      densArr[i] = Math.max(0, Math.min(1, densArr[i] * 0.92 + Math.random() * 0.02));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, CW, CH);
    for (let i = 0; i < N; i++) {
      const wx = positionPixels[i * 4];
      const wy = positionPixels[i * 4 + 1];
      const x = (wx / CFG.gridWidth) * CW;
      const y = CH - (wy / CFG.gridHeight) * CH;
      if (x < -10 || x > CW + 10 || y < -10 || y > CH + 10) continue;

      const t = densArr[i];
      const c = t > 0.5 ? bright : t > 0.2 ? base : deep;

      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      ctx.translate(x, y);
      ctx.rotate(rotArr[i]);
      ctx.scale(starScale, starScale);
      ctx.translate(-11.94, -11.94);
      ctx.fill(starPath);
      ctx.restore();
    }
  }

  function resize() {
    CW = Math.max(1, mount.clientWidth || 1);
    CH = Math.max(1, mount.clientHeight || 1);
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(CW * dpr);
    canvas.height = Math.floor(CH * dpr);
    canvas.style.width = CW + "px";
    canvas.style.height = CH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initCpuState();
    initGpuSim(() => {
      readBackPositions();
    });
  }

  function tick() {
    rafId = null;
    if (!visible) return;

    if (simReady) {
      const dt = CFG.timeStep;
      const dmx = mouseX - mousePrevX;
      const dmy = mouseY - mousePrevY;
      const simMx = (mouseX / Math.max(1, CW)) * CFG.gridWidth;
      const simMy = ((CH - mouseY) / Math.max(1, CH)) * CFG.gridHeight;

      let vxW = 0,
        vyW = 0;
      if (hover) {
        vxW = (((dmx * CFG.mouseVelGain) / Math.max(1, CW)) * CFG.gridWidth) / dt;
        vyW = ((((-dmy) * CFG.mouseVelGain) / Math.max(1, CH)) * CFG.gridHeight) / dt;
        mouseVelSmoothX = mouseVelSmoothX * CFG.mouseSmoothing + vxW * (1 - CFG.mouseSmoothing);
        mouseVelSmoothY = mouseVelSmoothY * CFG.mouseSmoothing + vyW * (1 - CFG.mouseSmoothing);
        vxW = clamp(mouseVelSmoothX, -CFG.mouseVelMax, CFG.mouseVelMax) * CFG.mouseForce;
        vyW = clamp(mouseVelSmoothY, -CFG.mouseVelMax, CFG.mouseVelMax) * CFG.mouseForce;
      } else {
        mouseVelSmoothX *= 0.9;
        mouseVelSmoothY *= 0.9;
      }

      mouseVelocity[0] = vxW;
      mouseVelocity[1] = vyW;
      mouseVelocity[2] = 0;
      mouseRayOrigin[0] = simMx;
      mouseRayOrigin[1] = simMy;
      mouseRayOrigin[2] = -1000;

      simulator.simulate(dt, mouseVelocity, mouseRayOrigin, mouseRayDirection);
      readBackPositions();
      enforceSeparation();
      uploadPositions();
      updateDerived(dt);
      draw();

      mousePrevX = mouseX;
      mousePrevY = mouseY;
    }

    if (visible) rafId = requestAnimationFrame(tick);
  }

  function ensureTick() {
    if (rafId == null) rafId = requestAnimationFrame(tick);
  }

  mount.addEventListener("mousemove", (e) => {
    const r = mount.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });
  mount.addEventListener("mouseenter", () => (hover = true));
  mount.addEventListener("mouseleave", () => (hover = false));
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
    if (visible) ensureTick();
  });

  resize();
  ensureTick();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStrategyFluid);
} else {
  initStrategyFluid();
}

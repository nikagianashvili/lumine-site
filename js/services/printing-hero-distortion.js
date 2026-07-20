// Hero signature: the headline is rendered to a canvas texture and pushed
// through a Three.js shader that distorts it like ink plates slipping out
// of register under mechanical stress. A low-res grid of decaying offset
// vectors gets nudged by cursor velocity (inverse-distance falloff), and
// the fragment shader samples R/G/B at slightly different offsets on top
// of that distortion - real chromatic misregistration, not a color filter.
import * as THREE from "three";

const GRID = 24;
const RELAX = 0.9;
const INJECT_RADIUS = 3.4;
const INJECT_STRENGTH = 26;
const DISTORT_STRENGTH = 0.05;
const ABERRATION = 1.7;

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform sampler2D uData;
  uniform float uStrength;
  uniform float uAberration;
  varying vec2 vUv;

  void main() {
    vec2 offset = (texture2D(uData, vUv).rg - 0.5) * 2.0 * uStrength;
    float r = texture2D(uTexture, vUv + offset).r;
    float g = texture2D(uTexture, vUv + offset * uAberration).g;
    float b = texture2D(uTexture, vUv + offset * uAberration * uAberration).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

function readVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function layoutLines(ctx, words, maxWidth) {
  const spaceWidth = ctx.measureText(" ").width;
  const lines = [];
  let current = [];
  let currentWidth = 0;
  words.forEach((w) => {
    const wWidth = ctx.measureText(w).width;
    const addWidth = current.length ? spaceWidth + wWidth : wWidth;
    if (currentWidth + addWidth > maxWidth && current.length) {
      lines.push(current);
      current = [w];
      currentWidth = wWidth;
    } else {
      current.push(w);
      currentWidth += addWidth;
    }
  });
  if (current.length) lines.push(current);
  return lines;
}

function buildHeadlineTexture(width, height) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const paper = readVar("--l", "#f6f1e7");
  const ink = readVar("--d", "#17130f");
  const accent = readVar("--accent", "#f2542d");

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);

  const fontSize = Math.max(28, Math.min(width * 0.115, height * 0.32));
  const lineHeight = fontSize * 1.02;
  ctx.font = `700 ${fontSize}px "LK Lumina", sans-serif`;
  ctx.textBaseline = "alphabetic";

  const words = "SOMETHING YOU CAN HOLD.".split(" ");
  const startX = width * 0.055;
  const maxWidth = width * 0.88;
  const lines = layoutLines(ctx, words, maxWidth);

  const totalHeight = lineHeight * lines.length;
  const startY = height / 2 - totalHeight / 2 + fontSize * 0.8;

  lines.forEach((lineWords, li) => {
    let x = startX;
    const y = startY + li * lineHeight;
    lineWords.forEach((w, wi) => {
      const isLastOverall = li === lines.length - 1 && wi === lineWords.length - 1;
      ctx.fillStyle = isLastOverall ? accent : ink;
      ctx.fillText(w, x, y);
      x += ctx.measureText(w).width + ctx.measureText(" ").width;
    });
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function init() {
  const stage = document.getElementById("inkHeroStage");
  const canvas = document.getElementById("inkHeroCanvas");
  const fallbackText = document.getElementById("inkHeroText");
  if (!stage || !canvas || !fallbackText) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.WebGLRenderingContext) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const dataArray = new Float32Array(GRID * GRID * 4);
  for (let i = 0; i < GRID * GRID; i++) {
    dataArray[i * 4 + 0] = 0.5;
    dataArray[i * 4 + 1] = 0.5;
  }
  const dataTexture = new THREE.DataTexture(dataArray, GRID, GRID, THREE.RGBAFormat, THREE.FloatType);
  dataTexture.minFilter = THREE.LinearFilter;
  dataTexture.magFilter = THREE.LinearFilter;
  dataTexture.needsUpdate = true;

  let headlineTexture = null;
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: null },
      uData: { value: dataTexture },
      uStrength: { value: DISTORT_STRENGTH },
      uAberration: { value: ABERRATION },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  let W = 1,
    H = 1;

  function resize() {
    const rect = stage.getBoundingClientRect();
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, true);

    if (headlineTexture) headlineTexture.dispose();
    headlineTexture = buildHeadlineTexture(W, H);
    material.uniforms.uTexture.value = headlineTexture;
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  // pointer velocity -> distortion grid injection
  let lastX = null,
    lastY = null;
  function toGrid(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = 1 - (clientY - rect.top) / rect.height;
    return [nx * GRID, ny * GRID];
  }

  function injectForce(gx, gy, vx, vy) {
    const r = INJECT_RADIUS;
    const minX = Math.max(0, Math.floor(gx - r));
    const maxX = Math.min(GRID - 1, Math.ceil(gx + r));
    const minY = Math.max(0, Math.floor(gy - r));
    const maxY = Math.min(GRID - 1, Math.ceil(gy + r));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d = Math.hypot(x - gx, y - gy);
        if (d > r) continue;
        const falloff = 1 - d / r;
        const idx = (y * GRID + x) * 4;
        dataArray[idx + 0] += vx * falloff * INJECT_STRENGTH;
        dataArray[idx + 1] += vy * falloff * INJECT_STRENGTH;
      }
    }
  }

  stage.addEventListener("pointermove", (e) => {
    const [gx, gy] = toGrid(e.clientX, e.clientY);
    if (lastX != null) {
      const vx = (gx - lastX) / GRID;
      const vy = (gy - lastY) / GRID;
      injectForce(gx, gy, vx, vy);
    }
    lastX = gx;
    lastY = gy;
  });
  stage.addEventListener("pointerleave", () => {
    lastX = null;
    lastY = null;
  });

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
  });

  function tick() {
    if (running) {
      for (let i = 0; i < GRID * GRID; i++) {
        const idx = i * 4;
        dataArray[idx + 0] = 0.5 + (dataArray[idx + 0] - 0.5) * RELAX;
        dataArray[idx + 1] = 0.5 + (dataArray[idx + 1] - 0.5) * RELAX;
      }
      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }

  resize();
  fallbackText.classList.add("is-canvas-active");
  canvas.classList.add("is-active");
  requestAnimationFrame(tick);
}

function ready(fn) {
  const fontsReady = document.fonts?.ready;
  if (fontsReady && typeof fontsReady.then === "function") fontsReady.then(fn);
  else fn();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ready(init));
} else {
  ready(init);
}

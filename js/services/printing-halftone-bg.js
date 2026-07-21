// Ambient halftone dot-matrix texture threaded through the WHOLE page as
// one continuous fixed layer, not boxed into a single section. Raw
// WebGL2 (no Three.js): each grid cell flickers on a golden-ratio
// pseudo-random cycle. White dots blended with mix-blend-mode:difference
// automatically read as dark marks on the light-paper sections and bright
// marks on the dark-ink sections, with no per-section color logic needed -
// same trick the sitewide nav/cursor already use for auto-contrast.
const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform float uTime;
uniform float uDotSize;
uniform float uSpacing;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy;
  vec2 cell = floor(uv / uSpacing);
  vec2 cellCenter = (cell + 0.5) * uSpacing;
  float dist = length(uv - cellCenter);

  float phase = rand(cell) * 6.2831853;
  float flicker = 0.5 + 0.5 * sin(uTime * 0.5 + phase);
  float radius = uDotSize * (0.3 + 0.7 * flicker);

  float alpha = smoothstep(radius, radius - 1.4, dist);
  fragColor = vec4(1.0, 1.0, 1.0, alpha);
}
`;

function compile(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function init() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.id = "printHalftoneBg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const gl = canvas.getContext("webgl2");
  if (!gl) {
    canvas.remove();
    return;
  }

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    canvas.remove();
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.remove();
    return;
  }
  gl.useProgram(program);

  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "uTime");
  const uDotSize = gl.getUniformLocation(program, "uDotSize");
  const uSpacing = gl.getUniformLocation(program, "uSpacing");

  let dpr = 1;
  function resize() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const W = Math.floor(window.innerWidth * dpr);
    const H = Math.floor(window.innerHeight * dpr);
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
  }
  window.addEventListener("resize", resize);
  resize();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
  });

  const start = performance.now();
  function tick(now) {
    if (running) {
      const t = (now - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uDotSize, 2 * dpr);
      gl.uniform1f(uSpacing, 24 * dpr);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// The stock swatches are a loose hand of cards, not a static row: fanned
// from a shared center and pushed around by cursor velocity, with
// neighboring cards dragged along at a falloff — adapted from the
// Codegrid magnetic-cards spring-physics technique. A cursor-lit sheen
// canvas layered on top gives the swatches a real surface to catch light
// on, adapted from the same cursor-driven-material-spotlight trick used
// elsewhere on the site.
import gsap from "gsap";

function initMagneticCards() {
  const stage = document.getElementById("pressStockStage");
  if (!stage) return;
  const cards = gsap.utils.toArray(".press-stock-card", stage);
  if (!cards.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const PROXIMITY_RADIUS = 260;
  const PUSH_FORCE = 9;
  const TILT_AMOUNT = 0.12;
  const NEIGHBOR_INFLUENCE = 0.22;
  const SPRING_STIFFNESS = 0.05;
  const BOUNCE_FRICTION = 0.85;
  const CURSOR_SMOOTHING = 0.75;

  const layout = {
    rotation: [-7, 0, 7],
    x: [-118, 0, 118],
    y: [8, -14, 8],
  };

  const cursor = { x: 0, y: 0, vx: 0, vy: 0 };
  let prevX = 0;
  let prevY = 0;

  const physics = cards.map((el, i) => {
    gsap.set(el, {
      x: layout.x[i],
      y: layout.y[i],
      rotation: layout.rotation[i],
      xPercent: -50,
      yPercent: -50,
      zIndex: i === 1 ? 2 : 1,
    });
    return {
      el,
      restX: layout.x[i],
      restY: layout.y[i],
      restR: layout.rotation[i],
      x: layout.x[i],
      y: layout.y[i],
      r: layout.rotation[i],
      vx: 0,
      vy: 0,
      vr: 0,
    };
  });

  stage.addEventListener("mousemove", (e) => {
    cursor.vx = cursor.vx * CURSOR_SMOOTHING + (e.clientX - prevX) * (1 - CURSOR_SMOOTHING);
    cursor.vy = cursor.vy * CURSOR_SMOOTHING + (e.clientY - prevY) * (1 - CURSOR_SMOOTHING);
    prevX = cursor.x = e.clientX;
    prevY = cursor.y = e.clientY;
  });

  stage.addEventListener("mouseleave", () => {
    cursor.vx = cursor.vy = 0;
  });

  function pushForce(card) {
    const speed = Math.sqrt(cursor.vx ** 2 + cursor.vy ** 2);
    if (speed < 0.5) return { fx: 0, fy: 0 };

    const rect = stage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 + card.restX;
    const cy = rect.top + rect.height / 2 + card.restY;
    const dist = Math.sqrt((cursor.x - cx) ** 2 + (cursor.y - cy) ** 2);
    if (dist > PROXIMITY_RADIUS) return { fx: 0, fy: 0 };

    const weight = (1 - dist / PROXIMITY_RADIUS) ** 3;
    return { fx: cursor.vx * PUSH_FORCE * weight, fy: cursor.vy * PUSH_FORCE * weight };
  }

  gsap.ticker.add(() => {
    const forces = physics.map(pushForce);

    physics.forEach((card, i) => {
      let fx = forces[i].fx;
      let fy = forces[i].fy;
      forces.forEach((f, j) => {
        if (j === i) return;
        const falloff = NEIGHBOR_INFLUENCE ** Math.abs(j - i);
        fx += f.fx * falloff;
        fy += f.fy * falloff * 0.6;
      });

      card.vx = (card.vx + (card.restX + fx - card.x) * SPRING_STIFFNESS) * BOUNCE_FRICTION;
      card.vy = (card.vy + (card.restY + fy - card.y) * SPRING_STIFFNESS) * BOUNCE_FRICTION;
      card.vr = (card.vr + (card.restR + fx * TILT_AMOUNT - card.r) * SPRING_STIFFNESS) * BOUNCE_FRICTION;

      card.x += card.vx;
      card.y += card.vy;
      card.r += card.vr;

      gsap.set(card.el, { x: card.x, y: card.y, rotation: card.r });
    });
  });
}

function initSheen() {
  const canvas = document.getElementById("pressStockSheen");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 1,
    H = 1,
    dpr = 1;
  let targetX = 0,
    targetY = 0,
    curX = 0,
    curY = 0;
  let hovering = false;
  let hasPosition = false;
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
  }

  function tick() {
    rafId = null;
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

  resize();
  ensureTick();
}

function init() {
  initMagneticCards();
  initSheen();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

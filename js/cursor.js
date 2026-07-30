import { paperWinsAt } from "/js/surface-tone.js";

if (matchMedia("(pointer: fine)").matches) {
  const el = Object.assign(document.createElement("div"), {
    id: "custom-cursor",
  });
  document.body.appendChild(el);

  let tx = -100,
    ty = -100,
    cx = tx,
    cy = ty,
    raf;
  const k = 0.1;

  const tick = () => {
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    el.style.setProperty("--x", `${cx}px`);
    el.style.setProperty("--y", `${cy}px`);

    /* Sampled at the drawn position, not the pointer's — the dot lags behind
       by design, and it should take the colour of what it is actually sitting
       on. Re-sampled every frame rather than on pointermove, because smooth
       scroll slides new surfaces under a cursor that never moved. The cost is
       a hit test plus a WeakMap lookup; see js/surface-tone.js. */
    el.classList.toggle("on-dark", paperWinsAt(cx, cy));

    raf = requestAnimationFrame(tick);
  };

  addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add("is-visible");
      raf ??= requestAnimationFrame(tick);
    },
    { passive: true },
  );

  addEventListener("mouseleave", () => el.classList.remove("is-visible"));
}

if (matchMedia("(pointer: fine)").matches) {
  const el = Object.assign(document.createElement("div"), {
    id: "custom-cursor",
  });
  document.body.appendChild(el);

  /* The cursor used to be paper with `mix-blend-mode: difference`, which is
     only two-tone by accident: it inverts the backdrop, and inverting paper or
     ink happens to give the other one. Every other colour inverts to its
     complement, so over Spark the cursor went cyan.

     So instead of inverting, pick. Read the surface under the dot, and use
     whichever of ink or paper contrasts with it more. Because the choice is
     made by contrast rather than by a brightness cut-off, the crossover lands
     where the two are genuinely equally legible (a surface luminance of about
     0.18) rather than at an arbitrary mid-grey — Spark sits above that line,
     so it takes the ink cursor, which is the higher-contrast of the two. */

  const srgb = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lum = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const contrast = (a, b) =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  // taken from the palette rather than hardcoded, so retuning --l/--d retunes
  // the cursor with it
  const rootStyle = getComputedStyle(document.documentElement);
  const hexLum = (hex, fallback) => {
    let h = (hex || "").trim().replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    if (h.length !== 6) h = fallback;
    return lum(
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    );
  };
  const L_PAPER = hexLum(rootStyle.getPropertyValue("--l"), "f6f1e7");
  const L_INK = hexLum(rootStyle.getPropertyValue("--d"), "17130f");

  /* getComputedStyle per frame would be the expensive part of this, so the
     verdict is memoised against the element the hit test returned. Keyed on
     the hit node, not on the ancestor that happened to carry the background,
     so the walk itself only ever runs once per element. */
  const verdict = new WeakMap();

  /* A photo is not its CSS background. The studio hero is a near-black image
     sitting in a wrapper with a white background, so walking the tree would
     put the ink cursor on it and the cursor would disappear — something the
     old difference blend got right for free, since it worked per pixel.

     So an image reports its own brightness. It is measured once into a 24x24
     downscale and cached, which costs one draw per image and nothing per
     frame. Median rather than mean: a blown-out sky in one corner should not
     decide the tone for the whole frame. It is one value for the whole image
     rather than a per-position lookup — object-fit makes the mapping from
     cursor to source pixel unreliable, and a photo dark enough to swallow an
     ink cursor is dark enough throughout to be worth calling dark. */
  const mediaLum = new WeakMap();

  function imageLuminance(img) {
    if (mediaLum.has(img)) return mediaLum.get(img);
    if (!img.complete || !img.naturalWidth) return null; // not loaded yet
    let L = null;
    try {
      const s = document.createElement("canvas");
      s.width = 24;
      s.height = 24;
      const sctx = s.getContext("2d", { willReadFrequently: true });
      sctx.drawImage(img, 0, 0, 24, 24);
      const d = sctx.getImageData(0, 0, 24, 24).data;
      const vals = [];
      for (let i = 0; i < d.length; i += 4)
        vals.push(lum(d[i], d[i + 1], d[i + 2]));
      vals.sort((a, b) => a - b);
      L = vals[vals.length >> 1];
    } catch {
      L = null; // cross-origin, canvas is tainted — fall back to the tree
    }
    mediaLum.set(img, L);
    return L;
  }

  function wantsPaper(node) {
    if (!node) return false;
    if (verdict.has(node)) return verdict.get(node);

    let surface = null;
    let settled = true;

    if (node.tagName === "IMG") {
      surface = imageLuminance(node);
      // an image still decoding gets answered from the tree this frame, and
      // must not have that answer cached as if it were final
      if (surface === null && !node.complete) settled = false;
    }

    if (surface === null) {
      let hit = node;
      while (hit && hit !== document.documentElement) {
        const parts = getComputedStyle(hit).backgroundColor.match(/[\d.]+/g);
        // alpha may be absent (opaque rgb) — only a mostly-opaque layer counts
        if (
          parts &&
          parts.length >= 3 &&
          (parts[3] === undefined || +parts[3] > 0.5)
        ) {
          surface = lum(+parts[0], +parts[1], +parts[2]);
          break;
        }
        hit = hit.parentElement;
      }
    }

    // nothing painted anywhere up the tree: the page is paper, so ink wins
    const paper =
      surface !== null &&
      contrast(L_PAPER, surface) > contrast(L_INK, surface);

    if (settled) verdict.set(node, paper);
    return paper;
  }

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
       on. Re-sampled every frame rather than on pointermove because smooth
       scroll slides new surfaces under a cursor that never moved. */
    el.classList.toggle("on-dark", wantsPaper(document.elementFromPoint(cx, cy)));

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

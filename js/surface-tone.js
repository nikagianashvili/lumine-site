/* Which of the two brand tones belongs on top of whatever is underneath.
 *
 * Both the custom cursor and the fluid trail used to be paper with
 * mix-blend-mode: difference, which is only two-tone by accident: difference
 * inverts the backdrop, and inverting paper gives near ink while inverting ink
 * gives near paper. Every other surface inverts to its complement, so both of
 * them turned cyan over Spark — #f2542d differences against paper to
 * rgb(13,171,210).
 *
 * So they pick instead of inverting, and they share this one implementation so
 * the dot and the trail can never disagree about the same pixel.
 *
 * The choice is made by contrast rather than by a brightness cut-off, which
 * puts the crossover where the two tones are genuinely equally legible — a
 * surface luminance of about 0.18 — instead of at an arbitrary mid-grey. Spark
 * sits above that line and takes ink at 5.35:1, against 3.07:1 for paper.
 */

const srgb = (v) => {
  v /= 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const lum = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/* Read from --l/--d rather than hardcoded, so retuning the palette retunes
   the cursor and the trail with it. Resolved on first use, not at import:
   module scripts are deferred, but a stylesheet still in flight would give
   empty strings. */
let PAPER = null;
let INK = null;
let L_PAPER = 0;
let L_INK = 0;

const hexRgb = (hex, fallback) => {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (h.length !== 6) h = fallback;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

function palette() {
  if (PAPER) return;
  const s = getComputedStyle(document.documentElement);
  PAPER = hexRgb(s.getPropertyValue("--l"), "f6f1e7");
  INK = hexRgb(s.getPropertyValue("--d"), "17130f");
  L_PAPER = lum(...PAPER);
  L_INK = lum(...INK);
}

/** The two tones as [r,g,b] 0-255. */
export function tones() {
  palette();
  return { paper: PAPER, ink: INK };
}

/* getComputedStyle per frame would be the expensive part of this, so the
   verdict is memoised against the element the hit test returned — keyed on the
   hit node rather than on the ancestor that happened to carry the background,
   so the walk itself only ever runs once per element. */
const verdict = new WeakMap();

/* A photo is not its CSS background. The studio hero is a near-black image in
   a wrapper with a white background, so walking the tree would put ink on it
   and the cursor would disappear — something difference got right for free by
   working per pixel. An image therefore reports its own brightness, measured
   once into a 24x24 downscale and cached: one draw per image, nothing per
   frame. Median rather than mean, so a blown-out corner cannot swing the whole
   frame. One value for the image rather than a per-position lookup, because
   object-fit makes the cursor-to-source-pixel mapping unreliable and a photo
   dark enough to swallow an ink cursor is dark enough throughout to count. */
const mediaLum = new WeakMap();

function imageLuminance(img) {
  if (mediaLum.has(img)) return mediaLum.get(img);
  if (!img.complete || !img.naturalWidth) return null; // still decoding
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

/** True when paper is the more legible tone on top of this element. */
export function paperWins(node) {
  if (!node) return false;
  if (verdict.has(node)) return verdict.get(node);
  palette();

  let surface = null;
  let settled = true;

  if (node.tagName === "IMG") {
    surface = imageLuminance(node);
    // an image still decoding is answered from the tree this frame, and that
    // answer must not be cached as if it were final
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
    surface !== null && contrast(L_PAPER, surface) > contrast(L_INK, surface);

  if (settled) verdict.set(node, paper);
  return paper;
}

/** True when paper is the more legible tone at this viewport point. */
export function paperWinsAt(x, y) {
  return paperWins(document.elementFromPoint(x, y));
}

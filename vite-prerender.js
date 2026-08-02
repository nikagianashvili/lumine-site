/* Put the Work and Pricing content into the served HTML.
 *
 * Both pages are built entirely on the client: work.js and pricing.js fetch
 * from /api and fall back to the bundled registries, then append cards into an
 * empty mount. Measured on the raw documents before this existed, /work
 * carried 285 characters of text and /pricing 456 — no project names, no
 * package names, no prices. Those are the two highest-intent pages on the
 * site, and to anything that does not execute JavaScript they were blank.
 * Google renders JS on a delayed second pass; Bing, Yandex (which matters for
 * a Tbilisi studio), social link unfurlers and AI crawlers largely do not.
 *
 * This renders the same bundled registries that the client already falls back
 * to, at build time, from the one source of truth in js/*-data.js — so there
 * is no second copy of the content to drift.
 *
 * It injects a SIBLING of the mount rather than filling the mount itself.
 * That was deliberate: work.js and pricing.js append to their mounts without
 * clearing them first, so anything placed inside would be duplicated rather
 * than replaced, and making them clear would mean editing two working render
 * paths. A sibling needs no change to either file. It is hidden by CSS the
 * moment JavaScript is present (html.js .prerender-only), so nobody sees it
 * twice and there is no flash before the real grid arrives.
 */

import {
  projects,
  projectHref,
  getServiceType,
} from "./js/projects-data.js";
import {
  packages,
  singles,
  pricingNote,
  pricingNote_ka,
} from "./js/pricing-data.js";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function workBlock(isKa) {
  const heading = isKa ? "პროექტები" : "Projects";
  const items = projects
    .map((p) => {
      const type = getServiceType(p.serviceType);
      const typeLabel = type ? (isKa ? type.label_ka : type.label) : "";
      const title = (isKa && p.title_ka) || p.title;
      const blurb = (isKa && p.blurb_ka) || p.blurb || "";
      // concepts say so here too, so the distinction survives without CSS
      const status = (isKa && p.status_ka) || p.status || "";
      return `<li><a href="${esc(projectHref(p, isKa))}"><strong>${esc(
        title,
      )}</strong></a> — ${esc(typeLabel)}, ${esc(p.industry)}, ${esc(
        p.year,
      )}${status ? ` (${esc(status)})` : ""}${
        blurb ? `<br />${esc(blurb)}` : ""
      }</li>`;
    })
    .join("\n        ");

  return `<div class="prerender-only">
        <h2>${heading}</h2>
        <ul>
        ${items}
        </ul>
      </div>`;
}

function pricingBlock(isKa) {
  const pkgHead = isKa ? "პაკეტები" : "Packages";
  const singlesHead = isKa ? "ცალკეული სერვისები" : "Individual services";
  const perMonth = isKa ? "თვეში" : "per month";

  const pkgs = packages
    .map((p) => {
      const name = (isKa && p.name_ka) || p.name;
      const addon = (isKa && p.addon_ka) || p.addon || "";
      /* perMonth is the deliverables array ({count, label}), not a label —
         it is what the package actually buys, so it belongs in the text a
         crawler reads more than anything else on the card. */
      const deliverables = (p.perMonth || [])
        .map(
          (d) =>
            `<li>${esc(d.count)} ${esc((isKa && d.label_ka) || d.label)}</li>`,
        )
        .join("");
      const lines = ((isKa && p.includes_ka) || p.includes || [])
        .map((l) => `<li>${esc(l)}</li>`)
        .join("");
      return `<li><strong>${esc(name)}</strong> — ${esc(
        p.price,
      )} ${esc(perMonth)}${addon ? `. ${esc(addon)}` : ""}${
        deliverables || lines ? `<ul>${deliverables}${lines}</ul>` : ""
      }</li>`;
    })
    .join("\n        ");

  const svc = singles
    .map((s) => {
      const name = (isKa && s.name_ka) || s.name;
      return `<li><strong>${esc(name)}</strong> — ${esc(s.price)}</li>`;
    })
    .join("\n        ");

  const note = esc(isKa ? pricingNote_ka : pricingNote);

  return `<div class="prerender-only">
        <h2>${pkgHead}</h2>
        <ul>
        ${pkgs}
        </ul>
        <h2>${singlesHead}</h2>
        <ul>
        ${svc}
        </ul>
        <p>${note}</p>
      </div>`;
}

/* Anchored on the mount markup rather than on a placeholder comment, so the
   pages need no marker added to them and an accidental edit to the mount
   surfaces as a build-time error instead of silently skipping the injection. */
const TARGETS = [
  {
    match: /\/(ka\/)?work\.html$/,
    anchor: '<div class="work-grid" id="workGrid"></div>',
    build: workBlock,
  },
  {
    match: /\/(ka\/)?pricing\.html$/,
    anchor: '<div class="price-grid" id="priceGrid"></div>',
    build: pricingBlock,
  },
];

export function prerenderContent() {
  return {
    name: "lumine-prerender-content",
    // runs for both `serve` and `build`, so what is tested locally is what ships
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const path = (ctx.path || ctx.filename || "").replace(/\\/g, "/");
        const target = TARGETS.find((t) => t.match.test(path));
        if (!target) return html;
        if (!html.includes(target.anchor)) {
          throw new Error(
            `[lumine-prerender] mount markup not found in ${path}. ` +
              `Expected: ${target.anchor}`,
          );
        }
        const isKa = /\/ka\//.test(path);
        return html.replace(
          target.anchor,
          `${target.build(isKa)}\n        ${target.anchor}`,
        );
      },
    },
  };
}

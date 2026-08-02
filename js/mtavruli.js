// Georgian has no case distinction the way Latin does, but modern fonts
// (LK Lumina included) ship a separate Mtavruli glyph set as the "capitals"
// used for display/heading treatment — the same role uppercase Latin plays
// on this site's h1-h6. CSS text-transform:uppercase does NOT map Mkhedruli
// to Mtavruli in browsers, so headings are converted here instead, at the
// actual Unicode codepoint (Mkhedruli U+10D0-U+10FF -> Mtavruli U+1C90-
// U+1CBF, a fixed +0x0BC0 offset). Runs once for the static headings already
// in the page, then again for any headings added later (project/work/pricing
// cards, team cards, etc.) via MutationObserver — so heading copy anywhere
// on a /ka/ page can still just be typed as normal Georgian text in the HTML.

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

/* Not only h1-h6: anything that *reads* as display type needs the same
   treatment, or it sits next to a converted heading still in Mkhedruli and
   the mismatch is obvious. The studio hero is one headline split across two
   boxes so the words can fly apart — only the first box is the h1, so the
   second (.hero-word) has to be named here too.

   Live-swapped display text (the light desk readout) is deliberately NOT in
   this list: conversion is one-shot per element, and the observer below
   watches for added nodes rather than changed text, so it would convert once
   and then go stale. Those callers import toMtavruli and apply it per swap. */
const HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6, .hero-word";

export function toMtavruli(str) {
  let out = "";
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    out += cp >= 0x10d0 && cp <= 0x10ff ? String.fromCodePoint(cp + 0x0bc0) : ch;
  }
  return out;
}

function convertHeading(el) {
  if (el.dataset.mtavruli === "done") return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    node.textContent = toMtavruli(node.textContent);
  }
  el.dataset.mtavruli = "done";
}

function convertHeadingsIn(root) {
  if (root.matches?.(HEADING_SELECTOR)) convertHeading(root);
  root.querySelectorAll?.(HEADING_SELECTOR).forEach(convertHeading);
}

function init() {
  convertHeadingsIn(document.body);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) convertHeadingsIn(node);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (isKa) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

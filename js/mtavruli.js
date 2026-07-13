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

function toMtavruli(str) {
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
  if (root.matches?.("h1, h2, h3, h4, h5, h6")) convertHeading(root);
  root.querySelectorAll?.("h1, h2, h3, h4, h5, h6").forEach(convertHeading);
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

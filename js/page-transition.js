/* page-transition — holds the outgoing page while the ink closes over it.

   The arriving half is a CSS animation (css/page-transition.css) that needs
   nothing from this file. All this module does is intercept a click on an
   internal link, run the covering half, and only then hand the navigation
   back to the browser — so the wipe is never cut off halfway.

   Delegated from document, so links that get injected later (footer, project
   cards, the register, the menu) are covered without registering anything. */

const LEAVING = "pt-leaving";
// safety net only — the real signal is the animationend for ptCover
const COVER_FALLBACK_MS = 900;

function isPlainLeftClick(e) {
  return (
    !e.defaultPrevented &&
    e.button === 0 &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey
  );
}

function leadsAway(anchor) {
  if (!anchor || !anchor.getAttribute("href")) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.dataset.noTransition !== undefined) return false;

  let url;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  // mailto:, tel:, and anything else that is not a page load
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.origin !== window.location.origin) return false;

  // Same page — an in-page anchor, a bare href="#", or the link to the page
  // you are already on (nav.js blocks that one too). None of these are a
  // navigation, and wiping the screen for them would be a lie.
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return false;
  }

  return true;
}

document.addEventListener("click", (e) => {
  if (!isPlainLeftClick(e)) return;

  const anchor = e.target instanceof Element ? e.target.closest("a[href]") : null;
  if (!leadsAway(anchor)) return;

  e.preventDefault();
  const href = anchor.href;

  // Lenis keeps scrolling under its own momentum otherwise, so the page
  // drifts behind the ink on its way out.
  window.lenis?.stop?.();
  document.documentElement.classList.add(LEAVING);

  let left = false;
  const go = () => {
    if (left) return;
    left = true;
    window.location.href = href;
  };

  document.body.addEventListener("animationend", function onEnd(ev) {
    // body carries other animations; only the veil finishing means anything
    if (ev.animationName !== "ptCover") return;
    document.body.removeEventListener("animationend", onEnd);
    go();
  });

  // if the animation never reports back, leave anyway rather than trapping
  // the visitor on a page they asked to leave
  setTimeout(go, COVER_FALLBACK_MS);
});

// Coming back through history restores the page mid-exit, ink and all. Drop
// the class so the veil animates back to ptReveal and uncovers the page.
window.addEventListener("pageshow", (e) => {
  document.documentElement.classList.remove(LEAVING);
  if (e.persisted) window.lenis?.start?.();
});

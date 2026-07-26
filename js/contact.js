/* contact — loader for the 3D cube.

   The cube itself lives in contact-cube.js, which pulls in three.js plus the
   Line2 addons. That is 519KB, and it was the largest chunk in the build,
   sitting on the one page where somebody is trying to get in touch — usually
   on a phone. Nothing about the form needs it.

   So it is fetched on demand instead of up front: only if the canvas is
   actually on the page, and only once the reader is near it. The form,
   the copy and the email address are usable long before any of it arrives.

   Under reduced motion it is never fetched at all. contact-cube.js is what
   gives the wrapper its height, so skipping it leaves no gap to look at —
   the section simply collapses rather than holding an empty box. */

const canvas = document.getElementById("cube-canvas");

const wantsStillness = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function loadCube() {
  return import("/js/contact-cube.js").catch(() => {
    /* the page is fully usable without it; a failed cube is not worth an
       error in the reader's console */
  });
}

if (canvas && !wantsStillness) {
  if ("IntersectionObserver" in window) {
    // a screen's worth of warning, so it has finished arriving by the time
    // it is scrolled into view
    const watcher = new IntersectionObserver(
      (entries, obs) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        loadCube();
      },
      { rootMargin: "100% 0px" },
    );
    watcher.observe(canvas);
  } else {
    loadCube();
  }
}

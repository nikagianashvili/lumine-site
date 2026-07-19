// Video page signature: a pinned scrubber that reads the whole page as a
// single timeline, timecode ticking with scroll progress.
const TOTAL_SECONDS = 3 * 60 + 45; // 03:45, matches the printed labels

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function initScrubber() {
  const fill = document.querySelector("[data-vid-fill]");
  const time = document.querySelector("[data-vid-time]");
  if (!fill || !time) return;

  function update() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    fill.style.width = `${progress * 100}%`;
    time.textContent = formatTime(progress * TOTAL_SECONDS);
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function init() {
  initScrubber();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

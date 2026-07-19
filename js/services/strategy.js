// Strategy page signature: the rail counter ticks to match whichever
// numbered block is currently in view, like a running page number.
function initRailCounter() {
  const counter = document.querySelector("[data-rail-current]");
  const blocks = document.querySelectorAll(".strat-block[data-rail]");
  if (!counter || !blocks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const label = entry.target.getAttribute("data-rail") || "";
        const num = label.split(" ")[0];
        if (num) counter.textContent = num;
      });
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );

  blocks.forEach((block) => observer.observe(block));
}

function init() {
  initRailCounter();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

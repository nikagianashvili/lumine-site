// The imposition sheet prints one job at a time as the reader scrolls
// through a pinned press run, instead of revealing a static card grid all
// at once — closer to how a real sheet gets ganged and run through a
// press. Each job stays down once printed (cumulative), rather than a
// hand-off between cards.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function init() {
  const section = document.getElementById("pressRun");
  const stage = section?.querySelector(".press-run-stage");
  const jobs = gsap.utils.toArray(".press-run-job", section);
  const numLabel = document.getElementById("pressRunNum");
  if (!section || !stage || !jobs.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(max-width: 900px)").matches) {
    gsap.set(jobs, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(jobs, { opacity: 0, y: 36 });

  const clamp = gsap.utils.clamp(0, 1);
  const count = jobs.length;

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    pin: stage,
    onUpdate: (self) => {
      const progress = self.progress;
      let activeIndex = 0;

      jobs.forEach((job, i) => {
        const windowStart = i / count;
        const windowEnd = (i + 1) / count;
        const local = clamp((progress - windowStart) / (windowEnd - windowStart));
        const entry = clamp(gsap.utils.mapRange(0, 0.35, 0, 1, local));

        gsap.set(job, { opacity: entry, y: 36 * (1 - entry) });
        if (progress >= windowStart) activeIndex = i;
      });

      if (numLabel) numLabel.textContent = String(activeIndex + 1).padStart(2, "0");
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

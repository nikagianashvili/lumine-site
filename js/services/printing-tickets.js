// Workflow as a stack of job tickets: each one pins in place until the
// next scrolls up to meet it and locks over it in turn, instead of the
// sitewide fade-up process list every other service page uses.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function init() {
  const tickets = gsap.utils.toArray(".ink-ticket");
  if (!tickets.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  tickets.forEach((ticket, i) => {
    if (i === tickets.length - 1) return;
    ScrollTrigger.create({
      trigger: ticket,
      start: "top top+=90",
      endTrigger: tickets[i + 1],
      end: "top top+=90",
      pin: true,
      pinSpacing: false,
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

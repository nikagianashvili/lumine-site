// "The Argument" — three lines that morph into each other word-by-word as
// the reader scrolls through a pinned section, instead of a static
// pull-quote. Word-mask crossfade technique adapted from the Codegrid
// scroll-activated-text-blocks effect, retimed for 3 phases instead of 2.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const OVERLAP = 3;

function getWordProgress(phaseProgress, wordIndex, totalWords) {
  const totalLength = 1 + OVERLAP / totalWords;
  const scale = 1 / Math.min(totalLength, 1 + (totalWords - 1) / totalWords + OVERLAP / totalWords);
  const startTime = (wordIndex / totalWords) * scale;
  const endTime = startTime + (OVERLAP / totalWords) * scale;
  const duration = endTime - startTime;

  if (phaseProgress <= startTime) return 0;
  if (phaseProgress >= endTime) return 1;
  return (phaseProgress - startTime) / duration;
}

function animateBlock(outBlock, inBlock, phaseProgress) {
  outBlock.words.forEach((word, i) => {
    const progress = getWordProgress(phaseProgress, i, outBlock.words.length);
    gsap.set(word, { yPercent: progress * 100 });
  });
  inBlock.words.forEach((word, i) => {
    const progress = getWordProgress(phaseProgress, i, inBlock.words.length);
    gsap.set(word, { yPercent: 100 - progress * 100 });
  });
}

// Mobile has no room for a pinned scrub — the three lines just stack and
// read top to bottom instead. They still get a one-time fade/slide-up as
// each one enters the viewport, so the section isn't inert.
function initMobileReveal(section) {
  const blocks = gsap.utils.toArray(".strat-m-block", section);
  if (!blocks.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    blocks.forEach((block) => block.classList.add("is-inview"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );

  blocks.forEach((block, i) => {
    block.style.transitionDelay = `${i * 0.1}s`;
    observer.observe(block);
  });
}

function init() {
  const section = document.getElementById("stratManifesto");
  const ring = document.getElementById("stratManifestoRingProgress");
  if (!section) return;

  if (window.matchMedia("(max-width: 900px)").matches) {
    initMobileReveal(section);
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const blocks = gsap.utils.toArray(".strat-m-block", section);
  if (blocks.length < 3) return;

  const splits = blocks.map((block) =>
    SplitText.create(block.querySelector("p"), { type: "words", mask: "words", wordsClass: "word" }),
  );

  gsap.set(splits[1].words, { yPercent: 100 });
  gsap.set(splits[2].words, { yPercent: 100 });

  const circumference = ring ? 2 * Math.PI * ring.r.baseVal.value : 0;
  if (ring) {
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;
  }

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const progress = self.progress;
      if (ring) ring.style.strokeDashoffset = circumference * (1 - progress);

      if (progress <= 0.5) {
        animateBlock(splits[0], splits[1], progress / 0.5);
      } else {
        gsap.set(splits[0].words, { yPercent: 100 });
        animateBlock(splits[1], splits[2], (progress - 0.5) / 0.5);
      }
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

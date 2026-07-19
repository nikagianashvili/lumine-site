// "Where It Sits" — a radial diagram connecting Strategy to the other eight
// real Lumine services, drawn in on scroll. Unlike every other section on
// this page, this one can't be borrowed from a template: the layout mirrors
// Lumine's actual nine-service structure. Line-draw technique adapted from
// the Codegrid "draw SVG on scroll" effect; radial placement is custom.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SVG_NS = "http://www.w3.org/2000/svg";
const VIEWBOX = 800;
const CENTER = VIEWBOX / 2;
const NODE_RADIUS_PCT = 38;
const LINE_RADIUS = CENTER * 0.62;

function init() {
  const map = document.getElementById("stratEcoMap");
  const svg = document.getElementById("stratEcoSvg");
  const section = document.getElementById("stratEcosystem");
  if (!map || !svg || !section) return;

  const nodes = gsap.utils.toArray(".strat-eco-node", map);
  const count = nodes.length;
  if (!count) return;

  svg.setAttribute("viewBox", `0 0 ${VIEWBOX} ${VIEWBOX}`);

  const lines = nodes.map((node, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    node.style.left = `${50 + NODE_RADIUS_PCT * cos}%`;
    node.style.top = `${50 + NODE_RADIUS_PCT * sin}%`;

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", CENTER);
    line.setAttribute("y1", CENTER);
    line.setAttribute("x2", CENTER + LINE_RADIUS * cos);
    line.setAttribute("y2", CENTER + LINE_RADIUS * sin);
    line.setAttribute("stroke", "var(--accent)");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
    return line;
  });

  gsap.set(nodes, { opacity: 0, scale: 0.85 });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(nodes, { opacity: 1, scale: 1 });
    lines.forEach((line) => line.setAttribute("stroke-dashoffset", "0"));
    return;
  }

  lines.forEach((line) => {
    const length = line.getTotalLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
  });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top 65%", end: "bottom 60%", scrub: 1 },
  });

  tl.to(lines, { strokeDashoffset: 0, stagger: 0.08, ease: "none" }, 0);
  tl.to(nodes, { opacity: 1, scale: 1, stagger: 0.08, ease: "none" }, 0);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

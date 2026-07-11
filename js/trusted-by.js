import gsap from "gsap";

// Placeholder marks — swap for real client logos once Lumine has them.
const marks = [
  "/clients/client-logo-1.svg",
  "/clients/client-logo-2.svg",
  "/clients/client-logo-3.svg",
  "/clients/client-logo-4.svg",
  "/clients/client-logo-5.svg",
];

function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};
  let tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "none" },
    }),
    length = items.length,
    startX = items[0].offsetLeft,
    widths = [],
    xPercents = [],
    pixelsPerSecond = (config.speed || 1) * 100,
    totalWidth,
    curX,
    distanceToStart,
    distanceToLoop,
    item,
    i;

  gsap.set(items, {
    xPercent: (i, el) => {
      let w = (widths[i] = parseFloat(gsap.getProperty(el, "width", "px")));
      xPercents[i] =
        (parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 +
        gsap.getProperty(el, "xPercent");
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });
  totalWidth =
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth;

  for (i = 0; i < length; i++) {
    item = items[i];
    curX = (xPercents[i] / 100) * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop = distanceToStart + widths[i];
    tl.to(
      item,
      {
        xPercent: ((curX - distanceToLoop) / widths[i]) * 100,
        duration: distanceToLoop / pixelsPerSecond,
      },
      0,
    ).fromTo(
      item,
      {
        xPercent: ((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
      },
      {
        xPercent: xPercents[i],
        duration:
          (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
        immediateRender: false,
      },
      distanceToLoop / pixelsPerSecond,
    );
  }

  tl.progress(1, true).progress(0, true);
  return tl;
}

function buildRow() {
  const row = document.createElement("div");
  row.className = "trusted-marquee-row";
  const COPIES = 6;
  for (let c = 0; c < COPIES; c++) {
    marks.forEach((src) => {
      const item = document.createElement("div");
      item.className = "trusted-marquee-item";
      item.innerHTML = `<img src="${src}" alt="" draggable="false" />`;
      row.appendChild(item);
    });
  }
  return row;
}

function init() {
  const wrapper = document.querySelector(".trusted-marquee-wrapper");
  if (!wrapper) return;

  const row = buildRow();
  wrapper.appendChild(row);

  horizontalLoop(row.querySelectorAll(".trusted-marquee-item"), { speed: 1 });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

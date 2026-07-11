import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

let lenis = null;
try {
  const lenisModule = await import("/js/lenis-scroll.js");
  lenis = lenisModule.default || lenisModule.lenis || null;
} catch (e) {}

gsap.registerPlugin(SplitText);

// Self-contained EN/GE text for everything this file builds at runtime —
// deliberately NOT relying on js/i18n.js applying translations to this
// content after the fact. That was tried first and raced against the
// order other deferred scripts happen to finish evaluating in, which
// proved unreliable across a plain page reload. Building the right
// language directly, and rebuilding on language change, removes the
// cross-script timing dependency entirely.
const MENU_LANG_KEY = "lumine-lang";
const menuCurrentLang = () => localStorage.getItem(MENU_LANG_KEY) || "en";

const MENU_TEXT = {
  en: {
    open: "Menu",
    close: "Close",
    copyright: "&copy; Lumine",
    location: "Tbilisi, Georgia",
    whatWeDo: ["What We Do", "Photo &amp; Video", "Design &amp; Branding", "Marketing &amp; Web"],
    sayHello: "Say Hello",
    hotline: "Hotline",
    socials: "Socials",
    instagram: "Instagram",
    language: "Language",
    languageValue: "Georgian, Mostly",
    availableFor: "Available For",
    newProjects: "New Projects",
  },
  ka: {
    open: "მენიუ",
    close: "დახურვა",
    copyright: "&copy; Lumine",
    location: "თბილისი, საქართველო",
    whatWeDo: ["რას ვაკეთებთ", "ფოტო და ვიდეო", "დიზაინი და ბრენდინგი", "მარკეტინგი და ვები"],
    sayHello: "მოგვწერეთ",
    hotline: "სატელეფონო ხაზი",
    socials: "სოციალური ქსელები",
    instagram: "Instagram",
    language: "ენა",
    languageValue: "ძირითადად ქართული",
    availableFor: "ხელმისაწვდომია",
    newProjects: "ახალი პროექტებისთვის",
  },
};

const menuItems = [
  { en: "Home", ka: "მთავარი", route: "/" },
  { en: "Studio", ka: "სტუდია", route: "/studio" },
  { en: "Services", ka: "სერვისები", route: "/services" },
  { en: "Work", ka: "ნამუშევრები", route: "/work" },
  { en: "Pricing", ka: "ფასები", route: "/pricing" },
  { en: "Journal", ka: "ჟურნალი", route: "/journal" },
  { en: "Contact", ka: "კონტაქტი", route: "/contact" },
];

function buildNav() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const lang = menuCurrentLang();
  const T = MENU_TEXT[lang];

  // Prevent duplicate overlays if any script re-runs.
  const existingOverlay = document.querySelector(".menu-overlay");
  if (existingOverlay) existingOverlay.remove();

  const toggler = nav.querySelector(".nav-toggler");
  if (toggler) {
    toggler.innerHTML = `
      <div class="nav-toggle-wrapper">
        <p class="open-label">${T.open}</p>
        <p class="close-label">${T.close}</p>
      </div>
    `;
  }

  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  overlay.innerHTML = `
    <div class="menu-content">
      <div class="menu-col" data-col="0">
        <div class="menu-content-group">
          <p>${T.copyright}</p>
          <p>${T.location}</p>
        </div>
        <div class="menu-content-group">
          <p>${T.whatWeDo[0]}</p>
          <p>${T.whatWeDo[1]}</p>
          <p>${T.whatWeDo[2]}</p>
          <p>${T.whatWeDo[3]}</p>
        </div>
        <div class="menu-content-group">
          <p>${T.sayHello}</p>
          <p>hello@lumine.ge</p>
        </div>
        <div class="menu-content-group">
          <p>${T.hotline}</p>
          <p>+995 555 00 00 00</p>
        </div>
      </div>
      <div class="menu-col" data-col="1">
        <div class="menu-content-group">
          <p>${T.socials}</p>
          <a href="https://www.instagram.com/lumine.ge" target="_blank">${T.instagram}</a>
        </div>
        <div class="menu-content-group">
          <p>${T.language}</p>
          <p>${T.languageValue}</p>
        </div>
        <div class="menu-content-group">
          <p>${T.availableFor}</p>
          <p>${T.newProjects}</p>
        </div>
      </div>
    </div>

    <div class="menu-img">
      <img src="/menu/menu-img.jpg" alt="" />
    </div>

    <div class="menu-links-wrapper">
      ${menuItems
        .map(
          (item) => `
        <div class="menu-link" data-route="${item.route}">
          <a href="${item.route}">
            <span>${lang === "ka" ? item.ka : item.en}</span>
            <span>${lang === "ka" ? item.ka : item.en}</span>
          </a>
        </div>
      `,
        )
        .join("")}
      <div class="link-highlighter"></div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function initMenu() {
  buildNav();

  const navToggler = document.querySelector(".nav-toggler");
  const menuOverlay = document.querySelector(".menu-overlay");
  const menuImage = document.querySelector(".menu-overlay .menu-img img");
  const menuLinksWrapper = document.querySelector(".menu-links-wrapper");
  const linkHighlighter = document.querySelector(".link-highlighter");
  const menuLinks = Array.from(document.querySelectorAll(".menu-link a"));
  const menuLinkContainers = Array.from(
    document.querySelectorAll(".menu-link"),
  );
  const openLabel = document.querySelector(".open-label");
  const closeLabel = document.querySelector(".close-label");
  const menuCols = Array.from(document.querySelectorAll(".menu-col"));

  let isMenuOpen = false;
  let isMenuAnimating = false;

  const splitTextInstances = [];

  function setupLinkSplits() {
    splitTextInstances.forEach((s) => s.revert && s.revert());
    splitTextInstances.length = 0;

    menuLinks.forEach((link) => {
      const spans = link.querySelectorAll("span");
      spans.forEach((span, i) => {
        const split = new SplitText(span, { type: "chars" });
        splitTextInstances.push(split);
        split.chars.forEach((c) => c.classList.add("char"));
        if (i === 1) {
          gsap.set(split.chars, { y: "110%" });
        }
      });
    });
  }

  const menuColSplitInstances = [];

  function setupColSplits() {
    if (isMenuOpen) return;

    menuColSplitInstances.forEach((s) => s.revert && s.revert());
    menuColSplitInstances.length = 0;

    menuCols.forEach((col) => {
      col.querySelectorAll("p, a").forEach((el) => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
        });
        menuColSplitInstances.push(split);
        gsap.set(split.lines, { y: "100%" });
      });
    });
  }

  function setInitialStates() {
    gsap.set(menuImage, { y: 0, scale: 0.5, opacity: 0.25 });
    gsap.set(menuLinks, { y: "150%" });
    gsap.set(linkHighlighter, { y: "150%" });

    const firstLinkContainer = menuLinkContainers[0];
    const firstLinkSpan = firstLinkContainer
      ? firstLinkContainer.querySelector("a span")
      : null;

    if (firstLinkSpan) {
      const linkWidth = firstLinkSpan.offsetWidth;
      linkHighlighter.style.width = linkWidth + "px";
      currentHighlighterWidth = linkWidth;
      targetHighlighterWidth = linkWidth;

      const linkRect = firstLinkContainer.getBoundingClientRect();
      const wrapperRect = menuLinksWrapper.getBoundingClientRect();
      const initialX = linkRect.left - wrapperRect.left;
      currentHighlighterX = initialX;
      targetHighlighterX = initialX;
    }
  }

  let currentX = 0;
  let targetX = 0;
  const lerpFactor = 0.05;

  let currentHighlighterX = 0;
  let targetHighlighterX = 0;
  let currentHighlighterWidth = 0;
  let targetHighlighterWidth = 0;

  let rafId = null;

  function animateLoop() {
    currentX += (targetX - currentX) * lerpFactor;
    currentHighlighterX +=
      (targetHighlighterX - currentHighlighterX) * lerpFactor;
    currentHighlighterWidth +=
      (targetHighlighterWidth - currentHighlighterWidth) * lerpFactor;

    gsap.set(menuLinksWrapper, { x: currentX });
    gsap.set(linkHighlighter, {
      x: currentHighlighterX,
      width: currentHighlighterWidth,
    });

    rafId = requestAnimationFrame(animateLoop);
  }

  function startDesktopTracking() {
    if (window.innerWidth < 1000) return;
    if (rafId) return;
    menuOverlay.addEventListener("mousemove", onMouseMove);
    menuLinksWrapper.addEventListener("mouseleave", onLinksWrapperLeave);
    rafId = requestAnimationFrame(animateLoop);
  }

  function stopDesktopTracking() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    menuOverlay.removeEventListener("mousemove", onMouseMove);
    menuLinksWrapper.removeEventListener("mouseleave", onLinksWrapperLeave);
  }

  function onMouseMove(e) {
    if (window.innerWidth < 1000) return;

    const mouseX = e.clientX;
    const viewportWidth = window.innerWidth;
    const wrapperWidth = menuLinksWrapper.offsetWidth;

    const maxMoveLeft = 0;
    const maxMoveRight = viewportWidth - wrapperWidth;

    const sensitivityRange = viewportWidth * 0.5;
    const startX = (viewportWidth - sensitivityRange) / 2;
    const endX = startX + sensitivityRange;

    let pct;
    if (mouseX <= startX) pct = 0;
    else if (mouseX >= endX) pct = 1;
    else pct = (mouseX - startX) / sensitivityRange;

    targetX = maxMoveLeft + pct * (maxMoveRight - maxMoveLeft);
  }

  function onLinkEnter(container) {
    if (window.innerWidth < 1000) return;

    const spans = container.querySelectorAll("a span");
    if (!spans || spans.length < 2) return;

    const visibleChars = spans[0].querySelectorAll(".char");
    const animatedChars = spans[1].querySelectorAll(".char");

    gsap.to(visibleChars, {
      y: "-110%",
      stagger: 0.05,
      duration: 0.5,
      ease: "expo.inOut",
    });
    gsap.to(animatedChars, {
      y: "0%",
      stagger: 0.05,
      duration: 0.5,
      ease: "expo.inOut",
    });

    const linkRect = container.getBoundingClientRect();
    const wrapperRect = menuLinksWrapper.getBoundingClientRect();
    targetHighlighterX = linkRect.left - wrapperRect.left;

    const firstSpan = container.querySelector("a span");
    targetHighlighterWidth = firstSpan
      ? firstSpan.offsetWidth
      : container.offsetWidth;
  }

  function onLinkLeave(container) {
    if (window.innerWidth < 1000) return;

    const spans = container.querySelectorAll("a span");
    if (!spans || spans.length < 2) return;

    const visibleChars = spans[0].querySelectorAll(".char");
    const animatedChars = spans[1].querySelectorAll(".char");

    gsap.to(animatedChars, {
      y: "110%",
      stagger: 0.05,
      duration: 0.5,
      ease: "expo.inOut",
    });
    gsap.to(visibleChars, {
      y: "0%",
      stagger: 0.05,
      duration: 0.5,
      ease: "expo.inOut",
    });
  }

  function onLinksWrapperLeave() {
    const firstContainer = menuLinkContainers[0];
    if (!firstContainer) return;
    const firstSpan = firstContainer.querySelector("a span");
    if (!firstSpan) return;

    const linkRect = firstContainer.getBoundingClientRect();
    const wrapperRect = menuLinksWrapper.getBoundingClientRect();
    targetHighlighterX = linkRect.left - wrapperRect.left;
    targetHighlighterWidth = firstSpan.offsetWidth;
  }

  menuLinkContainers.forEach((container) => {
    container.addEventListener("mouseenter", () => onLinkEnter(container));
    container.addEventListener("mouseleave", () => onLinkLeave(container));

    // Let the browser perform a normal anchor navigation.
    // This keeps cross-document view transitions eligible and reliable.
    const a = container.querySelector("a");
    if (a) {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href") || "";
        const currentPath = window.location.pathname;
        if (href && currentPath === href) e.preventDefault();
      });
    }
  });

  function toggleMenu() {
    if (isMenuAnimating) return;
    isMenuAnimating = true;

    if (!isMenuOpen) {
      if (lenis) lenis.stop();
      startDesktopTracking();

      gsap.to(openLabel, { y: "-100%", duration: 1, ease: "power3.out" });
      gsap.to(closeLabel, { y: "-100%", duration: 1, ease: "power3.out" });

      gsap.to(menuOverlay, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1.25,
        ease: "expo.out",
        onComplete: () => {
          menuLinkContainers.forEach((c) => (c.style.overflow = "visible"));
          isMenuOpen = true;
          isMenuAnimating = false;
        },
      });

      gsap.to(menuImage, {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: "expo.out",
      });

      gsap.to(menuLinks, {
        y: "0%",
        duration: 1.25,
        stagger: 0.1,
        delay: 0.25,
        ease: "expo.out",
      });

      gsap.to(linkHighlighter, {
        y: "0%",
        duration: 1,
        delay: 1,
        ease: "expo.out",
      });

      menuCols.forEach((col) => {
        const splitLines = col.querySelectorAll(".split-line");
        gsap.to(splitLines, {
          y: "0%",
          duration: 1,
          stagger: 0.05,
          delay: 0.5,
          ease: "expo.out",
        });
      });
    } else {
      gsap.to(openLabel, { y: "0%", duration: 1, ease: "power3.out" });
      gsap.to(closeLabel, { y: "0%", duration: 1, ease: "power3.out" });

      gsap.to(menuImage, {
        y: "-25svh",
        opacity: 0.5,
        duration: 1.25,
        ease: "expo.out",
      });

      menuCols.forEach((col) => {
        const splitLines = col.querySelectorAll(".split-line");
        gsap.to(splitLines, {
          y: "-100%",
          duration: 1,
          stagger: 0,
          ease: "expo.out",
        });
      });

      gsap.to(menuOverlay, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.25,
        ease: "expo.out",
        onComplete: () => {
          stopDesktopTracking();
          gsap.set(menuOverlay, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          });
          gsap.set(menuLinks, { y: "150%" });
          gsap.set(linkHighlighter, { y: "150%" });
          gsap.set(menuImage, { y: "0", scale: 0.5, opacity: 0.25 });
          menuLinkContainers.forEach((c) => (c.style.overflow = "hidden"));

          menuCols.forEach((col) => {
            const splitLines = col.querySelectorAll(".split-line");
            gsap.set(splitLines, { y: "100%" });
          });

          gsap.set(menuLinksWrapper, { x: 0 });
          currentX = 0;
          targetX = 0;

          setupColSplits();

          isMenuOpen = false;
          isMenuAnimating = false;

          if (lenis) lenis.start();
        },
      });
    }
  }

  navToggler.addEventListener("click", toggleMenu);

  setupLinkSplits();
  setupColSplits();
  setInitialStates();
  // Desktop tracking loop starts only when menu is open.
}

// Nav uses mix-blend-mode:difference to auto-invert against whatever's
// behind it — clean against a flat section background, but garbled when a
// big bold heading scrolls directly underneath (two "busy" patterns
// difference-blending together instead of one clean color inversion).
// Past a small scroll threshold, give it a solid backdrop in the same
// paper tone as the logo itself: difference-blending white-on-white still
// resolves to a clean dark silhouette, so the look doesn't change, it just
// stops depending on what happens to be scrolling past.
function initNavSolidOnScroll() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const THRESHOLD = 40;
  let ticking = false;

  function update() {
    nav.classList.toggle("nav-solid", window.scrollY > THRESHOLD);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// Button + state only for now — no content actually swaps languages yet.
// Persists the choice and fires an event so a future translation pass has
// a ready-made hook to listen for, instead of needing this rewired later.
const LANG_KEY = "lumine-lang";

function initLangSwitch() {
  const buttons = document.querySelectorAll(".nav-lang-btn");
  if (!buttons.length) return;

  const saved = localStorage.getItem(LANG_KEY) || "en";
  buttons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === saved);
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.dispatchEvent(
        new CustomEvent("lumine:langchange", { detail: { lang } }),
      );
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMenu);
  document.addEventListener("DOMContentLoaded", initNavSolidOnScroll);
  document.addEventListener("DOMContentLoaded", initLangSwitch);
} else {
  initMenu();
  initNavSolidOnScroll();
  initLangSwitch();
}

// Relabels the already-built menu in place on a language switch, instead
// of tearing it down and rebuilding — buildNav() removes/recreates the
// whole overlay, which would orphan every element reference and event
// listener initMenu() wired up (menuOverlay, menuLinks, the toggler
// click handler, GSAP/SplitText state) against the now-detached old DOM.
document.documentElement.addEventListener("lumine:langchange", (e) => {
  const lang = e.detail.lang;
  const T = MENU_TEXT[lang];

  const openLabel = document.querySelector(".open-label");
  const closeLabel = document.querySelector(".close-label");
  if (openLabel) openLabel.textContent = T.open;
  if (closeLabel) closeLabel.textContent = T.close;

  const col0Groups = document.querySelectorAll('.menu-col[data-col="0"] .menu-content-group');
  if (col0Groups[0]) col0Groups[0].querySelectorAll("p")[1].textContent = T.location;
  if (col0Groups[1]) {
    const ps = col0Groups[1].querySelectorAll("p");
    T.whatWeDo.forEach((text, i) => {
      if (ps[i]) ps[i].innerHTML = text;
    });
  }
  if (col0Groups[2]) col0Groups[2].querySelectorAll("p")[0].textContent = T.sayHello;
  if (col0Groups[3]) col0Groups[3].querySelectorAll("p")[0].textContent = T.hotline;

  const col1Groups = document.querySelectorAll('.menu-col[data-col="1"] .menu-content-group');
  if (col1Groups[0]) col1Groups[0].querySelector("p").textContent = T.socials;
  if (col1Groups[1]) {
    const ps = col1Groups[1].querySelectorAll("p");
    if (ps[0]) ps[0].textContent = T.language;
    if (ps[1]) ps[1].textContent = T.languageValue;
  }
  if (col1Groups[2]) {
    const ps = col1Groups[2].querySelectorAll("p");
    if (ps[0]) ps[0].textContent = T.availableFor;
    if (ps[1]) ps[1].textContent = T.newProjects;
  }

  menuItems.forEach((item) => {
    const container = document.querySelector(`.menu-link[data-route="${item.route}"]`);
    if (!container) return;
    container.querySelectorAll("a span").forEach((span) => {
      span.textContent = lang === "ka" ? item.ka : item.en;
    });
  });
});

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

let lenis = null;
try {
  const lenisModule = await import("/js/lenis-scroll.js");
  lenis = lenisModule.default || lenisModule.lenis || null;
} catch (e) {}

gsap.registerPlugin(SplitText);

// Georgian pages live under /ka/ as real, separate static HTML — not a
// client-side toggle — so the menu this builds just needs to know which
// side of that split the current page is on, to link and label itself
// correctly. No language state to read/write anywhere.
const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

// Gate the cursor-scrub menu interaction on more than just viewport width.
// A touch-primary device can still be >=1000px wide (a tablet in landscape,
// a touchscreen desktop) - it has no mouse to drive the scrub with, and
// with only the width check the links wrapper would sit in "desktop" mode
// with links running off-screen and no way to reach them, since the
// vertical-stack fallback only kicked in below 1000px. `pointer: fine`
// is what a mouse/trackpad reports; touch reports `coarse`.
function isDesktopPointer() {
  return window.innerWidth >= 1000 && window.matchMedia("(pointer: fine)").matches;
}

const menuItems = isKa
  ? [
      { label: "მთავარი", route: "/ka" },
      { label: "სტუდია", route: "/ka/studio" },
      { label: "სერვისები", route: "/ka/services" },
      { label: "ნამუშევრები", route: "/ka/work" },
      { label: "ფასები", route: "/ka/pricing" },
      { label: "ჟურნალი", route: "/ka/journal" },
      { label: "კონტაქტი", route: "/ka/contact" },
    ]
  : [
      { label: "Home", route: "/" },
      { label: "Studio", route: "/studio" },
      { label: "Services", route: "/services" },
      { label: "Work", route: "/work" },
      { label: "Pricing", route: "/pricing" },
      { label: "Journal", route: "/journal" },
      { label: "Contact", route: "/contact" },
    ];

function buildNav() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  // Prevent duplicate overlays if any script re-runs.
  const existingOverlay = document.querySelector(".menu-overlay");
  if (existingOverlay) existingOverlay.remove();

  const toggler = nav.querySelector(".nav-toggler");
  if (toggler) {
    toggler.innerHTML = isKa
      ? `
      <div class="nav-toggle-wrapper">
        <p class="open-label">მენიუ</p>
        <p class="close-label">დახურვა</p>
      </div>
    `
      : `
      <div class="nav-toggle-wrapper">
        <p class="open-label">Menu</p>
        <p class="close-label">Close</p>
      </div>
    `;
  }

  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  overlay.innerHTML = isKa
    ? `
    <div class="menu-content">
      <div class="menu-col" data-col="0">
        <div class="menu-content-group">
          <p>&copy; Lumine</p>
          <p>თბილისი, საქართველო</p>
        </div>
        <div class="menu-content-group">
          <p>რას ვაკეთებთ</p>
          <p>სტრატეგია და ბრენდი</p>
          <p>ფოტო, ვიდეო და AI</p>
          <p>ვები და მარკეტინგი</p>
        </div>
        <div class="menu-content-group">
          <p>მოგვწერეთ</p>
          <p>hello@lumine.ge</p>
        </div>
        <div class="menu-content-group">
          <p>სატელეფონო ხაზი</p>
          <p>+995 555 00 00 00</p>
        </div>
      </div>
      <div class="menu-col" data-col="1">
        <div class="menu-content-group">
          <p>სოციალური ქსელები</p>
          <a href="https://www.instagram.com/lumine.ge" target="_blank">Instagram</a>
        </div>
        <div class="menu-content-group">
          <p>ენა</p>
          <p>ძირითადად ქართული</p>
        </div>
        <div class="menu-content-group">
          <p>ხელმისაწვდომია</p>
          <p>ახალი პროექტებისთვის</p>
        </div>
      </div>
    </div>

    <div class="menu-img">
      <img src="/menu/menu-img.jpg" alt="" />
    </div>

    <div class="menu-links-wrapper">
      ${menuItems
        .map(
          (item, i) => `
        <div class="menu-link" data-route="${item.route}">
          <span class="menu-link-index">${String(i + 1).padStart(2, "0")}</span>
          <a href="${item.route}">
            <span>${item.label}</span>
            <span>${item.label}</span>
          </a>
        </div>
      `,
        )
        .join("")}
      <div class="link-highlighter"></div>
    </div>
  `
    : `
    <div class="menu-content">
      <div class="menu-col" data-col="0">
        <div class="menu-content-group">
          <p>&copy; Lumine</p>
          <p>Tbilisi, Georgia</p>
        </div>
        <div class="menu-content-group">
          <p>What We Do</p>
          <p>Strategy &amp; Brand</p>
          <p>Photo, Video &amp; AI</p>
          <p>Web &amp; Marketing</p>
        </div>
        <div class="menu-content-group">
          <p>Say Hello</p>
          <p>hello@lumine.ge</p>
        </div>
        <div class="menu-content-group">
          <p>Hotline</p>
          <p>+995 555 00 00 00</p>
        </div>
      </div>
      <div class="menu-col" data-col="1">
        <div class="menu-content-group">
          <p>Socials</p>
          <a href="https://www.instagram.com/lumine.ge" target="_blank">Instagram</a>
        </div>
        <div class="menu-content-group">
          <p>Language</p>
          <p>Georgian, Mostly</p>
        </div>
        <div class="menu-content-group">
          <p>Available For</p>
          <p>New Projects</p>
        </div>
      </div>
    </div>

    <div class="menu-img">
      <img src="/menu/menu-img.jpg" alt="" />
    </div>

    <div class="menu-links-wrapper">
      ${menuItems
        .map(
          (item, i) => `
        <div class="menu-link" data-route="${item.route}">
          <span class="menu-link-index">${String(i + 1).padStart(2, "0")}</span>
          <a href="${item.route}">
            <span>${item.label}</span>
            <span>${item.label}</span>
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
    if (!isDesktopPointer()) return;
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
    if (!isDesktopPointer()) return;

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
    if (!isDesktopPointer()) return;

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
    if (!isDesktopPointer()) return;

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

  // The cursor-scrub is the whole point of this menu, but nothing about it
  // is discoverable - a first-time visitor has no reason to think moving
  // their mouse reveals more links. Rather than add a label or icon,
  // borrow the same targetX the mouse itself drives and nudge it once on
  // open: the links visibly shift left and settle back, teaching the
  // mechanic through motion instead of asking the visitor to read anything.
  function playIntroPeek() {
    if (!isDesktopPointer()) return;
    const maxMoveRight = window.innerWidth - menuLinksWrapper.offsetWidth;
    if (maxMoveRight >= 0) return; // links already fit - nothing to reveal
    targetX = Math.max(maxMoveRight, -240);
    setTimeout(() => {
      targetX = 0;
    }, 850);
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
      setTimeout(playIntroPeek, 1700);

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

  // A single threshold flickers: Lenis' eased scroll-to-top doesn't stop
  // cleanly, so scrollY can hover right on the line for a few frames while
  // settling, toggling the class back and forth. mix-blend-mode can't be
  // transitioned - it snaps instantly between "difference" and "normal" -
  // so a few rapid toggles read as a flicker even though background-color
  // is still easing. Two thresholds with a dead zone between them means a
  // wobble near the line can't retrigger the switch either way.
  const ON_THRESHOLD = 48;
  const OFF_THRESHOLD = 24;
  let ticking = false;
  let isSolid = false;

  function update() {
    const y = window.scrollY;
    if (!isSolid && y > ON_THRESHOLD) {
      isSolid = true;
    } else if (isSolid && y < OFF_THRESHOLD) {
      isSolid = false;
    }
    nav.classList.toggle("nav-solid", isSolid);
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMenu);
  document.addEventListener("DOMContentLoaded", initNavSolidOnScroll);
} else {
  initMenu();
  initNavSolidOnScroll();
}

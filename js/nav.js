import gsap from "gsap";

let lenis = null;
try {
  const lenisModule = await import("/js/lenis-scroll.js");
  lenis = lenisModule.default || lenisModule.lenis || null;
} catch (e) {}

// Georgian pages live under /ka/ as real, separate static HTML — not a
// client-side toggle — so the menu this builds just needs to know which
// side of that split the current page is on, to link and label itself
// correctly. No language state to read/write anywhere.
const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

/* This menu replaces a horizontal cursor-scrub rail. That rail put eight
   destinations in a 4,439px strip on a 1,890px viewport: three were fully
   visible, four were entirely off-screen, and the only hint that more
   existed was a thin progress bar. Pricing and Contact — the two things a
   prospect actually wants — were among the ones you could not see.

   It is now three columns grouped by what somebody came for, every
   destination on screen at once, with contact pulled out as its own block.
   The scrub loop, the link highlighter and the per-character SplitText
   animation are all gone with it. */

/* Counts are mirrored here rather than imported. projects-data.js is 37KB
   and questions-data.js is 49KB; nav.js loads on every page, so importing
   either to read one number would put the whole archive on the contact
   page. Keep these in step with those two files. */
const TALLY = { projects: 14, answers: 32, disciplines: 9 };

const MENU_GROUPS = isKa
  ? [
      {
        label: "სტუდია",
        items: [
          { label: "მთავარი", route: "/ka", desc: "დასაწყისში დაბრუნება" },
          { label: "სტუდია", route: "/ka/studio", desc: "ვისთან გექნებათ საქმე" },
        ],
      },
      {
        label: "რას ვაკეთებთ",
        items: [
          { label: "სერვისები", route: "/ka/services", desc: `${TALLY.disciplines} მიმართულება, ერთი გუნდი` },
          { label: "ფასები", route: "/ka/pricing", desc: "ყველა ტარიფი ღიად" },
          { label: "ნამუშევრები", route: "/ka/work", desc: `${TALLY.projects} პროექტი, 2024—2026` },
        ],
      },
      {
        label: "სასარგებლო",
        items: [
          { label: "კითხვები", route: "/ka/questions", desc: `${TALLY.answers} პასუხი — პაკეტებიდან უფლებებამდე` },
          { label: "ჟურნალი", route: "/ka/journal", desc: "მოკლე ჩანაწერები სამუშაო პროცესზე" },
        ],
      },
    ]
  : [
      {
        label: "The studio",
        items: [
          { label: "Home", route: "/", desc: "Back to the start" },
          { label: "Studio", route: "/studio", desc: "Who you would actually be working with" },
        ],
      },
      {
        label: "What we do",
        items: [
          { label: "Services", route: "/services", desc: `${TALLY.disciplines} disciplines, one team` },
          { label: "Pricing", route: "/pricing", desc: "Every rate listed in the open" },
          { label: "Work", route: "/work", desc: `${TALLY.projects} projects, 2024—2026` },
        ],
      },
      {
        label: "Good to know",
        items: [
          { label: "Questions", route: "/questions", desc: `${TALLY.answers} answers, packages to file rights` },
          { label: "Journal", route: "/journal", desc: "Short reads on how we work" },
        ],
      },
    ];

/* Only Instagram exists. The rest are deliberately absent rather than
   pointed at guessed profile URLs — add each one here as its account is
   confirmed and it appears in both languages at once. */
const SOCIALS = [{ label: "Instagram", href: "https://www.instagram.com/lumine.ge" }];

const COPY = isKa
  ? {
      follow: "მოგვყევით",
      ctaTitle: "დაიწყეთ პროექტი",
      ctaSub: "მოგვწერეთ რა გჭირდებათ — ვპასუხობთ დღის განმავლობაში.",
      here: "თქვენ აქ ხართ",
      openLabel: "მენიუ",
      closeLabel: "დახურვა",
      closeAria: "მენიუს დახურვა",
      openAria: "მენიუს გახსნა",
      rights: "© Lumine — თბილისი, საქართველო",
      availability: "ვიღებთ ახალ პროექტებს",
      contactRoute: "/ka/contact",
    }
  : {
      follow: "Follow",
      ctaTitle: "Start a project",
      ctaSub: "Tell us what you need — we reply within a day.",
      here: "You are here",
      openLabel: "Menu",
      closeLabel: "Close",
      closeAria: "Close menu",
      openAria: "Open menu",
      rights: "© Lumine — Tbilisi, Georgia",
      availability: "Available for new projects",
      contactRoute: "/contact",
    };

const EMAIL = "hello@lumine.ge";
const PHONE = "+995 555 00 00 00";

function currentPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function buildNav() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const existingOverlay = document.querySelector(".menu-overlay");
  if (existingOverlay) existingOverlay.remove();

  /* The toggle was a <div>: not focusable, no role, no state. The whole
     navigation was unreachable by keyboard. It is a real button now, and it
     reports whether the menu is open. */
  const oldToggler = nav.querySelector(".nav-toggler");
  if (oldToggler && oldToggler.tagName !== "BUTTON") {
    const btn = document.createElement("button");
    btn.className = "nav-toggler";
    btn.type = "button";
    oldToggler.replaceWith(btn);
  }
  const toggler = nav.querySelector(".nav-toggler");
  if (toggler) {
    toggler.setAttribute("aria-expanded", "false");
    toggler.setAttribute("aria-controls", "menuOverlay");
    toggler.setAttribute("aria-label", COPY.openAria);
    toggler.innerHTML = `<span class="nav-toggler-label">${COPY.openLabel}</span>`;
  }

  const groupsHtml = MENU_GROUPS.map(
    (group) => `
      <div class="menu-group">
        <p class="menu-group-label">${group.label}</p>
        ${group.items
          .map((item) => {
            const isHere = currentPath() === item.route.replace(/\/+$/, "");
            return `
          <a class="menu-item${isHere ? " is-here" : ""}" href="${item.route}"${
            isHere ? ' aria-current="page"' : ""
          }>
            <span class="menu-item-row">
              <span class="menu-item-num">${String(item.n).padStart(2, "0")}</span>
              <span class="menu-item-name">${item.label}</span>
              ${isHere ? `<span class="menu-here-tag">${COPY.here}</span>` : ""}
              <span class="menu-item-arrow" aria-hidden="true">→</span>
            </span>
            <span class="menu-item-desc">${item.desc}</span>
          </a>`;
          })
          .join("")}
        ${
          group.withSocials
            ? `<p class="menu-group-label menu-group-label-sub">${COPY.follow}</p>
               <div class="menu-socials">
                 ${SOCIALS.map(
                   (s) =>
                     `<a class="menu-social" href="${s.href}" target="_blank" rel="noopener">${s.label} <i aria-hidden="true">↗</i></a>`,
                 ).join("")}
               </div>`
            : ""
        }
      </div>`,
  ).join("");

  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  overlay.id = "menuOverlay";
  overlay.innerHTML = `
    <div class="menu-inner">
      <div class="menu-groups">${groupsHtml}</div>

      <a class="menu-cta" href="${COPY.contactRoute}">
        <span class="menu-cta-text">
          <span class="menu-cta-title">${COPY.ctaTitle}</span>
          <span class="menu-cta-sub">${COPY.ctaSub}</span>
        </span>
        <span class="menu-cta-lines">${EMAIL}<br />${PHONE}</span>
      </a>

      <div class="menu-foot">
        <span>${COPY.rights}</span>
        <span>${COPY.availability}</span>
      </div>
    </div>`;

  document.body.appendChild(overlay);
}

function initMenu() {
  // number the destinations in reading order across the three columns
  let n = 0;
  MENU_GROUPS.forEach((g) => g.items.forEach((i) => (i.n = ++n)));
  MENU_GROUPS[MENU_GROUPS.length - 1].withSocials = true;

  buildNav();

  const toggler = document.querySelector(".nav-toggler");
  const overlay = document.querySelector(".menu-overlay");
  if (!toggler || !overlay) return;

  const label = toggler.querySelector(".nav-toggler-label");
  const items = Array.from(overlay.querySelectorAll(".menu-item"));
  const chrome = Array.from(
    overlay.querySelectorAll(".menu-group-label, .menu-socials, .menu-cta, .menu-foot"),
  );

  let isOpen = false;
  let isAnimating = false;
  let lastFocus = null;

  /* The panel comes down from the top edge and retracts back up into it —
     the same direction as the bar it is opened from, so it reads as the
     header unfolding rather than something arriving from off-screen behind
     you. Closed is a zero-height strip pinned to the top; open is the full
     rectangle. The two point lists are written in the same order (top-left,
     top-right, bottom-right, bottom-left) because clip-path only
     interpolates smoothly when the vertices correspond one to one. */
  const CLOSED_CLIP = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
  const OPEN_CLIP = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

  /* Hidden means hidden. The old overlay was only hidden visually, so its
     nine links stayed in the tab order on every page — a keyboard user
     tabbed into a menu they could not see and could not have opened.
     `inert` removes the whole subtree from focus and the accessibility
     tree in one attribute. */
  function seal() {
    overlay.setAttribute("inert", "");
    overlay.setAttribute("aria-hidden", "true");
  }
  function unseal() {
    overlay.removeAttribute("inert");
    overlay.removeAttribute("aria-hidden");
  }

  /* Negative offsets: the contents settle downward into place behind the
     descending edge, and leave upward with it. Coming up from below while
     the panel comes down would have the two halves of the animation moving
     against each other. */
  function reset() {
    gsap.set(overlay, { clipPath: CLOSED_CLIP });
    gsap.set(items, { y: -22, opacity: 0 });
    gsap.set(chrome, { y: -14, opacity: 0 });
  }

  seal();
  reset();

  function open() {
    if (isAnimating || isOpen) return;
    isAnimating = true;
    isOpen = true;
    lastFocus = document.activeElement;

    unseal();
    if (lenis) lenis.stop();
    document.documentElement.classList.add("menu-is-open");
    toggler.setAttribute("aria-expanded", "true");
    toggler.setAttribute("aria-label", COPY.closeAria);
    if (label) label.textContent = COPY.closeLabel;

    gsap.to(overlay, {
      clipPath: OPEN_CLIP,
      duration: 0.9,
      ease: "expo.out",
      onComplete: () => {
        isAnimating = false;
        // send the reader to the first destination, not the close button
        const first = items[0];
        if (first) first.focus({ preventScroll: true });
      },
    });

    gsap.to(items, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.045,
      delay: 0.18,
      ease: "expo.out",
    });
    gsap.to(chrome, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.04,
      delay: 0.3,
      ease: "expo.out",
    });
  }

  function close({ restoreFocus = true } = {}) {
    if (isAnimating || !isOpen) return;
    isAnimating = true;
    isOpen = false;

    document.documentElement.classList.remove("menu-is-open");
    toggler.setAttribute("aria-expanded", "false");
    toggler.setAttribute("aria-label", COPY.openAria);
    if (label) label.textContent = COPY.openLabel;

    gsap.to([items, chrome].flat(), {
      y: -10,
      opacity: 0,
      duration: 0.32,
      ease: "power2.in",
    });

    gsap.to(overlay, {
      clipPath: CLOSED_CLIP,
      duration: 0.75,
      delay: 0.12,
      ease: "expo.inOut",
      onComplete: () => {
        reset();
        seal();
        isAnimating = false;
        if (lenis) lenis.start();
        if (restoreFocus && lastFocus && document.contains(lastFocus)) {
          lastFocus.focus({ preventScroll: true });
        }
      },
    });
  }

  toggler.addEventListener("click", () => (isOpen ? close() : open()));

  // Escape is what people press to get out of an overlay
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) close();
  });

  /* A link to the page you are already on should close the menu rather than
     reload it; anything else is left to js/page-transition.js, which needs a
     real anchor navigation to play the wipe. */
  overlay.querySelectorAll("a[href]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (href.replace(/\/+$/, "") === currentPath()) {
        e.preventDefault();
        close();
      }
    });
  });
}

/* ── the bar's one scroll state ───────────────────────────────────────────
   The header is sticky — it never leaves the screen. All that changes is
   whether it is transparent over the top of the page or sitting on a paper
   background once you have scrolled past it.

   This only toggles a class; the colour and its timing live in css/nav.css,
   which is also where the history of why this must not use mix-blend-mode
   is written down. */
function initHeaderScroll() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const STUCK_AT = 60; // roughly the bar's own height

  let ticking = false;

  function read() {
    nav.classList.toggle("is-stuck", window.scrollY > STUCK_AT);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    },
    { passive: true },
  );

  /* A reload partway down a page restores the scroll position without ever
     firing a scroll event, which would otherwise leave the bar transparent
     over mid-page content. */
  read();
}

function init() {
  initMenu();
  initHeaderScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

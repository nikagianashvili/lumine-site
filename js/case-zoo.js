/* ============================================================
   TBILISI ZOO case study — motion choreography
   One easing personality: expo/power4-out, snappy, never linear
   (except scrubs, which are physical and therefore ease:none).
   ============================================================ */
(function () {
  "use strict";

  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rand = function (min, max) { return min + Math.random() * (max - min); };

  var prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the proof always starts at the top of the sheet */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  gsap.registerPlugin(ScrollTrigger);

  var EASE = "power4.out";
  var EASE_IN_OUT = "expo.inOut";

  /* ---------- atmosphere switching (runs even under reduced motion) ---------- */
  function setupAtmosphere() {
    qa("[data-atmos]").forEach(function (sec) {
      if (sec === document.body) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 40%",
        end: "bottom 40%",
        onToggle: function (self) {
          if (self.isActive) document.body.dataset.atmos = sec.dataset.atmos;
        }
      });
    });
  }

  /* ---------- progress rail (basic wiring, motion optional) ---------- */
  function setupRail(animated) {
    var rail = q(".rail");
    if (!rail) return;

    ScrollTrigger.create({
      trigger: ".toc",
      start: "bottom 65%",
      onEnter: function () { rail.classList.add("visible"); },
      onLeaveBack: function () { rail.classList.remove("visible"); }
    });

    if (animated) {
      gsap.to(".rail-fill", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: 0.4 }
      });
    } else {
      gsap.set(".rail-fill", { scaleY: 1 });
    }

    qa(".rail-list li").forEach(function (li) {
      var link = q("a", li);
      var target = link.getAttribute("href");
      ScrollTrigger.create({
        trigger: target,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: function (self) { li.classList.toggle("active", self.isActive); }
      });
    });
  }

  /* ---------- anchors ---------- */
  function setupAnchors(lenis) {
    qa('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = q(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { duration: 1.4, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
        else target.scrollIntoView();
      });
    });
  }

  /* ============================================================
     REDUCED MOTION: wire the essentials, animate nothing.
     ============================================================ */
  if (prm) {
    setupAtmosphere();
    setupRail(false);
    setupAnchors(null);
    return;
  }

  /* ============================================================
     FULL MOTION
     ============================================================ */

  /* ---------- smooth scroll ---------- */
  var lenis = new Lenis({
    duration: 1.15,
    easing: function (t) { return 1 - Math.pow(1 - t, 4); },
    smoothWheel: true
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  var mm = gsap.matchMedia();
  var DESKTOP = "(min-width: 900px)";
  var MOBILE = "(max-width: 899px)";
  var FINE = window.matchMedia("(pointer: fine)").matches;

  document.fonts.ready.then(init);

  function init() {

    /* ---------- split the big type once fonts are real ---------- */
    var heroSplit = new SplitType(".hero-title", { types: "chars" });
    var shoutSplit = new SplitType(".work-shout", { types: "chars" });

    /* ============================================================
       01 · IDENT — stamp in, hold, wipe into the hero
       ============================================================ */
    var ident = q(".ident");
    var identLetters = qa(".ident-word span");
    var heroChars = heroSplit.chars;

    lenis.stop();
    gsap.set(heroChars, { yPercent: 115 });
    gsap.set([".hero-kicker", ".hero-dek", ".hero-badge", ".hero-scroll"], { autoAlpha: 0, y: 30 });
    gsap.set(".hero-meta span", { autoAlpha: 0, x: 14 });

    var identTl = gsap.timeline({
      defaults: { ease: EASE },
      onComplete: function () {
        ident.remove();
        lenis.start();
        ScrollTrigger.refresh();
      }
    });

    identTl
      .from(".ident-meta span", { autoAlpha: 0, y: 12, stagger: 0.07, duration: 0.5 })
      .from(identLetters, {
        autoAlpha: 0,
        scale: 1.7,
        rotation: function () { return rand(-9, 9); },
        duration: 0.34,
        ease: "power3.in",
        stagger: 0.075
      }, 0.15)
      .from(".ident-stamp", { autoAlpha: 0, scale: 1.6, rotation: -8, duration: 0.3, ease: "power3.in" }, "+=0.12")
      .to({}, { duration: 0.55 }) /* hold the proof */
      .to(".ident-wipe", { scaleY: 1, duration: 0.55, ease: EASE_IN_OUT })
      .to(ident, { yPercent: -100, duration: 0.85, ease: EASE_IN_OUT })
      /* the wipe reveals the hero — one continuous moment */
      .to(heroChars, {
        yPercent: 0,
        duration: 1.05,
        ease: "back.out(1.25)",
        stagger: 0.04
      }, "-=0.55")
      .to(".hero-kicker", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.7")
      .to([".hero-dek", ".hero-badge"], { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, "-=0.55")
      .to(".hero-meta span", { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.06 }, "-=0.5")
      .to(".hero-scroll", { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4");

    /* ============================================================
       02 · HERO — scrub: the title slides off the press
       ============================================================ */
    gsap.to(".hero-title", {
      xPercent: -7,
      skewX: -4,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
    gsap.to(".hero-meta", {
      yPercent: -14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
    /* the badge turns like a chase-wheel, slowly */
    gsap.to(".hero-badge", { rotation: 360, duration: 40, repeat: -1, ease: "none", transformOrigin: "50% 50%" });

    /* ============================================================
       03 · TOC — rows print in; hover preview follows the cursor
       ============================================================ */
    gsap.from(".toc-head", {
      autoAlpha: 0, y: 30, duration: 0.8, ease: EASE,
      scrollTrigger: { trigger: ".toc", start: "top 70%", once: true }
    });
    qa(".toc-list li").forEach(function (li, i) {
      gsap.from(li, {
        autoAlpha: 0, y: 46, duration: 0.9, ease: EASE, delay: i * 0.06,
        scrollTrigger: { trigger: ".toc-list", start: "top 78%", once: true }
      });
    });

    if (FINE) {
      var preview = q(".toc-preview");
      var pvX = gsap.quickTo(preview, "x", { duration: 0.45, ease: "power3.out" });
      var pvY = gsap.quickTo(preview, "y", { duration: 0.45, ease: "power3.out" });
      var toc = q(".toc");
      toc.addEventListener("mousemove", function (e) {
        var r = toc.getBoundingClientRect();
        pvX(e.clientX - r.left + 40);
        pvY(e.clientY - r.top - preview.offsetHeight / 2);
      });
      qa(".toc-list a").forEach(function (a) {
        a.addEventListener("mouseenter", function () {
          preview.className = "toc-preview pv-" + a.dataset.preview;
          gsap.to(preview, { autoAlpha: 1, rotation: rand(-6, 6), duration: 0.35, ease: EASE });
        });
        a.addEventListener("mouseleave", function () {
          gsap.to(preview, { autoAlpha: 0, duration: 0.25, ease: EASE });
        });
      });
    }

    /* ============================================================
       04 · BRIEF — the page prints left to right
       ============================================================ */
    var briefWords = new SplitType(".brief-headline", { types: "words" });
    gsap.from(briefWords.words, {
      yPercent: 110, duration: 1, ease: EASE, stagger: 0.09,
      scrollTrigger: { trigger: ".brief-head", start: "top 75%", once: true }
    });
    gsap.fromTo(".brief-cols",
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: EASE_IN_OUT,
        scrollTrigger: { trigger: ".brief-cols", start: "top 72%", once: true }
      });
    var quoteLines = new SplitType(".brief-quote p", { types: "lines" });
    quoteLines.lines.forEach(function (line) {
      var wrap = document.createElement("span");
      wrap.style.cssText = "display:block;overflow:hidden";
      line.parentNode.insertBefore(wrap, line);
      wrap.appendChild(line);
    });
    gsap.from(quoteLines.lines, {
      yPercent: 110, duration: 1, ease: EASE, stagger: 0.12,
      scrollTrigger: { trigger: ".brief-quote", start: "top 75%", once: true }
    });
    gsap.from(".brief-quote cite", {
      autoAlpha: 0, duration: 0.8, ease: EASE, delay: 0.3,
      scrollTrigger: { trigger: ".brief-quote", start: "top 75%", once: true }
    });
    gsap.from(".annot", {
      autoAlpha: 0, x: 26, duration: 0.8, ease: EASE, stagger: 0.14,
      scrollTrigger: { trigger: ".brief-margin", start: "top 78%", once: true }
    });

    /* ============================================================
       05 · RESEARCH — scraps land on the desk, then drift
       ============================================================ */
    qa(".scrap").forEach(function (scrap, i) {
      gsap.from(scrap, {
        x: rand(-140, 140),
        y: rand(140, 280),
        rotation: "+=" + rand(-16, 16),
        autoAlpha: 0,
        duration: 1.15,
        ease: EASE,
        delay: i * 0.09,
        scrollTrigger: { trigger: ".research-board", start: "top 72%", once: true }
      });
    });
    gsap.from(".research-note", {
      autoAlpha: 0, y: 30, duration: 0.9, ease: EASE, delay: 0.5,
      scrollTrigger: { trigger: ".research-board", start: "top 72%", once: true }
    });
    /* ink drawdowns pull downward as they enter */
    gsap.from(".fig-drawdown span", {
      scaleY: 0, duration: 1.1, ease: EASE, stagger: 0.1,
      scrollTrigger: { trigger: ".fig-drawdown", start: "top 80%", once: true }
    });
    mm.add(DESKTOP, function () {
      /* two parallax depths only */
      gsap.to([".scrap-a", ".scrap-d"], {
        yPercent: -10, ease: "none",
        scrollTrigger: { trigger: ".research-board", start: "top bottom", end: "bottom top", scrub: 0.8 }
      });
      gsap.to([".scrap-c", ".scrap-e"], {
        yPercent: -22, ease: "none",
        scrollTrigger: { trigger: ".research-board", start: "top bottom", end: "bottom top", scrub: 0.8 }
      });
    });

    /* ============================================================
       06 · PROCESS — pinned horizontal strip (desktop)
       ============================================================ */
    mm.add(DESKTOP, function () {
      var strip = q(".strip");
      var amt = function () { return strip.scrollWidth - window.innerWidth + 120; };
      var stripTween = gsap.to(strip, {
        x: function () { return -amt(); },
        ease: "none",
        scrollTrigger: {
          trigger: ".process",
          start: "top top",
          end: function () { return "+=" + amt(); },
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      qa(".frame").forEach(function (frame) {
        gsap.from(q(".stamp", frame), {
          scale: 0, rotation: "-=40", duration: 0.5, ease: "back.out(2.2)",
          scrollTrigger: { trigger: frame, containerAnimation: stripTween, start: "left 65%", once: true }
        });
        gsap.from(frame, {
          autoAlpha: 0, x: 90, duration: 0.9, ease: EASE,
          scrollTrigger: { trigger: frame, containerAnimation: stripTween, start: "left 95%", once: true }
        });
      });
      return function () { };
    });
    mm.add(MOBILE, function () {
      qa(".frame").forEach(function (frame) {
        gsap.from(frame, {
          autoAlpha: 0, y: 60, duration: 0.9, ease: EASE,
          scrollTrigger: { trigger: frame, start: "top 82%", once: true }
        });
      });
    });
    gsap.from([".process-head .sec-label", ".process-headline", ".process-hint"], {
      autoAlpha: 0, y: 34, duration: 0.9, ease: EASE, stagger: 0.08,
      scrollTrigger: { trigger: ".process", start: "top 60%", once: true }
    });

    /* ============================================================
       07 · THE SYSTEM — the manual's plates unmask behind hairlines
       ============================================================ */
    qa(".manual-cell .fig-photo").forEach(function (plate, i) {
      gsap.fromTo(plate,
        { clipPath: i % 2 ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0% 0)", duration: 1.2, ease: EASE_IN_OUT,
          scrollTrigger: { trigger: plate, start: "top 80%", once: true }
        });
    });
    gsap.from(".manual", {
      autoAlpha: 0, y: 50, duration: 1, ease: EASE,
      scrollTrigger: { trigger: ".manual", start: "top 80%", once: true }
    });
    gsap.from(".chips li", {
      autoAlpha: 0, y: 26, duration: 0.7, ease: EASE, stagger: 0.07,
      scrollTrigger: { trigger: ".chips", start: "top 82%", once: true }
    });
    gsap.from(".system-headline", {
      autoAlpha: 0, y: 40, duration: 0.9, ease: EASE,
      scrollTrigger: { trigger: ".system", start: "top 70%", once: true }
    });

    /* ============================================================
       08 · THE WORK — marquee + pinned char assembly + full bleed
       ============================================================ */
    var mqInner = q(".marquee-inner");
    if (mqInner) {
      var mqTween = gsap.to(mqInner, { xPercent: -50, ease: "none", duration: 22, repeat: -1 });
      lenis.on("scroll", function (e) {
        var v = Math.min(Math.abs(e.velocity) / 6, 3.2);
        gsap.to(mqTween, { timeScale: 1 + v, duration: 0.2, overwrite: "auto" });
      });
    }

    mm.add(DESKTOP, function () {
      /* pinned scrub: THE WORK assembles letter by letter as loose sorts */
      var chars = shoutSplit.chars;
      gsap.set(chars, {
        x: function () { return rand(-260, 260); },
        y: function () { return rand(-180, 240); },
        rotation: function () { return rand(-35, 35); },
        autoAlpha: 0
      });
      gsap.to(chars, {
        x: 0, y: 0, rotation: 0, autoAlpha: 1,
        ease: "power2.out",
        stagger: 0.05,
        scrollTrigger: {
          trigger: ".work",
          start: "top top",
          end: "+=90%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1
        }
      });
      return function () { };
    });
    mm.add(MOBILE, function () {
      gsap.from(shoutSplit.chars, {
        yPercent: 80, autoAlpha: 0, duration: 0.9, ease: EASE, stagger: 0.03,
        scrollTrigger: { trigger: ".work-shout", start: "top 75%", once: true }
      });
    });

    gsap.fromTo(".piece-solo .fig",
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: EASE_IN_OUT,
        scrollTrigger: { trigger: ".piece-solo", start: "top 78%", once: true }
      });
    gsap.fromTo(".piece-solo .fig-photo img",
      { scale: 1.12 },
      {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: ".piece-solo", start: "top bottom", end: "bottom top", scrub: 0.8 }
      });
    qa(".piece-pair .piece").forEach(function (piece, i) {
      gsap.from(piece, {
        autoAlpha: 0, y: 90, duration: 1, ease: EASE, delay: i * 0.12,
        scrollTrigger: { trigger: ".piece-pair", start: "top 80%", once: true }
      });
    });
    mm.add(DESKTOP, function () {
      gsap.to(".piece-pair .piece:first-child", {
        yPercent: -8, ease: "none",
        scrollTrigger: { trigger: ".piece-pair", start: "top bottom", end: "bottom top", scrub: 0.8 }
      });
    });
    gsap.from(".piece-triptych .piece", {
      autoAlpha: 0, yPercent: 14, duration: 0.9, ease: EASE, stagger: 0.12,
      scrollTrigger: { trigger: ".piece-triptych", start: "top 82%", once: true }
    });

    /* ============================================================
       09 · IN CONTEXT — images unmask from behind hairlines
       ============================================================ */
    gsap.from(".context-headline", {
      autoAlpha: 0, y: 40, duration: 0.9, ease: EASE,
      scrollTrigger: { trigger: ".context", start: "top 70%", once: true }
    });
    var ctxClips = ["inset(0 100% 0 0)", "inset(0 0 100% 0)", "inset(0 0 0 100%)"];
    qa(".context-cluster .ctx").forEach(function (ctx, i) {
      gsap.fromTo(q(".fig", ctx),
        { clipPath: ctxClips[i % 3] },
        {
          clipPath: "inset(0 0% 0% 0%)", duration: 1.2, ease: EASE_IN_OUT,
          scrollTrigger: { trigger: ctx, start: "top 78%", once: true }
        });
      gsap.from(q("figcaption", ctx), {
        autoAlpha: 0, duration: 0.8, delay: 0.5, ease: EASE,
        scrollTrigger: { trigger: ctx, start: "top 78%", once: true }
      });
    });

    /* ============================================================
       10 · OUTCOME — counters roll, credits print, giant next
       ============================================================ */
    qa(".num").forEach(function (numEl) {
      var target = parseInt(numEl.dataset.count, 10);
      var pre = numEl.dataset.prefix || "";
      var suf = numEl.dataset.suffix || "";
      var proxy = { v: 0 };
      gsap.to(proxy, {
        v: target, duration: 1.6, ease: "power4.out",
        onUpdate: function () { numEl.textContent = pre + Math.round(proxy.v) + suf; },
        scrollTrigger: { trigger: numEl, start: "top 85%", once: true }
      });
    });
    gsap.from(".ledger-row", {
      autoAlpha: 0, y: 40, duration: 0.9, ease: EASE, stagger: 0.12,
      scrollTrigger: { trigger: ".ledger", start: "top 78%", once: true }
    });
    gsap.from(".credits > *, .credits dl > div", {
      autoAlpha: 0, y: 26, duration: 0.8, ease: EASE, stagger: 0.1,
      scrollTrigger: { trigger: ".credits", start: "top 80%", once: true }
    });
    gsap.from(".colophon p", {
      autoAlpha: 0, duration: 1, ease: EASE,
      scrollTrigger: { trigger: ".colophon", start: "top 88%", once: true }
    });
    var nextWords = new SplitType(".next-word", { types: "chars" });
    gsap.from(nextWords.chars, {
      yPercent: 105, duration: 0.9, ease: EASE, stagger: 0.025,
      scrollTrigger: { trigger: ".next", start: "top 72%", once: true }
    });

    /* magnetic pull on the giant link */
    if (FINE) {
      var next = q(".next");
      var nWord = q(".next-word");
      next.addEventListener("mousemove", function (e) {
        var r = next.getBoundingClientRect();
        var relX = (e.clientX - r.left) / r.width - 0.5;
        var relY = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(nWord, { x: relX * 46, y: relY * 26, duration: 0.6, ease: "power3.out" });
      });
      next.addEventListener("mouseleave", function () {
        gsap.to(nWord, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      });
    }

    /* ---------- shared chrome ---------- */
    setupAtmosphere();
    setupRail(true);
    setupAnchors(lenis);
    setupCursor();

    ScrollTrigger.refresh();
  }

  /* ============================================================
     custom cursor — default / link / view / drag
     ============================================================ */
  function setupCursor() {
    if (!FINE) return;
    var cursor = q(".cursor");
    var label = q(".cursor-label");
    var cx = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3.out" });
    var cy = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3.out" });
    document.addEventListener("mousemove", function (e) { cx(e.clientX); cy(e.clientY); });

    var LABELS = { view: "VIEW", drag: "SCROLL", link: "" };
    document.addEventListener("mouseover", function (e) {
      var el = e.target.closest("[data-cursor], a");
      cursor.classList.remove("is-link", "is-view", "is-drag");
      if (!el) return;
      var kind = el.dataset ? (el.dataset.cursor || "link") : "link";
      cursor.classList.add("is-" + kind);
      label.textContent = LABELS[kind] || "";
    });
  }
})();

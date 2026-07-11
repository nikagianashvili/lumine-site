import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LANG_KEY = "lumine-lang";
const currentLang = () => localStorage.getItem(LANG_KEY) || "en";

const HEADERS = {
  en: { sticky: "What We Obsess Over", mobile: "The Disciplines" },
  ka: { sticky: "რაზეც ვზრუნავთ", mobile: "მიმართულებები" },
};

// discipline cards — what the studio does, not invented people.
// Swap for real team members (name, photo, bio) when the roster is public.
const teamMembers = [
  {
    id: "card-1",
    name: "Photo & Video",
    name_ka: "ფოტო და ვიდეო",
    img: "/work/work2.jpg",
    alt: "Photo and video discipline",
    description:
      "Shoots, retouching, color. The pictures do the selling before anyone reads a word.",
    description_ka:
      "გადაღება, რეტუში, ფერი. სურათები ყიდიან მანამ, სანამ ვინმე სიტყვას წაიკითხავს.",
  },
  {
    id: "card-2",
    name: "Design",
    name_ka: "დიზაინი",
    img: "/work/work1.jpg",
    alt: "Design discipline",
    description:
      "Identity, posters, brand books. The face of the thing, kept consistent everywhere.",
    description_ka:
      "იდენტობა, პოსტერები, ბრენდბუქები. საგნის სახე, ერთნაირად შენარჩუნებული ყველგან.",
  },
  {
    id: "card-3",
    name: "Social & Content",
    name_ka: "სოციალური და კონტენტი",
    img: "/work/work3.jpg",
    alt: "Social and content discipline",
    description:
      "Plans that ship, posts that sound like you, and yes — the comments section too.",
    description_ka:
      "გეგმები, რომლებიც სრულდება, პოსტები, რომლებიც შენსავით ჟღერს, და კი — კომენტარების სექციაც.",
  },
  {
    id: "card-4",
    name: "Marketing",
    name_ka: "მარკეტინგი",
    img: "/work/work6.jpg",
    alt: "Marketing discipline",
    description:
      "Paid social and SEO with receipts. Reach you can measure, not vibes.",
    description_ka:
      "ფასიანი სოციალური და SEO, დამტკიცებადი. მიწვდომა, რომლის გაზომვაც შეგიძლია და არა შეგრძნება.",
  },
  {
    id: "card-5",
    name: "Web",
    name_ka: "ვები",
    img: "/work/work4.jpg",
    alt: "Web discipline",
    description:
      "Sites designed and built in house — fast, maintained, and never off a theme store.",
    description_ka:
      "საიტები, დაპროექტებული და აშენებული საკუთარ გუნდში — სწრაფი, მხარდაჭერილი და არასდროს თემის მაღაზიიდან.",
  },
];

// dom builders
function buildCard(m, lang) {
  const card = document.createElement("div");
  card.className = "card";
  card.id = m.id;
  card.innerHTML = `
    <div class="card-img">
      <img src="${m.img}" alt="${m.alt}" />
    </div>
    <div class="card-content">
      <div class="card-title"><h6>${lang === "ka" ? m.name_ka : m.name}</h6></div>
      <div class="card-description"><p>${lang === "ka" ? m.description_ka : m.description}</p></div>
    </div>
  `;
  return card;
}

function buildTeam(lang) {
  // desktop section
  const desktopSection = document.createElement("section");
  desktopSection.className = "sticky team-desktop";
  desktopSection.id = "team-desktop";

  const stickyHeader = document.createElement("div");
  stickyHeader.className = "sticky-header";
  stickyHeader.innerHTML = `<h1>${HEADERS[lang].sticky}</h1>`;
  desktopSection.appendChild(stickyHeader);

  const desktopCards = teamMembers.map((m) => {
    const card = buildCard(m, lang);
    desktopSection.appendChild(card);
    return card;
  });

  // mobile section
  const mobileSection = document.createElement("section");
  mobileSection.className = "team-mobile";

  const mobileHeader = document.createElement("div");
  mobileHeader.className = "mobile-header";
  mobileHeader.innerHTML = `<h1>${HEADERS[lang].mobile}</h1>`;
  mobileSection.appendChild(mobileHeader);

  const mobileCards = teamMembers.map((m) => {
    const card = buildCard(m, lang);
    card.id = `m-${m.id}`;
    mobileSection.appendChild(card);
    return card;
  });

  return { desktopSection, stickyHeader, desktopCards, mobileSection, mobileHeader, mobileCards };
}

// animation transforms
const transforms = [
  [
    [10, 50, -10, 10],
    [20, -10, -45, 20],
  ],
  [
    [0, 47.5, -10, 15],
    [-25, 15, -45, 30],
  ],
  [
    [0, 52.5, -10, 5],
    [15, -5, -40, 60],
  ],
  [
    [0, 50, 30, -80],
    [20, -10, 60, 5],
  ],
  [
    [0, 55, -15, 30],
    [25, -15, 60, 95],
  ],
];

function relabel(lang, refs) {
  const { stickyHeader, mobileHeader, desktopCards, mobileCards } = refs;
  stickyHeader.querySelector("h1").textContent = HEADERS[lang].sticky;
  mobileHeader.querySelector("h1").textContent = HEADERS[lang].mobile;
  teamMembers.forEach((m, i) => {
    const dCard = desktopCards[i];
    const mCard = mobileCards[i];
    if (dCard) {
      dCard.querySelector(".card-title h6").textContent = lang === "ka" ? m.name_ka : m.name;
      dCard.querySelector(".card-description p").textContent = lang === "ka" ? m.description_ka : m.description;
    }
    if (mCard) {
      mCard.querySelector(".card-title h6").textContent = lang === "ka" ? m.name_ka : m.name;
      mCard.querySelector(".card-description p").textContent = lang === "ka" ? m.description_ka : m.description;
    }
  });
}

function initTeamCards(mountEl) {
  const refs = buildTeam(currentLang());
  const { desktopSection, stickyHeader, desktopCards, mobileSection } = refs;

  // mount sections (css controls visibility)
  mountEl.appendChild(desktopSection);
  mountEl.appendChild(mobileSection);

  document.documentElement.addEventListener("lumine:langchange", (e) => {
    relabel(e.detail.lang, refs);
  });

  const mm = gsap.matchMedia();

  // desktop
  mm.add("(min-width: 1000px)", () => {
    let scrollTriggerInstance = null;

    let stickyHeight = 0;
    let maxTranslate = 0;
    let cardWidth = 325;
    let cardStartX = 25;
    let cardEndX = -650;

    const measure = () => {
      stickyHeight = window.innerHeight * 5;
      const headerWidth = stickyHeader.offsetWidth;
      maxTranslate = Math.max(0, headerWidth - window.innerWidth);

      const viewportWidth = window.innerWidth;

      if (desktopCards.length > 0 && desktopCards[0]) {
        const cardRect = desktopCards[0].getBoundingClientRect();
        cardWidth = cardRect.width || 325;
      }

      const standardViewportWidth = 1920;
      const standardTravelPixels = Math.abs((-650 / 100) * cardWidth);
      const viewportScale = viewportWidth / standardViewportWidth;
      const requiredTravelPixels =
        standardTravelPixels * 1.25 * Math.max(1, viewportScale);

      cardStartX = 25;
      cardEndX = -(requiredTravelPixels / cardWidth) * 100;
    };

    measure();

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: desktopSection,
      start: "top top",
      end: () => `+=${stickyHeight}px`,
      invalidateOnRefresh: true,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const progress = self.progress;

        gsap.set(stickyHeader, { x: -progress * maxTranslate });

        desktopCards.forEach((card, index) => {
          const delay = index * 0.1125;
          const cardProgress = Math.max(0, Math.min((progress - delay) * 2, 1));

          if (cardProgress > 0) {
            const yPos = transforms[index][0];
            const rotations = transforms[index][1];

            const cardX = gsap.utils.interpolate(
              cardStartX,
              cardEndX,
              cardProgress,
            );

            const yProgress = cardProgress * 3;
            const yIndex = Math.min(Math.floor(yProgress), yPos.length - 2);
            const yInterpolation = yProgress - yIndex;
            const cardY = gsap.utils.interpolate(
              yPos[yIndex],
              yPos[yIndex + 1],
              yInterpolation,
            );
            const cardRotation = gsap.utils.interpolate(
              rotations[yIndex],
              rotations[yIndex + 1],
              yInterpolation,
            );

            gsap.set(card, {
              xPercent: cardX,
              yPercent: cardY,
              rotation: cardRotation,
              opacity: 1,
            });
          } else {
            gsap.set(card, { opacity: 0 });
          }
        });
      },
    });

    const onRefreshInit = () => measure();
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);

    const handleResize = () => {
      measure();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    ScrollTrigger.refresh();

    return () => {
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      window.removeEventListener("resize", handleResize);
    };
  });

  // mobile
  mm.add("(max-width: 999px)", () => {
    // clear inline styles so css takes full control
    gsap.set(desktopSection, { clearProps: "all" });
    gsap.set(stickyHeader, { clearProps: "all" });
    desktopCards.forEach((card) => {
      if (card) gsap.set(card, { clearProps: "all", opacity: 1 });
    });

    ScrollTrigger.refresh();

    const refreshHandler = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", refreshHandler);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad, { passive: true });

    return () => {
      window.removeEventListener("orientationchange", refreshHandler);
      window.removeEventListener("load", onLoad);
    };
  });
}

// mount
const mountEl = document.getElementById("team-cards");
if (mountEl) initTeamCards(mountEl);

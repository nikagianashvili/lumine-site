import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const isKa = /^\/ka(\/|$)/.test(window.location.pathname);

/* ── PLACEHOLDER ROSTER — replace before launch ───────────────────────────
   These are seats, not people. Each card names the post rather than a
   person, which is the same device the timeline on this page already uses
   ("The Document", "The Mark", "The Site"), so it reads as deliberate
   rather than unfinished.

   Deliberately NOT invented names. The clients wall on this same page ships
   five made-up companies in its alt text, and that is a credibility problem
   nobody noticed for months; a made-up roster would be the same mistake
   about actual colleagues. When the real team is public, swap `name` for
   the person and leave `role` as it is — nothing else has to change.

   The portraits are the template's stock illustrations and are placeholder
   too. They also vary in weight (29KB to 196KB), so if the illustrated look
   is kept on purpose they should be re-exported as one consistent set. */
const teamMembersEn = [
  {
    id: "card-1",
    name: "The Director",
    role: "Creative Direction",
    img: "/team-cards/team-member-1.jpg",
    alt: "Illustrated portrait — creative direction",
    description:
      "Decides what the work is actually for, before anyone opens a design file.",
  },
  {
    id: "card-2",
    name: "The Designer",
    role: "Design & Identity",
    img: "/team-cards/team-member-2.jpg",
    alt: "Illustrated portrait — design and identity",
    description:
      "Draws the identity, then keeps it honest across every poster, page and post.",
  },
  {
    id: "card-3",
    name: "The Lens",
    role: "Photo & Video",
    img: "/team-cards/team-member-3.jpg",
    alt: "Illustrated portrait — photo and video",
    description:
      "Shoots it, grades it, and knows the picture sells before the copy is read.",
  },
  {
    id: "card-4",
    name: "The Voice",
    role: "Social & Content",
    img: "/team-cards/team-member-4.jpg",
    alt: "Illustrated portrait — social and content",
    description:
      "Writes the posts, plans the calendar, and answers the comments like a person.",
  },
  {
    id: "card-5",
    name: "The Builder",
    role: "Web & Development",
    img: "/team-cards/team-member-5.jpg",
    alt: "Illustrated portrait — web and development",
    description:
      "Designs and ships the site in house — fast, maintained, never off a theme store.",
  },
];

/* Same placeholder roster in Georgian. Georgian has no articles, so the
   "The X" device becomes the bare role-noun, which reads the same way. */
const teamMembersKa = [
  {
    id: "card-1",
    name: "დირექტორი",
    role: "კრეატიული მიმართულება",
    img: "/team-cards/team-member-1.jpg",
    alt: "ილუსტრირებული პორტრეტი — კრეატიული მიმართულება",
    description:
      "წყვეტს, რისთვის კეთდება სამუშაო, სანამ ვინმე დიზაინის ფაილს გახსნის.",
  },
  {
    id: "card-2",
    name: "დიზაინერი",
    role: "დიზაინი და იდენტობა",
    img: "/team-cards/team-member-2.jpg",
    alt: "ილუსტრირებული პორტრეტი — დიზაინი და იდენტობა",
    description:
      "ხატავს იდენტობას და ინარჩუნებს მას ყველა პოსტერზე, გვერდსა და პოსტში.",
  },
  {
    id: "card-3",
    name: "ობიექტივი",
    role: "ფოტო და ვიდეო",
    img: "/team-cards/team-member-3.jpg",
    alt: "ილუსტრირებული პორტრეტი — ფოტო და ვიდეო",
    description:
      "იღებს, ამუშავებს ფერს და იცის — სურათი ყიდის მანამ, სანამ ტექსტს წაიკითხავენ.",
  },
  {
    id: "card-4",
    name: "ხმა",
    role: "სოციალური და კონტენტი",
    img: "/team-cards/team-member-4.jpg",
    alt: "ილუსტრირებული პორტრეტი — სოციალური და კონტენტი",
    description:
      "წერს პოსტებს, გეგმავს კალენდარს და კომენტარებს ადამიანივით პასუხობს.",
  },
  {
    id: "card-5",
    name: "დეველოპერი",
    role: "ვები და დეველოპმენტი",
    img: "/team-cards/team-member-5.jpg",
    alt: "ილუსტრირებული პორტრეტი — ვები და დეველოპმენტი",
    description:
      "ქმნის და უშვებს საიტს საკუთარ გუნდში — სწრაფად, მხარდაჭერით, არასდროს თემის მაღაზიიდან.",
  },
];

const teamMembers = isKa ? teamMembersKa : teamMembersEn;
/* The sticky header is the word that scrubs sideways across 290vw, so its
   length is load-bearing: too short and there is nothing to travel, too
   long and the cards outrun it. "What We Obsess Over" was 19 characters;
   these are deliberately close to that. */
const HEADER_STICKY = isKa ? "ვინ დგას ამის უკან" : "The People Behind It";
const HEADER_MOBILE = isKa ? "გუნდი" : "The Team";

// dom builders
function buildCard(m) {
  const card = document.createElement("div");
  card.className = "card";
  card.id = m.id;
  card.innerHTML = `
    <div class="card-img">
      <img src="${m.img}" alt="${m.alt}" />
    </div>
    <div class="card-content">
      <div class="card-title">
        <h6>${m.name}</h6>
        <p class="card-role">${m.role}</p>
      </div>
      <div class="card-description"><p>${m.description}</p></div>
    </div>
  `;
  return card;
}

function buildTeam() {
  // desktop section
  const desktopSection = document.createElement("section");
  desktopSection.className = "sticky team-desktop";
  desktopSection.id = "team-desktop";

  const stickyHeader = document.createElement("div");
  stickyHeader.className = "sticky-header";
  stickyHeader.innerHTML = `<h1>${HEADER_STICKY}</h1>`;
  desktopSection.appendChild(stickyHeader);

  const desktopCards = teamMembers.map((m) => {
    const card = buildCard(m);
    desktopSection.appendChild(card);
    return card;
  });

  // mobile section
  const mobileSection = document.createElement("section");
  mobileSection.className = "team-mobile";

  const mobileHeader = document.createElement("div");
  mobileHeader.className = "mobile-header";
  mobileHeader.innerHTML = `<h1>${HEADER_MOBILE}</h1>`;
  mobileSection.appendChild(mobileHeader);

  teamMembers.forEach((m) => {
    const card = buildCard(m);
    card.id = `m-${m.id}`;
    mobileSection.appendChild(card);
  });

  return { desktopSection, stickyHeader, desktopCards, mobileSection };
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

function initTeamCards(mountEl) {
  const { desktopSection, stickyHeader, desktopCards, mobileSection } =
    buildTeam();

  // mount sections (css controls visibility)
  mountEl.appendChild(desktopSection);
  mountEl.appendChild(mobileSection);

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

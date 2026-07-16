// Shared source for the homepage FAQ accordion (js/faq-render.js renders
// this into .faq-list, js/faq.js handles the open/close interaction on
// whatever ends up in the DOM) and the AI chat widget's grounding
// (api/ai/_lib/grounding.js imports this directly - it's a plain ESM
// module with no browser globals, so it works server-side unchanged).
// Single source of truth: edit an answer here, both the homepage and the
// chat bot stay in sync automatically.

export const FAQ = [
  {
    question: "What does a package actually include?",
    question_ka: "რას მოიცავს პაკეტი რეალურად?",
    answer:
      "Packages bundle a set number of posters and videos with social media management and paid advertising. Site management is available as an add-on. Individual services — photo, video, a brand book, or a standalone site — are also booked on their own.",
    answer_ka:
      "პაკეტები აერთიანებს გარკვეულ რაოდენობის პოსტერსა და ვიდეოს სოციალური მედიის მართვასთან და ფასიან რეკლამასთან ერთად. საიტის მართვა ხელმისაწვდომია დამატებით. ცალკეული სერვისები — ფოტო, ვიდეო, ბრენდბუქი ან ცალკე საიტი — ასევე შესაძლებელია დამოუკიდებლად შეკვეთა.",
  },
  {
    question: "How is pricing structured?",
    question_ka: "როგორ არის აწყობილი ფასები?",
    answer:
      "Three package tiers cover most ongoing work, priced by scope — how many posters and videos per month, plus social and ad management. Single services are quoted separately. Exact numbers live on the Pricing page.",
    answer_ka:
      "სამი პაკეტის დონე მოიცავს უმეტეს მუდმივ სამუშაოს, ფასდება მოცულობის მიხედვით — რამდენი პოსტერი და ვიდეო თვეში, პლუს სოციალური და რეკლამის მართვა. ცალკეული სერვისები ფასდება ცალკე. ზუსტი ციფრები ფასების გვერდზეა.",
  },
  {
    question: "Do you work with brand-new businesses?",
    question_ka: "მუშაობთ სულ ახალდაწყებულ ბიზნესებთან?",
    answer:
      "Yes — a good share of what we do is helping a founder go from nothing to a working brand: name, look, first content, first site.",
    answer_ka:
      "დიახ — ჩვენი საქმის დიდი ნაწილი სწორედ დამფუძნებელს ეხმარება ნულიდან სამუშაო ბრენდამდე მისვლაში: სახელი, სახე, პირველი კონტენტი, პირველი საიტი.",
  },
  {
    question: "Can you handle just one service, not a full package?",
    question_ka: "შეგიძლიათ მხოლოდ ერთი სერვისი, არა მთელი პაკეტი?",
    answer: "Yes. Photo, video, a brand book, or a website can each be booked individually if that's all you need right now.",
    answer_ka: "დიახ. ფოტო, ვიდეო, ბრენდბუქი ან საიტი შეიძლება შეკვეთოთ ცალ-ცალკე, თუ ახლა მხოლოდ ეს გჭირდებათ.",
  },
];

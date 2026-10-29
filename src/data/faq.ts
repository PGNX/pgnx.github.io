/**
 * FAQ for Pakistani students. Facts checked on 29 Oct 2026 against the sources linked in each answer
 * (see data/faq-research.md for the research notes). Edit here, no build step needed.
 */
export interface FaqItem { q: string; a: string[]; links?: { label: string; url: string }[] }
export interface FaqGroup { id: string; title: string; blurb: string; items: FaqItem[] }

export const FAQ_CHECKED = "2026-10-29";

export const FAQ: FaqGroup[] = [
  {
    id: "basics",
    title: "Before you apply",
    blurb: "Degrees, language, grades and the two intakes.",
    items: [
      {
        q: "Is studying in Germany really free?",
        a: [
          "At most public universities there is no tuition fee for Bachelor's or Master's, including for Pakistani students. You pay only a semester contribution of about 70 to 430 EUR per semester, which covers student services and usually a public-transport ticket.",
          "Two exceptions matter for non-EU students: universities in Baden-Württemberg (Stuttgart, Karlsruhe, Heidelberg, Mannheim, Freiburg, Tübingen and others) charge 1,500 EUR per semester, and Bavaria lets universities set their own fees, which TU Munich uses for newly enrolling non-EU students. Private universities charge tuition everywhere.",
          "On this site the Tuition tile on every programme page tells you which case applies.",
        ],
        links: [{ label: "DAAD: costs of studying", url: "https://www.daad.de/en/studying-in-germany/living-in-germany/finances/" }],
      },
      {
        q: "What is the difference between a university and a university of applied sciences (Hochschule / FH)?",
        a: [
          "Universities are research-oriented and award doctorates. Universities of applied sciences (Hochschule, Technische Hochschule, FH, HAW) are practice-oriented, often with mandatory internships and smaller classes. Both award full Bachelor's and Master's degrees that are recognised in Pakistan and worldwide.",
          "For a Master's that should lead to a PhD, prefer a university. For a job-focused Master's with industry contact, a university of applied sciences is often the better fit and admission is sometimes easier.",
        ],
      },
      {
        q: "Winter or summer intake, which one should I target?",
        a: [
          "The winter semester starts in September or October and is the main intake: almost every programme admits then. The summer semester starts in March or April and only some programmes admit.",
          "Typical deadlines are 15 July for winter and 15 January for summer, but many Master's close much earlier, especially the ones that use uni-assist. The deadline shown on each programme page here is the non-EU one, which is what applies to you.",
          "Plan backwards from the deadline: uni-assist alone needs 4 to 6 weeks, and the visa appointment in Islamabad can take months.",
        ],
        links: [{ label: "DAAD: application process", url: "https://www.daad.de/en/studying-in-germany/requirements/application-process/" }],
      },
      {
        q: "What German grade does my CGPA or percentage become?",
        a: [
          "German universities convert foreign grades with the modified Bavarian formula: 1.0 is the best grade, 4.0 the lowest pass. Many Master's programmes want 2.5 or better, selective ones 2.0 or better.",
          "The minimum passing grade of your university matters a lot. A 3.47 CGPA with a 2.0 pass mark becomes 1.7, with a 2.5 pass mark it becomes 1.9. Use our calculator and read the exact requirement on the programme page.",
        ],
        links: [{ label: "German grade calculator", url: "/gpa/" }],
      },
      {
        q: "Do I need IELTS, or is a Medium of Instruction (MOI) letter enough?",
        a: [
          "Most English-taught Master's ask for IELTS Academic 6.5 or TOEFL iBT around 88 to 90. Some accept a lower score, some ask for more.",
          "Some universities accept an English-taught previous degree instead of a test, confirmed by an MOI letter from your university, but many do not. There is no national rule. Check the English line on the programme page here, then confirm on the official page, and book IELTS early if there is any doubt.",
        ],
      },
      {
        q: "Do I need German?",
        a: [
          "Not for admission to a fully English-taught programme. A few programmes are listed as English plus German and expect some German modules; those show the German requirement on the programme page.",
          "For daily life, part-time jobs and getting a job after graduation, German helps enormously. Start A1 to B1 before you arrive if you can.",
        ],
      },
    ],
  },
  {
    id: "apply",
    title: "Applying",
    blurb: "uni-assist, VPD, GRE, ECTS and documents.",
    items: [
      {
        q: "What is uni-assist and what is a VPD?",
        a: [
          "uni-assist is a service used by about 180 German universities to check international applications. If a programme page here says Apply via uni-assist, you upload your documents to the My assist portal, pay the handling fee, and uni-assist checks them before the university sees your application.",
          "Handling fee per semester: 75 EUR for the first programme and 30 EUR for each additional one. It is not refundable.",
          "A VPD (Vorprüfungsdokumentation) is a certificate from uni-assist that confirms your documents and shows your converted German grade. Some universities want you to apply directly on their portal but attach a VPD. Getting a VPD takes 4 to 6 weeks and it is valid for one year, so request it early.",
        ],
        links: [
          { label: "uni-assist handling fees", url: "https://www.uni-assist.de/en/how-to-apply/pay-all-fees/handling-fees/" },
          { label: "uni-assist: VPD", url: "https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/" },
        ],
      },
      {
        q: "Is the GRE required?",
        a: [
          "Not everywhere, but for Pakistani applicants it comes up more than you would expect. TU Munich requires the GRE General Test (or GATE) for its Informatics and Data Engineering Master's from applicants with degrees from Pakistan, India, Bangladesh, China or Iran, with minimum Quantitative 164 and Analytical Writing 4.0. RWTH Aachen's Computer Science Master's requires it from all non-EU applicants. Paderborn asks for GRE or dMat from non-EU applicants unless your grade is very good.",
          "Programme pages on this site show a red GRE required tag whenever the official text mentions it, and an amber tag when there is an exception, for example a waiver for a very good grade.",
        ],
        links: [
          { label: "TUM: special conditions for certain countries", url: "https://www.tum.de/en/studies/application/application-info-portal/special-conditions-for-certain-countries" },
          { label: "RWTH: Computer Science M.Sc. admission", url: "https://sc.informatik.rwth-aachen.de/en/studium/master/informatik/start-ins-studium/" },
        ],
      },
      {
        q: "What does \"30 ECTS in Mathematics\" mean for my Pakistani degree?",
        a: [
          "ECTS credits measure workload: 1 ECTS is about 25 to 30 hours. A 4-year Pakistani Bachelor's of 120 to 136 credit hours is normally treated as 180 to 240 ECTS, and a 3-credit-hour course is roughly 4 to 6 ECTS.",
          "When a programme asks for a certain number of ECTS in a subject, add up the credit hours of your courses in that subject from your transcript and convert. Universities judge this from your transcript and module descriptions, so keep course outlines ready. The ECTS box on each programme page here lists what the programme asks for.",
        ],
      },
      {
        q: "Which documents do I usually need?",
        a: [
          "Typically: Bachelor's degree certificate and transcript (or a provisional certificate plus transcript if you are in the final semester), intermediate and matric certificates, English test or MOI letter, CV, motivation letter, passport copy, and sometimes recommendation letters, a GRE score or a VPD.",
          "Documents must usually be in English or German. Most universities accept English originals from Pakistani universities, but attested copies are often required. Keep scans of everything in one folder; you will upload the same set many times.",
        ],
      },
      {
        q: "Do Pakistani students need an APS certificate?",
        a: [
          "As of our check in October 2026, no official page requires an APS (Akademische Prüfstelle) certificate for applicants from Pakistan. The APS process applies to China, India, Vietnam and Mongolia. The German Embassy Islamabad's student-visa page lists degree certificates, transcripts and proof of tuition payment as the mandatory documents and does not mention APS.",
          "Rules can change. Before you apply for the visa, read the embassy's current student-visa page and ask in the community if you see something different.",
        ],
        links: [{ label: "German Embassy Islamabad: study visa", url: "https://pakistan.diplo.de/pk-en/service/2-study-visa-seite-1676104" }],
      },
      {
        q: "How many programmes should I apply to?",
        a: [
          "Most students apply to 5 to 8. Mix a few selective programmes with several that have no grade cut-off and no GRE. Keep the uni-assist fees in mind: 75 EUR for the first and 30 EUR for each additional programme per semester.",
          "Use the shortlist on this site to keep track: save programmes, then update each one as you apply, as uni-assist processes it and as results come.",
        ],
        links: [{ label: "My shortlist", url: "/shortlist/" }],
      },
    ],
  },
  {
    id: "money",
    title: "Money",
    blurb: "Blocked account, insurance, monthly costs.",
    items: [
      {
        q: "How much money do I need in the blocked account?",
        a: [
          "For the student visa you must prove 992 EUR per month, which is 11,904 EUR for the first year (figure valid since 1 January 2025 and still used in 2026). The money goes into a blocked account (Sperrkonto) with a provider such as Expatrio, Fintiba or Coracle, and is released to you at 992 EUR per month after you arrive.",
          "Opening the account costs roughly 70 to 150 EUR depending on the provider. A scholarship letter or a formal sponsor declaration (Verpflichtungserklärung) can replace the blocked account in some cases. The embassy decides, so confirm the current amount on the embassy's page before you transfer money.",
        ],
        links: [
          { label: "DAAD: finances and the blocked account", url: "https://www.daad.de/en/studying-in-germany/living-in-germany/finances/" },
          { label: "German Embassy Islamabad: study visa", url: "https://pakistan.diplo.de/pk-en/service/2-study-visa-seite-1676104" },
        ],
      },
      {
        q: "What does a month in Germany cost?",
        a: [
          "Roughly 850 to 1,100 EUR in most cities, more in Munich, Frankfurt, Hamburg and Stuttgart. The biggest item is rent: a room in a student hall is often 250 to 400 EUR, a private room 400 to 700 EUR. Public health insurance for students is about 140 to 150 EUR per month in 2026 (TK, AOK, Barmer are all similar). Food 200 to 300 EUR, phone and internet 20 to 40 EUR.",
          "The semester contribution of 70 to 430 EUR is paid once per semester and usually includes a public-transport ticket, which saves a lot.",
        ],
        links: [{ label: "DAAD: cost of living", url: "https://www.daad.de/en/studying-in-germany/living-in-germany/finances/" }],
      },
      {
        q: "Can I work while studying?",
        a: [
          "Yes. Non-EU students may work 140 full days or 280 half days per calendar year (a half day is up to 4 hours), a rule in force since 1 March 2024. Student-assistant jobs at your university are usually allowed on top, compulsory internships do not count, and self-employment is not allowed.",
          "Typical student jobs pay around the minimum wage. It helps with living costs but will not cover them fully, so do not plan your budget around a job you do not have yet.",
        ],
        links: [{ label: "Make it in Germany: study and work", url: "https://www.make-it-in-germany.com/en/study-training/study/study-and-work/" }],
      },
      {
        q: "Are there scholarships?",
        a: [
          "Few for a first Master's, and almost none that cover the blocked account before you arrive. DAAD scholarships target specific programmes (for example development-related Master's) and have their own deadlines, often a year ahead. Deutschlandstipendium (300 EUR per month) is applied for after enrolment at your university. Some universities have small funds for international students.",
          "Treat scholarships as a bonus, not the plan. Apply to no-tuition programmes and budget for the blocked account.",
        ],
        links: [{ label: "DAAD scholarship database", url: "https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/" }],
      },
    ],
  },
  {
    id: "visa",
    title: "Visa and arrival",
    blurb: "The Islamabad process and the first weeks in Germany.",
    items: [
      {
        q: "How does the student visa work from Pakistan?",
        a: [
          "You apply through the Federal Foreign Office's Consular Services Portal: register, fill in the questionnaire, upload your documents (admission letter, degree certificates and transcripts, blocked-account confirmation, health insurance, passport, photos), and a visa officer checks them before you get an appointment at the German Embassy Islamabad or the Consulate General Karachi. Islamabad handles Islamabad, Punjab, KPK, GB and AJK; Karachi handles Sindh and Balochistan.",
          "Processing after the appointment is often several weeks, and appointment waiting times have been long in recent years. Apply the day you have your admission letter and blocked account, do not wait.",
        ],
        links: [
          { label: "German Embassy Islamabad: study visa", url: "https://pakistan.diplo.de/pk-en/service/2-study-visa-seite-1676104" },
          { label: "Consular Services Portal", url: "https://digital.diplo.de/studium" },
        ],
      },
      {
        q: "What should I do in the first two weeks after landing?",
        a: [
          "Register your address at the city office (Anmeldung) within two weeks, activate your blocked account and open a normal bank account, enrol at the university and pay the semester contribution, get your health insurance confirmation to the university, and apply for the residence permit at the foreigners office (Ausländerbehörde) before your visa expires.",
          "Housing is the hardest part. Apply for a student-hall room through the Studierendenwerk the day you get admission, and ask in the PGNX community for city-specific tips.",
        ],
      },
      {
        q: "What happens after graduation?",
        a: [
          "After finishing your degree you can apply for a residence permit of up to 18 months to look for a job that matches your qualification. Once you have a job offer you switch to a work permit or the EU Blue Card. German at B1 or better makes the job search much easier, even in English-speaking companies.",
        ],
        links: [{ label: "Make it in Germany: after your studies", url: "https://www.make-it-in-germany.com/en/study-training/study/study-and-work/" }],
      },
    ],
  },
  {
    id: "site",
    title: "About this site",
    blurb: "Where the data comes from and how to use it.",
    items: [
      {
        q: "Where does the programme data come from?",
        a: [
          "Most programmes come from the DAAD International Programmes database, which universities fill in themselves. Programmes that DAAD does not list were added from the universities' own websites. Every programme page shows its source and the date it was collected.",
          "Deadlines, fees and requirements change every year. Always confirm on the official programme page before you apply, and tell us through the feedback form if something is wrong.",
        ],
        links: [{ label: "About this site", url: "/about/" }],
      },
      {
        q: "Why is the deadline shown different from the university's website?",
        a: [
          "We show the non-EU deadline because that is what applies to Pakistani applicants; universities often publish a later EU deadline more prominently. Dates without a year are assumed to repeat every year. If the university has changed its date, the official page wins, and we would be grateful for a report.",
        ],
        links: [{ label: "Report wrong information", url: "https://docs.google.com/forms/d/e/1FAIpQLSep-hVMvtX_sVAovdWw9mKk7YUAiZsAKrW3oBdDd-GyJEs3UQ/viewform" }],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  COMPANY PROFILE — the single source of truth for all business content.
//
//  Rebranding the template means editing THIS file only: name, phone, services,
//  service area, plan pricing, reviews, FAQ. No component or route hardcodes
//  company-specific data.
// ─────────────────────────────────────────────────────────────────────────────

export type PlanKey = "inspection" | "deposit" | "storm";

export interface Service {
  id: string;
  name: string;
  tagline: string;
  description: string;
  includes: string[];
  priceLabel: string;
  image: string;
  badge?: string;
}

export interface Plan {
  key: PlanKey;
  slug: string; // URL slug used in /checkout/[planId]
  name: string;
  priceUsd: number;
  cadence: "one-time" | "deposit" | "flat-rate";
  tagline: string;
  description: string;
  includes: string[];
  /** Deposit plan stores the card on file for the final balance invoice. */
  saveCard: boolean;
  /** Env var holding the live Whop plan_ id for this plan. */
  envPlanId: string;
  badge?: string;
  featured?: boolean;
}

export interface Review {
  name: string;
  area: string;
  stars: number;
  text: string;
  project: string;
  when: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const company = {
  name: "Summit Ridge Roofing",
  legalName: "Summit Ridge Roofing Co.",
  shortName: "Summit Ridge",
  tagline: "Central Texas tear-offs, repairs & storm response",
  phone: "(512) 555-0147",
  phoneHref: "tel:+15125550147",
  emergencyPhone: "(512) 555-0199",
  email: "quotes@summitridgeroofing.com",
  hours: "Mon–Sat 7am–7pm",
  license: "TX RCL #2847-B · Licensed & Bonded",
  address: "4410 S. Lamar Blvd, Suite 210, Austin, TX 78745",
  founded: 2011,
  serviceRegion: "Central Texas",
  hero: {
    overline: "Austin & Central Texas · Licensed, bonded & insured",
    titleA: "A roof that",
    titleB: "outlives the storm.",
    sub: "Flat, written prices. 25-year workmanship warranty. Monthly financing through Whop — pay with a card, Apple Pay, Google Pay, Klarna, Splitit or Afterpay.",
    image: "/images/hero-roof.jpg",
  },
  stats: [
    { value: 14, suffix: " yrs", label: "in business", prefix: "", decimals: 0 },
    { value: 3847, suffix: "", label: "roofs completed", prefix: "", decimals: 0 },
    { value: 4.9, suffix: "★", label: "412 Google reviews", prefix: "", decimals: 1 },
    { value: 5, prefix: "$", suffix: "M", label: "liability coverage", decimals: 0 },
  ],
  trustTicker: [
    "GAF Master Elite®",
    "Owens Corning Platinum Preferred",
    "BBB A+ Rated",
    "25-Year Workmanship Warranty",
    "Licensed & Bonded · TX RCL #2847-B",
    "24/7 Storm Response",
    "Local Crews — No Subbed Labor",
    "Financing from $0 down",
  ],
  services: [
    {
      id: "storm-repair",
      name: "Repair & Restore",
      tagline: "Leaks, missing shingles, wind & hail damage",
      description:
        "Same-week repairs with matching materials, leak tracing and a written 2-year repair warranty. If your roof has more than 8 problem areas, we'll tell you honestly when replacement is the cheaper fix long-term.",
      includes: [
        "21-point repair plan in writing",
        "Infrared leak tracing & moisture scan",
        "Architectural shingle matching",
        "Flashing, sealant & drip-edge repair",
        "2-year workmanship warranty",
      ],
      priceLabel: "from $495",
      image: "/images/service-repair.jpg",
      badge: "Same-week slots",
    },
    {
      id: "roof-replacement",
      name: "Roof Replacement",
      tagline: "Full tear-off in 2–3 days, priced flat up front",
      description:
        "One price in writing before we lift a shingle. Class 4 impact-rated shingles, ice & water shield on every valley, and a 25-year workmanship warranty backed by the shingle manufacturer's warranty.",
      includes: [
        "Full tear-off & haul-away (up to 3 layers)",
        "GAF Class 4 shingles, your color",
        "Ice & water shield in valleys & eaves",
        "New drip edge, flashing & underlayment",
        "25-year workmanship warranty",
      ],
      priceLabel: "from $9,800 · financed from $289/mo",
      image: "/images/service-replacement.jpg",
      badge: "Most popular",
    },
    {
      id: "roof-inspection",
      name: "Complete Inspection",
      tagline: "Know exactly what your roof needs — in writing",
      description:
        "A 21-point inspection with infrared moisture scanning, a photo-documented report and a prioritized repair list. Book it online in two minutes — and the $149 is credited toward any replacement you book with us.",
      includes: [
        "21-point roof condition report",
        "Infrared thermal moisture scan",
        "Photo documentation of every finding",
        "Prioritized repair list with pricing",
        "Credited toward a full replacement",
      ],
      priceLabel: "$149 · one-time",
      image: "/images/service-inspection.jpg",
      badge: "Book online in 2 min",
    },
  ] as Service[],
  plans: [
    {
      key: "inspection",
      slug: "roof-inspection-149",
      name: "Complete Roof Inspection",
      priceUsd: 149,
      cadence: "one-time",
      tagline: "21-point report, thermal scan & photo documentation",
      description:
        "Pay online with card, Apple Pay, Google Pay, Klarna, Splitit or Afterpay. Your inspection is scheduled within the week and the report lands in your inbox within 48 hours. The fee is credited toward any replacement you book.",
      includes: [
        "21-point condition report in writing",
        "Infrared thermal moisture scan",
        "Photo documentation of every finding",
        "Scheduled within 7 days",
        "$149 credited toward a replacement",
      ],
      saveCard: false,
      envPlanId: "WHOP_PLAN_ID_INSPECTION",
      badge: "Most popular starter",
    },
    {
      key: "deposit",
      slug: "project-deposit-500",
      name: "Project Deposit",
      priceUsd: 500,
      cadence: "deposit",
      tagline: "Locks your written price and start date",
      description:
        "Once you approve your quote, the $500 deposit locks the price, materials and start date. Your card is stored securely through Whop so the final balance can be billed the day your roof passes city inspection — or you can pay it by link instead.",
      includes: [
        "Written price locked for 180 days",
        "Materials ordered, start date locked",
        "Card on file — final balance billed at completion",
        "100% applied to your project total",
        "Cancel before tear-off for a full refund",
      ],
      saveCard: true,
      envPlanId: "WHOP_PLAN_ID_DEPOSIT",
      badge: "Locks price + date",
      featured: true,
    },
    {
      key: "storm",
      slug: "storm-response-1250",
      name: "Storm Response · Tarp & Temp Shingle",
      priceUsd: 1250,
      cadence: "flat-rate",
      tagline: "One flat price, 24/7 — no hourly surprises",
      description:
        "A crew on your roof in under 90 minutes, day or night: professional tarp or temp shingle, photo documentation for your insurance claim, and a same-week permanent repair plan at a flat rate.",
      includes: [
        "Crew on site in under 90 minutes, 24/7",
        "Professional tarp / temp shingle install",
        "Insurance-claim photo documentation",
        "Permanent repair plan within the week",
        "Flat rate — billed once, no hourly billing",
      ],
      saveCard: false,
      envPlanId: "WHOP_PLAN_ID_STORM",
    },
  ] as Plan[],
  process: [
    {
      step: "01",
      title: "Book your inspection",
      body: "Pay the $149 inspection fee online — card, Apple Pay, Google Pay or financing. Your slot is confirmed the moment Whop confirms the payment.",
      meta: "$149 · online in 2 min",
    },
    {
      step: "02",
      title: "Approve & put it down",
      body: "Walk the report with a project manager. Approve the written quote, then the $500 deposit locks your price and date. Your card is stored on file with Whop for the final balance.",
      meta: "$500 deposit · 100% credited",
    },
    {
      step: "03",
      title: "We tear off & build",
      body: "Two to three days on a standard replacement. Daily photo texts at install, cleanup and haul-away, and a neighborhood notice we tape to your door the day before.",
      meta: "2–3 days · daily photo updates",
    },
    {
      step: "04",
      title: "Final invoice, one tap away",
      body: "The day your roof passes city inspection, Whop charges the stored card for the final balance — or emails you a secure link if you'd rather pay manually. Your warranty activates the same day.",
      meta: "Billed at completion · card on file or link",
    },
  ],
  serviceArea: {
    intro:
      "Our crews are based in Austin and cover the core Central Texas suburbs with same-week availability. Outside the core area? Call — if we're a drive away, we'll tell you the honest answer.",
    coreCities: ["Austin", "Cedar Park", "Round Rock", "Pflugerville"],
    cities: [
      "Austin", "Cedar Park", "Round Rock", "Pflugerville", "Leander",
      "Georgetown", "Kyle", "Buda", "Dripping Springs", "San Marcos",
      "Elgin", "Bastrop",
    ],
    note: "Serving a 40-mile radius from our South Austin shop · call to confirm ZIP coverage",
  },
  financing: {
    intro:
      "Every quote is financed at checkout, powered by Whop. Approved buyers pick a plan in the same checkout — no separate application, no waiting on a loan officer.",
    providers: ["Klarna", "Splitit", "Afterpay"],
    headline: "From $0 down, monthly payments up to 60 months",
    body: "Whop surfaces Klarna, Splitit, Afterpay and 100+ other payment methods automatically at checkout — you never see a single credit score form. Financing options appear for approved merchants and qualified buyers.",
    exampleTotal: 14000,
    exampleLabel: "Typical 2,200 sq ft replacement",
    plans: [
      { months: 6, monthly: 2450, note: "No interest" },
      { months: 12, monthly: 1275, note: "No interest" },
      { months: 24, monthly: 665, note: "" },
      { months: 60, monthly: 289, note: "Lowest payment" },
    ],
    bullets: [
      "Decision in about 60 seconds, right in checkout",
      "$0 down available on approved 12-month plans",
      "No impact on your credit for a quote",
      "Refunds and adjustments flow back to the same plan",
    ],
  },
  reviews: [
    {
      name: "Marcus T.",
      area: "Cedar Park",
      stars: 5,
      text: "Tear-off and new roof in two days flat. The price we signed for is the price we paid — the $500 deposit came straight off the total and the final balance hit the card we saved at checkout. Zero chasing, zero surprises.",
      project: "Full replacement · 2,400 sq ft",
      when: "Last month",
    },
    {
      name: "Dana W.",
      area: "Round Rock",
      stars: 5,
      text: "The $149 inspection was the smartest money we've spent. Thermal scan found a moisture issue two other companies missed, and the report had photos of everything. We only did the repair — they didn't try to sell us a new roof.",
      project: "Inspection + repair",
      when: "2 months ago",
    },
    {
      name: "Priya & Sam K.",
      area: "Austin · Hyde Park",
      stars: 5,
      text: "We paid our $14,000 replacement in 24 monthly installments through Klarna — it just appeared at checkout. Nobody from a loan company ever called. The crew was in and out before the kids got home from school.",
      project: "Full replacement · financed",
      when: "3 months ago",
    },
    {
      name: "Bill H.",
      area: "Kyle",
      stars: 5,
      text: "Hail took out half the street. Their storm crew tarped our roof the same night — flat $1,250, paid with Apple Pay on the way home, and the photos they sent made the insurance claim basically painless.",
      project: "24/7 storm response",
      when: "Last spring",
    },
    {
      name: "Angela R.",
      area: "Pflugerville",
      stars: 5,
      text: "They told us our 2016 roof had five more good years and we should just budget — and then did a small valley repair instead of upselling. That's why when the replacement time comes, we're calling them first.",
      project: "Valley & flashing repair",
      when: "5 months ago",
    },
  ] as Review[],
  reviewSummary: { rating: 4.9, count: 412, source: "Google" },
  faq: [
    {
      q: "How do I know if I need repair or a full replacement?",
      a: "The $149 inspection answers this with data, not opinions: 21-point condition report, infrared moisture scan and photos. Rule of thumb we use on every report — more than about 8% of the roof surface damaged, or active moisture in the deck, and replacement is usually the cheaper decision over 10 years. We write that math in your report either way.",
    },
    {
      q: "How does financing actually work at checkout?",
      a: "When you pay online through Whop, the checkout automatically shows you the financing rails we've enabled — currently Klarna, Splitit and Afterpay — for approved buyers. You pick a plan in the same screen you'd enter a card number. There's no separate loan application and no credit impact from getting a quote. On a typical $14,000 replacement, plans start around $289/month over 60 months.",
    },
    {
      q: "What is the $500 deposit for, and when is the rest charged?",
      a: "The deposit locks your written price for 180 days, reserves your crew and starts the material order. At deposit checkout you agree to store your card on file through Whop (card-on-file via a setup intent). The final balance is invoiced the day your roof passes city inspection — Whop charges the stored card automatically, or emails you a secure link if you'd rather pay manually. The full $500 is credited against your total.",
    },
    {
      q: "Do you handle insurance claims?",
      a: "Yes. Storm Response includes claim-ready photo documentation, and our project managers work directly with adjusters on hail and wind claims. You'll never be asked to pay your deductible to start — the deductible is settled at completion, the same way the final balance is billed.",
    },
    {
      q: "How long does a full replacement take?",
      a: "Two to three days for a standard single-family tear-off, weather permitting. Tear-off in the morning, underlayment and shingles in, cleanup done by the end of day three. You get photo updates at every stage and the city inspection is booked before we start.",
    },
    {
      q: "What warranties do I actually get?",
      a: "Two layers: our 25-year workmanship warranty on labor (materials handling, fastening, flashing, cleanup), plus the shingle manufacturer's own warranty — up to 50 years on Class 4 architectural shingles. Both are registered in your name before we leave the property.",
    },
  ] as FaqItem[],
  footer: {
    blurb:
      "A fourth-generation Central Texas roofing company. Every job is run by our own crews, priced flat in writing, and backed by a 25-year workmanship warranty.",
  },
};

export type Company = typeof company;

export function planBySlug(slug: string): Plan | undefined {
  return company.plans.find((p) => p.slug === slug);
}

export function planByKey(key: PlanKey): Plan {
  return company.plans.find((p) => p.key === key)!;
}

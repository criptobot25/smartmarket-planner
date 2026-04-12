import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingNav } from "../components/MarketingNav";
import { absoluteUrl, getLanguageAlternates } from "../lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description: "Answers to the most common questions about NutriPilot — nutrition plans, macros, grocery lists, meal prep, and account management.",
  alternates: {
    canonical: "/faq",
    languages: getLanguageAlternates("/faq"),
  },
  openGraph: {
    type: "website",
    title: "FAQ | NutriPilot",
    description: "Everything you need to know about NutriPilot: how it works, what's included, and how to get the most out of your nutrition plan.",
    url: "/faq",
  },
};

const faqs = [
  {
    question: "What is NutriPilot?",
    answer:
      "NutriPilot is a nutrition planning tool that builds personalized weekly meal plans, practical grocery lists, and meal prep guidance based on your fitness goal — whether you're cutting fat, building muscle, or maintaining your current weight.",
  },
  {
    question: "How does NutriPilot generate my nutrition plan?",
    answer:
      "You enter your goal (cutting, bulking, or maintenance), your calorie target, and any dietary preferences. NutriPilot then calculates your macro breakdown and builds a full week of meals, a categorized grocery list, and prep instructions — all in seconds.",
  },
  {
    question: "Do I need to create an account to use NutriPilot?",
    answer:
      "No. You can generate a complete nutrition plan without signing up. Creating an account lets you save your plan history, access your last three plans, and unlock premium features.",
  },
  {
    question: "What is the difference between the Free and Pro plans?",
    answer:
      "The Free plan gives you full access to plan generation, grocery lists, and basic meal prep guides. Pro adds plan history across sessions, PDF export, advanced customization, and priority support.",
  },
  {
    question: "Can I adjust my macros manually?",
    answer:
      "Yes. After your plan is generated you can adjust your calorie target and macro split before saving or exporting. The grocery list and prep guide update automatically.",
  },
  {
    question: "Does NutriPilot support vegetarian or vegan diets?",
    answer:
      "Yes. You can select a plant-based preference when generating your plan. NutriPilot will replace animal proteins with equivalent plant-based sources and keep the macro targets on track.",
  },
  {
    question: "How accurate are the calorie and macro numbers?",
    answer:
      "NutriPilot uses established nutritional databases and evidence-based macro targets. The numbers are a reliable starting point. Individual results depend on factors like food brand, cooking method, and personal metabolism — we recommend adjusting based on your progress every 2–3 weeks.",
  },
  {
    question: "Can I use NutriPilot for bulking?",
    answer:
      "Absolutely. Select the Bulking goal and enter your target calorie surplus. NutriPilot will set a higher protein and carb allocation and suggest calorie-dense, budget-friendly foods that support muscle gain.",
  },
  {
    question: "How do I export my meal plan?",
    answer:
      "Pro users can export their full plan — including the grocery list and prep guide — as a PDF. The export button appears at the top of your active plan. Free users can print the page directly from their browser.",
  },
  {
    question: "Is NutriPilot available in Portuguese?",
    answer:
      "Yes. NutriPilot supports both English (en-US) and Brazilian Portuguese (pt-BR). Switch languages using the selector in the top navigation bar. Your language preference is saved for future visits.",
  },
  {
    question: "How do I cancel my Pro subscription?",
    answer:
      "You can cancel at any time from your account settings under Subscription. Your Pro features remain active until the end of the current billing period. There are no cancellation fees.",
  },
  {
    question: "Where can I find nutrition guides and articles?",
    answer:
      "The NutriPilot Blog has over 200 evidence-based articles on meal prep, macro tracking, grocery shopping, and goal-specific nutrition. You can browse by topic using the tag pages or search directly.",
  },
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "NutriPilot FAQ",
    description: "Frequently asked questions about NutriPilot nutrition planning.",
    url: absoluteUrl("/faq"),
    isPartOf: {
      "@type": "WebSite",
      name: "NutriPilot",
      url: absoluteUrl("/"),
    },
  };

  return (
    <div className="np-shell">
      <MarketingNav />

      <main className="np-main np-main-narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "FAQ" },
          ]}
          currentPath="/faq"
        />

        <section className="np-page-header">
          <h1>Frequently Asked Questions</h1>
          <p className="np-page-subtitle">
            Everything you need to know about NutriPilot. Can&apos;t find your answer?{" "}
            <Link href="/contact">Contact us</Link>.
          </p>
        </section>

        <section aria-label="FAQ list">
          {faqs.map(({ question, answer }) => (
            <article key={question} className="np-card faq-item">
              <h2 className="faq-question">{question}</h2>
              <p className="faq-answer">{answer}</p>
            </article>
          ))}
        </section>

        <section className="np-card np-page-actions">
          <p>Still have questions?</p>
          <div className="np-actions">
            <Link href="/contact" className="np-btn np-btn-secondary">Contact us</Link>
            <Link href="/app" className="np-btn np-btn-primary">Try NutriPilot free</Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

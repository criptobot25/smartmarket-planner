import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingNav } from "../components/MarketingNav";
import { absoluteUrl, getLanguageAlternates } from "../lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About NutriPilot",
  description: "NutriPilot was built to make evidence-based nutrition planning accessible to everyone — without expensive coaches or complicated spreadsheets.",
  alternates: {
    canonical: "/about",
    languages: getLanguageAlternates("/about"),
  },
  openGraph: {
    type: "website",
    title: "About NutriPilot",
    description: "The story behind NutriPilot and why we built it.",
    url: "/about",
  },
};

export default function AboutPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NutriPilot",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo-nutripilot.svg"),
    description: "NutriPilot builds personalized weekly nutrition plans, grocery lists, and meal prep guides for people with fitness goals.",
    foundingDate: "2024",
    knowsAbout: ["Nutrition Planning", "Meal Prep", "Macro Tracking", "Grocery Optimization"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: absoluteUrl("/contact"),
      availableLanguage: ["English", "Portuguese"],
    },
  };

  return (
    <div className="np-shell">
      <MarketingNav />

      <main className="np-main np-main-narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "About" },
          ]}
          currentPath="/about"
        />

        <section className="np-page-header">
          <h1>About NutriPilot</h1>
          <p className="np-page-subtitle">
            Practical nutrition planning for people who want results without the complexity.
          </p>
        </section>

        <article className="np-card">
          <h2>Why we built NutriPilot</h2>
          <p>
            Most people who want to eat better know what they should do in theory. The problem is execution —
            figuring out exactly what to eat, how much, and what to buy at the supermarket without overspending or
            letting food go to waste.
          </p>
          <p>
            Nutrition coaches solve this, but cost €100–300 per month. Spreadsheets work, but take hours to set up
            and fall apart the moment your schedule changes. Apps exist, but most are built for obsessive calorie
            counters, not regular people trying to hit a goal.
          </p>
          <p>
            NutriPilot was built to close that gap: a tool that does the planning work for you in seconds, gives you
            a grocery list you can actually use, and adapts to your goal — whether you&apos;re cutting fat, building
            muscle, or just trying to eat consistently.
          </p>
        </article>

        <article className="np-card">
          <h2>How it works</h2>
          <p>
            You tell NutriPilot your goal and calorie target. We calculate your macros, build a full week of
            balanced meals, generate a categorized grocery list optimized for your budget, and give you a prep guide
            so Sunday cooking takes under two hours.
          </p>
          <p>
            Every plan is backed by evidence-based nutrition principles — not trend diets. We do not sell
            supplements, push branded products, or lock you into a subscription to use the core tool.
          </p>
        </article>

        <article className="np-card">
          <h2>Our commitment</h2>
          <ul className="np-list">
            <li>Evidence-based recommendations, not fads</li>
            <li>No hidden upsells inside the planning tool</li>
            <li>Data you own — export your plan anytime</li>
            <li>Accessible in English and Brazilian Portuguese</li>
            <li>Free tier that genuinely works for most users</li>
          </ul>
        </article>

        <section className="np-card np-page-actions">
          <div className="np-actions">
            <Link href="/app" className="np-btn np-btn-primary">Build your plan</Link>
            <Link href="/blog" className="np-btn np-btn-secondary">Read the blog</Link>
            <Link href="/contact" className="np-btn np-btn-secondary">Get in touch</Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingNav } from "../components/MarketingNav";
import { absoluteUrl, getLanguageAlternates } from "../lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the NutriPilot team. We're here to help with questions about your nutrition plan, account, or partnership inquiries.",
  alternates: {
    canonical: "/contact",
    languages: getLanguageAlternates("/contact"),
  },
  openGraph: {
    type: "website",
    title: "Contact NutriPilot",
    description: "Reach out with questions, feedback, or partnership inquiries.",
    url: "/contact",
  },
};

export default function ContactPage() {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact NutriPilot",
    url: absoluteUrl("/contact"),
    description: "Contact the NutriPilot team for support, feedback, or partnership inquiries.",
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />

        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Contact" },
          ]}
          currentPath="/contact"
        />

        <section className="np-page-header">
          <h1>Contact</h1>
          <p className="np-page-subtitle">
            We read every message and reply within 1–2 business days.
          </p>
        </section>

        <section className="np-card">
          <h2>Support</h2>
          <p>
            For questions about your nutrition plan, account, billing, or anything else related to using NutriPilot,
            email us at{" "}
            <a href="mailto:support@nutripilot.app">support@nutripilot.app</a>.
          </p>
          <p className="np-inline-note">
            Before reaching out, check the <Link href="/faq">FAQ</Link> — most common questions are answered there.
          </p>
        </section>

        <section className="np-card">
          <h2>Feedback &amp; feature requests</h2>
          <p>
            We actively use feedback to decide what to build next. If something is not working the way you expect,
            or you have an idea for a feature, email{" "}
            <a href="mailto:feedback@nutripilot.app">feedback@nutripilot.app</a>.
          </p>
        </section>

        <section className="np-card">
          <h2>Partnerships &amp; press</h2>
          <p>
            For partnerships, affiliate inquiries, or press requests, email{" "}
            <a href="mailto:hello@nutripilot.app">hello@nutripilot.app</a>.
          </p>
        </section>

        <section className="np-card">
          <h2>Response times</h2>
          <ul className="np-list">
            <li>Support: 1–2 business days</li>
            <li>Billing issues: same or next business day</li>
            <li>Partnerships: 3–5 business days</li>
          </ul>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

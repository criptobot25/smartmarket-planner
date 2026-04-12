import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingNav } from "../components/MarketingNav";
import { absoluteUrl, getLanguageAlternates } from "../lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how NutriPilot collects, uses, and protects your personal data. We are committed to your privacy and GDPR compliance.",
  alternates: {
    canonical: "/privacy",
    languages: getLanguageAlternates("/privacy"),
  },
  openGraph: {
    type: "website",
    title: "Privacy Policy | NutriPilot",
    description: "How NutriPilot handles your data.",
    url: "/privacy",
  },
  robots: {
    index: true,
    follow: false,
  },
};

const LAST_UPDATED = "January 1, 2025";

export default function PrivacyPage() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "NutriPilot Privacy Policy",
    url: absoluteUrl("/privacy"),
    dateModified: "2025-01-01",
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy Policy" },
          ]}
          currentPath="/privacy"
        />

        <section className="np-page-header">
          <h1>Privacy Policy</h1>
          <p className="np-page-subtitle">Last updated: {LAST_UPDATED}</p>
        </section>

        <article className="np-card blog-content">
          <h2>1. Who we are</h2>
          <p>
            NutriPilot (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the website nutripilot.app and the
            NutriPilot nutrition planning application. This policy explains how we collect, use, and protect your
            personal data when you use our services.
          </p>

          <h2>2. Data we collect</h2>
          <p>We collect only what we need to provide the service:</p>
          <ul>
            <li><strong>Account data</strong> — email address and password hash when you create an account.</li>
            <li><strong>Plan data</strong> — your nutrition goals, calorie targets, and dietary preferences that you enter to generate plans.</li>
            <li><strong>Usage data</strong> — anonymized analytics (pages visited, features used) via Vercel Analytics. No personal identifiers are stored.</li>
            <li><strong>Payment data</strong> — billing information for Pro subscribers is processed by Stripe. We never store card numbers.</li>
          </ul>

          <h2>3. How we use your data</h2>
          <ul>
            <li>To generate and save your nutrition plans</li>
            <li>To send transactional emails (account confirmation, password reset)</li>
            <li>To improve the product based on anonymized usage patterns</li>
            <li>To process payments for Pro subscriptions</li>
          </ul>
          <p>We do not sell your data. We do not use your data to train AI models.</p>

          <h2>4. Data storage and security</h2>
          <p>
            Your data is stored in encrypted databases hosted in the European Union. We use industry-standard
            security practices including HTTPS, hashed passwords, and access controls. Plan data you enter
            without an account is stored only in your browser&apos;s local storage and never sent to our servers.
          </p>

          <h2>5. Your rights (GDPR)</h2>
          <p>If you are in the EU or UK, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li>Export your data in a portable format</li>
            <li>Object to processing or withdraw consent at any time</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href="mailto:privacy@nutripilot.app">privacy@nutripilot.app</a>.
          </p>

          <h2>6. Cookies</h2>
          <p>
            We use a single session cookie for authentication. We do not use advertising cookies or third-party
            tracking cookies. Analytics are cookieless.
          </p>

          <h2>7. Third-party services</h2>
          <ul>
            <li><strong>Vercel</strong> — hosting and anonymized analytics</li>
            <li><strong>Stripe</strong> — payment processing for Pro subscriptions</li>
          </ul>
          <p>Each service operates under its own privacy policy and GDPR-compliant data processing agreements.</p>

          <h2>8. Data retention</h2>
          <p>
            Account data is retained as long as your account is active. If you delete your account, all personal
            data is removed within 30 days. Anonymized analytics data has no retention limit.
          </p>

          <h2>9. Changes to this policy</h2>
          <p>
            We will notify registered users by email of any material changes to this policy at least 14 days
            before they take effect.
          </p>

          <h2>10. Contact</h2>
          <p>
            For privacy questions or data requests, email{" "}
            <a href="mailto:privacy@nutripilot.app">privacy@nutripilot.app</a> or visit our{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}

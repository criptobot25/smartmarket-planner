import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { MarketingFooter } from "../components/MarketingFooter";
import { MarketingNav } from "../components/MarketingNav";
import { absoluteUrl, getLanguageAlternates } from "../lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the NutriPilot Terms of Service. By using NutriPilot, you agree to these terms covering acceptable use, subscriptions, and content.",
  alternates: {
    canonical: "/terms",
    languages: getLanguageAlternates("/terms"),
  },
  openGraph: {
    type: "website",
    title: "Terms of Service | NutriPilot",
    description: "NutriPilot terms of service and acceptable use policy.",
    url: "/terms",
  },
  robots: {
    index: true,
    follow: false,
  },
};

const LAST_UPDATED = "January 1, 2025";

export default function TermsPage() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "NutriPilot Terms of Service",
    url: absoluteUrl("/terms"),
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
            { label: "Terms of Service" },
          ]}
          currentPath="/terms"
        />

        <section className="np-page-header">
          <h1>Terms of Service</h1>
          <p className="np-page-subtitle">Last updated: {LAST_UPDATED}</p>
        </section>

        <article className="np-card blog-content">
          <h2>1. Acceptance of terms</h2>
          <p>
            By accessing or using NutriPilot (&quot;the Service&quot;), you agree to be bound by these Terms of
            Service. If you do not agree, do not use the Service.
          </p>

          <h2>2. Description of service</h2>
          <p>
            NutriPilot provides nutrition planning tools including personalized meal plans, grocery lists, and meal
            prep guides. The Service is available in Free and Pro tiers as described on the{" "}
            <Link href="/pricing">pricing page</Link>.
          </p>

          <h2>3. Accounts</h2>
          <p>
            You are responsible for maintaining the security of your account credentials. You must notify us
            immediately at <a href="mailto:support@nutripilot.app">support@nutripilot.app</a> if you suspect
            unauthorized access. We are not liable for loss or damage arising from unauthorized account access.
          </p>

          <h2>4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to reverse-engineer, scrape, or copy the Service at scale</li>
            <li>Share your account credentials with others</li>
            <li>Upload content that violates third-party rights</li>
            <li>Interfere with the operation of the Service</li>
          </ul>

          <h2>5. Pro subscriptions</h2>
          <p>
            Pro subscriptions are billed monthly or annually as selected at checkout. Subscriptions renew
            automatically until cancelled. You may cancel at any time from your account settings. No refunds are
            provided for partial billing periods, except where required by applicable law.
          </p>

          <h2>6. Health disclaimer</h2>
          <p>
            NutriPilot provides general nutrition information for educational purposes only. The content is not
            medical advice and does not replace consultation with a qualified healthcare professional. Always consult
            a doctor or registered dietitian before making significant changes to your diet, especially if you have
            a medical condition.
          </p>

          <h2>7. Intellectual property</h2>
          <p>
            All content, software, and design elements of NutriPilot are owned by or licensed to us. You may not
            reproduce, distribute, or create derivative works without our express written permission. Blog articles
            may be quoted with attribution and a link back to the original page.
          </p>

          <h2>8. Your content</h2>
          <p>
            You retain ownership of any data you input into the Service. By using the Service, you grant us a
            limited license to process that data solely to provide and improve the Service. We do not use your data
            to train AI models or share it with third parties for marketing.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, NutriPilot is not liable for indirect, incidental, or
            consequential damages arising from your use of the Service. Our total liability for any claim is limited
            to the amount you paid us in the 12 months preceding the claim.
          </p>

          <h2>10. Changes to terms</h2>
          <p>
            We may update these terms at any time. For material changes, we will notify registered users by email
            at least 14 days before the new terms take effect. Continued use after that date constitutes acceptance.
          </p>

          <h2>11. Governing law</h2>
          <p>
            These terms are governed by the laws of Portugal. Any disputes will be resolved in the courts of
            Lisbon, Portugal, unless mandatory local consumer protection laws in your country require otherwise.
          </p>

          <h2>12. Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href="mailto:legal@nutripilot.app">legal@nutripilot.app</a> or visit our{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { MarketingNav } from "./components/MarketingNav";
import { trackEvent, useScrollDepthTracking } from "./lib/analytics";
import { useAppTranslation } from "./lib/i18n";

const LandingPreviewSection = dynamic(
  () => import("./components/LandingPreviewSection").then((module) => module.LandingPreviewSection),
  {
    ssr: false,
    loading: () => <section className="mockup-section" aria-hidden="true" />,
  },
);

const previewCards = [
  { titleKey: "landingV2.preview1", imageSrc: "/previews/preview-1.png", width: 1200, height: 700 },
  { titleKey: "landingV2.preview2", imageSrc: "/previews/preview-2.png", width: 1200, height: 700 },
  { titleKey: "landingV2.preview3", imageSrc: "/previews/preview-3.png", width: 1200, height: 700 },
];

const trustPills = [
  "landingV2.sales.trust1",
  "landingV2.sales.trust2",
  "landingV2.sales.trust3",
  "landingV2.sales.trust4",
];

const goalCopyCards = [
  {
    goal: "landingV2.sales.goalCuttingTitle",
    promise: "landingV2.sales.goalCuttingBody",
  },
  {
    goal: "landingV2.sales.goalMaintenanceTitle",
    promise: "landingV2.sales.goalMaintenanceBody",
  },
  {
    goal: "landingV2.sales.goalBulkingTitle",
    promise: "landingV2.sales.goalBulkingBody",
  },
];

const objectionBreakers = [
  {
    title: "landingV2.sales.objection1Title",
    body: "landingV2.sales.objection1Body",
  },
  {
    title: "landingV2.sales.objection2Title",
    body: "landingV2.sales.objection2Body",
  },
  {
    title: "landingV2.sales.objection3Title",
    body: "landingV2.sales.objection3Body",
  },
];

const faqItems = [
  {
    q: "landingV2.sales.faq1Q",
    a: "landingV2.sales.faq1A",
  },
  {
    q: "landingV2.sales.faq2Q",
    a: "landingV2.sales.faq2A",
  },
  {
    q: "landingV2.sales.faq3Q",
    a: "landingV2.sales.faq3A",
  },
];

const pricingComparisonRows = [
  {
    title: "landingV2.pricingCompare.row1Title",
    description: "landingV2.pricingCompare.row1Desc",
    freeValue: "landingV2.pricingCompare.row1Free",
    premiumValue: "landingV2.pricingCompare.row1Premium",
  },
  {
    title: "landingV2.pricingCompare.row2Title",
    description: "landingV2.pricingCompare.row2Desc",
    freeValue: "landingV2.pricingCompare.row2Free",
    premiumValue: "landingV2.pricingCompare.row2Premium",
  },
  {
    title: "landingV2.pricingCompare.row3Title",
    description: "landingV2.pricingCompare.row3Desc",
    freeValue: "landingV2.pricingCompare.row3Free",
    premiumValue: "landingV2.pricingCompare.row3Premium",
  },
  {
    title: "landingV2.pricingCompare.row4Title",
    description: "landingV2.pricingCompare.row4Desc",
    freeValue: "landingV2.pricingCompare.row4Free",
    premiumValue: "landingV2.pricingCompare.row4Premium",
  },
  {
    title: "landingV2.pricingCompare.row5Title",
    description: "landingV2.pricingCompare.row5Desc",
    freeValue: "landingV2.pricingCompare.row5Free",
    premiumValue: "landingV2.pricingCompare.row5Premium",
  },
];

const primaryCtaClass = "landing-cta landing-cta-primary";
const secondaryCtaClass = "landing-cta landing-cta-secondary";
const ctaGroupClass = "landing-cta-group";

export default function LandingRoute() {
  const { t } = useAppTranslation();
  useScrollDepthTracking("landing");

  const trackCtaClick = (ctaId: string, placement: string, targetPath: string) => {
    trackEvent("landing_cta_clicked", {
      cta_id: ctaId,
      placement,
      target_path: targetPath,
    });
  };

  return (
    <div className="np-shell landing-page">
      <MarketingNav />

      <main>
        <section className="hero">
          <div className="hero-content">
            <Image
              src="/logo-nutripilot.svg"
              alt={t("app.name")}
              className="hero-logo-image"
              width={520}
              height={140}
              priority
            />
            <h1 className="hero-title">{t("landingV2.heroTitle")}</h1>
            <p className="hero-subtitle">{t("landingV2.heroSubtitle")}</p>

            <div className={ctaGroupClass}>
              <Link href="/app" className={`${primaryCtaClass} hero-link`} onClick={() => trackCtaClick("hero_primary", "hero", "/app")}>
                {t("landingV2.generatePlan")}
              </Link>
              <Link href="/pricing" className={`${secondaryCtaClass} hero-link`} onClick={() => trackCtaClick("hero_secondary", "hero", "/pricing")}>
                {t("landingV2.upgradePremium")}
              </Link>
            </div>

            <p className="hero-cta-note">{t("landingV2.heroCtaNote")}</p>

            <p className="hero-tagline">{t("landingV2.heroTagline")}</p>

            <div className="hero-trust-grid">
              {trustPills.map((pill) => (
                <div key={pill} className="hero-trust-pill">
                  ✅ {t(pill)}
                </div>
              ))}
            </div>

            <p className="hero-note">
              {t("landingV2.sales.heroNote")}
            </p>

            <div className="goal-copy-grid">
              {goalCopyCards.map((card) => (
                <article key={card.goal} className="goal-copy-card">
                  <h3>{t(card.goal)}</h3>
                  <p>{t(card.promise)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sales-strip">
          <div className="section-wrap sales-strip-wrap">
            <p className="sales-strip-title">🔥 {t("landingV2.sales.offerTitle")}</p>
            <p className="sales-strip-subtitle">
              {t("landingV2.sales.offerSubtitle")}
            </p>
            <p className="sales-strip-note">
              {t("landingV2.sales.offerNote")} <Link href="/pricing">{t("landingV2.sales.offerCtaSecondary")}</Link>
            </p>
          </div>
        </section>

        <section className="feature-highlights">
          <div className="section-wrap">
            <h2>{t("landingV2.featuresTitle")}</h2>
            <div className="cards-grid">
              <div className="np-card">
                <h3>{t("landingV2.feature1Title")}</h3>
                <p>{t("landingV2.feature1Desc")}</p>
              </div>
              <div className="np-card">
                <h3>{t("landingV2.feature2Title")}</h3>
                <p>{t("landingV2.feature2Desc")}</p>
              </div>
              <div className="np-card">
                <h3>{t("landingV2.feature3Title")}</h3>
                <p>{t("landingV2.feature3Desc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="objection-section">
          <div className="section-wrap">
            <h2>{t("landingV2.sales.objectionTitle")}</h2>
            <div className="cards-grid">
              {objectionBreakers.map((item) => (
                <div key={item.title} className="np-card objection-card">
                  <h3>{t(item.title)}</h3>
                  <p>{t(item.body)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingPreviewSection previewCards={previewCards} t={t} />

        <section className="proof-section">
          <div className="section-wrap">
            <h2>{t("landingV2.proofTitle")}</h2>
            <div className="proof-grid">
              <div className="np-card">
                <p>{t("landingV2.quote1")}</p>
                <span>{t("landingV2.quoteAuthor1")}</span>
              </div>
              <div className="np-card">
                <p>{t("landingV2.quote2")}</p>
                <span>{t("landingV2.quoteAuthor2")}</span>
              </div>
              <div className="np-card">
                <p>{t("landingV2.quote3")}</p>
                <span>{t("landingV2.quoteAuthor3")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-preview">
          <div className="section-wrap pricing-wrap">
            <div className="pricing-heading">
              <h2>{t("landingV2.pricingTitle")}</h2>
              <p className="pricing-intro">{t("landingV2.sales.pricingIntro")}</p>
            </div>

            <div className="pricing-table-desktop">
              <table className="pricing-compare-table">
                <thead>
                  <tr>
                    <th className="pricing-col-feature">
                      {t("landingV2.pricingCompare.featureColumn")}
                    </th>
                    <th className="pricing-col-free">
                      <div>{t("landingV2.pricingFreeTitle")}</div>
                      <div className="pricing-col-price">€0</div>
                    </th>
                    <th className="pricing-col-pro">
                      <div className="pricing-popular-pill">
                        {t("landingV2.pricingCompare.popular")}
                      </div>
                      <div className="pricing-col-title">{t("landingV2.pricingProTitle")}</div>
                      <div className="pricing-col-price">{t("landingV2.pricingProPrice")}</div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pricingComparisonRows.map((row) => (
                    <tr key={row.title}>
                      <td className="pricing-cell-feature">
                        <p className="pricing-cell-title">{t(row.title)}</p>
                        <p className="pricing-cell-description">{t(row.description)}</p>
                      </td>
                      <td className="pricing-cell-free">{t(row.freeValue)}</td>
                      <td className="pricing-cell-pro">{t(row.premiumValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pricing-cards-mobile">
              {pricingComparisonRows.map((row) => (
                <article key={row.title} className="pricing-mobile-card">
                  <h3>{t(row.title)}</h3>
                  <p>{t(row.description)}</p>
                  <div className="pricing-mobile-values">
                    <div className="pricing-mobile-value free">
                      <p>{t("landingV2.pricingFreeTitle")}</p>
                      <p>{t(row.freeValue)}</p>
                    </div>
                    <div className="pricing-mobile-value pro">
                      <p>{t("landingV2.pricingProTitle")}</p>
                      <p>{t(row.premiumValue)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="pricing-trust-grid">
              <div className="pricing-trust-item">🛡️ {t("landingV2.pricingCompare.trust1")}</div>
              <div className="pricing-trust-item">🔓 {t("landingV2.pricingCompare.trust2")}</div>
              <div className="pricing-trust-item">💳 {t("landingV2.pricingCompare.trust3")}</div>
            </div>

            <div className={ctaGroupClass}>
              <Link href="/app" className={primaryCtaClass} onClick={() => trackCtaClick("pricing_primary", "pricing", "/app")}>
                {t("landingV2.generatePlan")}
              </Link>
              <Link href="/pricing" className={secondaryCtaClass} onClick={() => trackCtaClick("pricing_secondary", "pricing", "/pricing")}>
                {t("landingV2.upgradePremium")}
              </Link>
            </div>

            <p className="pricing-risk-reversal">🛡️ {t("landingV2.sales.riskReversal")}</p>
          </div>
        </section>

        <section className="faq-section">
          <div className="section-wrap">
            <h2>{t("landingV2.sales.faqTitle")}</h2>
            <div className="faq-grid">
              {faqItems.map((item) => (
                <article key={item.q} className="np-card faq-card">
                  <h3>{t(item.q)}</h3>
                  <p>{t(item.a)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta-section">
          <div className="section-wrap final-cta-wrap">
            <h2>{t("landingV2.sales.finalCtaTitle")}</h2>
            <p>
              {t("landingV2.sales.finalCtaBody")}
            </p>
            <div className={ctaGroupClass}>
              <Link href="/app" className={primaryCtaClass} onClick={() => trackCtaClick("final_primary", "final_cta", "/app")}>
                {t("landingV2.sales.finalCtaPrimary")}
              </Link>
              <Link href="/pricing" className={secondaryCtaClass} onClick={() => trackCtaClick("final_secondary", "final_cta", "/pricing")}>
                {t("landingV2.sales.finalCtaSecondary")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Image src="/logo-nutripilot.svg" alt={t("app.name")} className="footer-logo-image" width={260} height={72} />
        <div className="footer-links">
          <Link href="/app">{t("nav.nutritionPlan")}</Link>
          <Link href="/app/list">{t("nav.groceryMission")}</Link>
          <Link href="/pricing">{t("nav.premium")}</Link>
        </div>
      </footer>
    </div>
  );
}

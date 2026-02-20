"use client";

import Link from "next/link";
import { MarketingNav } from "./components/MarketingNav";
import { trackEvent, useScrollDepthTracking } from "./lib/analytics";
import { useAppTranslation } from "./lib/i18n";

const previewCards = [
  { titleKey: "landingV2.preview1", imageSrc: "/previews/preview-1.png" },
  { titleKey: "landingV2.preview2", imageSrc: "/previews/preview-2.png" },
  { titleKey: "landingV2.preview3", imageSrc: "/previews/preview-3.png" },
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

const primaryCtaClass = "inline-flex items-center justify-center rounded-xl h-12 px-6 text-base font-semibold text-white bg-blue-700 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 shadow-sm transition-colors";
const secondaryCtaClass = "inline-flex items-center justify-center rounded-xl h-11 px-5 text-sm font-medium text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors";
const ctaGroupClass = "mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3";

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
            <img src="/logo-nutripilot.svg" alt={t("app.name")} className="hero-logo-image" />
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
            <div className={ctaGroupClass}>
              <Link href="/app" className={primaryCtaClass} onClick={() => trackCtaClick("offer_primary", "sales_strip", "/app")}>
                {t("landingV2.sales.offerCtaPrimary")}
              </Link>
              <Link href="/pricing" className={secondaryCtaClass} onClick={() => trackCtaClick("offer_secondary", "sales_strip", "/pricing")}>
                {t("landingV2.sales.offerCtaSecondary")}
              </Link>
            </div>
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

        <section className="mockup-section">
          <div className="section-wrap">
            <h2>{t("landingV2.previewTitle")}</h2>
            <div className="mockup-grid">
              {previewCards.map((card) => (
                <div
                  key={card.titleKey}
                  className="mockup-card mockup-image-card"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.1), rgba(2, 6, 23, 0.75)), url(${card.imageSrc})`,
                  }}
                  role="img"
                  aria-label={t(card.titleKey)}
                >
                  <span className="mockup-label">{t(card.titleKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="proof-section">
          <div className="section-wrap">
            <h2>{t("landingV2.proofTitle")}</h2>
            <div className="proof-grid">
              <div className="np-card">
                <p>{t("landingV2.quote1")}</p>
                <span>{t("landingV2.quoteAuthor")}</span>
              </div>
              <div className="np-card">
                <p>{t("landingV2.quote2")}</p>
                <span>{t("landingV2.quoteAuthor")}</span>
              </div>
              <div className="np-card">
                <p>{t("landingV2.quote3")}</p>
                <span>{t("landingV2.quoteAuthor")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-preview">
          <div className="section-wrap pricing-wrap">
            <div className="text-center">
              <h2>{t("landingV2.pricingTitle")}</h2>
              <p className="pricing-intro">{t("landingV2.sales.pricingIntro")}</p>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[rgba(8,30,49,0.55)]">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text)]">
                      {t("landingV2.pricingCompare.featureColumn")}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-text)]">
                      <div>{t("landingV2.pricingFreeTitle")}</div>
                      <div className="mt-1 text-base font-bold">€0</div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-text)] bg-[rgba(20,184,166,0.12)]">
                      <div className="inline-flex items-center rounded-full bg-[rgba(20,184,166,0.2)] px-2 py-0.5 text-xs font-bold text-[#99f6e4]">
                        {t("landingV2.pricingCompare.popular")}
                      </div>
                      <div className="mt-1">{t("landingV2.pricingProTitle")}</div>
                      <div className="mt-1 text-base font-bold">{t("landingV2.pricingProPrice")}</div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pricingComparisonRows.map((row) => (
                    <tr key={row.title} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="px-4 py-3 align-top">
                        <p className="m-0 text-sm font-semibold text-[var(--color-text)]">{t(row.title)}</p>
                        <p className="m-0 mt-1 text-xs text-[var(--color-text-muted)]">{t(row.description)}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-[var(--color-text)]">{t(row.freeValue)}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-text)] bg-[rgba(20,184,166,0.06)]">{t(row.premiumValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(8,30,49,0.45)] px-3 py-2 text-center">🛡️ {t("landingV2.pricingCompare.trust1")}</div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(8,30,49,0.45)] px-3 py-2 text-center">🔓 {t("landingV2.pricingCompare.trust2")}</div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(8,30,49,0.45)] px-3 py-2 text-center">💳 {t("landingV2.pricingCompare.trust3")}</div>
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
        <img src="/logo-nutripilot.svg" alt={t("app.name")} className="footer-logo-image" />
        <div className="footer-links">
          <Link href="/app">{t("nav.nutritionPlan")}</Link>
          <Link href="/app/list">{t("nav.groceryMission")}</Link>
          <Link href="/pricing">{t("nav.premium")}</Link>
        </div>
      </footer>
    </div>
  );
}

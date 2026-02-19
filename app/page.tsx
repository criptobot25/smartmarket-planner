"use client";

import Link from "next/link";
import { MarketingNav } from "./components/MarketingNav";
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

export default function LandingRoute() {
  const { t } = useAppTranslation();

  return (
    <div className="np-shell landing-page">
      <MarketingNav />

      <main>
        <section className="hero">
          <div className="hero-content">
            <img src="/logo-nutripilot.svg" alt={t("app.name")} className="hero-logo-image" />
            <h1 className="hero-title">{t("landingV2.heroTitle")}</h1>
            <p className="hero-subtitle">{t("landingV2.heroSubtitle")}</p>

            <div className="hero-cta">
              <Link href="/app" className="np-btn np-btn-primary hero-link">
                {t("landingV2.generatePlan")}
              </Link>
              <Link href="/pricing" className="np-btn np-btn-secondary hero-link">
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
            <div className="np-actions">
              <Link href="/app" className="np-btn np-btn-primary">
                {t("landingV2.sales.offerCtaPrimary")}
              </Link>
              <Link href="/pricing" className="np-btn np-btn-secondary">
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
            <h2>{t("landingV2.pricingTitle")}</h2>
            <p className="pricing-intro">
              {t("landingV2.sales.pricingIntro")}
            </p>
            <div className="pricing-cards">
              <div className="np-card pricing-card">
                <h3>{t("landingV2.pricingFreeTitle")}</h3>
                <p className="price">€0</p>
                <ul>
                  <li>{t("landingV2.pricingFreeFeature1")}</li>
                  <li>{t("landingV2.pricingFreeFeature2")}</li>
                  <li>{t("landingV2.pricingFreeFeature3")}</li>
                </ul>
              </div>

              <div className="np-card pricing-card featured">
                <h3>{t("landingV2.pricingProTitle")}</h3>
                <p className="price">{t("landingV2.pricingProPrice")}</p>
                <ul>
                  <li>{t("landingV2.pricingProFeature1")}</li>
                  <li>{t("landingV2.pricingProFeature2")}</li>
                  <li>{t("landingV2.pricingProFeature3")}</li>
                </ul>
              </div>
            </div>

            <div className="np-actions">
              <Link href="/app" className="np-btn np-btn-primary">
                {t("landingV2.generatePlan")}
              </Link>
              <Link href="/pricing" className="np-btn np-btn-secondary">
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
            <div className="np-actions">
              <Link href="/app" className="np-btn np-btn-primary">
                {t("landingV2.sales.finalCtaPrimary")}
              </Link>
              <Link href="/pricing" className="np-btn np-btn-secondary">
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

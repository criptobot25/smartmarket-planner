"use client";

import Link from "next/link";
import { MarketingNav } from "../components/MarketingNav";
import { useAppTranslation } from "../lib/i18n";

export default function PricingRoute() {
  const { t } = useAppTranslation();

  return (
    <div className="np-shell">
      <MarketingNav />

      <main className="np-main">
        <section className="np-page-header np-pricing-header">
          <h1>{t("landingV2.pricingTitle")}</h1>
          <p className="np-page-subtitle">{t("landingV2.pricingProFeature1")}</p>
        </section>

        <section className="np-grid np-pricing-grid">
          <article className="np-card np-pricing-card">
            <h3>{t("landingV2.pricingFreeTitle")}</h3>
            <p className="np-pricing-price">€0</p>
            <ul className="np-list">
              <li>{t("landingV2.pricingFreeFeature1")}</li>
              <li>{t("landingV2.pricingFreeFeature2")}</li>
              <li>{t("landingV2.pricingFreeFeature3")}</li>
            </ul>
          </article>

          <article className="np-card np-pricing-card np-pricing-card-featured">
            <h3>{t("landingV2.pricingProTitle")}</h3>
            <p className="np-pricing-price">{t("landingV2.pricingProPrice")}</p>
            <ul className="np-list">
              <li>{t("landingV2.pricingProFeature1")}</li>
              <li>{t("landingV2.pricingProFeature2")}</li>
              <li>{t("landingV2.pricingProFeature3")}</li>
            </ul>
          </article>
        </section>

        <section className="np-actions np-page-actions">
          <Link href="/app" className="np-btn np-btn-primary">
            {t("landingV2.generatePlan")}
          </Link>
          <Link href="/" className="np-btn np-btn-secondary">
            {t("nav.nutritionPlan")}
          </Link>
        </section>

        <section className="np-inline-note">
          {t("landingV2.pricingProFeature1")}
          <span> · </span>
          {t("landingV2.pricingProFeature2")}
          <span> · </span>
          {t("landingV2.pricingProFeature3")}
        </section>
      </main>
    </div>
  );
}

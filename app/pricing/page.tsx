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
        <section className="np-card">
          <h2>{t("landingV2.pricingTitle")}</h2>
          <p>{t("landingV2.pricingProFeature1")}</p>

          <div className="np-actions">
            <Link href="/app" className="np-btn np-btn-primary">
              {t("landingV2.generatePlan")}
            </Link>
            <Link href="/" className="np-btn np-btn-secondary">
              {t("nav.nutritionPlan")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

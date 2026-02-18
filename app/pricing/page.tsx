"use client";

import Link from "next/link";
import { useAppTranslation } from "../lib/i18n";

export default function PricingRoute() {
  const { language, setLanguage, t } = useAppTranslation();

  return (
    <div className="np-shell">
      <header className="np-nav">
        <Link href="/" className="np-brand">
          {t("app.name")}
        </Link>

        <div className="np-lang" aria-label={t("lang.portuguese")}>
          <button
            type="button"
            className={language === "en" ? "active" : ""}
            onClick={() => setLanguage("en")}
          >
            {t("lang.english")}
          </button>
          <button
            type="button"
            className={language === "pt" ? "active" : ""}
            onClick={() => setLanguage("pt")}
          >
            {t("lang.portuguese")}
          </button>
        </div>
      </header>

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

"use client";

import Link from "next/link";
import { useAppTranslation } from "./lib/i18n";

const previewCards = [
  { titleKey: "landingV2.preview1", imageSrc: "/previews/preview-1.png" },
  { titleKey: "landingV2.preview2", imageSrc: "/previews/preview-2.png" },
  { titleKey: "landingV2.preview3", imageSrc: "/previews/preview-3.png" },
];

export default function LandingRoute() {
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
        <section className="np-hero">
          <h1>{t("landingV2.heroTitle")}</h1>
          <p>{t("landingV2.heroSubtitle")}</p>

          <div className="np-actions">
            <Link href="/app" className="np-btn np-btn-primary">
              {t("landingV2.generatePlan")}
            </Link>
            <Link href="/pricing" className="np-btn np-btn-secondary">
              {t("landingV2.upgradePremium")}
            </Link>
          </div>
        </section>

        <section>
          <h2>{t("landingV2.previewTitle")}</h2>
          <div className="np-grid">
            {previewCards.map((card) => (
              <div
                key={card.titleKey}
                className="np-preview"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.08), rgba(2, 6, 23, 0.78)), url(${card.imageSrc})`,
                }}
                role="img"
                aria-label={t(card.titleKey)}
              >
                <span>{t(card.titleKey)}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

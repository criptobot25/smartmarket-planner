import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppTelemetry } from "../components/AppTelemetry";
import { WaitlistEmailCapture } from "../components/WaitlistEmailCapture";
import logoNutriPilot from "../../assets/logo-nutripilot.svg";
import "./PremiumPage.css";

export function PremiumPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="premium-page">
      <AppTelemetry />
      <header className="premium-header">
        <button className="btn-back" onClick={() => navigate("/app/list")}>
          ← {t("premiumPage.back")}
        </button>
        <img src={logoNutriPilot} alt={t("app.name")} className="premium-logo" />
        <h1>{t("premiumPage.title")}</h1>
        <p className="subtitle">{t("premiumPage.subtitle")}</p>
      </header>

      <main className="premium-main">
        <section className="value-intro">
          <h2>{t("premiumPage.valueIntroTitle")}</h2>
          <p>{t("premiumPage.valueIntroSubtitle")}</p>
        </section>

        <section className="comparison-section">
          <div className="plan-card free-plan">
            <div className="plan-header">
              <h2>{t("premiumPage.free.title")}</h2>
              <div className="price">
                <span className="amount">€0</span>
                <span className="period">{t("premiumPage.periodMonth")}</span>
              </div>
            </div>
            <ul className="features-list">
              <li className="included">✓ {t("premiumPage.free.feature1")}</li>
              <li className="included">✓ {t("premiumPage.free.feature2")}</li>
              <li className="included">✓ {t("premiumPage.free.feature3")}</li>
              <li className="excluded">✗ {t("premiumPage.free.feature4")}</li>
              <li className="excluded">✗ {t("premiumPage.free.feature5")}</li>
              <li className="excluded">✗ {t("premiumPage.free.feature6")}</li>
            </ul>
            <button className="btn-current" disabled>
              {t("premiumPage.free.currentPlan")}
            </button>
          </div>

          <div className="plan-card premium-plan">
            <div className="badge">🔥 {t("premiumPage.premium.bestValue")}</div>
            <div className="plan-header">
              <h2>{t("premiumPage.premium.title")}</h2>
              <div className="price">
                <span className="amount">€9.99</span>
                <span className="period">{t("premiumPage.periodMonth")}</span>
              </div>
            </div>
            <ul className="features-list">
              <li className="included">✓ {t("premiumPage.premium.feature1")}</li>
              <li className="included">✓ {t("premiumPage.premium.feature2")}</li>
              <li className="included">✓ {t("premiumPage.premium.feature3")}</li>
              <li className="included">✓ {t("premiumPage.premium.feature4")}</li>
              <li className="included">✓ {t("premiumPage.premium.feature5")}</li>
            </ul>
            <button className="btn-waitlist" onClick={() => navigate("/app") }>
              🚀 {t("premiumPage.premium.upgradeNow")}
            </button>
          </div>
        </section>

        <section className="faq-section">
          <h2>{t("premiumPage.faqTitle")}</h2>
          <div className="faq-item">
            <h3>{t("premiumPage.faq.rotationTitle")}</h3>
            <p>{t("premiumPage.faq.rotationBody")}</p>
          </div>
          <div className="faq-item">
            <h3>{t("premiumPage.faq.coachTitle")}</h3>
            <p>{t("premiumPage.faq.coachBody")}</p>
          </div>
          <div className="faq-item">
            <h3>{t("premiumPage.faq.recipeTitle")}</h3>
            <p>{t("premiumPage.faq.recipeBody")}</p>
          </div>
        </section>

        <section className="cta-section">
          <h2>{t("premiumPage.ctaTitle")}</h2>
          <p>{t("premiumPage.ctaSubtitle")}</p>
          <button className="btn-start" onClick={() => navigate("/app")}>
            🧭 {t("premiumPage.ctaButton")}
          </button>

          <WaitlistEmailCapture
            source="pricing"
            title={t("premiumPage.waitlistTitle")}
            subtitle={t("premiumPage.waitlistSubtitle")}
          />
        </section>
      </main>
    </div>
  );
}

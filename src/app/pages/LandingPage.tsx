import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AppTelemetry } from "../components/AppTelemetry";
import { WaitlistEmailCapture } from "../components/WaitlistEmailCapture";
import logoNutriPilot from "../../assets/logo-nutripilot.svg";
import "./LandingPage.css";

export function LandingPage() {
  const { t } = useTranslation();

  const previewCards = [
    { titleKey: "landingV2.preview1", imageSrc: "/previews/preview-1.png" },
    { titleKey: "landingV2.preview2", imageSrc: "/previews/preview-2.png" },
    { titleKey: "landingV2.preview3", imageSrc: "/previews/preview-3.png" }
  ];

  return (
    <div className="landing-page">
      <AppTelemetry />

      <section className="hero">
        <div className="hero-content">
          <img src={logoNutriPilot} alt={t("app.name")} className="hero-logo-image" />

          <h1 className="hero-title">{t("landingV2.heroTitle")}</h1>
          <p className="hero-subtitle">
            {t("landingV2.heroSubtitle")}
          </p>

          <div className="hero-cta">
            <Link to="/app" className="hero-link">
              <Button variant="primary">{t("landingV2.generatePlan")}</Button>
            </Link>
            <Link to="/pricing" className="hero-link">
              <Button variant="secondary">{t("landingV2.upgradePremium")}</Button>
            </Link>
          </div>

          <p className="hero-tagline">{t("landingV2.heroTagline")}</p>
        </div>
      </section>

      <section className="feature-highlights">
        <div className="section-wrap">
          <h2>{t("landingV2.featuresTitle")}</h2>
          <div className="cards-grid">
            <Card>
              <h3>{t("landingV2.feature1Title")}</h3>
              <p>{t("landingV2.feature1Desc")}</p>
            </Card>
            <Card>
              <h3>{t("landingV2.feature2Title")}</h3>
              <p>{t("landingV2.feature2Desc")}</p>
            </Card>
            <Card>
              <h3>{t("landingV2.feature3Title")}</h3>
              <p>{t("landingV2.feature3Desc")}</p>
            </Card>
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
                style={{ backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.1), rgba(2, 6, 23, 0.75)), url(${card.imageSrc})` }}
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
            <Card>
              <p>{t("landingV2.quote1")}</p>
              <span>{t("landingV2.quoteAuthor")}</span>
            </Card>
            <Card>
              <p>{t("landingV2.quote2")}</p>
              <span>{t("landingV2.quoteAuthor")}</span>
            </Card>
            <Card>
              <p>{t("landingV2.quote3")}</p>
              <span>{t("landingV2.quoteAuthor")}</span>
            </Card>
          </div>
        </div>
      </section>

      <section className="pricing-preview">
        <div className="section-wrap pricing-wrap">
          <h2>{t("landingV2.pricingTitle")}</h2>
          <div className="pricing-cards">
            <Card className="pricing-card">
              <h3>{t("landingV2.pricingFreeTitle")}</h3>
              <p className="price">€0</p>
              <ul>
                <li>{t("landingV2.pricingFreeFeature1")}</li>
                <li>{t("landingV2.pricingFreeFeature2")}</li>
                <li>{t("landingV2.pricingFreeFeature3")}</li>
              </ul>
            </Card>

            <Card className="pricing-card featured">
              <h3>{t("landingV2.pricingProTitle")}</h3>
              <p className="price">{t("landingV2.pricingProPrice")}</p>
              <ul>
                <li>{t("landingV2.pricingProFeature1")}</li>
                <li>{t("landingV2.pricingProFeature2")}</li>
                <li>{t("landingV2.pricingProFeature3")}</li>
              </ul>
            </Card>
          </div>

          <WaitlistEmailCapture
            source="landing"
            title={t("landingV2.waitlistTitle")}
            subtitle={t("landingV2.waitlistSubtitle")}
          />
        </div>
      </section>

      <footer className="landing-footer">
        <img src={logoNutriPilot} alt={t("app.name")} className="footer-logo-image" />
        <div className="footer-links">
          <Link to="/app">{t("nav.nutritionPlan")}</Link>
          <Link to="/app/list">{t("nav.groceryMission")}</Link>
          <Link to="/pricing">{t("nav.premium")}</Link>
        </div>
      </footer>
    </div>
  );
}

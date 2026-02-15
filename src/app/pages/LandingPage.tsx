import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import "./LandingPage.css";

/**
 * Landing Page - Public Marketing Page
 * 
 * Purpose: Convert visitors to users
 * Structure: Hero → Features → CTA
 * 
 * Headline: "Save €20+ per week on groceries while hitting your protein target"
 * 
 * Source: Landing page best practices
 * https://conversionxl.com/blog/landing-page-best-practices/
 */
export function LandingPage() {
  const { t } = useTranslation();
  const { streak } = useShoppingPlan(); // PASSO 33.4

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">{t("app.name")}</span>
            {/* PASSO 33.4: Streak indicator */}
            {streak > 0 && (
              <span className="streak-badge">
                🔥 {streak} week{streak > 1 ? 's' : ''} streak
              </span>
            )}
          </div>
          <div className="hero-badge">
            {t("landing.heroBadge")}
          </div>
          
          <h1 className="hero-title">
            {t("landing.heroTitlePrimary")}
            <span className="hero-gradient"> {t("landing.heroTitleAccent")}</span>
          </h1>
          
          <p className="hero-subtitle">
            {t("landing.heroSubtitle")}
          </p>
          
          <div className="hero-cta">
            <Link to="/app" style={{ textDecoration: 'none' }}>
              <Button variant="primary">
                {t("landing.startPlanning")}
              </Button>
            </Link>
            <p className="hero-note">
              {t("landing.heroNote")}
            </p>
          </div>
          <div className="hero-trust">
            <span>⭐️ {t("landing.heroTrustRating")}</span>
            <span>•</span>
            <span>{t("landing.heroTrustUsers")}</span>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">€80+</div>
              <div className="stat-label">{t("landing.statSavingsLabel")}</div>
            </div>
            <div className="stat">
              <div className="stat-value">150g</div>
              <div className="stat-label">{t("landing.statProteinLabel")}</div>
            </div>
            <div className="stat">
              <div className="stat-value">2+</div>
              <div className="stat-label">{t("landing.statProteinSourcesLabel")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Section */}
      <section className="screenshots">
        <div className="screenshots-content">
          <h2 className="section-title">{t("landing.sectionScreenshots")}</h2>
          <p className="section-subtitle">{t("landing.sectionScreenshotsSubtitle")}</p>
          <div className="screenshots-grid">
            <div className="screenshot-card">
              <div className="screenshot-frame" />
              <p>{t("landing.screenshotPlanner")}</p>
            </div>
            <div className="screenshot-card">
              <div className="screenshot-frame" />
              <p>{t("landing.screenshotSavings")}</p>
            </div>
            <div className="screenshot-card">
              <div className="screenshot-frame" />
              <p>{t("landing.screenshotList")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">{t("landing.sectionHowWorks")}</h2>
        
        <div className="features-grid">
          <Card>
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">{t("landing.featureGoalsTitle")}</h3>
            <p className="feature-description">
              {t("landing.featureGoalsDesc")}
            </p>
          </Card>
          
          <Card>
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">{t("landing.featureOptimizeTitle")}</h3>
            <p className="feature-description">
              {t("landing.featureOptimizeDesc")}
            </p>
          </Card>
          
          <Card>
            <div className="feature-icon">🛒</div>
            <h3 className="feature-title">{t("landing.featureListTitle")}</h3>
            <p className="feature-description">
              {t("landing.featureListDesc")}
            </p>
          </Card>
        </div>
      </section>

      {/* PASSO 33.5: Sunday Meal Prep Autopilot */}
      <section className="meal-prep-ritual">
        <div className="ritual-content">
          <div className="ritual-header">
            <span className="ritual-badge">🍳 SUNDAY RITUAL</span>
            <h2 className="ritual-title">Your Sunday Meal Prep Autopilot</h2>
            <p className="ritual-subtitle">
              Turn meal prep from overwhelming chaos into a peaceful 2-hour routine.
              We tell you exactly what to cook, chop, and store.
            </p>
          </div>

          <div className="ritual-grid">
            <div className="ritual-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>🍗 Batch Cook Proteins</h3>
                <p className="step-example">"Cook 2.4kg chicken breast"</p>
                <p className="step-desc">Season, bake, portion into 7 containers</p>
              </div>
            </div>

            <div className="ritual-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>🌾 Prep Your Carbs</h3>
                <p className="step-example">"Cook 1.5kg brown rice"</p>
                <p className="step-desc">One big batch, divide for the week</p>
              </div>
            </div>

            <div className="ritual-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>🥬 Chop Vegetables</h3>
                <p className="step-example">"Chop 1kg broccoli, 500g carrots"</p>
                <p className="step-desc">Pre-portioned, grab-and-go ready</p>
              </div>
            </div>
          </div>

          <div className="ritual-outcome">
            <div className="outcome-icon">✨</div>
            <div className="outcome-text">
              <h3>Result: 7 days of stress-free eating</h3>
              <p>Your fridge becomes your personal meal delivery service. Zero daily cooking stress.</p>
            </div>
          </div>

          <div className="ritual-cta">
            <Link to="/app" style={{ textDecoration: 'none' }}>
              <Button variant="primary" className="btn-ritual">
                🎯 Get My Sunday Checklist
              </Button>
            </Link>
            <p className="ritual-note">Free • Takes 2 minutes to set up</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="benefits-content">
          <h2 className="section-title">{t("landing.sectionWhy")}</h2>
          
          <div className="benefits-list">
            <Card className="benefit-card">
              <div className="benefit-check">✓</div>
              <div>
                <h4>{t("landing.benefitBudgetTitle")}</h4>
                <p>{t("landing.benefitBudgetDesc")}</p>
              </div>
            </Card>
            
            <Card className="benefit-card">
              <div className="benefit-check">✓</div>
              <div>
                <h4>{t("landing.benefitDiversityTitle")}</h4>
                <p>{t("landing.benefitDiversityDesc")}</p>
              </div>
            </Card>
            
            <Card className="benefit-card">
              <div className="benefit-check">✓</div>
              <div>
                <h4>{t("landing.benefitPersonalTitle")}</h4>
                <p>{t("landing.benefitPersonalDesc")}</p>
              </div>
            </Card>
            
            <Card className="benefit-card">
              <div className="benefit-check">✓</div>
              <div>
                <h4>{t("landing.benefitTransparentTitle")}</h4>
                <p>{t("landing.benefitTransparentDesc")}</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <div className="pricing-content">
          <h2 className="section-title">{t("landing.sectionPricing")}</h2>
          <p className="section-subtitle">{t("landing.sectionPricingSubtitle")}</p>
          <div className="pricing-grid">
            <Card className="pricing-card">
              <div className="pricing-header">
                <h3>{t("landing.pricingFreeTitle")}</h3>
                <p className="pricing-price">{t("landing.pricingFreePrice")}</p>
              </div>
              <ul className="pricing-features">
                <li>{t("landing.pricingFreeFeature1")}</li>
                <li>{t("landing.pricingFreeFeature2")}</li>
                <li>{t("landing.pricingFreeFeature3")}</li>
              </ul>
              <Link to="/app" style={{ textDecoration: 'none' }}>
                <Button variant="secondary">{t("landing.pricingFreeCta")}</Button>
              </Link>
            </Card>
            <Card className="pricing-card featured">
              <div className="pricing-badge">{t("landing.pricingPopular")}</div>
              <div className="pricing-header">
                <h3>{t("landing.pricingPremiumTitle")}</h3>
                <p className="pricing-price">{t("landing.pricingPremiumPrice")}</p>
              </div>
              <ul className="pricing-features">
                <li>{t("landing.pricingPremiumFeature1")}</li>
                <li>{t("landing.pricingPremiumFeature2")}</li>
                <li>{t("landing.pricingPremiumFeature3")}</li>
                <li>{t("landing.pricingPremiumFeature4")}</li>
              </ul>
              <Link to="/app/premium" style={{ textDecoration: 'none' }}>
                <Button variant="primary">{t("landing.pricingPremiumCta")}</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="testimonials-content">
          <h2 className="section-title">{t("landing.sectionTestimonials")}</h2>
          <div className="testimonials-grid">
            <Card className="testimonial-card">
              <p>“{t("landing.testimonial1.quote") }”</p>
              <div className="testimonial-author">
                <span className="testimonial-name">{t("landing.testimonial1.name")}</span>
                <span className="testimonial-role">{t("landing.testimonial1.role")}</span>
              </div>
            </Card>
            <Card className="testimonial-card">
              <p>“{t("landing.testimonial2.quote") }”</p>
              <div className="testimonial-author">
                <span className="testimonial-name">{t("landing.testimonial2.name")}</span>
                <span className="testimonial-role">{t("landing.testimonial2.role")}</span>
              </div>
            </Card>
            <Card className="testimonial-card">
              <p>“{t("landing.testimonial3.quote") }”</p>
              <div className="testimonial-author">
                <span className="testimonial-name">{t("landing.testimonial3.name")}</span>
                <span className="testimonial-role">{t("landing.testimonial3.role")}</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">{t("landing.ctaTitle")}</h2>
          <p className="cta-subtitle">{t("landing.ctaSubtitle")}</p>
          
          <Link to="/app" style={{ textDecoration: 'none' }}>
            <Button variant="primary">
              {t("landing.ctaButton")}
            </Button>
          </Link>
          
          <p className="cta-note">
            {t("landing.ctaNote")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">SmartMarket</span>
          </div>
          
          <div className="footer-links">
            <Link to="/app">{t("landing.footerPlanner")}</Link>
            <Link to="/app/premium">{t("landing.footerPremium")}</Link>
          </div>
          
          <p className="footer-copy">
            {t("landing.footerCopy")}
          </p>
        </div>
      </footer>
    </div>
  );
}

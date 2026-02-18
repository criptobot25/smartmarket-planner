import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AppTelemetry } from "../components/AppTelemetry";
import { WaitlistEmailCapture } from "../components/WaitlistEmailCapture";
import logoNutriPilot from "../../assets/logo-nutripilot.svg";
import "./LandingPage.css";

export function LandingPage() {
  return (
    <div className="landing-page">
      <AppTelemetry />

      <section className="hero">
        <div className="hero-content">
          <img src={logoNutriPilot} alt="NutriPilot" className="hero-logo-image" />

          <h1 className="hero-title">Your weekly nutrition plan, automated.</h1>
          <p className="hero-subtitle">
            NutriPilot builds your grocery list based on your body, goals, and training.
          </p>

          <div className="hero-cta">
            <Link to="/app" className="hero-link">
              <Button variant="primary">Generate My Plan</Button>
            </Link>
            <Link to="/pricing" className="hero-link">
              <Button variant="secondary">Upgrade to Premium</Button>
            </Link>
          </div>

          <p className="hero-tagline">Navigate Your Nutrition</p>
        </div>
      </section>

      <section className="feature-highlights">
        <div className="section-wrap">
          <h2>Built like a real fitness coach</h2>
          <div className="cards-grid">
            <Card>
              <h3>Body-Driven Planning</h3>
              <p>Plans adapt to sex, age, weight, height, training, and fitness goal.</p>
            </Card>
            <Card>
              <h3>Grocery Mission Automation</h3>
              <p>You get consolidated quantities and practical shopping instructions in seconds.</p>
            </Card>
            <Card>
              <h3>Premium Execution Layer</h3>
              <p>Unlock adaptive coaching, food rotation, and prep guide PDF exports.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mockup-section">
        <div className="section-wrap">
          <h2>Product Preview</h2>
          <div className="mockup-grid">
            <div className="mockup-card">Onboarding Coach Wizard</div>
            <div className="mockup-card">Nutrition Plan Dashboard</div>
            <div className="mockup-card">Grocery Mission + Prep Guide</div>
          </div>
        </div>
      </section>

      <section className="proof-section">
        <div className="section-wrap">
          <h2>Trusted by early fitness users</h2>
          <div className="proof-grid">
            <Card>
              <p>“Finally feels like a coach, not just another calorie app.”</p>
              <span>— Beta User Placeholder</span>
            </Card>
            <Card>
              <p>“I open it once and my week is organized.”</p>
              <span>— Beta User Placeholder</span>
            </Card>
            <Card>
              <p>“The premium flow made me understand exactly why to upgrade.”</p>
              <span>— Beta User Placeholder</span>
            </Card>
          </div>
        </div>
      </section>

      <section className="pricing-preview">
        <div className="section-wrap pricing-wrap">
          <h2>Simple pricing, premium outcomes</h2>
          <div className="pricing-cards">
            <Card className="pricing-card">
              <h3>Free</h3>
              <p className="price">€0</p>
              <ul>
                <li>Nutrition Plan generation</li>
                <li>Basic Grocery Mission</li>
                <li>Core meal suggestions</li>
              </ul>
            </Card>

            <Card className="pricing-card featured">
              <h3>NutriPilot Pro</h3>
              <p className="price">€9.99/month</p>
              <ul>
                <li>Unlimited Food Rotation</li>
                <li>Weekly Coach Adjustments</li>
                <li>Recipe Packs + Meal Prep Guide PDF</li>
              </ul>
            </Card>
          </div>

          <WaitlistEmailCapture
            source="landing"
            title="Join NutriPilot paid beta"
            subtitle="Get premium early-access invites and launch pricing first."
          />
        </div>
      </section>

      <footer className="landing-footer">
        <img src={logoNutriPilot} alt="NutriPilot" className="footer-logo-image" />
        <div className="footer-links">
          <Link to="/app">Nutrition Plan</Link>
          <Link to="/app/list">Grocery Mission</Link>
          <Link to="/pricing">Premium</Link>
        </div>
      </footer>
    </div>
  );
}

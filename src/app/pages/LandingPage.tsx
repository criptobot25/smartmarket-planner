import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
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
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            💰 Save €20+ per week automatically
          </div>
          
          <h1 className="hero-title">
            Smart Meal Planning for
            <span className="hero-gradient"> Fitness Goals</span>
          </h1>
          
          <p className="hero-subtitle">
            Generate weekly meal plans optimized for your budget and protein targets.
            No more expensive grocery bills or monotonous diets.
          </p>
          
          <div className="hero-cta">
            <Link to="/app" style={{ textDecoration: 'none' }}>
              <Button variant="primary">
                🚀 Start Planning Free
              </Button>
            </Link>
            <p className="hero-note">
              No credit card required • 1 free optimization per week
            </p>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">€80+</div>
              <div className="stat-label">Avg. monthly savings</div>
            </div>
            <div className="stat">
              <div className="stat-value">150g</div>
              <div className="stat-label">Protein per day</div>
            </div>
            <div className="stat">
              <div className="stat-value">2+</div>
              <div className="stat-label">Protein sources minimum</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">How SmartMarket Works</h2>
        
        <div className="features-grid">
          <Card>
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Set Your Goals</h3>
            <p className="feature-description">
              Choose your fitness goal (cutting, maintenance, bulking), set your budget, and customize preferences.
            </p>
          </Card>
          
          <Card>
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">AI Optimizes Your Plan</h3>
            <p className="feature-description">
              Our budget optimizer maximizes protein-per-euro while maintaining diet variety. No "tuna only" diets.
            </p>
          </Card>
          
          <Card>
            <div className="feature-icon">🛒</div>
            <h3 className="feature-title">Get Your Shopping List</h3>
            <p className="feature-description">
              Organized by category, shows total cost, savings, and protein. Export to PDF for supermarket trips.
            </p>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="benefits-content">
          <h2 className="section-title">Why SmartMarket?</h2>
          
          <div className="benefits-list">
            <Card className="benefit-card">
              <div className="benefit-check">✓</div>
              <div>
                <h4>Budget-Aware Optimization</h4>
                <p>Automatically substitutes expensive items with cheaper alternatives while maintaining macros</p>
              </div>
            </Card>
            
            <Card className="benefit-card">
              <div className="benefit-check">✓</div>
              <div>
                <h4>Diversity Guardrails</h4>
                <p>Maintains minimum 2 different protein sources. No monotonous diets that kill adherence</p>
              </div>
            </Card>
            
            <Card className="benefit-card">
              <div className="benefit-check">✓</div>
              <div>
                <h4>Personalization</h4>
                <p>Exclude foods you don't like or can't eat. The optimizer respects your preferences</p>
              </div>
            </Card>
            
            <Card className="benefit-card">
              <div className="benefit-check">✓</div>
              <div>
                <h4>Transparent & Honest</h4>
                <p>Shows exactly what was substituted and why. Honest messaging when budget is impossible</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Save Money & Hit Your Protein Target?</h2>
          <p className="cta-subtitle">Start planning your first week for free</p>
          
          <Link to="/app" style={{ textDecoration: 'none' }}>
            <Button variant="primary">
              🚀 Get Started Free
            </Button>
          </Link>
          
          <p className="cta-note">
            Free tier: 1 optimization/week • Premium: Unlimited + PDF export (€9.99/month)
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
            <Link to="/app">Planner</Link>
            <Link to="/app/premium">Premium</Link>
          </div>
          
          <p className="footer-copy">
            © 2026 SmartMarket Planner. Built for fitness enthusiasts who value their money.
          </p>
        </div>
      </footer>
    </div>
  );
}

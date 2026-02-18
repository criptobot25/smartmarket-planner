import { useNavigate } from "react-router-dom";
import { AppTelemetry } from "../components/AppTelemetry";
import { WaitlistEmailCapture } from "../components/WaitlistEmailCapture";
import "./PremiumPage.css";

export function PremiumPage() {
  const navigate = useNavigate();

  return (
    <div className="premium-page">
      <AppTelemetry />
      <header className="premium-header">
        <button className="btn-back" onClick={() => navigate("/app/list")}>
          ← Back
        </button>
        <h1>✨ SmartMarket Premium</h1>
        <p className="subtitle">Know in 5 seconds why people pay: less repetition, better adherence, printable execution.</p>
      </header>

      <main className="premium-main">
        <section className="value-intro">
          <h2>3 features impossible in Free</h2>
          <p>Free gives a solid base. Premium gives the execution system.</p>
        </section>

        <section className="comparison-section">
          <div className="plan-card free-plan">
            <div className="plan-header">
              <h2>Free</h2>
              <div className="price">
                <span className="amount">€0</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="features-list">
              <li className="included">✓ Weekly plan + shopping list</li>
              <li className="included">✓ Macro-based nutrition targets</li>
              <li className="included">✓ Basic recipe suggestions</li>
              <li className="excluded">✗ Unlimited Food Rotation</li>
              <li className="excluded">✗ Weekly Coach Adjustments</li>
              <li className="excluded">✗ Recipe Packs + Meal Prep Guide PDF</li>
            </ul>
            <button className="btn-current" disabled>
              Current Plan
            </button>
          </div>

          <div className="plan-card premium-plan">
            <div className="badge">🔥 Best Value</div>
            <div className="plan-header">
              <h2>Premium</h2>
              <div className="price">
                <span className="amount">€9.99</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="features-list">
              <li className="included">✓ Everything in Free</li>
              <li className="included">✓ Unlimited Food Rotation</li>
              <li className="included">✓ Weekly Coach Adjustments</li>
              <li className="included">✓ Recipe Packs + Meal Prep Guide PDF</li>
              <li className="included">✓ Faster weekly execution with less decision fatigue</li>
            </ul>
            <button className="btn-waitlist" onClick={() => navigate("/app") }>
              🚀 Upgrade Now
            </button>
          </div>
        </section>

        <section className="faq-section">
          <h2>What each premium feature changes</h2>
          <div className="faq-item">
            <h3>Unlimited Food Rotation</h3>
            <p>Prevents repeating the same proteins week after week while preserving your targets and budget constraints.</p>
          </div>
          <div className="faq-item">
            <h3>Weekly Coach Adjustments</h3>
            <p>Reads your adherence and repetition signals, then adapts next week automatically for consistency.</p>
          </div>
          <div className="faq-item">
            <h3>Recipe Packs + Meal Prep Guide PDF</h3>
            <p>Turns planning into execution with structured recipe packs and printable prep workflow.</p>
          </div>
        </section>

        <section className="cta-section">
          <h2>Start free, upgrade when repetition starts costing results.</h2>
          <p>If you want less friction and better weekly adherence, Premium pays for itself in consistency.</p>
          <button className="btn-start" onClick={() => navigate("/app")}>
            🧭 Go to Planner
          </button>

          <WaitlistEmailCapture
            source="pricing"
            title="Reserve your paid beta spot"
            subtitle="We'll email launch access and early adopter pricing first."
          />
        </section>
      </main>
    </div>
  );
}

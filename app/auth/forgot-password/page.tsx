import { MarketingNav } from "../../components/MarketingNav";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Reset Password – NutriPilot",
  description: "Reset your NutriPilot account password with a magic link.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="np-shell">
      <MarketingNav />

      <main className="np-main np-main-narrow">
        <section className="np-card np-card-hero">
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🔑 Reset Access</h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Enter your email and we&apos;ll send a magic link to sign back in
            </p>
          </div>

          <ForgotPasswordForm />

          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#6b7280", marginTop: "1.5rem" }}>
            Remember your account?{" "}
            <a href="/auth/login" style={{ color: "#3b82f6", fontWeight: 500 }}>
              Sign in
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}

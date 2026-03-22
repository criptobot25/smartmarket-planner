import { MarketingNav } from "../../components/MarketingNav";
import { SignupForm } from "./SignupForm";

type SignupPageProps = {
  searchParams?: {
    callbackUrl?: string;
  };
};

export const metadata = {
  title: "Sign Up – NutriPilot",
  description: "Create your free NutriPilot account. Smart meal planning for fitness goals.",
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  const callbackUrl = searchParams?.callbackUrl ?? "/app";

  return (
    <div className="np-shell">
      <MarketingNav />

      <main className="np-main np-main-narrow">
        <section className="np-card np-card-hero">
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🚀 Create Your Account</h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Start planning smarter meals for free
            </p>
          </div>

          <SignupForm callbackUrl={callbackUrl} />

          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#6b7280", marginTop: "1.5rem" }}>
            Already have an account?{" "}
            <a href="/auth/login" style={{ color: "#3b82f6", fontWeight: 500 }}>
              Sign in
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}

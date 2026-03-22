import { MarketingNav } from "../../components/MarketingNav";
import { LoginHeader } from "./LoginHeader";
import { LoginForm } from "../../login/LoginForm";

type LoginPageProps = {
  searchParams?: {
    callbackUrl?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const callbackUrl = searchParams?.callbackUrl ?? "/app";

  return (
    <div className="np-shell">
      <MarketingNav />

      <main className="np-main np-main-narrow">
        <section className="np-card np-card-hero">
          <LoginHeader />

          <LoginForm callbackUrl={callbackUrl} />

          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#6b7280", marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p>
              Don&apos;t have an account?{" "}
              <a href="/auth/signup" style={{ color: "#3b82f6", fontWeight: 500 }}>Sign up</a>
            </p>
            <p>
              <a href="/auth/forgot-password" style={{ color: "#3b82f6", fontWeight: 500 }}>Forgot your password?</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

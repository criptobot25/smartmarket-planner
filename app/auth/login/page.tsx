import { MarketingNav } from "../../components/MarketingNav";
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
          <header className="np-page-header">
            <h1>Login</h1>
            <p className="np-page-subtitle">Use Google or magic link to access your planner.</p>
          </header>

          <LoginForm callbackUrl={callbackUrl} />
        </section>
      </main>
    </div>
  );
}

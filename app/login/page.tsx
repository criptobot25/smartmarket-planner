import { MarketingNav } from "../components/MarketingNav";
import { LoginForm } from "./LoginForm";

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

      <main className="np-main">
        <section className="np-card">
          <h2>Login</h2>
          <p>Use Google or magic link to access your planner.</p>
          <LoginForm callbackUrl={callbackUrl} />
        </section>
      </main>
    </div>
  );
}

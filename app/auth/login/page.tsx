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
        </section>
      </main>
    </div>
  );
}

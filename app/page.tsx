"use client";

import Link from "next/link";
import { MarketingNav } from "./components/MarketingNav";
import { useAppTranslation } from "./lib/i18n";

const previewCards = [
  { titleKey: "landingV2.preview1", imageSrc: "/previews/preview-1.png" },
  { titleKey: "landingV2.preview2", imageSrc: "/previews/preview-2.png" },
  { titleKey: "landingV2.preview3", imageSrc: "/previews/preview-3.png" },
];

const trustPills = [
  "Baseado em Mifflin-St Jeor + TDEE",
  "Plano semanal em menos de 2 minutos",
  "Grocery Mission com progresso real",
  "Monday Prep desbloqueado por execução",
];

const goalCopyCards = [
  {
    goal: "Cutting",
    promise: "Defina déficit com segurança e mantenha proteína alta para preservar massa magra.",
  },
  {
    goal: "Maintenance",
    promise: "Estabilize rotina e composição corporal com metas realistas e execução semanal simples.",
  },
  {
    goal: "Bulking",
    promise: "Aplique superávit estratégico para crescer com controle, sem exagero de gordura.",
  },
];

const objectionBreakers = [
  {
    title: "Sem dieta genérica",
    body: "Seu plano é calculado por objetivo (cutting, manutenção ou bulking), treino e rotina alimentar.",
  },
  {
    title: "Sem perder tempo no mercado",
    body: "Lista agregada inteligente com foco em execução: compra certa, quantidade certa, semana organizada.",
  },
  {
    title: "Sem complicação",
    body: "Fluxo simples: gerar plano, completar Grocery Mission, iniciar Monday Prep com checklist prático.",
  },
];

const faqItems = [
  {
    q: "Em quanto tempo recebo meu plano?",
    a: "Normalmente em menos de 2 minutos, já com metas diárias e lista de compras pronta.",
  },
  {
    q: "Serve para quem quer emagrecer e para quem quer ganhar massa?",
    a: "Sim. O cálculo ajusta calorias e proteína conforme seu objetivo fitness.",
  },
  {
    q: "Preciso assinar para testar?",
    a: "Não. Você pode começar no plano gratuito e evoluir para Premium quando quiser.",
  },
];

export default function LandingRoute() {
  const { t } = useAppTranslation();

  return (
    <div className="np-shell landing-page">
      <MarketingNav />

      <main>
        <section className="hero">
          <div className="hero-content">
            <img src="/logo-nutripilot.svg" alt={t("app.name")} className="hero-logo-image" />
            <h1 className="hero-title">{t("landingV2.heroTitle")}</h1>
            <p className="hero-subtitle">{t("landingV2.heroSubtitle")}</p>

            <div className="hero-cta">
              <Link href="/app" className="np-btn np-btn-primary hero-link">
                {t("landingV2.generatePlan")}
              </Link>
              <Link href="/pricing" className="np-btn np-btn-secondary hero-link">
                {t("landingV2.upgradePremium")}
              </Link>
            </div>

            <p className="hero-tagline">{t("landingV2.heroTagline")}</p>

            <div className="hero-trust-grid">
              {trustPills.map((pill) => (
                <div key={pill} className="hero-trust-pill">
                  ✅ {pill}
                </div>
              ))}
            </div>

            <p className="hero-note">
              Mais de planejamento, menos fricção: transforme intenção em execução semanal.
            </p>

            <div className="goal-copy-grid">
              {goalCopyCards.map((card) => (
                <article key={card.goal} className="goal-copy-card">
                  <h3>{card.goal}</h3>
                  <p>{card.promise}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sales-strip">
          <div className="section-wrap sales-strip-wrap">
            <p className="sales-strip-title">🔥 Oferta de entrada para acelerar resultados</p>
            <p className="sales-strip-subtitle">
              Comece grátis hoje e desbloqueie Premium quando quiser — sem contrato, sem risco.
            </p>
            <div className="np-actions">
              <Link href="/app" className="np-btn np-btn-primary">
                Quero meu plano agora
              </Link>
              <Link href="/pricing" className="np-btn np-btn-secondary">
                Ver plano Premium
              </Link>
            </div>
          </div>
        </section>

        <section className="feature-highlights">
          <div className="section-wrap">
            <h2>{t("landingV2.featuresTitle")}</h2>
            <div className="cards-grid">
              <div className="np-card">
                <h3>{t("landingV2.feature1Title")}</h3>
                <p>{t("landingV2.feature1Desc")}</p>
              </div>
              <div className="np-card">
                <h3>{t("landingV2.feature2Title")}</h3>
                <p>{t("landingV2.feature2Desc")}</p>
              </div>
              <div className="np-card">
                <h3>{t("landingV2.feature3Title")}</h3>
                <p>{t("landingV2.feature3Desc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="objection-section">
          <div className="section-wrap">
            <h2>Por que essa landing converte em resultado?</h2>
            <div className="cards-grid">
              {objectionBreakers.map((item) => (
                <div key={item.title} className="np-card objection-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mockup-section">
          <div className="section-wrap">
            <h2>{t("landingV2.previewTitle")}</h2>
            <div className="mockup-grid">
              {previewCards.map((card) => (
                <div
                  key={card.titleKey}
                  className="mockup-card mockup-image-card"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.1), rgba(2, 6, 23, 0.75)), url(${card.imageSrc})`,
                  }}
                  role="img"
                  aria-label={t(card.titleKey)}
                >
                  <span className="mockup-label">{t(card.titleKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="proof-section">
          <div className="section-wrap">
            <h2>{t("landingV2.proofTitle")}</h2>
            <div className="proof-grid">
              <div className="np-card">
                <p>{t("landingV2.quote1")}</p>
                <span>{t("landingV2.quoteAuthor")}</span>
              </div>
              <div className="np-card">
                <p>{t("landingV2.quote2")}</p>
                <span>{t("landingV2.quoteAuthor")}</span>
              </div>
              <div className="np-card">
                <p>{t("landingV2.quote3")}</p>
                <span>{t("landingV2.quoteAuthor")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-preview">
          <div className="section-wrap pricing-wrap">
            <h2>{t("landingV2.pricingTitle")}</h2>
            <p className="pricing-intro">
              Escolha o ritmo: comece com o gratuito e evolua para o Premium quando quiser escalar consistência.
            </p>
            <div className="pricing-cards">
              <div className="np-card pricing-card">
                <h3>{t("landingV2.pricingFreeTitle")}</h3>
                <p className="price">€0</p>
                <ul>
                  <li>{t("landingV2.pricingFreeFeature1")}</li>
                  <li>{t("landingV2.pricingFreeFeature2")}</li>
                  <li>{t("landingV2.pricingFreeFeature3")}</li>
                </ul>
              </div>

              <div className="np-card pricing-card featured">
                <h3>{t("landingV2.pricingProTitle")}</h3>
                <p className="price">{t("landingV2.pricingProPrice")}</p>
                <ul>
                  <li>{t("landingV2.pricingProFeature1")}</li>
                  <li>{t("landingV2.pricingProFeature2")}</li>
                  <li>{t("landingV2.pricingProFeature3")}</li>
                </ul>
              </div>
            </div>

            <div className="np-actions">
              <Link href="/app" className="np-btn np-btn-primary">
                {t("landingV2.generatePlan")}
              </Link>
              <Link href="/pricing" className="np-btn np-btn-secondary">
                {t("landingV2.upgradePremium")}
              </Link>
            </div>

            <p className="pricing-risk-reversal">🛡️ Sem compromisso de longo prazo. Cancele quando quiser.</p>
          </div>
        </section>

        <section className="faq-section">
          <div className="section-wrap">
            <h2>Perguntas frequentes</h2>
            <div className="faq-grid">
              {faqItems.map((item) => (
                <article key={item.q} className="np-card faq-card">
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta-section">
          <div className="section-wrap final-cta-wrap">
            <h2>Seu próximo resultado começa nesta semana</h2>
            <p>
              Gere seu plano, compre com foco e execute o prep com checklist. Esse é o atalho para consistência real.
            </p>
            <div className="np-actions">
              <Link href="/app" className="np-btn np-btn-primary">
                Começar agora
              </Link>
              <Link href="/pricing" className="np-btn np-btn-secondary">
                Comparar planos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <img src="/logo-nutripilot.svg" alt={t("app.name")} className="footer-logo-image" />
        <div className="footer-links">
          <Link href="/app">{t("nav.nutritionPlan")}</Link>
          <Link href="/app/list">{t("nav.groceryMission")}</Link>
          <Link href="/pricing">{t("nav.premium")}</Link>
        </div>
      </footer>
    </div>
  );
}

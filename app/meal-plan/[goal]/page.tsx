import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { JsonLdScript } from "../../components/JsonLdScript";
import { getRelatedBlogPostsForGoal } from "../../lib/blog";
import { absoluteUrl, getLanguageAlternates } from "../../lib/seo";
import { MEAL_PLAN_GOALS, getMealPlanGoalContent, type MealPlanGoal } from "../../lib/mealPlanGoals";

type MealPlanGoalPageProps = {
  params: {
    goal: string;
  };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return MEAL_PLAN_GOALS.map((goal) => ({ goal }));
}

export function generateMetadata({ params }: MealPlanGoalPageProps): Metadata {
  const content = getMealPlanGoalContent(params.goal);

  if (!content) {
    return {
      title: "Meal Plan Goal",
      description: "Goal-based weekly meal-plan frameworks.",
    };
  }

  const routePath = `/meal-plan/${content.goal}`;

  return {
    title: content.seoTitle,
    description: content.seoDescription,
    alternates: {
      canonical: routePath,
      languages: getLanguageAlternates(routePath),
    },
    openGraph: {
      type: "article",
      title: content.seoTitle,
      description: content.seoDescription,
      url: routePath,
    },
    twitter: {
      card: "summary",
      title: content.seoTitle,
      description: content.seoDescription,
    },
  };
}

function getSiblingGoals(activeGoal: MealPlanGoal): MealPlanGoal[] {
  return MEAL_PLAN_GOALS.filter((goal) => goal !== activeGoal);
}

export default async function MealPlanGoalPage({ params }: MealPlanGoalPageProps) {
  const content = getMealPlanGoalContent(params.goal);

  if (!content) {
    notFound();
  }

  const siblingGoals = getSiblingGoals(content.goal);
  const relatedBlogPosts = await getRelatedBlogPostsForGoal(content.goal, 3);
  const pageUrl = absoluteUrl(`/meal-plan/${content.goal}`);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.seoTitle,
    description: content.seoDescription,
    url: pageUrl,
    inLanguage: ["en-US", "pt-BR"],
    isPartOf: {
      "@type": "WebSite",
      name: "NutriPilot",
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Thing",
      name: `${content.shortLabel} meal planning`,
    },
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="np-shell">
      <JsonLdScript id={`ld-webpage-meal-plan-${content.goal}`} data={webPageSchema} />
      <JsonLdScript id={`ld-faq-meal-plan-${content.goal}`} data={faqPageSchema} />

      <main className="np-main np-main-narrow">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Meal plan", href: "/meal-plan" },
            { label: content.shortLabel },
          ]}
          currentPath={`/meal-plan/${content.goal}`}
        />

        <section className="np-page-header">
          <h1>{content.heroTitle}</h1>
          <p className="np-page-subtitle">{content.heroDescription}</p>
        </section>

        <section className="np-card" aria-labelledby="goal-intent">
          <h2 id="goal-intent">Who this {content.shortLabel.toLowerCase()} meal plan is for</h2>
          <p>{content.intentSummary}</p>
        </section>

        <section className="np-card" aria-labelledby="goal-framework">
          <h2 id="goal-framework">Weekly framework</h2>
          <ul className="np-list">
            {content.framework.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="np-card" aria-labelledby="goal-construction">
          <h2 id="goal-construction">Meal construction guide</h2>
          <ul className="np-list">
            {content.mealConstruction.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="np-card" aria-labelledby="goal-mistakes">
          <h2 id="goal-mistakes">Common mistakes to avoid</h2>
          <ul className="np-list">
            {content.commonMistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="np-card" aria-labelledby="goal-faq">
          <h2 id="goal-faq">FAQ</h2>
          <div className="np-grid" style={{ gridTemplateColumns: "1fr" }}>
            {content.faq.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="np-card" aria-labelledby="goal-links">
          <h2 id="goal-links">Related pages</h2>
          <p className="np-inline-note">
            Explore related goal pages and jump into the planner to generate your personalized weekly plan.
          </p>
          <div className="np-actions">
            {siblingGoals.map((goal) => {
              const sibling = getMealPlanGoalContent(goal);
              if (!sibling) {
                return null;
              }

              return (
                <Link key={goal} href={`/meal-plan/${goal}` as Route} className="np-btn np-btn-secondary">
                  {sibling.shortLabel} meal plan
                </Link>
              );
            })}
            <Link href="/app" className="np-btn np-btn-primary">Generate my plan</Link>
          </div>
        </section>

        {relatedBlogPosts.length > 0 ? (
          <section className="np-card" aria-labelledby="goal-blog-links">
            <h2 id="goal-blog-links">Related blog articles</h2>
            <div className="blog-grid">
              {relatedBlogPosts.map((post) => (
                <article key={post.slug} className="blog-card">
                  <h3>
                    <Link href={`/blog/${post.slug}` as Route}>{post.title}</Link>
                  </h3>
                  <p>{post.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

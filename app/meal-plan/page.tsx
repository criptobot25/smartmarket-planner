import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getLanguageAlternates } from "../lib/seo";
import { MEAL_PLAN_GOALS, getMealPlanGoalContent } from "../lib/mealPlanGoals";

export const metadata: Metadata = {
  title: "Goal-Based Meal Plans",
  description: "Browse goal-based meal-plan guides for cutting, bulking, and maintenance with practical weekly frameworks and execution tips.",
  alternates: {
    canonical: "/meal-plan",
    languages: getLanguageAlternates("/meal-plan"),
  },
};

export default function MealPlanHubPage() {
  return (
    <div className="np-shell">
      <main className="np-main np-main-narrow">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Meal plan" },
          ]}
          currentPath="/meal-plan"
        />

        <section className="np-page-header">
          <h1>Goal-Based Meal Plan Guides</h1>
          <p className="np-page-subtitle">
            Choose your current nutrition objective and follow a detailed weekly framework built for consistent execution.
          </p>
        </section>

        <section className="np-grid">
          {MEAL_PLAN_GOALS.map((goal) => {
            const content = getMealPlanGoalContent(goal);

            if (!content) {
              return null;
            }

            return (
              <article key={goal} className="np-card">
                <h2>{content.shortLabel} meal plan</h2>
                <p>{content.heroDescription}</p>
                <div className="np-actions" style={{ justifyContent: "flex-start" }}>
                  <Link href={`/meal-plan/${goal}` as Route} className="np-btn np-btn-primary">Read {content.shortLabel} guide</Link>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

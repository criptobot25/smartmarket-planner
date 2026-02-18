"use client";

import Link from "next/link";
import { AppNav } from "../../components/AppNav";
import { useAppTranslation } from "../../lib/i18n";

export default function PrepGuideRoute() {
  const { t } = useAppTranslation();

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main">
        <section className="np-card">
          <h2>{t("prepGuide.title")}</h2>
          <p>{t("prepGuide.checklistSubtitle")}</p>

          <div className="np-actions">
            <Link href="/app/list" className="np-btn np-btn-primary">
              {t("shoppingList.pageTitle")}
            </Link>
            <Link href="/app" className="np-btn np-btn-secondary">
              {t("nav.nutritionPlan")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

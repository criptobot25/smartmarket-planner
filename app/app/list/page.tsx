"use client";

import Link from "next/link";
import { AppNav } from "../../components/AppNav";
import { useAppTranslation } from "../../lib/i18n";

export default function ShoppingListRoute() {
  const { t } = useAppTranslation();

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main">
        <section className="np-card">
          <h2>{t("shoppingList.pageTitle")}</h2>
          <p>{t("shoppingList.subtitle")}</p>

          <div className="np-actions">
            <Link href="/app/prep-guide" className="np-btn np-btn-primary">
              {t("nav.mondayPrep")}
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

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppNav } from "../../components/AppNav";
import { useAppTranslation } from "../../lib/i18n";
import { useShoppingProgressStore } from "../../stores/shoppingProgressStore";

export default function ShoppingListRoute() {
  const { t } = useAppTranslation();
  const isHydrated = useShoppingProgressStore((state) => state.isHydrated);
  const purchasedCount = useShoppingProgressStore((state) => state.purchasedCount);
  const totalCount = useShoppingProgressStore((state) => state.totalCount);
  const progressPercent = useShoppingProgressStore((state) => state.progressPercent);
  const setProgressCounts = useShoppingProgressStore((state) => state.setProgressCounts);

  useEffect(() => {
    if (!isHydrated || totalCount > 0) {
      return;
    }

    setProgressCounts(0, 39);
  }, [isHydrated, setProgressCounts, totalCount]);

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main">
        <section className="np-card">
          <h2>{t("shoppingList.pageTitle")}</h2>
          <p>{t("shoppingList.subtitle")}</p>
          <p className="np-muted">{t("shoppingList.progress")}: {progressPercent}%</p>
          <p className="np-muted">{purchasedCount}/{totalCount}</p>

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

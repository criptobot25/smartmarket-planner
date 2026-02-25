"use client";

import Link from "next/link";
import { useAppTranslation } from "../lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { isFeatureEnabled } from "../../src/core/config/featureFlags";

export function MarketingNav() {
  const { t } = useAppTranslation();
  const monetizationEnabled = isFeatureEnabled("premiumMonetizationV2");

  return (
    <header className="np-nav">
      <Link href="/" className="np-brand">
        <img src="/logo-nutripilot.svg" alt={t("app.name")} className="np-brand-logo" />
      </Link>

      <div className="np-nav-right">
        <Link href="/app" className="np-btn np-btn-secondary np-btn-nav">
          {t("nav.nutritionPlan")}
        </Link>
        {monetizationEnabled ? (
          <Link href="/pricing" className="np-btn np-btn-primary np-btn-nav">
            {t("nav.premium")}
          </Link>
        ) : null}
        <LanguageSwitcher />
      </div>
    </header>
  );
}

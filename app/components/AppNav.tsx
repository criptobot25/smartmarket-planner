"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppTranslation } from "../lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { isFeatureEnabled } from "../../src/core/config/featureFlags";

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app";
  }

  return pathname.startsWith(href);
}

export function AppNav() {
  const pathname = usePathname();
  const { t } = useAppTranslation();
  const monetizationEnabled = isFeatureEnabled("premiumMonetizationV2");

  return (
    <header className="np-nav np-nav-app">
      <Link href="/" className="np-brand">
        <img src="/logo-nutripilot.svg" alt={t("app.name")} className="np-brand-logo" />
      </Link>

      <nav className="np-tabs" aria-label={t("nav.nutritionPlan")}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Link href={"/app/today" as any} className={`np-tab np-tab-today ${isRouteActive(pathname, "/app/today") ? "active" : ""}`}>
          ☀️ Hoje
        </Link>
        <Link href="/app" className={`np-tab ${pathname === "/app" ? "active" : ""}`}>
          {t("nav.nutritionPlan")}
        </Link>
        <Link href="/app/list" className={`np-tab ${isRouteActive(pathname, "/app/list") ? "active" : ""}`}>
          {t("nav.groceryMission")}
        </Link>
        <Link href="/app/prep" className={`np-tab ${isRouteActive(pathname, "/app/prep") ? "active" : ""}`}>
          {t("nav.mondayPrep")}
        </Link>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Link href={"/app/progress" as any} className={`np-tab ${isRouteActive(pathname, "/app/progress") ? "active" : ""}`}>
          📊 Progress
        </Link>
      </nav>

      <div className="np-nav-right">
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

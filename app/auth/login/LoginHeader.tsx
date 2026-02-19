"use client";

import { useAppTranslation } from "../../lib/i18n";

export function LoginHeader() {
  const { t } = useAppTranslation();

  return (
    <header className="np-page-header">
      <h1>{t("auth.loginTitle")}</h1>
      <p className="np-page-subtitle">{t("auth.loginSubtitle")}</p>
    </header>
  );
}

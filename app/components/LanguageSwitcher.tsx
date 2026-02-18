"use client";

import { useAppTranslation } from "../lib/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useAppTranslation();

  return (
    <div className="np-lang" aria-label={t("lang.portuguese")}>
      <button
        type="button"
        className={language === "en" ? "active" : ""}
        onClick={() => setLanguage("en")}
      >
        {t("lang.english")}
      </button>
      <button
        type="button"
        className={language === "pt" ? "active" : ""}
        onClick={() => setLanguage("pt")}
      >
        {t("lang.portuguese")}
      </button>
    </div>
  );
}

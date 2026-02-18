"use client";

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../src/i18n";

type SupportedLanguage = "en" | "pt";

function normalizeLanguage(value: string | null | undefined): SupportedLanguage {
  return value === "pt" ? "pt" : "en";
}

export function useAppTranslation() {
  const { t, i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
    const normalizedLanguage = normalizeLanguage(stored);

    if (i18nInstance.language !== normalizedLanguage) {
      void i18nInstance.changeLanguage(normalizedLanguage);
    }
  }, []);

  const setLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    void i18n.changeLanguage(nextLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", nextLanguage);
    }
  }, []);

  const language = normalizeLanguage(i18nInstance.language);

  return {
    language,
    setLanguage,
    t,
  };
}

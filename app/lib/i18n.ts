"use client";

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../src/i18n";

type SupportedLanguage = "en" | "pt";

function normalizeLanguage(value: string | null | undefined): SupportedLanguage {
  if (!value) {
    return "en";
  }

  const lowered = value.toLowerCase();
  return lowered.startsWith("pt") ? "pt" : "en";
}

export function useAppTranslation() {
  const { t, i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
    const browserLang = typeof window !== "undefined" ? window.navigator.language : null;
    const sourceLanguage = stored ?? browserLang;
    const normalizedLanguage = normalizeLanguage(sourceLanguage);

    if (typeof document !== "undefined") {
      document.documentElement.lang = normalizedLanguage;
    }

    if (i18nInstance.language !== normalizedLanguage) {
      void i18nInstance.changeLanguage(normalizedLanguage);
    }
  }, []);

  const setLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    void i18n.changeLanguage(nextLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", nextLanguage);
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLanguage;
    }
  }, []);

  const language = normalizeLanguage(i18nInstance.language);

  return {
    language,
    setLanguage,
    t,
  };
}

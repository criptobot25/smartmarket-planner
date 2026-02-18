"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import en from "../../src/i18n/en.json";
import pt from "../../src/i18n/pt.json";

type SupportedLanguage = "en" | "pt";

type Dictionary = Record<string, string>;

const dictionaries: Record<SupportedLanguage, Dictionary> = {
  en,
  pt,
};

function normalizeLanguage(value: string | null | undefined): SupportedLanguage {
  return value === "pt" ? "pt" : "en";
}

export function useAppTranslation() {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
    setLanguageState(normalizeLanguage(stored));
  }, []);

  const setLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    setLanguageState(nextLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", nextLanguage);
    }
  }, []);

  const dictionary = useMemo(() => dictionaries[language] ?? dictionaries.en, [language]);

  const t = useCallback(
    (key: string) => {
      return dictionary[key] ?? dictionaries.en[key] ?? key;
    },
    [dictionary]
  );

  return {
    language,
    setLanguage,
    t,
  };
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import pt from "./pt.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";

const SUPPORTED_LANGS = ["en", "pt", "es", "fr", "de"] as const;
const storedLang = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
const defaultLang = SUPPORTED_LANGS.includes(storedLang as (typeof SUPPORTED_LANGS)[number])
  ? (storedLang as string)
  : "en";

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
    },
    lng: defaultLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import pt from "./pt.json";

const storedLang = localStorage.getItem("lang");
const defaultLang = storedLang === "pt" || storedLang === "en" ? storedLang : "en";

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    lng: defaultLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;

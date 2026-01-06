import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

// Get device language, default to French
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "fr";
const defaultLanguage = deviceLanguage === "fr" ? "fr" : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18n;

export const changeLanguage = (lang: "en" | "fr") => {
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = () => i18n.language as "en" | "fr";

import { useApp } from "./store/useApp";
import { translations } from "./i18n";

export const useTranslate = () => {
  const { lang } = useApp();

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[lang];

    // ✅ nested
    for (let k of keys) {
      value = value?.[k];
    }

    // ✅ fallback old keys
    if (!value) {
      for (let section in translations[lang]) {
        if (translations[lang][section]?.[key]) {
          return translations[lang][section][key];
        }
      }
    }

    // 🔥 أهم إضافة
    if (typeof value === "object") {
      return value.title || key;
    }

    return value || key;
  };

  return t;
};
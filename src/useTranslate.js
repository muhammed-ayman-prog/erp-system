import { useApp } from "./store/useApp";
import { translations } from "./i18n";

export const useTranslate = () => {
  const { lang } = useApp();

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[lang];

    // ✅ يدعم nested
    for (let k of keys) {
      value = value?.[k];
    }

    // ✅ fallback للـ old keys
    if (!value) {
      for (let section in translations[lang]) {
        if (translations[lang][section]?.[key]) {
          return translations[lang][section][key];
        }
      }
    }

    return value || key;
  };

  return t;
};
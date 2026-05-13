import { useApp } from "./store/useApp";
import { translations } from "./i18n";

export const useTranslate = () => {
  const { lang } = useApp();

  const t = (key) => {
    const keys = key.split(".");

    let value = translations[lang];

    // ✅ nested keys
    for (let k of keys) {
      value = value?.[k];
    }

    // ✅ fallback old flat keys
    if (value === undefined) {
      for (let section in translations[lang]) {
        if (translations[lang][section]?.[key] !== undefined) {
          return translations[lang][section][key];
        }
      }
    }

    // ✅ لو object يرجع title
    if (
      value !== undefined &&
      typeof value === "object"
    ) {
      return value.title || key;
    }

    // ✅ fallback للإنجليزي
    if (value === undefined) {
      let fallback = translations.en;

      for (let k of keys) {
        fallback = fallback?.[k];
      }

      return fallback || key;
    }

    return value;
  };

  // ✅ helper سريع
  const tt = (ar, en) =>
    lang === "ar" ? ar : en;

  return {
    t,
    tt,
    lang
  };
};
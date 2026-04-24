import { useApp } from "./store/useApp";
import { translations } from "./i18n";

export const useTranslate = () => {
  const { lang } = useApp();

  return (key) => {
    return translations[lang]?.[key] || key;
  };
};
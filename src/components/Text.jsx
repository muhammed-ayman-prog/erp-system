import { useTranslate } from "../useTranslate";

export default function Text({ k }) {
  const { t, tt, lang } = useTranslate();
  return t(k);
}
import { useTranslate } from "../useTranslate";

export default function Text({ k }) {
  const t = useTranslate();
  return t(k);
}
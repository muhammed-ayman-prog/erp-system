import AppCard from "../../../components/ui/AppCard";
import { useTranslate } from "../../../useTranslate";

export default function Tabs() {
  const { t } = useTranslate();

  return <AppCard>{t("stockEntry.historyTimeline")}</AppCard>;
}

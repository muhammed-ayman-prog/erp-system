import AppPageHeader from "../../../components/ui/AppPageHeader";
import { useTranslate } from "../../../useTranslate";

export default function ExpenseHeader() {
  const { t } = useTranslate();

  return (
    <AppPageHeader
      title={t("expenses.title")}
      subtitle={t("expenses.subtitle")}
    />
  );
}
import {
  Wallet,
  Tag,
  Receipt,
  Calculator,
} from "lucide-react";

import AppStatCard from "../../../components/ui/AppStatCard";
import AppStatsGrid from "../../../components/ui/AppStatsGrid";
import { useTranslate } from "../../../useTranslate";

export default function ExpenseStats({
  totalExpenses,
  topCategory,
  totalTransactions,
  averageExpense,
  formatMoney,
}) {
  const { t } = useTranslate();

  return (
    <AppStatsGrid>
      <AppStatCard
        title={t("expenses.totalExpenses")}
        value={`${formatMoney(totalExpenses)} EGP`}
        icon={<Wallet size={26} />}
        color="danger"
      />

      <AppStatCard
        title={t("expenses.topCategory")}
        value={topCategory || "—"}
        icon={<Tag size={26} />}
        color="primary"
      />

      <AppStatCard
        title={t("expenses.totalTransactions")}
        value={totalTransactions || 0}
        icon={<Receipt size={26} />}
        color="info"
      />

      <AppStatCard
        title={t("expenses.averageExpense")}
        value={`${formatMoney(averageExpense)} EGP`}
        icon={<Calculator size={26} />}
        color="warning"
      />
    </AppStatsGrid>
  );
}
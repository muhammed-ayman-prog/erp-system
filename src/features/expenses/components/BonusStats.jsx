import {
  Gift,
  Users,
  FileText,
} from "lucide-react";

import AppStatCard from "../../../components/ui/AppStatCard";
import AppStatsGrid from "../../../components/ui/AppStatsGrid";
import { useTranslate } from "../../../useTranslate";

export default function BonusStats({
  employeeBonuses,
  formatMoney,
}) {
  const { t } = useTranslate();

  const totalBonuses =
    employeeBonuses.reduce(
      (sum, bonus) =>
        sum + (bonus.amount || 0),
      0
    );

  const totalTransactions =
    employeeBonuses.length;

  const totalEmployees =
    new Set(
      employeeBonuses.map(
        (bonus) => bonus.employeeName
      )
    ).size;

  return (
    <AppStatsGrid>
      <AppStatCard
        title={t("expenses.totalBonuses")}
        value={`${formatMoney(totalBonuses)} EGP`}
        icon={<Gift size={28} />}
        color="success"
      />

      <AppStatCard
        title={t("expenses.totalEmployees")}
        value={totalEmployees}
        icon={<Users size={28} />}
        color="primary"
      />

      <AppStatCard
        title={t("expenses.totalTransactions")}
        value={totalTransactions}
        icon={<FileText size={28} />}
        color="warning"
      />
    </AppStatsGrid>
  );
}
import {
  HandCoins,
  Users,
  FileText,
} from "lucide-react";

import AppStatCard from "../../../components/ui/AppStatCard";
import AppStatsGrid from "../../../components/ui/AppStatsGrid";
import { useTranslate } from "../../../useTranslate";

export default function LoanStats({
  employeeLoans,
  formatMoney,
}) {
  const { t } = useTranslate();

  const totalLoans = employeeLoans.reduce(
    (sum, loan) => sum + (loan.amount || 0),
    0
  );

  const totalTransactions =
    employeeLoans.length;

  const totalEmployees =
    new Set(
      employeeLoans.map(
        (loan) => loan.employeeName
      )
    ).size;

  return (
    <AppStatsGrid>
      <AppStatCard
        title={t("expenses.totalLoans")}
        value={`${formatMoney(totalLoans)} EGP`}
        icon={<HandCoins size={28} />}
        color="info"
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
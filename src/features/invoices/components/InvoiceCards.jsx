import {
  DollarSign,
  Banknote,
  CreditCard,
  Smartphone,
} from "lucide-react";

import AppStatCard from "../../../components/ui/AppStatCard";
import AppStatsGrid from "../../../components/ui/AppStatsGrid";

export default function InvoiceCards({
  totals,
  t,
}) {
  return (
    <AppStatsGrid>
      <AppStatCard
        title={t("cart.total")}
        value={`${Number(
          totals.total || 0
        ).toLocaleString()} EGP`}
        icon={<DollarSign size={28} />}
        color="success"
      />

      <AppStatCard
        title={t("common.cash")}
        value={`${Number(
          totals.cash || 0
        ).toLocaleString()} EGP`}
        icon={<Banknote size={28} />}
        color="primary"
      />

      <AppStatCard
        title={t("common.visa")}
        value={`${Number(
          totals.visa || 0
        ).toLocaleString()} EGP`}
        icon={<CreditCard size={28} />}
        color="warning"
      />

      <AppStatCard
        title={t("common.instapay")}
        value={`${Number(
          totals.instapay || 0
        ).toLocaleString()} EGP`}
        icon={<Smartphone size={28} />}
        color="purple"
      />
    </AppStatsGrid>
  );
}
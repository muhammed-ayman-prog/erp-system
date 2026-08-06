import {
  DollarSign,
  Banknote,
  CreditCard,
  Smartphone,
  RotateCcw,
  Gem,
} from "lucide-react";

import AppStatCard from "../../../components/ui/AppStatCard";
import AppStatsGrid from "../../../components/ui/AppStatsGrid";

import InvoiceStatsSection from "./InvoiceStatsSection";

export default function InvoiceCards({
  totals,
  t,
}) {
  return (
    <>
      {/* ================= SALES ================= */}

      <InvoiceStatsSection
        title={`💰 ${t("sales.totalSales")}`}
      >
        <AppStatsGrid>
          <AppStatCard
            title={t("sales.totalSales")}
            value={`${Number(
              totals.salesTotal || 0
            ).toLocaleString()} EGP`}
            icon={<DollarSign size={28} />}
            color="success"
          />

          <AppStatCard
            title={t("common.cash")}
            value={`${Number(
              totals.cashSales || 0
            ).toLocaleString()} EGP`}
            icon={<Banknote size={28} />}
            color="primary"
          />

          <AppStatCard
            title={t("common.visa")}
            value={`${Number(
              totals.visaSales || 0
            ).toLocaleString()} EGP`}
            icon={<CreditCard size={28} />}
            color="warning"
          />

          <AppStatCard
            title={t("common.instapay")}
            value={`${Number(
              totals.instapaySales || 0
            ).toLocaleString()} EGP`}
            icon={<Smartphone size={28} />}
            color="purple"
          />
        </AppStatsGrid>
      </InvoiceStatsSection>

      {/* ================= REFUNDS ================= */}

      <InvoiceStatsSection
        title={`↩️ ${t("returns.totalRefunds")}`}
      >
        <AppStatsGrid>
          <AppStatCard
            title={t("returns.totalRefunds")}
            value={`${Number(
              totals.refundTotal || 0
            ).toLocaleString()} EGP`}
            icon={<RotateCcw size={28} />}
            color="danger"
          />

          <AppStatCard
            title={t("returns.cashRefunds")}
            value={`${Number(
              totals.refundCash || 0
            ).toLocaleString()} EGP`}
            icon={<Banknote size={28} />}
            color="primary"
          />

          <AppStatCard
            title={t("returns.visaRefunds")}
            value={`${Number(
              totals.refundVisa || 0
            ).toLocaleString()} EGP`}
            icon={<CreditCard size={28} />}
            color="warning"
          />

          <AppStatCard
            title={t("returns.instapayRefunds")}
            value={`${Number(
              totals.refundInstapay || 0
            ).toLocaleString()} EGP`}
            icon={<Smartphone size={28} />}
            color="purple"
          />
        </AppStatsGrid>
      </InvoiceStatsSection>

      {/* ================= NET ================= */}

      <InvoiceStatsSection
        title={`💎 ${t("reports.netRevenue")}`}
      >
        <AppStatsGrid>
          <AppStatCard
            title={t("reports.netRevenue")}
            value={`${Number(
              totals.netRevenue || 0
            ).toLocaleString()} EGP`}
            icon={<Gem size={28} />}
            color="info"
          />
        </AppStatsGrid>
      </InvoiceStatsSection>
    </>
  );
}
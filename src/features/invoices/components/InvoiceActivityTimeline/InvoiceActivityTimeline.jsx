import AppCard from "../../../../components/ui/AppCard";

import ReturnActivityCard from "./ReturnActivityCard";
import CancelActivityCard from "./CancelActivityCard";

export default function InvoiceActivityTimeline({
  previousReturns,
  groupedReturns,
  selectedInvoice,
  formatDateTime,
  theme,
  t,
}) {
  const hasActivity =
    previousReturns.length > 0 ||
    selectedInvoice?.status === "cancelled";

  if (!hasActivity) {
    return null;
  }

  return (
    <AppCard
      style={{
        marginTop: theme.spacing.lg,
        background: theme.colors.warningSoft,
        borderColor: theme.colors.warning,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: theme.colors.warning,
          marginBottom: theme.spacing.lg,
          fontSize: 15,
        }}
      >
        📜 {t("invoices.activityHistory")}
      </div>

      {groupedReturns.map((group, index) => (
        <ReturnActivityCard
          key={group.returnId}
          group={group}
          index={index}
          formatDateTime={formatDateTime}
          theme={theme}
          t={t}
        />
      ))}

      {selectedInvoice?.status === "cancelled" && (
        <CancelActivityCard
          selectedInvoice={selectedInvoice}
          formatDateTime={formatDateTime}
          theme={theme}
          t={t}
        />
      )}
    </AppCard>
  );
}
import {
  Ban,
  User,
  CalendarDays,
  FileText,
} from "lucide-react";

import AppCard from "../../../../components/ui/AppCard";
import AppBadge from "../../../../components/ui/AppBadge";

export default function CancelActivityCard({
  selectedInvoice,
  formatDateTime,
  theme,
  t,
}) {
  return (
    <AppCard
      bordered
      style={{
        borderColor: theme.colors.danger,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        }}
      >
        <AppBadge
          variant="danger"
          icon={<Ban size={14} />}
        >
          {t("invoices.cancelled")}
        </AppBadge>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: theme.colors.textSecondary,
            fontSize: 12,
          }}
        >
          <CalendarDays size={14} />

          {formatDateTime(
            selectedInvoice.cancelledAt
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.md,
        }}
      >
        <User size={14} />

        {selectedInvoice.cancelledByName || "-"}
      </div>

      {selectedInvoice.cancelReason && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            color: theme.colors.text,
          }}
        >
          <FileText
            size={16}
            color={theme.colors.danger}
          />

          <span>
            {selectedInvoice.cancelReason}
          </span>
        </div>
      )}
    </AppCard>
  );
}
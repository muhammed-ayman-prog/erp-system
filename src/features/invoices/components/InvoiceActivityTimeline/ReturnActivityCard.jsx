import {
  RefreshCcw,
  User,
  CalendarDays,
} from "lucide-react";

import AppCard from "../../../../components/ui/AppCard";
import ReturnActivityItem from "./ReturnActivityItem";

export default function ReturnActivityCard({
  group,
  index,
  formatDateTime,
  theme,
  t,
}) {
  return (
    <AppCard
      style={{
        marginBottom: theme.spacing.lg,
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            fontWeight: 700,
            color: theme.colors.warning,
          }}
        >
          <RefreshCcw size={16} />

          {t("invoices.refund")} #{index + 1}
        </div>

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

          {formatDateTime(group.refundDate)}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: theme.colors.textSecondary,
          fontSize: 13,
          marginBottom: theme.spacing.md,
        }}
      >
        <User size={14} />

        {group.performedByName || "-"}
      </div>

      {group.items.map((item, i) => (
        <ReturnActivityItem
          key={i}
          item={item}
          theme={theme}
          t={t}
        />
      ))}
    </AppCard>
  );
}
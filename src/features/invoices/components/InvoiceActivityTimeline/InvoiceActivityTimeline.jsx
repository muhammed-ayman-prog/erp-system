
import { useState } from "react";
import { ChevronDown, History } from "lucide-react";

import ReturnActivityCard from "./ReturnActivityCard";
import CancelActivityCard from "./CancelActivityCard";

export default function InvoiceActivityTimeline({
  previousReturns = [],
  groupedReturns = [],
  selectedInvoice,
  formatDateTime,
  theme,
  t,
}) {
  const [expanded, setExpanded] = useState(false);

  const isCancelled = selectedInvoice?.status === "cancelled";

  const hasActivity =
    previousReturns.length > 0 ||
    groupedReturns.length > 0 ||
    isCancelled;

  if (!hasActivity) {
    return null;
  }

  const activityCount =
    (groupedReturns.length || previousReturns.length) +
    (isCancelled ? 1 : 0);

  return (
    <div
      style={{
        marginTop: theme.spacing.md,
        border: `1px solid ${theme.colors.border}`,
        borderInlineStart: `3px solid ${theme.colors.warning}`,
        borderRadius: theme.radius.lg,
        background: theme.colors.card,
        overflow: "hidden",
      }}
    >
      {/* Compact Header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          border: 0,
          background: "transparent",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "start",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              minWidth: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              background: theme.colors.warningSoft,
              color: theme.colors.warning,
            }}
          >
            <History size={17} />
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: theme.colors.text,
              }}
            >
              {t("invoices.activityHistory")}
            </div>

            <div
              style={{
                fontSize: 11,
                color: theme.colors.textSecondary,
                marginTop: 3,
              }}
            >
              {langText(activityCount, t)}
            </div>
          </div>
        </div>

        <ChevronDown
          size={18}
          color={theme.colors.textSecondary}
          style={{
            flexShrink: 0,
            transform: expanded
              ? "rotate(180deg)"
              : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {/* Activity Content */}
      {expanded && (
        <div
          style={{
            padding: "0 12px 12px",
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          {groupedReturns.map((group, index) => (
            <ReturnActivityCard
              key={group.returnId || index}
              group={group}
              index={index}
              formatDateTime={formatDateTime}
              theme={theme}
              t={t}
            />
          ))}

          {isCancelled && (
            <CancelActivityCard
              selectedInvoice={selectedInvoice}
              formatDateTime={formatDateTime}
              theme={theme}
              t={t}
            />
          )}
        </div>
      )}
    </div>
  );
}

function langText(count, t) {
  return `${count} ${count === 1 ? "عملية" : "عمليات"}`;
}

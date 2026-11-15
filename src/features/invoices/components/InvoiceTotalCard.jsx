
import { theme } from "../../../theme";

export default function InvoiceTotalCard({
  selectedInvoice,
  netTotal,
  lang = "ar",
}) {
  const originalTotal = Number(
    selectedInvoice?.total ??
    selectedInvoice?.newTotal ??
    0
  );

  const refundedAmount = Number(
    selectedInvoice?.refundedAmount ??
    Math.max(0, originalTotal - Number(netTotal || 0))
  );

  const formatMoney = (amount) =>
    `${Number(amount || 0).toLocaleString(
      lang === "ar" ? "ar-EG" : "en-US"
    )} ${lang === "ar" ? "ج.م" : "EGP"}`;

  const items = [
    {
      label: lang === "ar" ? "إجمالي الفاتورة" : "Invoice Total",
      value: originalTotal,
      color: theme.colors.text,
    },
    {
      label: lang === "ar" ? "المبلغ المسترد" : "Refunded",
      value: refundedAmount,
      color: "#DC2626",
    },
    {
      label: lang === "ar" ? "صافي الفاتورة" : "Net Total",
      value: netTotal,
      color: theme.colors.success,
      highlight: true,
    },
  ];

  return (
    <div
      style={{
        margin: `${theme.spacing.md} 0`,
        padding: "14px 16px",
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.cardSoft,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: theme.colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {lang === "ar" ? "الملخص المالي" : "Financial Summary"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              minWidth: 0,
              padding: item.highlight ? "9px 7px" : "4px",
              borderRadius: 9,
              background: item.highlight
                ? theme.colors.background
                : "transparent",
              border: item.highlight
                ? `1px solid ${theme.colors.border}`
                : "1px solid transparent",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: theme.colors.textSecondary,
                marginBottom: 6,
                lineHeight: 1.5,
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: item.highlight ? 17 : 14,
                fontWeight: 800,
                color: item.color,
                lineHeight: 1.4,
                overflowWrap: "anywhere",
              }}
            >
              {formatMoney(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

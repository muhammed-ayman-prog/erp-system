
import { theme } from "../../../theme";

export default function InvoiceTotalCard({
  selectedInvoice,
  netTotal,
  lang = "ar",
}) {
  // إجمالي الفاتورة بعد الخصم
  const finalTotal = Number(
    selectedInvoice?.total ??
    selectedInvoice?.newTotal ??
    0
  );

  // إجمالي المنتجات قبل الخصم
  // الفواتير القديمة التي لا تحتوي على subtotal تستخدم total
  const subtotal = Number(
    selectedInvoice?.subtotal ?? finalTotal
  );

  // قيمة الخصم
  const discount = Math.max(
    0,
    Number(selectedInvoice?.discount) || 0
  );

  const refundedAmount = Number(
    selectedInvoice?.refundedAmount ??
    Math.max(0, finalTotal - Number(netTotal || 0))
  );

  const formatMoney = (amount) =>
    `${Number(amount || 0).toLocaleString(
      lang === "ar" ? "ar-EG" : "en-US"
    )} ${lang === "ar" ? "ج.م" : "EGP"}`;

  const isArabic = lang === "ar";

  const items = [
    {
      label: isArabic ? "الإجمالي قبل الخصم" : "Subtotal",
      value: subtotal,
      color: theme.colors.text,
    },
    ...(discount > 0
      ? [
          {
            label: isArabic ? "قيمة الخصم" : "Discount",
            value: -discount,
            color: theme.colors.success,
          },
        ]
      : []),
    {
      label: isArabic ? "الإجمالي بعد الخصم" : "Total After Discount",
      value: finalTotal,
      color: theme.colors.text,
    },
    {
      label: isArabic ? "المبلغ المسترد" : "Refunded",
      value: refundedAmount,
      color: "#DC2626",
    },
    {
      label: isArabic ? "صافي الفاتورة" : "Net Total",
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
        {isArabic ? "الملخص المالي" : "Financial Summary"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
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

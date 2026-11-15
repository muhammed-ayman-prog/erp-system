
import {
  UserRound,
  Store,
  CreditCard,
  UserCog,
} from "lucide-react";

import { theme } from "../../../theme";

export default function InvoiceInfoCards({
  selectedInvoice,
  t,
  lang,
  branchName,
  branchNameMap,
}) {
  const paymentMethod = (
    selectedInvoice.paymentMethod || "cash"
  ).toLowerCase();

  const paymentRows = Array.isArray(selectedInvoice.payments)
    ? selectedInvoice.payments.filter(
        (payment) =>
          payment?.method &&
          Number(payment.amount) > 0
      )
    : [];

  const isSplitPayment =
    paymentMethod === "mixed" || paymentRows.length > 1;

  const paymentLabel = (method) => {
    const labels = {
      cash: lang === "ar" ? "كاش" : "Cash",
      visa: lang === "ar" ? "فيزا" : "Visa",
      instapay: lang === "ar" ? "إنستاباي" : "InstaPay",
    };

    return (
      labels[method?.toLowerCase()] || method
    );
  };

  const formatPaymentAmount = (amount) =>
    `${Number(amount || 0).toLocaleString(
      lang === "ar" ? "ar-EG" : "en-US"
    )} ${lang === "ar" ? "ج.م" : "EGP"}`;

  const cards = [
    {
      icon: <UserRound size={17} />,
      title: t("customers.customer"),
      value:
        selectedInvoice.customerName ||
        (lang === "ar" ? "عميل نقدي" : "Walk In"),
      sub:
        selectedInvoice.customerPhone ||
        (lang === "ar" ? "بدون رقم" : "No Phone"),
      color: theme.colors.primary,
    },
    {
      icon: <UserCog size={17} />,
      title: t("invoices.salesName"),
      value:
        selectedInvoice.items?.find(
          (item) => item.employeeName
        )?.employeeName ||
        selectedInvoice.employeeName ||
        "-",
      sub: selectedInvoice.enteredBy || "-",
      color: theme.colors.info || theme.colors.primary,
    },
    {
      icon: <Store size={17} />,
      title: t("branches.title"),
      value: branchNameMap?.[branchName]
        ? t(`branchNames.${branchNameMap[branchName]}`)
        : branchName || "-",
      color: theme.colors.warning || theme.colors.primary,
    },
    {
      icon: <CreditCard size={17} />,
      title: t("payment.method"),
      value: isSplitPayment
        ? lang === "ar"
          ? "دفع مقسّم"
          : "Split Payment"
        : t(`common.${paymentMethod}`),
      color: theme.colors.primary,
      isPayment: true,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(100%, 145px), 1fr))",
        gap: 8,
        marginBottom: theme.spacing.md,
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            minWidth: 0,
            padding: "10px 11px",
            borderRadius: theme.radius.lg,
            background: theme.colors.cardSoft,
            border: `1px solid ${theme.colors.border}`,
            gridColumn:
              card.isPayment && isSplitPayment
                ? "1 / -1"
                : undefined,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              minWidth: 32,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.colors.background,
              color: card.color,
            }}
          >
            {card.icon}
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: theme.colors.textSecondary,
                marginBottom: 3,
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: theme.colors.text,
                overflowWrap: "anywhere",
                lineHeight: 1.5,
              }}
            >
              {card.value}
            </div>

            {card.sub && (
              <div
                style={{
                  fontSize: 10,
                  color: theme.colors.textSecondary,
                  marginTop: 2,
                  overflowWrap: "anywhere",
                }}
              >
                {card.sub}
              </div>
            )}

            {card.isPayment &&
              isSplitPayment && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 7,
                  }}
                >
                  {paymentRows.length > 0 ? (
                    paymentRows.map((payment, i) => (
                      <span
                        key={`${payment.method}-${i}`}
                        style={{
                          fontSize: 11,
                          padding: "4px 7px",
                          borderRadius: 6,
                          background: theme.colors.background,
                          color: theme.colors.text,
                        }}
                      >
                        {paymentLabel(payment.method)}
                        {" · "}
                        {formatPaymentAmount(payment.amount)}
                      </span>
                    ))
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {lang === "ar"
                        ? "تفاصيل الدفع غير متاحة"
                        : "Payment details unavailable"}
                    </span>
                  )}
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}

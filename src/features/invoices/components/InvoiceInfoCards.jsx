import {
  UserRound,
  Phone,
  Store,
  CreditCard,
  BadgeCheck,
  ShoppingBag,
  UserCog,
  Monitor,
} from "lucide-react";

export default function InvoiceInfoCards({
  selectedInvoice,
  theme,
  t,
  lang,
  branchName,
  branchNameMap,
}) {
  const cards = [
    {
      icon: <UserRound size={18} color={theme.colors.primary} />,
      title: t("customers.customer"),
      value:
        selectedInvoice.customerName ||
        (lang === "ar" ? "عميل نقدي" : "Walk In"),
      sub:
        selectedInvoice.customerPhone ||
        (lang === "ar" ? "بدون رقم" : "No Phone"),
    },

    {
      icon: <UserCog size={18} color={theme.colors.primary} />,
      title: t("invoices.salesName"),
      value:
        selectedInvoice.items?.find(i => i.employeeName)?.employeeName ||
        selectedInvoice.employeeName ||
        "-",
      sub:
        selectedInvoice.enteredBy ||
        "-",
    },

    {
      icon: <Store size={18} color={theme.colors.primary} />,
      title: t("branches.title"),
      value:
        branchNameMap?.[branchName]
          ? t(`branchNames.${branchNameMap[branchName]}`)
          : branchName,
      sub: "",
    },

    {
      icon: <CreditCard size={18} color={theme.colors.primary} />,
      title: t("payment.method"),
      value: t(
        `common.${(
          selectedInvoice.paymentMethod || "cash"
        ).toLowerCase()}`
      ),
      sub: "",
    },

    {
      icon: <ShoppingBag size={18} color={theme.colors.primary} />,
      title: t("invoices.saleType"),
      value:
        selectedInvoice.saleType === "RETURN_RESALE"
          ? t("invoices.returnResale")
          : selectedInvoice.saleType === "MIXED"
          ? t("invoices.mixed")
          : t("invoices.sale"),
      sub: "",
    },

    {
      icon: <BadgeCheck size={18} color="#22c55e" />,
      title: t("common.status"),
      value:
        selectedInvoice.status === "cancelled"
          ? t("invoices.cancelled")
          : t("invoices.completed"),
      sub: "",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: 14,
        marginTop: 18,
        marginBottom: 18,
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 16,
            padding: 16,
            transition: ".2s",
            boxShadow:
              "0 2px 10px rgba(0,0,0,.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {card.icon}

            <span
              style={{
                fontSize: 12,
                color:
                  theme.colors.textSecondary,
                fontWeight: 600,
              }}
            >
              {card.title}
            </span>
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {card.value}
          </div>

          {card.sub && (
            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                color:
                  theme.colors.textSecondary,
              }}
            >
              {card.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
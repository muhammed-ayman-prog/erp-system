import {
  UserRound,
  Store,
  CreditCard,
  BadgeCheck,
  ShoppingBag,
  UserCog,
} from "lucide-react";

import AppCard from "../../../components/ui/AppCard";
import { theme } from "../../../theme";

export default function InvoiceInfoCards({
  selectedInvoice,
  t,
  lang,
  branchName,
  branchNameMap,
}) {
  const cards = [
    {
      icon: <UserRound size={20} />,
      title: t("customers.customer"),
      value:
        selectedInvoice.customerName ||
        (lang === "ar"
          ? "عميل نقدي"
          : "Walk In"),
      sub:
        selectedInvoice.customerPhone ||
        (lang === "ar"
          ? "بدون رقم"
          : "No Phone"),
      color: "primary",
    },

    {
      icon: <UserCog size={20} />,
      title: t("invoices.salesName"),
      value:
        selectedInvoice.items?.find(
          (i) => i.employeeName
        )?.employeeName ||
        selectedInvoice.employeeName ||
        "-",
      sub:
        selectedInvoice.enteredBy || "-",
      color: "info",
    },

    {
      icon: <Store size={20} />,
      title: t("branches.title"),
      value: branchNameMap?.[branchName]
        ? t(
            `branchNames.${branchNameMap[branchName]}`
          )
        : branchName,
      color: "warning",
    },

    {
      icon: <CreditCard size={20} />,
      title: t("payment.method"),
      value: t(
        `common.${(
          selectedInvoice.paymentMethod ||
          "cash"
        ).toLowerCase()}`
      ),
      color: "purple",
    },

    {
      icon: <ShoppingBag size={20} />,
      title: t("invoices.saleType"),
      value:
        selectedInvoice.saleType ===
        "RETURN_RESALE"
          ? t("invoices.returnResale")
          : selectedInvoice.saleType ===
            "MIXED"
          ? t("invoices.mixed")
          : t("invoices.sale"),
      color: "primary",
    },

    {
      icon: <BadgeCheck size={20} />,
      title: t("common.status"),
      value:
        selectedInvoice.status ===
        "cancelled"
          ? t("invoices.cancelled")
          : t("invoices.completed"),
      color:
        selectedInvoice.status ===
        "cancelled"
          ? "danger"
          : "success",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(240px,1fr))",
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
      }}
    >
      {cards.map((card, index) => {
        const color =
          theme.colors[card.color] ||
          theme.colors.primary;

        const soft =
          theme.colors[
            `${card.color}Soft`
          ] || theme.colors.primarySoft;

        return (
          <AppCard
            key={index}
            hover
            padding="lg"
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: theme.spacing.md,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,

                  borderRadius:
                    theme.radius.full,

                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",

                  background: soft,

                  color,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color:
                      theme.colors
                        .textSecondary,
                    marginBottom: 6,
                  }}
                >
                  {card.title}
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color:
                      theme.colors.text,
                    wordBreak:
                      "break-word",
                  }}
                >
                  {card.value}
                </div>

                {card.sub && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color:
                        theme.colors
                          .textSecondary,
                    }}
                  >
                    {card.sub}
                  </div>
                )}
              </div>
            </div>
          </AppCard>
        );
      })}
    </div>
  );
}
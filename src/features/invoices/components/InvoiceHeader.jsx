import {
  Receipt,
  CalendarDays,
  Clock3,
  MoreVertical,
} from "lucide-react";

import AppButton from "../../../components/ui/AppButton";
import AppCard from "../../../components/ui/AppCard";
import { theme } from "../../../theme";

export default function InvoiceHeader(props) {
  const {
    selectedInvoice,
    formatDateTime,
    isMobile,
    t,
    setDropdownOpen,
  } = props;

  const infoCard = (
    icon,
    label,
    value
  ) => (
    <AppCard
      padding="md"
      style={{
        background:
          theme.colors.cardSoft,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,

            borderRadius:
              theme.radius.full,

            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",

            background:
              theme.colors.primarySoft,

            color:
              theme.colors.primary,

            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              color:
                theme.colors
                  .textSecondary,
              fontWeight: 600,
            }}
          >
            {label}
          </div>

          <div
            style={{
              marginTop: 3,
              fontWeight: 700,
              color:
                theme.colors.text,
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </AppCard>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: isMobile
          ? "stretch"
          : "flex-start",
        flexDirection: isMobile
          ? "column"
          : "row",
        gap: theme.spacing.xl,
        marginBottom:
          theme.spacing.xl,
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,

            color:
              theme.colors
                .textSecondary,

            fontSize: 13,

            fontWeight: 600,
          }}
        >
          <Receipt size={16} />

          {t("invoices.invoice")}
        </div>

        <div
          style={{
            marginTop:
              theme.spacing.sm,

            fontSize: isMobile
              ? 30
              : 38,

            fontWeight: 800,

            color:
              theme.colors.text,
          }}
        >
          #
          {
            selectedInvoice.invoiceNumber
          }
        </div>

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              isMobile
                ? "1fr"
                : "repeat(2,1fr)",

            gap: theme.spacing.md,

            marginTop:
              theme.spacing.xl,
          }}
        >
          {infoCard(
            <CalendarDays size={18} />,
            t("invoices.saleDate"),
            formatDateTime(
              selectedInvoice.saleDate ||
                selectedInvoice.createdAt
            )
          )}

          {infoCard(
            <Clock3 size={18} />,
            t("invoices.createdAt"),
            formatDateTime(
              selectedInvoice.createdAt
            )
          )}
        </div>
      </div>

      <div
        className="no-print"
        style={{
          alignSelf: isMobile
            ? "stretch"
            : "flex-start",
        }}
      >
        <AppButton
          leftIcon={
            <MoreVertical size={16} />
          }
          onClick={(e) => {
            e.stopPropagation();

            setDropdownOpen(
              (prev) => !prev
            );
          }}
          fullWidth={isMobile}
        >
          {t("common.actions")}
        </AppButton>
      </div>
    </div>
  );
}
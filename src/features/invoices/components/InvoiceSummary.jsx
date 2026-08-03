import AppCard from "../../../components/ui/AppCard";
import AppBadge from "../../../components/ui/AppBadge";

import InvoiceItemsTable from "./InvoiceItemsTable";
import InvoiceInfoCards from "./InvoiceInfoCards";
import InvoiceTotalCard from "./InvoiceTotalCard";

export default function InvoiceSummary(props) {
  const {
    selectedInvoice,
    branchName,
    branchNameMap,
    theme,
    t,
    lang,
    isFullyRefunded,
    netTotal,
    getKey,
  } = props;

  const refunded =
    selectedInvoice.refundedQty || 0;

  const refundedMl =
    selectedInvoice.refundedMl || 0;

  const totalProducts =
    selectedInvoice.items
      ?.filter(
        i =>
          (i.containerType || "")
            .toLowerCase() !== "oil"
      )
      .reduce(
        (sum, i) => sum + i.qty,
        0
      ) || 0;

  const totalMl =
    selectedInvoice.items
      ?.filter(
        i =>
          (i.containerType || "")
            .toLowerCase() === "oil"
      )
      .reduce(
        (sum, i) =>
          sum + (i.oilQty * i.qty),
        0
      ) || 0;

  const fullyRefunded =
    isFullyRefunded(
      refunded,
      refundedMl,
      totalProducts,
      totalMl
    );

  const saleTypeVariant =
    selectedInvoice.saleType === "RETURN_RESALE"
      ? "warning"
      : selectedInvoice.saleType === "MIXED"
      ? "purple"
      : "success";

  const saleTypeText =
    selectedInvoice.saleType === "RETURN_RESALE"
      ? t("invoices.returnResale")
      : selectedInvoice.saleType === "MIXED"
      ? t("invoices.mixed")
      : t("invoices.sale");

  let statusVariant = "success";
  let statusText = t("invoices.completed");

  if (selectedInvoice.status === "cancelled") {
    statusVariant = "gray";
    statusText = t("invoices.cancelled");
  } else if (fullyRefunded) {
    statusVariant = "danger";
    statusText = t("invoices.refunded");
  } else if (refunded > 0 || refundedMl > 0) {
    statusVariant = "warning";
    statusText = t("invoices.partialRefunded");
  }

  return (
    <AppCard
      padding="lg"
      style={{
        marginTop: theme.spacing.md,
        background: theme.colors.cardSoft,
      }}
    >
      <InvoiceInfoCards
        selectedInvoice={selectedInvoice}
        theme={theme}
        t={t}
        lang={lang}
        branchName={branchName}
        branchNameMap={branchNameMap}
      />

      <div
        style={{
          display: "flex",
          gap: theme.spacing.sm,
          flexWrap: "wrap",
          marginBottom: theme.spacing.xl,
        }}
      >
        <AppBadge variant={saleTypeVariant}>
          {saleTypeText}
        </AppBadge>

        <AppBadge variant={statusVariant}>
          {statusText}
        </AppBadge>
      </div>

      <InvoiceTotalCard
        netTotal={netTotal}
        theme={theme}
      />

      <InvoiceItemsTable
        selectedInvoice={selectedInvoice}
        theme={theme}
        t={t}
        lang={lang}
        getKey={getKey}
      />
    </AppCard>
  );
}
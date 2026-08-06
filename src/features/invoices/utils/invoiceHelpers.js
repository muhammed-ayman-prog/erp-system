export const getKey = (item) =>
  `${item.productId || item.id}_${
    (item.containerType || item.container || "")
      .toLowerCase()
      .trim()
  }_${item.size}`;

export const isFullyRefunded = (
  refundedQty,
  refundedMl,
  totalProducts,
  totalMl
) => {
  const productsDone =
    totalProducts === 0 ||
    refundedQty >= totalProducts;

  const oilsDone =
    totalMl === 0 ||
    refundedMl >= totalMl;

  return productsDone && oilsDone;
};

export const getInvoiceStatus = (
  invoice,
  t
) => {
  const refundedQty =
    invoice.refundedQty || 0;

  const refundedMl =
    invoice.refundedMl || 0;

  const totalProducts =
    invoice.items
      ?.filter(
        (i) =>
          (i.containerType || "")
            .toLowerCase() !== "oil"
      )
      .reduce(
        (sum, i) => sum + i.qty,
        0
      ) || 0;

  const totalMl =
    invoice.items
      ?.filter(
        (i) =>
          (i.containerType || "")
            .toLowerCase() === "oil"
      )
      .reduce(
  (sum, i) =>
    sum +
    (
      i.selectedMl ??
      ((i.oilQty || 0) * (i.qty || 0))
    ),
  0
) || 0;

  const fullyRefunded =
    isFullyRefunded(
      refundedQty,
      refundedMl,
      totalProducts,
      totalMl
    );

  if (invoice.status === "cancelled") {
    return {
      color: "gray",
      text: t("invoices.cancelled"),
      refundedQty,
      refundedMl,
      fullyRefunded,
    };
  }

  if (fullyRefunded) {
    return {
      color: "danger",
      text: t("invoices.refunded"),
      refundedQty,
      refundedMl,
      fullyRefunded,
    };
  }

  if (
    refundedQty > 0 ||
    refundedMl > 0
  ) {
    return {
      color: "warning",
      text: t(
        "invoices.partialRefunded"
      ),
      refundedQty,
      refundedMl,
      fullyRefunded,
    };
  }

  return {
    color: "success",
    text: t("invoices.completed"),
    refundedQty,
    refundedMl,
    fullyRefunded,
  };
};

export const getSaleType = (
  invoice,
  t
) => {
  switch (invoice.saleType) {
    case "RETURN_RESALE":
      return {
        color: "warning",
        text: t(
          "invoices.returnResale"
        ),
      };

    case "MIXED":
      return {
        color: "purple",
        text: t("invoices.mixed"),
      };

    default:
      return {
        color: "success",
        text: t("invoices.sale"),
      };
  }
};

export const formatDate = (value) => {
  if (!value?.seconds) return "-";

  return new Date(
    value.seconds * 1000
  ).toLocaleDateString();
};

export const formatDateTime = (
  value
) => {
  if (!value?.seconds) return "-";

  return new Date(
    value.seconds * 1000
  ).toLocaleString();
};
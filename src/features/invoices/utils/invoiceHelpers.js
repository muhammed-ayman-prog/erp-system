// ======================================
// OIL COMPOSITION KEY
// ======================================

const getOilCompositionKey = (item) => {
  const containerType = (
    item.containerType ||
    item.container ||
    ""
  )
    .toLowerCase()
    .trim();

  // بيع الزيت الخام له مسار منفصل
  if (containerType === "oil") {
    return "";
  }

  // الخلطات الجديدة
  // أو الفواتير القديمة ذات الزيت الواحد
  const components =
    Array.isArray(item.oilComponents) &&
    item.oilComponents.length > 0
      ? item.oilComponents
      : (() => {
          const oilQty = Number(
            item.oilQty ??
            item.oilQtyML ??
            item.originalOilQty ??
            0
          );

          const oilId =
            item.oilId ||
            item.id ||
            item.productId;

          return oilId && oilQty > 0
            ? [
                {
                  oilId,
                  quantityML: oilQty
                }
              ]
            : [];
        })();

  return components
    .map((component) => {
      const oilId =
        component.oilId ||
        component.id ||
        component.productId ||
        "";

      const quantity = Number(
        component.quantityML ??
        component.oilQty ??
        0
      );

      return {
        oilId: String(oilId).trim(),
        quantity
      };
    })
    .filter(
      component =>
        component.oilId &&
        Number.isFinite(component.quantity) &&
        component.quantity > 0
    )
    .map(
      component =>
        `${component.oilId}:${component.quantity}`
    )
    .sort()
    .join("|");
};


// ======================================
// GET ITEM KEY
// ======================================

export const getKey = (item) => {
  const baseKey = [
    item.productId || item.id || "",

    (
      item.containerType ||
      item.container ||
      ""
    )
      .toLowerCase()
      .trim(),

    item.size || ""
  ].join("_");

  const compositionKey =
    getOilCompositionKey(item);

  return `${baseKey}_${compositionKey}`;
};


// ======================================
// CHECK FULL REFUND
// ======================================

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


// ======================================
// GET INVOICE STATUS
// ======================================

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
      fullyRefunded
    };
  }

  if (fullyRefunded) {
    return {
      color: "danger",
      text: t("invoices.refunded"),
      refundedQty,
      refundedMl,
      fullyRefunded
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
      fullyRefunded
    };
  }

  return {
    color: "success",
    text: t("invoices.completed"),
    refundedQty,
    refundedMl,
    fullyRefunded
  };
};


// ======================================
// GET SALE TYPE
// ======================================

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
        )
      };

    case "MIXED":
      return {
        color: "purple",
        text: t("invoices.mixed")
      };

    default:
      return {
        color: "success",
        text: t("invoices.sale")
      };
  }
};


// ======================================
// FORMAT DATE
// ======================================

export const formatDate = (value) => {
  if (!value?.seconds) return "-";

  return new Date(
    value.seconds * 1000
  ).toLocaleDateString();
};


// ======================================
// FORMAT DATE TIME
// ======================================

export const formatDateTime = (
  value
) => {
  if (!value?.seconds) return "-";

  return new Date(
    value.seconds * 1000
  ).toLocaleString();
};
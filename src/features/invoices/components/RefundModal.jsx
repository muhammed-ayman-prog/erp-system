import { createPortal } from "react-dom";
import toast from "react-hot-toast";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

// Keep these calculations aligned with services/handlePartialRefund.
function getInvoiceGrossTotal(invoice) {
  const explicitSubtotal = [
    invoice?.subtotal,
    invoice?.subTotal,
    invoice?.itemsSubtotal,
    invoice?.totalBeforeDiscount,
    invoice?.grossTotal,
  ]
    .map(toNumber)
    .find((value) => value > 0);

  if (explicitSubtotal !== undefined) return roundMoney(explicitSubtotal);

  return roundMoney(
    (invoice?.items || []).reduce((sum, item) => {
      const isOil = (item?.containerType || "").toLowerCase() === "oil";
      const lineTotal =
        toNumber(item?.price) * (isOil ? 1 : toNumber(item?.qty));
      return sum + lineTotal;
    }, 0)
  );
}

function getInvoiceDiscount(invoice, grossTotal) {
  const discountType = String(
    invoice?.discountType || invoice?.discount?.type || ""
  ).toLowerCase();
  const isPercentage =
    discountType.includes("percent") || discountType.includes("نسبة");
  const discountObject =
    invoice?.discount && typeof invoice.discount === "object"
      ? invoice.discount
      : null;

  const percentageValue = [
    invoice?.discountPercentage,
    invoice?.discountPercent,
    isPercentage ? invoice?.discountValue : undefined,
    isPercentage ? invoice?.discount : undefined,
    discountObject?.percentage,
    discountObject?.percent,
    isPercentage ? discountObject?.value : undefined,
  ]
    .map((value) => (value === undefined ? NaN : Number(value)))
    .find((value) => Number.isFinite(value) && value > 0);

  if (percentageValue !== undefined) {
    return roundMoney(Math.min(grossTotal, (grossTotal * percentageValue) / 100));
  }

  const amountValue = [
    invoice?.discountAmount,
    invoice?.totalDiscount,
    invoice?.discountTotal,
    discountObject?.amount,
    !isPercentage ? discountObject?.value : undefined,
    !isPercentage &&
    (typeof invoice?.discount === "number" ||
      typeof invoice?.discount === "string")
      ? invoice.discount
      : undefined,
    !isPercentage ? invoice?.discountValue : undefined,
  ]
    .map((value) => (value === undefined ? NaN : Number(value)))
    .find((value) => Number.isFinite(value) && value > 0);

  if (amountValue !== undefined) {
    return roundMoney(Math.min(grossTotal, amountValue));
  }

  const storedTotal = [invoice?.total, invoice?.finalTotal, invoice?.netTotal]
    .map((value) => (value === undefined ? NaN : Number(value)))
    .find((value) => Number.isFinite(value) && value >= 0);

  return storedTotal !== undefined && grossTotal > storedTotal
    ? roundMoney(grossTotal - storedTotal)
    : 0;
}

function getRefundGrossAmount(item) {
  const isOil = (item?.containerType || "").toLowerCase() === "oil";
  const quantity = toNumber(item?.refundQty);

  if (isOil) {
    const originalMl = toNumber(
      item?.selectedMl ?? toNumber(item?.oilQty) * toNumber(item?.qty)
    );
    const linePrice = toNumber(item?.price);
    return originalMl > 0
      ? roundMoney((linePrice / originalMl) * quantity)
      : roundMoney(toNumber(item?.pricePerMl) * quantity);
  }

  return roundMoney(toNumber(item?.price) * quantity);
}

function calculateRefundPreview(invoice, refundMap, getKey, isFullyRefunded) {
  if (!invoice?.items?.length) {
    return { grossAmount: 0, discountShare: 0, refundAmount: 0 };
  }

  const selectedLines = invoice.items
    .map((item) => ({
      ...item,
      refundQty: Math.max(0, toNumber(refundMap?.[getKey(item)])),
    }))
    .filter((item) => item.refundQty > 0);

  if (!selectedLines.length) {
    return { grossAmount: 0, discountShare: 0, refundAmount: 0 };
  }

  const invoiceGrossTotal = getInvoiceGrossTotal(invoice);
  const invoiceDiscount = getInvoiceDiscount(invoice, invoiceGrossTotal);
  const storedInvoiceTotal = [invoice.total, invoice.finalTotal, invoice.netTotal]
    .map((value) => (value === undefined ? NaN : Number(value)))
    .find((value) => Number.isFinite(value) && value >= 0);

  const calculatedNetTotal = Math.max(0, invoiceGrossTotal - invoiceDiscount);
  const invoiceNetTotal = roundMoney(
    storedInvoiceTotal !== undefined &&
      !(invoiceDiscount > 0 && storedInvoiceTotal >= invoiceGrossTotal)
      ? storedInvoiceTotal
      : calculatedNetTotal
  );

  const previousRefundedAmount = roundMoney(
    invoice.refundedAmount ?? invoice.returnedTotal ?? 0
  );

  const grossAmount = roundMoney(
    selectedLines.reduce((sum, item) => sum + getRefundGrossAmount(item), 0)
  );

  const refundedQtyNow = selectedLines.reduce(
    (sum, item) =>
      (item.containerType || "").toLowerCase() === "oil"
        ? sum
        : sum + toNumber(item.refundQty),
    0
  );
  const refundedMlNow = selectedLines.reduce(
    (sum, item) =>
      (item.containerType || "").toLowerCase() === "oil"
        ? sum + toNumber(item.refundQty)
        : sum,
    0
  );

  const totalProducts = invoice.items
    .filter((item) => (item.containerType || "").toLowerCase() !== "oil")
    .reduce((sum, item) => sum + toNumber(item.qty), 0);
  const totalMl = invoice.items
    .filter((item) => (item.containerType || "").toLowerCase() === "oil")
    .reduce(
      (sum, item) =>
        sum +
        toNumber(item.selectedMl ?? toNumber(item.oilQty) * toNumber(item.qty)),
      0
    );

  const fullRefundAfterThisOperation =
    typeof isFullyRefunded === "function"
      ? isFullyRefunded(
          toNumber(invoice.refundedQty) + refundedQtyNow,
          toNumber(invoice.refundedMl) + refundedMlNow,
          totalProducts,
          totalMl
        )
      : false;

  const remainingRefundableAmount = Math.max(
    0,
    invoiceNetTotal - previousRefundedAmount
  );
  const proportionalRefundAmount =
    invoiceGrossTotal > 0
      ? grossAmount * (invoiceNetTotal / invoiceGrossTotal)
      : grossAmount;
  const refundAmount = roundMoney(
    Math.min(
      remainingRefundableAmount,
      fullRefundAfterThisOperation
        ? remainingRefundableAmount
        : proportionalRefundAmount
    )
  );

  return {
    grossAmount,
    discountShare: roundMoney(Math.max(0, grossAmount - refundAmount)),
    refundAmount,
  };
}

export default function RefundModal(props) {
  const {
    showRefundPopup,
    selectedInvoice,
    liveReturns,
    getKey,
    lang,
    t,
    theme,
    isMobile,
    refundMap,
    handleRefundQty,
    handlePartialRefund,
    loading,
    hasValidRefund,
    setShowRefundPopup,
    setRefundItems,
    refundPaymentMethod,
    setRefundPaymentMethod,
    isFullyRefunded,
  } = props;

  const refundPreview = calculateRefundPreview(
    selectedInvoice,
    refundMap,
    getKey,
    isFullyRefunded
  );
  const formatMoney = (value) =>
    toNumber(value).toLocaleString(lang === "ar" ? "ar-EG" : "en-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const currencyLabel = lang === "ar" ? "ج.م" : "EGP";

  return (
    <>
      {showRefundPopup &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                width: "100%",
                maxWidth: isMobile ? "95%" : "500px",
                maxHeight: "80vh",
                overflowY: "auto",
                paddingRight: "6px",
                scrollbarWidth: "thin",
              }}
            >
              <h3>{t("invoices.refundItems")}</h3>

              {selectedInvoice?.items.map((item, i) => {
                const alreadyRefunded = liveReturns
                  .filter((r) => getKey(r) === getKey(item))
                  .reduce((sum, r) => sum + r.quantity, 0);

                const isOil =
                  (item.containerType || "").toLowerCase().trim() === "oil";

                const totalOilMl =
                  item.selectedMl ?? (item.oilQty || 0) * (item.qty || 0);

                const remaining = Math.max(
                  0,
                  isOil ? totalOilMl - alreadyRefunded : item.qty - alreadyRefunded
                );
                const totalQty = isOil
                  ? item.selectedMl ?? (item.oilQty || 0) * (item.qty || 0)
                  : item.qty;

                return (
                  <div key={`${getKey(item)}_${i}`} style={{ marginBottom: "10px" }}>
                    <div>
                      <>
                        {item.name}
                        <div
                          style={{
                            fontSize: "12px",
                            opacity: 0.7,
                            marginTop: "2px",
                          }}
                        >
                          {(item.containerType || "").toLowerCase() === "oil"
                            ? lang === "ar"
                              ? "زيت خام"
                              : "Pure Oil"
                            : item.containerName ||
                              item.sizeLabel ||
                              [item.containerType, item.size]
                                .filter(Boolean)
                                .join(" • ")}
                        </div>
                      </>

                      <span style={{ fontSize: "12px", marginLeft: "6px" }}>
                        {isOil
                          ? `${remaining} / ${totalQty} ml ${t("common.available")}`
                          : `${remaining} / ${totalQty} ${t("common.available")}`}
                      </span>

                      {remaining === 0 && (
                        <span style={{ color: "red", marginLeft: "6px" }}>
                          {t("invoices.refunded")}
                        </span>
                      )}
                    </div>

                    <input
                      type="number"
                      inputMode="numeric"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: `1px solid ${theme.colors.border}`,
                        marginTop: "4px",
                        outline: "none",
                        fontSize: "14px",
                        transition: "0.2s",
                      }}
                      min="0"
                      max={remaining}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.colors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${theme.colors.secondary}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.colors.border;
                        e.target.style.boxShadow = "none";

                        let value = Number(e.target.value) || 0;
                        const maxQty = remaining;

                        if (value > maxQty) {
                          handleRefundQty(item, maxQty);
                          toast.error(`${t("common.max")}: ${maxQty}`);
                          value = maxQty;
                        }
                      }}
                      disabled={remaining === 0}
                      placeholder={isOil ? t("common.ml") : t("common.qty")}
                      value={refundMap[getKey(item)] || ""}
                      onChange={(e) => {
                        const value = Math.min(
                          remaining,
                          Number(e.target.value) || 0
                        );
                        handleRefundQty(item, value);
                      }}
                    />
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "4px",
                      }}
                    >
                      {isOil
                        ? `${t("common.max")}: ${remaining} ml`
                        : `${t("common.max")}: ${remaining}`}
                    </div>
                  </div>
                );
              })}

              {/* Estimated refund summary */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "13px 14px",
                  borderRadius: "12px",
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.cardSoft || "#f8fafc",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: theme.colors.text,
                    marginBottom: "10px",
                  }}
                >
                  {lang === "ar" ? "ملخص الاسترجاع" : "Refund summary"}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    fontSize: "13px",
                    color: theme.colors.textSecondary,
                    marginBottom: "7px",
                  }}
                >
                  <span>
                    {lang === "ar" ? "قيمة المنتجات المرتجعة" : "Returned items value"}
                  </span>
                  <strong style={{ color: theme.colors.text, whiteSpace: "nowrap" }}>
                    {formatMoney(refundPreview.grossAmount)} {currencyLabel}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    fontSize: "13px",
                    color: theme.colors.textSecondary,
                    marginBottom: "10px",
                  }}
                >
                  <span>
                    {lang === "ar" ? "نصيب المرتجع من الخصم" : "Allocated invoice discount"}
                  </span>
                  <strong style={{ color: "#dc2626", whiteSpace: "nowrap" }}>
                    - {formatMoney(refundPreview.discountShare)} {currencyLabel}
                  </strong>
                </div>

                <div
                  style={{
                    borderTop: `1px solid ${theme.colors.border}`,
                    paddingTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <strong style={{ fontSize: "14px", color: theme.colors.text }}>
                    {lang === "ar" ? "المبلغ المستحق للعميل" : "Amount to refund"}
                  </strong>
                  <strong
                    style={{
                      fontSize: "20px",
                      color: "#16a34a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatMoney(refundPreview.refundAmount)} {currencyLabel}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <div
                  style={{
                    marginBottom: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {t("payment.method")}
                </div>

                <select
                  value={refundPaymentMethod}
                  onChange={(e) => setRefundPaymentMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: `1px solid ${theme.colors.border}`,
                    background: "#fff",
                    outline: "none",
                    fontSize: "14px",
                  }}
                >
                  <option value="cash">{t("common.cash")}</option>
                  <option value="visa">{t("common.visa")}</option>
                  <option value="instapay">{t("common.instapay")}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handlePartialRefund}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                disabled={loading || !hasValidRefund}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: theme.colors.primary,
                  color: "#fff",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading || !hasValidRefund ? 0.6 : 1,
                  marginTop: "12px",
                }}
              >
                {loading ? `⏳ ${t("common.loading")}` : t("invoices.confirmRefund")}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRefundPopup(false);
                  setRefundItems([]);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.card,
                  marginTop: "8px",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

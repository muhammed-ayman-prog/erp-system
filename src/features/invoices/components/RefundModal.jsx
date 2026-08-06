import { createPortal } from "react-dom";
import toast from "react-hot-toast";

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
} = props;

  return (
    <>
      {showRefundPopup && (
          createPortal(
        <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000
        }}>
        <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: isMobile ? "95%" : "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        paddingRight: "6px",
        scrollbarWidth: "thin",

        }}>

        <h3>{t("invoices.refundItems")}</h3>

        {selectedInvoice?.items.map((item, i) => {
    

  const alreadyRefunded = liveReturns
    .filter(r => getKey(r) === getKey(item))
    .reduce((sum, r) => sum + r.quantity, 0);

    const isOil =
    (item.containerType || "").toLowerCase().trim() === "oil";

 const totalOilMl =
  item.selectedMl ??
  ((item.oilQty || 0) * (item.qty || 0));

const remaining = Math.max(
  0,
  isOil
    ? totalOilMl - alreadyRefunded
    : item.qty - alreadyRefunded
);
const totalQty = isOil
  ? (item.selectedMl ??
      ((item.oilQty || 0) * (item.qty || 0)))
  : item.qty;

    return (
      <div key={`${getKey(item)}_${i}`} style={{ marginBottom: "10px" }}>
        <div>
          <>
    {item.name}

    <div style={{
      fontSize: "12px",
      opacity: 0.7,
      marginTop: "2px"
    }}>
      {(item.containerType || "").toLowerCase() === "oil"
  ? (
      lang === "ar"
        ? "زيت خام"
        : "Pure Oil"
    )
  : (
      item.containerName ||
      item.sizeLabel ||
      [
        item.containerType,
        item.size
      ]
        .filter(Boolean)
        .join(" • ")
    )
}
    </div>
  </>

          <span style={{ fontSize: "12px", marginLeft: "6px" }}>
            {isOil
              ? `${remaining} / ${totalQty} ml ${t("common.available")}`
              : `${remaining} / ${totalQty} ${t("common.available")}`
            }
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
    toast.error(
  `${t("common.max")}: ${maxQty}`
);
    value = maxQty;
  }
    
  }}
          disabled={remaining === 0}
          placeholder={
            isOil
              ? t("common.ml")
              : t("common.qty")
          }
          value={refundMap[getKey(item)] || ""}
          onChange={(e) => {

          const value = Math.min(
            remaining,
            Number(e.target.value) || 0
          );

          handleRefundQty(item, value);

        }}
        />
        <div style={{
    fontSize: "11px",
    color: "#888",
    marginTop: "4px"
  }}>
    {isOil
      ? `${t("common.max")}: ${remaining} ml`
      : `${t("common.max")}: ${remaining}`
    }
  </div>
      </div>
    );
  })}
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
    onChange={(e) =>
      setRefundPaymentMethod(e.target.value)
    }
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
    <option value="cash">
      {t("common.cash")}
    </option>

    <option value="visa">
      {t("common.visa")}
    </option>

    <option value="instapay">
      {t("common.instapay")}
    </option>
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
              opacity: loading ? 0.6 : 1,
              marginTop: "12px"
            }}
          >
          {loading
? `⏳ ${t("common.loading")}`
: t("invoices.confirmRefund")}
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
      transition: "0.2s"
    }}
  >
    {t("common.cancel")}
  </button>

      </div>
    </div>,
    document.body
    )
  )}
    </>
  );
}
import { createPortal } from "react-dom";

export default function CancelModal(props) {
  const {
    showConfirm,
    setShowConfirm,
    cancelReason,
    setCancelReason,
    cancelReasonType,
    setCancelReasonType,
    confirmAction,
    theme,
    t,
  } = props;
 const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000   // 👈 مهم
  };
  const modalBoxStyle = {
  background: theme.colors.card,
  padding: 20,
  borderRadius: 12,
  width: "100%",
  maxWidth: "380px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  position: "relative",
};
  return (
    <>
      {showConfirm && (
                createPortal(
                <div style={modalStyle}>
                  <div style={modalBoxStyle}>
                    <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>{t("common.confirmAction")}</h3>
      
          <p style={{
            fontSize: "13px",
            color: theme.colors.textSecondary,
            marginTop: "6px"
          }}>
            {t("invoices.cancelWarning")}
          </p>
        </div>
        <select
        value={cancelReasonType}
        onChange={(e) => {
          setCancelReasonType(e.target.value);
      
          if (e.target.value !== "other") {
            setCancelReason(e.target.value);
          } else {
            setCancelReason("");
          }
        }}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: `1px solid ${theme.colors.border}`,
          marginTop: "15px",
          marginBottom: "10px"
        }}
      >
        <option value="">
          اختر سبب الإلغاء...
        </option>
      
        <option value="طلب العميل">
          👤 طلب العميل
        </option>
      
        <option value="خطأ في إدخال الفاتورة">
          📝 خطأ في إدخال الفاتورة
        </option>
      
        <option value="خطأ في المنتج">
          📦 خطأ في المنتج
        </option>
      
        <option value="خطأ في السعر">
          💰 خطأ في السعر
        </option>
      
        <option value="خطأ في طريقة الدفع">
          💳 خطأ في طريقة الدفع
        </option>
      
        <option value="فاتورة مكررة">
          📄 فاتورة مكررة
        </option>
      
        <option value="other">
          ✍️ أخرى...
        </option>
      </select>
      {cancelReasonType === "other" && (
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="اكتب سبب الإلغاء..."
          rows={4}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: `1px solid ${theme.colors.border}`,
            resize: "vertical",
            marginBottom: "15px"
          }}
        />
      )}
                    <button
                    type="button"
          onClick={() => {
        setShowConfirm(false);
        setCancelReason("");
        setCancelReasonType("");
      }}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${theme.colors.border}`,
            marginRight: "8px"
          }}
        >
          {t("common.cancel")}
        </button>
      
        <button
        type="button"
        onClick={confirmAction}
        disabled={
        !cancelReasonType ||
        (cancelReasonType === "other" && !cancelReason.trim())
      }
        style={{
          padding: "8px 12px",
          borderRadius: "8px",
          background: theme.colors.danger,
          color: "#fff",
          border: "none",
          opacity:
        !cancelReasonType ||
        (cancelReasonType === "other" && !cancelReason.trim())
          ? 0.5
          : 1,
      
      cursor:
        !cancelReasonType ||
        (cancelReasonType === "other" && !cancelReason.trim())
          ? "not-allowed"
          : "pointer"
        }}
      >
        {t("common.confirm")}
      </button>
                  </div>
                </div>,
              document.body
                )
              )}
    </>
  );
}

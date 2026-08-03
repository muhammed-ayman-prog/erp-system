import {
  Receipt,
  CalendarDays,
  Clock3,
  MoreVertical,
} from "lucide-react";

export default function InvoiceHeader(props) {
  const {
    selectedInvoice,
    formatDateTime,
    isMobile,
    theme,
    t,
    setDropdownOpen,
  } = props;

  const infoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    borderRadius: "10px",
    background: theme.colors.cardSoft,
    color: theme.colors.textSecondary,
    fontSize: "13px",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        flexDirection: isMobile ? "column" : "row",
        gap: "18px",
        marginBottom: "20px",
      }}
    >
      {/* Left */}
      <div style={{ flex: 1, width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: theme.colors.textSecondary,
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          <Receipt size={16} />
          <span>{t("invoices.invoice") || "Invoice"}</span>
        </div>

        <div
          style={{
            fontSize: isMobile ? "28px" : "34px",
            fontWeight: "800",
            color: theme.colors.text,
            marginTop: "6px",
            letterSpacing: "-0.5px",
          }}
        >
          {selectedInvoice.invoiceNumber}
        </div>

        <div
          style={{
            height: "1px",
            background: theme.colors.border,
            margin: "16px 0",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)",
            gap: "10px",
          }}
        >
          <div style={infoStyle}>
            <CalendarDays
              size={16}
              color={theme.colors.primary}
            />

            <div>
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.7,
                }}
              >
                {t("invoices.saleDate")}
              </div>

              <div
                style={{
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {formatDateTime(
                  selectedInvoice.saleDate ||
                    selectedInvoice.createdAt
                )}
              </div>
            </div>
          </div>

          <div style={infoStyle}>
            <Clock3
              size={16}
              color={theme.colors.primary}
            />

            <div>
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.7,
                }}
              >
                {t("invoices.createdAt")}
              </div>

              <div
                style={{
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {formatDateTime(
                  selectedInvoice.createdAt
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen((prev) => !prev);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform =
            "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 8px 20px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform =
            "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          borderRadius: "12px",
          border: "none",
          background: theme.colors.primary,
          color: "#fff",
          cursor: "pointer",
          fontWeight: "600",
          transition: "0.2s",
          alignSelf: isMobile ? "stretch" : "flex-start",
        }}
      >
        <MoreVertical size={18} />
        {t("common.actions")}
      </button>
    </div>
  );
}
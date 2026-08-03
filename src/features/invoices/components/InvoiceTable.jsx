export default function InvoiceTable(props) {
  const {
    isMobile,
    loadingSales,
    paginated,
    selectedInvoice,
    setSelectedInvoice,
    theme,
    t,
    page,
    setPage,
    totalPages,
    handleRowHover,
    handleRowLeave,
    formatDate,
    isFullyRefunded,
    lang,
    dropdownOpen,
    setDropdownOpen,
  } = props;

  return (
    <>
      {/* TABLE */}
                <div style={{
                  flex: 3,
                  maxHeight: "500px",
                  overflowY: "auto",
                  overflowX: "auto",
                  minWidth: 0,
                  scrollbarWidth: "thin",
                  paddingRight: "4px",
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                    minWidth: isMobile ? "720px" : "100%",
                    }}>
                    <thead style={{
        textAlign: "center",
          fontSize: "13px",
          fontWeight: "600",
          color: theme.colors.textSecondary,
          background: theme.colors.cardSoft,
          position: isMobile ? "static" : "sticky",
          top: 0,
          zIndex: 2,
          
          
        }}>
                    <tr>
        <th>{t("invoices.invoice")}</th>
        <th>{t("customer.title")}</th>
        <th>{t("branches.title")}</th>
        <th>{t("common.date")}</th>
        <th>{t("payment.method")}</th>
        <th>{t("invoices.type")}</th>
        <th>{t("cart.total")}</th>
        <th>{t("common.status")}</th>
      </tr>
                    </thead>
                    <tbody>
                      {loadingSales
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="8" style={{ padding: "12px" }}>
                    <div
                      style={{
                        height: "20px",
                        borderRadius: "6px",
                        background: "#f1f5f9",
                        animation: "pulse 1.5s infinite"
                      }}
                    />
                  </td>
                </tr>
              ))
              
            : paginated.length === 0 ? (
          <tr>
            <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ color: "#999" }}>
                📭 {t("common.noData")}
              </div>
            </td>
          </tr>
        ) : (
          paginated.map(s => {
          
      
        const refundedQty = s.refundedQty || 0;
      const refundedMl = s.refundedMl || 0;
      
      const totalProducts =
        s.items
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
        s.items
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
          refundedQty,
          refundedMl,
          totalProducts,
          totalMl
        );
      const saleTypeStyle =
        s.saleType === "RETURN_RESALE"
          ? {
              bg: "#fff7ed",
              color: "#c2410c",
              text: `🔄 ${t("invoices.returnResale")}`
            }
          : s.saleType === "MIXED"
          ? {
              bg: "#f3e8ff",
              color: "#7e22ce",
              text: `🟣 ${t("invoices.mixed")}`
            }
          : {
              bg: "#dcfce7",
              color: "#166534",
              text: `🟢 ${t("invoices.sale")}`
            };
      const statusStyle =
        s.status === "cancelled"
          ? { bg: "#e5e7eb", color: "#374151" }
          : fullyRefunded
          ? { bg: "#fee2e2", color: "#dc2626" }
          : refundedQty > 0 || refundedMl > 0
          ? { bg: "#fef9c3", color: "#ca8a04" }
          : { bg: "#dcfce7", color: "#16a34a" };
      
      
        return ( 
                  
          <tr
          key={s.id}
          onClick={() => {
          setSelectedInvoice(s);
          setDropdownOpen(false);
        }}
          style={{
            cursor: "pointer",
            background:
              selectedInvoice?.id === s.id
                ? theme.colors.secondary
                : theme.colors.card,
            border:
            selectedInvoice?.id === s.id
              ? `2px solid ${theme.colors.primary}`
              : "2px solid transparent",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            borderRadius: "12px",
            overflow: "hidden",
            opacity: s.status === "cancelled" ? 0.75 : 1,
          }}
          onMouseEnter={e => handleRowHover(e, false)}
        onMouseLeave={handleRowLeave}
        >
            {/* Invoice */}
            <td style={{
        padding: "14px 12px",
        fontWeight: "600",
        textAlign: "center"
      }}>
        {s.invoiceNumber}
      </td>
      
      <td style={{
        padding: "14px 12px",
        fontSize: "14px",
        textAlign: "center"
      }}>
        {s.customerName || "-"}
      </td>
      <td style={{
        padding: "14px 12px",
        fontSize: "14px",
        textAlign: "center"
      }}>
        {s.branchName || "-"}
      </td>
      
      <td style={{
        padding: "14px 12px",
        fontSize: "14px",
        textAlign: "center"
      }}>
        {formatDate(
        s.saleDate || s.createdAt
      )}
      </td>
      
      <td style={{
        padding: "14px 12px",
        fontSize: "14px",
        textAlign: "center"
      }}>
              <span style={{
          padding: "4px 10px",
          borderRadius: "999px",
          background: "#f1f5f9",
          fontSize: "12px",
          fontWeight: "500"
        }}>
          {t(`common.${(s.paymentMethod || "").toLowerCase()}`)}
        </span>
            </td>
            <td
        style={{
          padding: "12px",
          textAlign: "center"
        }}
      >
        <span
          style={{
            background: saleTypeStyle.bg,
            color: saleTypeStyle.color,
            padding: "5px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "600"
          }}
        >
          {saleTypeStyle.text}
        </span>
      </td>
            {/* Total */}
            <td style={{
              padding: "12px",
              fontWeight: "600",
              textAlign: "center"
            }}>
              {s.total?.toLocaleString()} EGP
            </td>
                
            {/* Status */}
            <td style={{
              padding: "14px 12px",
              fontSize: "14px",
              textAlign: "center"
            }}>
              <span
                style={{
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  padding: "5px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                {
          s.status === "cancelled"
            ? t("invoices.cancelled")
            : fullyRefunded
            ? t("invoices.refunded")
            : refundedQty > 0 || refundedMl > 0
            ? t("invoices.partialRefunded")
            : t("invoices.completed")
        }
              </span>
            </td>
            
            
          </tr>
        );
        }))
        }
      
        
                    </tbody>
                  </table>
      
                  <div style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button
          type="button"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.card,
              cursor: "pointer"
            }}
          >
            {t("common.prev")}
          </button>
      
          <span style={{ fontSize: "13px" }}>
            {t("common.page")} {page} of {totalPages}
          </span>
      
          <button
          type="button"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.card,
              cursor: "pointer"
            }}
          >
            {t("common.next")}
          </button>
        </div>
                </div>
    </>
  );
}
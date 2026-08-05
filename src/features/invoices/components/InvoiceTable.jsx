import AppBadge from "../../../components/ui/AppBadge";
import AppButton from "../../../components/ui/AppButton";
import { theme } from "../../../theme";
import {
  getInvoiceStatus,
  getSaleType,
} from "../utils/invoiceHelpers";
export default function InvoiceTable(props) {
  const {
    isMobile,
    loadingSales,
    paginated,
    selectedInvoice,
    setSelectedInvoice,
    t,
    page,
    setPage,
    totalPages,
    handleRowHover,
    handleRowLeave,
    formatDate,
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
                        background: theme.colors.cardSoft,
                        animation: "pulse 1.5s infinite"
                      }}
                    />
                  </td>
                </tr>
              ))
              
            : paginated.length === 0 ? (
          <tr>
            <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
              <div
  style={{
    color: theme.colors.textSecondary,
    padding: 24,
    textAlign: "center",
    fontWeight: 500,
  }}
>
  {t("common.noData")}
</div>
            </td>
          </tr>
        ) : (
          paginated.map(s => {
          
      
        const status =
  getInvoiceStatus(s, t);

const saleType =
  getSaleType(s, t);
      
      
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
            opacity:
              status.color === "gray"
                ? 0.75
                : 1,
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
      
      <td
  style={{
    padding: "14px 12px",
    textAlign: "center",
  }}
>
  <AppBadge color="secondary">
    {t(
      `common.${(
        s.paymentMethod || ""
      ).toLowerCase()}`
    )}
  </AppBadge>
</td>
            <td
        style={{
          padding: "12px",
          textAlign: "center"
        }}
      >
        <AppBadge color={saleType.color}>
  {saleType.text}
</AppBadge>
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
              <AppBadge color={status.color}>
  {status.text}
</AppBadge>
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
          <AppButton
  size="sm"
  variant="secondary"
  disabled={page === 1}
  onClick={() =>
    setPage((p) => p - 1)
  }
>
  {t("common.prev")}
</AppButton>
      
          <span style={{ fontSize: "13px" }}>
            {t("common.page")} {page} / {totalPages}
          </span>
      
          <AppButton
  size="sm"
  variant="secondary"
  disabled={page === totalPages}
  onClick={() =>
    setPage((p) => p + 1)
  }
>
  {t("common.next")}
</AppButton>
        </div>
                </div>
    </>
  );
}
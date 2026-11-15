
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
    lang,
    loadingSales,
    paginated,
    selectedInvoice,
    setSelectedInvoice,
    onSelectRow,
    t,
    page,
    setPage,
    totalPages,
    handleRowHover,
    handleRowLeave,
    formatDate,
    setDropdownOpen,
  } = props;

  const handleSelect = (row) => {
    if (onSelectRow) {
      onSelectRow(row);
    } else {
      // Fallback لو لم يتم تمرير callback من الصفحة
      const invoice =
        row.rowType === "return"
          ? row.originalInvoice
          : row;

      if (invoice) {
        setSelectedInvoice(invoice);
      }

      setDropdownOpen(false);
    }
  };

  return (
    <div
      style={{
        flex: 3,
        maxHeight: "500px",
        overflowY: "auto",
        overflowX: "auto",
        minWidth: 0,
        scrollbarWidth: "thin",
        paddingRight: "4px",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 8px",
          minWidth: isMobile ? "720px" : "100%",
        }}
      >
        <thead
          style={{
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "600",
            color: theme.colors.textSecondary,
            background: theme.colors.cardSoft,
            position: isMobile ? "static" : "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
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
          {loadingSales ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan="8" style={{ padding: "12px" }}>
                  <div
                    style={{
                      height: "20px",
                      borderRadius: "6px",
                      background: theme.colors.cardSoft,
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                </td>
              </tr>
            ))
          ) : paginated.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
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
            paginated.map((s) => {
              const isReturn = s.rowType === "return";

              const status = isReturn
                ? {
                    color: "success",
                    text: lang === "ar" ? "مسترد" : "Refunded",
                  }
                : getInvoiceStatus(s, t);

              const saleType = isReturn
                ? {
                    color: "warning",
                    text: lang === "ar" ? "مرتجع" : "Refund",
                  }
                : getSaleType(s, t);

              const displayTotal = isReturn
                ? -Math.abs(Number(s.totalRefund || 0))
                : s.status === "cancelled"
                  ? 0
                  : (s.newTotal ?? s.total ?? 0);

              const paymentMethod = (
                isReturn
                  ? s.refundPaymentMethod || s.paymentMethod || "cash"
                  : s.paymentMethod || "cash"
              ).toLowerCase();

              const isSplitPayment =
                !isReturn &&
                (
                  paymentMethod === "mixed" ||
                  (
                    Array.isArray(s.payments) &&
                    s.payments.filter(
                      (p) => Number(p.amount) > 0
                    ).length > 1
                  )
                );

              const rowInvoiceId = isReturn
                ? s.invoiceDocId
                : s.id;

              const isSelected =
                selectedInvoice?.id === rowInvoiceId;

              const rowDate = isReturn
                ? s.refundDate
                : s.saleDate || s.createdAt;

              return (
                <tr
                  key={s.rowId || `${s.rowType || "sale"}-${s.id}`}
                  onClick={() => handleSelect(s)}
                  style={{
                    cursor: "pointer",
                    background: isSelected
                      ? theme.colors.secondary
                      : theme.colors.card,
                    border: isSelected
                      ? `2px solid ${theme.colors.primary}`
                      : "2px solid transparent",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    opacity:
                      !isReturn && status.color === "gray"
                        ? 0.75
                        : 1,
                  }}
                  onMouseEnter={(e) =>
                    handleRowHover(e, false)
                  }
                  onMouseLeave={handleRowLeave}
                >
                  {/* Invoice Number */}
                  <td
                    style={{
                      padding: "14px 12px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {s.invoiceNumber || s.invoiceId || "-"}
                  </td>

                  {/* Customer */}
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {s.customerName || "-"}
                  </td>

                  {/* Branch */}
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {s.branchName || "-"}
                  </td>

                  {/* Date */}
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {formatDate(rowDate)}
                  </td>

                  {/* Payment Method */}
                  <td
                    style={{
                      padding: "14px 12px",
                      textAlign: "center",
                    }}
                  >
                    <AppBadge color="secondary">
                      {isSplitPayment
                        ? lang === "ar"
                          ? "دفع مقسّم"
                          : "Split Payment"
                        : t(`common.${paymentMethod}`)}
                    </AppBadge>
                  </td>

                  {/* Operation Type */}
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                    }}
                  >
                    <AppBadge color={saleType.color}>
                      {saleType.text}
                    </AppBadge>
                  </td>

                  {/* Total */}
                  <td
                    style={{
                      padding: "12px",
                      fontWeight: "600",
                      textAlign: "center",
                      color: isReturn ? "#DC2626" : "inherit",
                    }}
                  >
                    {isReturn ? "-" : ""}
                    {Math.abs(Number(displayTotal)).toLocaleString()} EGP
                  </td>

                  {/* Status */}
                  <td
                    style={{
                      padding: "14px 12px",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    <AppBadge color={status.color}>
                      {status.text}
                    </AppBadge>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <AppButton
          size="sm"
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          {t("common.prev")}
        </AppButton>

        <span style={{ fontSize: "13px" }}>
          {t("common.page")} {page} / {totalPages}
        </span>

        <AppButton
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          {t("common.next")}
        </AppButton>
      </div>
    </div>
  );
}

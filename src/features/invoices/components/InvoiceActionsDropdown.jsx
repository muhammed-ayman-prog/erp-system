export default function InvoiceActionsDropdown(props) {
  const {
    dropdownOpen,
    selectedInvoice,
    cancelling,
    setRefundItems,
    setShowRefundPopup,
    setAction,
    setShowConfirm,
    handlePrint,
    setDropdownOpen,
    theme,
    t,
  } = props;

  if (!dropdownOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "40px",
        right: "10px",
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "12px",
        padding: "6px 0",
        boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
        overflow: "hidden",
        zIndex: 1000,
        minWidth: "150px"
      }}
    >
      {[
        ...(selectedInvoice?.status !== "cancelled"
          ? [{
              key: "refund",
              label: t("invoices.refund"),
              color: theme.colors.warning
            }]
          : []),

        ...(selectedInvoice?.status !== "cancelled"
          ? [{
              key: "cancel",
              label: t("common.cancel"),
              color: theme.colors.danger
            }]
          : []),

        {
          key: "print",
          label: t("invoices.print"),
          color: theme.colors.primary
        }
      ].map(a => (
        <div
          key={a.key}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#f8fafc";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
          }}
          onClick={() => {

            if (
              a.key !== "print" &&
              (
                selectedInvoice.status === "cancelled" ||
                cancelling
              )
            ) {
              return;
            }

            if (a.key === "refund") {

              setRefundItems([]);
              setShowRefundPopup(true);

            } else if (a.key === "cancel") {

              setAction("cancel");
              setShowConfirm(true);

            } else if (a.key === "print") {

              handlePrint();

            }

            setDropdownOpen(false);
          }}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            color: a.color,
            fontWeight: "500"
          }}
        >
          {a.label}
        </div>
      ))}
    </div>
  );
}
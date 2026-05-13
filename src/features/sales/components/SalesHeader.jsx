export default function SalesHeader({
  isMobile,
  selectedBranch,
  translateBranch,
  navigate,
  setShowReturned,
  returnedItems,
  theme,
  t
}) {

  return (
    <div
      className="top-bar"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        marginBottom: "12px"
      }}
    >

      {/* Header */}
      <div style={{
        flex: 1,
        padding: "12px 16px",
        borderRadius: "14px",
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`
      }}>

        <div style={{
          fontSize: "18px",
          fontWeight: "700"
        }}>
          🧾 {t("navigation.sales")}
        </div>

        <div style={{
          fontSize: "12px",
          color: theme.colors.textSecondary
        }}>
          {t("branches.title")}:
          {" "}
          {selectedBranch
            ? translateBranch(selectedBranch)
            : "—"}
        </div>

      </div>

      {/* Buttons */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        width:
          isMobile
            ? "100%"
            : "auto"
      }}>

        <button
          type="button"

          onClick={() =>
            navigate("/invoices")
          }

          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            background:
              theme.colors.primary,

            color: "#fff",

            border: "none",

            fontWeight: "600",

            cursor: "pointer"
          }}
        >
          📄 {t("invoices.title")}
        </button>

        <button
          type="button"

          onClick={() =>
            setShowReturned(true)
          }

          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            background: "#f59e0b",
            color: "#fff",
            border: "none",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          📦 {t("returns.title")}
          {" "}
          ({returnedItems.length})
        </button>

      </div>

    </div>
  );
}
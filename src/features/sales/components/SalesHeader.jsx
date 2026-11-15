import PageHeader from "../../../components/ui/layout/PageHeader";
import AppButton from "../../../components/ui/AppButton";

export default function SalesHeader({
  selectedBranch,
  translateBranch,
  navigate,
  setShowReturned,
  returnedItems,
  t
}) {
  return (
    <PageHeader
      title={`🧾 ${t("navigation.sales")}`}

      subtitle={
        `${t("branches.title")}: ${
          selectedBranch
            ? translateBranch(selectedBranch)
            : "—"
        }`
      }

      actions={
        <>
        {/* Daily Closing */}
<AppButton
  variant="secondary"
  onClick={() => navigate("/daily-closing")}
  style={{
    background: "#16a34a",
    color: "#fff",
    border: "none",
  }}
>
  🔒 {t("dailyClosing.title")}
</AppButton>
          {/* Invoices */}
          <AppButton
            onClick={() =>
              navigate("/invoices")
            }
          >
            📄 {t("invoices.title")}
          </AppButton>
        

          {/* Expenses */}
          <AppButton
            variant="secondary"
            onClick={() =>
              navigate("/expenses")
            }
            style={{
              background: "#0D9488",
              color: "#fff",
              border: "none"
            }}
          >
            💰 المصروفات
          </AppButton>

          {/* Waste */}
          <AppButton
            variant="secondary"
            onClick={() =>
              navigate("/waste")
            }
            style={{
              background: "#64748b",
              color: "#fff",
              border: "none"
            }}
          >
            🗑️ الهدر
          </AppButton>

          {/* Returned Items */}
          <AppButton
            variant="secondary"
            onClick={() =>
              setShowReturned(true)
            }
            style={{
              background: "#f59e0b",
              color: "#fff",
              border: "none"
            }}
          >
            📦 {t("returns.title")}
            {" "}
            ({returnedItems.length})
          </AppButton>
        </>
      }

      style={{
        marginBottom: "16px"
      }}
    />
  );
}
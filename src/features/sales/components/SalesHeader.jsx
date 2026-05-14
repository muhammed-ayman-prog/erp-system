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

          <AppButton
            onClick={() =>
              navigate("/invoices")
            }
          >
            📄 {t("invoices.title")}
          </AppButton>

          <AppButton
            variant="secondary"

            onClick={() =>
              setShowReturned(true)
            }

            style={{
              background: "#f59e0b",
              color: "#fff",
              border: "none",
            }}
          >
            📦 {t("returns.title")}
            {" "}
            ({returnedItems.length})
          </AppButton>

        </>
      }

      style={{
        marginBottom: "16px",
      }}
    />

  );

}
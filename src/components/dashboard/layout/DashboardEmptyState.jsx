function DashboardEmptyState({
  t
}) {

  return (

    <div style={{

      padding: 25,

      textAlign: "center",

      color: "#6b7280",

      background: "#fff",

      borderRadius: 16,

      marginBottom: 15,

      border: "1px dashed #e5e7eb"

    }}>

      <div style={{
        fontSize: 22
      }}>
        📭
      </div>

      <div>
        {t("dashboard.noSales")}
      </div>

    </div>

  );
}

export default DashboardEmptyState;
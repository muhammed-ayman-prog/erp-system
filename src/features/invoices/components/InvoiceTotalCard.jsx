export default function InvoiceTotalCard({
  netTotal,
  theme,
}) {
  return (
    <div
      style={{
        margin: "20px 0",
        borderRadius: 18,
        padding: "28px",
        textAlign: "center",
        background:
          "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        border: "1px solid #bbf7d0",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 2,
          color: "#16a34a",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        TOTAL
      </div>

      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          color: "#16a34a",
        }}
      >
        {netTotal.toLocaleString()} EGP
      </div>
    </div>
  );
}

export default function ProductGrid({
  productsWithStock,
  search,
  mainTab,
  subTab,
  onSelectProduct,
  theme,
  t,
  addToCart,
  setSelectedProduct,
  setPopupStep,
  setShowPopup
}) {
  return (
    <div className="products-grid">
          {productsWithStock
            .filter(p => {
            const tab = (mainTab || "").toLowerCase();
            const cat = (p.category || "").toLowerCase();

            if (tab === "french") {
              return cat.includes("french");
            }

            if (tab === "oriental") {
            if (subTab) {
              const parts = cat.split("-"); // زي: oriental-a
              return parts[0] === "oriental" && parts[1] === subTab.toLowerCase();
            }
            return cat.includes("oriental");
          }

            if (tab === "body") {
              if (subTab) {
                return cat.includes(subTab.toLowerCase());
              }
              return cat.includes("body");
            }

            if (tab === "original") {
              return cat.includes("original") || p.type === "original";
            }

            return false;
          })
            .filter(p =>
              (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
              (p.category || "").toLowerCase().includes(search.toLowerCase())
            )
            .map((p) => (
              <div
  key={p.id}
  className="product-card"
  style={{
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    minHeight: "130px",
    opacity: p.quantity === 0 ? 0.5 : 1,
  }}
  onClick={() => {
    if (p.quantity <= 0) return;
    onSelectProduct(p);
  }}
>
  {/* 🔝 Top */}
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  }}>
    <div style={{
      fontSize: "11px",
      color: theme.colors.textSecondary
    }}>
      {p.category}
    </div>

    <div className={`stock-badge ${
      p.quantity === 0
        ? "out"
        : p.quantity < 5
        ? "low"
        : "in"
    }`}>
      {p.quantity}
    </div>
  </div>

  {/* 🧴 Name */}
  <div style={{
    fontWeight: "600",
    fontSize: "14px",
    color: theme.colors.textPrimary,
    marginBottom: "10px"
  }}>
    {p.name}
  </div>

  {/* 💰 Price */}
  <div style={{
    marginTop: "auto",
    fontWeight: "600",
    fontSize: "13px"
  }}>
    {p.price ? `${p.price} EGP` : ""}
  </div>
</div>
            ))
        }
    </div>
  );
}

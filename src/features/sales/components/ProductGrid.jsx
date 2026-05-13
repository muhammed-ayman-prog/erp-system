
export default function ProductGrid({
  productsWithStock,
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
            
            .map((p) => (
              <div
  key={p.id}
  className="product-card"
  style={{
    cursor:
    p.quantity <= 0
      ? "not-allowed"
      : "pointer",
    textAlign:
      document.dir === "rtl"
        ? "right"
        : "left",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    minHeight: "130px",
    opacity: p.quantity === 0 ? 0.5 : 1,

filter:
  p.quantity === 0
    ? "grayscale(20%)"
    : "none",

    transition: "0.2s ease",
    border:
      p.quantity === 0
        ? "1px solid #fecaca"
        : `1px solid ${theme.colors.border}`,
    background:
      p.quantity === 0
        ? "#fafafa"
        : theme.colors.card,
  }}
  onMouseEnter={(e) => {
    if (window.innerWidth < 768) return;

  if (p.quantity <= 0) return;

  e.currentTarget.style.transform =
    "translateY(-4px)";

  e.currentTarget.style.boxShadow =
    "0 10px 25px rgba(0,0,0,0.08)";
}}

onMouseLeave={(e) => {
  if (window.innerWidth < 768) return;

  e.currentTarget.style.transform =
    "translateY(0)";

  e.currentTarget.style.boxShadow =
    "none";
}}
onMouseDown={(e) => {

  if (p.quantity <= 0) return;

  e.currentTarget.style.transform =
    "scale(0.98)";
}}

onMouseUp={(e) => {

  if (p.quantity <= 0) return;

  e.currentTarget.style.transform =
    "translateY(-4px)";
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
      fontSize: "10px",
      fontWeight: "500",
      letterSpacing: "0.3px",
      textTransform: "capitalize",
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
    fontWeight: "700",
    fontSize: "15px",
    lineHeight: "1.4",
    color: theme.colors.textPrimary,
    marginBottom: "10px",

    minHeight: "42px",
    overflow: "hidden"
  }}>
    {p.name}
    {p.quantity <= 0 && (
      <div style={{
        marginTop: "6px",
        fontSize: "11px",
        fontWeight: "600",
        color: "#ef4444"
      }}>
        {t("products.outOfStock")}
      </div>
    )}
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

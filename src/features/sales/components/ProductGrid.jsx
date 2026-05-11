
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
              (p.name || "")
                .toLowerCase()
                .includes(search.trim().toLowerCase()) ||

              (p.category || "")
                .toLowerCase()
                .includes(search.trim().toLowerCase())
            )
            .sort((a, b) => {

            // ✅ Available الأول
            if (a.quantity > 5 && b.quantity <= 5) return -1;
            if (a.quantity <= 5 && b.quantity > 5) return 1;

            // ⚠️ Low Stock في النص
            if (
              a.quantity > 0 &&
              a.quantity <= 5 &&
              b.quantity === 0
            ) return -1;

            if (
              a.quantity === 0 &&
              b.quantity > 0 &&
              b.quantity <= 5
            ) return 1;

            // 🔤 نفس الحالة → رتب بالاسم
            return (a.name || "").localeCompare(b.name || "");
          })
            .map((p) => (
              <div
  key={p.id}
  className="product-card"
  style={{
    cursor:
    p.quantity <= 0
      ? "not-allowed"
      : "pointer",
    textAlign: "left",
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

  if (p.quantity <= 0) return;

  e.currentTarget.style.transform =
    "translateY(-4px)";

  e.currentTarget.style.boxShadow =
    "0 10px 25px rgba(0,0,0,0.08)";
}}

onMouseLeave={(e) => {

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
        Out Of Stock
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

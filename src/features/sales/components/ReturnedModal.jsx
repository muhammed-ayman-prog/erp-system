import AppModal from "../../../components/ui/AppModal";

export default function ReturnedModal({
  showReturned,
  setShowReturned,
  lang,
  returnedSearch,
  setReturnedSearch,
  returnedItems,
  normalizedReturnedSearch,
  selectedBranch,
  cart,
  addToCart,
  setShowCart,
  theme,
  t
}) {
  if (!showReturned) {
    return null;
  }

  const searchTerm = (
    normalizedReturnedSearch ||
    returnedSearch ||
    ""
  )
    .toLowerCase()
    .trim();

  // البحث باسم المنتج أو بأي زيت من مكونات العبوة
  const filteredReturnedItems = (
    Array.isArray(returnedItems)
      ? returnedItems
      : []
  ).filter(item => {
    const productName = (
      item.name || ""
    ).toLowerCase();

    const oilNames = (
      Array.isArray(item.oilComponents)
        ? item.oilComponents
        : []
    )
      .map(component =>
        `${component.oilName || ""} ${component.oilCategory || ""}`
      )
      .join(" ")
      .toLowerCase();

    return (
      productName.includes(searchTerm) ||
      oilNames.includes(searchTerm)
    );
  });

  return (
    <AppModal
      open={showReturned}
      onClose={() => setShowReturned(false)}
      width="900px"
    >
      <div
        style={{
          background: theme.colors.background
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px"
          }}
        >
          <h2>
            📦 {t("returns.title")}
          </h2>

          <button
            type="button"
            onClick={() => setShowReturned(false)}
          >
            ✖
          </button>
        </div>

        {/* Search */}
        <input
          autoComplete="off"
          dir={lang === "ar" ? "rtl" : "ltr"}
          placeholder={t("common.search")}
          value={returnedSearch}
          onChange={e =>
            setReturnedSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "15px",
            border: `1px solid ${theme.colors.border}`
          }}
        />

        {/* Items */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "12px"
          }}
        >
          {filteredReturnedItems.map(item => {
            const oilComponents = Array.isArray(
              item.oilComponents
            )
              ? item.oilComponents
              : [];

            return (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: "16px",
                  padding: "14px",
                  background: theme.colors.card
                }}
              >
                {/* Product Name */}
                <div
                  style={{
                    fontWeight: "700",
                    marginBottom: "6px"
                  }}
                >
                  {item.name}
                </div>

                {/* Container Name */}
                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.7,
                    marginBottom: "10px"
                  }}
                >
                  {item.containerName}
                </div>

                {/* Oil Composition */}
                {oilComponents.length > 0 && (
                  <div
                    style={{
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: "10px",
                      padding: "10px",
                      marginBottom: "12px"
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "13px",
                        marginBottom: "8px"
                      }}
                    >
                      {lang === "ar"
                        ? "🧪 محتويات العبوة"
                        : "🧪 Bottle Contents"}
                    </div>

                    {oilComponents.map(
                      (component, index) => {
                        const quantity = Number(
                          component.quantityML ??
                          component.oilQty ??
                          0
                        );

                        const oilName =
                          component.oilName ||
                          component.oilCategory ||
                          (lang === "ar"
                            ? "زيت"
                            : "Oil");

                        return (
                          <div
                            key={`${
                              component.oilId || index
                            }_${index}`}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "13px",
                              marginBottom:
                                index <
                                oilComponents.length - 1
                                  ? "6px"
                                  : "0"
                            }}
                          >
                            <span>
                              {oilName}
                            </span>

                            <strong>
                              {quantity} ml
                            </strong>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* Price */}
                <div
                  style={{
                    fontWeight: "700",
                    color: theme.colors.primary,
                    marginBottom: "10px"
                  }}
                >
                  {item.price} EGP
                </div>

                {/* Add To Cart */}
                <button
                  type="button"
                  onClick={() => {
                    if (
                      selectedBranch !== "all" &&
                      item.branchId !== selectedBranch
                    ) {
                      return;
                    }

                    const alreadyExists = cart.find(
                      c =>
                        c.returnedItemId === item.id
                    );

                    if (alreadyExists) {
                      return;
                    }

                    addToCart({
                      id: item.productId,

                      name: item.name,

                      price: item.price,

                      qty: 1,

                      containerType:
                        item.containerType || "",

                      containerName:
                        item.containerName || "",

                      isReturned: true,

                      returnedItemId: item.id,

                      returnId: item.returnId,

                      oilComponents: oilComponents.map(
                        component => ({
                          ...component
                        })
                      ),

                      branchId: item.branchId
                    });

                    setShowReturned(false);

                    setShowCart(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: theme.colors.primary,
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  {t("cart.add")} 🛒
                </button>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredReturnedItems.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "30px 15px",
                color: theme.colors.textSecondary || theme.colors.text,
                opacity: 0.7
              }}
            >
              {lang === "ar"
                ? "لا توجد منتجات مرتجعة مطابقة للبحث"
                : "No matching returned products found"}
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}
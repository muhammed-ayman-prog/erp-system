export default function ProductsHeader({
  mainTab,
  subTab,
  visibleProducts,
  theme,
  t
}) {

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "14px"
    }}>

      <div>

        <div style={{
          fontSize: "18px",
          fontWeight: "700"
        }}>

          {mainTab === "french" &&
            t("products.french")}

          {mainTab === "oriental" &&
            `${t("products.oriental")} ${subTab?.toUpperCase() || ""} 🌿`
          }

          {mainTab === "body" &&
            `${t("products.body")} ${subTab || ""} ✨`
          }

          {mainTab === "original" &&
            t("products.original")}

        </div>

        <div style={{
          fontSize: "12px",
          color: theme.colors.textSecondary,
          marginTop: "3px"
        }}>

          {
            visibleProducts.filter(
              p => p.quantity > 0
            ).length
          }{" "}

          {t("inventory.productsAvailable")}

        </div>

      </div>

    </div>
  );
}
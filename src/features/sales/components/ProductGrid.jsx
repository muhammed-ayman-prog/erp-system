import ProductCard from "./ProductCard";
import {
  memo,
  useMemo
} from "react";

function ProductGrid({
  productsWithStock,
  onSelectProduct,
  theme,
  t,
}) {
  
  if (!productsWithStock.length) {

  return (
    <div
  className="products-empty"

  style={{
    color: theme.colors.textSecondary
  }}
>
      {t("products.noProducts")}
    </div>
  );
}
const isRTL = useMemo(
  () => t("dir") === "rtl",
  [t]
);
  return (
    
    <div className="products-grid">
      
          {productsWithStock.map((p) => (

  <ProductCard
    key={p.id}

    p={p}

    isRTL={isRTL}

    onSelectProduct={
      onSelectProduct
    }

    theme={theme}

    t={t}
  />
))
        }
    </div>
  );
}
export default memo(ProductGrid);
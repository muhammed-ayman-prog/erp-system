import {
  memo,
  useCallback,
  useMemo,
} from "react";

import { ArrowRight } from "lucide-react";

import AppCard from "../../../components/ui/AppCard";
import AppNumber from "../../../components/ui/AppNumber";

function ProductCard({
  p,
  isRTL,
  onSelectProduct,
  theme,
  t,
}) {
  const quantity =
    Number(p.quantity) || 0;

  const isOut =
    quantity <= 0;

  const isLow =
    quantity > 0 &&
    quantity < 5;

  const hasFixedPrice =
    Number(p.price) > 0;

  const handleClick =
    useCallback(() => {
      if (isOut) return;

      onSelectProduct(p);
    }, [
      isOut,
      onSelectProduct,
      p,
    ]);

  const handleKeyDown =
    useCallback(
      (e) => {
        if (
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();

          if (isOut) return;

          onSelectProduct(p);
        }
      },
      [
        isOut,
        onSelectProduct,
        p,
      ]
    );

  

  const cardStyle =
    useMemo(
      () => ({
        textAlign: isRTL
          ? "right"
          : "left",

        opacity: isOut
          ? 0.55
          : 1,

        filter: isOut
          ? "grayscale(15%)"
          : "none",
      }),
      [
        isRTL,
        isOut,
      ]
    );

  return (
    <AppCard
      clickable={!isOut}
      hover={!isOut}
      padding="sm"
      className={`product-card ${
        isOut
          ? "stock-out"
          : isLow
          ? "stock-low"
          : "stock-in"
      }`}
      style={cardStyle}
      role="button"
      tabIndex={
        isOut ? -1 : 0
      }
      aria-label={p.name}
      aria-disabled={isOut}
      onClick={handleClick}
      onKeyDown={
        handleKeyDown
      }
    >
      <div className="product-name">
        {p.name}
      </div>

      <div className="product-footer">

  <div className="product-price-wrap">

    {hasFixedPrice ? (

      <div className="product-price">

        <AppNumber value={p.price} />

      </div>

    ) : isOut ? (

      <div className="product-out">

        {t("products.outOfStock")}

      </div>

    ) : (

      <div className="product-select">

        <span>

          {t("products.chooseContainer")}

        </span>

        <ArrowRight
          size={12}
          strokeWidth={2.5}
        />

      </div>

    )}

    <div className="product-stock">

      <span
        className="stock-dot"
        style={{
          background: isOut
            ? theme.colors.danger
            : isLow
            ? theme.colors.warning
            : theme.colors.success,
        }}
      />

      <span
        className="stock-count"
        style={{
          color: isOut
            ? theme.colors.danger
            : theme.colors.text,
        }}
      >
        {quantity}
      </span>

    </div>

  </div>

</div>

    </AppCard>
  );
}

export default memo(
  ProductCard,
  (prev, next) =>
    prev.p.id === next.p.id &&
    prev.p.name === next.p.name &&
    prev.p.quantity === next.p.quantity &&
    prev.p.price === next.p.price &&
    prev.isRTL === next.isRTL &&
    prev.theme === next.theme &&
    prev.onSelectProduct ===
      next.onSelectProduct
);
import { memo } from "react";

import AppCard
from "../../../components/ui/AppCard";

function ProductCard({
  p,
  isRTL,

  onSelectProduct,

  theme,
  t
}) {

  const isOut =
    p.quantity <= 0;

  return (

    <AppCard
      role="button"

      aria-label={p.name}

      aria-disabled={isOut}

      tabIndex={
        isOut ? -1 : 0
      }

      className="product-card"

      style={{

        cursor:

          isOut

            ? "not-allowed"

            : "pointer",

        textAlign:
          isRTL
            ? "right"
            : "left",

        opacity:
          isOut ? 0.5 : 1,

        filter:

          isOut

            ? "grayscale(20%)"

            : "none",

        border:

          isOut

            ? `1px solid ${theme.colors.borderLight}`

            : `1px solid ${theme.colors.border}`,

        background:

          isOut

            ? theme.colors.cardSoft

            : theme.colors.card
      }}

      onClick={() => {

        if (isOut) return;

        onSelectProduct(p);
      }}

      onKeyDown={(e) => {

        if (
          e.key === "Enter" ||
          e.key === " "
        ) {

          if (isOut) return;

          onSelectProduct(p);
        }
      }}
    >

      <div className="product-top">

        <div
          className="product-category"

          style={{
            color:
              theme.colors.textSecondary
          }}
        >

          {p.category}

        </div>

        <div
          className={`stock-badge ${
            isOut

              ? "out"

              : p.quantity < 5

              ? "low"

              : "in"
          }`}
        >

          {p.quantity}

        </div>
      </div>

      <div
        className="product-name"

        style={{
          color:
            theme.colors.textPrimary
        }}
      >

        {p.name}

      </div>

      <div className="product-status-wrap">

        {isOut ? (

          <div className="product-status out">

            {t("products.outOfStock")}

          </div>

        ) : p.quantity < 5 ? (

          <div className="product-status low">

            {t("products.low")}
            {" "}
            ({p.quantity})

          </div>

        ) : null}

      </div>

      <div
        className="product-price"

        style={{
          color:
            theme.colors.primary
        }}
      >

        {p.price
          ? `${p.price} EGP`
          : ""}

      </div>

    </AppCard>
  );
}

export default memo(ProductCard);
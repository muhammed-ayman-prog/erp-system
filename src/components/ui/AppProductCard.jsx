import AppCard from "./AppCard";
import AppBadge from "./AppBadge";

import {
  Package,
  Droplets,
  Box,
} from "lucide-react";

import { theme } from "../../theme";
import { useTranslate } from "../../useTranslate";
const getContainerKind = (product) => {
  const category =
    product?.category
      ?.toLowerCase()
      ?.trim() || "";

  if (!category.includes("container")) {
    return null;
  }

  const values = [
    product?.subCategory,
    product?.type,
    product?.containerType,
    product?.name,
  ]
    .filter(Boolean)
    .map((value) =>
      value.toString().toLowerCase().trim()
    );

  const combined = values.join(" ");

  // Samples
  if (
    combined.includes("sample") ||
    combined.includes("samples")
  ) {
    return "sample";
  }

  // Boxes
  if (
    combined.includes("box") ||
    combined.includes("علبة")
  ) {
    return "box";
  }

  // Bottles
  if (
    combined.includes("bottle") ||
    combined.includes("bottles") ||
    combined.includes("زجاجة")
  ) {
    return "bottle";
  }

  return "container";
};
const getIcon = (category, product) => {
  const value =
    (category || "").toLowerCase();

  if (value.includes("container")) {
    const kind =
      getContainerKind(product);

    if (kind === "sample") {
      return <Droplets size={20} strokeWidth={2} />;
    }

    if (kind === "box") {
      return <Box size={20} strokeWidth={2} />;
    }

    return <Package size={20} strokeWidth={2} />;
  }

  if (
    value.includes("french") ||
    value.includes("oriental") ||
    value.includes("oil")
  ) {
    return <Droplets size={20} strokeWidth={2} />;
  }

  return <Package size={20} strokeWidth={2} />;
};

const getCategoryVariant = (category, product) => {
  const value =
    (category || "").toLowerCase();

  if (value.includes("container")) {
    const kind =
      getContainerKind(product);

    if (kind === "sample") {
      return "primary";
    }

    return "gray";
  }

  if (value.includes("french"))
    return "primary";

  if (value.includes("oriental"))
    return "purple";

  if (value.includes("original"))
    return "success";

  return "warning";
};

const getCategoryLabel = (
  category,
  product,
  t
) => {
  const value =
    (category || "").toLowerCase();

  if (value.includes("container")) {
    const kind =
      getContainerKind(product);

    if (kind === "sample") {
      return t("products.sample");
    }

    if (kind === "box") {
      return t("products.box");
    }

    if (kind === "bottle") {
      return t("products.bottle");
    }

    return t("products.container");
  }

  if (value.includes("french"))
    return t("products.french");

  if (value.includes("oriental"))
    return t("products.oriental");

  if (value.includes("original"))
    return t("products.original");

  if (value.includes("musk"))
    return t("products.musk");

  return category;
};

const getIconBackground = (
  category,
  product
) => {
  const value =
    (category || "").toLowerCase();

  if (value.includes("container")) {
    const kind =
      getContainerKind(product);

    if (kind === "sample") {
      return theme.colors.infoSoft;
    }

    return theme.colors.graySoft;
  }

  if (value.includes("french"))
    return theme.colors.infoSoft;

  if (value.includes("oriental"))
    return theme.colors.purpleSoft;

  if (value.includes("original"))
    return theme.colors.successSoft;

  return theme.colors.cardSoft;
};

const getIconColor = (
  category,
  product
) => {
  const value =
    (category || "").toLowerCase();

  if (value.includes("container")) {
    const kind =
      getContainerKind(product);

    if (kind === "sample") {
      return theme.colors.primary;
    }

    return theme.colors.gray;
  }

  if (value.includes("french"))
    return theme.colors.primary;

  if (value.includes("oriental"))
    return theme.colors.purple;

  if (value.includes("original"))
    return theme.colors.success;

  return theme.colors.warning;
};

export default function AppProductCard({
  product,
  onClick,
  multilineTitle = false,
}) {
  const { t } = useTranslate();

  const quantity =
    product.quantity ??
    product.stock ??
    0;

  return (
    <AppCard
      clickable
      onClick={onClick}
      style={{
        minHeight: 155,

        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",

        gap: theme.spacing.sm,

        transition:
          "transform .25s ease, box-shadow .25s ease, border-color .25s ease",

        willChange: "transform",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-5px)";

        e.currentTarget.style.boxShadow =
          "0 14px 30px rgba(37,99,235,.12)";

        e.currentTarget.style.borderColor =
          theme.colors.primary;

        const icon =
          e.currentTarget.querySelector(
            ".product-icon"
          );

        if (icon) {
          icon.style.transform =
            "scale(1.1)";
        }

        const badge =
          e.currentTarget.querySelector(
            ".product-badge"
          );

        if (badge) {
          badge.style.transform =
            "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";

        e.currentTarget.style.boxShadow =
          theme.shadow.sm;

        e.currentTarget.style.borderColor =
          theme.colors.cardBorder;

        const icon =
          e.currentTarget.querySelector(
            ".product-icon"
          );

        if (icon) {
          icon.style.transform =
            "scale(1)";
        }

        const badge =
          e.currentTarget.querySelector(
            ".product-badge"
          );

        if (badge) {
          badge.style.transform =
            "translateY(0)";
        }
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,

            borderRadius: 14,

            background:
              getIconBackground(
                product.category,
                product
              ),

            color:
              getIconColor(
                product.category,
                product
              ),

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            flexShrink: 0,
          }}
        >
          <div
            className="product-icon"
            style={{
              display: "flex",
              transition:
                "transform .25s ease",
            }}
          >
            {getIcon(
              product.category,
              product
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 14,

              fontWeight: 700,

              color:
                theme.colors.text,

              overflow: "hidden",

              display:
                "-webkit-box",

              WebkitBoxOrient:
                "vertical",

              WebkitLineClamp:
                multilineTitle ? 2 : 1,

              lineHeight: 1.4,
            }}
          >
            {product.name}
          </div>

          <div
            className="product-badge"
            style={{
              marginTop:
                theme.spacing.xs,

              display:
                "inline-flex",

              transition:
                "transform .25s ease",
            }}
          >
            <AppBadge
              size="sm"
              variant={
                getCategoryVariant(
                  product.category,
                  product
                )
              }
            >
              {getCategoryLabel(
                product.category,
                product,
                t
              )}
            </AppBadge>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop:
            `1px solid ${theme.colors.border}`,

          paddingTop:
            theme.spacing.sm,

          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",
        }}
      >
        <div
          style={{
            fontSize: 12,

            color:
              theme.colors.textSecondary,

            fontWeight: 500,
          }}
        >
          {t("stockEntry.quantity")}
        </div>

        <div
          style={{
            fontSize: 20,

            fontWeight: 700,

            lineHeight: 1,

            color:
              theme.colors.text,

            letterSpacing: "0.5px",
          }}
        >
          {Number(quantity).toLocaleString("en-US")}
        </div>
      </div>
    </AppCard>
  );
}
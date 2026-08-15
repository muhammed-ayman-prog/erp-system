import AppCard from "../ui/AppCard";
import AppBadge from "../ui/AppBadge";
import AppButton from "../ui/AppButton";
import Flex from "../ui/layout/Flex";

import { theme } from "../../theme";
import { useTranslate } from "../../useTranslate";

export default function ProductRow({
  product,

  openProductHistory,

  handleArchiveProduct,

  setEditingProduct,

  setEditProductData,
}) {
  const { t } = useTranslate();

  const getTypeVariant = (type) => {
    switch (type) {
      case "oil":
        return "primary";

      case "container":
        return "warning";

      case "original":
        return "success";

      default:
        return "gray";
    }
  };

  return (
    <AppCard
      bordered
      padding="md"
      radius="md"
      shadow="sm"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-2px)";

        e.currentTarget.style.boxShadow =
          "0 10px 24px rgba(15,23,42,.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";

        e.currentTarget.style.boxShadow =
          theme.shadow.sm;
      }}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        transition:
          "transform .2s ease, box-shadow .2s ease",
        flexWrap: "wrap",
      }}
    >
      {/* Product Info */}
      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "6px",
          }}
        >
          <div
  style={{
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "1.4",
    color: theme.colors.text,
  }}
>
  {product.name}
</div>

          <AppBadge
            size="sm"
            variant={getTypeVariant(
              product.type
            )}
          >
            {product.type}
          </AppBadge>
        </div>

        <div
  style={{
    fontSize: "13px",
    lineHeight: "1.4",
    color: theme.colors.textSecondary,
  }}
>
  {product.type}
  {" • "}
  {product.category ||
    product.subCategory ||
    "-"}
</div>
      </div>

      {/* Actions */}
      <Flex
  gap="8px"
  style={{
    flexShrink: 0,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  }}
>
        {/* Edit */}
        <AppButton
          size="sm"
          variant="warning"
          onClick={() => {
            setEditingProduct(product);

            setEditProductData({
              ...product,
            });
          }}
        >
          ✏️ {t("common.edit")}
        </AppButton>

        {/* History */}
        <AppButton
          size="sm"
          variant="secondary"
          onClick={() =>
            openProductHistory(product)
          }
        >
          🕘 {t("common.history")}
        </AppButton>

        {/* Archive */}
        <AppButton
          size="sm"
          variant="danger"
          onClick={() =>
            handleArchiveProduct(product)
          }
        >
          📦 {t("common.archive")}
        </AppButton>
      </Flex>
    </AppCard>
  );
}
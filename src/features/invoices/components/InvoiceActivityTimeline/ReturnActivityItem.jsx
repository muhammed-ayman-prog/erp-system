import AppBadge from "../../../../components/ui/AppBadge";

export default function ReturnActivityItem({
  item,
  theme,
  t,
}) {
  const isOil =
    (item.container || item.containerType || "")
      .toLowerCase() === "oil";

  const price = (() => {
    if (isOil) {
      const totalMl =
        (item.originalOilQty || parseInt(item.size) || 1) *
        (item.originalQty || 1);

      const pricePerMl =
        totalMl > 0
          ? (item.price || 0) / totalMl
          : 0;

      return pricePerMl * item.quantity;
    }

    return (item.price || 0) * (item.quantity || 0);
  })();

  return (
    <div
      style={{
        padding: theme.spacing.md,
        borderTop: `1px dashed ${theme.colors.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: theme.spacing.md,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {item.productName}
          </div>

          {item.containerName && (
            <div
              style={{
                color: theme.colors.textSecondary,
                fontSize: 12,
              }}
            >
              {item.containerName}
            </div>
          )}
        </div>

        <AppBadge variant="primary">
          {item.unit === "ml"
            ? `${item.quantity} ml`
            : item.quantity}
        </AppBadge>
      </div>

      <div
        style={{
          marginTop: theme.spacing.sm,
          textAlign: "end",
          fontWeight: 700,
          color: theme.colors.primary,
        }}
      >
        {price.toLocaleString()} EGP
      </div>
    </div>
  );
}
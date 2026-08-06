import AppBadge from "../../../../components/ui/AppBadge";

export default function ReturnActivityItem({
  item,
  theme,
  t,
}) {
  const isOil =
    (item.container || item.containerType || "")
      .toLowerCase() === "oil";

const price = isOil
  ? (item.price || 0)
  : (item.price || 0) * (item.quantity || 0);

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
          {`${item.quantity}${isOil ? " ml" : ""}`}
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
import { Package, Droplets } from "lucide-react";
import AppCard from "../../../components/ui/AppCard";
import AppBadge from "../../../components/ui/AppBadge";
export default function InvoiceItemsTable({
  selectedInvoice,
  theme,
  t,
  lang,
  getKey,
}) {
  return (
    <>
      {selectedInvoice.items?.map((item, index) => {
        const isOil =
          (item.containerType || "").toLowerCase() === "oil";

        const qty = isOil
          ? `${(item.oilQty || 0) * (item.qty || 0)} ${t("common.ml")}`
          : item.qty;

        const total =
          item.total ??
          (item.price || 0) * (item.qty || 0);

        return (
          <AppCard
            key={`${getKey(item)}_${index}`}
            hover
            style={{
              marginBottom: theme.spacing.lg,
            }}
          >
            {/* Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: theme.spacing.md,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 220,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  <Package
                    size={18}
                    color={theme.colors.primary}
                  />

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {item.name}
                  </div>
                </div>

                <div
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 13,
                  }}
                >
                  {isOil
                    ? lang === "ar"
                      ? "زيت خام"
                      : "Pure Oil"
                    : item.containerName ||
                      item.sizeLabel ||
                      [
                        item.containerType,
                        item.size,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                </div>
              </div>

              <AppBadge variant="primary">
                {qty}
              </AppBadge>
            </div>

            {isOil && (
              <div
                style={{
                  marginTop: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                }}
              >
                <AppBadge
                  variant="info"
                  icon={
                    <Droplets
                      size={14}
                    />
                  }
                >
                  {t("products.oil")} : {item.oilQty}{" "}
                  {t("common.ml")}
                </AppBadge>
              </div>
            )}

            <div
              style={{
                marginTop: theme.spacing.lg,
                paddingTop: theme.spacing.md,
                borderTop: `1px dashed ${theme.colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: theme.spacing.md,
              }}
            >
              <div>
                <div
                  style={{
                    color:
                      theme.colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  {t("cart.price")}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {(item.price || 0).toLocaleString()} EGP
                </div>
              </div>

              <div
                style={{
                  textAlign: "end",
                }}
              >
                <div
                  style={{
                    color:
                      theme.colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  {t("cart.total")}
                </div>

                <div
                  style={{
                    color:
                      theme.colors.primary,
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  {total.toLocaleString()} EGP
                </div>
              </div>
            </div>
          </AppCard>
        );
      })}
    </>
  );
}
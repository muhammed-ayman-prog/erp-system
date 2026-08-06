import {
  Package,
  Droplets,
} from "lucide-react";

import AppBadge from "../../../components/ui/AppBadge";
import AppCard from "../../../components/ui/AppCard";
import { theme } from "../../../theme";

export default function InvoiceItemsTable({
  selectedInvoice,
  t,
  lang,
  getKey,
}) {
  if (
    !selectedInvoice.items?.length
  ) {
    return (
      <AppCard>
        <div
          style={{
            textAlign: "center",
            color:
              theme.colors.textSecondary,
            padding:
              theme.spacing.xl,
          }}
        >
          {t("common.noData")}
        </div>
      </AppCard>
    );
  }

  return (
    <>
      {selectedInvoice.items.map(
        (item, index) => {
          const isOil =
            (
              item.containerType || ""
            ).toLowerCase() === "oil";

          const oilMl =
            item.selectedMl ??
            ((item.oilQty || 0) * (item.qty || 0));

          const qty = isOil
            ? `${oilMl} ${t("common.ml")}`
            : item.qty;

          const total =
            item.total ??
            (
              isOil
                ? (item.pricePerMl || 0) *
                  (item.selectedMl ?? item.oilQty)
                : (item.price || 0) * (item.qty || 0)
            );

          return (
            <AppCard
              key={`${getKey(item)}_${index}`}
              hover
              style={{
                marginBottom:
                  theme.spacing.lg,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
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
                      alignItems:
                        "center",
                      gap: theme.spacing.sm,
                      marginBottom:
                        theme.spacing.xs,
                    }}
                  >
                    <Package
                      size={18}
                      color={
                        theme.colors
                          .primary
                      }
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
                      color:
                        theme.colors
                          .textSecondary,
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

                <AppBadge
                  color="primary"
                >
                  {qty}
                </AppBadge>
              </div>

              {isOil && (
                <div
                  style={{
                    marginTop:
                      theme.spacing.md,
                  }}
                >
                  <AppBadge
                    color="info"
                    icon={
                      <Droplets
                        size={14}
                      />
                    }
                  >
                    {t("products.oil")} : {item.selectedMl ?? item.oilQty} {t("common.ml")}
                  </AppBadge>
                </div>
              )}

              <div
                style={{
                  marginTop:
                    theme.spacing.lg,

                  paddingTop:
                    theme.spacing.md,

                  borderTop: `1px dashed ${theme.colors.border}`,

                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems: "center",

                  flexWrap: "wrap",

                  gap: theme.spacing.md,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color:
                        theme.colors
                          .textSecondary,
                    }}
                  >
                    {t(
                      "cart.price"
                    )}
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {(
                      item.price ||
                      0
                    ).toLocaleString()}{" "}
                    EGP
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color:
                        theme.colors
                          .textSecondary,
                    }}
                  >
                    {t(
                      "cart.total"
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color:
                        theme.colors
                          .primary,
                    }}
                  >
                    {total.toLocaleString()}{" "}
                    EGP
                  </div>
                </div>
              </div>
            </AppCard>
          );
        }
      )}
    </>
  );
}
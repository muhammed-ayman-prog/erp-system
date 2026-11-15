
import { useState } from "react";
import {
  Package,
  Droplets,
  ChevronDown,
} from "lucide-react";

import AppCard from "../../../components/ui/AppCard";
import { theme } from "../../../theme";

export default function InvoiceItemsTable({
  selectedInvoice,
  t,
  lang,
  getKey,
}) {
  const [expandedItems, setExpandedItems] = useState(
    () => new Set()
  );

  if (!selectedInvoice.items?.length) {
    return (
      <AppCard padding="md">
        <div
          style={{
            textAlign: "center",
            color: theme.colors.textSecondary,
            padding: 16,
          }}
        >
          {t("common.noData")}
        </div>
      </AppCard>
    );
  }

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString(
      lang === "ar" ? "ar-EG" : "en-US"
    );

  const toggleExpanded = (key) => {
    setExpandedItems((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {selectedInvoice.items.map((item, index) => {
        const type = (item.containerType || "")
          .toLowerCase()
          .trim();

        const isOil = type === "oil";

        const isReadyProduct =
          type === "original" ||
          type === "ready" ||
          type === "cream" ||
          type === "مخمرية";

        const qtyNumber = Number(item.qty ?? 1);

        const oilSoldMl = Number(
          item.selectedMl ?? item.oilQty ?? 0
        );

        // دعم مكونات الزيوت في الفواتير الجديدة والقديمة
        const oilComponents =
          Array.isArray(item.oilComponents) &&
          item.oilComponents.length > 0
            ? item.oilComponents
            : Number(item.oilQty) > 0
              ? [
                  {
                    oilId: item.oilId || item.id,
                    oilName: item.oilName || item.name,
                    oilCategory: item.oilCategory || "",
                    quantityML: Number(item.oilQty),
                  },
                ]
              : [];

        const normalizedOilComponents =
          oilComponents.map((component) => ({
            ...component,
            displayName:
              component.oilName ||
              component.name ||
              item.oilName ||
              item.name,
            quantityPerUnit: Number(
              component.quantityML ??
              component.oilQty ??
              0
            ),
          }));

        const totalOilUsed =
          normalizedOilComponents.reduce(
            (sum, component) =>
              sum + component.quantityPerUnit * qtyNumber,
            0
          );

        const hasOilUsage =
          !isOil &&
          !isReadyProduct &&
          normalizedOilComponents.some(
            (component) => component.quantityPerUnit > 0
          );

        const qty = isOil
          ? `${formatNumber(oilSoldMl)} ${t("common.ml")}`
          : formatNumber(qtyNumber);

        const unitPrice = isOil
          ? item.pricePerMl ?? item.price ?? 0
          : item.price ?? 0;

        const total =
          item.total ??
          (
            isOil
              ? Number(item.pricePerMl || 0) * oilSoldMl
              : Number(item.price || 0) * qtyNumber
          );

        const rowKey = `${getKey?.(item) || item.id || item.productId || item.name || "item"}_${index}`;

        const isExpanded = expandedItems.has(rowKey);

        const productDescription = isOil
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
              .join(" • ");

        return (
          <div
            key={rowKey}
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              background: theme.colors.card,
              overflow: "hidden",
            }}
          >
            {/* Product */}
            <div
              style={{
                padding: "11px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flex: 1,
                  minWidth: 130,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    minWidth: 34,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: theme.colors.primarySoft,
                    color: theme.colors.primary,
                  }}
                >
                  <Package size={17} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.colors.text,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.name || "-"}
                  </div>

                  {productDescription && (
                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 11,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {productDescription}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: "5px 9px",
                  borderRadius: 7,
                  background: theme.colors.cardSoft,
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  color: theme.colors.text,
                }}
              >
                {lang === "ar" ? "الكمية:" : "Qty:"} {qty}
              </div>
            </div>

            {/* Price Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                padding: "9px 12px",
                background: theme.colors.cardSoft,
                borderTop: `1px solid ${theme.colors.border}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: theme.colors.textSecondary,
                    marginBottom: 3,
                  }}
                >
                  {isOil
                    ? lang === "ar"
                      ? "سعر المللي"
                      : "Price / ml"
                    : t("cart.price")}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: theme.colors.text,
                  }}
                >
                  {formatNumber(unitPrice)} EGP
                </div>
              </div>

              <div style={{ textAlign: "end" }}>
                <div
                  style={{
                    fontSize: 10,
                    color: theme.colors.textSecondary,
                    marginBottom: 3,
                  }}
                >
                  {t("cart.total")}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: theme.colors.primary,
                  }}
                >
                  {formatNumber(total)} EGP
                </div>
              </div>
            </div>

            {/* Expandable Oil Details */}
            {hasOilUsage && (
              <>
                <button
                  type="button"
                  onClick={() => toggleExpanded(rowKey)}
                  aria-expanded={isExpanded}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "10px 12px",
                    border: 0,
                    borderTop: `1px solid ${theme.colors.border}`,
                    background: "transparent",
                    color: theme.colors.primary,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <Droplets size={15} />

                    {lang === "ar"
                      ? `تفاصيل الزيوت المستخدمة (${normalizedOilComponents.length})`
                      : `Oil Details (${normalizedOilComponents.length})`}
                  </span>

                  <ChevronDown
                    size={17}
                    style={{
                      transform: isExpanded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {isExpanded && (
                  <div
                    style={{
                      padding: "0 12px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                    }}
                  >
                    {normalizedOilComponents.map(
                      (component, componentIndex) => {
                        const componentTotal =
                          component.quantityPerUnit * qtyNumber;

                        return (
                          <div
                            key={`${component.oilId || componentIndex}_${componentIndex}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                              padding: "9px 10px",
                              borderRadius: 8,
                              background: theme.colors.cardSoft,
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: theme.colors.text,
                                }}
                              >
                                {component.displayName}
                              </div>

                              {component.oilCategory && (
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: theme.colors.textSecondary,
                                    marginTop: 2,
                                  }}
                                >
                                  {component.oilCategory}
                                </div>
                              )}

                              <div
                                style={{
                                  fontSize: 10,
                                  color: theme.colors.textSecondary,
                                  marginTop: 3,
                                }}
                              >
                                {formatNumber(component.quantityPerUnit)}{" "}
                                {t("common.ml")} /{" "}
                                {lang === "ar" ? "عبوة" : "bottle"}
                              </div>
                            </div>

                            <div
                              style={{
                                textAlign: "end",
                                fontSize: 12,
                                fontWeight: 700,
                                color: theme.colors.primary,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatNumber(componentTotal)}{" "}
                              {t("common.ml")}
                            </div>
                          </div>
                        );
                      }
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        paddingTop: 9,
                        borderTop: `1px dashed ${theme.colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      <span style={{ color: theme.colors.textSecondary }}>
                        {lang === "ar"
                          ? `عدد العبوات: ${formatNumber(qtyNumber)}`
                          : `Containers: ${formatNumber(qtyNumber)}`}
                      </span>

                      <strong
                        style={{
                          color: theme.colors.primary,
                          fontSize: 13,
                        }}
                      >
                        {lang === "ar"
                          ? "إجمالي الزيت:"
                          : "Total Oil:"}{" "}
                        {formatNumber(totalOilUsed)} {t("common.ml")}
                      </strong>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

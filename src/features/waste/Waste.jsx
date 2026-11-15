import {
  ClipboardList,
  PackageX,
  Plus,
  Recycle,
  Trash2,
  X,
  ChevronRight,
  ArrowRight
} from "lucide-react";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../../theme";
import { useTranslate } from "../../useTranslate";

import useWaste from "./hooks/useWaste";

import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppEmptyState from "../../components/ui/AppEmptyState";
import AppFormField from "../../components/ui/AppFormField";
import AppInput from "../../components/ui/AppInput";
import AppPageHeader from "../../components/ui/AppPageHeader";
import AppSection from "../../components/ui/AppSection";
import AppSelect from "../../components/ui/AppSelect";
import AppStatCard from "../../components/ui/AppStatCard";
import AppStatsGrid from "../../components/ui/AppStatsGrid";
import AppTextarea from "../../components/ui/AppTextarea";
import AppBadge from "../../components/ui/AppBadge";
import AppDrawer from "../../components/ui/AppDrawer";

export default function Waste() {
  const { t, lang } = useTranslate();
  const navigate = useNavigate();

  const {
    products,
    items,
    wasteList,
    stats,

    updateItem,

    addRow,
    removeRow,
    handleWaste,

    getProductsForCategory,
    getProductStock,

    WASTE_TYPES,
    WASTE_PRODUCT_CATEGORIES,

    isSubmitting,
    showToast,
    toastText,
  } = useWaste();

  // ==================================================
  // Helpers
  // ==================================================

  const getProductName = (productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    return product?.name || productId || "—";
  };

  const getWasteTypeLabel = (type) => {
    if (!type) return "—";

    return t(`waste.types.${type}`);
  };

  const [selectedOperation, setSelectedOperation] = useState(null);

  const getDateValue = (createdAt) => {
    if (!createdAt) return null;

    if (createdAt?.seconds) {
      return new Date(
        createdAt.seconds * 1000
      );
    }

    if (createdAt instanceof Date) {
      return createdAt;
    }

    const parsed = new Date(createdAt);

    return Number.isNaN(parsed.getTime())
      ? null
      : parsed;
  };

  const formatDate = (createdAt) => {
    const date = getDateValue(createdAt);

    if (!date) return "—";

    return new Intl.DateTimeFormat(
      lang === "ar" ? "ar-EG" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  };

  const getOperationKey = (waste) =>
    waste.wasteOperationId || `legacy-${waste.id}`;

  const wasteOperations = useMemo(() => {
    const groups = new Map();

    wasteList.forEach((waste) => {
      const key = getOperationKey(waste);
      const existing = groups.get(key);

      if (existing) {
        existing.items.push(waste);
        existing.totalQuantity += Number(waste.quantity) || 0;
        return;
      }

      groups.set(key, {
        id: key,
        wasteOperationId: waste.wasteOperationId || null,
        createdAt: waste.createdAt,
        userId: waste.userId,
        branchId: waste.branchId,
        items: [waste],
        totalQuantity: Number(waste.quantity) || 0,
      });
    });

    return Array.from(groups.values()).sort((a, b) => {
      const dateA = getDateValue(a.createdAt)?.getTime() || 0;
      const dateB = getDateValue(b.createdAt)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [wasteList]);

  // ==================================================
  // Category Options
  // ==================================================

  const categoryOptions = [
    {
      value: WASTE_PRODUCT_CATEGORIES.FRENCH,
      label: t("products.french"),
    },
    {
      value: WASTE_PRODUCT_CATEGORIES.ORIENTAL,
      label: t("products.oriental"),
    },
    {
      value: WASTE_PRODUCT_CATEGORIES.MUSK,
      label: t("products.musk"),
    },
    {
      value: WASTE_PRODUCT_CATEGORIES.BODY,
      label: t("products.body"),
    },
    {
      value: WASTE_PRODUCT_CATEGORIES.ORIGINAL,
      label: t("products.original"),
    },
    {
      value: WASTE_PRODUCT_CATEGORIES.CONTAINER,
      label: t("products.container"),
    },
  ];

  // ==================================================
  // Shared Styles
  // ==================================================

  const responsiveGridStyle = {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: theme.spacing.md,
  };

  const itemCardStyle = {
    position: "relative",
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    background: theme.colors.cardSoft,
  };

  // ==================================================
  // Render
  // ==================================================

  return (
    <div
      className="waste-page"
      style={{
        minHeight: "100vh",
        padding: theme.spacing.xl,
        background: theme.colors.background,
        color: theme.colors.text,
        boxSizing: "border-box",
      }}
    >
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      {/* PAGE HEADER */}
<div
  style={{
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    direction: "ltr",
    width: "100%",
    marginBottom: theme.spacing.xl
  }}
>
  {/* Back To Sales - Left */}
  <div
    className="no-print"
    style={{
      flexShrink: 0
    }}
  >
    <AppButton
      variant="secondary"
      leftIcon={<ArrowRight size={16} />}
      onClick={() => navigate("/sales")}
    >
      رجوع للمبيعات
    </AppButton>
  </div>

  {/* Waste Title - Right */}
  <div
    style={{
      flex: 1,
      minWidth: 200,
      direction: lang === "ar" ? "rtl" : "ltr"
    }}
  >
    <AppPageHeader
      title={t("waste.title")}
      subtitle={t("waste.subtitle")}
      icon={
        <Recycle
          size={28}
          color={theme.colors.primary}
        />
      }
    />
  </div>
</div>

      {/* ==================================================
          STATS
      ================================================== */}

      <AppStatsGrid>
        <AppStatCard
          title={t("waste.totalOperations")}
          value={stats.totalOperations}
          subtitle={t("waste.history")}
          icon={<ClipboardList size={26} />}
          color="primary"
        />

        <AppStatCard
          title={t("waste.totalQuantity")}
          value={stats.totalQuantity}
          subtitle={t(
            "waste.totalWastedQuantity"
          )}
          icon={<PackageX size={26} />}
          color="warning"
        />

        <AppStatCard
          title={t("waste.topWasteType")}
          value={
            stats.topWasteType
              ? t(
                  `waste.types.${stats.topWasteType}`
                )
              : "—"
          }
          subtitle={
            stats.topWasteType
              ? `${stats.topWasteTypeCount} ${t(
                  "waste.operations"
                )}`
              : t("waste.noWaste")
          }
          icon={<Recycle size={26} />}
          color="danger"
        />
      </AppStatsGrid>

      {/* ==================================================
          ADD WASTE
      ================================================== */}

      <AppSection
        title={t("waste.add")}
        subtitle={t("waste.subtitle")}
        style={{
          marginBottom: theme.spacing.xl,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.lg,
          }}
        >
          {/* ==================================================
              ITEMS
          ================================================== */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.md,
            }}
          >
            {items.map((item, index) => {
              const availableStock =
                getProductStock(
                  item.productId
                );

              const categoryProducts =
                getProductsForCategory(
                  item.productCategory
                );

              const selectedProduct =
                products.find(
                  (product) =>
                    product.id ===
                    item.productId
                );

              return (
                <AppCard
                  key={index}
                  padding="lg"
                  style={itemCardStyle}
                >
                  {/* ==================================================
                      ITEM HEADER
                  ================================================== */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: theme.spacing.md,
                      marginBottom:
                        theme.spacing.lg,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.sm,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius:
                            theme.radius.md,
                          background:
                            theme.colors.dangerSoft,
                          color:
                            theme.colors.danger,
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          flexShrink: 0,
                        }}
                      >
                        <PackageX size={18} />
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color:
                              theme.colors.text,
                          }}
                        >
                          {t("waste.product")}{" "}
                          {index + 1}
                        </div>

                        {selectedProduct && (
                          <div
                            style={{
                              marginTop: 3,
                              fontSize: 12,
                              color:
                                theme.colors
                                  .textSecondary,
                              maxWidth: 300,
                              overflow: "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {selectedProduct.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {items.length > 1 && (
                      <AppButton
                        variant="ghost"
                        size="sm"
                        leftIcon={
                          <Trash2 size={15} />
                        }
                        onClick={() =>
                          removeRow(index)
                        }
                        style={{
                          color:
                            theme.colors.danger,
                          flexShrink: 0,
                        }}
                      >
                        {t(
                          "waste.removeItem"
                        )}
                      </AppButton>
                    )}
                  </div>

                  {/* ==================================================
                      BASIC FIELDS
                  ================================================== */}

                  <div
                    style={responsiveGridStyle}
                  >
                    {/* ======================================
                        CATEGORY
                    ====================================== */}

                    <AppFormField
                      label={t(
                        "products.category"
                      )}
                      required
                    >
                      <AppSelect
                        value={
                          item.productCategory ||
                          ""
                        }
                        onChange={(e) =>
                          updateItem(
                            index,
                            "productCategory",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          {t(
                            "products.selectCategory"
                          )}
                        </option>

                        {categoryOptions.map(
                          (category) => (
                            <option
                              key={
                                category.value
                              }
                              value={
                                category.value
                              }
                            >
                              {category.label}
                            </option>
                          )
                        )}
                      </AppSelect>
                    </AppFormField>

                    {/* ======================================
                        PRODUCT
                    ====================================== */}

                    <AppFormField
                      label={t(
                        "products.select"
                      )}
                      required
                    >
                      <AppSelect
                        value={
                          item.productId || ""
                        }
                        disabled={
                          !item.productCategory
                        }
                        onChange={(e) =>
                          updateItem(
                            index,
                            "productId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          {!item.productCategory
                            ? t(
                                "products.selectCategory"
                              )
                            : t(
                                "products.select"
                              )}
                        </option>

                        {categoryProducts.map(
                          (product) => {
                            const stock =
                              getProductStock(
                                product.id
                              );

                            return (
                              <option
                                key={
                                  product.id
                                }
                                value={
                                  product.id
                                }
                                disabled={
                                  stock <= 0
                                }
                              >
                                {product.name}
                                {stock <= 0
                                  ? ` — ${t(
                                      "products.outOfStock"
                                    )}`
                                  : ""}
                              </option>
                            );
                          }
                        )}
                      </AppSelect>
                    </AppFormField>

                    {/* ======================================
                        QUANTITY
                    ====================================== */}

                    <AppFormField
                      label={t(
                        "common.qty"
                      )}
                      required
                    >
                      <AppInput
                        type="number"
                        min="1"
                        step="1"
                        max={
                          availableStock > 0
                            ? availableStock
                            : undefined
                        }
                        value={
                          item.quantity || ""
                        }
                        disabled={
                          !item.productId ||
                          availableStock <= 0
                        }
                        placeholder={t(
                          "common.qty"
                        )}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                      />
                    </AppFormField>

                   

                    {/* ======================================
                        WASTE TYPE
                    ====================================== */}

                    <AppFormField
                      label={t("waste.type")}
                      required
                    >
                      <AppSelect
                        value={
                          item.wasteType || ""
                        }
                        disabled={
                          !item.productId
                        }
                        onChange={(e) =>
                          updateItem(
                            index,
                            "wasteType",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          {t(
                            "waste.selectType"
                          )}
                        </option>

                        <option
                          value={
                            WASTE_TYPES.TESTER
                          }
                        >
                          {t(
                            "waste.types.tester"
                          )}
                        </option>

                        <option
                          value={
                            WASTE_TYPES.ATASHEH
                          }
                        >
                          {t(
                            "waste.types.atasheh"
                          )}
                        </option>

                        <option
                          value={
                            WASTE_TYPES.DAMAGE
                          }
                        >
                          {t(
                            "waste.types.damage"
                          )}
                        </option>

                        <option
                          value={
                            WASTE_TYPES.OTHER
                          }
                        >
                          {t(
                            "waste.types.other"
                          )}
                        </option>
                      </AppSelect>
                    </AppFormField>
                  </div>

                  {/* ==================================================
                      OTHER NOTES
                  ================================================== */}

                  {item.wasteType ===
                    WASTE_TYPES.OTHER && (
                    <div
                      style={{
                        marginTop:
                          theme.spacing.lg,
                      }}
                    >
                      <AppFormField
                        label={t(
                          "waste.notes"
                        )}
                        required
                      >
                        <AppTextarea
                          value={
                            item.note || ""
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "note",
                              e.target.value
                            )
                          }
                          placeholder={t(
                            "waste.otherNotesPlaceholder"
                          )}
                          rows={3}
                        />
                      </AppFormField>
                    </div>
                  )}

                  {/* ==================================================
                      STOCK INFO
                  ================================================== */}

                  {item.productId && (
                    <div
                      style={{
                        marginTop:
                          theme.spacing.md,
                        padding:
                          theme.spacing.sm,
                        borderRadius:
                          theme.radius.md,
                        background:
                          availableStock > 0
                            ? theme.colors
                                .cardSoft
                            : theme.colors
                                .dangerSoft,
                        color:
                          availableStock > 0
                            ? theme.colors
                                .textSecondary
                            : theme.colors
                                .danger,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {availableStock > 0
                        ? `${t(
                            "products.available"
                          )}: ${availableStock}`
                        : t(
                            "products.outOfStock"
                          )}
                    </div>
                  )}
                </AppCard>
              );
            })}
          </div>

          {/* ==================================================
              ADD ITEM
          ================================================== */}

          <div>
            <AppButton
              variant="outlinePrimary"
              size="md"
              leftIcon={<Plus size={17} />}
              onClick={addRow}
            >
              {t("waste.addItem")}
            </AppButton>
          </div>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop:
                theme.spacing.sm,
            }}
          >
            <AppButton
              variant="danger"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
              leftIcon={
                <Recycle size={18} />
              }
              onClick={handleWaste}
            >
              {t("waste.add")}
            </AppButton>
          </div>
        </div>
      </AppSection>

      {/* ==================================================
          HISTORY
      ================================================== */}

      <AppSection
        title={t("waste.history")}
        subtitle={`${wasteOperations.length} ${t("waste.operations")}`}
      >
        {wasteOperations.length === 0 ? (
          <AppEmptyState
            icon={<Recycle size={30} color={theme.colors.muted} />}
            title={t("waste.noWaste")}
            description={t("waste.noWasteDescription")}
          />
        ) : (
          <>
            {/* DESKTOP */}
            <div
              className="waste-history-desktop"
              style={{ display: "none" }}
            >
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    minWidth: 760,
                    display: "grid",
                    gridTemplateColumns: "1.5fr 2fr 1fr 1.5fr 34px",
                    gap: theme.spacing.md,
                    padding: theme.spacing.md,
                    background: theme.colors.cardSoft,
                    borderRadius: theme.radius.md,
                    marginBottom: theme.spacing.sm,
                    fontSize: 12,
                    fontWeight: 700,
                    color: theme.colors.textSecondary,
                  }}
                >
                  <div>{t("common.date")}</div>
                  <div>{t("products.select")}</div>
                  <div>{t("common.qty")}</div>
                  <div>{t("waste.type")}</div>
                  <div />
                </div>

                {wasteOperations.map((operation) => {
                  const typeLabels = Array.from(
                    new Set(
                      operation.items
                        .map((item) => item.wasteType)
                        .filter(Boolean)
                    )
                  );

                  return (
                    <button
                      key={operation.id}
                      type="button"
                      onClick={() => setSelectedOperation(operation)}
                      style={{
                        width: "100%",
                        minWidth: 760,
                        display: "grid",
                        gridTemplateColumns: "1.5fr 2fr 1fr 1.5fr 34px",
                        gap: theme.spacing.md,
                        alignItems: "center",
                        padding: theme.spacing.md,
                        border: "none",
                        borderBottom: `1px solid ${theme.colors.border}`,
                        background: "transparent",
                        color: theme.colors.text,
                        textAlign: "start",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                        {formatDate(operation.createdAt)}
                      </div>

                      <div style={{ fontWeight: 700 }}>
                        {operation.items.length === 1
                          ? getProductName(operation.items[0].productId)
                          : `${operation.items.length} ${t("waste.operations")}`}
                      </div>

                      <div>
                        <AppBadge color="danger">
                          {operation.totalQuantity}
                        </AppBadge>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {typeLabels.map((type) => (
                          <AppBadge
                            key={type}
                            color={type === WASTE_TYPES.OTHER ? "warning" : "primary"}
                          >
                            {getWasteTypeLabel(type)}
                          </AppBadge>
                        ))}
                      </div>

                      <ChevronRight size={17} color={theme.colors.textSecondary} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MOBILE */}
            <div
              className="waste-history-mobile"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.md,
              }}
            >
              {wasteOperations.map((operation) => {
                const typeLabels = Array.from(
                  new Set(
                    operation.items
                      .map((item) => item.wasteType)
                      .filter(Boolean)
                  )
                );

                return (
                  <AppCard
                    key={operation.id}
                    padding="lg"
                    onClick={() => setSelectedOperation(operation)}
                    style={{
                      border: `1px solid ${theme.colors.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: theme.spacing.md,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            marginBottom: 4,
                          }}
                        >
                          {operation.items.length === 1
                            ? getProductName(operation.items[0].productId)
                            : `${operation.items.length} ${t("waste.operations")}`}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                          }}
                        >
                          {formatDate(operation.createdAt)}
                        </div>
                      </div>

                      <AppBadge
                        color="danger"
                        icon={<PackageX size={13} />}
                      >
                        {operation.totalQuantity}
                      </AppBadge>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: theme.spacing.sm,
                        marginTop: theme.spacing.md,
                      }}
                    >
                      {typeLabels.map((type) => (
                        <AppBadge
                          key={type}
                          color={type === WASTE_TYPES.OTHER ? "warning" : "primary"}
                        >
                          {getWasteTypeLabel(type)}
                        </AppBadge>
                      ))}

                      <AppBadge color="secondary">
                        {operation.items.length} {t("waste.addItem")}
                      </AppBadge>
                    </div>
                  </AppCard>
                );
              })}
            </div>
          </>
        )}
      </AppSection>

      {/* ==================================================
          OPERATION DETAILS DRAWER
      ================================================== */}

      <AppDrawer
        open={Boolean(selectedOperation)}
        onClose={() => setSelectedOperation(null)}
        side={lang === "ar" ? "left" : "right"}
        width="460px"
      >
        {selectedOperation && (
          <div style={{ padding: theme.spacing.xl }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: theme.spacing.md,
                marginBottom: theme.spacing.xl,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  {t("waste.history")}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {formatDate(selectedOperation.createdAt)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOperation(null)}
                title={t("common.cancel")}
                style={{
                  width: 36,
                  height: 36,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  background: theme.colors.cardSoft,
                  color: theme.colors.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: theme.spacing.md,
                marginBottom: theme.spacing.xl,
              }}
            >
              <div style={{ padding: theme.spacing.md, background: theme.colors.cardSoft, borderRadius: theme.radius.md }}>
                <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                  {t("common.qty")}
                </div>
                <div style={{ marginTop: 5, fontSize: 20, fontWeight: 800 }}>
                  {selectedOperation.totalQuantity}
                </div>
              </div>

              <div style={{ padding: theme.spacing.md, background: theme.colors.cardSoft, borderRadius: theme.radius.md }}>
                <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                  {t("waste.operations")}
                </div>
                <div style={{ marginTop: 5, fontSize: 20, fontWeight: 800 }}>
                  {selectedOperation.items.length}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.md,
              }}
            >
              {selectedOperation.items.map((item, index) => (
                <div
                  key={item.id || `${item.productId}-${index}`}
                  style={{
                    padding: theme.spacing.lg,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.lg,
                    background: theme.colors.cardSoft,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: theme.spacing.md,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>
                        {getProductName(item.productId)}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {t("waste.product")} {index + 1}
                      </div>
                    </div>

                    <AppBadge color="danger">
                      {item.quantity}
                    </AppBadge>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: theme.spacing.sm,
                      marginBottom: item.note ? theme.spacing.md : 0,
                    }}
                  >
                    <AppBadge
                      color={
                        item.wasteType === WASTE_TYPES.OTHER
                          ? "warning"
                          : "primary"
                      }
                    >
                      {getWasteTypeLabel(item.wasteType)}
                    </AppBadge>
                  </div>

                  {item.note && (
                    <div
                      style={{
                        padding: theme.spacing.md,
                        background: theme.colors.card,
                        borderRadius: theme.radius.md,
                        color: theme.colors.textSecondary,
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </AppDrawer>

      {/* ==================================================
          TOAST
      ================================================== */}

      {showToast && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform:
              "translateX(-50%)",
            zIndex: 9999,
            maxWidth:
              "calc(100vw - 32px)",
            padding: "12px 18px",
            borderRadius:
              theme.radius.md,
            background:
              theme.colors.primary,
            color:
              theme.colors.white,
            fontSize: 14,
            fontWeight: 600,
            boxShadow:
              theme.shadow.lg,
            textAlign: "center",
          }}
        >
          {toastText}
        </div>
      )}

      {/* ==================================================
          RESPONSIVE STYLE
      ================================================== */}

      <style>
        {`
          @media (min-width: 768px) {
            .waste-history-desktop {
              display: block !important;
            }

            .waste-history-mobile {
              display: none !important;
            }
          }

          @media (max-width: 767px) {
            .waste-history-desktop {
              display: none !important;
            }

            .waste-history-mobile {
              display: flex !important;
            }
          }

          @media (max-width: 640px) {
            .waste-page {
              padding: 16px !important;
            }
          }
        `}
      </style>
    </div>
  );
}
import AppModal from "../ui/AppModal";
import AppCard from "../ui/AppCard";
import AppButton from "../ui/AppButton";

import { X } from "lucide-react";

import { theme } from "../../theme";

export default function ProductHistoryModal({
  selectedProductHistory,
  setSelectedProductHistory,
  productHistory,
}) {
  if (!selectedProductHistory) {
    return null;
  }

  const closeModal = () => {
    setSelectedProductHistory(null);
  };

  const getActionConfig = (action) => {
    switch (action) {
      case "CREATE_PRODUCT":
        return {
          label: "➕ Product Created",
          color: theme.colors.success,
        };

      case "UPDATE_PRODUCT":
        return {
          label: "✏️ Product Updated",
          color: theme.colors.warning,
        };

      case "ARCHIVE_PRODUCT":
        return {
          label: "📦 Product Archived",
          color: theme.colors.danger,
        };

      case "RESTORE_PRODUCT":
        return {
          label: "♻️ Product Restored",
          color: theme.colors.info,
        };

      case "TRANSFER_STOCK":
        return {
          label: "🔄 Stock Transfer",
          color: theme.colors.primary,
        };

      case "ADJUST_STOCK":
        return {
          label: "⚖️ Stock Adjustment",
          color: theme.colors.purple,
        };

      case "UNDO_TRANSFER":
        return {
          label: "↩️ Transfer Reversed",
          color: theme.colors.danger,
        };

      case "UNDO_ADJUSTMENT":
        return {
          label: "↩️ Adjustment Reversed",
          color: theme.colors.danger,
        };

      case "EDIT_ACTIVITY":
        return {
          label: "✏️ Activity Edited",
          color: theme.colors.warning,
        };

      default:
        return {
          label: action || "Unknown Action",
          color: theme.colors.gray,
        };
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };
  const getFieldLabel = (field) => {
  const labels = {
    name: "Product Name",
    type: "Product Type",
    category: "Category",
    subCategory: "Sub Category",
    oilCategory: "Oil Category",
    pricingTier: "Pricing Tier",
    muskType: "Musk Type",
    costPrice: "Cost Price",
    sellingPrice: "Selling Price",
    minStock: "Minimum Stock",
  };

  return labels[field] || field;
};
const getFieldValue = (field, value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  const mappings = {
    type: {
      oil: "Oil",
      container: "Container",
      product: "Product",
      original: "Original",
      packaging: "Packaging",
    },

    category: {
      French: "French",
      "Oriental-A": "Oriental A",
      "Oriental-B": "Oriental B",
      "Oriental-C": "Oriental C",
      Musk: "Musk",
      Original: "Original",
      container: "Container",
      Cream: "Cream",
      Makhmaria: "Makhmaria",
    },

    subCategory: {
      bottle: "Bottle",
      box: "Box",
      sample: "Sample",
    },

    oilCategory: {
      French: "French",
      Oriental: "Oriental",
      Musk: "Musk",
    },

    pricingTier: {
      French: "French",
      A: "Oriental A",
      B: "Oriental B",
      C: "Oriental C",
      tahara: "Tahara",
      rumman: "Rumman",
      crystal: "Crystal",
    },

    muskType: {
      tahara: "Tahara",
      rumman: "Rumman",
      crystal: "Crystal",
    },
  };

  return (
    mappings[field]?.[value] ??
    formatValue(value)
  );
};
  const getChangedFields = (before = {}, after = {}) => {
    const keys = Array.from(
      new Set([
        ...Object.keys(before || {}),
        ...Object.keys(after || {}),
      ])
    );

    return keys.filter(
      (key) =>
        JSON.stringify(before?.[key]) !==
        JSON.stringify(after?.[key])
    );
  };

  const renderProductChanges = (item) => {
    if (
      item.action !== "UPDATE_PRODUCT" ||
      !item.before ||
      !item.after
    ) {
      return null;
    }

    const changedFields = getChangedFields(
      item.before,
      item.after
    );

    if (changedFields.length === 0) {
      return null;
    }

    return (
      <div
        style={{
          marginTop: theme.spacing.md,
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          background: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            marginBottom: theme.spacing.sm,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          Changed Fields
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          {changedFields.map((field) => (
            <div
              key={field}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: theme.colors.textSecondary,
                }}
              >
                {getFieldLabel(field)}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: theme.colors.text,
                }}
              >
                <span
                  style={{
                    color: theme.colors.danger,
                    textDecoration: "line-through",
                  }}
                >
                  {getFieldValue(
  field,
  item.before?.[field]
)}
                </span>

                <span
                  style={{
                    margin: "0 8px",
                    color: theme.colors.muted,
                  }}
                >
                  →
                </span>

                <span
                  style={{
                    color: theme.colors.success,
                    fontWeight: 700,
                  }}
                >
                  {getFieldValue(
  field,
  item.after?.[field]
)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTransferDetails = (item) => {
    if (item.action !== "TRANSFER_STOCK") {
      return null;
    }

    const details = item.details || {};

    return (
      <div
        style={{
          marginTop: theme.spacing.md,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.sm,
        }}
      >
        <p
          style={{
            margin: 0,
            color: theme.colors.text,
            fontSize: 13,
          }}
        >
          📦 <strong>Qty:</strong>{" "}
          {formatValue(details.qty)}
        </p>

        <p
          style={{
            margin: 0,
            color: theme.colors.text,
            fontSize: 13,
          }}
        >
          📤 <strong>From:</strong>{" "}
          {formatValue(details.fromBranchName)}
        </p>

        <p
          style={{
            margin: 0,
            color: theme.colors.text,
            fontSize: 13,
          }}
        >
          📥 <strong>To:</strong>{" "}
          {formatValue(details.toBranchName)}
        </p>
      </div>
    );
  };

  const renderAdjustmentDetails = (item) => {
    if (item.action !== "ADJUST_STOCK") {
      return null;
    }

    const details = item.details || {};

    return (
      <div
        style={{
          marginTop: theme.spacing.md,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.sm,
        }}
      >
        <p
          style={{
            margin: 0,
            color: theme.colors.text,
            fontSize: 13,
          }}
        >
          🏢 <strong>Branch:</strong>{" "}
          {formatValue(item.branchName)}
        </p>

        <p
          style={{
            margin: 0,
            color: theme.colors.text,
            fontSize: 13,
          }}
        >
          📦 <strong>Qty:</strong>{" "}
          {formatValue(details.qty)}
        </p>

        <p
          style={{
            margin: 0,
            color: theme.colors.text,
            fontSize: 13,
          }}
        >
          ⚖️ <strong>Type:</strong>{" "}
          {details.adjustType === "increase"
            ? "Increase ➕"
            : details.adjustType === "decrease"
            ? "Decrease ➖"
            : "-"}
        </p>

        {details.reason && (
          <p
            style={{
              margin: 0,
              color: theme.colors.text,
              fontSize: 13,
            }}
          >
            📝 <strong>Reason:</strong>{" "}
            {details.reason}
          </p>
        )}
      </div>
    );
  };

  const renderUndoDetails = (item) => {
    if (
      item.action !== "UNDO_TRANSFER" &&
      item.action !== "UNDO_ADJUSTMENT"
    ) {
      return null;
    }

    return (
      <div
        style={{
          marginTop: theme.spacing.md,
          padding: theme.spacing.sm,
          borderRadius: theme.radius.md,
          background: theme.colors.dangerSoft,
          color: theme.colors.danger,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        This operation was reversed.
      </div>
    );
  };

  return (
    <AppModal
      open={!!selectedProductHistory}
      onClose={closeModal}
      width="500px"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.lg,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: theme.colors.text,
            }}
          >
            🕘 Product History
          </h3>

          <div
            style={{
              marginTop: theme.spacing.xs,
              fontSize: 12,
              color: theme.colors.textSecondary,
            }}
          >
            {selectedProductHistory.name}
          </div>
        </div>

        <AppButton
          variant="secondary"
          size="sm"
          onClick={closeModal}
          style={{
            width: 36,
            height: 36,
            minWidth: 36,
            padding: 0,
            borderRadius: theme.radius.md,
          }}
        >
          <X size={17} />
        </AppButton>
      </div>

      {/* Timeline */}
      <div
        style={{
          maxHeight: "65vh",
          overflowY: "auto",
          paddingRight: theme.spacing.xs,
        }}
      >
        {productHistory.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: theme.spacing.xxl,
              color: theme.colors.textSecondary,
            }}
          >
            No history available
          </div>
        ) : (
          productHistory.map((item, index) => {
            const actionConfig =
              getActionConfig(item.action);

            return (
              <div
                key={item.id || index}
                style={{
                  position: "relative",
                  paddingLeft: 28,
                  marginBottom:
                    index === productHistory.length - 1
                      ? 0
                      : theme.spacing.xl,
                }}
              >
                {/* Timeline Line */}
                {index !== productHistory.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 7,
                      top: 20,
                      bottom: -24,
                      width: 2,
                      background: theme.colors.border,
                    }}
                  />
                )}

                {/* Timeline Dot */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 6,
                    width: 16,
                    height: 16,
                    borderRadius: theme.radius.full,
                    background: actionConfig.color,
                    boxShadow: `0 0 0 4px ${actionConfig.color}20`,
                  }}
                />

                {/* History Card */}
                <AppCard
                  bordered
                  padding="md"
                  radius="md"
                  shadow="sm"
                  style={{
                    background: theme.colors.cardSoft,
                    border: `1px solid ${actionConfig.color}20`,
                  }}
                >
                  {/* Action */}
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontWeight: 800,
                      color: actionConfig.color,
                    }}
                  >
                    {actionConfig.label}
                  </p>

                  {/* User */}
                  <p
                    style={{
                      margin: "0 0 5px",
                      color: theme.colors.text,
                      fontSize: 13,
                    }}
                  >
                    👤{" "}
                    {item.performedByName ||
                      "Unknown"}
                  </p>

                  {/* Branch */}
                  {item.branchName && (
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: theme.colors.text,
                        fontSize: 13,
                      }}
                    >
                      🏢 {item.branchName}
                    </p>
                  )}

                  {/* Target */}
                  {item.targetName && (
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: theme.colors.text,
                        fontSize: 13,
                      }}
                    >
                      📦 {item.targetName}
                    </p>
                  )}

                  {/* Product Create */}
                  {item.action === "CREATE_PRODUCT" &&
                    item.after && (
                      <div
                        style={{
                          marginTop: theme.spacing.md,
                          display: "flex",
                          flexDirection: "column",
                          gap: theme.spacing.sm,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: theme.colors.text,
                          }}
                        >
                          <strong>Type:</strong>{" "}
                          {formatValue(
                            item.after.type
                          )}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: theme.colors.text,
                          }}
                        >
                          <strong>Name:</strong>{" "}
                          {formatValue(
                            item.after.name
                          )}
                        </p>
                      </div>
                    )}

                  {/* Product Changes */}
                  {renderProductChanges(item)}

                  {/* Transfer */}
                  {renderTransferDetails(item)}

                  {/* Adjustment */}
                  {renderAdjustmentDetails(item)}

                  {/* Undo */}
                  {renderUndoDetails(item)}

                  {/* Time */}
                  <p
                    style={{
                      margin: theme.spacing.md + " 0 0",
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    🕒{" "}
                    {item.createdAt?.toDate
                      ? item.createdAt
                          .toDate()
                          .toLocaleString()
                      : item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString()
                      : "-"}
                  </p>
                </AppCard>
              </div>
            );
          })
        )}
      </div>
    </AppModal>
  );
}
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
              marginTop: 4,
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
            borderRadius: 10,
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
          paddingRight: 4,
        }}
      >
        {productHistory.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px 10px",
              color: theme.colors.textSecondary,
            }}
          >
            No history available
          </div>
        ) : (
          productHistory.map((item, index) => {
            const actionLabel =
              item.action === "create"
                ? "➕ Product Created"
                : item.action === "edit"
                ? "✏️ Product Edited"
                : item.action === "archive"
                ? "📦 Product Archived"
                : item.action === "restore"
                ? "♻️ Product Restored"
                : item.actionType === "transfer"
                ? "🔄 Transfer"
                : "⚖️ Stock Adjustment";

            const actionColor =
              item.action === "create"
                ? theme.colors.success
                : item.action === "edit"
                ? theme.colors.warning
                : item.action === "archive"
                ? theme.colors.danger
                : item.action === "restore"
                ? theme.colors.info
                : item.actionType === "transfer"
                ? theme.colors.primary
                : theme.colors.purple;

            return (
              <div
                key={index}
                style={{
                  position: "relative",
                  paddingLeft: 28,
                  marginBottom:
                    index === productHistory.length - 1
                      ? 0
                      : 24,
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
                    borderRadius: "50%",
                    background: actionColor,
                    boxShadow: `0 0 0 4px ${actionColor}20`,
                  }}
                />

                {/* History Card */}
                <AppCard
                  style={{
                    padding: 15,
                    borderRadius: 14,
                    background: theme.colors.cardSoft,
                    border: `1px solid ${actionColor}20`,
                    boxShadow: theme.shadow.sm,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontWeight: 800,
                      color: actionColor,
                    }}
                  >
                    {actionLabel}
                  </p>

                  <p
                    style={{
                      margin: "0 0 5px",
                      color: theme.colors.text,
                      fontSize: 13,
                    }}
                  >
                    👤 {item.user}
                  </p>

                  {item.qty && (
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: theme.colors.text,
                        fontSize: 13,
                      }}
                    >
                      📦 Qty: {item.qty}
                    </p>
                  )}

                  {item.fromBranch && (
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: theme.colors.text,
                        fontSize: 13,
                      }}
                    >
                      📤 From: {item.fromBranch}
                    </p>
                  )}

                  {item.toBranch && (
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: theme.colors.text,
                        fontSize: 13,
                      }}
                    >
                      📥 To: {item.toBranch}
                    </p>
                  )}

                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    🕒{" "}
                    {item.createdAt?.toDate
                      ? new Date(
                          item.createdAt.toDate()
                        ).toLocaleString()
                      : new Date(
                          item.createdAt
                        ).toLocaleString()}
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
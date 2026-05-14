import {
  Plus,
  Minus,
  Trash2,
  Pencil
} from "lucide-react";

const btnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px",
  borderRadius: "8px",
  border: "none",
  background: "#f1f5f9",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

export default function CartItemCard({
  item,
  theme,
  increaseQty,
  decreaseQty,
  removeItem,
  productsWithStock,
  popupActions
}) {

  const {
    setSelectedProduct,
    setSelectedSize,
    setContainerType,
    setOilQty,
    setShowPopup
  } = popupActions;

  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "16px",
        padding: "14px",
        minHeight: "90px",
        marginBottom: "10px",
        background: theme.colors.card,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (
        e.currentTarget.style.transform = "scale(1.02)"
      )}
      onMouseLeave={(e) => (
        e.currentTarget.style.transform = "scale(1)"
      )}
    >

      {/* Top */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>

        <div style={{
          fontWeight: "700",
          fontSize: "14px"
        }}>
          {item.name}
        </div>

        <div style={{
          fontWeight: "700",
          color: theme.colors.primary
        }}>
          {item.price * item.qty} EGP
        </div>
      </div>

      {/* Details */}
      <div style={{
        fontSize: "12px",
        color: theme.colors.textSecondary
      }}>
        {item.containerName || item.containerType}
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>

        {/* Qty */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: `1px solid ${theme.colors.border}`,
          borderRadius: "10px",
          padding: "4px 8px"
        }}>

          <button
            onClick={() => decreaseQty(item)}
            style={btnStyle}
          >
            <Minus size={16} />
          </button>

          <span>{item.qty}</span>

          <button
            onClick={() => increaseQty(item)}
            style={btnStyle}
          >
            <Plus size={16} />
          </button>

        </div>

        {/* Actions */}
        <div style={{
          display: "flex",
          gap: "6px"
        }}>

          <button
            onClick={() => removeItem(item)}
            style={{
              ...btnStyle,
              color: "#ef4444"
            }}
          >
            <Trash2 size={16} />
          </button>

          {!item.isReturned && (
            <button
              onClick={() => {

                const product = productsWithStock.find(
                  p => p.id === item.id
                );

                if (!product) return;

                setSelectedProduct(product);

                setSelectedSize({
                  id: item.size,
                  name: item.sizeLabel
                });

                setContainerType(item.containerType);

                setOilQty(item.oilQty || 0);

                removeItem(item);

                setShowPopup(true);
              }}
              style={btnStyle}
            >
              <Pencil size={16} />
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
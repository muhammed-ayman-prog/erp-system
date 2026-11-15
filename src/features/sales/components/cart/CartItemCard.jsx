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
    setSecondOil,
    setSecondOilQty,
    setShowPopup,
    setEditingItem
  } = popupActions;

  // دعم الخلطات الجديدة والفواتير القديمة ذات الزيت الواحد
  const oilComponents =
    item.containerType !== "oil"
      ? (
          Array.isArray(item.oilComponents) &&
          item.oilComponents.length > 0
            ? item.oilComponents
            : Number(item.oilQty) > 0
              ? [{
                  oilId: item.oilId || item.id,
                  oilName: item.oilName || item.name,
                  oilCategory: item.oilCategory || "",
                  quantityML: Number(item.oilQty),
                  costPerML: Number(item.oilCostPerML) || 0,
                  cost: Number(item.oilCost) || 0
                }]
              : []
        )
      : [];

  const handleEdit = () => {
    const product = productsWithStock.find(
      p => String(p.id) === String(item.id)
    );

    if (!product) return;

    // الزيت الثاني إن وجد
    const secondOilComponent = oilComponents[1];

    const secondOilProduct = secondOilComponent
      ? productsWithStock.find(
          p =>
            String(p.id) ===
            String(
              secondOilComponent.oilId ||
              secondOilComponent.id
            )
        ) || {
            id:
              secondOilComponent.oilId ||
              secondOilComponent.id,
            name: secondOilComponent.oilName || "الزيت الثاني",
            category: secondOilComponent.oilCategory || "",
            cost: Number(secondOilComponent.costPerML) || 0
          }
      : null;

    setEditingItem(item);

    setSelectedProduct(product);

    setSelectedSize({
      id: item.containerId || item.size,
      name: item.sizeLabel || item.containerName || item.size,
      size: item.size,
      cost: Number(item.containerCost) || 0,
      price: Number(item.unitPrice ?? item.price) || 0,
      sellingPrice: Number(item.unitPrice ?? item.price) || 0
    });

    setContainerType(item.containerType);

    // استرجاع كمية الزيت الأول
    setOilQty(
      Number(
        item.oilQty ??
        oilComponents[0]?.quantityML ??
        item.selectedMl ??
        0
      )
    );

    // استرجاع الزيت الثاني وكميته
    setSecondOil(secondOilProduct);

    setSecondOilQty(
      Number(
        secondOilComponent?.quantityML ??
        secondOilComponent?.oilQty ??
        0
      )
    );

    // لا نحذف العنصر من السلة عند فتح التعديل
    setShowPopup(true);
  };

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
        transition: "all 0.2s ease"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.02)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {/* Product Name and Price */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div
          style={{
            fontWeight: "700",
            fontSize: "14px"
          }}
        >
          {item.name}
        </div>

        <div
          style={{
            fontWeight: "700",
            color: theme.colors.primary
          }}
        >
          {
            item.containerType === "oil"
              ? (
                  (item.pricePerMl || 0) *
                  (item.selectedMl ?? item.oilQty)
                ).toLocaleString()
              : (
                  (item.price || 0) * (item.qty || 1)
                ).toLocaleString()
          } EGP
        </div>
      </div>

      {/* Container Details */}
      <div
        style={{
          fontSize: "12px",
          color: theme.colors.textSecondary
        }}
      >
        {item.containerName || item.containerType}

        {item.containerType === "oil" && (
          <div>
            {item.selectedMl ?? item.oilQty} ml
          </div>
        )}
      </div>

      {/* Oil Blend Details */}
      {oilComponents.length > 0 && (
        <div
          style={{
            padding: "9px 10px",
            borderRadius: "10px",
            background: theme.colors.cardSoft,
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "12px",
              color: theme.colors.text
            }}
          >
            تركيبة الزيوت
          </div>

          {oilComponents.map((component, index) => (
            <div
              key={`${component.oilId || component.id || index}_${index}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "12px"
              }}
            >
              <span>
                {component.oilName || `الزيت ${index + 1}`}
              </span>

              <strong>
                {Number(
                  component.quantityML ??
                  component.oilQty ??
                  0
                )} ml
              </strong>
            </div>
          ))}
        </div>
      )}

      {/* Quantity Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "10px",
            padding: "4px 8px"
          }}
        >
          <button
            onClick={() => decreaseQty(item)}
            style={btnStyle}
          >
            <Minus size={16} />
          </button>

          <span>
            {item.containerType === "oil"
              ? `${item.selectedMl ?? item.oilQty} ml`
              : item.qty}
          </span>

          <button
            onClick={() => increaseQty(item)}
            style={btnStyle}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "6px"
          }}
        >
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
              onClick={handleEdit}
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
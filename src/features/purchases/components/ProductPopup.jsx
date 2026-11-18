
import { useEffect, useRef, useState } from "react";
import {
  Minus,
  Plus,
  Package,
  Droplets,
  Box,
} from "lucide-react";

import AppFormDialog from "../../../components/ui/AppFormDialog";
import AppButton from "../../../components/ui/AppButton";
import AppInput from "../../../components/ui/AppInput";
import AppFormField from "../../../components/ui/AppFormField";
import AppBadge from "../../../components/ui/AppBadge";

import { theme } from "../../../theme";
import { useTranslate } from "../../../useTranslate";
import { usePurchaseContext } from "../context/PurchaseContext";

const getIcon = (category) => {
  const cat = (category || "").toLowerCase();

  if (cat.includes("container")) {
    return <Box size={42} />;
  }

  if (
    cat.includes("french") ||
    cat.includes("oriental") ||
    cat.includes("oil")
  ) {
    return <Droplets size={42} />;
  }

  return <Package size={42} />;
};

export default function ProductPopup() {
  const { t } = useTranslate();

  const {
    popupOpen,
    setPopupOpen,
    selectedProduct,
    setSelectedProduct,
    addToCart,
  } = usePurchaseContext();

  const [quantity, setQuantity] = useState("");
  const quantityInputRef = useRef(null);

  useEffect(() => {
    if (!popupOpen) return;

    setQuantity("");

    // التركيز على خانة الكمية بعد فتح الـ Popup
    const timer = setTimeout(() => {
      quantityInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [popupOpen, selectedProduct]);

  useEffect(() => {
    if (!popupOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [popupOpen, quantity, selectedProduct]);

  const close = () => {
    setPopupOpen(false);
    setSelectedProduct(null);
    setQuantity("");
  };

  const handleAdd = () => {
    if (!selectedProduct) return;

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      quantityInputRef.current?.focus();
      return;
    }

    addToCart(selectedProduct, parsedQuantity);

    close();
  };

  if (!selectedProduct) {
    return null;
  }

  return (
    <AppFormDialog
      open={popupOpen}
      onClose={close}
      width={520}
      title={selectedProduct.name}
      onSubmit={handleAdd}
      submitLabel={t("common.add")}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.xl,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.colors.cardSoft,
              color: theme.colors.primary,
            }}
          >
            {getIcon(selectedProduct.category)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: theme.colors.text,
            }}
          >
            {selectedProduct.name}
          </div>

          <div style={{ marginTop: theme.spacing.sm }}>
            <AppBadge>
              {selectedProduct.category}
            </AppBadge>
          </div>
        </div>

        
<AppFormField
  label={t("common.quantity")}
>
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
    }}
  >
    <AppButton
      variant="secondary"
      onClick={() =>
        setQuantity((q) =>
          q === "" ? "" : String(Math.max(1, Number(q) - 1))
        )
      }
    >
      <Minus size={18} />
    </AppButton>

    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <AppInput
        ref={quantityInputRef}
        type="number"
        min={1}
        step={1}
        required
        value={quantity}
        onChange={(e) =>
          setQuantity(e.target.value)
        }
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 18,
        }}
      />

      {/* Quick Quantity Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 6,
        }}
      >
        {[125, 250, 500, 1000].map((amount) => {
          const isSelected =
            String(quantity) === String(amount);

          return (
            <button
              key={amount}
              type="button"
              onClick={() =>
                setQuantity(String(amount))
              }
              style={{
                padding: "8px 4px",
                borderRadius: theme.radius.md,
                border: `1px solid ${
                  isSelected
                    ? theme.colors.primary
                    : theme.colors.border
                }`,
                background: isSelected
                  ? theme.colors.primary
                  : theme.colors.secondary,
                color: isSelected
                  ? "#fff"
                  : theme.colors.text,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "0.15s ease",
              }}
            >
              {amount.toLocaleString("en-US")}
            </button>
          );
        })}
      </div>
    </div>

    <AppButton
      variant="secondary"
      onClick={() =>
        setQuantity((q) =>
          q === "" ? "1" : String(Number(q) + 1)
        )
      }
    >
      <Plus size={18} />
    </AppButton>
  </div>
</AppFormField>


        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AppBadge variant="outline" size="md">
            {selectedProduct.category}
          </AppBadge>
        </div>
      </div>
    </AppFormDialog>
  );
}

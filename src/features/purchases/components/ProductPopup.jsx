import { useEffect, useState } from "react";
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

  const [quantity, setQuantity] =
    useState(1);

  useEffect(() => {
    if (popupOpen) {
      setQuantity(1);
    }
  }, [popupOpen]);

  useEffect(() => {
    if (!popupOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleAdd();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [popupOpen, quantity, selectedProduct]);

  const close = () => {
    setPopupOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleAdd = () => {
    if (!selectedProduct) return;

    addToCart(
      selectedProduct,
      quantity
    );

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
              background:
                theme.colors.cardSoft,
              color:
                theme.colors.primary,
            }}
          >
            {getIcon(
              selectedProduct.category
            )}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: theme.colors.text,
            }}
          >
            {selectedProduct.name}
          </div>

          <div
            style={{
              marginTop:
                theme.spacing.sm,
            }}
          >
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
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <AppButton
              variant="secondary"
              onClick={() =>
                setQuantity((q) =>
                  Math.max(1, q - 1)
                )
              }
            >
              <Minus size={18} />
            </AppButton>

            <AppInput
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Number(
                      e.target.value
                    ) || 1
                  )
                )
              }
              style={{
                flex: 1,
                textAlign: "center",
                fontWeight: 700,
                fontSize: 18,
              }}
            />

            <AppButton
              variant="secondary"
              onClick={() =>
                setQuantity((q) => q + 1)
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
          <AppBadge
            variant="outline"
            size="md"
          >
            {selectedProduct.category}
          </AppBadge>
        </div>
      </div>
    </AppFormDialog>
  );
}
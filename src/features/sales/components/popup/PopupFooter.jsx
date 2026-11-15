import AppButton from "../../../../components/ui/AppButton";

export default function PopupFooter({
  isValid,
  needsOil,
  oilQty,
  price,

  selectedProduct,
  selectedSize,

  containerType,

  oilCostPerML,

  // الزيت الثاني
  secondOil,
  secondOilQty,

  addToCart,
  updateCartItem,

  editingItem,

  setToastText,
  setShowToast,

  resetPopup,

  theme,
  t
}) {
  const saleModeMap = {
    oil: "PURE_OIL",
    bottle: "BOTTLE",
    box: "BOX",
    sample: "SAMPLE"
  };

  return (
    <div className="popup-footer">
      <AppButton
        variant="secondary"
        onClick={resetPopup}
        style={{ flex: 1 }}
      >
        {t("common.close")}
      </AppButton>

      <AppButton
        className={`popup-submit ${
          !isValid ? "disabled" : ""
        }`}
        onClick={() => {
          // ==================================
          // 1) PREPARE QUANTITIES
          // ==================================

          const firstOilQty = Number(oilQty) || 0;
          const secondQty = Number(secondOilQty) || 0;

          const isBlendedOil =
            needsOil && containerType !== "oil";

          // ==================================
          // 2) VALIDATE FIRST OIL
          // ==================================

          if (
            needsOil &&
            !(firstOilQty > 0)
          ) {
            setToastText(t("products.enterOilQty"));
            setShowToast(true);
            return;
          }

          // ==================================
          // 3) VALIDATE SECOND OIL
          // ==================================

          if (
            isBlendedOil &&
            secondOil &&
            !(secondQty > 0)
          ) {
            setToastText("ادخل كمية الزيت الثاني");
            setShowToast(true);
            return;
          }

          // ==================================
          // 4) PREVENT SAME OIL TWICE
          // ==================================

          if (
            isBlendedOil &&
            secondOil &&
            String(secondOil.id) ===
              String(selectedProduct.id)
          ) {
            setToastText("لا يمكن اختيار نفس الزيت مرتين");
            setShowToast(true);
            return;
          }

          // ==================================
          // 5) VALIDATE PRODUCT
          // ==================================

          if (!isValid) {
            setToastText(t("products.noPrice"));
            setShowToast(true);
            return;
          }

          if (!price || price <= 0) {
            setToastText(t("products.noPrice"));
            setShowToast(true);
            return;
          }

          if (!selectedProduct?.id) {
            setToastText(t("common.error"));
            setShowToast(true);
            return;
          }

          // ==================================
          // 6) CALCULATE OIL COSTS
          // ==================================

          const firstOilCost =
            needsOil
              ? firstOilQty * (Number(oilCostPerML) || 0)
              : 0;

          const secondOilCost =
            isBlendedOil && secondOil
              ? secondQty * (Number(secondOil.cost) || 0)
              : 0;

          const oilCost =
            firstOilCost + secondOilCost;

          // ==================================
          // 7) BUILD OIL COMPONENTS
          // ==================================

          // الزيت الخام لا يستخدم تركيبة خلط
          const oilComponents = isBlendedOil
            ? [
                {
                  oilId: selectedProduct.id,
                  oilName: selectedProduct.name,
                  oilCategory: selectedProduct.category || "",
                  quantityML: firstOilQty,
                  costPerML: Number(oilCostPerML) || 0,
                  cost: firstOilCost
                },

                ...(secondOil
                  ? [
                      {
                        oilId: secondOil.id,
                        oilName: secondOil.name,
                        oilCategory: secondOil.category || "",
                        quantityML: secondQty,
                        costPerML: Number(secondOil.cost) || 0,
                        cost: secondOilCost
                      }
                    ]
                  : [])
              ]
            : [];

          // ==================================
          // 8) CALCULATE CONTAINER COST
          // ==================================

          const containerCost =
            containerType === "oil"
              ? 0
              : Number(selectedSize?.cost) || 0;

          const overheadCost = 0;

          // ==================================
          // 9) CALCULATE TOTAL COST & PROFIT
          // ==================================

          const unitCost =
            oilCost + containerCost + overheadCost;

          const profit =
            Number(price) - unitCost;

          const pricePerMl =
            containerType === "oil" && firstOilQty > 0
              ? Number(price) / firstOilQty
              : 0;

          const margin =
            Number(price) > 0
              ? Number(
                  ((profit / Number(price)) * 100).toFixed(2)
                )
              : 0;

          // ==================================
          // 10) BUILD CART ITEM
          // ==================================

          const item = {
            id: selectedProduct.id,
            name: selectedProduct.name,

            category: selectedProduct.category || "",
            subCategory: selectedProduct.subCategory || "",
            type: selectedProduct.type || "",

            stockQuantity: selectedProduct.quantity || 0,

            itemType: "BLENDED_ITEM",

            saleMode:
              saleModeMap[containerType] || "UNKNOWN",

            // البيانات القديمة للزيت الأول
            oilId: selectedProduct.id,
            oilName: selectedProduct.name,
            oilCategory: selectedProduct.category || "",
            oilQtyML: firstOilQty,
            oilQty: firstOilQty,

            // تركيبة الزيوت
            oilComponents,

            // بيانات العبوة
            size:
              selectedSize?.size ||
              selectedSize?.name ||
              "",

            containerType,

            containerName:
              containerType === "oil"
                ? "Pure Oil"
                : selectedSize?.name?.trim() || containerType,

            containerId:
              containerType === "oil"
                ? null
                : selectedSize?.id || null,

            // الأسعار والتكاليف
            unitPrice: Number(price) || 0,
            price: Number(price) || 0,

            oilCostPerML: Number(oilCostPerML) || 0,
            oilCost,
            containerCost,
            overheadCost,
            unitCost,
            profit,
            margin,

            // الحفاظ على كمية العنصر عند التعديل
            qty: editingItem?.qty ?? 1,

            // بيانات بيع الزيت الخام
            selectedMl:
              containerType === "oil"
                ? firstOilQty
                : null,

            pricePerMl
          };

          // ==================================
          // 11) ADD OR UPDATE CART ITEM
          // ==================================

          const name = editingItem
            ? updateCartItem(editingItem, item)
            : addToCart(item);

          // ==================================
          // 12) SUCCESS
          // ==================================

          if (name) {
            setToastText(
              editingItem
                ? `${name} updated 🔥`
                : `${name} added 🔥`
            );

            setShowToast(true);
            resetPopup();
          }
        }}
        style={{
          flex: 1,
          background: isValid
            ? theme.colors.primary
            : theme.colors.secondary,
          color: isValid
            ? "#fff"
            : theme.colors.text
        }}
      >
        {t("cart.add")}
      </AppButton>
    </div>
  );
}
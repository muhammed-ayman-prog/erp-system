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

  addToCart,

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
        style={{
          flex: 1
        }}
      >
        {t("common.close")}
      </AppButton>

      <AppButton
        className={`popup-submit ${
          !isValid
            ? "disabled"
            : ""
        }`}

        onClick={() => {

          if (
            needsOil &&
            (
              !oilQty ||
              oilQty <= 0
            )
          ) {

            setToastText(
              t("products.enterOilQty")
            );

            setShowToast(true);

            return;
          }

          if (!price || price <= 0) {

            setToastText(
              t("products.noPrice")
            );

            setShowToast(true);

            return;
          }

          const oilCost =
            oilQty * oilCostPerML;

          const containerCost =

            containerType === "oil"

              ? 0

              : selectedSize?.cost || 0;

          const overheadCost = 0;

          const unitCost =

            oilCost +

            containerCost +

            overheadCost;

          const profit =
            price - unitCost;

          const margin =

            price > 0

              ? Number(
                  (
                    (
                      profit / price
                    ) * 100
                  ).toFixed(2)
                )

              : 0;

          const item = {

            id: selectedProduct.id,

            name:
              selectedProduct.name,

            category:
              selectedProduct.category || "",

            subCategory:
              selectedProduct.subCategory || "",

            type:
              selectedProduct.type || "",

            stockQuantity:
              selectedProduct.quantity || 0,

            itemType:
              "BLENDED_ITEM",

            saleMode:
              saleModeMap[
                containerType
              ] || "UNKNOWN",

            oilId:
              selectedProduct.id,

            oilName:
              selectedProduct.name,

            oilCategory:
              selectedProduct.category || "",

            oilQtyML:
              oilQty || 0,

            size:
              selectedSize?.size ||
              selectedSize?.name ||
              "",

            containerType,

            containerName:

              containerType === "oil"

                ? `Pure Oil ${oilQty}ml`

                : selectedSize?.name?.trim() ||

                  containerType,

            containerId:

              containerType === "oil"

                ? null

                : selectedSize?.id || null,

            unitPrice:
              price || 0,

            price:
              price || 0,

            oilCostPerML,

            oilCost,

            containerCost,

            overheadCost,

            unitCost,

            profit,

            margin,

            qty: 1,

            oilQty:
              oilQty || 0
          };

          const name =
            addToCart(item);

          if (name) {

            setToastText(
              `${name} added 🔥`
            );

            setShowToast(true);

            resetPopup();
          }
        }}

        style={{
          flex: 1,

          background:

            isValid

              ? theme.colors.primary

              : theme.colors.secondary,

          color:

            isValid

              ? "#fff"

              : theme.colors.text
        }}
      >

        {t("cart.add")}

      </AppButton>

    </div>
  );
}
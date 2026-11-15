import { useCallback } from "react";

export function useSelectProduct({
  mainTab,
  addToCart,
  t,

  setToastText,
  setShowToast,

  setSelectedProduct,
  setPopupStep,
  setShowPopup,

  // Second Oil Selection
  isSelectingSecondOil,
  setIsSelectingSecondOil,
  setSecondOil,
  setSecondOilQty
}) {
  const handleSelectProduct = useCallback((p) => {

    // ==================================
    // SECOND OIL SELECTION
    // ==================================
    if (isSelectingSecondOil) {
      const category = (p.category || "").toLowerCase();
      const subCategory = (p.subCategory || "").toLowerCase();

      const isOil =
        category.includes("french") ||
        category.includes("oriental") ||
        category.includes("musk") ||
        subCategory === "musk";

      if (!isOil) return;

      if (Number(p.quantity || 0) <= 0) {
        setToastText("الزيت غير متوفر في المخزون");
        setShowToast(true);
        return;
      }

      setSecondOil(p);
      setSecondOilQty(0);

      setIsSelectingSecondOil(false);
      setPopupStep(null);
      setShowPopup(true);

      return;
    }

    // ==================================
    // ORIGINAL PRODUCTS
    // ==================================
    if (mainTab === "original") {
      const name = addToCart({
        ...p,
        size: t("products.standard"),
        containerType: "original",
        containerName: t("products.original"),
        price: p.price
      });

      if (name) {
        setToastText(`${name} ${t("cart.added")}`);
        setShowToast(true);
      }

      return;
    }

    // ==================================
    // READY BODY PRODUCTS
    // ==================================
    const isReadyBodyProduct =
      mainTab === "body" &&
      !p.category
        ?.toLowerCase()
        ?.includes("musk");

    if (isReadyBodyProduct) {
      const name = addToCart({
        ...p,
        size: t("products.ready"),
        containerType: "Ready",
        containerName:
          p.category?.toLowerCase()?.includes("cream")
            ? t("products.cream")
            : t("products.makhmaria"),
        containerId: null,
        oilQty: 0
      });

      if (name) {
        setToastText(`${name} ${t("cart.added")}`);
        setShowToast(true);
      }

      return;
    }

    // ==================================
    // NORMAL PRODUCT SELECTION
    // ==================================
    setSelectedProduct(p);
    setPopupStep(null);
    setShowPopup(true);

  }, [
    mainTab,
    addToCart,
    t,
    setToastText,
    setShowToast,
    setSelectedProduct,
    setPopupStep,
    setShowPopup,
    isSelectingSecondOil,
    setIsSelectingSecondOil,
    setSecondOil,
    setSecondOilQty
  ]);

  return {
    handleSelectProduct
  };
}
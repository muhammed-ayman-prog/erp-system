export function useSelectProduct({
  mainTab,
  addToCart,
  t,

  setToastText,
  setShowToast,

  setSelectedProduct,
  setPopupStep,
  setShowPopup
}) {

  function handleSelectProduct(p) {

    if (mainTab === "original") {

      const name = addToCart({
        ...p,
        size: t("products.standard"),
        containerType: t("products.original"),
        containerName: t("products.original"),
        price: p.price
      });

      if (name) {

        setToastText(
          `${name} ${t("cart.added")}`
        );

        setShowToast(true);
      }

      return;
    }

    const isReadyBodyProduct =

      mainTab === "body" &&

      !p.category
        ?.toLowerCase()
        ?.includes("musk");

    if (isReadyBodyProduct) {

      addToCart({
        ...p,

        size: t("products.ready"),

        containerType:
          p.category
            ?.toLowerCase()
            ?.includes("cream")

            ? t("products.cream")

            : t("products.makhmaria"),

        containerName:
          p.category
            ?.toLowerCase()
            ?.includes("cream")

            ? t("products.cream")

            : t("products.makhmaria"),

        containerId: null,

        oilQty: 0
      });

      return;
    }

    setSelectedProduct(p);

    setPopupStep(null);

    setShowPopup(true);
  }

  return {
    handleSelectProduct
  };
}
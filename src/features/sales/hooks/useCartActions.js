import { useState } from "react";

export default function useCartActions({
  setCart,
  handleCheckout,

  selectedSeller,
  setSelectedSeller
}) {

    const [
    showErrors,
    setShowErrors
  ] = useState(false);

  function clearCart() {

    setCart([]);
    setSelectedSeller(null);
    localStorage.removeItem("cart");

    localStorage.removeItem(
      "returnedCart"
    );
  }

  function handleCheckoutClick() {
    console.log("🔥 BUTTON CLICKED");
    setShowErrors(true);
    if (!selectedSeller) {
      console.log("❌ NO SELLER");
      return;
    }
    handleCheckout({
      seller: selectedSeller
    });
  }

  return {

    selectedSeller,
    setSelectedSeller,

    showErrors,
    setShowErrors,

    clearCart,

    handleCheckoutClick
  };
}
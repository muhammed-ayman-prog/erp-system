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
    setShowErrors(true);
    if (!selectedSeller) {
      return;
    }
    handleCheckout();
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
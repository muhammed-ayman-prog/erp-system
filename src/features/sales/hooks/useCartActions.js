import { useState } from "react";

export default function useCartActions({
  setCart,
  handleCheckout
}) {

  const [
    selectedSeller,
    setSelectedSeller
  ] = useState(null);

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

export function useCheckoutAction({
  handleCheckout,

  playCheckoutSound,

  customerName,
  customerPhone,
  saleDate,
  setSaleDate,

  paymentMethod,

  // Split Payment
  isSplitPayment,
  splitPayments,
  setIsSplitPayment,
  setSplitPayments,

  selectedSeller,

  selectedBranch,
  user,

  setToastText,
  setShowToast,

  setLoadingCheckout,

  setContainerType,
  setSelectedSize,
  setSelectedProduct,
  setOilQty,

  setDiscount,
  setPaymentMethod,

  setCustomerName,
  setCustomerPhone
}) {

  function handleCheckoutAction(params) {
    return handleCheckout({
      ...params,

      playCheckoutSound,

      customerName,
      customerPhone,
      saleDate,
      setSaleDate,

      paymentMethod,

      // Split Payment
      isSplitPayment,
      splitPayments,

      setIsSplitPayment,
      setSplitPayments,

      employeeId: selectedSeller?.id,
      employeeName: selectedSeller?.name,

      selectedBranch,
      user,

      setToastText,
      setShowToast,

      setLoadingCheckout,

      setContainerType,
      setSelectedSize,
      setSelectedProduct,
      setOilQty,

      setDiscount,
      setPaymentMethod,

      setCustomerName,
      setCustomerPhone
    });
  }

  return {
    handleCheckoutAction
  };
}

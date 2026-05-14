import { useState } from "react";

export function usePopupState() {

  const [
    showPopup,
    setShowPopup
  ] = useState(false);

  const [
    containerType,
    setContainerType
  ] = useState("bottle");

  const [
    oilQty,
    setOilQty
  ] = useState(0);

  const [
    selectedSize,
    setSelectedSize
  ] = useState(null);

  const [
    popupStep,
    setPopupStep
  ] = useState(null);

  return {

    popupStep,
    setPopupStep,

    showPopup,
    setShowPopup,

    containerType,
    setContainerType,

    selectedSize,
    setSelectedSize,

    oilQty,
    setOilQty
  };
}
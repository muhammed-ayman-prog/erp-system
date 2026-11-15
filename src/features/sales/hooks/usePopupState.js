import { useState } from "react";

export function usePopupState() {
  const [showPopup, setShowPopup] = useState(false);

  const [containerType, setContainerType] = useState("bottle");

  // الزيت الأول
  const [oilQty, setOilQty] = useState(0);

  // الزيت الثاني - اختياري
  const [secondOil, setSecondOil] = useState(null);
  const [secondOilQty, setSecondOilQty] = useState(0);

  const [selectedSize, setSelectedSize] = useState(null);

  const [popupStep, setPopupStep] = useState(null);

  // Edit mode
  const [editingItem, setEditingItem] = useState(null);

  return {
    popupStep,
    setPopupStep,

    showPopup,
    setShowPopup,

    containerType,
    setContainerType,

    selectedSize,
    setSelectedSize,

    // الزيت الأول
    oilQty,
    setOilQty,

    // الزيت الثاني
    secondOil,
    setSecondOil,
    secondOilQty,
    setSecondOilQty,

    // Edit
    editingItem,
    setEditingItem
  };
}
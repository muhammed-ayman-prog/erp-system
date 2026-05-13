import { useEffect, useState } from "react";

export function useToast() {

  const [showToast, setShowToast] =
    useState(false);

  const [toastText, setToastText] =
    useState("");

  useEffect(() => {

    if (!showToast) return;

    const timeout = setTimeout(() => {

      setShowToast(false);

    }, 1500);

    return () => clearTimeout(timeout);

  }, [showToast]);

  const showMessage = (text) => {

    setToastText(text);

    setShowToast(true);
  };

  return {
    showToast,
    toastText,

    setShowToast,
    setToastText,

    showMessage
  };
}
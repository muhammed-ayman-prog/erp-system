import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { usePurchaseCart } from "../../../store/usePurchaseCart";

const PurchaseContext = createContext(null);

export function PurchaseProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("history");

  const [showCart, setShowCart] = useState(false);

  // ==========================
  // Cart (Zustand)
  // ==========================

  const {
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  } = usePurchaseCart();

  const totalItems = cartItems.length;

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + Number(item.purchaseQuantity || 0),
    0
  );

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,

      selectedCategory,
      setSelectedCategory,

      selectedProduct,
      setSelectedProduct,

      popupOpen,
      setPopupOpen,

      activeTab,
      setActiveTab,

      showCart,
      setShowCart,

      cartItems,
      setCartItems,

      totalItems,
      totalQuantity,

      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
    }),
    [
      searchQuery,
      selectedCategory,
      selectedProduct,
      popupOpen,
      activeTab,
      showCart,

      cartItems,
      totalItems,
      totalQuantity,

      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
    ]
  );

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchaseContext() {
  const context = useContext(PurchaseContext);

  if (!context) {
    throw new Error(
      "usePurchaseContext must be used inside PurchaseProvider"
    );
  }

  return context;
}
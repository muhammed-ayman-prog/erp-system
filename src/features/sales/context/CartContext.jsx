import {
  createContext,
  useContext
} from "react";

const CartContext =
  createContext();

export function CartProvider({
  children,
  value
}) {

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {

  const context =
    useContext(CartContext);

  if (!context) {

    throw new Error(
      "useCartContext must be used inside CartProvider"
    );
  }

  return context;
}
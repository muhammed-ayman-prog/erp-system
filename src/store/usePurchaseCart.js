import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePurchaseCart = create(
  persist(
    (set) => ({
      cartItems: [],

      setCartItems: (cartItems) => set({ cartItems }),

      addToCart: (product, quantity) => {
        const qty = Number(quantity);

        if (!qty || qty <= 0) return;

        set((state) => {
          const existing = state.cartItems.find(
            (item) => item.productId === product.id
          );

          if (existing) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      purchaseQuantity:
                        item.purchaseQuantity + qty,
                    }
                  : item
              ),
            };
          }

          return {
            cartItems: [
              ...state.cartItems,
              {
                ...product,
                productId: product.id,
                purchaseQuantity: qty,
              },
            ],
          };
        });
      },

      removeFromCart: (productId) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.productId !== productId
          ),
        })),

      updateCartQuantity: (productId, quantity) => {
        const qty = Number(quantity);

        set((state) => ({
          cartItems:
            qty <= 0
              ? state.cartItems.filter(
                  (item) => item.productId !== productId
                )
              : state.cartItems.map((item) =>
                  item.productId === productId
                    ? {
                        ...item,
                        purchaseQuantity: qty,
                      }
                    : item
                ),
        }));
      },

      clearCart: () =>
        set({
          cartItems: [],
        }),
    }),
    {
      name: "purchase-cart",
    }
  )
);
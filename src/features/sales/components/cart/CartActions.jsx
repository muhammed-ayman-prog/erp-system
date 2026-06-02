import {
  useCartContext
} from "../../context/CartContext";

import {
  useSalesContext
} from "../../context/SalesContext";
export default function CartActions({
  clearCart,
  handleCheckoutClick
}) {
  const {
  cart
} = useCartContext();

const {
  theme,
  t,
  user,
  loading,
  checkoutState
} = useSalesContext();

const {
  paymentMethod,
  loadingCheckout
} = checkoutState;

 const isCheckoutDisabled =
  loading ||
  !user ||
  loadingCheckout ||
  cart.length === 0 ||
  !paymentMethod

  return (
    <>

      {/* Clear */}
      <button
        onClick={clearCart}
        disabled={cart.length === 0}
        style={{
          opacity: cart.length === 0 ? 0.5 : 1,

          cursor:
            cart.length === 0
              ? "not-allowed"
              : "pointer",

          width: "100%",
          padding: "12px",
          marginTop: "10px",

          background: theme.colors.card,

          border: `1px solid ${theme.colors.border}`,

          borderRadius: "10px",

          color: theme.colors.text,

          userSelect: "none"
        }}
      >
        {t("cart.clear")}
      </button>

      {/* Checkout */}
      <button
        onClick={() => {


  if (loading || !user) {
    return;
  }

  handleCheckoutClick();
}}

        disabled={
  isCheckoutDisabled || !user
}

        style={{
          width: "100%",
          padding: "14px",
          marginTop: "10px",

          background: theme.colors.primary,

          border: "none",
          borderRadius: "12px",

          color: "#fff",

          fontWeight: "bold",

          cursor:
            isCheckoutDisabled
              ? "not-allowed"
              : "pointer",

          opacity:
            isCheckoutDisabled
              ? 0.5
              : 1,

          boxShadow: "0 10px 25px rgba(59,130,246,0.3)",
        }}

        onMouseEnter={(e) => {

          if (isCheckoutDisabled) return;

          e.currentTarget.style.transform = "scale(1.02)";
        }}

        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >

        {loadingCheckout
          ? t("common.processing")
          : t("cart.checkout")}

      </button>

    </>
  );
}
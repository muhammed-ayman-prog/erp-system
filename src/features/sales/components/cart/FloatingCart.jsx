import {
  useCartContext
} from "../../context/CartContext";

import {
  useSalesContext
} from "../../context/SalesContext";
export default function FloatingCart() {
 const {
  cart,
  cartCount,
  total
} = useCartContext();
const {
  lang,
  isMobile,
  setShowCart,
  theme
} = useSalesContext();

  if (!cart.length) {
    return null;
  }

  return (
    <button
      type="button"

      onClick={() =>
        setShowCart(true)
      }

      style={{
        position: "fixed",

        bottom: "18px",

        [lang === "ar"
          ? "left"
          : "right"]:
          isMobile
            ? "16px"
            : "24px",

        zIndex: 5000,

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        gap: "2px",

        minWidth:
          isMobile
            ? "64px"
            : "82px",

        minHeight:
          isMobile
            ? "64px"
            : "82px",
        
        borderRadius: "999px",

        background:
          theme.colors.primary,

        color: "#fff",

        border: "none",

        cursor: "pointer",

        boxShadow:
          `0 12px 30px ${theme.colors.primary}55`,

        transition: "0.2s ease",

        backdropFilter:
          "blur(10px)"
      }}

      onMouseEnter={(e) => {

        if (isMobile) return;

        e.currentTarget.style.transform =
          "translateY(-3px) scale(1.03)";
      }}

      onMouseLeave={(e) => {

        if (isMobile) return;

        e.currentTarget.style.transform =
          "translateY(0) scale(1)";
      }}
    >

      <div style={{
        fontSize:
          isMobile
            ? "22px"
            : "26px"
      }}>
        🛒
      </div>

      <div style={{
        position: "absolute",

        top: "-4px",

        [lang === "ar"
          ? "left"
          : "right"]:
          "-4px",

        minWidth: "24px",

        height: "24px",

        borderRadius: "999px",

        background: "#ef4444",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "11px",

        fontWeight: "700",

        color: "#fff",

        border: "2px solid white"
      }}>
        {cartCount}
      </div>

      <div style={{
        fontSize: "11px",
        fontWeight: "700",
        marginTop: "2px"
      }}>

        {(Number(total) || 0)
          .toLocaleString(
            lang === "ar"
              ? "ar-EG"
              : "en-US"
          )} EGP

      </div>

    </button>
  );
}
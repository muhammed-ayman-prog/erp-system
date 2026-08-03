import { PackagePlus } from "lucide-react";

import { theme } from "../../../theme";
import { usePurchaseContext } from "../context/PurchaseContext";

export default function FloatingCartButton() {
  const {
    cartItems,
    totalQuantity,
    showCart,
    setShowCart,
  } = usePurchaseContext();

  if (!cartItems.length || showCart) {
    return null;
  }

  const isMobile = window.innerWidth < 768;

  const formattedQuantity = Number(
    totalQuantity || 0
  ).toLocaleString("en-US");

  return (
    <button
      type="button"
      onClick={() => setShowCart(true)}
      onMouseEnter={(e) => {
        if (isMobile) return;

        e.currentTarget.style.transform =
          "translateY(-4px) scale(1.05)";

        e.currentTarget.style.boxShadow =
          `0 18px 40px ${theme.colors.primary}66`;
      }}
      onMouseLeave={(e) => {
        if (isMobile) return;

        e.currentTarget.style.transform =
          "translateY(0) scale(1)";

        e.currentTarget.style.boxShadow =
          `0 12px 30px ${theme.colors.primary}55`;
      }}
      style={{
        position: "fixed",

        left: isMobile ? 16 : 24,
        bottom: isMobile ? 16 : 24,

        zIndex: 5000,

        width: isMobile ? 56 : 60,
        height: isMobile ? 56 : 60,

        borderRadius: "50%",

        border: "none",

        background:
          theme.colors.primary,

        color: "#fff",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        cursor: "pointer",

        boxShadow:
          `0 12px 30px ${theme.colors.primary}55`,

        transition:
          "transform .25s ease, box-shadow .25s ease",

        willChange: "transform",
      }}
    >
      <PackagePlus
        size={25}
        strokeWidth={2.2}
      />

      <span
        style={{
          position: "absolute",

          top: -3,
          right: -3,

          minWidth: 22,
          height: 22,

          padding: "0 5px",

          borderRadius: 999,

          background:
            "#ef4444",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          color: "#fff",

          fontSize: 10,

          fontWeight: 800,

          border:
            "2px solid white",

          boxShadow:
            "0 3px 8px rgba(239,68,68,.35)",
        }}
      >
        {formattedQuantity}
      </span>
    </button>
  );
}
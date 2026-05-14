import {
  useCartContext
} from "../../context/CartContext";

import {
  useSalesContext
} from "../../context/SalesContext";

export default function CartSummary() {
  const {
  subtotal,
  total
} = useCartContext();

const {
  theme,
  t,
  checkoutState
} = useSalesContext();

const {
  discount,
  setDiscount
} = checkoutState;

  return (
    <div className="cart-footer">

      {/* Subtotal */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px"
      }}>
        <span style={{ color: "#666" }}>
          {t("cart.subtotal")}
        </span>

        <span>
          {subtotal} EGP
        </span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px"
        }}>
          <span style={{ color: "#666" }}>
            {t("cart.discount")}
          </span>

          <span>
            - {discount} EGP
          </span>
        </div>
      )}

      {/* Divider */}
      <div style={{
        height: "1px",
        background: "#eee",
        margin: "8px 0"
      }} />

      {/* Discount Input */}
      <input
        type="number"
        placeholder={t("cart.discount")}
        value={discount === 0 ? "" : discount}
        onChange={(e) =>
          setDiscount(
            Math.max(0, Number(e.target.value))
          )
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "10px",
          border: `1px solid ${theme.colors.border}`
        }}
      />

      {/* Total */}
      <div style={{
        display: "flex",
        justifyContent: "space-between"
      }}>

        <span style={{
          fontWeight: "700",
          fontSize: "16px"
        }}>
          {t("cart.total")}
        </span>

        <span style={{
          fontWeight: "700",
          fontSize: "18px",
          color: "#16a34a"
        }}>
          {total} EGP
        </span>

      </div>

    </div>
  );
}
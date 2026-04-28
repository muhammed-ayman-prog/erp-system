import { 
  Banknote, CreditCard, Wallet,
  Plus, Minus, Trash2, Pencil 
} from "lucide-react";
import { useState } from "react";
const btnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px",
  borderRadius: "8px",
  border: "none",
  background: "#f1f5f9",
  cursor: "pointer",
  transition: "all 0.2s ease"
};


export default function Cart({
  cart,
  setCart,
  theme,
  t,
  increaseQty,
  decreaseQty,
  removeItem,
  setSelectedProduct,
  setSelectedSize,
  setContainerType,
  setOilQty,
  setShowPopup,
  productsWithStock,

  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,

  subtotal,
  discount,
  setDiscount,
  total,

  paymentMethod,
  setPaymentMethod,

  handleCheckout,
  loadingCheckout,
  selectedBranch,
  user
}) {
  const [salesName, setSalesName] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  return (
    <div className="card cart" style={{
  flex: 0.8,
  height: "100%",
  display: "flex",
  flexDirection: "column"
}}>
        <h2>{t("cart.title")} 🧾</h2>
        <div className="cart-content">
        {cart.length === 0 && (
          <p style={{ color: theme.colors.textSecondary, textAlign: "center" }}>
            {t("cart.empty")}
          </p>
        )}
        {cart.map((item) => (
        <div
          key={item.id + item.size + item.containerType}
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "16px",
            padding: "14px",
            minHeight: "90px",
            marginBottom: "10px",
            background: theme.colors.card,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {/* 🧴 Top Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ 
            fontWeight: "700",
            fontSize: "14px"
          }}>
              {item.name}
            </div>

            <div style={{ fontWeight: "700", color: theme.colors.primary }}>
              {item.price * item.qty} EGP
            </div>
          </div>

          {/* 📦 تفاصيل */}
          <div style={{ fontSize: "12px", color: theme.colors.textSecondary }}>
            {item.containerName || item.containerType}
            {item.oilQty > 0 && ` • ${item.oilQty} ml`}
            {item.sizeLabel && ` • ${item.sizeLabel}`}
          </div>

          {/* 🔢 Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            
            {/* Qty buttons */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "10px",
              padding: "4px 8px"
            }}>
             <button
              onClick={() => decreaseQty(item)}
              style={btnStyle}
            >
              <Minus size={16} />
            </button>
              <span>{item.qty}</span>
              <button
              onClick={() => increaseQty(item)}
              style={btnStyle}
            >
              <Plus size={16} />
            </button>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
              onClick={() => removeItem(item)}
              style={{ ...btnStyle, color: "#ef4444" }}
            >
              <Trash2 size={16} />
            </button>
              <button
              onClick={() => {
                setSelectedProduct(productsWithStock.find(p => p.id === item.id));
                setSelectedSize({ id: item.size, name: item.sizeLabel });
                setContainerType(item.containerType);
                setOilQty(item.oilQty || 0);
                removeItem(item);
                setShowPopup(true);
              }}
              style={btnStyle}
            >
              <Pencil size={16} />
            </button>
            </div>
          </div>
        </div>
      ))}

        <hr />
        <div style={{ marginTop: "15px" }}>
        <p>{t("customer.info")}</p>
        <input
          type="text"
          placeholder={t("customer.phone")}
          value={customerPhone}
          onChange={(e) => {
            setCustomerPhone(e.target.value);
            setShowErrors(false);
          }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: showErrors && !customerPhone
              ? "2px solid #ef4444"
              : `1px solid ${theme.colors.border}`,
            boxShadow: showErrors && !customerPhone
              ? "0 0 0 2px rgba(239,68,68,0.2)"
              : "none"
                      }}
        />
        <input
          type="text"
          placeholder={t("customer.name")}
          value={customerName}
          onChange={(e) => {
            setCustomerName(e.target.value);
            setShowErrors(false);
          }}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "10px",
            border: showErrors && !customerName
              ? "2px solid #ef4444"
              : `1px solid ${theme.colors.border}`,
            boxShadow: showErrors && !customerName
              ? "0 0 0 2px rgba(239,68,68,0.2)"
              : "none"
          }}
        />
        <div style={{ marginBottom: "10px" }}>
  <input
    type="text"
    placeholder={t("invoices.salesName")}
    value={salesName}
    onChange={(e) => setSalesName(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "10px",
      border: `1px solid ${theme.colors.border}`
    }}
  />
</div>

        
      </div>
    

        
  <div className="cart-footer">
  {/* Subtotal */}
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
    <span style={{ color: "#666" }}>{t("cart.subtotal")}</span>
    <span>{subtotal} EGP</span>
  </div>

  {/* Discount */}
  {discount > 0 && (
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
    <span style={{ color: "#666" }}>{t("cart.discount")}</span>
    <span>- {discount} EGP</span>
  </div>
)}

  {/* Divider */}
  <div style={{ height: "1px", background: "#eee", margin: "8px 0" }} />
<input
  type="number"
  placeholder={t("cart.discount")}
  value={discount === 0 ? "" : discount}
  onChange={(e) => setDiscount(Number(e.target.value))}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: `1px solid ${theme.colors.border}`
  }}
/>
  {/* Total */}
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span style={{ fontWeight: "700", fontSize: "16px" }}>{t("cart.total")}</span>
    <span style={{ fontWeight: "700", fontSize: "18px", color: "#16a34a" }}>
      {total} EGP
    </span>
  </div>
</div>
        
        <div style={{ marginTop: "15px" }}>
  <p style={{ marginBottom: "8px" }}>{t("payment.method")}</p>

  <div className="payment-methods">

    {[
  { key: "cash", label: t("payment.cash"), icon: <Banknote size={18} />, color: "#22c55e" },
  { key: "visa", label: t("payment.visa"), icon: <CreditCard size={18} />, color: "#b8962e" },
  { key: "instapay", label: t("payment.instapay"), icon: <Wallet size={18} />, color: "#8b5cf6" },
].map((method) => (
      <button
        key={method.key}
        onClick={() => setPaymentMethod(method.key)}
        style={{
          flex: 1,
          padding: "12px",
          borderRadius: "12px",
          border: `1px solid ${theme.colors.border}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",

          background:
  paymentMethod === method.key ? method.color : theme.colors.secondary,

          color:
          paymentMethod === method.key
            ? (method.key === "visa" ? "#000" : "#fff")
            : theme.colors.text,
            fontWeight: "500",
            transition: "all 0.25s ease"
        }}
      >
        {method.icon}
        {method.label}
      </button>
    ))}

  </div>
</div>
        
        <button
          onClick={() => setCart([])}
          disabled={cart.length === 0}
          style={{
            opacity: cart.length === 0 ? 0.5 : 1,
            cursor: cart.length === 0 ? "not-allowed" : "pointer",
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
        <button
        onClick={() => {
  setShowErrors(true);
  handleCheckout(salesName); // 👈 ابعت القيمة
}}
        disabled={
        loadingCheckout ||
        cart.length === 0 ||
        !user
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
          cursor: (
          loadingCheckout ||
          cart.length === 0
        ) ? "not-allowed" : "pointer",
          opacity: (!user || cart.length === 0) ? 0.5 : 1,
          boxShadow: "0 10px 25px rgba(59,130,246,0.3)",
        }}
        onMouseEnter={(e) => {
          if (cart.length === 0) return;
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        >
          {loadingCheckout ? t("common.processing") : t("cart.checkout")}
        </button>
        </div>
        </div>
      
  );
}
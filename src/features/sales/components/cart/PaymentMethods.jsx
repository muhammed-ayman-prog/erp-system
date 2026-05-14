import {
  Banknote,
  CreditCard,
  Wallet
} from "lucide-react";
import {
  useSalesContext
} from "../../context/SalesContext";
export default function PaymentMethods() {
  const {
  theme,
  t,
  checkoutState
} = useSalesContext();

const {
  paymentMethod,
  setPaymentMethod
} = checkoutState;

  const methods = [
    {
      key: "cash",
      label: t("payment.cash"),
      icon: <Banknote size={18} />,
      color: "#22c55e"
    },

    {
      key: "visa",
      label: t("payment.visa"),
      icon: <CreditCard size={18} />,
      color: "#b8962e"
    },

    {
      key: "instapay",
      label: t("payment.instapay"),
      icon: <Wallet size={18} />,
      color: "#8b5cf6"
    }
  ];

  return (
    <div style={{ marginTop: "15px" }}>

      <p style={{ marginBottom: "8px" }}>
        {t("payment.method")}
      </p>

      <div className="payment-methods">

        {methods.map((method) => (

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
                paymentMethod === method.key
                  ? method.color
                  : theme.colors.secondary,

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
  );
}
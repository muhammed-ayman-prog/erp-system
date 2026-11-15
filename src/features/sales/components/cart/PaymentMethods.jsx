
import {
  Banknote,
  CreditCard,
  Wallet,
  Split,
} from "lucide-react";

import { useSalesContext } from "../../context/SalesContext";

export default function PaymentMethods() {
  const { theme, t, checkoutState } = useSalesContext();

  const {
    paymentMethod,
    setPaymentMethod,
    total,

    isSplitPayment,
    setIsSplitPayment,

    splitPayments,
    setSplitPayments,
  } = checkoutState;

  const methods = [
    {
      key: "cash",
      label: t("payment.cash"),
      icon: <Banknote size={18} />,
      color: "#22c55e",
    },
    {
      key: "visa",
      label: t("payment.visa"),
      icon: <CreditCard size={18} />,
      color: "#b8962e",
    },
    {
      key: "instapay",
      label: t("payment.instapay"),
      icon: <Wallet size={18} />,
      color: "#8b5cf6",
    },
  ];

  const amounts = splitPayments || {
    cash: "",
    visa: "",
    instapay: "",
  };

  const paidAmount = methods.reduce(
    (sum, method) =>
      sum + Math.max(0, Number(amounts[method.key]) || 0),
    0
  );

  const invoiceTotal = Number(total || 0);

  const remaining = Math.round(
    (invoiceTotal - paidAmount) * 100
  ) / 100;

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  const handleSplitToggle = (enabled) => {
    setIsSplitPayment(enabled);
    setPaymentMethod("");

    setSplitPayments({
      cash: "",
      visa: "",
      instapay: "",
    });
  };

  const handleAmountChange = (method, value) => {
    if (value !== "" && Number(value) < 0) return;

    setSplitPayments((prev) => ({
      ...prev,
      [method]: value,
    }));
  };

  return (
    <div
      style={{
        marginTop: 15,
        padding: 14,
        borderRadius: 14,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.card,
      }}
    >
      <p
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontWeight: 700,
          color: theme.colors.text,
        }}
      >
        {t("payment.method")}
      </p>

      {/* Payment Mode */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          onClick={() => handleSplitToggle(false)}
          style={{
            padding: 11,
            borderRadius: 10,
            border: `1px solid ${
              !isSplitPayment
                ? theme.colors.primary
                : theme.colors.border
            }`,
            background: !isSplitPayment
              ? theme.colors.primary
              : theme.colors.secondary,
            color: !isSplitPayment
              ? "#fff"
              : theme.colors.text,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          وسيلة دفع واحدة
        </button>

        <button
          type="button"
          onClick={() => handleSplitToggle(true)}
          style={{
            padding: 11,
            borderRadius: 10,
            border: `1px solid ${
              isSplitPayment
                ? theme.colors.primary
                : theme.colors.border
            }`,
            background: isSplitPayment
              ? theme.colors.primary
              : theme.colors.secondary,
            color: isSplitPayment
              ? "#fff"
              : theme.colors.text,
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Split size={17} />
          تقسيم الدفع
        </button>
      </div>

      {/* Normal Payment */}
      {!isSplitPayment ? (
        <div className="payment-methods">
          {methods.map((method) => (
            <button
              type="button"
              key={method.key}
              onClick={() => setPaymentMethod(method.key)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${theme.colors.border}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background:
                  paymentMethod === method.key
                    ? method.color
                    : theme.colors.secondary,
                color:
                  paymentMethod === method.key
                    ? method.key === "visa"
                      ? "#000"
                      : "#fff"
                    : theme.colors.text,
                fontWeight: 500,
                transition: "all 0.25s ease",
              }}
            >
              {method.icon}
              {method.label}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div
            style={{
              fontSize: 13,
              color: theme.colors.textSecondary,
              marginBottom: 12,
            }}
          >
            وزّع إجمالي الفاتورة على طرق الدفع المختلفة.
          </div>

          {methods.map((method) => (
            <div
              key={method.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 105,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: theme.colors.text,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {method.icon}
                {method.label}
              </div>

              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                value={amounts[method.key] ?? ""}
                onChange={(e) =>
                  handleAmountChange(
                    method.key,
                    e.target.value
                  )
                }
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 42,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.secondary,
                  color: theme.colors.text,
                  outline: "none",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          {/* Payment Summary */}
          <div
            style={{
              marginTop: 15,
              padding: 12,
              borderRadius: 12,
              background: theme.colors.secondary,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                color: theme.colors.text,
              }}
            >
              <span>إجمالي الفاتورة</span>
              <strong>
                {formatMoney(invoiceTotal)} ج.م
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                color: theme.colors.text,
              }}
            >
              <span>إجمالي المدفوع</span>
              <strong>
                {formatMoney(paidAmount)} ج.م
              </strong>
            </div>

            <div
              style={{
                borderTop: `1px solid ${theme.colors.border}`,
                paddingTop: 10,
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                color:
                  remaining < 0
                    ? theme.colors.danger
                    : remaining === 0
                    ? theme.colors.success
                    : theme.colors.text,
              }}
            >
              <span>
                {remaining < 0
                  ? "زيادة في المبلغ"
                  : remaining === 0
                  ? "المتبقي"
                  : "المبلغ المتبقي"}
              </span>

              <span>
                {formatMoney(Math.abs(remaining))} ج.م
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

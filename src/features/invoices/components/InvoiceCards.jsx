import {
  DollarSign,
  Banknote,
  CreditCard,
  Smartphone,
} from "lucide-react";

import { theme } from "../../../theme";

export default function InvoiceCards({
  totals,
  t,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 10,
      }}
    >
      <Card
        title={t("cart.total")}
        value={totals.total}
        type="total"
      />

      <Card
        title={t("common.cash")}
        value={totals.cash}
        type="cash"
      />

      <Card
        title={t("common.visa")}
        value={totals.visa}
        type="visa"
      />

      <Card
        title={t("common.instapay")}
        value={totals.instapay}
        type="instapay"
      />
    </div>
  );
}
const Card = ({ title, value, type }) => {
    const styles = {
      total: {
        bg: "#16a34a",       // أخضر غامق
        color: "#ffffff",    // أبيض
        border: "#16a34a"
      },
      cash: {
        bg: "#ecfdf5",       // أخضر فاتح
        color: "#16a34a",
        border: "#bbf7d0"
      },
      visa: {
        bg: "#fef3c7",
        color: "#b45309"
      },
      instapay: {
        bg: "#f3e8ff",
        color: "#7c3aed"
      }
    };

    const s = styles[type] || {};
    const icons = {
    total: <DollarSign size={20} color="#fff" strokeWidth={2.5} />,
    cash: <Banknote size={18} />,
    visa: <CreditCard size={18} />,
    instapay: <Smartphone size={18} />
  };

    return (
    <div
      style={{
        background: s.bg || theme.colors.card,
        border: `1px solid ${s.border || theme.colors.border}`,
        padding: 15,
        borderRadius: 12,
        flex: 1,
        cursor: "pointer",
        transition: "0.2s",
        boxShadow:
          type === "total"
            ? "0 10px 30px rgba(22,163,74,0.3)"
            : "0 8px 20px rgba(0,0,0,0.05)"
      }}
      onMouseEnter={e => {
    e.currentTarget.style.transform = "scale(1.02)";
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = "scale(1)";
  }}
    >
          {/* 🔥 Top Row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap"
          }}>
            <span style={{
              fontSize: "12px",
              color: type === "total" ? "#d1fae5" : theme.colors.textSecondary
            }}>
              {title}
            </span>

            <div style={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                type === "total"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.05)"
            }}>
              {icons[type]}
            </div>
          </div>

          {/* 💰 Value */}
          <div style={{
            fontSize: type === "total" ? "26px" : "20px",
            fontWeight: "700",
            marginTop: "8px",
            color: s.color || theme.colors.text
          }}>
            {Number(value || 0).toLocaleString()} EGP
          </div>
        </div>
    );
  };
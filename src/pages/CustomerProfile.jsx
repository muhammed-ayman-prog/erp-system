import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { useTranslate } from "../useTranslate";
import { useAuth } from "../store/useAuth";
import toast from "react-hot-toast";
export default function CustomerProfile() {
  const { t, tt, lang } = useTranslate();
  const { id } = useParams();
  const saveCustomerNotes = async () => {

  try {

    await updateDoc(
      doc(db, "customers", id),
      {
        notes: customer.notes || "",
        tags: customer.tags || []
      }
    );

    toast.success(t("common.success"));

  } catch (err) {

    console.error(err);

    toast.error(t("common.error"));

  }
};
const addTag = () => {

  if (!tagInput.trim()) return;

  const exists = (
    customer.tags || []
  ).includes(tagInput.trim());

  if (exists) return;

  setCustomer(prev => ({
    ...prev,

    tags: [
      ...(prev.tags || []),

      tagInput.trim()
    ]
  }));

  setTagInput("");
};

const removeTag = (tag) => {

  setCustomer(prev => ({
    ...prev,

    tags: (
      prev.tags || []
    ).filter(t => t !== tag)
  }));
};

  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const { user } = useAuth();

  useEffect(() => {

  if (user?.role !== "owner") {
    return;
  }

  const customerRef = doc(db, "customers", id);

  const unsubCustomer = onSnapshot(
    customerRef,
    (customerSnap) => {

      if (customerSnap.exists()) {

        setCustomer(customerSnap.data());

      } else {

        setCustomer(null);

      }
    }
  );

  const q = query(
    collection(db, "sales"),
    where("customerId", "==", id)
  );

  const unsubSales = onSnapshot(
    q,
    (salesSnap) => {

      const salesData = salesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSales(salesData);

      setLoading(false);
    }
  );

  return () => {
    unsubCustomer();
    unsubSales();
  };

}, [id, user]);
  const filteredSales = sales.filter(s => {
  if (!s.createdAt?.seconds) return false;

const date = new Date(
  s.createdAt.seconds * 1000
);

  if (fromDate && date < new Date(fromDate)) return false;
  if (toDate) {
  const end = new Date(toDate);
  end.setHours(23, 59, 59, 999);

  if (date > end) return false;
}

  return true;
});
  
  
  if (loading)
    return <div className="card" style={{
  padding: "30px",
  textAlign: "center"
}}>
  <p>{t("common.loading")}</p>
</div>

  if (!customer)
    return <p style={{ padding: "20px" }}>{t("common.notFound")}</p>;

  const productStats = {};

filteredSales.forEach(s => {
  s.items?.forEach(item => {
    if (!productStats[item.name]) {
      productStats[item.name] = 0;
    }
    productStats[item.name] += item.qty;
  });
});

const topProducts = Object.entries(productStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
  const chartData = filteredSales.map(s => ({
  date: new Date(s.createdAt.seconds * 1000).toLocaleDateString(),
  net:
(s.total || 0) -
(s.refundedAmount || 0)
}));
// 💰 Gross Revenue
const grossRevenue = filteredSales.reduce(
  (sum, s) =>
    sum + (s.total || 0),
  0
);

// ↩️ Total Refunded
const refundedAmount = filteredSales.reduce(
  (sum, s) =>
    sum + (s.refundedAmount || 0),
  0
);

// ✅ Net Spending
const netSpent =
  grossRevenue - refundedAmount;

// 📊 Average Order
const avgSpend =
  netSpent / (filteredSales.length || 1);



let customerType =
`${t("customer.new")} 🆕`;

if (
  netSpent >= 50000 &&
  (customer.ordersCount || 0) >= 25
) {

  customerType =
`${t("customer.elite")} 👑`;

} else if (
  netSpent >= 15000 &&
  (customer.ordersCount || 0) >= 10
) {

  customerType =
`${t("customer.vip")} 💎`;

} else if (
  (customer.ordersCount || 0) >= 5 ||
  netSpent >= 6000
) {

  customerType =
`${t("customer.loyal")} 🔁`;

}

const lastVisitDays = customer.lastPurchase
  ? (Date.now() - customer.lastPurchase.seconds * 1000) / (1000 * 60 * 60 * 24)
  : null;
  return (
    <div style={{ flex: 1 }}>

      {/* 👤 Header */}
 
      <div className="card" style={{ marginBottom: "20px" }}>
        <h2 style={{
  color: "#0f172a",
  fontSize: "20px",
  fontWeight: "600",
  marginBottom: "5px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap"
}}>
  👤 {customer.name || t("customer.noName")}
</h2>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          {customer.phone}
        </p>
        <a
          href={`https://wa.me/${
            (customer.phone || "")
              .replace(/\D/g, "")
              .replace(/^0/, "20")
          }`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",

            marginTop: "12px",

            padding: "10px 14px",

            borderRadius: "12px",

            background: "#25D366",

            color: "#fff",

            textDecoration: "none",

            fontWeight: "600"
          }}
        >
          📲 {t("customer.whatsapp")}
        </a>
      </div>
      <div className="card" style={{ marginBottom: "20px" }}>

  <h3 style={{ marginBottom: "10px" }}>
    📝 {t("customer.notesTags")}
  </h3>

  <textarea
    value={customer.notes || ""}
    onChange={(e) =>
      setCustomer(prev => ({
        ...prev,
        notes: e.target.value
      }))
    }
    placeholder={t("customer.addCustomerNotes")}
    style={{
      width: "100%",
      minHeight: "90px",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid var(--border)",
      marginBottom: "10px"
    }}
  />

  {/* ➕ Add Tag */}
<div style={{
 display: "flex",
  gap: "10px",
  marginBottom: "12px",
  flexWrap: "wrap"
}}>

  <input
    type="text"
    placeholder={t("customer.addTag")}
    value={tagInput}
    onChange={(e) =>
      setTagInput(e.target.value)
    }
    style={{
      flex: 1,
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid var(--border)",
      minWidth: "220px"
    }}
  />

  <button
    onClick={addTag}
    style={{
      padding: "10px 14px",
      borderRadius: "10px",
      border: "none",
      background: "#0f172a",
      color: "#fff",
      cursor: "pointer"
    }}
  >
    {t("common.add")}
  </button>

</div>

{/* 🏷️ Tags */}
<div style={{
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
}}>

  {(customer.tags || []).map(tag => (

    <div
      key={tag}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",

        padding: "6px 12px",

        borderRadius: "999px",

        background: "#e2e8f0",

        fontSize: "12px"
      }}
    >

      <span>{tag}</span>

      <button
        onClick={() => removeTag(tag)}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "red",
          fontWeight: "bold"
        }}
      >
        ×
      </button>

    </div>

  ))}

</div>

{/* 💾 Save */}
<button
  onClick={saveCustomerNotes}
  style={{
    marginTop: "14px",

    padding: "10px 16px",

    borderRadius: "10px",

    border: "none",

    background: "#0f172a",

    color: "#fff",

    cursor: "pointer",

    fontWeight: "600"
  }}
>
  {t("customer.saveNotes")}
</button>

</div>

      {/* 📊 Stats */}
      <div className="card" style={{ marginBottom: "20px" }}>
  <h3 style={{ marginBottom: "10px" }}>{t("reports.insights")} 🧠</h3>

  <p>{t("customer.type")} <b>{customerType}</b></p>
  <p>{t("customer.avgOrder")} <b>{Math.round(avgSpend)} EGP</b></p>

  {lastVisitDays && lastVisitDays > 30 && (
    <p style={{ color: "red" }}>⚠️ {t("customer.inactive")}</p>
  )}
</div>
     <div style={{ display: "flex",
      gap: "10px",
      marginBottom: "15px",
      flexWrap: "wrap"
  }}>
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
  />

  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
  />
</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
          "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "15px",
          marginBottom: "20px"
        }}
      >
        {/* 💰 Total */}
        <div className="card">
          <p style={{ color: "#64748b", fontSize: "13px" }}>
            {t("customer.grossRevenue")}
          </p>

          <h2 style={{ color: "#0f172a", fontWeight: "bold" }}>
            {grossRevenue.toLocaleString()} EGP
          </h2>
        </div>

        {/* 📦 Orders */}
        <div className="card">
          <p style={{ color: "#64748b", fontSize: "13px" }}>
            {t("customer.orders")}
          </p>

          <h2 style={{ color: "#0f172a", fontWeight: "bold" }}>
            {filteredSales.length}
          </h2>
        </div>
        {/* ↩️ Refunded */}
        <div className="card">

          <p style={{
            color: "#64748b",
            fontSize: "13px"
          }}>
            {t("customer.refunded")}
          </p>

          <h2 style={{
            color: "#dc2626",
            fontWeight: "bold"
          }}>
            {refundedAmount.toLocaleString()} EGP
          </h2>

        </div>

        {/* 💵 Net */}
        <div className="card">

          <p style={{
            color: "#64748b",
            fontSize: "13px"
          }}>
            {t("customer.netSpending")}
          </p>

          <h2 style={{
            color: "#16a34a",
            fontWeight: "bold"
          }}>
            {netSpent.toLocaleString()} EGP
          </h2>

        </div>
        {/* 📅 Last Visit */}
        <div className="card">
          <p style={{ color: "#64748b", fontSize: "13px" }}>
            {t("customer.lastVisit")}
          </p>

          <h2 style={{ color: "#0f172a", fontWeight: "bold" }}>
            {customer.lastPurchase
              ? new Date(
                  customer.lastPurchase.seconds * 1000
                ).toLocaleDateString()
              : "-"}
          </h2>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
  <h3 style={{ marginBottom: "10px" }}>
    {t("reports.topProducts")} 🧠
  </h3>

  {topProducts.length === 0 ? (
    <p style={{ color: "var(--text-muted)" }}>{t("common.noData")}</p>
  ) : (
    topProducts.map(([name, qty], i) => (
      <div
        key={i}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          padding: "8px 0",
          marginBottom: "6px"
        }}
      >
        <span>{name}</span>
        <b>{qty}</b>
      </div>
    ))
  )}
</div>
<div className="card" style={{ marginBottom: "20px" }}>
  <h3 style={{ marginBottom: "10px" }}>{t("reports.spendingTrend")} 📊</h3>

  <ResponsiveContainer width="100%" height={200}>
  <LineChart data={chartData}>

    <CartesianGrid strokeDasharray="3 3" />

    <XAxis dataKey="date" />

    <YAxis />

    <Tooltip />

    <Line
      type="monotone"
      dataKey="net"
      strokeWidth={2}
      dot={true}
    />

  </LineChart>
</ResponsiveContainer>
</div>
      {/* 🧾 Purchases */}
      <div className="card">
        <h3 style={{
  color: "#0f172a",
  fontWeight: "600",
  fontSize: "16px",
  marginBottom: "10px"
}}>
  {t("customer.purchases")} 🧾
</h3>

        {filteredSales.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            {t("customer.noPurchases")}
          </p>
        ) : (
  <div>
  {[...filteredSales]
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .map((s, i) => (
  <div
  key={i}
  className="card"
  style={{
    marginBottom: "10px",
    cursor: "pointer",
    transition: "0.2s",
    border: "1px solid var(--border)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  }}
  onClick={() => setOpenIndex(openIndex === i ? null : i)}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow =
      "0 10px 20px rgba(0,0,0,0.06)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 1px 3px rgba(0,0,0,0.05)";
  }}
>
    {/* 🔝 Header */}
    <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: "10px",
  gap: "10px"
}}>

  <div>
    <div style={{
      fontWeight: "700",
      fontSize: "15px",
      color: "var(--text-primary)"
    }}>
      {s.invoiceNumber || t("common.notAvailable")}
    </div>

    <div style={{
      fontSize: "12px",
      color: "#64748b",
      marginTop: "3px"
    }}>
      🏢 {s.branchName || t("common.unknown")}
    </div>

    <div style={{
      fontSize: "12px",
      color: "#64748b",
      marginTop: "3px"
    }}>
      👨‍💼 {s.salesName || t("common.unknown")}
    </div>
  </div>

  <div style={{ textAlign: "right" }}>
    <b style={{
      color: "var(--text-primary)",
      fontSize: "16px"
    }}>
      {(
        (s.total || 0) -
        (s.refundedAmount || 0)
      ).toLocaleString()} EGP
    </b>

    <div style={{
      color: "var(--text-muted)",
      fontSize: "12px",
      marginTop: "4px"
    }}>
      {new Date(
        s.createdAt.seconds * 1000
      ).toLocaleString()}
    </div>
  </div>

</div>

    {/* 📦 Items */}
    <div style={{ fontSize: "12px", color: "#64748b" }}>
  {t(`payment.${t(`payment.${s.paymentMethod}`)}`)}
</div>

{s.refundedAmount > 0 && (
  <span style={{
    display: "inline-block",
    marginTop: "8px",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "600"
  }}>
    ↩️ Refunded:
    {s.refundedAmount.toLocaleString()} EGP
  </span>
)}
    {openIndex === i && (
  <div style={{ marginTop: "10px" }}>
    {s.items?.map((item, idx) => (
      
  <div
    key={idx}
    style={{
      marginTop: "8px",
      padding: "10px",
      borderRadius: "10px",
      background: "#f9fafb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >

    {/* 👈 اسم المنتج */}
    <div>
      <div style={{ fontWeight: "500" }}>
        {item.name}
      </div>

      <div style={{
        fontSize: "12px",
        color: "#64748b",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        marginTop: "4px"
      }}>
        <span>
          {t("common.qty")} {item.qty}
        </span>

        <span>
          🧴 {item.containerType || "-"}
        </span>

        {item.size && (
          <span>
            📏 {item.size}
          </span>
        )}
      </div>
    </div>

    {/* 👉 السعر */}
    <div style={{ fontSize: "12px", color: "#64748b" }}>
  {item.qty} × {item.price} EGP
</div>

  </div>
))}
  </div>
)}
  </div>
))}
</div>
        )}
      </div>

    </div>
  );
}
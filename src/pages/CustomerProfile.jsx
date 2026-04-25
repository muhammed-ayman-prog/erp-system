import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useTranslate } from "../useTranslate";
export default function CustomerProfile() {
  const t = useTranslate();
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerRef = doc(db, "customers", id);
        const customerSnap = await getDoc(customerRef);

        if (customerSnap.exists()) {
          const customerData = customerSnap.data();
          setCustomer(customerData);

          const q = query(
  collection(db, "sales"),
  where("customerId", "==", id)
);

          const salesSnap = await getDocs(q);
          const salesData = salesSnap.docs.map(doc => doc.data());

          setSales(salesData);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);
  const filteredSales = sales.filter(s => {
  const date = new Date(s.createdAt.seconds * 1000);

  if (fromDate && date < new Date(fromDate)) return false;
  if (toDate && date > new Date(toDate)) return false;

  return true;
});
  const totalSpent = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
  
  if (loading)
    return <p style={{ padding: "20px" }}>{t("common.loading")}</p>;

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
  total: s.total
}));
const avgSpend = totalSpent / (filteredSales.length || 1);

let customerType = "Normal";

if (totalSpent > 1000) customerType = "VIP 💎";
else if (filteredSales.length >= 5) customerType = "Loyal 🔁";
else if (filteredSales.length === 1) customerType = "New 🆕";

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
  gap: "8px"
}}>
  👤 {customer.name || t("customer.noName")}
</h2>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          {customer.phone}
        </p>
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
     <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
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
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px"
        }}
      >
        {/* 💰 Total */}
        <div className="card">
          <p style={{ color: "#64748b", fontSize: "13px" }}>
            {t("customer.totalSpent")}
          </p>

          <h2 style={{ color: "#0f172a", fontWeight: "bold" }}>
            {totalSpent.toLocaleString()} EGP
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
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="total" strokeWidth={2} />
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
    transition: "0.2s"
  }}
  onClick={() => setOpenIndex(openIndex === i ? null : i)}
>
    {/* 🔝 Header */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px"
    }}>
      <b style={{ color: "var(--text-primary)" }}>
        {s.total} EGP
      </b>

      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
        {new Date(s.createdAt.seconds * 1000).toLocaleString()}
      </span>
    </div>

    {/* 📦 Items */}
    <div style={{ fontSize: "12px", color: "#64748b" }}>
  {s.paymentMethod}
</div>
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

      <div style={{ fontSize: "12px", color: "#64748b" }}>
        {t("common.qty")} {item.qty}
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
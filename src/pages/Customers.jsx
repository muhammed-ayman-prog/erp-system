import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { useApp } from "../store/useApp";
import { useAuth } from "../store/useAuth";
import { useTranslate } from "../useTranslate";
export default function Customers() {
  const { t, lang } = useTranslate();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const { selectedBranch } = useApp();
  const { user } = useAuth();
  if (user?.role !== "owner") {
  return null;
}
  useEffect(() => {


  const q = collection(db, "customers");

  const unsub = onSnapshot(
    q,
    (snapshot) => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCustomers(data);
      setLoading(false);
    }
  );

  return () => unsub();
}, [user]);

  const filteredCustomers = customers
  .filter(c =>
    (c.name || "").toLowerCase().includes(search.trim().toLowerCase()) ||
    (c.phone || "").includes(search)
  )
  .sort((a, b) => {

    if (sortBy === "spent") {
      return (b.totalSpent || 0) - (a.totalSpent || 0);
    }

    if (sortBy === "orders") {
      return (b.ordersCount || 0) - (a.ordersCount || 0);
    }

    if (sortBy === "visit") {
      return (
        (b.lastPurchase?.seconds || 0) -
        (a.lastPurchase?.seconds || 0)
      );
    }

    return (a.name || "").localeCompare(b.name || "");
  });

  return (
    <div style={{ flex: 1 }}>

      {/* 🔝 Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        gap: "12px",
        flexWrap: "wrap"
      }}>
        <h2>
  {t("customer.title")} 👥
</h2>

        <div className="card" style={{ padding: "10px 15px" }}>
          <>
  <b>{customers.length}</b>
  {" "}
  {t("customer.title")}
</>
        </div>
      </div>

      {/* 🔍 Search */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>
        <input
          type="text"
          placeholder={t("customer.searchCustomers")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            minWidth: "220px"
          }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            minWidth: "180px"
          }}
        >
          <option value="name">A-Z</option>
          <option value="spent">
  {t("customer.mostSpending")}
</option>
          <option value="orders">
  {t("customer.mostOrders")}
</option>
          <option value="visit">
  {t("customer.latestVisit")}
</option>
        </select>
      </div>

      {/* 📦 Content */}
      {loading ? (
        <p>{t("common.loading")}</p>
      ) : filteredCustomers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "30px" }}>
          <p>{t("common.noData")} 😅</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "15px"
        }}>
          
          {filteredCustomers.map(c => (
            <div
              key={c.id}
              className="card"
              style={{
                cursor: "pointer",
                transition: "0.25s",
                border: "1px solid var(--border)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
                onClick={() => navigate(`/customers/${c.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px"
}}>
  <h3 style={{
    fontSize: "16px",
    margin: 0
  }}>
    {c.name || t("common.unknown")}
  </h3>

  {(c.totalSpent || 0) >= 50000 &&
(c.ordersCount || 0) >= 25 ? (

  <span style={{
    fontSize: "12px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#ede9fe"
  }}>
    {t("customer.elite")} 👑
  </span>

) : (c.totalSpent || 0) >= 15000 &&
(c.ordersCount || 0) >= 10 ? (

  <span style={{
    fontSize: "12px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#fef3c7"
  }}>
    {t("customer.vip")} 💎
  </span>

) : (c.ordersCount || 0) >= 5 ||
(c.totalSpent || 0) >= 6000 ? (

  <span style={{
    fontSize: "12px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#dbeafe"
  }}>
    {t("customer.loyal")} 🔁
  </span>

) : (

  <span style={{
    fontSize: "12px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#e2e8f0"
  }}>
    {t("customer.new")} 🆕
  </span>

)}
</div>

<p style={{
  color: "#64748b",
  fontSize: "13px",
  marginBottom: "12px"
}}>
  {c.phone}
</p>

<div style={{
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "13px"
}}>
  <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>
  <span>
  💰 {t("customer.totalSpent")}
</span>

  <b>
    {(c.totalSpent || 0).toLocaleString()} EGP
  </b>
</div>

<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>
  <span>
  ↩️ {t("customer.refunded")}
</span>

  <b style={{ color: "#dc2626" }}>
    {(c.totalRefunded || 0).toLocaleString()} EGP
  </b>
</div>

  <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>
    <span>
  🧾 {t("customer.orders")}
</span>
    <b>{c.ordersCount || 0}</b>
  </div>

  <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>
    <span>
  📅 {t("customer.lastVisit")}
</span>

    <b>
      {c.lastPurchase
        ? new Date(
            c.lastPurchase.seconds * 1000
          ).toLocaleDateString()
        : "-"}
    </b>
  </div>
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
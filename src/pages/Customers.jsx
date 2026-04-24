import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { query, where, getDocs, updateDoc ,collection } from "firebase/firestore";


export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const snapshot = await getDocs(collection(db, "customers"));

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCustomers(data);
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers
    .filter(c =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search)
    )
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div style={{ flex: 1 }}>

      {/* 🔝 Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>Customers 👥</h2>

        <div className="card" style={{ padding: "10px 15px" }}>
          <b>{customers.length}</b> Customers
        </div>
      </div>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          marginBottom: "20px"
        }}
      />

      {/* 📦 Content */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredCustomers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "30px" }}>
          <p>مفيش عملاء لسه 😅</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "15px"
        }}>
          
          {filteredCustomers.map(c => (
            <div
              key={c.id}
              className="card"
              style={{
                cursor: "pointer",
                transition: "0.25s"
              }}
                onClick={() => navigate(`/customers/${c.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <h3 style={{ fontSize: "16px" }}>{c.name}</h3>

              <p style={{ color: "#64748b", fontSize: "13px" }}>
                {c.phone}
              </p>

              {c.lastPurchase && (
                <p style={{ fontSize: "12px", marginTop: "8px" }}>
                  آخر زيارة: {new Date(c.lastPurchase.seconds * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
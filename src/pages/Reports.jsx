import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { motion } from "framer-motion";
import {
  Calendar, Building2, Download, TrendingUp,
  DollarSign, FileText
} from "lucide-react";

import { exportToExcel, exportToPDF } from "../utils/exportReports";
import logo from "../assets/logo.png";

export default function Reports() {
  const [drillData, setDrillData] = useState([]);
  const [drillTitle, setDrillTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [range, setRange] = useState({ from: today, to: today });
  const [branch, setBranch] = useState("all");
  const [raw, setRaw] = useState([]);

  // 🔹 fetch
  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "stock"));
      const rows = [];

      snap.forEach(doc => {
        const d = doc.data();
        if (d.type !== "sale") return;

        const date = new Date(d.createdAt?.seconds * 1000 || Date.now());

        rows.push({
          date,
          day: date.toISOString().split("T")[0],
          total: d.total || 0,
          qty: d.quantity || 0,
          branch: d.branchName || "Unknown",
          productId: d.productId || "Unknown"
        });
      });

      setRaw(rows);
    };

    fetch();
  }, []);

  // 🔹 filter
  const filtered = useMemo(() => {
    return raw.filter(r => {
      if (range.from && r.day < range.from) return false;
      if (range.to && r.day > range.to) return false;
      if (branch !== "all" && r.branch !== branch) return false;
      return true;
    });
  }, [raw, range, branch]);

  // 🔹 aggregates
  const { sales, invoices, salesPerDay, salesByBranch, topProducts } = useMemo(() => {
    let sales = 0;
    let invoices = 0;

    const dailyMap = {};
    const branchMap = {};
    const productMap = {};

    filtered.forEach(r => {
      sales += r.total;
      invoices++;

      dailyMap[r.day] = (dailyMap[r.day] || 0) + r.total;
      branchMap[r.branch] = (branchMap[r.branch] || 0) + r.total;
      productMap[r.productId] = (productMap[r.productId] || 0) + r.qty;
    });

    return {
      sales,
      invoices,
      salesPerDay: Object.entries(dailyMap)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
      salesByBranch: Object.entries(branchMap)
        .map(([name, total]) => ({ name, total })),
      topProducts: Object.entries(productMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 6)
    };
  }, [filtered]);

  const branches = useMemo(
    () => Array.from(new Set(raw.map(r => r.branch))),
    [raw]
  );

  // 🔥 EXPORT
  const handleExcel = () => {
    exportToExcel([
      { sheet: "Branches", data: salesByBranch },
      { sheet: "Products", data: topProducts },
      { sheet: "Daily", data: salesPerDay }
    ], `Report_${range.from}_${range.to}_${branch}`);
  };

  const handlePDF = () => {
    exportToPDF(
      salesByBranch,
      `Report_${range.from}_${range.to}_${branch}`,
      { logo }
    );
  };
  // 🔥 RESET SYSTEM
const clearCollection = async (name) => {
  const snapshot = await getDocs(collection(db, name));
  const deletions = snapshot.docs.map(d =>
    deleteDoc(doc(db, name, d.id))
  );
  await Promise.all(deletions);
};

const resetInventory = async () => {
  const snapshot = await getDocs(collection(db, "inventory"));

  const updates = snapshot.docs.map(d =>
    updateDoc(doc(db, "inventory", d.id), {
      quantity: 0 // ⚠️ لو اسم الفيلد مختلف عدله
    })
  );

  await Promise.all(updates);
};

const handleResetSystem = async () => {
  const confirm = window.confirm("⚠️ متأكد إنك عايز تصفر السيستم؟");

  if (!confirm) return;

  try {
    // 1. تصفير inventory
    await resetInventory();

    // 2. مسح الداتا
    const collectionsToClear = [
      "sales",
      "purchases",
      "returns",
      "returned_items",
      "expenses",
      "logs",
      "stock",
      "stats",
      "customers"
    ];

    for (const name of collectionsToClear) {
      await clearCollection(name);
    }

    alert("✅ تم تصفير السيستم بنجاح");
    window.location.reload(); // ريفريش
  } catch (err) {
    console.error(err);
    alert("❌ حصل خطأ");
  }
};

  // 🔥 DRILL
  const handleDrill = (type, value) => {
    let result = [];

    if (type === "day") {
      result = filtered.filter(r => r.day === value);
      setDrillTitle(`📅 ${value}`);
    }

    if (type === "branch") {
      result = filtered.filter(r => r.branch === value);
      setDrillTitle(`🏢 ${value}`);
    }

    setDrillData(result);
    setShowModal(true);
  };

  return (
  
    <div style={page}>
      <h2>📊 Reports</h2>

      {/* FILTER */}
      <motion.div style={filterBar}>
        <div style={filterItem}>
          <Calendar size={16} />
          <input type="date" value={range.from}
            onChange={e => setRange(p => ({ ...p, from: e.target.value }))}/>
          <span>→</span>
          <input type="date" value={range.to}
            onChange={e => setRange(p => ({ ...p, to: e.target.value }))}/>
        </div>

        <div style={filterItem}>
          <Building2 size={16} />
          <select value={branch} onChange={e => setBranch(e.target.value)}>
            <option value="all">All</option>
            {branches.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
  <button style={btn} onClick={handleExcel}>
    <Download size={14}/> Excel
  </button>

  <button style={btn} onClick={handlePDF}>
    <Download size={14}/> PDF
  </button>

  {/* 🔥 RESET BUTTON */}
  <button
    style={{ ...btn, background: "#fee2e2", border: "1px solid #ef4444" }}
    onClick={handleResetSystem}
  >
    🧨 Reset
  </button>
</div>
      </motion.div>

      {/* STATS */}
      <div style={grid}>
        <Stat icon={<DollarSign/>} title="Sales" value={sales}/>
        <Stat icon={<FileText/>} title="Invoices" value={invoices}/>
        <Stat icon={<TrendingUp/>} title="Avg"
              value={invoices ? Math.round(sales / invoices) : 0}/>
      </div>
      <div style={insights}>
  <div>🔥 Best Day: {salesPerDay.at(-1)?.date || "-"}</div>
  <div>📉 Worst Day: {salesPerDay[0]?.date || "-"}</div>
  <div>🏆 Top Branch: {salesByBranch[0]?.name || "-"}</div>
</div>

      {/* CHARTS */}
      <div style={grid2}>
        <Card title="Sales Over Time">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesPerDay}>
              <XAxis dataKey="date"/>
              <YAxis/>
              <Tooltip/>
              <Area
              dataKey="total"
              stroke="#6366f1"
              fillOpacity={0.2}
              onClick={(e) => handleDrill("day", e?.activeLabel)}
            />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Branch Sales">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={salesByBranch}>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Bar
              dataKey="total"
              radius={[6, 6, 0, 0]}
              onClick={(e) => handleDrill("branch", e?.payload?.name)}
            />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={salesByBranch} dataKey="total" nameKey="name">
                {salesByBranch.map((_, i) => <Cell key={i}/>)}
              </Pie>
              <Tooltip/>
              <Legend/>
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Products">
          {topProducts.map(p => (
            <div key={p.name}>{p.name} → {p.qty}</div>
          ))}
        </Card>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={overlay} onClick={() => setShowModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3>{drillTitle}</h3>

            {drillData.map((d, i) => (
              <div key={i} style={row}>
                <span>{d.productId}</span>
                <span>{d.total}</span>
                <span>{d.branch}</span>
              </div>
            ))}

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// UI
function Stat({ icon, title, value }) {
  return (
    <motion.div style={stat} whileHover={{ scale: 1.05 }}>
      <div>{icon} {title}</div>
      <strong>{value}</strong>
    </motion.div>
  );
}
const isMobile = window.innerWidth < 768;
function Card({ title, children }) {
  return (
    <motion.div
      style={card}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <h4>{title}</h4>
      {children}
    </motion.div>
  );
}

// styles
const page = {
  padding: isMobile ? 10 : 20,
  background: "#f8fafc"
};
const grid = { display: "grid", gap: 10 };
const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // 🔥
  gap: 15,
  marginTop: 20
};
const stat = {
  background: "#fff",
  padding: 16,
  borderRadius: 16,
  border: "1px solid #f1f1f1",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: 6
};
const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 16,
  border: "1px solid #f1f1f1",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
};
const filterBar = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  background: "#fff",
  padding: 10,
  borderRadius: 12,
  border: "1px solid #eee",
  marginBottom: 15
};
const filterItem = { display: "flex", gap: 5, background: "#fff", padding: 5 };
const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  background: "#fff",
  border: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" };
const modal = {
  background: "#fff",
  padding: 20,
  margin: "50px auto",
  width: window.innerWidth < 768 ? "90%" : 400,
  maxHeight: "80vh",
  overflowY: "auto",
  borderRadius: 12
};
const row = { display: "flex", justifyContent: "space-between" };
const insights = {
  background: "#fff",
  padding: 15,
  borderRadius: 12,
  border: "1px solid #eee",
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 20
};
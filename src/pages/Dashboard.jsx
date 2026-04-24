import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import {
  DollarSign, FileText, TrendingUp,
  AlertTriangle, Users, Droplets, Download
} from "lucide-react";

import { exportToExcel, exportToPDF } from "../utils/exportReports";
import logo from "../assets/logo.png"; // ✅ اللوجو

export default function Dashboard() {
  const today = new Date().toISOString().split("T")[0];

  const [range, setRange] = useState({ from: today, to: today });
  const [data, setData] = useState({
    totalSales: 0,
    invoices: 0,
    salesPerDay: [],
    salesByBranch: [],
    bestBranch: null,
    worstBranch: null,
    topCustomers: [],
    oilUsage: [],
    alerts: { low: 0, out: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      const stockSnap = await getDocs(collection(db, "stock"));
      const productsSnap = await getDocs(collection(db, "products"));

      let totalSales = 0;
      let invoices = 0;

      const dailyMap = {};
      const branchMap = {};
      const customerMap = {};
      const oilMap = {};
      const stockMap = {};

      stockSnap.forEach(doc => {
        const d = doc.data();

        if (d.type === "sale") {
          stockMap[d.productId] =
            (stockMap[d.productId] || 0) - d.quantity;
        } else {
          stockMap[d.productId] =
            (stockMap[d.productId] || 0) + d.quantity;
        }

        if (d.type !== "sale") return;

        const date = new Date(d.createdAt?.seconds * 1000 || Date.now());
        const day = date.toISOString().split("T")[0];

        if (range.from && day < range.from) return;
        if (range.to && day > range.to) return;

        totalSales += d.total || 0;
        invoices++;

        dailyMap[day] = (dailyMap[day] || 0) + (d.total || 0);

        const branch = d.branchName || "Unknown";
        branchMap[branch] =
          (branchMap[branch] || 0) + (d.total || 0);

        const customer = d.customerName || "Walk-in";
        customerMap[customer] =
          (customerMap[customer] || 0) + (d.total || 0);

        if (
          d.category === "French" ||
          d.category?.includes("Oriental")
        ) {
          oilMap[d.productId] =
            (oilMap[d.productId] || 0) + d.quantity;
        }
      });

      const salesPerDay = Object.entries(dailyMap)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const salesByBranch = Object.entries(branchMap).map(
        ([name, total]) => ({ name, total })
      );

      const sortedBranches = [...salesByBranch].sort(
        (a, b) => b.total - a.total
      );

      const topCustomers = Object.entries(customerMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const oilUsage = Object.entries(oilMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      let low = 0;
      let out = 0;

      productsSnap.forEach(doc => {
        const qty = stockMap[doc.id] || 0;
        if (qty === 0) out++;
        else if (qty <= 20) low++;
      });

      setData({
        totalSales,
        invoices,
        salesPerDay,
        salesByBranch,
        bestBranch: sortedBranches[0],
        worstBranch: sortedBranches[sortedBranches.length - 1],
        topCustomers,
        oilUsage,
        alerts: { low, out }
      });
    };

    fetchData();
  }, [range]);

  // 🔥 EXPORT

  const handleExcel = () => {
    exportToExcel([
      { sheet: "Branches", data: data.salesByBranch },
      { sheet: "Customers", data: data.topCustomers },
      { sheet: "Oils", data: data.oilUsage }
    ], `Report_${range.from}_to_${range.to}`);
  };

  const handlePDF = () => {
    exportToPDF(
      data.salesByBranch,
      `Sales_${range.from}_to_${range.to}`,
      { logo } // ✅ اللوجو هنا
    );
  };

  // ✅ Export per branch
  const exportBranch = (branch) => {
    exportToExcel(
      data.salesByBranch.filter(b => b.name === branch),
      `Branch_${branch}`
    );
  };

  return (
    <div style={page}>
      <h2>📊 Dashboard</h2>

      {/* FILTER + EXPORT */}
      <div style={topBar}>
        <div style={filter}>
          <input type="date" value={range.from}
            onChange={(e) => setRange(p => ({ ...p, from: e.target.value }))}/>
          <span>→</span>
          <input type="date" value={range.to}
            onChange={(e) => setRange(p => ({ ...p, to: e.target.value }))}/>
        </div>

        <div style={exportBtns}>
          <motion.button whileHover={{ scale: 1.1 }} onClick={handleExcel} style={btn}>
            <Download size={14}/> Excel
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} onClick={handlePDF} style={btn}>
            <Download size={14}/> PDF
          </motion.button>
        </div>
      </div>

      {/* EXPORT PER BRANCH */}
      <div style={branchExportBox}>
  <h4 style={{ marginBottom: 10 }}>📤 Export by Branch</h4>

  <div style={branchGrid}>
    {data.salesByBranch.map(b => (
      <motion.button
        key={b.name}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={branchBtn}
        onClick={() => exportBranch(b.name)}
      >
        {b.name}
      </motion.button>
    ))}
  </div>
</div>

      {/* ALERT */}
      <motion.div style={alerts} whileHover={{ scale: 1.03 }}>
        <AlertTriangle size={18}/> ❌ {data.alerts.out} | ⚠️ {data.alerts.low}
      </motion.div>

      {/* CARDS */}
      <div style={grid}>
        <StatCard icon={<DollarSign />} title="Sales" value={data.totalSales}/>
        <StatCard icon={<FileText />} title="Invoices" value={data.invoices}/>
        <StatCard icon={<TrendingUp />} title="Best" value={data.bestBranch?.name}/>
        <StatCard icon={<TrendingUp />} title="Worst" value={data.worstBranch?.name}/>
      </div>

      {/* CHART */}
      <AnimatedCard title="Sales Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.salesPerDay}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" />
          </LineChart>
        </ResponsiveContainer>
      </AnimatedCard>

      {/* LISTS */}
      <div style={grid}>
        <List title="Top Customers" icon={<Users />} data={data.topCustomers} field="total"/>
        <List title="Oil Usage" icon={<Droplets />} data={data.oilUsage} field="qty"/>
      </div>
    </div>
  );
}

// COMPONENTS (زي ما هي)

function StatCard({ icon, title, value }) {
  return (
    <motion.div style={card} whileHover={{ scale: 1.05 }}>
      <div style={row}>{icon}{title}</div>
      <div style={big}>{value || "-"}</div>
    </motion.div>
  );
}

function AnimatedCard({ title, children }) {
  return (
    <motion.div style={card} whileHover={{ scale: 1.02 }}>
      <h4>{title}</h4>
      {children}
    </motion.div>
  );
}

function List({ title, icon, data, field }) {
  return (
    <motion.div style={card} whileHover={{ scale: 1.02 }}>
      <div style={row}>{icon}{title}</div>
      {data.map(i => (
        <div key={i.name} style={listItem}>
          <span>{i.name}</span>
          <strong>{i[field]}</strong>
        </div>
      ))}
    </motion.div>
  );
}

// STYLES

const page = { padding: 20, background: "#f8fafc" };
const topBar = { display: "flex", justifyContent: "space-between", marginBottom: 15 };
const filter = { display: "flex", gap: 10 };
const exportBtns = { display: "flex", gap: 10 };
const btn = { padding: "6px 12px", borderRadius: 8, cursor: "pointer", background: "#fff", border: "1px solid #ddd" };
const alerts = { padding: 10, background: "#fff3cd", borderRadius: 10, marginBottom: 15 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 15 };
const card = { background: "#fff", padding: 15, borderRadius: 12, boxShadow: "0 5px 15px rgba(0,0,0,0.05)" };
const row = { display: "flex", alignItems: "center", gap: 8 };
const listItem = { display: "flex", justifyContent: "space-between", padding: "5px 0" };
const big = { fontSize: 20, fontWeight: "bold" };
const branchExportBox = {
  background: "#fff",
  padding: 15,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
};

const branchGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10
};

const branchBtn = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#f8fafc",
  cursor: "pointer"
};
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
import { useTranslate } from "../useTranslate";

export default function Dashboard() {
  const t = useTranslate();
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
  const isMobile = window.innerWidth < 768;

  return (
    <div style={page(isMobile)}>
      <h2 style={{ marginBottom: "10px" }}>📊 {t("navigation.dashboard")}</h2>

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
            <Download size={14}/> {t("common.excel")}
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} onClick={handlePDF} style={btn}>
            <Download size={14}/> {t("common.pdf")}
          </motion.button>
        </div>
      </div>

      {/* EXPORT PER BRANCH */}
      <div style={branchExportBox}>
  <h4 style={{ marginBottom: 10 }}>📤 {t("reports.exportByBranch")}</h4>

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
        <AlertTriangle size={18}/> ❌ ❌ {data.alerts.out} {t("inventory.outOfStock")} | ⚠️ {data.alerts.low} {t("inventory.lowStock")}
      </motion.div>

      {/* CARDS */}
      <div style={grid}>
        <StatCard icon={<DollarSign />} title={t("reports.sales")} value={data.totalSales}/>
        <StatCard icon={<FileText />} title={t("reports.invoices")} value={data.invoices}/>
        <StatCard icon={<TrendingUp />} title={t("reports.best")} value={data.bestBranch?.name}/>
        <StatCard icon={<TrendingUp />} title={t("reports.worst")} value={data.worstBranch?.name}/>
      </div>

      {/* CHART */}
      <AnimatedCard title={t("reports.salesOverTime")}>
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
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
        <List title={t("reports.topCustomers")} icon={<Users />} data={data.topCustomers} field="total"/>
        <List title={t("reports.oilUsage")} icon={<Droplets />} data={data.oilUsage} field="qty"/>
      </div>
    </div>
  );
}

// COMPONENTS (زي ما هي)

function StatCard({ icon, title, value }) {
  return (
    <motion.div
  style={card}
  whileHover={{ scale: 1.05, y: -5 }}
  transition={{ type: "spring", stiffness: 200 }}
>
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

const page = (isMobile) => ({
  padding: isMobile ? 10 : 20,
  background: "#f8fafc"
});
const topBar = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap", // 🔥 مهم
  gap: 10,
  marginBottom: 15
};
const filter = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
};
const exportBtns = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  width: "100%"
};
const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  background: "#fff",
  border: "1px solid #e5e7eb",
  flex: "1 1 120px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontWeight: "500",
  transition: "0.2s"
};
const alerts = {
  padding: 12,
  background: "#fff7ed",
  borderRadius: 12,
  marginBottom: 15,
  border: "1px solid #fde68a",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: "500"
};
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 15 };
const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  transition: "0.3s",
  border: "1px solid #f1f1f1"
};
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
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10
};

const branchBtn = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  transition: "0.2s",
  fontWeight: "500"
};
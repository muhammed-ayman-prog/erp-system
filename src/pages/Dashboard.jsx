import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
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
import { BarChart, Bar } from "recharts";
import { Cell } from "recharts";
export default function Dashboard() {
  const t = useTranslate();
  const [activity, setActivity] = useState([]);
  const today = new Date().toLocaleDateString("en-CA");
  const [range, setRange] = useState({ from: today, to: today });
  const [data, setData] = useState({
    totalSales: 0,
    invoices: 0,
    growth: 0,
    todaySales: 0,
    salesPerDay: [],
    salesByBranch: [],
    bestBranch: null,
    worstBranch: null,
    bestPercent: 0,
    topProducts: [],
    avgOrder: 0,
    alerts: { low: 0, out: 0 }
  });
  const branchNames = {
  y2aCRTss8tUiLw9g8WCw: "Abbas Akkad 1",
  RFA1pToN9LPfFSnenbSY: "Abbas Akkad 2",
  nCYR3hk9rVjhT8fcWbV5: "Abbas Akkad 3",
  DUuSkP04TnYT2XhvqoVy: "City Stars",
  QPGcEaPljiGIpQMz9GYy: "El Obour",
  VmNcbSmkrVo5Bjup8Zxx: "El Rehab",
};
  useEffect(() => {
  let unsubscribe;

  const init = async () => {

    unsubscribe = onSnapshot(collection(db, "sales"), (snap) => {
      const salesDocs = snap.docs;
      let invoices = salesDocs.length;
      const latestActivity = [...salesDocs]
      .sort((a, b) =>
        (b.data().createdAt?.seconds || 0) -
        (a.data().createdAt?.seconds || 0)
      )
      .slice(0, 10)
  .map(doc => {
    const d = doc.data();
    return {
      type: "sale",
      amount: d.total || 0,
      branch: branchNames[d.branchId] || "Unknown",
      date: d.createdAt || null
    };
  });

setActivity(latestActivity);

      let totalSales = 0;

      const dailyMap = {};
      const branchMap = {};

      salesDocs.forEach(doc => {
        const d = doc.data();

        

        const date = new Date(d.createdAt?.seconds * 1000 || Date.now());
        const day = date.toLocaleDateString("en-CA");

        if (range.from && day < range.from) return;
        if (range.to && day > range.to) return;

        const total = d.total || 0;

        totalSales += total;

        dailyMap[day] = (dailyMap[day] || 0) + total;

        const branch = branchNames[d.branchId] || "Unknown";
        branchMap[branch] =
          (branchMap[branch] || 0) + total;
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

      let low = 0;
      let out = 0;

      

      
      const todayDate = new Date().toLocaleDateString("en-CA");

const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayStr = yesterdayDate.toLocaleDateString("en-CA");

let todaySales = 0;
let yesterdaySales = 0;

salesDocs.forEach(doc => {
  const d = doc.data();
  const total = d.total || 0;

  const date = new Date(d.createdAt?.seconds * 1000 || Date.now());
  const day = date.toLocaleDateString("en-CA");

  if (day === todayDate) {
    todaySales += total;
  }

  if (day === yesterdayStr) {
    yesterdaySales += total;
  }
});
  const growth =
    yesterdaySales === 0
      ? 0
      : ((todaySales - yesterdaySales) / yesterdaySales) * 100;
  const best = sortedBranches[0] || null;

  let bestPercent = 0;

  if (best && totalSales > 0) {
    bestPercent = (best.total / totalSales) * 100;
  }
  const productMap = {};

salesDocs.forEach(doc => {
  const d = doc.data();

  if (!d.items) return;

  d.items.forEach(item => {
    const name = item.name || "Unknown";
    const itemTotal = (item.price || 0) * (item.qty || 0);

    productMap[name] = (productMap[name] || 0) + itemTotal;
  });
});

const topProducts = Object.entries(productMap)
  .map(([name, total]) => ({ name, total }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 5);

  const avgOrder =
  invoices > 0 ? totalSales / invoices : 0;
  salesByBranch.sort((a, b) => b.total - a.total);
      setData({
  totalSales,
  invoices,
  salesPerDay,
  salesByBranch,
  bestBranch: best,
  worstBranch:
  sortedBranches.length > 1
    ? sortedBranches[sortedBranches.length - 1]
    : null,
  alerts: { low, out },
  growth,
  todaySales,
  bestPercent,
  avgOrder,
  topProducts // 👈 جديد
});
    });
  };

  init();

  return () => unsubscribe && unsubscribe();
}, [range]);

  // 🔥 EXPORT

  const handleExcel = () => {
  exportToExcel(
    [{ sheet: "Branches", data: data.salesByBranch }],
    `Report_${range.from}_to_${range.to}`
  );
};

  const handlePDF = () => {
    exportToPDF(
      data.salesByBranch,
      `Sales_${range.from}_to_${range.to}`,
      { logo } // ✅ اللوجو هنا
    );
  };

  // ✅ Export per branch

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

      

      {/* ALERT */}
      <motion.div style={alerts} whileHover={{ scale: 1.02 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <AlertTriangle size={18}/> Alerts
  </div>

  <div>
    ❌ {data.alerts.out} | ⚠️ {data.alerts.low}
  </div>
</motion.div>

      {/* CARDS */}
      {data.invoices === 0 && (
        <div style={{
          padding: 25,
          textAlign: "center",
          color: "#6b7280",
          background: "#fff",
          borderRadius: 16,
          marginBottom: 15,
          border: "1px dashed #e5e7eb"
        }}>
          <div style={{ fontSize: 22 }}>📭</div>
          <div>No sales data in selected period</div>
        </div>
      )}
      <div style={grid}>
        <StatCard icon={<DollarSign />} title={t("reports.sales")} value={data.totalSales}/>
        <StatCard
          icon={<DollarSign />}
          title="Today"
          value={data.todaySales}
        />
        <StatCard icon={<FileText />} title={t("reports.invoices")} value={data.invoices}/>
        <StatCard
        icon={<Users />}
        title={
          <div title="Average revenue per invoice">
            Avg Order
          </div>
        }
        value={data.avgOrder}
      />
        <StatCard
        icon={<TrendingUp />}
        title="Growth"
        value={
          <span style={{
          color: data.growth > 5 ? "green" :
          data.growth < 0 ? "red" :
          "#f59e0b",
          display: "flex",
          alignItems: "center",
          gap: 4
        }}>
          {data.growth >= 0 ? "📈" : "📉"}
          {data.growth?.toFixed(1)}%
        </span>
        }
      />
        <StatCard
        icon={<TrendingUp />}
        title={t("reports.worst")}
        value={data.worstBranch?.name || "-"}
      />
        <BestBranchCard
          branch={data.bestBranch}
          percent={data.bestPercent}
        />
        <TopProductsCard products={data.topProducts} totalSales={data.totalSales} />
      </div>

{/* Line Chart */}
<AnimatedCard title={t("reports.salesOverTime")}>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data.salesPerDay}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="total"
        strokeWidth={3}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
</AnimatedCard>

{/* Bottom Section */}
<div style={{
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 15,
  marginTop: 15
}}>

  {/* Bar Chart */}
  <AnimatedCard title="Branch Performance">
    {data.salesByBranch.length === 0 ? (
      <div style={{
        textAlign: "center",
        color: "#6b7280",
        padding: 20
      }}>
        📊 No branch data
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.salesByBranch}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {data.salesByBranch.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.name === data.bestBranch?.name
                    ? "#22c55e"
                    : "#3b82f6"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </AnimatedCard>

  {/* Activity */}
  <ActivityFeed data={activity} />

</div>
      {/* LISTS */}
      <div style={grid}>
      </div>
    </div>
  );
  
}

// COMPONENTS (زي ما هي)

function StatCard({ icon, title, value }) {
  return (
    <motion.div
      style={card}
      whileHover={{ scale: 1.04, y: -4 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{title}</div>
        <div style={{ opacity: 0.7 }}>{icon}</div>
      </div>

      <div style={{
        fontSize: 26,
        fontWeight: "bold",
        marginTop: 8
      }}>
        <motion.span
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {typeof value === "number"
    ? value.toLocaleString(undefined, {
  maximumFractionDigits: 1
})
    : value || "-"}
</motion.span>
      </div>
    </motion.div>
  );
}

function AnimatedCard({ title, children }) {
  return (
    <motion.div style={card} whileHover={{ scale: 1.01 }}>
      <h4 style={{ marginBottom: 10 }}>{title}</h4>
      {children}
    </motion.div>
  );
}
function ActivityFeed({ data }) {
  return (
    <motion.div style={card}>
      <h4 style={{ marginBottom: 10 }}>Recent Activity</h4>

      {data.map((item, i) => {
        const time = item.date?.seconds
          ? new Date(item.date.seconds * 1000).toLocaleTimeString()
          : "";

        return (
          <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 6px",
          fontSize: 14,
          borderRadius: 8,
          cursor: "pointer",
          transition: "0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
            <span>
              {item.type === "sale" ? "🟢 Sale" : "⚪"} {item.branch}
              <div style={{ fontSize: 11, color: "#888" }}>{time}</div>
            </span>

            <strong>
              {(item.amount || 0).toLocaleString()} EGP
            </strong>
          </div>
        );
      })}
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
  padding: 14,
  background: "#fff1f2",
  borderRadius: 14,
  marginBottom: 20,
  border: "1px solid #fecaca",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontWeight: "600"
};
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 15 };
const card = {
  background: "#fff",
  padding: 18,
  borderRadius: 18,
  boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
  border: "1px solid #f3f4f6"
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
function BestBranchCard({ branch, percent }) {
  if (!branch) return null;

  return (
    <motion.div style={{
  ...card,
  border: "2px solid #22c55e" // 👈 إضافة
}}  whileHover={{ scale: 1.03  }}>
      <div style={{ marginBottom: 10, fontSize: 13, color: "#6b7280" }}>
        🏆 Best Branch
      </div>

      <div style={{ fontSize: 20, fontWeight: "bold" }}>
        {branch.name}
      </div>

      <div style={{ marginTop: 5, fontSize: 14 }}>
        {branch.total.toLocaleString()} EGP
      </div>

      {/* Progress Bar */}
      <div style={{
        height: 8,
        background: "#e5e7eb",
        borderRadius: 10,
        marginTop: 12,
        overflow: "hidden"
      }}>
        <div style={{
          width: `${percent}%`,
          height: "100%",
          background: "#22c55e",
          transition: "0.4s"
        }} />
      </div>

      <div style={{
        marginTop: 6,
        fontSize: 12,
        color: "#6b7280"
      }}>
        {percent.toFixed(1)}% of total sales
      </div>
    </motion.div>
  );
}
function TopProductsCard({ products, totalSales }) {
  if (!products || products.length === 0) return null;

  return (
    <motion.div style={card} whileHover={{ scale: 1.02 }}>
      <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
  🔥 Top Products
</h4>

      {products.map((p, i) => {
        const percent = totalSales > 0
        ? Math.min((p.total / totalSales) * 100, 100)
        : 0;

        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14
            }}>
              <span>{p.name}</span>
              <strong>{p.total.toLocaleString()} EGP</strong>
            </div>

            {/* Progress */}
            <div style={{
              height: 6,
              background: "#e5e7eb",
              borderRadius: 10,
              marginTop: 4,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percent}%`,
                height: "100%",
                background: "#3b82f6"
              }} />
            </div>

            <div style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 2
            }}>
              {percent.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
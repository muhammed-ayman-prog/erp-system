import {  useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import {
  DollarSign, FileText, TrendingUp,
  AlertTriangle, Users, Download
} from "lucide-react";

import { exportToExcel, exportToPDF } from "../utils/exportReports";
import logo from "../assets/logo.png"; // ✅ اللوجو
import { useTranslate } from "../useTranslate";
import useDashboardData from
"../hooks/useDashboardData";
import ActivityFeed from
"../components/dashboard/ActivityFeed";
import StatCard from
"../components/dashboard/StatCard";
import AnimatedCard from
"../components/dashboard/AnimatedCard";
import BestBranchCard from
"../components/dashboard/BestBranchCard";
import TopProductsCard from
"../components/dashboard/TopProductsCard";
import TopOilsCard from
"../components/dashboard/TopOilsCard";
import ProfitableOilsCard from
"../components/dashboard/ProfitableOilsCard";
import CriticalStockCard from
"../components/dashboard/CriticalStockCard";
import {
  grid,
 } from
"../components/dashboard/styles";

import CriticalItemModal from
"../components/dashboard/CriticalItemModal";

import {
  page,
  topBar,
  filter,
  exportBtns,
  btn,
  alerts
} from
"../components/dashboard/dashboardStyles";
import DeadStockCard from
"../components/dashboard/DeadStockCard";
import FastMovingCard from
"../components/dashboard/FastMovingCard";
export default function Dashboard() {
  const t = useTranslate();
  const today = new Date().toLocaleDateString("en-CA");
  const [range, setRange] = useState({ from: today, to: today });
  const {
  data,
  activity,
  deadStock,
  fastMoving
} =
useDashboardData(range);
  
  const [
  selectedCriticalItem,
  setSelectedCriticalItem
] = useState(null);
  
  

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

  
  return (
    <div style={page}>
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
        <StatCard
          icon={<DollarSign />}
          title="Profit"
          value={data.totalProfit}
        />

        <StatCard
          icon={<TrendingUp />}
          title="Avg Margin"
          value={`${data.avgMargin.toFixed(1)}%`}
        />
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
        <TopOilsCard oils={data.topOils} />
        <ProfitableOilsCard oils={data.profitableOils} />
        <CriticalStockCard
  title="🛢 Critical Oils"
  items={
    data.criticalStock.filter(
      i => i.type === "oil"
    )
  }
  onSelect={setSelectedCriticalItem}
/>

<CriticalStockCard
  title="📦 Critical Containers"
  items={
    data.criticalStock.filter(
      i => i.type === "container"
    )
  }
  onSelect={setSelectedCriticalItem}
/>

<CriticalStockCard
  title="🧴 Critical Body Products"
  items={
    data.criticalStock.filter(
      i => i.type === "product"
    )
  }
  onSelect={setSelectedCriticalItem}
/>

<CriticalStockCard
  title="✨ Critical Originals"
  items={
    data.criticalStock.filter(
      i => i.type === "original"
    )
  }
  onSelect={setSelectedCriticalItem}
/>
<DeadStockCard
  items={deadStock}
/>
<FastMovingCard
  items={fastMoving}
/>
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
  gridTemplateColumns: "2fr 1fr 1fr",
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
  <AnimatedCard title="Most Profitable Branches">
  {data.profitByBranch.map((branch, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #eee"
      }}
    >
      <span>{branch.name}</span>

      <strong>
        {branch.total.toLocaleString()} EGP
      </strong>
    </div>
  ))}
</AnimatedCard>

  {/* Activity */}
  <ActivityFeed data={activity} />

</div>
      {/* LISTS */}
      <CriticalItemModal
  selectedCriticalItem={
    selectedCriticalItem
  }
  setSelectedCriticalItem={
    setSelectedCriticalItem
  }
/>

    </div>
  );
  
}

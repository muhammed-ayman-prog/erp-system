import {
  useState,
  useMemo
} from "react";
import { exportToExcel, exportToPDF } from "../utils/exportReports";
import logo from "../assets/logo.png"; // ✅ اللوجو
import { useTranslate } from "../useTranslate";
import useIsMobile from
"../hooks/useIsMobile";
import useDashboardData from
"../hooks/useDashboardData";

import CriticalItemModal from
"../components/dashboard/modals/CriticalItemModal";

import {
  page
} from
"../components/dashboard/dashboardStyles";

import DashboardSkeleton from
"../components/dashboard/skeleton/DashboardSkeleton";
import DashboardHeader from
"../components/dashboard/layout/DashboardHeader";
import DashboardStats from
"../components/dashboard/layout/DashboardStats";
import DashboardCharts from
"../components/dashboard/charts/DashboardCharts";
import DashboardEmptyState from
"../components/dashboard/layout/DashboardEmptyState";

export default function Dashboard() {
  const { t } =
  useTranslate();
  const isMobile =
  useIsMobile();
  const today = useMemo(
    () =>
      new Date()
        .toLocaleDateString(
          "en-CA"
        ),
    []
  );
  const [range, setRange] = useState({ from: today, to: today });
  const {
    data,
    activity,
    deadStock,
    fastMoving,
    loading
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

  if (loading) {
  return <DashboardSkeleton />;
}

  return (
    <div style={page}>
    <h2 style={{ marginBottom: "10px" }}>
      📊 {t("dashboard.title")}
    </h2>
      <DashboardHeader

        t={t}

        range={range}

        setRange={setRange}

        exportPDF={handlePDF}

        exportExcel={handleExcel}

        data={data}

      />

      {/* CARDS */}
      {data.invoices === 0 && (

      <DashboardEmptyState
        t={t}
      />

    )}
      
        <DashboardStats

          data={data}

          deadStock={deadStock}

          fastMoving={fastMoving}
          

          t={t}

          isMobile={isMobile}
          
        />

    <DashboardCharts

      data={data}

      activity={activity}

      isMobile={isMobile}

      t={t}

    />
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

import StatCard from
"../cards/StatCard";

import BestBranchCard from
"../cards/BestBranchCard";

import TopProductsCard from
"../cards/TopProductsCard";

import TopOilsCard from
"../cards/TopOilsCard";

import CriticalStockCard from
"../cards/CriticalStockCard";

import DeadStockCard from
"../cards/DeadStockCard";

import FastMovingCard from
"../cards/FastMovingCard";
import { memo } from "react";
function DashboardStats({

  data,

  deadStock,

  fastMoving,

  t,

  isMobile

}) {

  return (

    <div
      style={{

        display: "grid",

        gridTemplateColumns:
          isMobile
            ? "1fr"
            : "repeat(auto-fit,minmax(220px,1fr))",

        gap: 15,

        marginBottom: 20
      }}
    >

      <StatCard
        title={t("dashboard.sales")}
        value={data.totalSales}
      />

      <StatCard
        title={t("dashboard.invoices")}
        value={data.invoices}
      />

      {/*
<StatCard
  title={t("dashboard.profit")}
  value={data.totalProfit}
/>

<StatCard
  title={t("dashboard.avgMargin")}
  value={`${(data.avgMargin || 0).toFixed(1)}%`}
/>

<StatCard
  title={t("dashboard.todaySales")}
  value={data.todaySales}
/>

<StatCard
  title={t("dashboard.avgOrder")}
  value={data.avgOrder}
/>
*/}

      <BestBranchCard
        branch={data.bestBranch}
        percent={data.bestPercent}
      />

      <CriticalStockCard

  title={
    t("dashboard.criticalOils")
  }

  items={
    data.criticalStock.filter(
      item =>
        item.type === "oil"
    )
  }

  onSelect={(item) =>
    console.log(item)
  }
/>

<CriticalStockCard

  title={
    t("dashboard.criticalContainers")
  }

  items={
    data.criticalStock.filter(
      item =>
        item.type === "container"
    )
  }

  onSelect={(item) =>
    console.log(item)
  }
/>

<CriticalStockCard

  title={
    t("dashboard.criticalOriginals")
  }

  items={
    data.criticalStock.filter(
      item =>
        item.type === "original"
    )
  }

  onSelect={(item) =>
    console.log(item)
  }
/>

<CriticalStockCard

  title={
    t("dashboard.criticalProducts")
  }

  items={
    data.criticalStock.filter(
      item =>
        item.type === "product"
    )
  }

  onSelect={(item) =>
    console.log(item)
  }
/>

      <TopProductsCard
        products={data.topProducts}
      />

      <TopOilsCard
        oils={data.topOils}
      />

      <DeadStockCard
        items={deadStock}
      />

      <FastMovingCard
        items={fastMoving}
      />

    </div>

  );
}

export default memo(
  DashboardStats
);
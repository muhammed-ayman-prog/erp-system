import {
  useEffect,
  useState
} from "react";

import {
  collection,
  onSnapshot,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../firebase";

import { branchNames }
from "../constants/branches";

import calculateTopProducts from
"../utils/dashboard/calculateTopProducts";

import calculateTopOils from
"../utils/dashboard/calculateTopOils";

import calculateProfitableOils from
"../utils/dashboard/calculateProfitableOils";

import calculateCriticalStock from
"../utils/dashboard/calculateCriticalStock";

import calculateDeadStock from
"../utils/calculateDeadStock";
import calculateFastMoving from
"../utils/calculateFastMoving";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
export default function useDashboardData(range) {
const { user } = useAuth();
const { selectedBranch } = useApp();
  const [activity, setActivity] =
    useState([]);

  const [data, setData] =
    useState({
      totalSales: 0,
      invoices: 0,
      totalProfit: 0,
      profitByBranch: [],
      avgMargin: 0,
      growth: 0,
      todaySales: 0,
      salesPerDay: [],
      salesByBranch: [],
      bestBranch: null,
      worstBranch: null,
      bestPercent: 0,
      topProducts: [],
      topOils: [],
      profitableOils: [],
      criticalStock: [],
      avgOrder: 0,
      alerts: {
        low: 0,
        out: 0
      }
    });
    const [deadStock, setDeadStock] =
  useState([]);
  const [fastMoving, setFastMoving] =
  useState([]);

  useEffect(() => {

    let unsubscribe;

    const init = async () => {

      unsubscribe = onSnapshot(
        user?.role === "owner" &&
selectedBranch === "all"

? collection(db, "sales")

: query(
    collection(db, "sales"),

    where(
      "branchId",
      "==",
      selectedBranch
    )
  ),

        async (snap) => {

          const salesDocs =
            snap.docs;
          const inventorySnap =
          await getDocs(
            collection(db, "inventory")
          );

        const productsSnap =
          await getDocs(
            collection(db, "products")
          );

          let invoices = 0;

          const latestActivity =
            [...salesDocs]

            .sort((a, b) =>
              (
                b.data()
                .createdAt?.seconds || 0
              ) -
              (
                a.data()
                .createdAt?.seconds || 0
              )
            )

            .slice(0, 10)

            .map(doc => {

              const d =
                doc.data();

              return {
                type: "sale",
                amount:
                  d.total || 0,

                branch:
                  branchNames[
                    d.branchId
                  ] || "Unknown",

                date:
                  d.createdAt || null
              };

            });

          setActivity(
            latestActivity
          );

          let totalSales = 0;

          let totalProfit = 0;

          let marginSum = 0;

          const dailyMap = {};

          const branchMap = {};

          const branchProfitMap =
            {};

          salesDocs.forEach(doc => {

            const d =
              doc.data();

            const date =
              new Date(
                d.createdAt?.seconds
                * 1000 ||
                Date.now()
              );

            const day =
              date
              .toLocaleDateString(
                "en-CA"
              );

            if (
              range.from &&
              day < range.from
            ) return;

            if (
              range.to &&
              day > range.to
            ) return;

            const total =
              d.total || 0;

            const profit =
              d.totalProfit || 0;

            const margin =
              d.overallMargin || 0;

            totalSales += total;

            invoices++;

            totalProfit += profit;

            marginSum += margin;

            dailyMap[day] =
              (
                dailyMap[day] || 0
              ) + total;

            const branch =
              branchNames[
                d.branchId
              ] || "Unknown";

            branchMap[branch] =
              (
                branchMap[branch] || 0
              ) + total;

            branchProfitMap[
              branch
            ] =
              (
                branchProfitMap[
                  branch
                ] || 0
              ) + profit;

          });

          const salesPerDay =
            Object.entries(
              dailyMap
            )

            .map(
              ([date, total]) => ({
                date,
                total
              })
            )

            .sort(
              (a, b) =>
                new Date(a.date)
                - new Date(b.date)
            );

          const salesByBranch =
            Object.entries(
              branchMap
            )

            .map(
              ([name, total]) => ({
                name,
                total
              })
            );

          const profitByBranch =
            Object.entries(
              branchProfitMap
            )

            .map(
              ([name, total]) => ({
                name,
                total
              })
            )

            .sort(
              (a, b) =>
                b.total - a.total
            );

          const sortedBranches =
            [...salesByBranch]

            .sort(
              (a, b) =>
                b.total - a.total
            );

          const todayDate =
            new Date()
            .toLocaleDateString(
              "en-CA"
            );

          const yesterdayDate =
            new Date();

          yesterdayDate.setDate(
            yesterdayDate.getDate()
            - 1
          );

          const yesterdayStr =
            yesterdayDate
            .toLocaleDateString(
              "en-CA"
            );

          let todaySales = 0;

          let yesterdaySales = 0;

          salesDocs.forEach(doc => {

            const d =
              doc.data();

            const total =
              d.total || 0;

            const date =
              new Date(
                d.createdAt?.seconds
                * 1000 ||
                Date.now()
              );

            const day =
              date
              .toLocaleDateString(
                "en-CA"
              );

            if (
              day === todayDate
            ) {
              todaySales += total;
            }

            if (
              day === yesterdayStr
            ) {
              yesterdaySales += total;
            }

          });

          const growth =
            yesterdaySales === 0

            ? 0

            : (
              (
                todaySales
                - yesterdaySales
              )

              / yesterdaySales
            ) * 100;

          const best =
            sortedBranches[0]
            || null;

          let bestPercent = 0;

          if (
            best &&
            totalSales > 0
          ) {

            bestPercent =
              (
                best.total
                / totalSales
              ) * 100;

          }

          const topProducts =
            calculateTopProducts(
              salesDocs,
              range
            );

          const topOils =
            calculateTopOils(
              salesDocs,
              range
            );

          const profitableOils =
            calculateProfitableOils(
              salesDocs,
              range
            );

          const avgOrder =
            invoices > 0
            ? totalSales / invoices
            : 0;

          salesByBranch.sort(
            (a, b) =>
              b.total - a.total
          );

          const avgMargin =
            invoices > 0
            ? marginSum / invoices
            : 0;

          const {
            criticalStock,
            low,
            out
          } =
          await calculateCriticalStock(
            db,
            branchNames
          );
          const deadStockData =
            calculateDeadStock(

              productsSnap.docs,

              inventorySnap.docs,

              salesDocs

            );


          setDeadStock(
            deadStockData
          );
          const fastMovingData =
          calculateFastMoving(
            salesDocs,
          );

        setFastMoving(
          fastMovingData
        );

          setData({

            totalSales,

            invoices,

            totalProfit,

            profitByBranch,

            avgMargin,

            salesPerDay,

            salesByBranch,

            bestBranch:
              best,

            worstBranch:
              sortedBranches
                .length > 1

              ? sortedBranches[
                  sortedBranches
                  .length - 1
                ]

              : null,

            alerts: {
              low,
              out
            },

            growth,

            todaySales,

            bestPercent,

            avgOrder,

            topProducts,

            topOils,

            profitableOils,

            criticalStock

          });

        }

      );

    };

    init();

    return () =>
      unsubscribe &&
      unsubscribe();

  }, [range]);

 return {
  data,
  activity,
  deadStock,
  fastMoving
};

}
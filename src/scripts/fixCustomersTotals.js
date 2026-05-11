import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase";

export async function fixCustomersTotals() {

  console.log("🚀 Starting customers migration...");

  // 📦 هات كل الفواتير
  const salesSnap = await getDocs(
    collection(db, "sales")
  );

  const customerStats = {};

  // 🔄 جمع البيانات
  salesSnap.forEach((saleDoc) => {

    const sale = saleDoc.data();

    if (!sale.customerId) return;

    if (!customerStats[sale.customerId]) {
      customerStats[sale.customerId] = {
        totalSpent: 0,
        ordersCount: 0
      };
    }

    customerStats[sale.customerId].totalSpent +=
      sale.total || 0;

    customerStats[sale.customerId].ordersCount += 1;
  });

  // 💾 تحديث العملاء
  const updates = Object.entries(customerStats).map(
    async ([customerId, stats]) => {

      const customerRef = doc(
        db,
        "customers",
        customerId
      );

      await updateDoc(customerRef, {
        totalSpent: stats.totalSpent,
        ordersCount: stats.ordersCount
      });

      console.log(
        `✅ Updated ${customerId}`
      );
    }
  );

  await Promise.all(updates);

  console.log("🎉 Migration completed!");
}
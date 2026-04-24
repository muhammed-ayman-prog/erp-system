import {
  collection,
  getDocs,
  writeBatch,
  doc,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase";

// 🔥 حذف collection بالـ batch (آمن مع limits)
const deleteCollectionBatch = async (name) => {
  const snap = await getDocs(collection(db, name));
  const docs = snap.docs;

  const chunkSize = 400; // أقل من حد فايربيز 500
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);

    docs.slice(i, i + chunkSize).forEach((d) => {
      batch.delete(doc(db, name, d.id));
    });

    await batch.commit();
  }
};

export const resetSystem = async () => {
  // 🧹 امسح كل الداتا التشغيلية
  const collections = [
    "sales",
    "purchases",
    "stock",
    "returned_items",
    "customers",
    "inventory"
  ];

  for (const col of collections) {
    await deleteCollectionBatch(col);
  }

  // 🔄 إعادة تهيئة stats
  await setDoc(doc(db, "stats", "dashboard"), {
    totalSales: 0,
    invoices: 0,
    cash: 0,
    visa: 0,
    instapay: 0
  });

  // (اختياري) أي settings افتراضية
  // await setDoc(doc(db, "settings", "app"), { ...defaults });

  return true;
};
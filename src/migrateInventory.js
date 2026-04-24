import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";

const migrateOne = async () => {
  const snap = await getDocs(collection(db, "inventory"));

  for (const d of snap.docs) {

    // 🛑 خليه يقف عند أول doc بس
    const data = d.data();

    const parts = d.id.split("_");
    const branchId = parts[0];
    const productId = parts.slice(1).join("_");

    const newData = {
      branchId,
      productId,
      quantity: data.quantity || 0
    };

    await setDoc(doc(db, "inventory", d.id), newData);

    console.log("Migrated:", d.id);

    break; // 👈 مهم جدًا (يقف بعد واحد)
  }
};

migrateOne();
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("../serviceAccountKey.json", import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// 👇 الأحجام الحقيقية من عندك
const sizes = [
  "1.5ml",
  "quarter_tola",
  "half_tola",
  "tola",
  "8ml",
  "15ml"
];

// 👇 أنواع المسك
const types = ["tahara", "rumman", "crystal"];

const run = async () => {
  for (const type of types) {
    for (const size of sizes) {
      await db.collection("pricing").add({
        category: `musk_${type}`,
        container: "sample",
        size: size,
        price: 0
      });
    }
  }

  console.log("✅ Musk pricing (correct sizes) created");
};

run();
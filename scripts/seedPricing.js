import {
  doc,
  setDoc
} from "firebase/firestore";

import { db } from "../firebase";

export const seedPricing = async () => {

  try {

    const pricingDocs = [
        // 🔵 French Box Extra

      // 🔵 French Pure Oil
      {
        id: "french_oil",
        data: {
          category: "french_oil",
          price: 15
        }
      },

      // 🔴 Oriental Oil
      {
        id: "oriental_oil_A",
        data: {
          category: "oriental_oil",
          grade: "A",
          price: 25
        }
      },

      {
        id: "oriental_oil_B",
        data: {
          category: "oriental_oil",
          grade: "B",
          price: 25
        }
      },

      {
        id: "oriental_oil_C",
        data: {
          category: "oriental_oil",
          grade: "C",
          price: 25
        }
      },

      // 📦 Box Extras
      {
        id: "box_extra_A",
        data: {
          category: "box_extra",
          grade: "A",
          price: 1000
        }
      },

      {
        id: "box_extra_B",
        data: {
          category: "box_extra",
          grade: "B",
          price: 600
        }
      },

      {
        id: "box_extra_C",
        data: {
          category: "box_extra",
          grade: "C",
          price: 600
        }
      }
      

    ];

    for (const item of pricingDocs) {

      await setDoc(
        doc(db, "pricing", item.id),
        item.data,
        { merge: true }
      );

      console.log(
        "✅ Added:",
        item.id
      );
    }

    console.log(
      "🔥 Pricing migration done"
    );

  } catch (err) {

    console.error(err);

  }
};
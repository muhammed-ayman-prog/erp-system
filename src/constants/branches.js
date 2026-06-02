import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase";

let cachedBranches = null;

// 🔥 Get branch names dynamically
export async function getBranchNames() {

  // ✅ cache
  if (cachedBranches) {
    return cachedBranches;
  }

  const snap = await getDocs(
    collection(db, "branches")
  );

  const branchNames = {};

  snap.forEach(doc => {

    branchNames[doc.id] = {

      name:
        doc.data()?.name ||
        "Unknown",

      code:
        doc.data()?.code || ""

    };

  });

  cachedBranches = branchNames;

  return branchNames;
}

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../firebase";

export default function useReturns({
  branchId,
  allBranches = false,
} = {}) {
  const [returns, setReturns] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(true);

  useEffect(() => {
    // منع تحميل بيانات غير محددة الفرع
    if (!allBranches && (!branchId || branchId === "all")) {
      setReturns([]);
      setLoadingReturns(false);
      return;
    }

    setLoadingReturns(true);
    setReturns([]);

    const returnsRef = collection(db, "returns");

    // Owner مع All Branches فقط يمكنه تحميل كل المرتجعات
    const returnsQuery = allBranches
      ? returnsRef
      : query(
          returnsRef,
          where("branchId", "==", branchId)
        );

    const unsubscribe = onSnapshot(
      returnsQuery,
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReturns(data);
        setLoadingReturns(false);
      },
      (error) => {
        console.error("Error loading returns:", error);
        setReturns([]);
        setLoadingReturns(false);
      }
    );

    return () => unsubscribe();

  }, [branchId, allBranches]);

  return {
    returns,
    loadingReturns,
  };
}

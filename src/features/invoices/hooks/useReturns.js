import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../../firebase";

export default function useReturns() {
  const [returns, setReturns] = useState([]);
  const [loadingReturns, setLoadingReturns] =
    useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "returns"),
      (snap) => {
        setReturns(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );

        setLoadingReturns(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    returns,
    loadingReturns,
  };
}
import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import {
  useEffect,
  useState
} from "react";

import { db } from "../../../firebase";

export function useReturnedItems(
  selectedBranch
) {

  const [returnedItems, setReturnedItems] =
    useState([]);

  useEffect(() => {

    if (!selectedBranch) return;

    let q;

    if (selectedBranch === "all") {

      q = collection(
        db,
        "returned_items"
      );

    } else {

      q = query(
        collection(
          db,
          "returned_items"
        ),

        where(
          "branchId",
          "==",
          selectedBranch
        )
      );
    }

    const unsub = onSnapshot(
      q,
      (snap) => {

        const data = snap.docs
          .map(d => ({
            id: d.id,
            ...d.data()
          }))
          .filter(
            i =>
              i.status === "available"
          );

        setReturnedItems(data);
      }
    );

    return () => unsub();

  }, [selectedBranch]);

  return {
    returnedItems
  };
}
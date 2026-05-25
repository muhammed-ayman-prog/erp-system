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
import { useAuth } from "../../../store/useAuth";
export function useReturnedItems(
  selectedBranch
) {
const { user } = useAuth();
  const [returnedItems, setReturnedItems] =
    useState([]);

  useEffect(() => {

    if (!selectedBranch) return;

    let q;

    if (
  selectedBranch === "all" &&
  user?.role === "owner"
) {

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

  }, [selectedBranch, user]);

  return {
    returnedItems
  };
}
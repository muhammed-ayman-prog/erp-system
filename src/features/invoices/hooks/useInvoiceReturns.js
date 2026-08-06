import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../firebase";

export default function useInvoiceReturns(selectedInvoice) {

  const [previousReturns, setPreviousReturns] = useState([]);

  useEffect(() => {

    if (!selectedInvoice) {
      setPreviousReturns([]);
      return;
    }

    const loadReturns = async () => {

      const snap = await getDocs(
        query(
          collection(db, "returns"),
          where("invoiceDocId", "==", selectedInvoice.id),
          where("branchId", "==", selectedInvoice.branchId)
        )
      );

      setPreviousReturns(
        snap.docs.map(d => d.data())
      );

    };

    loadReturns();

  }, [selectedInvoice]);

  const groupedReturns = useMemo(() => {

    const groups = {};

    previousReturns.forEach(item => {

      const id =
        item.returnId || item.id;

      if (!groups[id]) {

        groups[id] = {
          returnId: id,
          performedByName: item.performedByName,
          refundDate: item.refundDate,
          items: [],
        };

      }

      groups[id].items.push(item);

    });

    return Object.values(groups);

  }, [previousReturns]);

  return {
  previousReturns,
  setPreviousReturns,
  groupedReturns,
  liveReturns: previousReturns,
};

}
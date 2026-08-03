import { useMemo, useState } from "react";
import { getKey } from "../utils/invoiceHelpers";

export default function useInvoiceActions() {

  const [refundItems, setRefundItems] = useState([]);

  const refundMap = useMemo(
    () =>
      Object.fromEntries(
        refundItems.map(i => [
          getKey(i),
          i.refundQty
        ])
      ),
    [refundItems]
  );

  const hasValidRefund = useMemo(
    () =>
      refundItems.some(i => i.refundQty > 0),
    [refundItems]
  );

  const handleRefundQty = (item, qty) => {

    const q = Math.max(
      0,
      Number(qty) || 0
    );

    const key = getKey(item);

    setRefundItems(prev => {

      if (q === 0) {
        return prev.filter(
          p => getKey(p) !== key
        );
      }

      const exists =
        prev.find(
          p => getKey(p) === key
        );

      if (exists) {

        return prev.map(p =>
          getKey(p) === key
            ? {
                ...p,
                refundQty: q
              }
            : p
        );

      }

      return [
        ...prev,
        {
          ...item,
          refundQty: q
        }
      ];

    });

  };

  return {

    refundItems,
    setRefundItems,

    refundMap,

    hasValidRefund,

    handleRefundQty,

  };

}
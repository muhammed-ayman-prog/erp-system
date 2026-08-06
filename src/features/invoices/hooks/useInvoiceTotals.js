import { useMemo } from "react";

export default function useInvoiceTotals(filtered) {
  return useMemo(() => {
    let total = 0;
    let cash = 0;
    let visa = 0;
    let instapay = 0;
    let refunds = 0;

    filtered.forEach((i) => {
      if (i.status === "cancelled") return;

      refunds += i.refundedAmount || 0;

      let net =
        (i.total || 0) -
        (i.refundedAmount || 0);

      if (net < 0) {
        net = 0;
      }

      total += net;

      const method = (
        i.paymentMethod || "cash"
      ).toLowerCase();

      if (method === "cash") {
        cash += net;
      }

      if (method === "visa") {
        visa += net;
      }

      if (method === "instapay") {
        instapay += net;
      }
    });

    return {
      total,
      cash,
      visa,
      instapay,
      refunds,
    };
  }, [filtered]);
}
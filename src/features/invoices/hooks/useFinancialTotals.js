import { useMemo } from "react";

export default function useFinancialTotals({
  sales = [],
  returns = [],
}) {
  return useMemo(() => {

    let salesTotal = 0;

    let cashSales = 0;
    let visaSales = 0;
    let instapaySales = 0;

    let refundTotal = 0;

    let refundCash = 0;
    let refundVisa = 0;
    let refundInstapay = 0;

    sales.forEach((sale) => {
      if (sale.status === "cancelled") return;

      const amount = Number(sale.total || 0);

      salesTotal += amount;

      switch (
        (sale.paymentMethod || "cash").toLowerCase()
      ) {
        case "cash":
          cashSales += amount;
          break;

        case "visa":
          visaSales += amount;
          break;

        case "instapay":
          instapaySales += amount;
          break;

        default:
          break;
      }
    });

    returns.forEach((refund) => {
      const isOil =
  (refund.container || refund.containerType || "")
    .toLowerCase() === "oil";

const amount = isOil
  ? Number(refund.price || 0)
  : Number(refund.price || 0) * Number(refund.quantity || 0);

      refundTotal += amount;

      switch (
        (
          refund.refundPaymentMethod ||
          "cash"
        ).toLowerCase()
      ) {
        case "cash":
          refundCash += amount;
          break;

        case "visa":
          refundVisa += amount;
          break;

        case "instapay":
          refundInstapay += amount;
          break;

        default:
          break;
      }
    });
    return {
      salesTotal,

      cashSales,
      visaSales,
      instapaySales,

      refundTotal,

      refundCash,
      refundVisa,
      refundInstapay,

      netRevenue:
        salesTotal - refundTotal,
    };
  }, [sales, returns]);
}
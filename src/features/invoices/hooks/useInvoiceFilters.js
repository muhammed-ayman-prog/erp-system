import { useMemo } from "react";
import {
  isFullyRefunded,
} from "../utils/invoiceHelpers";
import {
  isDateInRange,
} from "../../../utils/dateFilter";

export default function useInvoiceFilters({
  sales,

  invoiceSearch,
  customerSearch,
  phoneSearch,

  selectedSeller,
  paymentFilter,
  invoiceStatusFilter,

  fromDate,
  toDate,
}) {
  const sellers = useMemo(() => {
    const list = sales
      .map(
        (s) =>
          s.employeeName ||
          s.items?.find((i) => i.employeeName)?.employeeName
      )
      .filter(Boolean);

    return [...new Set(list)];
  }, [sales]);

  const filteredInvoices = useMemo(() => {
    return sales.filter((s) => {
      const matchInvoice =
        !invoiceSearch ||
        s.invoiceNumber
          ?.toString()
          .includes(invoiceSearch);

      const matchCustomer =
        !customerSearch ||
        (s.customerName || "")
          .toLowerCase()
          .includes(customerSearch.toLowerCase());

      const matchPhone =
        !phoneSearch ||
        (s.customerPhone || "")
          .includes(phoneSearch);

      const matchSales =
        selectedSeller === "all" ||
        s.employeeName === selectedSeller ||
        s.items?.some(
          (i) => i.employeeName === selectedSeller
        );

      const matchPayment =
        paymentFilter === "all" ||
        (s.paymentMethod || "cash")
          .toLowerCase() === paymentFilter;

      const refundedQty =
        s.refundedQty || 0;

      const refundedMl =
        s.refundedMl || 0;

      const totalProducts =
        s.items
          ?.filter(
            (i) =>
              (i.containerType || "")
                .toLowerCase() !== "oil"
          )
          .reduce(
            (sum, i) => sum + i.qty,
            0
          ) || 0;

      const totalMl =
        s.items
          ?.filter(
            (i) =>
              (i.containerType || "")
                .toLowerCase() === "oil"
          )
          .reduce(
            (sum, i) =>
              sum + (i.oilQty * i.qty),
            0
          ) || 0;

      const fullyRefunded =
        isFullyRefunded(
          refundedQty,
          refundedMl,
          totalProducts,
          totalMl
        );

      let matchStatus = true;

      switch (invoiceStatusFilter) {
        case "completed":
          matchStatus =
            s.status !== "cancelled" &&
            !fullyRefunded &&
            refundedQty === 0 &&
            refundedMl === 0;
          break;

        case "partial":
          matchStatus =
            refundedQty > 0 ||
            refundedMl > 0;
          break;

        case "refunded":
          matchStatus = fullyRefunded;
          break;

        case "cancelled":
          matchStatus =
            s.status === "cancelled";
          break;

        default:
          matchStatus = true;
      }

      const matchDate = isDateInRange(
        s.saleDate || s.createdAt,
        fromDate,
        toDate
      );

      return (
        matchInvoice &&
        matchCustomer &&
        matchPhone &&
        matchSales &&
        matchPayment &&
        matchStatus &&
        matchDate
      );
    });
  }, [
    sales,
    invoiceSearch,
    customerSearch,
    phoneSearch,
    selectedSeller,
    paymentFilter,
    invoiceStatusFilter,
    fromDate,
    toDate,
  ]);

  return {
    sellers,
    filteredInvoices,
  };
}
import { useMemo } from "react";
import {
  isFullyRefunded,
} from "../utils/invoiceHelpers";
import {
  isDateInRange,
} from "../../../utils/dateFilter";

export default function useInvoiceFilters({
  sales,

  searchKey,

  selectedSeller,
  paymentFilter,
  invoiceStatusFilter,

  fromDate,
  toDate,

  branchFilter,
  showBranchFilter,
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
      const searchableText = [
  s.invoiceNumber,
  s.customerName,
  s.customerPhone,
  s.employeeName,
  s.branchName,
  s.paymentMethod,
  s.total,
]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();


const matchSearch =
  !searchKey ||
  searchableText.includes(searchKey);

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
      const matchBranch =
        !showBranchFilter ||
        branchFilter === "all" ||
        s.branchId === branchFilter;

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
        matchSearch &&
        matchSales &&
        matchPayment &&
        matchBranch &&
        matchStatus &&
        matchDate
      );
    });
  }, [
      sales,
      searchKey,
      selectedSeller,
      paymentFilter,
      invoiceStatusFilter,
      fromDate,
      toDate,
      branchFilter,
      showBranchFilter,
    ]);

  return {
    sellers,
    filteredInvoices,
  };
}
import { useMemo } from "react";
import { isDateInRange } from "../../../utils/dateFilter";

export default function useReturnFilters({
  returns,

  searchKey,

  paymentFilter,

  selectedSeller,

  fromDate,
  toDate,

  branchFilter,
  showBranchFilter,
}) {
  return useMemo(() => {
    return returns.filter((r) => {
      const searchableText = [
        r.invoiceId,
        r.productName,
        r.performedByName,
        r.branchName,
        r.refundPaymentMethod,
        r.price,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch =
        !searchKey ||
        searchableText.includes(searchKey);

      const matchPayment =
        paymentFilter === "all" ||
        (
          r.refundPaymentMethod || "cash"
        ).toLowerCase() === paymentFilter;

      const matchSeller =
        selectedSeller === "all" ||
        r.performedByName === selectedSeller;

      const matchBranch =
        !showBranchFilter ||
        branchFilter === "all" ||
        r.branchId === branchFilter;

      const matchDate = isDateInRange(
        r.refundDate,
        fromDate,
        toDate
      );

      return (
        matchSearch &&
        matchPayment &&
        matchSeller &&
        matchBranch &&
        matchDate
      );
    });
  }, [
    returns,
    searchKey,
    paymentFilter,
    selectedSeller,
    fromDate,
    toDate,
    branchFilter,
    showBranchFilter,
  ]);
}
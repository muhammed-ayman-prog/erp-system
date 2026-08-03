import { useState } from "react";
import useInvoiceActions from "./useInvoiceActions";
import handlePartialRefund from "../services/handlePartialRefund";

export default function useRefund({
  selectedInvoice,
  db,
  user,
  toast,
  t,
  writeBatch,
  collection,
  doc,
  increment,
  serverTimestamp,
  setInvoices,
  branchName,
  selectedBranch,
  logAction,
}) {
  const [loading, setLoading] = useState(false);

  const {
    refundItems,
    setRefundItems,
    refundMap,
    hasValidRefund,
    handleRefundQty,
  } = useInvoiceActions();

  const executeRefund = () =>
    handlePartialRefund({
      selectedInvoice,

      refundItems,
      setRefundItems,

      setLoading,

      db,
      user,
      toast,
      t,

      writeBatch,
      collection,
      doc,
      increment,
      serverTimestamp,

      setInvoices,

      branchName,
      selectedBranch,

      logAction,
    });

  return {
    loading,

    refundItems,
    setRefundItems,

    refundMap,
    hasValidRefund,

    handleRefundQty,

    executeRefund,
  };
}
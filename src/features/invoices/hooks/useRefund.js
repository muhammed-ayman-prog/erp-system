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
  query,
  where,
  getDocs,
  getDoc,
  doc,
  increment,
  updateDoc,
  serverTimestamp,

  setInvoices,
  setSelectedInvoice,
  setShowRefundPopup,
  setPreviousReturns,

  branchName,
  selectedBranch,

  getKey,
  isFullyRefunded,

  logAction,
}) {
  const [loading, setLoading] = useState(false);

  const [
    refundPaymentMethod,
    setRefundPaymentMethod,
  ] = useState("cash");

  const {
    refundItems,
    setRefundItems,
    refundMap,
    hasValidRefund,
    handleRefundQty,
  } = useInvoiceActions();

  const executeRefund = () =>
  handlePartialRefund({
    loading,
    setLoading,

    selectedInvoice,

    refundItems,
    refundPaymentMethod,

    setInvoices,
    setSelectedInvoice,
    setRefundItems,
    setShowRefundPopup,
    setPreviousReturns,

    db,
    user,
    t,
    toast,

    writeBatch,
    query,
    collection,
    where,
    getDocs,
    getDoc,
    doc,
    increment,
    updateDoc,
    serverTimestamp,

    branchName,
    selectedBranch,

    getKey,
    isFullyRefunded,

    logAction,
  });

  return {
  loading,
  setLoading,
  refundItems,
  setRefundItems,

  refundMap,
  hasValidRefund,

  handleRefundQty,

  refundPaymentMethod,
  setRefundPaymentMethod,

  executeRefund,
};
}
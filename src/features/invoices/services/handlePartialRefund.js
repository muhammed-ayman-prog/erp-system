
export default async function handlePartialRefund({
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
}) {
  console.trace("handlePartialRefund START", {
  refundItems,
  loading,
});
    if (loading) return;
    if (!selectedInvoice || !selectedInvoice.items) return;

  const refunded =
  selectedInvoice.refundedQty || 0;

const refundedMl =
  selectedInvoice.refundedMl || 0;

const totalProducts =
  selectedInvoice.items
    ?.filter(
      i =>
        (i.containerType || "")
          .toLowerCase() !== "oil"
    )
    .reduce(
      (sum, i) => sum + i.qty,
      0
    ) || 0;

const totalMl =
  selectedInvoice.items
    ?.filter(
      i => (i.containerType || "").toLowerCase() === "oil"
    )
    .reduce(
      (sum, i) =>
        sum +
        (i.selectedMl ?? (i.oilQty * i.qty)),
      0
    ) || 0;

const fullyRefunded =
  isFullyRefunded(
    refunded,
    refundedMl,
    totalProducts,
    totalMl
  );
  if (fullyRefunded) {
    toast.error(t("invoices.closed"));
    return;
  }
    
    try {

    setLoading(true);

    const freshSaleSnap = await getDoc(
    doc(db, "sales", selectedInvoice.id)
  );

  if (!freshSaleSnap.exists()) {
    toast.error(t("common.notFound"));
    setLoading(false);
    return;
  }

  const freshInvoice = freshSaleSnap.data();
 const freshReturnsSnap = await getDocs(
  query(
    collection(db, "returns"),
    where("invoiceDocId", "==", selectedInvoice.id),
    where("branchId", "==", selectedInvoice.branchId)
  )
);

  const freshReturns = freshReturnsSnap.docs.map(d => d.data());

  if (freshInvoice.status === "cancelled") {
    toast.error(t("invoices.cancelled"));
    setLoading(false);
    return;
  }
    const validItems = (refundItems || []).filter(i => i.refundQty > 0);

  if (validItems.length === 0) {
  toast.error(t("invoices.selectQty"));
    setLoading(false);
    return;
  }
    

  const batch = writeBatch(db); 
  const refundBatchId = crypto.randomUUID();
  for (const item of validItems) {
    const sourceItem = selectedInvoice.items.find(
    i => getKey(i) === getKey(item)
  );
    const alreadyRefunded = freshReturns
    .filter(r => getKey(r) === getKey(item))
    .reduce((sum, r) => sum + r.quantity, 0);

   const isOil =
  (sourceItem?.containerType || "").toLowerCase() === "oil";

const maxAllowed =
(
  isOil
    ? (
        sourceItem?.selectedMl ??
        ((sourceItem?.oilQty || 0) * (sourceItem?.qty || 0))
      )
    : (sourceItem?.qty || 0)
) - alreadyRefunded;

    const requestedQty = item.refundQty;
    
  
  if (requestedQty > maxAllowed) {
      toast.error(t("invoices.maxRefundExceeded"));
      setLoading(false);
      return;
    }
  }  
    
      for (const item of validItems) {

    const originalItem = selectedInvoice.items.find(
      i => getKey(i) === getKey(item)
    );
    // 🔥 لازم يتعرفوا هنا فوق
    const returnRef = doc(collection(db, "returns"));
    let returnedRefs = [];
    let returnedRef = null;
    
  const type =
  (item.containerType || "")
    .toLowerCase();

const isReadyProduct =
  type === "original" ||
  type === "ready" ||
  type === "cream" ||
  type === "مخمرية";
    const isOil =
    (item.containerType || "").toLowerCase().trim() === "oil";

  if (isOil || isReadyProduct) {
    const invRef = doc(
  db,
  "inventory",
  `${selectedInvoice.branchId}_${
  isOil
  ? item.oilId || item.id
  : item.productId || item.id
}`
);

 batch.update(invRef, {
  quantity: increment(item.refundQty)
});

  } else {

    // ✅ كل قطعة تبقى document مستقل
    for (let i = 0; i < item.refundQty; i++) {

      returnedRef = doc(collection(db, "returned_items"));
      returnedRefs.push(returnedRef.id);

      batch.set(returnedRef, {

        productId: item.productId || item.id,
        name: item.name,

        quantity: 1,

        branchId: selectedInvoice.branchId,

        price: item.price || 0,

        invoiceId: selectedInvoice.invoiceNumber,
invoiceDocId: selectedInvoice.id,

        containerName:
          item.containerName ||
          item.sizeLabel ||
          `${item.containerType} ${item.size || ""}`.trim(),

        containerType: item.containerType || "",

        size: item.size || "",

        status: "available",

        returnId: returnRef.id,

        createdAt: serverTimestamp()
      });
    }
  }
  const returnPrice = isOil
  ? (item.pricePerMl || 0) * item.refundQty
  : (item.price || 0) * item.refundQty;
    // 🔥 ده لازم يكون جوه اللوب وتحت الكل
    batch.set(returnRef, {
      invoiceId: selectedInvoice.invoiceNumber,
      invoiceDocId: selectedInvoice.id,
      productId: item.productId || item.id,
      productName: item.name,
      productType: item.type || "unknown",
      category: item.category || "",
      size: item.size || "",
      unit: (item.size || "").includes("ml") ? "ml" : "",
      quantity: item.refundQty,
      price: returnPrice,
      pricePerMl: item.pricePerMl || 0,

      type: "refund",
      status: "returned",

      branchId: selectedInvoice.branchId,
      originalOilQty: item.oilQty || 0,
      originalQty: originalItem?.qty || 1, 
      container: item.containerType?.toUpperCase() || "",
      containerName:
    item.containerName ||
    item.sizeLabel ||
    [
      item.containerType,
      item.size
    ]
      .filter(Boolean)
      .join(" • "),

      returnedItemIds: returnedRefs, // 🔥 مهم

      returnId: refundBatchId,

performedBy: user?.uid || "",

performedByName:
  user?.displayName ||
  user?.name ||
  user?.email ||
  "",

refundPaymentMethod:
  refundPaymentMethod ||
  selectedInvoice.paymentMethod ||
  "cash",

refundDate: serverTimestamp(),

originalSaleDate:
selectedInvoice.saleDate ||
selectedInvoice.createdAt,

createdAt: serverTimestamp()
    });
  }


  const refundedQtyNow = validItems.reduce((s, i) => {
  const isOil =
    (i.containerType || "").toLowerCase() === "oil";

  return isOil ? s : s + i.refundQty;
}, 0);

const refundedMlNow = validItems.reduce((s, i) => {
  const isOil =
    (i.containerType || "").toLowerCase() === "oil";

  return isOil
    ? s + (i.refundQty || 0)
    : s;
}, 0);

  const saleRef = doc(db, "sales", selectedInvoice.id);

  const refundAmountNow = validItems.reduce(
  (sum, item) => {
    const originalItem =
     selectedInvoice.items.find(
      i => getKey(i) === getKey(item)
    );
    const isOil =
      (item.containerType || "")
        .toLowerCase() === "oil";

    if (isOil) {

const originalMl =

  originalItem?.selectedMl ??
  (
    (item.oilQty || 0) *
    (originalItem?.qty || 1)
  );

  const pricePerMl =

    originalMl > 0
      ? (item.price || 0) / originalMl
      : 0;

  return sum + (
  pricePerMl * item.refundQty
);
}

    return sum + (
  (item.price || 0) *
  (item.refundQty || 0)
);

  },
  0
);
const newReturnedTotal =
  (selectedInvoice.returnedTotal || 0) + refundAmountNow;

const newNetTotal = Math.max(
  0,
  (selectedInvoice.total || 0) - newReturnedTotal
);
batch.update(saleRef, {
  hasRefund: true,

  refundedQty: increment(refundedQtyNow),

  refundedMl: increment(refundedMlNow),

  refundedAmount: increment(refundAmountNow),

  // 👇 جديد
  returnedTotal: newReturnedTotal,

  newTotal: newNetTotal,

  lastRefundDate: serverTimestamp(),

  lastRefundBy: user?.uid || "",

  lastRefundByName:
    user?.displayName ||
    user?.name ||
    user?.email ||
    ""
});

  setInvoices(prev =>
  prev.map(s =>
    s.id === selectedInvoice.id
      ? {
  ...s,

  refundedQty:
    (s.refundedQty || 0) + refundedQtyNow,

  refundedMl:
    (s.refundedMl || 0) + refundedMlNow,

  refundedAmount:
    (s.refundedAmount || 0) + refundAmountNow,

  returnedTotal:
    (s.returnedTotal || 0) + refundAmountNow,

  newTotal: Math.max(
    0,
    (s.total || 0) -
      ((s.returnedTotal || 0) + refundAmountNow)
  ),

  hasRefund: true
}
      : s
  )
);
  // 🔥 مرة واحدة بس
  await batch.commit();
  // 👤 Update customer stats
if (
  selectedInvoice.customerId &&
  refundAmountNow > 0
) {

  const customerRef = doc(
    db,
    "customers",
    selectedInvoice.customerId
  );

  await updateDoc(customerRef, {

  totalSpent: increment(
    -refundAmountNow
  ),

  totalRefunded: increment(
    refundAmountNow
  )

});
}
const totalRefundedQty =
  (selectedInvoice.refundedQty || 0) + refundedQtyNow;

const totalRefundedMl =
  (selectedInvoice.refundedMl || 0) + refundedMlNow;

const fullRefund =
  isFullyRefunded(
    totalRefundedQty,
    totalRefundedMl,
    totalProducts,
    totalMl
  );
await logAction({
  action: fullRefund
  ? "FULL_REFUND"
  : "PARTIAL_REFUND",
  module: "Sales",
  severity: "warning",
  status: "success",

  performedBy: user?.uid || "",
  performedByName:
    user?.displayName ||
    user?.name ||
    user?.email ||
    "",


  branchId: selectedInvoice.branchId,
branchName: branchName || selectedBranch,

  targetId: selectedInvoice.id,
  targetName: selectedInvoice.invoiceNumber,

  details: {
    invoiceNumber:
      selectedInvoice.invoiceNumber,

    customerName:
      selectedInvoice.customerName,

    customerPhone:
      selectedInvoice.customerPhone,
    paymentMethod: selectedInvoice.paymentMethod,

    refundPaymentMethod:
      refundPaymentMethod,
    refundAmount:
      refundAmountNow,

    refundedItems:
      validItems.map(i => ({
        name: i.name,
        qty: i.refundQty
      }))
  },
  changes: [
  {
    field: "refundedAmount",
    before: selectedInvoice.refundedAmount || 0,
    after: (selectedInvoice.refundedAmount || 0) + refundAmountNow
  },
  {
    field: "refundedQty",
    before: selectedInvoice.refundedQty || 0,
    after: totalRefundedQty
  },
  {
    field: "refundedMl",
    before: selectedInvoice.refundedMl || 0,
    after: totalRefundedMl
  }
]
});
  toast.success(t("invoices.refundSuccess"));

    // UI
    setShowRefundPopup(false);

setRefundItems([]);

setSelectedInvoice(prev => ({
  ...prev,
  returnedTotal:
  (prev?.returnedTotal || 0) + refundAmountNow,

newTotal: Math.max(
  0,
  (prev?.total || 0) -
    ((prev?.returnedTotal || 0) + refundAmountNow)
),
  refundedQty:
    (prev?.refundedQty || 0) + refundedQtyNow,

  refundedMl:
    (prev?.refundedMl || 0) + refundedMlNow,

  refundedAmount:
    (prev?.refundedAmount || 0) + refundAmountNow,

  hasRefund: true
}));

const updatedReturnsSnap = await getDocs(
  query(
    collection(db, "returns"),
    where("invoiceDocId", "==", selectedInvoice.id),
    where("branchId", "==", selectedInvoice.branchId)
  )
);

setPreviousReturns(
  updatedReturnsSnap.docs.map(d => d.data())
);

  } catch (err) {
    console.error(err);
    toast.error(t("common.error"));
  } finally {
    setLoading(false);
  }
}
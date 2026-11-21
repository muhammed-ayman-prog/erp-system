
// Money helpers used to keep discount allocation consistent across partial refunds.
const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = value => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

function getInvoiceGrossTotal(invoice) {
  const explicitSubtotal = [
    invoice?.subtotal,
    invoice?.subTotal,
    invoice?.itemsSubtotal,
    invoice?.totalBeforeDiscount,
    invoice?.grossTotal,
  ].map(toNumber).find(value => value > 0);

  if (explicitSubtotal) return roundMoney(explicitSubtotal);

  return roundMoney((invoice?.items || []).reduce((sum, item) => {
    const isOil = (item?.containerType || '').toLowerCase() === 'oil';
    const lineTotal = toNumber(item?.price) * (isOil ? 1 : toNumber(item?.qty));
    return sum + lineTotal;
  }, 0));
}

function getInvoiceDiscount(invoice, grossTotal) {
  const discountType = String(invoice?.discountType || invoice?.discount?.type || '').toLowerCase();
  const isPercentage = discountType.includes('percent') || discountType.includes('نسبة');
  const discountObject = invoice?.discount && typeof invoice.discount === 'object'
    ? invoice.discount
    : null;

  const percentageValue = [
    invoice?.discountPercentage,
    invoice?.discountPercent,
    isPercentage ? invoice?.discountValue : undefined,
    isPercentage ? invoice?.discount : undefined,
    discountObject?.percentage,
    discountObject?.percent,
    isPercentage ? discountObject?.value : undefined,
  ].map(value => value === undefined ? NaN : Number(value))
    .find(value => Number.isFinite(value) && value > 0);

  if (percentageValue !== undefined) {
    return roundMoney(Math.min(grossTotal, grossTotal * percentageValue / 100));
  }

  const amountValue = [
    invoice?.discountAmount,
    invoice?.totalDiscount,
    invoice?.discountTotal,
    discountObject?.amount,
    !isPercentage ? discountObject?.value : undefined,
    // `discount` / `discountValue` are treated as amounts unless their type says percent.
    !isPercentage && (typeof invoice?.discount === 'number' || typeof invoice?.discount === 'string')
      ? invoice.discount
      : undefined,
    !isPercentage ? invoice?.discountValue : undefined,
  ].map(value => value === undefined ? NaN : Number(value))
    .find(value => Number.isFinite(value) && value > 0);

  if (amountValue !== undefined) {
    return roundMoney(Math.min(grossTotal, amountValue));
  }

  // Fallback for invoices that store only the pre-discount subtotal and final total.
  const storedTotal = [invoice?.total, invoice?.finalTotal, invoice?.netTotal]
    .map(value => value === undefined ? NaN : Number(value))
    .find(value => Number.isFinite(value) && value >= 0);

  return storedTotal !== undefined && grossTotal > storedTotal
    ? roundMoney(grossTotal - storedTotal)
    : 0;
}

function getRefundGrossAmount(item, originalItem) {
  const isOil = (item?.containerType || originalItem?.containerType || '').toLowerCase() === 'oil';
  const quantity = toNumber(item?.refundQty);

  if (isOil) {
    const originalMl = toNumber(
      originalItem?.selectedMl ??
      (toNumber(originalItem?.oilQty) * toNumber(originalItem?.qty))
    );
    const linePrice = toNumber(originalItem?.price ?? item?.price);
    return originalMl > 0
      ? roundMoney((linePrice / originalMl) * quantity)
      : roundMoney(toNumber(item?.pricePerMl) * quantity);
  }

  return roundMoney(toNumber(originalItem?.price ?? item?.price) * quantity);
}

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

  // Calculate the real refundable amount after allocating the invoice discount.
  const invoiceGrossTotal = getInvoiceGrossTotal(freshInvoice);
  const invoiceDiscount = getInvoiceDiscount(freshInvoice, invoiceGrossTotal);
  const storedInvoiceTotal = [freshInvoice.total, freshInvoice.finalTotal, freshInvoice.netTotal]
    .map(value => value === undefined ? NaN : Number(value))
    .find(value => Number.isFinite(value) && value >= 0);

  // `total` is the final invoice amount in the current sales schema. If it still
  // equals the gross subtotal despite a saved discount, use subtotal - discount.
  const calculatedNetTotal = Math.max(0, invoiceGrossTotal - invoiceDiscount);
  const invoiceNetTotal = roundMoney(
    storedInvoiceTotal !== undefined &&
    !(invoiceDiscount > 0 && storedInvoiceTotal >= invoiceGrossTotal)
      ? storedInvoiceTotal
      : calculatedNetTotal
  );
  const previousRefundedAmount = roundMoney(
    freshInvoice.refundedAmount ?? freshInvoice.returnedTotal ?? 0
  );

  const refundLines = validItems.map(item => {
    const originalItem = freshInvoice.items?.find(i => getKey(i) === getKey(item)) ||
      selectedInvoice.items.find(i => getKey(i) === getKey(item));
    return { item, originalItem, grossAmount: getRefundGrossAmount(item, originalItem) };
  });
  const grossRefundAmountNow = roundMoney(
    refundLines.reduce((sum, line) => sum + line.grossAmount, 0)
  );

  const refundedQtyNow = validItems.reduce((sum, item) =>
    (item.containerType || '').toLowerCase() === 'oil' ? sum : sum + toNumber(item.refundQty), 0
  );
  const refundedMlNow = validItems.reduce((sum, item) =>
    (item.containerType || '').toLowerCase() === 'oil' ? sum + toNumber(item.refundQty) : sum, 0
  );

  const totalProductsForFreshInvoice = (freshInvoice.items || [])
    .filter(item => (item.containerType || '').toLowerCase() !== 'oil')
    .reduce((sum, item) => sum + toNumber(item.qty), 0);
  const totalMlForFreshInvoice = (freshInvoice.items || [])
    .filter(item => (item.containerType || '').toLowerCase() === 'oil')
    .reduce((sum, item) => sum + toNumber(item.selectedMl ?? (toNumber(item.oilQty) * toNumber(item.qty))), 0);
  const fullRefundAfterThisOperation = isFullyRefunded(
    toNumber(freshInvoice.refundedQty) + refundedQtyNow,
    toNumber(freshInvoice.refundedMl) + refundedMlNow,
    totalProductsForFreshInvoice,
    totalMlForFreshInvoice
  );

  const remainingRefundableAmount = Math.max(0, invoiceNetTotal - previousRefundedAmount);
  const proportionalRefundAmount = invoiceGrossTotal > 0
    ? grossRefundAmountNow * (invoiceNetTotal / invoiceGrossTotal)
    : grossRefundAmountNow;
  const refundAmountNow = roundMoney(Math.min(
    remainingRefundableAmount,
    fullRefundAfterThisOperation ? remainingRefundableAmount : proportionalRefundAmount
  ));

  // Allocate the operation's net refund back to each return document. The final
  // line receives the rounding remainder so the saved line amounts sum exactly.
  const refundAmountByItem = new Map();
  let allocatedRefundAmount = 0;
  refundLines.forEach((line, index) => {
    const isLastLine = index === refundLines.length - 1;
    const lineRefundAmount = isLastLine
      ? roundMoney(refundAmountNow - allocatedRefundAmount)
      : roundMoney(grossRefundAmountNow > 0
          ? refundAmountNow * (line.grossAmount / grossRefundAmountNow)
          : 0);
    refundAmountByItem.set(line.item, lineRefundAmount);
    allocatedRefundAmount = roundMoney(allocatedRefundAmount + lineRefundAmount);
  });

  const newReturnedTotal = roundMoney(previousRefundedAmount + refundAmountNow);
  const newNetTotal = roundMoney(Math.max(0, invoiceNetTotal - newReturnedTotal));

  console.info("Refund discount allocation", {
    invoiceGrossTotal,
    invoiceDiscount,
    invoiceNetTotal,
    grossRefundAmountNow,
    refundAmountNow,
    previousRefundedAmount,
    fullRefundAfterThisOperation,
  });

  const batch = writeBatch(db); 
  const refundBatchId = crypto.randomUUID();
  for (const item of validItems) {
    const sourceItem = (freshInvoice.items || selectedInvoice.items).find(
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

    const originalItem = (freshInvoice.items || selectedInvoice.items).find(
      i => getKey(i) === getKey(item)
    );
    const originalOilComponents =
  Array.isArray(originalItem?.oilComponents) &&
  originalItem.oilComponents.length > 0
    ? originalItem.oilComponents.map(component => ({
        oilId: component.oilId || component.id || null,
        oilName: component.oilName || "",
        oilCategory: component.oilCategory || "",
        quantityML: Number(
          component.quantityML ?? component.oilQty ?? 0
        ),
        costPerML: Number(component.costPerML) || 0,
        cost: Number(component.cost) || 0
      }))
    : Number(originalItem?.oilQty) > 0
    ? [{
        oilId: originalItem.oilId || originalItem.id || null,
        oilName: originalItem.oilName || originalItem.name || "",
        oilCategory: originalItem.oilCategory || "",
        quantityML: Number(originalItem.oilQty),
        costPerML: Number(originalItem.oilCostPerML) || 0,
        cost: Number(originalItem.oilCost) || 0
      }]
    : [];
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

const restoredProductId = isOil
  ? (item.oilId || item.id)
  : (item.productId || item.id);

batch.set(doc(collection(db, "stock")), {

  productId: restoredProductId,

  productName: item.name || "المنتج",

  quantity: Number(item.refundQty),

  type: "refund",

  direction: "IN",

  movementType: "REFUND",

  movementSource: "REFUND",

  source: "REFUND",

  productType: isOil
    ? "RAW_OIL"
    : "READY_PRODUCT",

  unit: isOil ? "ML" : "PCS",

  branchId: selectedInvoice.branchId,

  branchName:
    selectedInvoice.branchName ||
    branchName ||
    selectedBranch ||
    "",

  invoiceDocId: selectedInvoice.id,

  invoiceId: selectedInvoice.invoiceNumber || "",

  returnId: refundBatchId,

  employeeId: user?.uid || null,

  employeeName:
    user?.displayName ||
    user?.name ||
    user?.email ||
    "",

  createdAt: serverTimestamp()

});



  } else {

    // ✅ كل قطعة تبقى document مستقل
    for (let i = 0; i < item.refundQty; i++) {

      returnedRef = doc(collection(db, "returned_items"));
      returnedRefs.push(returnedRef.id);

      batch.set(returnedRef, {

        productId: item.productId || item.id,
        name: item.name,
        oilComponents: originalOilComponents,
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
  const returnGrossPrice = refundLines.find(line => line.item === item)?.grossAmount || 0;
  const returnPrice = refundAmountByItem.get(item) || 0;
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
      // `price` is the actual cash refund (after allocated invoice discount).
      price: returnPrice,
      grossPrice: returnGrossPrice,
      discountShare: roundMoney(returnGrossPrice - returnPrice),
      pricePerMl: item.pricePerMl || 0,

      type: "refund",
      status: "returned",

      branchId: selectedInvoice.branchId,
      originalOilQty: item.oilQty || 0,
      oilComponents: originalOilComponents,
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


  const saleRef = doc(db, "sales", selectedInvoice.id);

batch.update(saleRef, {
  hasRefund: true,

  refundedQty: increment(refundedQtyNow),

  refundedMl: increment(refundedMlNow),

  refundedAmount: increment(refundAmountNow),
  refundedGrossAmount: increment(grossRefundAmountNow),
  refundedDiscountAmount: increment(roundMoney(grossRefundAmountNow - refundAmountNow)),

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

  
  // 🔥 مرة واحدة بس
  await batch.commit();
  setInvoices(prev =>
  prev.map(s =>
    s.id === selectedInvoice.id
      ? {
          ...s,
          refundedQty: toNumber(freshInvoice.refundedQty) + refundedQtyNow,
          refundedMl: toNumber(freshInvoice.refundedMl) + refundedMlNow,
          refundedAmount: newReturnedTotal,
          refundedGrossAmount: toNumber(freshInvoice.refundedGrossAmount) + grossRefundAmountNow,
          refundedDiscountAmount: toNumber(freshInvoice.refundedDiscountAmount) + roundMoney(grossRefundAmountNow - refundAmountNow),
          returnedTotal: newReturnedTotal,
          newTotal: newNetTotal,
          hasRefund: true
        }
      : s
  )
);
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
const totalRefundedQty = toNumber(freshInvoice.refundedQty) + refundedQtyNow;

const totalRefundedMl = toNumber(freshInvoice.refundedMl) + refundedMlNow;

const fullRefund = fullRefundAfterThisOperation;
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
    grossRefundAmount: grossRefundAmountNow,
    allocatedDiscount: roundMoney(grossRefundAmountNow - refundAmountNow),
    invoiceDiscount,

    refundedItems:
      validItems.map(i => ({
        name: i.name,
        qty: i.refundQty
      }))
  },
  changes: [
  {
    field: "refundedAmount",
    before: previousRefundedAmount,
    after: newReturnedTotal
  },
  {
    field: "refundedQty",
    before: toNumber(freshInvoice.refundedQty),
    after: totalRefundedQty
  },
  {
    field: "refundedMl",
    before: toNumber(freshInvoice.refundedMl),
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
  returnedTotal: newReturnedTotal,
  newTotal: newNetTotal,
  refundedQty: totalRefundedQty,
  refundedMl: totalRefundedMl,
  refundedAmount: newReturnedTotal,
  refundedGrossAmount: toNumber(freshInvoice.refundedGrossAmount) + grossRefundAmountNow,
  refundedDiscountAmount: toNumber(freshInvoice.refundedDiscountAmount) + roundMoney(grossRefundAmountNow - refundAmountNow),
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
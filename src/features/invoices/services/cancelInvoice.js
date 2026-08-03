export default async function handleCancel({
  inv,
  reason,

  db,
  user,
  t,

  toast,

  writeBatch,
  query,
  collection,
  where,
  getDocs,
  doc,
  increment,
  serverTimestamp,

  setInvoices,
  branchName,
  selectedBranch,

  isFullyRefunded,

  updateDoc,

  logAction,

  setCancelling,
}) {
    setCancelling(true);

  // 🔴 CANCEL
    
    if (inv.status === "cancelled") return;
    const refundedQty =
      inv.refundedQty || 0;

    const refundedMl =
      inv.refundedMl || 0;

    const totalProducts =
      inv.items
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
      inv.items
        ?.filter(
          i =>
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

    if (fullyRefunded) {
      toast.error(t("invoices.refunded"));
      return;
    }
    try {
      const batch = writeBatch(db);

      const returnsSnap = await getDocs(
        query(
          collection(db, "returns"),
          where("invoiceDocId", "==", inv.id)
        )
      );

      const getKey = (i) =>
    `${i.productId || i.id}_${
      (i.container || i.containerType || "")
        .toLowerCase()
        .trim()
    }_${i.size}`;

  const refundedMap = {};

  returnsSnap.docs.forEach(d => {
    const data = d.data();
    const key = getKey(data);

    refundedMap[key] =
      (refundedMap[key] || 0) + (data.quantity || 0);
  });

      for (const item of inv.items) {
        const key = getKey(item);
  const alreadyRefunded = refundedMap[key] || 0;

  const isOil =
    (item.containerType || "").toLowerCase().trim() === "oil";

  const total = isOil
  ? (item.oilQty || 0) * (item.qty || 0)
  : (item.qty || 0);

  const remaining = Math.max(
  0,
  total - alreadyRefunded
);

  if (remaining <= 0) continue;
  
    
  if (isOil) {
    const invRef = doc(
  db,
  "inventory",
  `${inv.branchId}_${item.oilId || item.id}`
);

  batch.update(invRef, {
  quantity: increment(remaining)
});

  }
  else {

    const invRef = doc(
  db,
  "inventory",
  `${inv.branchId}_${item.containerId || item.id}`
);

    batch.update(invRef, {
      quantity: increment(remaining)
    });
const type =
  (item.containerType || "")
    .toLowerCase();

const isReadyProduct =
  type === "original" ||
  type === "ready" ||
  type === "cream" ||
  type === "مخمرية";

if (
  !isReadyProduct &&
  item.oilQty > 0
) {

  const oilRef = doc(
  db,
  "inventory",
  `${inv.branchId}_${item.oilId || item.id}`
);

batch.update(oilRef, {
  quantity: increment(
    (item.oilQty || 0) * remaining
)
});
}
  }
      }

      const saleRef = doc(db, "sales", inv.id);

      batch.update(saleRef, {
        status: "cancelled",
        cancelledAt: serverTimestamp(),

        cancelledBy: user?.uid || "",

        cancelledByName:
          user?.displayName ||
          user?.name ||
          user?.email ||
          "",
        cancelReason: reason,
        hasRefund: true,
        refundedQty: totalProducts,
        refundedMl: totalMl,
        refundedAmount: inv.total || 0
      });
      // optimistic update
  setInvoices(prev =>
  prev.map(s =>
    s.id === inv.id
      ? {
          ...s,
          status: "cancelled",
          hasRefund: true,
          refundedQty: totalProducts,
          refundedMl: totalMl,
          refundedAmount: inv.total || 0
        }
      : s
  )
);


      await batch.commit();
      // 👤 Update customer stats
if (inv.customerId) {

  const customerRef = doc(
    db,
    "customers",
    inv.customerId
  );

  await updateDoc(customerRef, {

    totalSpent: increment(
      -(
  (inv.total || 0) -
  (inv.refundedAmount || 0)
)
    ),
  });
}

await logAction({
  action: "CANCEL_INVOICE",
  module: "Sales",
  severity: "warning",
  status: "success",

  performedBy: user?.uid || "",
  performedByName:
    user?.displayName ||
    user?.name ||
    user?.email ||
    "",


  branchId: inv.branchId,
branchName: branchName || selectedBranch,

  targetId: inv.id,
  targetName: inv.invoiceNumber,

  details: {
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerName,
    customerPhone: inv.customerPhone,
    paymentMethod: inv.paymentMethod,
    refundedAmount: inv.total || 0,
    cancelReason: reason,
  },

  changes: [
    {
      field: "status",
      before: "completed",
      after: "cancelled"
    }
  ]
});

      toast.success(t("invoices.cancelSuccess"));

    } catch (err) {
      console.error(err);
      toast.error(t("common.error"));
    } finally {
  setCancelling(false);
}
}
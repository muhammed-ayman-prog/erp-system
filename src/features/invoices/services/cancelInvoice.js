export default async function handleCancel({
  inv,
  reason,

  db,
  user,
  t,
  toast,

  runTransaction,
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

  logAction,
  setCancelling,
}) {
  if (!inv?.id || inv.status === "cancelled") return;

  setCancelling(true);

  try {
    // 1) التأكد من عدم وجود أي مرتجعات سابقة
    const returnsSnap = await getDocs(
      query(
        collection(db, "returns"),
        where("invoiceDocId", "==", inv.id)
      )
    );

    if (!returnsSnap.empty) {
      toast.error(
        "لا يمكن إلغاء فاتورة عليها مرتجع أو Refund سابق."
      );
      return;
    }

    const saleRef = doc(db, "sales", inv.id);

    const customerRef = inv.customerId
      ? doc(db, "customers", inv.customerId)
      : null;

    // 2) تنفيذ الإلغاء بشكل ذري لمنع التكرار
    const customerStatsReversed = await runTransaction(
      db,
      async (transaction) => {
        // قراءة أحدث نسخة من الفاتورة
        const saleSnap = await transaction.get(saleRef);

        if (!saleSnap.exists()) {
          throw new Error("INVOICE_NOT_FOUND");
        }

        const freshInvoice = saleSnap.data();

        if (freshInvoice.status === "cancelled") {
          throw new Error("INVOICE_ALREADY_CANCELLED");
        }

        // التأكد من عدم وجود Refund مسجل على الفاتورة
        const hasRefundHistory =
          freshInvoice.hasRefund === true ||
          Number(freshInvoice.refundedQty || 0) > 0 ||
          Number(freshInvoice.refundedMl || 0) > 0 ||
          Number(freshInvoice.refundedAmount || 0) > 0;

        if (hasRefundHistory) {
          throw new Error("INVOICE_HAS_REFUND");
        }

        const items = Array.isArray(freshInvoice.items)
          ? freshInvoice.items
          : [];

        if (!items.length) {
          throw new Error("INVOICE_ITEMS_MISSING");
        }

        if (!freshInvoice.branchId) {
          throw new Error("INVOICE_BRANCH_MISSING");
        }

        // قراءة العميل قبل بدء الكتابة
        let customerData = null;

if (customerRef) {
  const customerSnap = await transaction.get(customerRef);

  if (customerSnap.exists()) {
    customerData = customerSnap.data();
  }
}

       
        // 3) تجهيز كل الكميات المطلوب إرجاعها للمخزون
        const inventoryRestores = new Map();

        const returnedItemsToRestore = new Map();
        const returnDocsToRestore = new Map();

        const addInventoryRestore = (
          productId,
          quantity,
          productName
        ) => {
          if (!productId) {
            throw new Error("MISSING_INVENTORY_PRODUCT_ID");
          }

          const amount = Number(quantity) || 0;

          if (!Number.isFinite(amount) || amount <= 0) {
            return;
          }

          const key = String(productId);

          if (inventoryRestores.has(key)) {
            inventoryRestores.get(key).quantity += amount;
          } else {
            inventoryRestores.set(key, {
              ref: doc(
                db,
                "inventory",
                `${freshInvoice.branchId}_${productId}`
              ),
              quantity: amount,
              productName: productName || "المنتج"
            });
          }
        };

        // ==================================
        // COLLECT RESTORATIONS
        // ==================================

        for (const item of items) {
          const qty = Number(item.qty ?? 1);

            if (!Number.isFinite(qty) || qty < 0) {
              throw new Error("INVALID_INVOICE_ITEM_QUANTITY");
            }

          const type = (item.containerType || "")
            .toLowerCase()
            .trim();

          // إعادة بيع منتج مرتجع:
          // لا نضيفه للمخزون العادي لأنه لم يُخصم منه أصلًا.
          if (item.isReturned) {
            if (!item.returnedItemId) {
              throw new Error("MISSING_RETURNED_ITEM_ID");
            }

            const returnedRef = doc(
              db,
              "returned_items",
              item.returnedItemId
            );

            returnedItemsToRestore.set(
              item.returnedItemId,
              { ref: returnedRef }
            );

            if (item.returnId) {
              const returnRef = doc(
                db,
                "returns",
                item.returnId
              );

              returnDocsToRestore.set(
                item.returnId,
                { ref: returnRef }
              );
            }

            continue;
          }

          // ==================================
          // PURE OIL
          // ==================================

          if (type === "oil") {
            const oilId = item.oilId || item.id;

            // نفس معادلة الخصم المستخدمة في Checkout
            const oilQuantity = Number(
              item.selectedMl ??
              (Number(item.oilQty || 0) * qty)
            );

            addInventoryRestore(
              oilId,
              oilQuantity,
              item.oilName || item.name
            );

            continue;
          }

          // ==================================
          // READY PRODUCTS
          // ==================================

          const isReadyProduct =
            type === "original" ||
            type === "ready" ||
            type === "cream" ||
            type === "مخمرية";

          if (isReadyProduct) {
            addInventoryRestore(
              item.id,
              qty,
              item.name
            );

            continue;
          }

          // ==================================
          // CONTAINER
          // ==================================

          const containerId = item.containerId || item.id;

          addInventoryRestore(
            containerId,
            qty,
            item.containerName || item.name
          );

          // ==================================
          // OIL COMPONENTS
          // ==================================

          // الفواتير الجديدة تستخدم oilComponents
          // الفواتير القديمة تستخدم oilId و oilQty

          let oilComponents = [];

          if (
            Array.isArray(item.oilComponents) &&
            item.oilComponents.length > 0
          ) {
            oilComponents = item.oilComponents;
          } else if (Number(item.oilQty) > 0) {
            oilComponents = [
              {
                oilId: item.oilId || item.id,
                oilName: item.oilName || item.name,
                quantityML: Number(item.oilQty)
              }
            ];
          }

          for (const component of oilComponents) {
            const oilId = component.oilId || component.id;

            const quantityPerBottle = Number(
              component.quantityML ??
              component.oilQty ??
              0
            );

            addInventoryRestore(
              oilId,
              quantityPerBottle * qty,
              component.oilName || item.name
            );
          }
        }

        // ==================================
        // READ ALL DOCUMENTS BEFORE WRITES
        // ==================================

        for (const restore of inventoryRestores.values()) {
          const inventorySnap = await transaction.get(
            restore.ref
          );

          if (!inventorySnap.exists()) {
            throw new Error("INVENTORY_ITEM_NOT_FOUND");
          }
        }

        for (const returnedItem of returnedItemsToRestore.values()) {
          const returnedSnap = await transaction.get(
            returnedItem.ref
          );

          if (!returnedSnap.exists()) {
            throw new Error("RETURNED_ITEM_NOT_FOUND");
          }

          const returnedData = returnedSnap.data();

if (returnedData?.status !== "sold") {
  throw new Error("RETURNED_ITEM_NOT_SOLD");
}

// منع إرجاع عبوة مباعة من فاتورة أخرى
// السماح بالبيانات القديمة التي لا تحتوي على soldInvoiceId
if (
  returnedData.soldInvoiceId &&
  returnedData.soldInvoiceId !== inv.id
) {
  throw new Error(
    "RETURNED_ITEM_SOLD_BY_ANOTHER_INVOICE"
  );
}
        }

        for (const returnDoc of returnDocsToRestore.values()) {
          const returnSnap = await transaction.get(
            returnDoc.ref
          );

          returnDoc.exists = returnSnap.exists();
        }

        // ==================================
        // WRITE RESTORED INVENTORY
        // ==================================

        for (const restore of inventoryRestores.values()) {
          transaction.update(restore.ref, {
            quantity: increment(restore.quantity)
          });
        }

        // ==================================
        // RESTORE RESOLD RETURNED ITEMS
        // ==================================

        for (const returnedItem of returnedItemsToRestore.values()) {
          transaction.update(returnedItem.ref, {
  status: "available",
  soldAt: null,
  soldInvoiceId: null
});
        }

        for (const returnDoc of returnDocsToRestore.values()) {
          if (returnDoc.exists) {
            transaction.update(returnDoc.ref, {
              status: "returned"
            });
          }
        }


        // 4) إلغاء الفاتورة فقط بدون تسجيل أي Refund
        transaction.update(saleRef, {
          status: "cancelled",
          cancelledAt: serverTimestamp(),

          cancelledBy: user?.uid || "",

          cancelledByName:
            user?.displayName ||
            user?.name ||
            user?.email ||
            "",

          cancelReason: reason || "",
        });

        // 5) عكس إحصائيات العميل
        if (customerRef && customerData) {
  const invoiceTotal =
    Number(freshInvoice.total) || 0;

  const currentTotalSpent =
    Number(customerData.totalSpent) || 0;

  const currentOrdersCount =
    Number(customerData.ordersCount) || 0;

  transaction.update(customerRef, {
    totalSpent: Math.max(
      0,
      Number((currentTotalSpent - invoiceTotal).toFixed(2))
    ),

    ordersCount: Math.max(
      0,
      currentOrdersCount - 1
    ),
  });
}

return Boolean(customerData);
      }
    );

    // 6) تحديث الواجهة بعد نجاح العملية
    setInvoices((prev) =>
      prev.map((s) =>
        s.id === inv.id
          ? {
              ...s,
              status: "cancelled",
              cancelReason: reason || "",
            }
          : s
      )
    );

    // 7) تسجيل العملية في Audit Logs
    try {
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

          cancelledAmount: Number(inv.total) || 0,

          paymentMethod: inv.paymentMethod || "",
          payments: Array.isArray(inv.payments)
            ? inv.payments
            : [],

          cancelReason: reason || "",
          customerStatsReversed,
        },

        changes: [
          {
            field: "status",
            before: inv.status || "completed",
            after: "cancelled",
          },
        ],
      });
    } catch (logError) {
      console.error("Cancel audit log failed:", logError);
    }

    toast.success(t("invoices.cancelSuccess"));
  } catch (err) {
    console.error("Cancel invoice error:", err);

    if (err.message === "INVOICE_ALREADY_CANCELLED") {
      toast.error("الفاتورة ملغاة بالفعل.");
    } else if (err.message === "INVOICE_HAS_REFUND") {
      toast.error("لا يمكن إلغاء فاتورة تم عليها Refund سابق.");
    } else if (err.message === "INVOICE_NOT_FOUND") {
  toast.error("الفاتورة غير موجودة.");
} else if (
  err.message === "RETURNED_ITEM_SOLD_BY_ANOTHER_INVOICE"
) {
  toast.error(
    "العبوة دي مباعة من فاتورة تانية، ومينفعش ترجعها من الفاتورة دي."
  );
} else {
      toast.error(t("common.error"));
    }
  } finally {
    setCancelling(false);
  }
}
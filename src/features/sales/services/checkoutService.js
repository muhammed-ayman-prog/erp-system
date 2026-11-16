import {
  runTransaction,
  doc,
  collection,
  serverTimestamp,
  increment,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../../firebase";
import logAction
from "../../../utils/logAction";
const BUSINESS_DAY_CUTOFF = 3;

// تاريخ يوم العمل بصيغة YYYY-MM-DD
const getBusinessDateKey = (date = new Date()) => {
  const d = new Date(date);

  if (d.getHours() < BUSINESS_DAY_CUTOFF) {
    d.setDate(d.getDate() - 1);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// تحويل تاريخ الحقل إلى توقيت محلي عند الساعة 12 ظهرًا
const getLocalDateAtNoon = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day, 12, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error("تاريخ البيع غير صحيح");
  }

  return date;
};

    export const processCheckout = async ({
      cart,
      branchToUse,
      total,
      paymentMethod,
      payments = [],
      customerName,
      customerPhone,
      employeeId,
      employeeName,
      user,
      saleDate
    }) => {
      let branchName = "Unknown";
       let branchCode = "BRCH";
      try {
      // 🏪 Get branch data
  const branchRef = doc(db, "branches", branchToUse);

  const branchSnap = await getDoc(branchRef);

  if (!branchSnap.exists()) {
    throw new Error("الفرع غير موجود");
  }

  const branchData = branchSnap.data();

  branchName =
  branchData?.name || "Unknown";

branchCode =
  branchData?.code || "BRCH";
        

  // 👤 Find customer without updating it yet
let customerId = null;
let existingCustomerRef = null;
let newCustomerRef = null;

if (customerPhone?.trim()) {
  const q = query(
    collection(db, "customers"),
    where("phone", "==", customerPhone.trim())
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    const customerDoc = snap.docs[0];

    customerId = customerDoc.id;

    existingCustomerRef = doc(
      db,
      "customers",
      customerId
    );
  } else {
    newCustomerRef = doc(
      collection(db, "customers")
    );

    customerId = newCustomerRef.id;
  }
}
  
        // 🟢 3) SAVE INVOICE
const cleanedCart = cart.map(item => ({
  employeeId:
    employeeId || null,

  employeeName:
    employeeName ||
    user?.displayName ||
    user?.name ||
    user?.email ||
    "Unknown Employee",

  // 🧾 Basic
  id: item.id || "",
  name: item.name || "",

  itemType:
    item.itemType || "UNKNOWN",

  saleMode:
    item.saleMode || "UNKNOWN",

  isReturned:
    item.isReturned || false,
  returnedItemId:
  item.isReturned
    ? item.returnedItemId || null
    : null,

returnId:
  item.isReturned
    ? item.returnId || null
    : null,

  saleType:
    item.isReturned
      ? "RETURN_RESALE"
      : "SALE",

  // 🛢 Oil
  oilId:
    item.oilId || item.id || null,

  oilName:
    item.oilName || item.name || "",

  oilCategory:
    item.oilCategory || "",

  oilQtyML:
    item.oilQtyML || 0,
  oilComponents:
  Array.isArray(item.oilComponents) &&
  item.oilComponents.length > 0
    ? item.oilComponents.map((component) => ({
        oilId: component.oilId || component.id || null,
        oilName: component.oilName || "",
        oilCategory: component.oilCategory || "",
        quantityML: Number(
          component.quantityML ?? component.oilQty ?? 0
        ),
        costPerML: Number(component.costPerML) || 0,
        cost: Number(component.cost) || 0
      }))
    : (
        item.containerType !== "oil" &&
        Number(item.oilQty) > 0
      )
      ? [
          {
            oilId: item.oilId || item.id || null,
            oilName: item.oilName || item.name || "",
            oilCategory: item.oilCategory || "",
            quantityML: Number(item.oilQty),
            costPerML: Number(item.oilCostPerML) || 0,
            cost: Number(item.oilCost) || 0
          }
        ]
      : [],

  // 🧴 Container
  size:
    item.size || "",

  containerName:
    item.containerName || "",

  containerType:
    item.containerType ?? "unknown",

  containerId:
    item.containerId ?? null,

  // 📦 Qty
  qty:
    item.qty || 1,

  // 💰 Pricing
  unitPrice:
    item.unitPrice || item.price || 0,

  price:
    item.price || 0,

  // 💸 Costing
  oilCostPerML:
    item.oilCostPerML || 0,

  oilCost:
    item.oilCost || 0,

  containerCost:
    item.containerCost || 0,

  overheadCost:
    item.overheadCost || 0,

  unitCost:
    item.unitCost || 0,

  profit:
    item.profit || 0,

  margin:
    item.margin || 0,

  // 🟡 Backward compatibility
  oilQty:
    item.oilQty || 0,

  selectedMl:
    item.selectedMl ??
    item.oilQty ??
    0,

  pricePerMl:
    item.pricePerMl || 0,
}));
        const totalProfit = cleanedCart.reduce(
  (sum, item) =>
    sum +
    (Number(item.profit) || 0) *
    (Number(item.qty) || 1),
  0
);

const totalCost = cleanedCart.reduce(
  (sum, item) =>
    sum +
    (Number(item.unitCost) || 0) *
    (Number(item.qty) || 1),
  0
);

    const overallMargin =
      total > 0
        ? Number(((totalProfit / total) * 100).toFixed(2))
        : 0;
    const returnedItems = cleanedCart.filter(i => i.isReturned);

const newItems = cleanedCart.filter(i => !i.isReturned);

const returnedTotal = returnedItems.reduce((sum, i) => {

  const isOil =
    (i.containerType || "").toLowerCase() === "oil";

  if (isOil) {
  return (
    sum +
    (i.pricePerMl || 0) *
    (i.selectedMl ?? i.oilQty)
  );
}

  return sum + ((i.price || 0) * (i.qty || 0));

}, 0);

const newTotal = total - returnedTotal;

const returnedItemsCount = returnedItems.length;

const newItemsCount = newItems.length;

const saleType =
  returnedItemsCount === 0
    ? "SALE"
    : newItemsCount === 0
    ? "RETURN_RESALE"
    : "MIXED";
  // ======================================
// ATOMIC CHECKOUT TRANSACTION
// ======================================

const saleRef = doc(collection(db, "sales"));

// ======================================
// PREPARE STOCK MOVEMENTS
// ======================================

const stockMovements = [];

const pushStockMovement = (data) => {
  const quantity = Number(data.quantity) || 0;

  if (!data.productId || quantity <= 0) {
    return;
  }

  stockMovements.push({
    ref: doc(collection(db, "stock")),
    data: {
      ...data,
      quantity
    }
  });
};

for (const item of cart) {

  // المنتجات المرتجعة المعاد بيعها
  // لا تخصم من المخزون العادي
  if (item.isReturned) continue;

  const itemType = String(
    item.containerType || ""
  ).toLowerCase().trim();

  const itemQty = Number(item.qty) || 1;

  // ==================================
  // PURE OIL
  // ==================================

  if (itemType === "oil") {

    const oilId = item.oilId || item.id;

    const oilQuantity = Number(
      item.selectedMl ??
      (Number(item.oilQty || 0) * itemQty)
    );

    const oilCostPerML =
      Number(item.oilCostPerML) || 0;

    pushStockMovement({

      productId: oilId,

      productName: item.oilName || item.name,

      quantity: oilQuantity,

      type: "sale",

      direction: "OUT",

      movementType: "SALE",

      movementSource: "SALE",

      source: "SALE",

      productType: "RAW_OIL",

      unit: "ML",

      unitCost: oilCostPerML,

      totalCost: oilCostPerML * oilQuantity,

      price: item.price || 0,

      total:
        (Number(item.pricePerMl) || 0) *
        oilQuantity
    });

    continue;
  }

  // ==================================
  // READY PRODUCT
  // ==================================

  const isReadyProduct =
    itemType === "original" ||
    itemType === "ready" ||
    itemType === "cream" ||
    itemType === "مخمرية";

  const primaryProductId = isReadyProduct
    ? item.id
    : (item.containerId || item.id);

  // ==================================
  // CONTAINER / READY PRODUCT
  // ==================================

  const containerCost =
    Number(item.containerCost) || 0;

  const itemPrice =
    Number(item.price) || 0;

  pushStockMovement({

    productId: primaryProductId,

    productName: item.name,

    quantity: itemQty,

    type: "sale",

    direction: "OUT",

    movementType: "SALE",

    movementSource: "SALE",

    source: "SALE",

    productType: isReadyProduct
      ? "READY_PRODUCT"
      : "CONTAINER",

    unit: "PCS",

    unitCost: containerCost,

    totalCost: containerCost * itemQty,

    price: itemPrice,

    total: itemPrice * itemQty

  });

  // ==================================
  // OIL COMPONENTS
  // ==================================

  const oilComponents =
    Array.isArray(item.oilComponents) &&
    item.oilComponents.length > 0
      ? item.oilComponents
      : Number(item.oilQty) > 0
      ? [
          {
            oilId: item.oilId || item.id,
            oilName: item.oilName || item.name,
            quantityML: Number(item.oilQty),
            costPerML: Number(item.oilCostPerML) || 0,
            cost: Number(item.oilCost) || 0
          }
        ]
      : [];

  oilComponents.forEach((component, index) => {

    const oilId =
      component.oilId || component.id;

    const quantityPerBottle = Number(
      component.quantityML ??
      component.oilQty ??
      0
    );

    if (!oilId || quantityPerBottle <= 0) {
      return;
    }

    const costPerML =
      Number(component.costPerML) || 0;

    const componentCost =
      Number(component.cost) || 0;

    pushStockMovement({

      productId: oilId,

      productName:
        component.oilName || item.name,

      quantity: quantityPerBottle * itemQty,

      type: "sale",

      direction: "OUT",

      movementType: "SALE",

      movementSource: "SALE",

      source: "SALE",

      productType: "RAW_OIL",

      unit: "ML",

      unitCost: costPerML,

      totalCost: componentCost * itemQty,

      price:
        index === 0
          ? item.pricePerMl || 0
          : 0,

      total:
        index === 0
          ? (Number(item.price) || 0) * itemQty
          : 0

    });

  });
}

const isOwnerBackdatedSale =
  user?.role === "owner" && Boolean(saleDate);

const selectedSaleDate = isOwnerBackdatedSale
  ? getLocalDateAtNoon(saleDate)
  : new Date();

const businessDate = isOwnerBackdatedSale
  ? saleDate
  : getBusinessDateKey(selectedSaleDate);
let invoiceNumber = "";

await runTransaction(db, async (transaction) => {

  if (!cart.length) {
    throw new Error("❌ الكارت فاضي");
  }

  // ==================================
  // 1) READ COUNTER
  // ==================================

  const counterRef = doc(
    db,
    "counters",
    branchToUse
  );

  const counterSnap = await transaction.get(
    counterRef
  );

  if (!counterSnap.exists()) {
    throw new Error("Counter not found");
  }

  const newNumber =
    Number(counterSnap.data().lastNumber || 0) + 1;

  const nextInvoiceNumber =
    `${branchCode}-${String(newNumber).padStart(4, "0")}`;

  // ==================================
  // 2) READ RETURNED ITEMS
  // ==================================

  const returnedCartItems = cart.filter(
    item => item.isReturned
  );

  const returnedIds = returnedCartItems.map(
    item => item.returnedItemId
  );

  if (
    new Set(returnedIds).size !== returnedIds.length
  ) {
    throw new Error(
      "❌ لا يمكن بيع نفس العبوة المرتجعة مرتين في نفس الفاتورة"
    );
  }

  const returnedIdSet = new Set(returnedIds);

  const returnedDocs = new Map();

  for (const item of returnedCartItems) {

    if (!item.returnedItemId) {
      throw new Error(
        "❌ بيانات المنتج المرتجع غير مكتملة"
      );
    }

    const returnedRef = doc(
      db,
      "returned_items",
      item.returnedItemId
    );

    const returnedSnap = await transaction.get(
      returnedRef
    );

    if (!returnedSnap.exists()) {
      throw new Error(
        "❌ المنتج المرتجع غير موجود"
      );
    }

    const returnedData = returnedSnap.data();

    if (returnedData.status !== "available") {
      throw new Error(
        "❌ المنتج المرتجع غير متاح للبيع"
      );
    }

    if (returnedData.branchId !== branchToUse) {
      throw new Error(
        "❌ المنتج المرتجع تابع لفرع آخر"
      );
    }

    returnedDocs.set(item.returnedItemId, {
      ref: returnedRef,
      data: returnedData
    });
  }

  // ==================================
  // 3) READ ORIGINAL RETURN RECORDS
  // ==================================

  const returnRecords = new Map();

  for (const item of returnedCartItems) {

    if (!item.returnId) continue;

    if (returnRecords.has(item.returnId)) {
      continue;
    }

    const returnRef = doc(
      db,
      "returns",
      item.returnId
    );

    const returnSnap = await transaction.get(
      returnRef
    );

    if (!returnSnap.exists()) {
      throw new Error(
        "❌ سجل المرتجع الأصلي غير موجود"
      );
    }

    returnRecords.set(item.returnId, {
      ref: returnRef,
      data: returnSnap.data()
    });
  }

  // قراءة باقي العبوات التابعة لنفس المرتجع
  // حتى نحدد هل المرتجع بالكامل اتباع أم لا

  for (const record of returnRecords.values()) {

    const ids = Array.isArray(
      record.data.returnedItemIds
    )
      ? record.data.returnedItemIds
      : [];

    for (const id of ids) {

      if (returnedDocs.has(id)) continue;

      const siblingRef = doc(
        db,
        "returned_items",
        id
      );

      const siblingSnap = await transaction.get(
        siblingRef
      );

      if (!siblingSnap.exists()) {
        throw new Error(
          "❌ إحدى العبوات المرتبطة بسجل المرتجع غير موجودة"
        );
      }

      returnedDocs.set(id, {
        ref: siblingRef,
        data: siblingSnap.data()
      });
    }
  }

  // ==================================
  // 4) READ EXISTING CUSTOMER
  // ==================================

  if (existingCustomerRef) {

    const customerSnap = await transaction.get(
      existingCustomerRef
    );

    if (!customerSnap.exists()) {
      throw new Error(
        "❌ بيانات العميل غير موجودة"
      );
    }
  }

  // ==================================
  // 5) COLLECT INVENTORY REQUIREMENTS
  // ==================================

  const inventoryRequirements = new Map();

  const addInventoryRequirement = (
    productId,
    quantity,
    kind,
    productName
  ) => {

    if (!productId) {
      throw new Error(
        "❌ كود المنتج غير موجود"
      );
    }

    const requiredQuantity = Number(quantity);

    if (
      !Number.isFinite(requiredQuantity) ||
      requiredQuantity <= 0
    ) {
      throw new Error(
        "❌ كمية المخزون المطلوبة غير صحيحة"
      );
    }

    const key = String(productId);

    if (inventoryRequirements.has(key)) {

      const existing =
        inventoryRequirements.get(key);

      existing.requiredQuantity += requiredQuantity;

    } else {

      inventoryRequirements.set(key, {
        ref: doc(
          db,
          "inventory",
          `${branchToUse}_${productId}`
        ),

        requiredQuantity,

        kind,

        productName: productName || "المنتج"
      });
    }
  };

  for (const item of cart) {

    // المنتجات المرتجعة لا تخصم أي مخزون
    if (item.isReturned) continue;

    const type = (
      item.containerType || ""
    )
      .toLowerCase()
      .trim();

    const isOilOnly = type === "oil";

    const isReadyProduct =
      type === "original" ||
      type === "ready" ||
      type === "cream" ||
      type === "مخمرية";

    const itemQty = Number(item.qty) || 0;

    // PURE OIL
    if (isOilOnly) {

      const neededOil = Number(
        item.selectedMl ??
        (Number(item.oilQty || 0) * itemQty)
      );

      addInventoryRequirement(
        item.oilId || item.id,
        neededOil,
        "oil",
        item.oilName || item.name
      );

      continue;
    }

    // READY PRODUCT
    if (isReadyProduct) {

      if (!item.id || itemQty <= 0) {
        throw new Error(
          "❌ بيانات المنتج غير صحيحة"
        );
      }

      addInventoryRequirement(
        item.id,
        itemQty,
        "product",
        item.name
      );

      continue;
    }

    // CONTAINER
    if (!item.containerId || itemQty <= 0) {
      throw new Error(
        "❌ بيانات العبوة غير صحيحة"
      );
    }

    addInventoryRequirement(
      item.containerId,
      itemQty,
      "container",
      item.containerName || item.name
    );

    // OIL COMPONENTS
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
          quantityML: item.oilQty
        }
      ];
    }

    if (oilComponents.length === 0) {
      throw new Error(
        "❌ لازم تدخل كمية الزيت"
      );
    }

    for (const component of oilComponents) {

      const oilId =
        component.oilId || component.id;

      const quantityPerBottle = Number(
        component.quantityML ??
        component.oilQty ??
        0
      );

      addInventoryRequirement(
        oilId,
        quantityPerBottle * itemQty,
        "oil",
        component.oilName || item.name
      );
    }
  }

  // ==================================
  // 6) READ AND VALIDATE INVENTORY
  // ==================================

  for (
    const requirement of inventoryRequirements.values()
  ) {

    const inventorySnap = await transaction.get(
      requirement.ref
    );

    if (!inventorySnap.exists()) {

      throw new Error(
        requirement.kind === "container"
          ? `❌ الكونتينر ${requirement.productName} مش موجود`
          : requirement.kind === "oil"
          ? `❌ الزيت ${requirement.productName} مش موجود`
          : "❌ المنتج مش موجود في المخزن"
      );
    }

    const currentQuantity =
      Number(inventorySnap.data()?.quantity) || 0;

    if (
      currentQuantity <
      requirement.requiredQuantity
    ) {

      throw new Error(
        requirement.kind === "container"
          ? `❌ الكونتينر ${requirement.productName} مش كفاية`
          : requirement.kind === "oil"
          ? `❌ الزيت ${requirement.productName} مش كفاية. المتاح ${currentQuantity} مل والمطلوب ${requirement.requiredQuantity} مل`
          : `❌ المنتج ${requirement.productName} مش متوفر بالكمية المطلوبة`
      );
    }
  }

  // ==================================
  // 7) PREPARE RETURN STATUS UPDATES
  // ==================================

  const returnStatusUpdates = [];

  for (const record of returnRecords.values()) {

    const ids = Array.isArray(
      record.data.returnedItemIds
    )
      ? record.data.returnedItemIds
      : [];

    const allItemsSold =
      ids.length > 0 &&
      ids.every(id => {

        // العبوات الموجودة في الفاتورة الحالية
        if (returnedIdSet.has(id)) {
          return true;
        }

        // العبوات التي بيعت سابقًا
        return (
          returnedDocs.get(id)?.data?.status === "sold"
        );
      });

    returnStatusUpdates.push({
      ref: record.ref,
      status: allItemsSold ? "sold" : "returned"
    });
  }

  // ==================================
  // 8) ALL READS FINISHED - START WRITES
  // ==================================

  // Update counter
  transaction.update(counterRef, {
    lastNumber: newNumber
  });

  // Deduct normal inventory only
  for (
    const requirement of inventoryRequirements.values()
  ) {

    transaction.update(
      requirement.ref,
      {
        quantity: increment(
          -requirement.requiredQuantity
        )
      }
    );
  }

// ==================================
// SAVE STOCK MOVEMENTS ATOMICALLY
// ==================================

const stockEmployeeName =
  employeeName ||
  user?.displayName ||
  user?.name ||
  user?.email ||
  "Unknown Employee";

for (const movement of stockMovements) {

  transaction.set(movement.ref, {

    ...movement.data,

    branchId: branchToUse,

    branchName,

    invoiceDocId: saleRef.id,

    invoiceNumber: nextInvoiceNumber,

    employeeId: employeeId || null,

    employeeName: stockEmployeeName,

    createdAt: serverTimestamp()

  });

}

  // Mark returned products as sold
  for (const item of returnedCartItems) {

    const returnedRecord = returnedDocs.get(
      item.returnedItemId
    );

    transaction.update(
      returnedRecord.ref,
      {
        status: "sold",
        soldAt: serverTimestamp(),
        soldInvoiceId: saleRef.id
      }
    );
  }

  // Update original return records
  for (const update of returnStatusUpdates) {

    transaction.update(
      update.ref,
      {
        status: update.status
      }
    );
  }

  // Update existing customer
  if (existingCustomerRef) {

    transaction.update(
      existingCustomerRef,
      {
        name: customerName || "",
        totalSpent: increment(total || 0),
        ordersCount: increment(1),
        lastPurchase: serverTimestamp()
      }
    );
  }

  // Create new customer
  if (newCustomerRef) {

    transaction.set(
      newCustomerRef,
      {
        name: customerName || "",
        phone: customerPhone.trim(),

        totalSpent: total || 0,
        totalRefunded: 0,
        ordersCount: 1,

        lastPurchase: serverTimestamp(),

        notes: "",
        tags: [],

        createdAt: serverTimestamp()
      }
    );
  }

  // Save invoice inside the SAME transaction
  transaction.set(
    saleRef,
    {
      customerId: customerId || null,

      invoiceNumber: nextInvoiceNumber,

      saleType,

      newItemsCount,
      returnedItemsCount,

      newTotal,
      returnedTotal,

      items: cleanedCart,

      total: total || 0,

      totalCost,
      totalProfit,
      overallMargin,

      paymentMethod: paymentMethod || "",

      payments: Array.isArray(payments)
        ? payments
        : [],

      customerName: customerName || "",
      customerPhone: customerPhone || "",

      branchId: branchToUse,
      branchName,

      createdAt: serverTimestamp(),

saleDate: isOwnerBackdatedSale
  ? Timestamp.fromDate(selectedSaleDate)
  : serverTimestamp(),

businessDate,

      status: "completed",

      totalQty: cart.reduce(
        (sum, item) =>
          sum +
          (
            item.containerType === "oil"
              ? (item.selectedMl ?? item.oilQty)
              : item.qty
          ),
        0
      ),

      refundedQty: 0,
      refundedMl: 0,

      employeeId: employeeId || null,

      employeeName:
        employeeName ||
        user?.displayName ||
        user?.name ||
        user?.email ||
        "Unknown Employee",

      enteredBy:
        user?.displayName ||
        user?.name ||
        user?.email ||
        "Unknown User",

      enteredById:
        user?.uid ||
        user?.id ||
        null
    }
  );

  // Keep invoice number for the return value and logs
  invoiceNumber = nextInvoiceNumber;
});
try {
    await logAction({

      action:
        "CREATE_INVOICE",

      module:
        "Sales",

      severity:
        "success",

      status:
        "success",

      performedBy:
        user?.uid || "",

      performedByName:
        user?.displayName ||
        user?.name ||
        user?.email ||
        "",

      userId:
        user?.uid || "",

      branchId:
        branchToUse,
      branchName: branchName,
      targetId:
        saleRef.id,

      targetName:
        invoiceNumber,

      details: {
        saleType,
        invoiceType: saleType,

        newItemsCount,

        returnedItemsCount,

        newTotal,

        returnedTotal,
        invoiceNumber,

        branchName:
        branchName,

        employeeId:
          employeeId || null,

        employeeName:
          employeeName ||
          user?.displayName ||
          user?.name ||
          user?.email ||
          "Unknown Employee",

        

        paymentCategory:
        paymentMethod,  

        customerName,

        customerPhone,

        paymentMethod,
        payments: Array.isArray(payments)
          ? payments
          : [],

        total,

        totalProfit,

        totalCost,

        overallMargin,

        totalItems:
          cleanedCart.length,

        totalQty:
      cleanedCart.reduce(
        (sum, item) =>
          sum +
          (
           item.containerType === "oil"
            ? (item.selectedMl ?? item.oilQty)
            : item.qty
          ),
        0
      ),

      topItems:
  cleanedCart
    .slice(0, 5)
    .map(item => ({
      name: item.name,
      qty: item.qty,
      total:
        item.price * item.qty,
      totalCost:
        item.unitCost || 0,
      totalProfit:
        item.profit || 0
    }))

      }

    });   
    } catch (logError) {
  console.error(
    "Invoice saved, but audit log failed:",
    logError
  );
}
    return invoiceNumber;

      } catch (err) {

  console.error(
    "Checkout Error:",
    err
  );

  try {
    await logAction({

          action:
            "CREATE_INVOICE",

          module:
            "Sales",

          severity:
            "danger",

          status:
            "error",

          performedBy:
            user?.uid || "",

          performedByName:
            user?.name || "",

          userId:
            user?.uid || "",

          branchId:
            branchToUse,
          branchName: branchName,
          details: {

            customerName,

            customerPhone,

            paymentMethod,

            total,

            cartSize:
              cart.length,

            topItems:
              cart
                .slice(0, 5)
                .map(item => ({

                  name:
                    item.name,

                  qty:
                    item.containerType === "oil"
                      ? (item.selectedMl ?? item.oilQty)
                      : item.qty,

                })),

            error:
              err.message

          }

        });
        } catch (logError) {
  console.error(
    "Failed to write checkout error log:",
    logError
  );
}

        throw err;

      }

    };
    
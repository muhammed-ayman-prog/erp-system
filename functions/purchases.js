const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { withLog } = require("./utils/withLog");

const { getCurrentUser } =
  require("./utils/getCurrentUser");

const {
  validateBranch,
  validateItems,
} = require("./utils/validators");

const {
  readInventory,
  writeInventory,
} = require("./utils/inventory");

const {
  createStockLog,
} = require("./utils/stockLogs");

const {
  STOCK_TYPES,
} = require("./constants/stockTypes");

exports.createPurchase = onCall(
  withLog(
    {
      action: "CREATE_PURCHASE",
      module: "Purchases",
      severity: "success",
    },
    async (request) => {

      const auth = request.auth;

      if (!auth) {
        throw new HttpsError(
          "unauthenticated",
          "Login first"
        );
      }

      const { branchId, items } = request.data;
      console.log("=== CREATE PURCHASE START ===");
console.log("Auth UID:", auth.uid);
console.log("Branch:", branchId);
console.log("Items:", items);

      validateBranch(branchId);
      validateItems(items);

      // ==========================
      // Get User Info
      // ==========================

      
console.log("STEP 1 - Start");
const userData =
  await getCurrentUser(auth.uid);
  console.log("User:", userData);

      const db = admin.firestore();

      const purchaseRef =
        db.collection("purchases").doc();

      // هنخزن نتائج تحديث المخزون هنا
      const stockResults = [];
      const branchSnap = await db
  .collection("branches")
  .doc(branchId)
  .get();
  console.log("STEP 3 - Branch Loaded", branchId);

if (!branchSnap.exists) {
  throw new HttpsError(
    "not-found",
    "Branch not found"
  );
}

const branchName =
  branchSnap.data().name;
  console.log("Branch Name:", branchName);
      // ==========================
      // Transaction
      // ==========================

      await db.runTransaction(async (transaction) => {

  console.log("STEP 5 - Inside Transaction");

  // ==========================
  // READ ALL INVENTORY FIRST
  // ==========================

  for (const item of items) {

    const {
      inventoryRef,
      before,
    } = await readInventory(
      transaction,
      branchId,
      item.productId
    );

    const after =
      before + Number(item.quantity);
    if (after < 0) {
  throw new HttpsError(
    "failed-precondition",
    `Insufficient stock for product ${item.productId}`
  );
}
    stockResults.push({
      item,
      inventoryRef,
      before,
      after,
    });

  }

  // ==========================
  // WRITE ALL INVENTORY
  // ==========================

  for (const stock of stockResults) {

    writeInventory(
      transaction,
      stock.inventoryRef,
      branchId,
      stock.item.productId,
      stock.after
    );

  }

  // ==========================
  // CREATE PURCHASE
  // ==========================

  transaction.set(
    purchaseRef,
    {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),

      branchId,
      branchName,

      userId: auth.uid,
      userName: userData?.name || "",

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),

      undone: false,
    }
  );

});
console.log("STEP 6 - Transaction Done");

      // ==========================
      // Stock Logs
      // ==========================

      for (const stock of stockResults) {
console.log("STEP 7 - Stock Log", stock.item.productId);    
        await createStockLog({
            

          productId:
            stock.item.productId,

          branchId,

          quantity:
            Number(stock.item.quantity),

          before:
            stock.before,

          after:
            stock.after,

          type:
            STOCK_TYPES.PURCHASE,

          referenceId:
            purchaseRef.id,

          userId:
            auth.uid,

        });

      }

      const totalQty = items.reduce(
  (sum, item) => sum + Number(item.quantity),
  0
);
console.log("Transaction Success");
return {
  success: true,

  purchaseId: purchaseRef.id,

  // Branch
  branchId,
  branchName,

  // Target
  targetId: purchaseRef.id,
  targetName: `${items.length} Item(s) - Qty ${totalQty}`,

  // Audit
  before: null,

  after: {
    purchaseId: purchaseRef.id,
    itemsCount: items.length,
    totalQuantity: totalQty,
  },

  logDetails: {
    itemsCount: items.length,
    totalQuantity: totalQty,
    items: items.map(item => ({

  productId: item.productId,

  quantity: Number(item.quantity)

})),
  },
};

    }
  )
);
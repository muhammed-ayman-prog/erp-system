const admin = require("firebase-admin");

function getInventoryRef(branchId, productId) {
  return admin
    .firestore()
    .collection("inventory")
    .doc(`${branchId}_${productId}`);
}

async function readInventory(
  transaction,
  branchId,
  productId
) {
  const inventoryRef = getInventoryRef(
    branchId,
    productId
  );

  const snap = await transaction.get(
    inventoryRef
  );

  const before = snap.exists
    ? Number(snap.data().quantity || 0)
    : 0;

  return {
    inventoryRef,
    before,
  };
}

function writeInventory(
  transaction,
  inventoryRef,
  branchId,
  productId,
  quantity
) {
  transaction.set(
    inventoryRef,
    {
      branchId,
      productId,
      quantity,
      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

module.exports = {
  getInventoryRef,
  readInventory,
  writeInventory,
};
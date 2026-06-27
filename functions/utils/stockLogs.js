const admin = require("firebase-admin");

async function createStockLog({
  productId,
  branchId,
  quantity,
  before,
  after,
  type,
  referenceId,
  userId
}) {

  await admin
    .firestore()
    .collection("stock")
    .add({

      productId,

      branchId,

      quantity,

      before,

      after,

      type,

      referenceId: referenceId || null,

      userId: userId || null,

      createdAt:
        admin.firestore.FieldValue.serverTimestamp()

    });

}

module.exports = {
  createStockLog
};
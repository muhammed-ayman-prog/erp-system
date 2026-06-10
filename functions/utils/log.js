const admin =
  require("firebase-admin");

async function logAction({

  action,

  module = "System",

  severity = "info",

  status = "success",

  by = "unknown",

  byName = "",

  userId = "",

  branchId = "",

  branchName = "",

  targetId = null,

  targetName = "",

  details = {},

  metadata = {},

  before = null,

  after = null

}) {

  await admin
    .firestore()
    .collection("logs")
    .add({

      action,

      module,

      severity,

      status,

      by,

      byName,

      userId,

      branchId,

      branchName,

      targetId,

      targetName,

      details,

      metadata,

      before,

      after,

      createdAt:
        admin.firestore
          .FieldValue
          .serverTimestamp(),

    });

}

module.exports = {
  logAction
};
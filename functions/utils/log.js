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

  targetId = null,

  targetName = "",

  details = {},

  metadata = {}

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

      targetId,

      targetName,

      details,

      
      createdAt:
        admin.firestore
          .FieldValue
          .serverTimestamp(),
    });

}

module.exports = {
  logAction
};
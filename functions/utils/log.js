const admin = require("firebase-admin");

async function logAction({ action, by, targetId = null, details = {} }) {
  await admin.firestore().collection("logs").add({
    action,
    by,
    targetId,
    details,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

module.exports = { logAction };
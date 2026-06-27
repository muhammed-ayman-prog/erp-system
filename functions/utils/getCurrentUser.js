const admin = require("firebase-admin");

async function getCurrentUser(uid) {

  if (!uid) {
    return null;
  }

  const snap = await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .get();

  if (!snap.exists) {
    return null;
  }

  return {
    uid,
    ...snap.data(),
  };

}

module.exports = {
  getCurrentUser,
};
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { withLog } = require("./utils/withLog");
admin.initializeApp();

exports.createUser = onCall(
  withLog({

  action:
    "CREATE_USER",

  module:
    "Users",

  severity:
    "success"

}, async (request) => {

    const data = request.data;
    const auth = request.auth;

    if (!auth) {
      throw new HttpsError("unauthenticated", "You must be logged in");
    }

    const {
  email,
  password,
  name,
  role,
  branchIds,
} = data;

    if (!email || !password || !name || !role) {
      throw new HttpsError("invalid-argument", "Missing fields");
    }

    const callerDoc = await admin
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .get();

    if (!callerDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    const callerData = callerDoc.data();

    if (callerData.role !== "owner") {
      throw new HttpsError("permission-denied", "Only owner can manage users");
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    

    await admin
  .firestore()
  .collection("users")
  .doc(userRecord.uid)
  .set({
    name,
    email,
    role,

    branchIds:
      role === "owner"
        ? []
        : branchIds || [],

    status: "active",

    createdAt:
      admin.firestore.FieldValue.serverTimestamp(),
  });

    return {

  success: true,

  targetId:
    userRecord.uid,

  targetName:
    name,

  logDetails: {

    email,

    role,

    branchIds 

  }

};
  })
);
exports.updateUser = onCall(
  withLog({

    action:
      "UPDATE_USER",

    module:
      "Users",

    severity:
      "info"

  }, async (request) => {

    const {
  uid,
  name,
  role,
  branchIds,
} = request.data;
    const auth = request.auth;

    if (!auth) throw new HttpsError("unauthenticated", "Login first");

    const caller = await admin.firestore().collection("users").doc(auth.uid).get();

    if (caller.data().role !== "owner") {
      throw new HttpsError("permission-denied", "Only owner can manage users");
    }

    await admin
  .firestore()
  .collection("users")
  .doc(uid)
  .update({
    name,
    role,

    branchIds:
      role === "owner"
        ? []
        : branchIds || [],
  });

    return {

  success: true,

  targetId:
    uid,

  targetName:
    name,

  logDetails: {

    updatedFields: {

      name,

      role,

      branchIds

    }

  }

};
  })
);
exports.toggleUserStatus = onCall(
  withLog({

    action:
      "TOGGLE_USER_STATUS",

    module:
      "Users",

    severity:
      "warning"

  }, async (request) => {

    const { uid } = request.data;
    const auth = request.auth;

    if (!auth) throw new HttpsError("unauthenticated", "Login first");
    const caller = await admin
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .get();

    if (caller.data().role !== "owner") {

      throw new HttpsError(
        "permission-denied",
        "Only owner can manage users"
      );

    }
    if (uid === auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "You cannot disable yourself"
      );
    }
    const userRef = admin.firestore().collection("users").doc(uid);
    const snap = await userRef.get();

    const current = snap.data().status || "active";
    if (snap.data().role === "owner") {
      throw new HttpsError(
        "permission-denied",
        "Owner cannot be disabled"
      );
    }
    const next = current === "active" ? "disabled" : "active";
    
    await userRef.update({ status: next });

    return {

  success: true,

  targetId:
    uid,

  targetName:
    snap.data().name || "",

  logDetails: {

    oldStatus:
      current,

    newStatus:
      next

  }

};
  })
);
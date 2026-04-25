const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { logAction } = require("./utils/log");
const { withLog } = require("./utils/withLog");
admin.initializeApp();

exports.createUser = onCall(
  withLog("CREATE_USER", async (request) => {

    const data = request.data;
    const auth = request.auth;

    if (!auth) {
      throw new HttpsError("unauthenticated", "You must be logged in");
    }

    const { email, password, name, role, branchId } = data;

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

    if (callerData.role !== "admin") {
      throw new HttpsError("permission-denied", "Only admin allowed");
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    const permissions =
      role === "admin"
        ? ["*"]
        : role === "branch_manager"
        ? [
            "view_dashboard",
            "view_sales",
            "view_reports",
            "view_inventory",
            "view returns",
            "view expenses",
            "view waste",
            "view purchases",
            "view_customers",
            "view_operations",
            "view_logs"
          ]
        : ["view_dashboard", "view_sales"];

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      name,
      email,
      role,
      branchId: branchId || "",
      status: "active",
      permissions,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      targetId: userRecord.uid // 👈 مهم للـ log
    };
  })
);
exports.deleteUser = onCall(
  withLog("DELETE_USER", async (request) => {

    const auth = request.auth;
    const { uid } = request.data;

    // 🔐 لازم يكون مسجل
    if (!auth) {
      throw new HttpsError("unauthenticated", "You must be logged in");
    }

    // 🔒 تأكد إنه admin
    const callerDoc = await admin
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .get();

    if (!callerDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    const callerData = callerDoc.data();

    if (callerData.role !== "admin") {
      throw new HttpsError("permission-denied", "Only admin allowed");
    }

    // 🔥 حذف من Auth
    await admin.auth().deleteUser(uid);

    // 🔥 حذف من Firestore
    await admin.firestore().collection("users").doc(uid).delete();

    return {
      success: true,
      targetId: uid // 👈 مهم للـ log
    };
  })
);
exports.updateUser = onCall(
  withLog("UPDATE_USER", async (request) => {

    const { uid, name, role, branchId, permissions } = request.data;
    const auth = request.auth;

    if (!auth) throw new HttpsError("unauthenticated", "Login first");

    const caller = await admin.firestore().collection("users").doc(auth.uid).get();

    if (caller.data().role !== "admin") {
      throw new HttpsError("permission-denied", "Only admin");
    }

    await admin.firestore().collection("users").doc(uid).update({
      name,
      role,
      branchId: role === "admin" ? "" : branchId,
      permissions: role === "admin" ? ["*"] : permissions
    });

    return { success: true, targetId: uid };
  })
);
exports.toggleUserStatus = onCall(
  withLog("TOGGLE_USER_STATUS", async (request) => {

    const { uid } = request.data;
    const auth = request.auth;

    if (!auth) throw new HttpsError("unauthenticated", "Login first");

    const userRef = admin.firestore().collection("users").doc(uid);
    const snap = await userRef.get();

    const current = snap.data().status || "active";

    const next = current === "active" ? "disabled" : "active";

    await userRef.update({ status: next });

    return { success: true, targetId: uid };
  })
);
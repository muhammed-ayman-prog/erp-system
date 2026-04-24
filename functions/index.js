const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUser = functions.https.onCall(async (data, context) => {
  try {
    // 🔒 لازم يكون المستخدم مسجل دخول
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in"
      );
    }

    const { email, password, name, role, branchId } = data;

    // 🔒 هات بيانات اليوزر اللي بينفذ (من Firestore)
    const callerDoc = await admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid)
      .get();

    if (!callerDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found"
      );
    }

    const callerData = callerDoc.data();

    // 🔒 تأكد إنه Admin
    if (callerData.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admin can create users"
      );
    }

    // 🔒 Validation بسيط
    if (!email || !password || !name || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    // 🔥 إنشاء user في Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // 🔥 تحديد الصلاحيات
    const permissions =
      role === "admin"
        ? ["*"]
        : role === "branch_manager"
        ? [
            "view_dashboard",
            "view_sales",
            "view_reports",
            "view_inventory",
            "view_customers",
            "view_operations"
          ]
        : ["view_dashboard", "view_sales"];

    // 🔥 حفظه في Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      name,
      email,
      role,
      branchId: branchId || "",
      status: "active",
      permissions,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };

  } catch (error) {
    console.error("CreateUser Error:", error);

    throw new functions.https.HttpsError(
      "internal",
      error.message || "Something went wrong"
    );
  }
});
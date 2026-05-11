const { logAction } = require("./log");
const { HttpsError } = require("firebase-functions/v2/https");

function withLog(config, handler) {
  return async (request) => {
    const auth = request.auth;
    let byName = "";

if (auth?.uid) {

  const admin =
    require("firebase-admin");

  const userSnap =
    await admin
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .get();

  byName =
    userSnap.data()?.name || "";

}
    const data = request.data;
    const {
      action,
      module = "System",
      severity = "info"
    } = config;
    try {
      // شغّل الفنكشن الأساسية
      const result = await handler(request);

      // 🧾 log success
      await logAction({

        action:

          action,

        module:

          module,

        severity:

          severity,

        status:

          "success",

        by:

          auth?.uid || "unknown",
        byName,

        userId:

          auth?.uid || "",

        branchId:

          "",

        targetId:

          result?.targetId || null,

        targetName:
          result?.targetName || "",

        details:
          result?.logDetails || {}


      });

      return result;

    } catch (error) {
      console.error("ERROR:", error);

      // 🧾 log error
      await logAction({

        action,

        module,

        severity:
          "danger",

        status:
          "error",

        by:
          auth?.uid || "unknown",
          
        byName,

        userId:
          auth?.uid || "",

        branchId:
          "",

        targetId:
          data?.uid || null,

        targetName:
          "",

        details: {

          message:
            error.message,

          code:
            error.code || "unknown"

        },


      });

      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", error.message);
    }
  };
}

module.exports = { withLog };
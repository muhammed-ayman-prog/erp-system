const admin = require("firebase-admin");

const { logAction } = require("./log");

const { getCurrentUser } =
  require("./getCurrentUser");

const {
  HttpsError,
} = require("firebase-functions/v2/https");

async function getBranchName(branchId) {
  if (!branchId) return "";

  const snap = await admin
    .firestore()
    .collection("branches")
    .doc(branchId)
    .get();

  return snap.exists
    ? snap.data().name || ""
    : "";
}

function withLog(config, handler) {
  return async (request) => {

    const auth = request.auth;
    const data = request.data;

    const {
      action,
      module = "System",
      severity = "info",
    } = config;

    let performedByName = "";

    if (auth?.uid) {
      

const currentUser =
  await getCurrentUser(auth?.uid);

 performedByName =
  currentUser?.name || "";
    }

    try {

      const result =
        await handler(request);

      const branchId =
        result?.branchId || "";

      let branchName = result?.branchName || "";

      if (!branchName && branchId) {
        branchName = await getBranchName(branchId);
      }

      await logAction({

        action,

        module,

        severity,

        status: "success",

        performedBy:
          auth?.uid || "unknown",

        performedByName,

        branchId,

        branchName,

        targetId:
          result?.targetId || null,

        targetName:
          result?.targetName || "",

        details:
          result?.logDetails || {},

        metadata:
          result?.metadata || {},

        before:
          result?.before || null,

        after:
          result?.after || null,

      });

      return result;

    } catch (error) {

      console.error(error);

      const branchId =
        data?.branchId || "";

      let branchName = data?.branchName || "";

      if (!branchName && branchId) {
        branchName = await getBranchName(branchId);
      }

      await logAction({

        action,

        module,

        severity: "danger",

        status: "error",

        performedBy:
          auth?.uid || "unknown",

        performedByName,

        branchId,

        branchName,

        targetId:
          data?.targetId ||
          data?.id ||
          null,

        targetName:
          data?.targetName || "",

        details: {
          message: error.message,
          code:
            error.code || "unknown",
        },

        metadata: {},

        before: null,

        after: null,

      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        error.message
      );
    }
  };
}

module.exports = {
  withLog,
};
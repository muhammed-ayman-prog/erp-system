const { logAction } = require("./log");
const {
  HttpsError
} = require("firebase-functions/v2/https");

function withLog(
  config,
  handler
) {
  return async (
    request
  ) => {

    const auth =
      request.auth;

    const data =
      request.data;

    let byName = "";

    if (auth?.uid) {

      const admin =
        require(
          "firebase-admin"
        );

      const userSnap =
        await admin
          .firestore()
          .collection(
            "users"
          )
          .doc(
            auth.uid
          )
          .get();

      byName =
        userSnap.data()
          ?.name || "";
    }

    const {

      action,

      module =
        "System",

      severity =
        "info"

    } = config;

    try {

      const result =
        await handler(
          request
        );

      await logAction({

        action,

        module,

        severity,

        status:
          "success",

        performedBy:
          auth?.uid ||
          "unknown",

        performedByName:
          byName,

        branchId:
          result?.branchId || "",

        branchName:
          result?.branchName || "",

        targetId:
          result?.targetId ||
          null,

        targetName:
          result?.targetName ||
          "",

        details:
          result?.logDetails ||
          {},

        before:
          result?.before ||
          null,

        after:
          result?.after ||
          null

      });

      return result;

    } catch (
      error
    ) {

      console.error(
        "ERROR:",
        error
      );

      await logAction({

        action,

        module,

        severity:
          "danger",

        status:
          "error",

       performedBy:
        auth?.uid ||
        "unknown",

      performedByName:
        byName,

        branchId:
          data?.branchId || "",

        branchName:
          data?.branchName || "",

        targetId:
          data?.uid ||
          null,

        targetName:
          "",

        details: {

          message:
            error.message,

          code:
            error.code ||
            "unknown"

        },

        before:
          null,

        after:
          null

      });

      if (
        error instanceof
        HttpsError
      ) {
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
  withLog
};
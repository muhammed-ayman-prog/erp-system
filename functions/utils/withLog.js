const { logAction } = require("./log");
const { HttpsError } = require("firebase-functions/v2/https");

function withLog(action, handler) {
  return async (request) => {
    const auth = request.auth;
    const data = request.data;

    try {
      // شغّل الفنكشن الأساسية
      const result = await handler(request);

      // 🧾 log success
      await logAction({
        action,
        by: auth?.uid || "unknown",
        targetId: result?.targetId || null,
        details: {
          status: "success",
          ...data
        }
      });

      return result;

    } catch (error) {
      console.error("ERROR:", error);

      // 🧾 log error
      await logAction({
        action,
        by: auth?.uid || "unknown",
        details: {
          status: "error",
          message: error.message
        }
      });

      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", error.message);
    }
  };
}

module.exports = { withLog };
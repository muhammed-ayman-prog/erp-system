const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { withLog } = require("./utils/withLog");

exports.createBranch = onCall(
  withLog(
    {
      action: "CREATE_BRANCH",
      module: "Branches",
      severity: "success",
    },
    async (request) => {

      const auth = request.auth;

      if (!auth) {
        throw new HttpsError(
          "unauthenticated",
          "Login first"
        );
      }

      const {
        name,
        code,
        phone,
        address,
        manager,
        employees
      } = request.data;

      const branchRef =
        await admin
          .firestore()
          .collection("branches")
          .add({
            name,
            code,
            phone: phone || "",
            address: address || "",
            manager: manager || "",
            employees: employees || [],
            status: "active",
            isArchived: false,
            createdAt:
              admin.firestore.FieldValue.serverTimestamp()
          });

      await admin
        .firestore()
        .collection("counters")
        .doc(branchRef.id)
        .set({
          lastNumber: 0
        });

      return {
        success: true,

        branchId: branchRef.id,

        branchName: name,

        targetId: branchRef.id,

        targetName: name,

        before: null,

        after: {
          name,
          code,
          phone,
          address,
          manager,
          employees
        },

        logDetails: {
          code,
          phone,
          manager
        }
      };
    }
  )
);
exports.updateBranch = onCall(
  withLog(
    {
      action: "UPDATE_BRANCH",
      module: "Branches",
      severity: "warning",
    },
    async (request) => {

      const {
        id,
        name,
        code,
        phone,
        address,
        manager,
        employees
      } = request.data;

      const ref =
        admin
          .firestore()
          .collection("branches")
          .doc(id);

      const snap =
        await ref.get();

      if (!snap.exists) {
        throw new HttpsError(
          "not-found",
          "Branch not found"
        );
      }

      const before =
        snap.data();

      await ref.update({
        name,
        code,
        phone,
        address,
        manager,
        employees,
        updatedAt:
          admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,

        branchId: id,

        branchName: name,

        targetId: id,

        targetName: name,

        before,

        after: {
          name,
          code,
          phone,
          address,
          manager,
          employees
        },

        logDetails: {
          updatedFields: {
            name,
            code,
            phone,
            address,
            manager
          }
        }
      };
    }
  )
);
exports.archiveBranch = onCall(
  withLog(
    {
      action: "DISABLE_BRANCH",
      module: "Branches",
      severity: "warning",
    },
    async (request) => {

      const { id } = request.data;

      const ref = admin
        .firestore()
        .collection("branches")
        .doc(id);

      const snap = await ref.get();

      if (!snap.exists) {
        throw new HttpsError(
          "not-found",
          "Branch not found"
        );
      }

      const before = snap.data();

      await ref.update({
        isArchived: true,
        status: "inactive"
      });

      return {
        success: true,

        branchId: id,

        branchName:
          before.name,

        targetId: id,

        targetName:
          before.name,

        before,

        after: {
          ...before,
          isArchived: true,
          status: "inactive"
        },

        logDetails: {
          status: "inactive"
        }
      };
    }
  )
);
exports.restoreBranch = onCall(
  withLog(
    {
      action: "ENABLE_BRANCH",
      module: "Branches",
      severity: "success",
    },
    async (request) => {

      const { id } = request.data;

      const ref = admin
        .firestore()
        .collection("branches")
        .doc(id);

      const snap = await ref.get();

      if (!snap.exists) {
        throw new HttpsError(
          "not-found",
          "Branch not found"
        );
      }

      const before = snap.data();

      await ref.update({
        isArchived: false,
        status: "active"
      });

      return {
        success: true,

        branchId: id,

        branchName:
          before.name,

        targetId: id,

        targetName:
          before.name,

        before,

        after: {
          ...before,
          isArchived: false,
          status: "active"
        },

        logDetails: {
          status: "active"
        }
      };
    }
  )
);
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { withLog } = require("./utils/withLog");
const branches = require("./branches");
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

  before:
    null,

  after: {

    name,

    email,

    role,

    branchIds:
      role === "owner"
        ? []
        : branchIds || [],

    status:
      "active"

  },

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

    const userRef = admin
  .firestore()
  .collection("users")
  .doc(uid);

const userSnap =
  await userRef.get();

if (!userSnap.exists) {
  throw new HttpsError(
    "not-found",
    "User not found"
  );
}

const before =
  userSnap.data();

const nextBranchIds =
  role === "owner"
    ? []
    : branchIds || [];

await userRef.update({
  name,
  role,
  branchIds:
    nextBranchIds,
});

return {

  success: true,

  targetId:
    uid,

  targetName:
    name,

  before: {

    name:
      before.name,

    role:
      before.role,

    branchIds:
      before.branchIds || [],

    status:
      before.status

  },

  after: {

    name,

    role,

    branchIds:
      nextBranchIds,

    status:
      before.status

  },

  logDetails: {

    updatedFields: {

      name,

      role,

      branchIds:
        nextBranchIds

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

  before: {

    status:
      current

  },

  after: {

    status:
      next

  },

  logDetails: {

    oldStatus:
      current,

    newStatus:
      next

  }

};
  })
);
exports.createExpense = onCall(
  withLog(
    {
      action: "CREATE_EXPENSE",
      module: "Expenses",
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
        amount,
        note,
        category,
        branchId,
      } = request.data;

      if (
        !amount ||
        !category ||
        !branchId
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Missing fields"
        );
      }

      const expenseRef =
        await admin
          .firestore()
          .collection("expenses")
          .add({
            amount: Number(amount),
            note: note || "",
            category,
            branchId,
            userId: auth.uid,
            createdAt:
              admin.firestore.FieldValue.serverTimestamp(),
          });
      const branchSnap = await admin
  .firestore()
  .collection("branches")
  .doc(branchId)
  .get();

const branchName =
  branchSnap.exists
    ? branchSnap.data().name
    : "";
      return {
        success: true,

        branchId,
        branchName,

        targetId: expenseRef.id,
        targetName: category,

        before: null,

        after: {
          amount: Number(amount),
          note: note || "",
          category,
          branchId
        },

        logDetails: {
          amount: Number(amount),
          category,
          note: note || ""
        }
      };
    }
  )
);
exports.updateExpense = onCall(
  withLog(
    {
      action: "UPDATE_EXPENSE",
      module: "Expenses",
      severity: "warning",
    },
    async (request) => {

      const { id, amount, note, category } =
        request.data;

      const expenseRef = admin
        .firestore()
        .collection("expenses")
        .doc(id);

      const snap =
        await expenseRef.get();

      if (!snap.exists) {
        throw new HttpsError(
          "not-found",
          "Expense not found"
        );
      }

      const before =
        snap.data();

      await expenseRef.update({
        amount: Number(amount),
        note: note || "",
        category,
      });

      const branchSnap =
        await admin
          .firestore()
          .collection("branches")
          .doc(before.branchId)
          .get();

      return {
        success: true,

        branchId:
          before.branchId,

        branchName:
          branchSnap.exists
            ? branchSnap.data().name
            : "",

        targetId: id,

        targetName:
          category,

        before: {
          amount:
            before.amount,
          note:
            before.note,
          category:
            before.category,
        },

        after: {
          amount:
            Number(amount),
          note:
            note || "",
          category,
        },

        logDetails: {
          amount:
            Number(amount),
          note:
            note || "",
          category,
        },
      };
    }
  )
);
exports.deleteExpense = onCall(
  withLog(
    {
      action: "DELETE_EXPENSE",
      module: "Expenses",
      severity: "danger",
    },
    async (request) => {

      const { id } =
        request.data;

      const expenseRef = admin
        .firestore()
        .collection("expenses")
        .doc(id);

      const snap =
        await expenseRef.get();

      if (!snap.exists) {
        throw new HttpsError(
          "not-found",
          "Expense not found"
        );
      }

      const before =
        snap.data();

      const branchSnap =
        await admin
          .firestore()
          .collection("branches")
          .doc(before.branchId)
          .get();

      await expenseRef.delete();

      return {
        success: true,

        branchId:
          before.branchId,

        branchName:
          branchSnap.exists
            ? branchSnap.data().name
            : "",

        targetId: id,

        targetName:
          before.category,

        before,

        after: null,

        logDetails: {
          amount:
            before.amount,
          category:
            before.category,
          note:
            before.note,
        },
      };
    }
  )
);
exports.createLoan = onCall(
  withLog(
    {
      action: "ADD_LOAN",
      module: "Expenses",
      severity: "success",
    },
    async (request) => {

      const {
        employeeName,
        amount,
        note,
        branchId,
      } = request.data;

      const loanRef =
        await admin
          .firestore()
          .collection("loans")
          .add({
            employeeName,
            amount:
              Number(amount),
            note:
              note || "",
            branchId,
            createdAt:
              admin.firestore.FieldValue.serverTimestamp(),
          });

      const branchSnap =
        await admin
          .firestore()
          .collection("branches")
          .doc(branchId)
          .get();

      return {
        success: true,

        branchId,

        branchName:
          branchSnap.exists
            ? branchSnap.data().name
            : "",

        targetId:
          loanRef.id,

        targetName:
          employeeName,

        before: null,

        after: {
          employeeName,
          amount:
            Number(amount),
          note:
            note || "",
        },

        logDetails: {
          employee:
            employeeName,
          amount:
            Number(amount),
          note:
            note || "",
        },
      };
    }
  )
);
exports.updateLoan = onCall(
  withLog(
    {
      action: "UPDATE_LOAN",
      module: "Expenses",
      severity: "warning",
    },
    async (request) => {

      const {
        id,
        employeeName,
        amount,
        note,
      } = request.data;

      const ref =
        admin
          .firestore()
          .collection("loans")
          .doc(id);

      const snap =
        await ref.get();

      if (!snap.exists) {
        throw new HttpsError(
          "not-found",
          "Loan not found"
        );
      }

      const before =
        snap.data();

      await ref.update({
        employeeName,
        amount:
          Number(amount),
        note:
          note || "",
      });

      const branchSnap =
        await admin
          .firestore()
          .collection("branches")
          .doc(before.branchId)
          .get();

      return {
        success: true,

        branchId:
          before.branchId,

        branchName:
          branchSnap.exists
            ? branchSnap.data().name
            : "",

        targetId: id,

        targetName:
          employeeName,

        before,

        after: {
          employeeName,
          amount:
            Number(amount),
          note:
            note || "",
        },

        logDetails: {
          employee:
            employeeName,
          amount:
            Number(amount),
          note:
            note || "",
        },
      };
    }
  )
);
exports.createBonus = onCall(
  withLog(
    {
      action: "ADD_BONUS",
      module: "Expenses",
      severity: "success",
    },
    async (request) => {

      const {
        employeeName,
        amount,
        note,
        branchId,
      } = request.data;

      const bonusRef =
        await admin
          .firestore()
          .collection("bonuses")
          .add({
            employeeName,
            amount:
              Number(amount),
            note:
              note || "",
            branchId,
            createdAt:
              admin.firestore.FieldValue.serverTimestamp(),
          });

      const branchSnap =
        await admin
          .firestore()
          .collection("branches")
          .doc(branchId)
          .get();

      return {
        success: true,

        branchId,

        branchName:
          branchSnap.exists
            ? branchSnap.data().name
            : "",

        targetId:
          bonusRef.id,

        targetName:
          employeeName,

        before: null,

        after: {
          employeeName,
          amount:
            Number(amount),
          note:
            note || "",
        },

        logDetails: {
          employee:
            employeeName,
          amount:
            Number(amount),
          note:
            note || "",
        },
      };
    }
  )
);
exports.updateBonus = onCall(
  withLog(
    {
      action: "UPDATE_BONUS",
      module: "Expenses",
      severity: "warning",
    },
    async (request) => {

      const {
        id,
        employeeName,
        amount,
        note,
      } = request.data;

      const ref =
        admin
          .firestore()
          .collection("bonuses")
          .doc(id);

      const snap =
        await ref.get();

      if (!snap.exists) {
        throw new HttpsError(
          "not-found",
          "Bonus not found"
        );
      }

      const before =
        snap.data();

      await ref.update({
        employeeName,
        amount:
          Number(amount),
        note:
          note || "",
      });

      const branchSnap =
        await admin
          .firestore()
          .collection("branches")
          .doc(before.branchId)
          .get();

      return {
        success: true,

        branchId:
          before.branchId,

        branchName:
          branchSnap.exists
            ? branchSnap.data().name
            : "",

        targetId: id,

        targetName:
          employeeName,

        before,

        after: {
          employeeName,
          amount:
            Number(amount),
          note:
            note || "",
        },

        logDetails: {
          employee:
            employeeName,
          amount:
            Number(amount),
          note:
            note || "",
        },
      };
    }
  )
);
exports.createBranch =
  branches.createBranch;

exports.updateBranch =
  branches.updateBranch;

exports.archiveBranch =
  branches.archiveBranch;

exports.restoreBranch =
  branches.restoreBranch;
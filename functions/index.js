const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { withLog } = require("./utils/withLog");
const branches = require("./branches");
admin.initializeApp();

const validateBusinessDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid business date"
    );
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  // التأكد من أن التاريخ صحيح فعليًا
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid business date"
    );
  }

  // حساب تاريخ اليوم حسب توقيت مصر
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  const todayCairo =
    `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

  // منع أي تاريخ مستقبلي
  if (value > todayCairo) {
    throw new HttpsError(
      "invalid-argument",
      "Business date cannot be in the future"
    );
  }

  return value;
};

// Keep the same key format used by DailyClosing.jsx (YYYY-M-D).
const toStoredBusinessDateKey = (value) => {
  const [year, month, day] = value.split("-");
  return `${Number(year)}-${Number(month)}-${Number(day)}`;
};

// Legacy records without businessDate are assigned to the same 3:00 AM
// business-day boundary used by DailyClosing.jsx, using Cairo time.
const getRecordBusinessDate = (record) => {
  if (
    typeof record?.businessDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.businessDate)
  ) {
    return record.businessDate;
  }

  const rawCreatedAt = record?.createdAt;
  const createdAt =
    rawCreatedAt && typeof rawCreatedAt.toDate === "function"
      ? rawCreatedAt.toDate()
      : rawCreatedAt instanceof Date
        ? rawCreatedAt
        : rawCreatedAt?.seconds
          ? new Date(rawCreatedAt.seconds * 1000)
          : rawCreatedAt
            ? new Date(rawCreatedAt)
            : null;

  if (!createdAt || Number.isNaN(createdAt.getTime())) {
    throw new HttpsError(
      "failed-precondition",
      "Cannot determine the business date for this legacy record"
    );
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(createdAt);

  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  const cairoDate = new Date(
    Date.UTC(
      Number(dateParts.year),
      Number(dateParts.month) - 1,
      Number(dateParts.day)
    )
  );

  if (Number(dateParts.hour) < 3) {
    cairoDate.setUTCDate(cairoDate.getUTCDate() - 1);
  }

  const year = cairoDate.getUTCFullYear();
  const month = String(cairoDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(cairoDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// A missing status is treated as closed for compatibility with existing
// dailyClosings documents. Only an explicit "reopened" status unlocks a day.
const assertBusinessDateIsOpen = async (branchId, businessDate) => {
  if (!branchId || !businessDate) {
    throw new HttpsError(
      "invalid-argument",
      "Branch and business date are required"
    );
  }

  const snapshot = await admin
    .firestore()
    .collection("dailyClosings")
    .where("branchId", "==", branchId)
    .where("businessDate", "==", toStoredBusinessDateKey(businessDate))
    .get();

  const hasActiveClosing = snapshot.docs.some(
    (doc) => doc.data()?.status !== "reopened"
  );

  if (hasActiveClosing) {
    throw new HttpsError(
      "failed-precondition",
      "This business day is closed. An owner must reopen it before changing its transactions."
    );
  }
};

const assertRecordBusinessDateIsOpen = async (branchId, record, nextBusinessDate) => {
  const originalBusinessDate = getRecordBusinessDate(record);

  // The original day must be open even when the user tries to move the
  // transaction to another date.
  await assertBusinessDateIsOpen(branchId, originalBusinessDate);

  if (nextBusinessDate && nextBusinessDate !== originalBusinessDate) {
    await assertBusinessDateIsOpen(branchId, nextBusinessDate);
  }

  return originalBusinessDate;
};


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
  businessDate,
} = request.data;

const validBusinessDate = validateBusinessDate(businessDate);

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

      await assertBusinessDateIsOpen(branchId, validBusinessDate);

      const expenseRef =
        await admin
          .firestore()
          .collection("expenses")
          .add({
            amount: Number(amount),
note: note || "",
category,
branchId,
businessDate: validBusinessDate,
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
  branchId,
  businessDate: validBusinessDate,
},

        logDetails: {
  amount: Number(amount),
  category,
  note: note || "",
  businessDate: validBusinessDate,
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

      const {
  id,
  amount,
  note,
  category,
  businessDate,
} = request.data;

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
      const updateData = {
  amount: Number(amount),
  note: note || "",
  category,
};

if (businessDate !== undefined) {
  updateData.businessDate =
    validateBusinessDate(businessDate);
}
const originalBusinessDate = await assertRecordBusinessDateIsOpen(
  before.branchId,
  before,
  updateData.businessDate || undefined
);
const updatedBusinessDate =
  updateData.businessDate || before.businessDate || originalBusinessDate;
      await expenseRef.update(updateData);

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
          businessDate: before.businessDate || "",
        },

        after: {
  amount: Number(amount),
  note: note || "",
  category,
  businessDate: updatedBusinessDate,
},

        logDetails: {
  amount: Number(amount),
  note: note || "",
  category,
  businessDate: updatedBusinessDate,
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

      await assertRecordBusinessDateIsOpen(
        before.branchId,
        before
      );

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
  employeeId,
  employeeName,
  amount,
  note,
  branchId,
  businessDate,
} = request.data;

const validBusinessDate = validateBusinessDate(businessDate);

      if (!branchId || !employeeId || !amount) {
        throw new HttpsError("invalid-argument", "Missing fields");
      }

      await assertBusinessDateIsOpen(branchId, validBusinessDate);

      const loanRef =
        await admin
          .firestore()
          .collection("loans")
          .add({
  employeeId,
  employeeName,
  amount: Number(amount),
  note: note || "",
  branchId,
  businessDate: validBusinessDate,
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
  employeeId,
  employeeName,
  amount: Number(amount),
  note: note || "",
  businessDate: validBusinessDate,
},

        logDetails: {
  employeeId,
  employee: employeeName,
  amount: Number(amount),
  note: note || "",
  businessDate: validBusinessDate,
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
  employeeId,
  employeeName,
  amount,
  note,
  businessDate,
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
      const updateData = {
  employeeId,
  employeeName,
  amount: Number(amount),
  note: note || "",
};

if (businessDate !== undefined) {
  updateData.businessDate =
    validateBusinessDate(businessDate);
}

const originalBusinessDate = await assertRecordBusinessDateIsOpen(
  before.branchId,
  before,
  updateData.businessDate || undefined
);
const updatedBusinessDate =
  updateData.businessDate || before.businessDate || originalBusinessDate;
await ref.update(updateData);

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

        before: {
  ...before,
  businessDate: before.businessDate || "",
},

after: {
  employeeId,
  employeeName,
  amount: Number(amount),
  note: note || "",
  businessDate: updatedBusinessDate,
},

        logDetails: {
  employeeId,
  employee: employeeName,
  amount: Number(amount),
  note: note || "",
  businessDate: updatedBusinessDate,
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
        employeeId,
        employeeName,
        amount,
        note,
        branchId,
        businessDate,
      } = request.data;

      const validBusinessDate =
        validateBusinessDate(businessDate);

      if (!branchId || !employeeId || !amount) {
        throw new HttpsError("invalid-argument", "Missing fields");
      }

      await assertBusinessDateIsOpen(branchId, validBusinessDate);

      const bonusRef = await admin
        .firestore()
        .collection("bonuses")
        .add({
          employeeId,
          employeeName,
          amount: Number(amount),
          note: note || "",
          branchId,
          businessDate: validBusinessDate,
          createdAt:
            admin.firestore.FieldValue.serverTimestamp(),
        });

      const branchSnap = await admin
        .firestore()
        .collection("branches")
        .doc(branchId)
        .get();

      return {
        success: true,

        branchId,

        branchName: branchSnap.exists
          ? branchSnap.data().name
          : "",

        targetId: bonusRef.id,

        targetName: employeeName,

        before: null,

        after: {
          employeeId,
          employeeName,
          amount: Number(amount),
          note: note || "",
          businessDate: validBusinessDate,
        },

        logDetails: {
          employeeId,
          employee: employeeName,
          amount: Number(amount),
          note: note || "",
          businessDate: validBusinessDate,
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
        employeeId,
        employeeName,
        amount,
        note,
        businessDate,
      } = request.data;

      const ref = admin
        .firestore()
        .collection("bonuses")
        .doc(id);

      const snap = await ref.get();

      if (!snap.exists) {
        throw new HttpsError(
          "not-found",
          "Bonus not found"
        );
      }

      const before = snap.data();

      const updateData = {
        employeeId,
        employeeName,
        amount: Number(amount),
        note: note || "",
      };

      if (businessDate !== undefined) {
  updateData.businessDate =
    validateBusinessDate(businessDate);
}

      const originalBusinessDate = await assertRecordBusinessDateIsOpen(
        before.branchId,
        before,
        updateData.businessDate || undefined
      );
      const updatedBusinessDate =
        updateData.businessDate ||
        before.businessDate ||
        originalBusinessDate;

      await ref.update(updateData);

      const branchSnap = await admin
        .firestore()
        .collection("branches")
        .doc(before.branchId)
        .get();

      return {
        success: true,

        branchId: before.branchId,

        branchName: branchSnap.exists
          ? branchSnap.data().name
          : "",

        targetId: id,

        targetName: employeeName,

        before: {
          ...before,
          businessDate: before.businessDate || "",
        },

        after: {
          employeeId,
          employeeName,
          amount: Number(amount),
          note: note || "",
          businessDate: updatedBusinessDate,
        },

        logDetails: {
          employeeId,
          employee: employeeName,
          amount: Number(amount),
          note: note || "",
          businessDate: updatedBusinessDate,
        },
      };
    }
  )
);

exports.reopenDailyClosing = onCall(
  withLog(
    {
      action: "REOPEN_DAILY_CLOSING",
      module: "DailyClosing",
      severity: "warning",
    },
    async (request) => {
      const auth = request.auth;

      if (!auth) {
        throw new HttpsError("unauthenticated", "Login first");
      }

      const callerSnap = await admin
        .firestore()
        .collection("users")
        .doc(auth.uid)
        .get();

      if (!callerSnap.exists) {
        throw new HttpsError("not-found", "User not found");
      }

      const caller = callerSnap.data();

      if (caller.role !== "owner") {
        throw new HttpsError(
          "permission-denied",
          "Only owner can reopen a daily closing"
        );
      }

      const { branchId, businessDate } = request.data || {};
      if (!branchId) {
        throw new HttpsError("invalid-argument", "Branch is required");
      }

      const validBusinessDate = validateBusinessDate(businessDate);
      const storedBusinessDate = toStoredBusinessDateKey(validBusinessDate);
      const db = admin.firestore();

      const closingSnap = await db
        .collection("dailyClosings")
        .where("branchId", "==", branchId)
        .where("businessDate", "==", storedBusinessDate)
        .get();

      const closedDocs = closingSnap.docs.filter(
        (doc) => doc.data()?.status !== "reopened"
      );

      if (closedDocs.length === 0) {
        throw new HttpsError(
          "failed-precondition",
          "There is no active daily closing to reopen"
        );
      }

      const batch = db.batch();
      const reopenedAt = admin.firestore.FieldValue.serverTimestamp();

      closedDocs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "reopened",
          reopenedAt,
          reopenedBy: auth.uid,
          reopenedByName: caller.name || caller.displayName || "Owner",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      const branchSnap = await db
        .collection("branches")
        .doc(branchId)
        .get();

      const branchName = branchSnap.exists
        ? branchSnap.data().name || ""
        : "";

      return {
        success: true,
        branchId,
        branchName,
        targetId: closedDocs.map((doc) => doc.id).join(","),
        targetName: `Daily Closing ${validBusinessDate}`,
        before: {
          status: "closed",
          businessDate: validBusinessDate,
          closingCount: closedDocs.length,
        },
        after: {
          status: "reopened",
          businessDate: validBusinessDate,
          closingCount: closedDocs.length,
          reopenedBy: auth.uid,
          reopenedByName: caller.name || caller.displayName || "Owner",
        },
        logDetails: {
          businessDate: validBusinessDate,
          branchId,
          branchName,
          reopenedClosingCount: closedDocs.length,
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
  const purchases = require("./purchases");

exports.createPurchase =
  purchases.createPurchase;
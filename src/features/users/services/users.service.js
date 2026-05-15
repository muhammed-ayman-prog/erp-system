import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  httpsCallable,
} from "firebase/functions";

import {
  db,
  functions,
} from "../../../firebase";

// ======================
// GET USERS
// ======================

export const getUsersService = async () => {
  const snap = await getDocs(
    collection(db, "users")
  );

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      status: data.status || "active",
    };
  });
};

// ======================
// GET BRANCHES
// ======================

export const getBranchesService = async () => {
  const snap = await getDocs(
    collection(db, "branches")
  );

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// ======================
// CREATE USER
// ======================

export const createUserService = async (
  payload
) => {
  const fn = httpsCallable(
    functions,
    "createUser"
  );

  return await fn(payload);
};

// ======================
// UPDATE USER
// ======================

export const updateUserService = async (
  payload
) => {
  const fn = httpsCallable(
    functions,
    "updateUser"
  );

  return await fn(payload);
};

// ======================
// TOGGLE STATUS
// ======================

export const toggleUserStatusService =
  async (uid) => {
    const fn = httpsCallable(
      functions,
      "toggleUserStatus"
    );

    return await fn({ uid });
  };
  export const deleteUserService = async (
  uid
) => {
  const fn = httpsCallable(
    functions,
    "deleteUser"
  );

  return await fn({ uid });
};
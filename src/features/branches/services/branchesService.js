import { httpsCallable } from "firebase/functions";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  functions,
  db,
} from "../../../firebase";


// ==========================
// Get Branches
// ==========================

export const getBranchesService = async () => {
  const snapshot = await getDocs(
    collection(db, "branches")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};


// ==========================
// Create Branch
// ==========================

export const createBranchService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "createBranch"
  );

  const result = await fn(payload);

  return result.data;
};


// ==========================
// Update Branch
// ==========================

export const updateBranchService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "updateBranch"
  );

  const result = await fn(payload);

  return result.data;
};


// ==========================
// Archive Branch
// ==========================

export const archiveBranchService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "archiveBranch"
  );

  const result = await fn(payload);

  return result.data;
};


// ==========================
// Restore Branch
// ==========================

export const restoreBranchService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "restoreBranch"
  );

  const result = await fn(payload);

  return result.data;
};
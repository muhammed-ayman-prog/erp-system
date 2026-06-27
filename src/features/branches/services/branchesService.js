import { httpsCallable } from "firebase/functions";
import { functions } from "../../../firebase";

export const createBranchService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "createBranch"
  );

  const result =
    await fn(payload);

  return result.data;
};

export const updateBranchService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "updateBranch"
  );

  const result =
    await fn(payload);

  return result.data;
};

export const archiveBranchService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "archiveBranch"
  );

  const result =
    await fn(payload);

  return result.data;
};

export const restoreBranchService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "restoreBranch"
  );

  const result =
    await fn(payload);

  return result.data;
};
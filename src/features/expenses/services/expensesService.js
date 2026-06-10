import { httpsCallable } from "firebase/functions";
import { functions } from "../../../firebase";

export const createExpenseService = async (payload) => {
  const fn = httpsCallable(functions, "createExpense");
  const result = await fn(payload);
  return result.data;
};

export const updateExpenseService = async (payload) => {
  const fn = httpsCallable(functions, "updateExpense");
  const result = await fn(payload);
  return result.data;
};

export const deleteExpenseService = async (payload) => {
  const fn = httpsCallable(functions, "deleteExpense");
  const result = await fn(payload);
  return result.data;
};

export const createLoanService = async (payload) => {
  const fn = httpsCallable(functions, "createLoan");
  const result = await fn(payload);
  return result.data;
};

export const updateLoanService = async (payload) => {
  const fn = httpsCallable(functions, "updateLoan");
  const result = await fn(payload);
  return result.data;
};

export const createBonusService = async (payload) => {
  const fn = httpsCallable(functions, "createBonus");
  const result = await fn(payload);
  return result.data;
};

export const updateBonusService = async (payload) => {
  const fn = httpsCallable(functions, "updateBonus");
  const result = await fn(payload);
  return result.data;
};
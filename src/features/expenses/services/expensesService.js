import { httpsCallable } from "firebase/functions";
import { functions } from "../../../firebase";

const callFunction = async (name, payload) => {
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result.data;
};

export const createExpenseService = (payload) => callFunction("createExpense", payload);
export const updateExpenseService = (payload) => callFunction("updateExpense", payload);
export const deleteExpenseService = (payload) => callFunction("deleteExpense", payload);
export const createLoanService = (payload) => callFunction("createLoan", payload);
export const updateLoanService = (payload) => callFunction("updateLoan", payload);
export const createBonusService = (payload) => callFunction("createBonus", payload);
export const updateBonusService = (payload) => callFunction("updateBonus", payload);

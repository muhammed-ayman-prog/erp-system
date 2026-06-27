import { httpsCallable } from "firebase/functions";
import { functions } from "../../../firebase";

export const createPurchaseService = async (payload) => {
  const fn = httpsCallable(
    functions,
    "createPurchase"
  );

  const result = await fn(payload);

  return result.data;
};
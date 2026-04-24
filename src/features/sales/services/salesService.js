import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../../firebase";

export const checkout = async ({
  cart,
  total,
  paymentMethod,
  customerName,
  customerPhone,
  branchId
}) => {

  if (!cart.length) throw new Error("الكارت فاضي");

  const saleRef = await addDoc(collection(db, "sales"), {
    items: cart,
    total,
    paymentMethod,
    customerName,
    customerPhone,
    branchId,
    createdAt: serverTimestamp()
  });

  return saleRef.id;
};
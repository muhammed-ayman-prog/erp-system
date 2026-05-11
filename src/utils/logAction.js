import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db }
from "../firebase";

export default async function
logAction({

  action,

  module,

  severity = "info",

  status = "success",

  by = "",

  byName = "",

  userId = "",

  branchId = "",

  targetId = "",

  targetName = "",

  details = {},


}) {

  try {
const cleanData = {

    action,

    module,

    severity,

    status,

    by,

    byName,

    userId,

    branchId,

    targetId,

    targetName,

    details,


    };
    if (!action || !module) {

        console.warn(
            "Missing log action/module"
        );

        return;

        }
    await addDoc(
      collection(db, "logs"),

      {
        ...cleanData,

        createdAt:
            serverTimestamp()
        }
    );

  } catch (err) {

    console.error(
      "Log Error:",
      err
    );

  }

}
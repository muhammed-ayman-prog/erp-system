import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";

export default async function logAction({

  action,

  module,

  entityType = "",

  severity = "info",

  status = "success",

  performedBy = "",

  performedByName = "",

  branchId = "",

  branchName = "",

  targetId = "",

  targetName = "",

  before = null,

  after = null,

  details = {},

  metadata = {}

}) {

  try {

    if (!action || !module) {

      console.warn(
        "Missing log action/module"
      );

      return;
    }

    await addDoc(
      collection(db, "logs"),
      {

        action,

        module,

        entityType,

        severity,

        status,

        performedBy,

        performedByName,

        branchId,

        branchName,

        targetId,

        targetName,

        before,

        after,

        details,

        metadata,

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
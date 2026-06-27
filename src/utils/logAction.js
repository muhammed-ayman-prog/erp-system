import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";

const cleanDeep = (obj) => {

  if (obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanDeep);
  }

  if (
    obj &&
    typeof obj === "object" &&
    !(obj instanceof Date)
  ) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(
          ([_, value]) =>
            value !== undefined
        )
        .map(
          ([key, value]) => [
            key,
            cleanDeep(value)
          ]
        )
    );
  }

  return obj;
};

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

        // Core
        action,
        module,

        // Classification
        entityType,

        severity,
        status,

        // User
        performedBy,
        performedByName,

        // Branch
        branchId,
        branchName,

        // Target
        targetId,
        targetName,

        // Audit
        before: cleanDeep(before),
        after: cleanDeep(after),

        // Extra
        details: cleanDeep(details),
        metadata: cleanDeep(metadata),

        // Timestamps
        createdAt:
          serverTimestamp(),

        version: 1

      }
    );

  } catch (err) {

    console.error(
      "Log Error:",
      err
    );

  }

}
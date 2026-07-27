export default function normalizeLog(log) {

  return {

    id: log.id,

    action:
      log.action ||
      log.metadata?.action ||
      "UNKNOWN",

    module:
      log.module ||
      log.metadata?.module ||
      "Unknown",

    status:
      log.status ||
      log.metadata?.status ||
      "success",

    severity:
      log.severity ||
      log.metadata?.severity ||
      "info",

    entityType:
      log.entityType ||
      log.details?.entityType ||
      "",

    performedBy:
      log.performedBy ||
      log.by ||
      "",

    performedByName:
      log.performedByName ||
      log.byName ||
      "Unknown",

    branchId:
      log.branchId ||
      "",

    branchName:
      log.branchName ||
      "",

    targetId:
      log.targetId ||
      log.metadata?.targetId ||
      "",

    targetName:
      log.targetName ||
      log.metadata?.targetName ||
      "",

    before:
      log.before ||
      null,

    after:
      log.after ||
      null,

    details:
      log.details ||
      {},

    metadata:
      log.metadata ||
      {},

    createdAt:
      log.createdAt,

    version:
      log.version || 1,

    raw:
      log

  };

}
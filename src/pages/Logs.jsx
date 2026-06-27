import { useEffect, useMemo, useState } from "react";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

import LogsStats from "../components/logs/LogsStats";
import LogsFilters from "../components/logs/LogsFilters";
import LogsTable from "../components/logs/LogsTable";
import normalizeLog
  from "../utils/logs/normalizeLog";
  import { useTranslate }
  from "../useTranslate";
export default function Logs() {
  const { t } =
  useTranslate();
  const [logs, setLogs] = useState([]);

  const [search, setSearch] =
    useState("");

  const [moduleFilter, setModuleFilter] =
    useState("all");

  const [actionFilter, setActionFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");



  useEffect(() => {

    const q = query(
      collection(db, "logs"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe =
      onSnapshot(q, snapshot => {

        setLogs(
  snapshot.docs.map(doc =>
    normalizeLog({
      id: doc.id,
      ...doc.data()
    })
  )
);

      });

    return unsubscribe;

  }, []);

  const filteredLogs = useMemo(() => {

    return logs.filter(log => {

      const matchesModule =
        moduleFilter === "all"
          ? true
          : log.module === moduleFilter;

      const matchesAction =
        actionFilter === "all"
          ? true
          : log.action === actionFilter;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : log.status === statusFilter;

      const searchText = `
        ${log.action || ""}
        ${log.module || ""}
        ${log.targetName || ""}
        ${log.targetId || ""}
        ${log.performedByName || ""}
        ${log.branchName || ""}
      `.toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      return (
        matchesModule &&
        matchesAction &&
        matchesStatus &&
        matchesSearch
      );

    });

  }, [
  logs,
  search,
  moduleFilter,
  actionFilter,
  statusFilter
]);

  const todayLogs =
    filteredLogs.filter(log => {

      if (!log.createdAt?.seconds)
        return false;

      const logDate = new Date(
        log.createdAt.seconds * 1000
      );

      const today = new Date();

      return (
        logDate.toDateString() ===
        today.toDateString()
      );

    }).length;

  const failedLogs =
    filteredLogs.filter(
      log => log.status === "error"
    ).length;

  

  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}
    >
      <h1
  style={{
    fontSize: "28px",
    fontWeight: "700"
  }}
>
  {t("logs.title")}
</h1>

      <LogsStats
        totalLogs={filteredLogs.length}
        todayLogs={todayLogs}
        failedLogs={failedLogs}
      />

      <LogsFilters
  logs={logs}

  search={search}
  setSearch={setSearch}

  moduleFilter={moduleFilter}
  setModuleFilter={setModuleFilter}

  actionFilter={actionFilter}
  setActionFilter={setActionFilter}

  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
/>

      <LogsTable
        logs={filteredLogs}
      />
    </div>
  );
}
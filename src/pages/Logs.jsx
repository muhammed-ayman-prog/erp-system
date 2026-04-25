import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      const q = query(
        collection(db, "logs"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const snap = await getDocs(q);

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setLogs(data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs =
    filter === "all"
      ? logs
      : logs.filter(l => l.action === filter);

  return (
    <div style={{ padding: "20px" }}>
      <h2>System Logs 📜</h2>

      {/* Filter */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "15px" }}
      >
        <option value="all">All</option>
        <option value="CREATE_USER">Create User</option>
        <option value="DELETE_USER">Delete User</option>
        <option value="UPDATE_USER">Update User</option>
        <option value="TOGGLE_USER_STATUS">Toggle Status</option>
      </select>

      {/* Table */}
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f5f5f7" }}>
            <tr>
              <th style={{ padding: "10px" }}>Action</th>
              <th>User</th>
              <th>Target</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderTop: "1px solid #eee" }}>
                
                <td style={{ padding: "10px" }}>{log.action}</td>

                <td>{log.by}</td>

                <td>{log.targetId || "-"}</td>

                <td>
                  <span style={{
                    color: log.details?.status === "error" ? "red" : "green"
                  }}>
                    {log.details?.status}
                  </span>
                </td>

                <td>
                  {log.createdAt?.seconds
                    ? new Date(log.createdAt.seconds * 1000).toLocaleString()
                    : "-"}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
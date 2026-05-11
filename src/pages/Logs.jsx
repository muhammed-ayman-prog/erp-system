  import {
  useEffect,
  useState,
  useRef,
  useMemo
} from "react";
  import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot
  } from "firebase/firestore";
  import { db } from "../firebase";
  import React from "react";
  import { useNavigate }
  from "react-router-dom";
  export default function Logs() {
    const [lastDoc, setLastDoc] =
    useState(null);

  const [loadingMore, setLoadingMore] =
    useState(false);
    const [logs, setLogs] = useState([]);
    const [expanded, setExpanded] =
    useState(null);
    const [newLogIds, setNewLogIds] =
    useState([]);
    const [search, setSearch] =
    useState("");
    const [moduleFilter, setModuleFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");
    const navigate =
    useNavigate();
    const [filter, setFilter] = useState("all");

    
    const highlightTimeout =
      useRef(null);
    useEffect(() => {

    const q = query(

      collection(db, "logs"),

      orderBy(
        "createdAt",
        "desc"
      ),

      limit(50)

    );

    const unsubscribe =
      onSnapshot(q, (snap) => {

        const data =
          snap.docs.map(doc => ({

            id:
              doc.id,

            ...doc.data()

          }));
        const incomingIds =
          data.map(log => log.id);
        clearTimeout(
          highlightTimeout.current
        );

        highlightTimeout.current =
          setTimeout(() => {

            setNewLogIds([]);

          }, 2000);
        setLogs(prev => {
          const prevIds =
            prev.map(log => log.id);

          const fresh =
            incomingIds.filter(
              id => !prevIds.includes(id)
            );

          setNewLogIds(fresh);
          const oldExtra =
            prev.slice(50);

          return [
            ...data,
            ...oldExtra
          ];

        });
        setLastDoc(
          snap.docs[
            snap.docs.length - 1
          ]
        );

      });

    return () => {

  unsubscribe();

  clearTimeout(
    highlightTimeout.current
  );

};

  }, []);

  const formatTimeAgo = (
    timestamp
  ) => {

    if (!timestamp?.seconds)
      return "-";

    const now =
      Date.now();

    const time =
      timestamp.seconds * 1000;

    const diff =
      Math.floor(
        (now - time) / 1000
      );

    if (diff < 60)
      return "Just now";

    if (diff < 3600)
      return `${Math.floor(diff / 60)} min ago`;

    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hr ago`;

    return `${Math.floor(diff / 86400)} d ago`;

  }; 
  const actionIcons = {

    CREATE_INVOICE:
      "🧾",

    CREATE_USER:
      "👤",

    UPDATE_USER:
      "✏️",

    DELETE_USER:
      "🗑️",

    TOGGLE_USER_STATUS:
      "🔒",
    ADD_EXPENSE:
      "💸",

    UPDATE_EXPENSE:
      "✏️",

    DELETE_EXPENSE:
      "🗑️",

    ADD_LOAN:
      "🧾",

    ADD_BONUS:
      "🎁",

    
      

  }; 
  const actionLabels = {
  CREATE_INVOICE: "إنشاء فاتورة",

  CREATE_USER: "إنشاء مستخدم",

  UPDATE_USER: "تعديل مستخدم",

  DELETE_USER: "حذف مستخدم",

  TOGGLE_USER_STATUS:
    "تغيير حالة المستخدم",

  ADD_EXPENSE:
    "إضافة مصروف",

  UPDATE_EXPENSE:
    "تعديل مصروف",

  DELETE_EXPENSE:
    "حذف مصروف",

  ADD_LOAN:
    "إضافة سلفة",
  UPDATE_LOAN:
  "تعديل سلفة",

  ADD_BONUS:
    "إضافة حافز",

  UPDATE_BONUS:
  "تعديل حافز",
};
  const severityColors = {

    success:
      "#16a34a",

    info:
      "#2563eb",

    warning:
      "#d97706",

    danger:
      "#dc2626"

  };

  const statusColors = {

    success:
      "#16a34a",

    error:
      "#dc2626"

  };
  const filteredLogs = useMemo(() => {

  return logs.filter(log => {

    const matchesFilter =
      filter === "all"
        ? true
        : log.action === filter;

    const matchesModule =
      moduleFilter === "all"
        ? true
        : log.module === moduleFilter;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : log.status === statusFilter;

    const searchText =
  `
    ${log.action}

    ${actionLabels[log.action] || ""}

    ${log.byName}
    ${log.module}
    ${log.targetName}
    ${log.targetId}

    ${log.details?.invoiceNumber}
    ${log.details?.customerName}

    ${log.details?.employee}
    ${log.details?.category}
    ${log.details?.note}
    ${log.details?.amount}
  `
  .toLowerCase();

    const matchesSearch =
      searchText.includes(
        search.toLowerCase()
      );

    return (
      matchesFilter &&
      matchesModule &&
      matchesStatus &&
      matchesSearch
    );

  });

}, [
  logs,
  filter,
  moduleFilter,
  statusFilter,
  search
]);
    
  const totalLogs =
    filteredLogs.length;

  const errorLogs =
    filteredLogs.filter(
      log => log.status === "error"
    ).length;

  const salesLogs =
    filteredLogs.filter(
      log => log.module === "Sales"
    ).length;

  const userLogs =
    filteredLogs.filter(
      log => log.module === "Users"
    ).length;
  const expenseLogs =
  filteredLogs.filter(
    log => log.module === "Expenses"
  ).length;
  const exportCSV = () => {

    const rows = filteredLogs.map(log => ({

      Action:
      actionLabels[log.action] || log.action,

      User:
        log.byName,

      Module:
        log.module,

      Target:
        log.targetName ||
        log.targetId,

      Status:
        log.status,

      Severity:
        log.severity,

      Customer:
        log.details?.customerName || "",

      Invoice:
        log.details?.invoiceNumber || "",

      Total:
        log.details?.total || "",
      
      Category:
        log.details?.category || "",

      Employee:
        log.details?.employee || "",

      Amount:
        log.details?.amount || "",

      Note:
        log.details?.note || "",

      Time:
        log.createdAt?.seconds
          ? new Date(
              log.createdAt.seconds * 1000
            ).toLocaleString()
          : ""

    }));
    if (rows.length === 0) {
      alert("No logs to export");
      return;
    }
    const headers =
      Object.keys(rows[0] || {});

    const csvContent = [

      headers.join(","),

      ...rows.map(row =>
        headers.map(header =>
          `"${row[header] ?? ""}"`
        ).join(",")
      )

    ].join("\n");

    const blob = new Blob(
      [csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      `logs-${Date.now()}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  };
  const loadMoreLogs = async () => {

    if (!lastDoc)
      return;

    try {

      setLoadingMore(true);

      const {
        startAfter,
        getDocs
      } = await import(
        "firebase/firestore"
      );

      const nextQuery = query(

        collection(db, "logs"),

        orderBy(
          "createdAt",
          "desc"
        ),

        startAfter(lastDoc),

        limit(50)

      );

      const snap =
        await getDocs(
          nextQuery
        );

      const newLogs =
        snap.docs.map(doc => ({

          id:
            doc.id,

          ...doc.data()

        }));

      setLogs(prev => {
        const existingIds =
          prev.map(l => l.id);

        const uniqueNew =
          newLogs.filter(
            l => !existingIds.includes(l.id)
          );

        return [
          ...prev,
          ...uniqueNew
        ];
      });

      setLastDoc(
        snap.docs[
          snap.docs.length - 1
        ]
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingMore(false);

    }

  };
  return (
      <div style={{
    padding: "20px",
    position: "relative"
  }}>
        
        <div style={{

    position: "sticky",

    top: 0,

    zIndex: 20,

    background: "#f8fafc",

    paddingBottom: "16px",

    marginBottom: "10px"

  }}>
        <h2>System Logs 📜</h2>

        <div style={{

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",

    gap: "12px",

    margin:
      "20px 0"

  }}>

    <div style={{

    background:
      "#fff",

    padding:
      "18px",

    borderRadius:
      "18px",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.04)",

    border:
      "1px solid #f1f5f9"

  }}>
      <h3 style={{

    fontSize:
      "28px",

    marginBottom:
      "6px"

  }}>
        {totalLogs}
      </h3>

      <p style={{

    color:
      "#64748b",

    fontSize:
      "14px"

  }}>
        Total Logs
      </p>
    </div>

    <div style={{

    background:
      "#fff",

    padding:
      "18px",

    borderRadius:
      "18px",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.04)",

    border:
      "1px solid #f1f5f9"

  }}>
      <h3 style={{

    fontSize:
      "28px",

    marginBottom:
      "6px"

  }}>
        {errorLogs}
      </h3>

      <p style={{

    color:
      "#64748b",

    fontSize:
      "14px"

  }}>
        Errors
      </p>
    </div>

    <div style={{

    background:
      "#fff",

    padding:
      "18px",

    borderRadius:
      "18px",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.04)",

    border:
      "1px solid #f1f5f9"

  }}>
      <h3 style={{

    fontSize:
      "28px",

    marginBottom:
      "6px"

  }}>
        {salesLogs}
      </h3>

      <p style={{

    color:
      "#64748b",

    fontSize:
      "14px"

  }}>
        Sales Logs
      </p>
    </div>

    <div style={{

    background:
      "#fff",

    padding:
      "18px",

    borderRadius:
      "18px",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.04)",

    border:
      "1px solid #f1f5f9"

  }}>
      <h3 style={{

    fontSize:
      "28px",

    marginBottom:
      "6px"

  }}>
        {userLogs}
      </h3>

      <p style={{

    color:
      "#64748b",

    fontSize:
      "14px"

  }}>
        User Logs
      </p>
    </div>
    <div style={{

  background:
    "#fff",

  padding:
    "18px",

  borderRadius:
    "18px",

  boxShadow:
    "0 4px 12px rgba(0,0,0,0.04)",

  border:
    "1px solid #f1f5f9"

}}>
  <h3 style={{

    fontSize:
      "28px",

    marginBottom:
      "6px"

  }}>
    {expenseLogs}
  </h3>

  <p style={{

    color:
      "#64748b",

    fontSize:
      "14px"

  }}>
    Expenses Logs
  </p>
</div>

  </div>
  <div style={{

    display: "flex",

    gap: "10px",

    flexWrap: "wrap",

    alignItems: "center",

    marginBottom: "15px"

  }}>
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          
        >
          <option value="all">All Actions</option>

          <option value="CREATE_USER">
            Create User
          </option>

          <option value="UPDATE_USER">
            Update User
          </option>

          <option value="DELETE_USER">
            Delete User
          </option>

          <option value="TOGGLE_USER_STATUS">
            Toggle User Status
          </option>

          <option value="CREATE_INVOICE">
            Create Invoice
          </option>
          <option value="ADD_EXPENSE">
            Add Expense
          </option>

          <option value="UPDATE_EXPENSE">
            Update Expense
          </option>

          <option value="DELETE_EXPENSE">
            Delete Expense
          </option>

          <option value="ADD_LOAN">
            Add Loan
          </option>

          <option value="ADD_BONUS">
            Add Bonus
          </option>
          <option value="UPDATE_LOAN">
            Update Loan
          </option>

          <option value="UPDATE_BONUS">
            Update Bonus
          </option>
        </select>
        <select

    value={moduleFilter}

    onChange={(e) =>
      setModuleFilter(
        e.target.value
      )
    }
  >

    <option value="all">
      All Modules
    </option>

    <option value="Users">
      Users
    </option>

    <option value="Sales">
      Sales
    </option>
    <option value="Expenses">
      Expenses
    </option>

  </select>
  <select

    value={statusFilter}

    onChange={(e) =>
      setStatusFilter(
        e.target.value
      )
    }
  >

    <option value="all">
      All Status
    </option>

    <option value="success">
      Success
    </option>

    <option value="error">
      Error
    </option>

  </select>
        <input
        onFocus={(e) => {

    e.currentTarget.style.border =
      "1px solid #2563eb";

  }}

  onBlur={(e) => {

    e.currentTarget.style.border =
      "1px solid #e5e7eb";

  }}
    type="text"

    placeholder="
      Search logs...
    "

    value={search}

    onChange={(e) =>
      setSearch(e.target.value)
    }

    style={{

      width: "260px",

      padding: "10px 14px",

      borderRadius: "12px",

      border:
        "1px solid #e5e7eb",

      background:
        "#fff",

      boxShadow:
        "0 2px 6px rgba(0,0,0,0.03)",
      outline: "none",
      transition:
      "all 0.2s ease",

    }}
  />
  <button
  onMouseEnter={(e) => {

    e.currentTarget.style.transform =
      "translateY(-1px)";

  }}

  onMouseLeave={(e) => {

    e.currentTarget.style.transform =
      "translateY(0px)";

  }}
    onClick={exportCSV}

    style={{


      padding:
        "10px 16px",

      borderRadius:
        "12px",
      
      background:
        "#fff",

      boxShadow:
        "0 2px 8px rgba(0,0,0,0.05)",

      border:
        "1px solid #e2e8f0",

      fontWeight:
        "600",

      cursor:
        "pointer",
      transition:
      "all 0.2s ease",

    }}
  >

    Export CSV

  </button>
  </div>
  </div>

        {/* Table */}
        <div style={{
          maxHeight: "75vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "16px",
          overflowX: "auto",
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
        }}>
          <table style={{

            width: "100%",

            borderCollapse:
              "collapse",

            textAlign:
              "center",

            verticalAlign:
              "middle"

          }}>
            <thead style={{
              position:
                "sticky",

              top:
                0,

              zIndex:
                5,
              background:
                "#f8fafc",

              height:
                "58px"

            }}>
              <tr>
                
              
                <th style={{

                  padding:
                    "14px 10px",

                  fontSize:
                    "14px",

                  fontWeight:
                    "700",

                  color:
                    "#334155"
                    

                }}>
                  Action
                </th>
                <th style={{

    padding:
      "14px 10px",

    fontSize:
      "14px",

    fontWeight:
      "700",

    color:
      "#334155"

  }}>
    User
  </th>

  <th style={{

    padding:
      "14px 10px",

    fontSize:
      "14px",

    fontWeight:
      "700",

    color:
      "#334155"

  }}>
    Module
  </th>

  <th style={{

    padding:
      "14px 10px",

    fontSize:
      "14px",

    fontWeight:
      "700",

    color:
      "#334155"

  }}>
    Target
  </th>

  <th style={{

    padding:
      "14px 10px",

    fontSize:
      "14px",

    fontWeight:
      "700",

    color:
      "#334155"

  }}>
    Status
  </th>

  <th style={{

    padding:
      "14px 10px",

    fontSize:
      "14px",

    fontWeight:
      "700",

    color:
      "#334155"

  }}>
    Severity
  </th>

  <th style={{

    padding:
      "14px 10px",

    fontSize:
      "14px",

    fontWeight:
      "700",

    color:
      "#334155"

  }}>
    Time
  </th>
              </tr>
            </thead>

            <tbody>
    {filteredLogs.length === 0 && (

    <tr>
      
      <td
        colSpan="7"

        style={{

          textAlign:
            "center",

          padding:
            "40px",

          color:
            "#64748b",

          fontSize:
            "15px"

        }}
      >

        No logs found 👀

      </td>

    </tr>

  )}
    {filteredLogs.map(log => (
    <React.Fragment key={log.id}>

      <tr
    

    onClick={() =>
      setExpanded(
        expanded === log.id
          ? null
          : log.id
      )
    }

    style={{

    cursor: "pointer",

    borderTop:
    "1px solid #f1f5f9",

    height:
      "64px",

    background:
      newLogIds.includes(log.id)
        ? "#fef9c3"
        : "#fff",

    transition:
    "all 0.2s ease",
    transform:
    expanded === log.id
      ? "scale(1.002)"
      : "scale(1)",
    boxShadow:
    expanded === log.id
      ? "0 2px 10px rgba(0,0,0,0.04)"
      : "none",
    borderLeft:

      expanded === log.id
        ? "3px solid #2563eb"
        : "3px solid transparent",

  }}
  >
        <td style={{
          padding: "10px",
          fontSize:
            "13px",

          letterSpacing:
            "0.3px",
          fontWeight: "600"
        }}>
          <span>

    {actionIcons[
      log.action
    ] || "📌"}

    {" "}

    {actionLabels[log.action] || log.action}

  </span>
        </td>

        <td>
          {log.byName || "-"}
        </td>

        <td>
          {log.module || "-"}
        </td>

        <td>

    {log.action ===
      "CREATE_INVOICE" ? (

      <span

        onClick={(e) => {

          e.stopPropagation();

          navigate(
            `/invoices/${log.targetId}`
          );

        }}

        style={{

          color:
            "#2563eb",

          cursor:
            "pointer",

          fontWeight:
            "600"

        }}
      >

        {log.targetName ||
          log.targetId}

      </span>

    ) : log.module ===
        "Users" ? (

      <span

        onClick={(e) => {

          e.stopPropagation();

          navigate(
            "/users"
          );

        }}

        style={{

          color:
            "#7c3aed",

          cursor:
            "pointer",

          fontWeight:
            "600"

        }}
      >

        {log.targetName ||
          log.targetId}

      </span>

    ) : (

      log.targetName ||
      log.targetId ||
      "-"

    )}

  </td>

        <td>

          <span style={{
            display:
            "inline-flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          minWidth:
            "72px",
            padding:
              "4px 10px",

            borderRadius:
              "999px",

            fontSize: 12,

            fontWeight: "600",

            color:
              "#fff",

            background:
              statusColors[
                log.status
              ] || "#64748b"

          }}>
            {log.status || "-"}
          </span>

        </td>

        <td>

          <span style={{
            display:
              "inline-flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            minWidth:
              "72px",
            padding:
              "4px 10px",

            borderRadius:
              "999px",

            fontSize: 12,

            fontWeight: "600",

            color:
              "#fff",

            background:
              severityColors[
                log.severity
              ] || "#64748b"

          }}>
            {log.severity || "-"}
          </span>

        </td>

        <td style={{
          fontSize: 13
        }}>

          <span
    title={
      log.createdAt?.seconds
        ? new Date(
            log.createdAt.seconds * 1000
          ).toLocaleString()
        : "-"
    }
  >

    {formatTimeAgo(
      log.createdAt
    )}

  </span>

        </td>

      </tr>
      {expanded === log.id && (

    <tr>

      <td
        colSpan="7"

        style={{
          background:
    "#f8fafc",

  borderLeft:
    "4px solid #2563eb",
          padding: "16px"
        }}
      >

        <div style={{
          display: "grid",
          gap: "10px"
        }}>

          {log.details?.invoiceNumber && (
            <div>
              <b>Invoice:</b>
              {" "}
              {log.details.invoiceNumber}
            </div>
          )}

          {log.details?.customerName && (
            <div>
              <b>Customer:</b>
              {" "}
              {log.details.customerName}
            </div>
          )}

          {log.details?.paymentMethod && (
            <div>
              <b>Payment:</b>
              {" "}
              {log.details.paymentMethod}
            </div>
          )}

          {log.details?.total && (
            <div>
              <b>Total:</b>
              {" "}
              {log.details.total}
            </div>
          )}
          {log.details?.category && (
            <div>
              <b>Category:</b>{" "}
              {log.details.category}
            </div>
          )}

          {log.details?.employee && (
            <div>
              <b>Employee:</b>{" "}
              {log.details.employee}
            </div>
          )}
          <div>
            <b>Action Type:</b>{" "}
            {actionLabels[log.action] || log.action}
          </div>
          

          {log.details?.amount && (
            <div>
              <b>Amount:</b>{" "}
              {log.details.amount}
            </div>
          )}

          {log.details?.note && (
            <div>
              <b>Note:</b>{" "}
              {log.details.note}
            </div>
          )}

          {log.details?.error && (
            <div style={{
              color: "#dc2626",
              fontWeight: "600"
            }}>
              <b>Error:</b>
              {" "}
              {log.details.error}
            </div>
          )}

          {log.details?.topItems?.length > 0 && (

            <div>

              <b>Items:</b>

              <ul style={{
                marginTop: 8
              }}>

                {log.details.topItems.map(
                  (item, i) => (

                  <li key={i}>
                    {item.name}
                    {" — "}
                    Qty:
                    {" "}
                    {item.qty}
                  </li>

                ))}

              </ul>

            </div>

          )}
        <details>

    <summary style={{

      cursor:
        "pointer",

      fontWeight:
        "600"

    }}>

      Raw JSON

    </summary>

    <pre style={{

      background:
        "#0f172a",

      color:
        "#e2e8f0",

      padding:
        "12px",

      borderRadius:
        "12px",

      overflow:
        "auto",

      fontSize:
        "12px",

      marginTop:
        "10px"

    }}>

      {JSON.stringify(
        log,
        null,
        2
      )}

    </pre>

  </details>
        </div>

      </td>

    </tr>

  )}
      
      
    </React.Fragment>
    ))}

  </tbody>
          </table>
        </div>
        <div style={{
    marginTop: "20px",
    textAlign: "center"
  }}>

    <button
    onMouseEnter={(e) => {

    e.currentTarget.style.transform =
      "translateY(-1px)";

  }}

  onMouseLeave={(e) => {

    e.currentTarget.style.transform =
      "translateY(0px)";

  }}
      onClick={loadMoreLogs}

      disabled={loadingMore}

      style={{

        padding:
          "10px 18px",

        borderRadius:
          "12px",
        background:
          "#fff",

        boxShadow:
          "0 2px 8px rgba(0,0,0,0.05)",

        border:
          "1px solid #e2e8f0",

        fontWeight:
          "600",
        cursor:
          "pointer",
        transition:
        "all 0.2s ease",

      }}
    >

      {loadingMore
        ? "Loading..."
        : "Load More"}

    </button>

  </div>
      </div>
    );
  }
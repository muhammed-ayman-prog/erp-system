export default function LogsSection({

  t,
  COLORS,
  productsAccordionOpen,
  search,
  setSearch,

  filterBranch,
  setFilterBranch,

  sortedBranches,
  getBranchName,

  activeLogTab,
  setActiveLogTab,

  filteredActivities,

  setSelectedActivity,

  productMap,

  productLogs,

  logSearch,
  setLogSearch,

  logFilter,
  setLogFilter

}) {

  return (

    <>

      {!productsAccordionOpen && (
  <>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "15px",
            marginTop: "25px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9" // 👈 ضيف دي
          }}>
            <input
              type="text"
              placeholder={t("common.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "15px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",

              }}
              onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px #3b82f6"}
              onBlur={(e) => e.target.style.boxShadow = "none"}
            />
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            >
              <option value="">{t("branches.all")}</option>
              {sortedBranches.map(b => (
                <option key={b.id} value={b.id}>
                  {getBranchName(b.id)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: "30px" }}>
            <h3 style={{
              marginTop: "30px",
              fontSize: "18px",
              fontWeight: "700",
            }}>
              {t("operations.activityLog")} 📊
            </h3>
            <div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "25px",
    marginBottom: "20px"
  }}
>

  <button
    onClick={() =>
      setActiveLogTab("activity")
    }

    style={{
      padding: "12px 18px",
      borderRadius: "12px",
      border: "none",

      background:
        activeLogTab === "activity"
          ? "#3b82f6"
          : "#f3f4f6",

      color:
        activeLogTab === "activity"
          ? "#fff"
          : "#111827",

      fontWeight: "700",

      cursor: "pointer"
    }}
  >
    📊 Activity Logs
  </button>

  <button
    onClick={() =>
      setActiveLogTab("products")
    }

    style={{
      padding: "12px 18px",
      borderRadius: "12px",
      border: "none",

      background:
        activeLogTab === "products"
          ? "#8b5cf6"
          : "#f3f4f6",

      color:
        activeLogTab === "products"
          ? "#fff"
          : "#111827",

      fontWeight: "700",

      cursor: "pointer"
    }}
  >
    📦 Product Logs
  </button>

</div>

            {activeLogTab === "activity" && (
            <>

            {filteredActivities.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedActivity(item)}
                style={{
                  background: "#fff",
                  padding: "15px",
                  border: "1px solid #f1f5f9",
                  marginBottom: "10px",
                  borderRadius: "12px",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                  transition: "0.2s",
                  cursor: "pointer",
                }}
              >
                <p style={{ marginBottom: "5px", fontWeight: "600" }}>
                  {item.actionType === "transfer"
                    ? "🔄 " + t("operations.transfer")
                    : "⚖️ " + t("operations.adjust")}
                </p>

                {/* 🔥 ADD HERE */}
                {item.reversed && (
                  <span style={{
                    color: COLORS.danger,
                    fontWeight: "700",
                    fontSize: "12px",
                    background: "#fee2e2",
                    padding: "3px 8px",
                    borderRadius: "8px",
                    marginLeft: "8px"
                  }}>
                    REVERSED
                  </span>
                )}

                <p>
                  <strong>{t("operations.product")}:</strong> {productMap[item.productId] || item.productId}
                </p>

                {item.actionType === "transfer" && (
                  <>
                    <p>
                      {t("operations.fromBranch")}: {getBranchName(item.fromBranch)}
                    </p>

                    <p>
                      {t("operations.toBranch")}: {getBranchName(item.toBranch)}
                    </p>
                  </>
                )}

                {item.actionType === "adjust" && (
                  <>
                    <p>
                      {t("branches.single")}: {getBranchName(item.branchId)}
                    </p>
                    <p>
                      <strong>{t("operations.type")}:</strong>{" "}
                      {(item.adjustType || item.type) === "increase"
                        ? `${t("operations.increase")} ➕`
                        : `${t("operations.decrease")} ➖`}
                    </p>
                    {item.reason && <p><strong>{t("operations.reason")}:</strong> {item.reason}</p>}
                  </>
                )}

                <p style={{ fontWeight: "700", color: "#3b82f6" }}>
                  {t("common.qty")}: {item.qty}
                </p>

                <p><strong>{t("users.title")}:</strong> {item.user}</p>

                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                  {item.createdAt?.toDate
                    ? new Date(item.createdAt.toDate()).toLocaleString()
                    : new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {filteredActivities.length === 0 && (
              <p style={{ textAlign: "center", marginTop: "20px" }}>
                {t("operations.noResults")} ❌
              </p>
            )}
            </>
)}
{activeLogTab === "products" && (
<>

<input
  type="text"
  placeholder="Search logs..."

  value={logSearch}

  onChange={(e) =>
    setLogSearch(e.target.value)
  }

  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "10px"
  }}
/>

<select
  value={logFilter}

  onChange={(e) =>
    setLogFilter(e.target.value)
  }

  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "20px"
  }}
>
  <option value="">
    All Actions
  </option>

  <option value="create">
    Create
  </option>

  <option value="archive">
    Archive
  </option>
  <option value="restore">
  Restore
</option>
<option value="edit">
  Edit
</option>

</select>

{productLogs
  .filter(log => {

    const matchesSearch =
      (
        log.productName || ""
      )
        .toLowerCase()
        .includes(
          logSearch.toLowerCase()
        );

    const matchesFilter =
      !logFilter ||
      log.action === logFilter;

    return (
      matchesSearch &&
      matchesFilter
    );

  })

  .map(log => (

    <div
      key={log.id}

      style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid #f1f5f9",
        marginBottom: "10px",
        boxShadow:
          "0 5px 15px rgba(0,0,0,0.05)"
      }}
    >

      <p
        style={{
          fontWeight: "700",
          marginBottom: "5px"
        }}
      >
        {log.action === "create"
          ? "➕ Product Created"

          : log.action === "archive"
          ? "📦 Product Archived"

          : log.action === "restore"
? "♻️ Product Restored"

: "✏️ Product Edited"}
      </p>

      <p>
        <strong>Product:</strong>
        {" "}
        {log.productName}
      </p>

      <p>
        <strong>Type:</strong>
        {" "}
        {log.type}
      </p>

      <p>
        <strong>User:</strong>
        {" "}
        {log.user}
      </p>

      <p
        style={{
          fontSize: "13px",
          color: "#6b7280"
        }}
      >
        {log.createdAt?.toDate
          ? new Date(
              log.createdAt.toDate()
            ).toLocaleString()
          : "No Date"}
      </p>

    </div>

))}

</>
)}
          </div>
          </>
)}

    </>

  );

}
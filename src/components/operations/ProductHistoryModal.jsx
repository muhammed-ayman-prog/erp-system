export default function ProductHistoryModal({

  selectedProductHistory,

  setSelectedProductHistory,

  productHistory

}) {

  if (!selectedProductHistory)
    return null;

  return (

    <div
      onClick={() =>
        setSelectedProductHistory(
          null
        )
      }

      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,0.4)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        zIndex: 9999
      }}
    >

      <div
        onClick={(e) =>
          e.stopPropagation()
        }

        style={{
          background: "#fff",
          width: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
          borderRadius: "20px",
          padding: "25px"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",

            alignItems: "center",

            marginBottom: "20px"
          }}
        >

          <h3>
            🕘 Product History
          </h3>

          <button
            onClick={() =>
              setSelectedProductHistory(
                null
              )
            }

            style={{
              border: "none",
              background:
                "transparent",

              fontSize: "20px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>

        </div>

        {productHistory.map(
  (item, index) => {

    const actionLabel =

      item.action === "create"
        ? "➕ Product Created"

      : item.action === "edit"
        ? "✏️ Product Edited"

      : item.action === "archive"
        ? "📦 Product Archived"

      : item.action === "restore"
        ? "♻️ Product Restored"

      : item.actionType === "transfer"
        ? "🔄 Transfer"

      : "⚖️ Stock Adjustment";


    const actionColor =

      item.action === "create"
        ? "#10b981"

      : item.action === "edit"
        ? "#f59e0b"

      : item.action === "archive"
        ? "#ef4444"

      : item.action === "restore"
        ? "#06b6d4"

      : item.actionType === "transfer"
        ? "#6366f1"

      : "#8b5cf6";


    return (

      <div
        key={index}

        style={{
          position: "relative",
          paddingLeft: "25px",
          marginBottom: "25px"
        }}
      >

        {/* Timeline Line */}

        <div
          style={{
            position: "absolute",
            left: "7px",
            top: "20px",
            bottom: "-25px",
            width: "2px",
            background: "#e5e7eb"
          }}
        />

        {/* Timeline Dot */}

        <div
          style={{
            position: "absolute",
            left: 0,
            top: "6px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: actionColor
          }}
        />

        {/* Card */}

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "14px",
            padding: "15px",
            border:
              `1px solid ${actionColor}20`
          }}
        >

          <p
            style={{
              fontWeight: "700",
              color: actionColor,
              marginBottom: "8px"
            }}
          >
            {actionLabel}
          </p>

          <p
            style={{
              marginBottom: "5px"
            }}
          >
            👤 {item.user}
          </p>

          {item.qty && (

            <p
              style={{
                marginBottom: "5px"
              }}
            >
              📦 Qty:
              {" "}
              {item.qty}
            </p>

          )}

          {item.fromBranch && (
            <p>
              📤 From:
              {" "}
              {item.fromBranch}
            </p>
          )}

          {item.toBranch && (
            <p>
              📥 To:
              {" "}
              {item.toBranch}
            </p>
          )}

          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "10px"
            }}
          >
            🕒
            {" "}
            {item.createdAt?.toDate

              ? new Date(
                  item.createdAt.toDate()
                ).toLocaleString()

              : new Date(
                  item.createdAt
                ).toLocaleString()}
          </p>

        </div>

      </div>

    );

  }
)}

      </div>

    </div>

  );

}
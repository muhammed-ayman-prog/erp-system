import { motion } from "framer-motion";
import { card } from "../styles";
import { memo } from "react";
import { useTranslate } from "../../../useTranslate";
function ActivityFeed({ data }) {
  const { t } = useTranslate();
  return (
    <motion.div style={{
  ...card,
  minHeight: 350,
  maxHeight: 500,
  overflowY: "auto"
}}>
      <h4 style={{

  marginBottom: 14,

  position: "sticky",

  top: 0,

  background:
    "rgba(255,255,255,0.9)",

  backdropFilter:
    "blur(6px)",

  zIndex: 10,

  paddingBottom: 10,

  borderBottom:
    "1px solid #f3f4f6"
}}>
  {t("dashboard.recentActivity")}
</h4>
      {data.length === 0 && (

        <div style={{

          textAlign: "center",

          color: "#9ca3af",

          padding: "30px 0",

          fontSize: 14

        }}>

          📭 {t("dashboard.noActivity")}

        </div>

      )}
      {data.map((item, i) => {
        const time = item.date?.seconds
          ? new Date(item.date.seconds * 1000).toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit"
})
          : "";

        return (
          <div key={i} 
          style={{

            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "flex-start",

            gap: 10,

            padding: "10px 6px",

            borderBottom:
              "1px solid #f3f4f6",

            fontSize: 14,

            borderRadius: 8,

            cursor: "pointer",

            transition: "0.2s"
          }}
        onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
            <div>
              <span style={{
  display: "flex",
  alignItems: "center",
  gap: 5
}}>

  {

    item.type === "sale"

      ? "🟢"

      : item.type ===
        "partialReturn"

      ? "🟠"

      : item.type ===
        "return"

      ? "🔴"

      : "⚪"

  }

  {

    item.type === "sale"

      ? t("activity.sale")

      : item.type ===
        "partialReturn"

      ? t("activity.partialReturn")

      : item.type ===
        "return"

      ? t("activity.return")

      : ""

  }

</span> <div style={{

  fontSize: 12,

  color: "#6b7280",

  marginTop: 2

}}>

  {item.branch}

</div>
              <div style={{ fontSize: 11, color: "#888" }}>{time}</div>
            </div>

            <strong style={{

              whiteSpace: "nowrap",

              fontWeight: "700",

              fontSize: 13,

              color:

                item.type === "sale"

                  ? "#16a34a"

                  : item.type ===
                    "partialReturn"

                  ? "#f59e0b"

                  : "#dc2626"

            }}>

              {(item.amount || 0)
                .toLocaleString()}

              {" "}{t("common.currency")}

            </strong>
          </div>
        );
      })}
    </motion.div>
  );
}
export default memo(
  ActivityFeed
);
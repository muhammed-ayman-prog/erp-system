import { motion } from "framer-motion";
import { card } from "./styles";
function ActivityFeed({ data }) {
  return (
    <motion.div style={{
  ...card,
  minHeight: 350,
  maxHeight: 500,
  overflowY: "auto"
}}>
      <h4 style={{ marginBottom: 10 }}>Recent Activity</h4>

      {data.map((item, i) => {
        const time = item.date?.seconds
          ? new Date(item.date.seconds * 1000).toLocaleTimeString()
          : "";

        return (
          <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 6px",
          fontSize: 14,
          borderRadius: 8,
          cursor: "pointer",
          transition: "0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
            <span>
              {item.type === "sale" ? "🟢 Sale" : "⚪"} {item.branch}
              <div style={{ fontSize: 11, color: "#888" }}>{time}</div>
            </span>

            <strong>
              {(item.amount || 0).toLocaleString()} EGP
            </strong>
          </div>
        );
      })}
    </motion.div>
  );
}
export default ActivityFeed;
import { motion } from "framer-motion";
import { card } from "./styles";

function StatCard({ icon, title, value }) {
  return (
    <motion.div
      style={card}
      whileHover={{ scale: 1.04, y: -4 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{title}</div>
        <div style={{ opacity: 0.7 }}>{icon}</div>
      </div>

      <div style={{
        fontSize: 26,
        fontWeight: "bold",
        marginTop: 8
      }}>
        <motion.span
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {typeof value === "number"
    ? value.toLocaleString(undefined, {
  maximumFractionDigits: 1
})
    : value || "-"}
</motion.span>
      </div>
    </motion.div>
  );
}
export default StatCard;
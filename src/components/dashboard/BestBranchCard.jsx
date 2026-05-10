import { motion } from "framer-motion";
import { card } from "./styles";
function BestBranchCard({ branch, percent }) {
  if (!branch) return null;

  return (
    <motion.div style={{
  ...card,
  border: "2px solid #22c55e" // 👈 إضافة
}}  whileHover={{ scale: 1.03  }}>
      <div style={{ marginBottom: 10, fontSize: 13, color: "#6b7280" }}>
        🏆 Best Branch
      </div>

      <div style={{ fontSize: 20, fontWeight: "bold" }}>
        {branch.name}
      </div>

      <div style={{ marginTop: 5, fontSize: 14 }}>
        {branch.total.toLocaleString()} EGP
      </div>

      {/* Progress Bar */}
      <div style={{
        height: 8,
        background: "#e5e7eb",
        borderRadius: 10,
        marginTop: 12,
        overflow: "hidden"
      }}>
        <div style={{
          width: `${percent}%`,
          height: "100%",
          background: "#22c55e",
          transition: "0.4s"
        }} />
      </div>

      <div style={{
        marginTop: 6,
        fontSize: 12,
        color: "#6b7280"
      }}>
        {percent.toFixed(1)}% of total sales
      </div>
    </motion.div>
  );
}
export default BestBranchCard;
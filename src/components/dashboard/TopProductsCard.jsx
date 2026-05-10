import { motion } from "framer-motion";
import { card } from "./styles";
function TopProductsCard({ products, totalSales }) {
  if (!products || products.length === 0) return null;
  const totalProfit = products.reduce(
  (sum, p) => sum + p.total,
  0
);
  return (
    <motion.div style={card} whileHover={{ scale: 1.02 }}>
      <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
  🔥 Most Profitable Products
</h4>

      {products.map((p, i) => {
        const percent =
          totalProfit > 0
            ? Math.min((p.total / totalProfit) * 100, 100)
            : 0;

        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14
            }}>
              <span>{p.name}</span>
              <strong>{p.total.toLocaleString()} EGP</strong>
            </div>

            {/* Progress */}
            <div style={{
              height: 6,
              background: "#e5e7eb",
              borderRadius: 10,
              marginTop: 4,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percent}%`,
                height: "100%",
                background: "#3b82f6"
              }} />
            </div>

            <div style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 2
            }}>
              {percent.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
export default TopProductsCard;
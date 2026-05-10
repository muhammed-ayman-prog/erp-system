import { motion } from "framer-motion";
import { card } from "./styles";
function TopOilsCard({ oils }) {
  if (!oils || oils.length === 0) return null;

  const totalML = oils.reduce(
    (sum, o) => sum + o.total,
    0
  );

  return (
    <motion.div style={card} whileHover={{ scale: 1.02 }}>
      <h4 style={{
        display: "flex",
        alignItems: "center",
        gap: 6
      }}>
        🛢 Most Consumed Oils
      </h4>

      {oils.map((oil, i) => {

        const percent =
          totalML > 0
            ? (oil.total / totalML) * 100
            : 0;

        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14
            }}>
              <span>{oil.name}</span>

              <strong>
                {oil.total.toLocaleString()} ML
              </strong>
            </div>

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
                background: "#f59e0b"
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
export default TopOilsCard;
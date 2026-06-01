import { motion } from "framer-motion";
import { card } from "../styles";
import { useTranslate } from "../../../useTranslate";
function ProfitableOilsCard({ oils }) {
  const { t } = useTranslate();
  if (!oils || oils.length === 0) return null;

  const totalProfit = oils.reduce(
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
        💰 {t("dashboard.mostProfitableOils")}
      </h4>

      {oils.map((oil, i) => {

        const percent =
          totalProfit > 0
            ? (oil.total / totalProfit) * 100
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
                {oil.total.toLocaleString()} EGP
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
export default ProfitableOilsCard;
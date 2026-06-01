import { motion } from "framer-motion";
import { card } from "../styles";
import { useTranslate } from "../../../useTranslate";
function BestBranchCard({
  branch,
  percent = 0
}) {
  const { t } = useTranslate();

  if (!branch) return null;

  return (

    <motion.div
      style={{
        ...card,
        border:
          "2px solid #22c55e"
      }}

      whileHover={{
        scale: 1.03
      }}
    >

      <div style={{
        marginBottom: 10,
        fontSize: 13,
        color: "#6b7280"
      }}>
        🏆 {t("dashboard.bestBranch")}
      </div>

      <div style={{
        fontSize: 18,
        lineHeight: 1.3,
        fontWeight: "bold"
      }}>
        {branch.name}
      </div>

      <div style={{
        marginTop: 5,
        fontSize: 14
      }}>
        {(branch.total || 0)
          .toLocaleString()} EGP
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
          width:
            `${percent || 0}%`,

          height: "100%",

          background:
            "#22c55e",

          transition: "0.4s"
        }} />

      </div>

      <div style={{
        marginTop: 6,
        fontSize: 12,
        color: "#6b7280"
      }}>

        {(percent || 0)
          .toFixed(1)}%

        {" "}
        {t("dashboard.ofTotalSales")}

      </div>

    </motion.div>

  );
}

export default BestBranchCard;
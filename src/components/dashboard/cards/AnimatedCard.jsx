import { motion } from "framer-motion";
import { card } from "../styles";
import useIsMobile from
"../../../hooks/useIsMobile";
import { memo } from "react";
function AnimatedCard({
  title,
  children
}) {
  const isMobile =
  useIsMobile();

  return (
    <motion.div

      style={{
        ...card,

        padding:
          isMobile ? 14 : 20
      }}

      whileHover={{
        scale: 1.01
      }}
    >

      <h4 style={{
        marginBottom: 10,

        fontSize:
          isMobile ? 14 : 16
      }}>
        {title}
      </h4>

      {children}

    </motion.div>
  );
}

export default memo(
  AnimatedCard
);
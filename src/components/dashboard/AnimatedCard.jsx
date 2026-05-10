import { motion } from "framer-motion";
import { card } from "./styles";
function AnimatedCard({ title, children }) {
  return (
    <motion.div style={card} whileHover={{ scale: 1.01 }}>
      <h4 style={{ marginBottom: 10 }}>
      {title}
    </h4>
      {children}
    </motion.div>
  );
}

export default AnimatedCard;
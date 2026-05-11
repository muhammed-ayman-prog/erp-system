import { useState } from "react";
import { motion } from "framer-motion";
import { card } from "./styles";
function CriticalStockCard({
  title,
  items,
  onSelect
}) {

  if (!items) return null;
  const [open, setOpen] =
  useState(false);
const sortedItems = [...items].sort((a, b) => {

  // Oils → alphabetical
  if (a.type === "oil") {
    return a.name.localeCompare(b.name, "ar");
  }

  // Originals → alphabetical
  if (a.type === "original") {
    return a.name.localeCompare(b.name, "ar");
  }

  // Containers
  if (a.type === "container") {

    const order = {
      bottle: 1,
      box: 2,
      sample: 3,
      samples: 3
    };

    const aOrder =
      order[a.subCategory] || 99;

    const bOrder =
      order[b.subCategory] || 99;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    return a.name.localeCompare(b.name);
  }

  // Products
  if (a.type === "product") {

    const order = {
      Cream: 1,
      Makhmaria: 2
    };

    const aOrder =
      order[a.category] || 99;

    const bOrder =
      order[b.category] || 99;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    return a.name.localeCompare(b.name, "ar");
  }

  return 0;
});


  return (
    <motion.div style={{
      ...card,
      maxHeight: open ? 500 : "auto",
      minHeight: open ? 350 : "auto",
      overflowY: open ? "auto" : "hidden"
    }}>
      <h4
        onClick={() =>
          setOpen(!open)
        } 

        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          marginBottom: 10,
          cursor: "pointer"
        }}
      >
        <span>
          {title} ({items.length})
        </span>

        <span>
          {open ? "−" : "+"}
        </span>
      </h4>

      {open && sortedItems.map((item, i) => (

        <div
        key={i}
        onClick={() =>
          onSelect(item)
        }

        style={{
          padding: "8px 0",
          borderBottom: "1px solid #eee",
          cursor: "pointer"
        }}
      >
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: 14
    }}>
      <strong>{item.name}</strong>

      <span style={{
        color:
          item.severity === "out"
            ? "#dc2626"
            : item.severity === "critical"
            ? "#f97316"
            : "#f59e0b"
      }}>
        <>
          {item.lowestQty}
        </>
      </span>
    </div>

    <div style={{
      fontSize: 12,
      color: "#6b7280",
      marginTop: 2
    }}>
      {item.type === "oil"
  ? "🛢 Oil"
  : item.type === "container"
  ? "📦 Container"
  : item.type === "product"
  ? "🧴 Product"
  : item.type === "original"
  ? "✨ Original"
  : item.type}

{" • "}

<span
  title={
    item.branches?.join(" • ")
  }
>
  {item.branches?.length || 0} branches
</span>
    </div>

    <div style={{
      fontSize: 11,
      marginTop: 4,
      color: "#9ca3af"
    }}>
      Threshold: {item.threshold}
      {" • "}
      Status:
      {" "}
      {item.severity === "out"
        ? "Out Of Stock"
        : item.severity === "critical"
        ? "Critical"
        : "Low"}
    
    </div>
    
  </div>
  
))}
     
    </motion.div>
    
  );
}
export default CriticalStockCard;
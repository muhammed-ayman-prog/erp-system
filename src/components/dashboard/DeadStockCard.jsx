import { useState }
from "react";

import { motion }
from "framer-motion";

import { card }
from "./styles";

export default function
DeadStockCard({
  items
}) {
const [open, setOpen] =
  useState(false);
  if (
    !items ||
    items.length === 0
  ) return null;

  return (

    <motion.div
      style={{
        ...card,

        minHeight:
          open ? 350 : "auto",

        maxHeight:
          open ? 500 : "auto",

        overflowY:
          open ? "auto" : "hidden"
      }}

      whileHover={{
        scale: 1.01
      }}
    >

      <h4
        onClick={() =>
          setOpen(!open)
        }

        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent:
            "space-between",

          cursor: "pointer"
        }}
      >
        <span>
          💤 Dead Stock
        </span>

        <span>
          {open ? "−" : "+"}
        </span>
      </h4>

      {open && items.map((item, i) => (

        <div
          key={i}

          style={{
            padding: "10px 0",
            borderBottom:
              "1px solid #eee"
          }}
        >

          <div style={{
            display: "flex",
            justifyContent:
              "space-between",

            fontSize: 14
          }}>

            <strong>
              {item.name}
            </strong>

            <span style={{
              color: "#dc2626",
              fontWeight: "600"
            }}>
              {item.days === "Never"
                ? "Never sold"
                : `${item.days} days`}
            </span>

          </div>

          <div style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 4
          }}>
            Qty:
            {" "}
            {item.qty}
          </div>

        </div>

      ))}

    </motion.div>

  );

}
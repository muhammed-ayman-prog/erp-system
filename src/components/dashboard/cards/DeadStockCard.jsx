import { useState }
from "react";

import { motion }
from "framer-motion";

import { card } from "../styles";
import { useTranslate } from "../../../useTranslate";
export default function
DeadStockCard({
  items
}) {
  const { t } = useTranslate();
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

          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          gap: 6,

          marginBottom: 14,

          cursor: "pointer",

          position: "sticky",

          top: 0,

          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(6px)",

          zIndex: 10,

          paddingBottom: 10,

          borderBottom:
            "1px solid #f3f4f6"
        }}
      >
        <span>
          💤 {t("dashboard.deadStock")}
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
                ? t("dashboard.neverSold")
                : `${item.days} ${t("common.days")}`}
            </span>

          </div>

          <div style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 4
          }}>
            {t("common.qty")}:
            {" "}
            {item.qty}
          </div>

        </div>

      ))}

    </motion.div>

  );

}
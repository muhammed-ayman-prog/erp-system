import { useState }
from "react";

import { motion }
from "framer-motion";

import { card } from "../styles";
import { useTranslate } from "../../../useTranslate";
export default function
FastMovingCard({
  items
}) {
const { t } = useTranslate();
const [open, setOpen] =
  useState(false);
  if (
  !items ||
  items.length === 0
) {

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
          🚀 {t("dashboard.fastMoving")}
        </span>

        <span>
          {open ? "−" : "+"}
        </span>
      </h4>

      <div style={{
        marginTop: 20,
        color: "#6b7280",
        textAlign: "center"
      }}>
        {t("dashboard.noSales")}
      </div>

    </motion.div>

  );

}

  const maxQty =
    items[0]?.qty || 1;

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
          🚀 {t("dashboard.fastMoving")}
        </span>

        <span>
          {open ? "−" : "+"}
        </span>
      </h4>

      {open && items.map((item, i) => {

        const percent =
          (
            item.qty
            / maxQty
          ) * 100;

        return (

          <div
            key={i}

            style={{
              marginBottom: 12
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
                fontWeight: "600"
              }}>
                {item.qty} {t("dashboard.orders")}
              </span>

            </div>

            <div style={{
              height: 6,
              background:
                "#e5e7eb",

              borderRadius: 10,

              marginTop: 5,

              overflow: "hidden"
            }}>

              <div style={{
                width:
                  `${percent}%`,

                height: "100%",

                background:
                  "#22c55e"
              }} />

            </div>

          </div>

        );

      })}

    </motion.div>

  );

}   
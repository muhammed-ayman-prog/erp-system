import { useState } from "react";

import { motion } from "framer-motion";

import { card } from "../styles";

import { useTranslate }
from "../../../useTranslate";

function CriticalStockCard({
  title,
  items,
  onSelect
}) {

  const { t } =
    useTranslate();

  const [open, setOpen] =
    useState(false);

  if (!items) return null;

  const sortedItems =
    [...items].sort((a, b) => {

      // Oils
      if (a.type === "oil") {

        return a.name.localeCompare(
          b.name,
          "ar"
        );

      }

      // Originals
      if (a.type === "original") {

        return a.name.localeCompare(
          b.name,
          "ar"
        );

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

        return a.name.localeCompare(
          b.name
        );

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

        return a.name.localeCompare(
          b.name,
          "ar"
        );

      }

      return 0;

    });

  return (

    <motion.div

      style={{

        ...card,

        maxHeight:
          open ? 500 : "auto",

        minHeight:
          open ? 350 : "auto",

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

        <span style={{
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>

          ⚠️

          {title}

          <span style={{
            fontSize: 13,
            color: "#6b7280"
          }}>

            ({items.length})

          </span>

        </span>

        <span style={{
          fontSize: 18,
          fontWeight: "600"
        }}>

          {open ? "−" : "+"}

        </span>

      </h4>

      {open && sortedItems.map(
        (item, i) => (

        <div

          key={i}

          onClick={() =>
            onSelect(item)
          }

          style={{

            padding: "10px 0",

            borderBottom:
              "1px solid #eee",

            cursor: "pointer"
          }}
        >

          <div style={{

            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",

            gap: 10,

            fontSize: 14
          }}>

            <strong style={{
              flex: 1
            }}>

              {item.name}

            </strong>

            <span style={{

              color:

                item.severity === "out"
                  ? "#dc2626"

                  : item.severity ===
                    "critical"

                  ? "#f97316"

                  : "#f59e0b",

              fontWeight: "700",

              fontSize: 16
            }}>

              {item.lowestQty}

            </span>

          </div>

          <div style={{

            fontSize: 12,

            color: "#6b7280",

            marginTop: 4
          }}>

            {item.type === "oil"

              ? t("inventory.oil")

              : item.type ===
                "container"

              ? t("inventory.container")

              : item.type ===
                "product"

              ? t("inventory.product")

              : item.type ===
                "original"

              ? t("inventory.original")

              : item.type}

            {" • "}

            <span
              title={
                item.branches?.join(
                  " • "
                )
              }
            >

              {item.branches?.length || 0}

              {" "}

              {t("dashboard.branches")}

            </span>

          </div>

          <div style={{

            fontSize: 11,

            marginTop: 5,

            color: "#9ca3af"
          }}>

            {t("dashboard.threshold")}:
            {" "}

            {item.threshold}

            {" • "}

            {t("common.status")}:
            {" "}

            {item.severity === "out"

              ? t("dashboard.outOfStock")

              : item.severity ===
                "critical"

              ? t("dashboard.critical")

              : t("dashboard.low")}

          </div>

        </div>

      ))}

    </motion.div>

  );
}

export default CriticalStockCard;
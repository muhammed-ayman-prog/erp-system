import AppCard from "../../../../components/ui/AppCard";

import { theme } from "../../../../theme";
import { useTranslate } from "../../../../useTranslate";

export default function CartSummary({
  totalItems,
  totalQuantity,
}) {
  const { t } = useTranslate();


  const items = Number(
    totalItems || 0
  ).toLocaleString("en-US");


  const quantity = Number(
    totalQuantity || 0
  ).toLocaleString("en-US");


  return (
    <AppCard
      style={{
        padding: 14,

        marginTop: 4,

        borderRadius:
          16,

        background:
          theme.colors.card,

        boxShadow:
          "0 6px 18px rgba(0,0,0,.04)",
      }}
    >

      <div
        style={{
          display: "flex",

          flexDirection:
            "column",

          gap: 10,
        }}
      >

        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",
          }}
        >

          <span
            style={{
              color:
                theme.colors.textSecondary,

              fontSize: 13,

              fontWeight: 600,
            }}
          >
            {t("stockEntry.items")}
          </span>


          <strong
            style={{
              fontSize: 15,

              color:
                theme.colors.text,
            }}
          >
            {items}
          </strong>

        </div>


        <div
          style={{
            height: 1,

            background:
              theme.colors.border,
          }}
        />


        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",
          }}
        >

          <span
            style={{
              color:
                theme.colors.textSecondary,

              fontSize: 13,

              fontWeight: 700,
            }}
          >
            {t("stockEntry.totalQuantity")}
          </span>


          <strong
            style={{
              fontSize: 22,

              fontWeight: 900,

              color:
                theme.colors.primary,
            }}
          >
            {quantity}
          </strong>

        </div>

      </div>

    </AppCard>
  );
}
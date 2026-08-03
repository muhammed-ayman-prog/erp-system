import { PackagePlus } from "lucide-react";

import { theme } from "../../../../theme";
import { useTranslate } from "../../../../useTranslate";

export default function EmptyCart() {
  const { t } = useTranslate();

  return (
    <div
      style={{
        flex: 1,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        padding:
          "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",

          maxWidth: 260,

          textAlign: "center",
        }}
      >

        <div
          style={{
            width: 72,

            height: 72,

            margin:
              "0 auto 18px",

            borderRadius: 20,

            background:
              theme.colors.primarySoft,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            color:
              theme.colors.primary,
          }}
        >
          <PackagePlus
            size={34}
            strokeWidth={2}
          />
        </div>


        <h3
          style={{
            margin: 0,

            fontSize: 18,

            fontWeight: 800,

            color:
              theme.colors.text,
          }}
        >
          {t("stockEntry.emptyCart")}
        </h3>


        <p
          style={{
            margin:
              "8px 0 0",

            lineHeight: 1.6,

            fontSize: 13,

            color:
              theme.colors.textSecondary,
          }}
        >
          {t(
            "stockEntry.addProductsToCart"
          )}
        </p>

      </div>
    </div>
  );
}
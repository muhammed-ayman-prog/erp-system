import {
  ShoppingBasket,
  Trash2,
  X,
} from "lucide-react";

import { theme } from "../../../../theme";
import { useTranslate } from "../../../../useTranslate";


export default function CartHeader({
  totalItems,
  hasItems,
  disabled = false,
  onClear,
  onClose,
}) {

  const { t } = useTranslate();


  const formattedItems = Number(
    totalItems || 0
  ).toLocaleString("en-US");


  return (
    <div
      style={{
        padding: "14px 16px",

        background:
          theme.colors.cardSoft,

        borderBottom:
          `1px solid ${theme.colors.border}`,

        boxShadow:
          "0 4px 14px rgba(15,23,42,.06)",

        position:
          "sticky",

        top:0,

        zIndex:5,
      }}
    >

      <div
        style={{
          display:"flex",

          alignItems:"center",

          justifyContent:"space-between",

          gap:12,
        }}
      >


        {/* Title */}

        <div
          style={{
            display:"flex",

            alignItems:"center",

            gap:10,
          }}
        >

          <div
            style={{
              width:42,

              height:42,

              borderRadius:14,

              background:
                theme.colors.primarySoft,

              color:
                theme.colors.primary,

              display:"flex",

              alignItems:"center",

              justifyContent:"center",
            }}
          >
            <ShoppingBasket
              size={22}
              strokeWidth={2.2}
            />
          </div>



          <div>

            <h2
              style={{
                margin:0,

                fontSize:17,

                fontWeight:800,

                color:
                  theme.colors.text,
              }}
            >
              {t("stockEntry.cart")}
            </h2>


            <div
              style={{
                marginTop:3,

                fontSize:12,

                color:
                  theme.colors.textSecondary,
              }}
            >
              {formattedItems}{" "}
              {t("stockEntry.items")}
            </div>

          </div>

        </div>



        {/* Actions */}

        <div
          style={{
            display:"flex",

            alignItems:"center",

            gap:8,
          }}
        >


          {hasItems && (

            <button
              type="button"

              disabled={disabled}

              onClick={onClear}

              style={{
                height:34,

                padding:"0 11px",

                borderRadius:12,

                border:
                  "1px solid #fecaca",

                background:
                  "#fff",

                color:
                  "#ef4444",

                display:"flex",

                alignItems:"center",

                gap:5,

                fontSize:12,

                fontWeight:700,

                cursor:"pointer",
              }}
            >

              <Trash2
                size={14}
                strokeWidth={2.4}
              />

              {t("common.clearAll")}

            </button>

          )}



          <button
            type="button"

            disabled={disabled}

            onClick={onClose}

            style={{
              width:34,

              height:34,

              padding:0,

              borderRadius:12,

              border:
                `1px solid ${theme.colors.border}`,

              background:
                theme.colors.card,

              color:
                theme.colors.textSecondary,

              display:"flex",

              alignItems:"center",

              justifyContent:"center",

              cursor:"pointer",
            }}
          >

            <X
              size={17}
              strokeWidth={2.5}
            />

          </button>


        </div>


      </div>

    </div>
  );
}
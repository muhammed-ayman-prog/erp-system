import {
  Trash2,
  Package,
} from "lucide-react";

import AppCard from "../../../../components/ui/AppCard";
import { theme } from "../../../../theme";


export default function CartItem({
  item,
  disabled = false,
  onRemove,
  onUpdateQuantity,
}) {

  const quantity =
    Number(item.purchaseQuantity || 1);


  return (

    <AppCard

      style={{
        padding:12,

        borderRadius:16,

        background:
          theme.colors.card,

        boxShadow:
          "0 4px 16px rgba(15,23,42,.06)",
      }}

    >

      <div

        style={{

          display:"flex",

          alignItems:"center",

          gap:10,

          direction:"rtl",

        }}

      >



        {/* Product */}

        <div

          style={{

            flex:1,

            display:"flex",

            alignItems:"center",

            gap:8,

            minWidth:0,

          }}

        >

          <div

            style={{

              width:34,

              height:34,

              borderRadius:12,

              background:
                theme.colors.primarySoft,

              color:
                theme.colors.primary,

              display:"flex",

              alignItems:"center",

              justifyContent:"center",

              flexShrink:0,

            }}

          >

            <Package size={17}/>

          </div>



          <div

            style={{

              display:"flex",

              alignItems:"center",

              gap:7,

              minWidth:0,

            }}

          >

            <span

              style={{

                fontSize:13,

                fontWeight:800,

                color:
                  theme.colors.text,

              }}

            >

              {item.name ||
              item.productName}

            </span>


            <span

              style={{

                padding:"3px 8px",

                borderRadius:999,

                background:
                  theme.colors.primarySoft,

                color:
                  theme.colors.primary,

                fontSize:10,

                fontWeight:700,

              }}

            >

              {item.category || "-"}

            </span>


          </div>


        </div>





        {/* Quantity */}

        <input
  type="number"
  min="1"
  value={quantity}
  disabled={disabled}
  onChange={(e)=>
    onUpdateQuantity(
      item.productId,
      Number(e.target.value) || 1
    )
  }
  style={{
    width:76,
    height:34,

    borderRadius:10,

    border:
      `1px solid ${theme.colors.border}`,

    background:"#fff",

    textAlign:"center",

    fontWeight:800,

    fontSize:14,

    outline:"none",

    color:
      theme.colors.text,

    direction:"ltr",

    padding:"0 6px",
  }}
/>





        {/* Delete */}

        <button

          type="button"

          disabled={disabled}

          onClick={onRemove}

          style={{

            width:34,

            height:34,

            borderRadius:10,

            border:
              "1px solid #fecaca",

            background:
              "#fff5f5",

            color:
              "#ef4444",

            display:"flex",

            alignItems:"center",

            justifyContent:"center",

            padding:0,

          }}

        >

          <Trash2
            size={16}
            strokeWidth={2.5}
          />

        </button>


      </div>


    </AppCard>

  );
}
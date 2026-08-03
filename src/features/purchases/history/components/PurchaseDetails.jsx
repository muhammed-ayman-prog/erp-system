import { Package, CheckCircle } from "lucide-react";

import { theme } from "../../../../theme";
import { useTranslate } from "../../../../useTranslate";

import UndoButton from "./UndoButton";


export default function PurchaseDetails({
  purchase,
  productsMap = {},
}) {

  const { t } = useTranslate();

  const items =
    purchase?.items || [];



  if (!items.length) {

    return (
      <div
        style={{
          textAlign:"center",
          padding:20,
          color:
            theme.colors.textSecondary,
        }}
      >
        {t("common.noData")}
      </div>
    );

  }



  const getProductName = (productId) => {

    return (
      productsMap[productId]?.name ||
      productId ||
      "-"
    );

  };



  const totalQuantity =
    items.reduce(
      (sum,item)=>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );



  return (

    <div
      style={{
        display:"flex",
        flexDirection:"column",
        gap:16,
      }}
    >


      {/* Title */}

      <div
        style={{
          fontWeight:800,

          fontSize:16,

          color:
            theme.colors.text,
        }}
      >
        {t("common.details")}
      </div>



      {/* Products */}

      <div
        style={{
          display:"flex",
          flexDirection:"column",
          gap:10,
        }}
      >

        {
          items.map(
            (item,index)=>(

              <div
                key={index}

                style={{
                  display:"flex",

                  alignItems:"center",

                  justifyContent:"space-between",

                  padding:14,

                  background:
                    theme.colors.card,

                  border:
                    `1px solid ${theme.colors.border}`,

                  borderRadius:12,
                }}
              >


                <div
                  style={{
                    display:"flex",

                    alignItems:"center",

                    gap:10,
                  }}
                >

                  <Package
                    size={18}
                    color={
                      theme.colors.primary
                    }
                  />


                  <span
                    style={{
                      fontWeight:700,
                    }}
                  >
                    {
                      getProductName(
                        item.productId
                      )
                    }
                  </span>

                </div>



                <span
                  style={{
                    fontWeight:800,
                  }}
                >
                  {item.quantity}
                </span>


              </div>

            )
          )
        }


      </div>



      {/* Summary */}

      <div
        style={{
          display:"flex",

          gap:12,

          flexWrap:"wrap",
        }}
      >


        <div
          style={{
            flex:1,

            minWidth:150,

            padding:14,

            background:
              theme.colors.card,

            border:
              `1px solid ${theme.colors.border}`,

            borderRadius:12,
          }}
        >

          <div
            style={{
              fontSize:13,
              color:
                theme.colors.textSecondary,
            }}
          >
            {t(
              "purchaseHistory.totalItems"
            )}
          </div>


          <strong>
            {items.length}
          </strong>


        </div>



        <div
          style={{
            flex:1,

            minWidth:150,

            padding:14,

            background:
              theme.colors.card,

            border:
              `1px solid ${theme.colors.border}`,

            borderRadius:12,
          }}
        >

          <div
            style={{
              fontSize:13,

              color:
                theme.colors.textSecondary,
            }}
          >
            {t(
              "purchaseHistory.totalQuantity"
            )}
          </div>


          <strong>
            {totalQuantity}
          </strong>


        </div>


      </div>



      {/* Status / Undo */}

      {
        purchase.undone ? (

          <div
            style={{
              display:"flex",

              alignItems:"center",

              gap:8,

              padding:14,

              borderRadius:12,

              background:"#dcfce7",

              color:"#15803d",

              fontWeight:700,
            }}
          >

            <CheckCircle size={18}/>

            {t(
              "purchaseHistory.undoneMessage"
            )}

          </div>


        ) : (

          <UndoButton
            purchase={purchase}
          />

        )
      }


    </div>

  );

}
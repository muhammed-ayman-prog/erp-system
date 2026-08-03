import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";

import { theme } from "../../../../theme";
import { useTranslate } from "../../../../useTranslate";
import PurchaseDetails from "./PurchaseDetails";


export default function HistoryTable({
  purchases,
  openId,
  setOpenId,
}) {

  const { t, lang } = useTranslate();

  const isRTL = lang === "ar";


  if (!purchases.length) {
    return (
      <div
        style={{
          background: theme.colors.card,

          border:
            `1px solid ${theme.colors.border}`,

          borderRadius: 16,

          padding: 30,

          textAlign: "center",

          color:
            theme.colors.textSecondary,
        }}
      >
        {t("common.noData")}
      </div>
    );
  }


  return (
    <div
      style={{
        direction:
          isRTL ? "rtl" : "ltr",

        background:
          theme.colors.card,

        border:
          `1px solid ${theme.colors.border}`,

        borderRadius: 16,

        overflow: "hidden",
      }}
    >


      {/* Header */}

      <div
        className="purchase-history-desktop"

        style={{
          display:"grid",

          gridTemplateColumns:
            "1.2fr 1fr 1fr .8fr 1fr 60px",

          padding:
            "16px 20px",

          background:
            theme.colors.cardSoft,

          color:
            theme.colors.textSecondary,

          fontSize:13,

          fontWeight:700,
        }}
      >

        <span>
          {t("common.date")}
        </span>

        <span>
          {t("common.branch")}
        </span>

        <span>
          {t("common.user")}
        </span>

        <span>
          {t("common.quantity")}
        </span>

        <span>
          {t("common.status")}
        </span>

        <span />

      </div>



      {
        purchases.map((purchase)=>{


          const isOpen =
            openId === purchase.id;



          const quantity =
            purchase.items?.reduce(
              (sum,item)=>
                sum +
                Number(
                  item.quantity || 0
                ),
              0
            ) || 0;



          const date =
            purchase.createdAt?.seconds
              ? new Date(
                  purchase.createdAt.seconds * 1000
                ).toLocaleDateString(
                  lang === "ar"
                    ? "ar-EG"
                    : "en-US"
                )
              : "-";



          return (

            <div
              key={purchase.id}
            >


              {/* Desktop Row */}

              <div
                className="purchase-history-desktop"

                onClick={()=>
                  setOpenId(
                    isOpen
                      ? null
                      : purchase.id
                  )
                }

                style={{
                  display:"grid",

                  gridTemplateColumns:
                    "1.2fr 1fr 1fr .8fr 1fr 60px",

                  alignItems:"center",

                  padding:
                    "16px 20px",

                  cursor:"pointer",

                  borderTop:
                    `1px solid ${theme.colors.border}`,
                }}
              >


                <span>
                  {date}
                </span>


                <span>
                  {purchase.branchName || "-"}
                </span>


                <span>
                  {purchase.userName || "-"}
                </span>


                <span>
                  {quantity}
                </span>



                <span>

                  {
                    purchase.undone ? (

                      <span
                        style={{
                          display:"inline-flex",

                          alignItems:"center",

                          gap:6,

                          padding:
                            "5px 10px",

                          borderRadius:20,

                          background:
                            "#dcfce7",

                          color:
                            "#15803d",

                          fontSize:12,

                          fontWeight:700,
                        }}
                      >

                        <CheckCircle size={14}/>

                        {t(
                          "purchaseHistory.undone"
                        )}

                      </span>

                    ) : (

                      <span
                        style={{
                          color:
                            theme.colors.textSecondary,

                          fontSize:12,
                        }}
                      >
                        -
                      </span>

                    )
                  }

                </span>



                <span>

                  {
                    isOpen
                      ? <ChevronUp size={18}/>
                      : <ChevronDown size={18}/>
                  }

                </span>


              </div>




              {/* Mobile */}

              <div
                className="purchase-history-mobile"

                onClick={()=>
                  setOpenId(
                    isOpen
                      ? null
                      : purchase.id
                  )
                }

                style={{
                  display:"none",

                  padding:16,

                  borderTop:
                    `1px solid ${theme.colors.border}`,

                  cursor:"pointer",
                }}
              >


                <div
                  style={{
                    display:"flex",

                    justifyContent:"space-between",

                    alignItems:"center",

                    marginBottom:12,
                  }}
                >

                  <strong>
                    {date}
                  </strong>


                  {
                    isOpen
                      ? <ChevronUp size={18}/>
                      : <ChevronDown size={18}/>
                  }

                </div>



                <div>
                  {t("common.branch")}:
                  {" "}
                  {purchase.branchName || "-"}
                </div>


                <div>
                  {t("common.user")}:
                  {" "}
                  {purchase.userName || "-"}
                </div>


                <div>
                  {t("common.quantity")}:
                  {" "}
                  {quantity}
                </div>



                {
                  purchase.undone && (

                    <div
                      style={{
                        marginTop:10,

                        display:"flex",

                        alignItems:"center",

                        gap:6,

                        color:"#15803d",

                        fontWeight:700,
                      }}
                    >

                      <CheckCircle size={15}/>

                      {t(
                        "purchaseHistory.undone"
                      )}

                    </div>

                  )
                }


              </div>




              {/* Details */}

              {
                isOpen && (

                  <div
                    style={{
                      padding:20,

                      background:
                        theme.colors.cardSoft,
                    }}
                  >

                    <PurchaseDetails
                      purchase={purchase}
                      productsMap={{}}
                    />

                  </div>

                )
              }


            </div>

          );

        })
      }



      <style>
        {`
          @media(max-width:768px){

            .purchase-history-desktop{
              display:none !important;
            }

            .purchase-history-mobile{
              display:block !important;
            }

          }
        `}
      </style>


    </div>
  );
}
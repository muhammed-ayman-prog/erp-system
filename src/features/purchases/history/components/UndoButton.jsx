import { useState } from "react";
import { RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

import { useTranslate } from "../../../../useTranslate";
import { useAuth } from "../../../../store/useAuth";

import { undoPurchaseService } from "../services/undoPurchaseService";


export default function UndoButton({
  purchase,
}) {

  const { t } = useTranslate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);



  if (purchase.undone) {
    return null;
  }



  const handleUndo = () => {

    toast(
      (toastItem) => (

        <div
          style={{
            display:"flex",
            flexDirection:"column",
            gap:12,
          }}
        >

          <div
            style={{
              fontWeight:700,
            }}
          >
            {t("purchaseHistory.undoConfirm")}
          </div>


          <div
            style={{
              display:"flex",
              gap:8,
            }}
          >

            <button
              onClick={async () => {

                toast.dismiss(
                  toastItem.id
                );


                try {

                  setLoading(true);


                  await undoPurchaseService(
                    purchase,
                    user
                  );


                  toast.success(
                    t("purchaseHistory.undoSuccess")
                  );


                } catch(error) {

                  console.error(error);


                  toast.error(
                    t("purchaseHistory.undoFailed")
                  );

                } finally {

                  setLoading(false);

                }

              }}

              style={{
                background:"#ef4444",
                color:"#fff",
                border:"none",
                borderRadius:8,
                padding:"6px 14px",
                cursor:"pointer",
                fontWeight:700,
              }}
            >
              {t("common.confirm")}
            </button>



            <button
              onClick={() =>
                toast.dismiss(
                  toastItem.id
                )
              }

              style={{
                background:"#e5e7eb",
                border:"none",
                borderRadius:8,
                padding:"6px 14px",
                cursor:"pointer",
                fontWeight:700,
              }}
            >
              {t("common.cancel")}
            </button>


          </div>

        </div>

      ),

      {
        duration: Infinity,
      }

    );

  };



  return (
    <button
      onClick={handleUndo}
      disabled={loading}

      style={{
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        gap:8,

        width:"100%",

        height:42,

        border:"none",

        borderRadius:12,

        cursor:
          loading
            ? "not-allowed"
            : "pointer",

        background:"#ef4444",

        color:"#fff",

        fontWeight:700,

        opacity:
          loading
            ? .6
            : 1,
      }}
    >

      <RotateCcw size={17}/>

      {
        loading
          ? t("common.loading")
          : t("purchaseHistory.undo")
      }

    </button>
  );
}
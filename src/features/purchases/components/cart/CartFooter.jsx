import AppButton from "../../../../components/ui/AppButton";

import { theme } from "../../../../theme";
import { useTranslate } from "../../../../useTranslate";


export default function CartFooter({
  loading = false,
  onCancel,
  onSave,
}) {

  const { t } = useTranslate();


  return (

    <div

      style={{

        display:"flex",

        gap:10,

        alignItems:"center",

        width:"100%",

      }}

    >


      <AppButton

        onClick={onSave}

        loading={loading}

        style={{

          flex:1.3,

          height:40,

          borderRadius:14,

          fontSize:13,

          fontWeight:800,


          boxShadow:
            `0 8px 20px ${theme.colors.primary}25`,

        }}

      >

        {t("stockEntry.savePurchase")}

      </AppButton>



      <AppButton

        variant="ghost"

        disabled={loading}

        onClick={onCancel}

        style={{

          flex:1,

          height:40,

          borderRadius:14,


          fontSize:13,

          fontWeight:700,


          background:
            theme.colors.cardSoft,


          color:
            theme.colors.text,


          border:
            `1px solid ${theme.colors.border}`,

        }}

      >

        {t("common.cancel")}

      </AppButton>


    </div>

  );
}
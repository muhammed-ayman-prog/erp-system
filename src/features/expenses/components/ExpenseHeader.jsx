import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppPageHeader from "../../../components/ui/AppPageHeader";
import AppButton from "../../../components/ui/AppButton";
import { useTranslate } from "../../../useTranslate";

export default function ExpenseHeader() {
  const { t, lang } = useTranslate();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        direction: "ltr",
        width: "100%",
        marginBottom: 20,
      }}
    >
      {/* Back To Sales */}
      <div
        className="no-print"
        style={{
          flexShrink: 0,
        }}
      >
        <AppButton
          variant="secondary"
          leftIcon={<ArrowRight size={16} />}
          onClick={() => navigate("/sales")}
        >
          رجوع للمبيعات
        </AppButton>
      </div>

      {/* Expenses Title */}
      <div
        style={{
          flex: 1,
          minWidth: 200,
          direction: lang === "ar" ? "rtl" : "ltr",
        }}
      >
        <AppPageHeader
          title={t("expenses.title")}
          subtitle={t("expenses.subtitle")}
        />
      </div>
    </div>
  );
}
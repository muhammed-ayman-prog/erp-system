import AppPageHeader from "../../components/ui/AppPageHeader";
import AppButton from "../../components/ui/AppButton";
import { theme } from "../../theme";

import { useTranslate } from "../../useTranslate";

import { PurchaseProvider } from "./context/PurchaseContext";

import Search from "./components/Search";
import Categories from "./components/Categories";
import Grid from "./components/Grid";
import ProductPopup from "./components/ProductPopup";
import PurchaseCartDrawer from "./components/PurchaseCartDrawer";
import FloatingCartButton from "./components/FloatingCartButton";

import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PurchasesV2() {
  const { t } = useTranslate();
  const navigate = useNavigate();

  return (
    <PurchaseProvider>
      <AppPageHeader
        title={t("stockEntry.title")}
        subtitle={t("stockEntry.subtitle")}
        actions={
          <AppButton
            size="lg"
            startIcon={<ClipboardList size={18} />}
            onClick={() => navigate("/purchase-history")}
            style={{
              minWidth: 210,
            }}
          >
            {t("stockEntry.history")}
          </AppButton>
        }
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.xl,
        }}
      >
        <Search />

        <Categories />

        <ProductPopup />

        <FloatingCartButton />

        <PurchaseCartDrawer
          onSave={() => {
            console.log("Save Purchase");
          }}
        />

        <Grid />
      </div>
    </PurchaseProvider>
  );
}
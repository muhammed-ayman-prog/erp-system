import { memo } from "react";

import AppCard from "../../../components/ui/AppCard";
import AppButton from "../../../components/ui/AppButton";
import { theme } from "../../../theme";

import { useTranslate } from "../../../useTranslate";

import { PURCHASE_CATEGORIES } from "../constants/purchaseCategories";
import { usePurchaseContext } from "../context/PurchaseContext";

function Categories() {
  const { t } = useTranslate();

  const {
    selectedCategory,
    setSelectedCategory,
  } = usePurchaseContext();

  return (
    <AppCard>
      <div
        style={{
          display: "flex",
          gap: theme.spacing.sm,
          flexWrap: "wrap",
        }}
      >
        {PURCHASE_CATEGORIES.map((category) => (
          <AppButton
            key={category.id}
            variant={
              selectedCategory === category.id
                ? "primary"
                : "secondary"
            }
            onClick={() =>
              setSelectedCategory(category.id)
            }
          >
            {t(category.label)}
          </AppButton>
        ))}
      </div>
    </AppCard>
  );
}

export default memo(Categories);
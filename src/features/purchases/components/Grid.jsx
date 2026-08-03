import { useMemo } from "react";

import AppCard from "../../../components/ui/AppCard";
import AppEmptyState from "../../../components/ui/AppEmptyState";
import AppProductCard from "../../../components/ui/AppProductCard";
import AppSkeleton from "../../../components/ui/AppSkeleton";

import { theme } from "../../../theme";

import { useTranslate } from "../../../useTranslate";

import { useApp } from "../../../store/useApp";

import { useProducts } from "../../sales/hooks/useProducts";

import { usePurchaseContext } from "../context/PurchaseContext";

export default function Grid() {
  const { t } = useTranslate();

  const { selectedBranch } = useApp();

  const {
    productsWithStock,
    loadingProducts,
  } = useProducts(selectedBranch);

  const {
    searchQuery,
    selectedCategory,
    setSelectedProduct,
    setPopupOpen,
  } = usePurchaseContext();

  const filteredProducts = useMemo(() => {
    return productsWithStock.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||

        (selectedCategory === "french" &&
          product.category === "French") ||

        (selectedCategory === "oriental" &&
          product.category?.startsWith("Oriental")) ||

        (selectedCategory === "body" &&
          ["Makhmaria", "Musk"].includes(
            product.category
          )) ||

        (selectedCategory === "original" &&
          product.category === "Original") ||

        (selectedCategory === "containers" &&
          product.category === "container");

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    productsWithStock,
    searchQuery,
    selectedCategory,
  ]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setPopupOpen(true);
  };

  if (loadingProducts) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(240px,1fr))",
          gap: theme.spacing.lg,
        }}
      >
        {Array.from({ length: 8 }).map(
          (_, index) => (
            <AppCard key={index}>
              <AppSkeleton
                height="22px"
                width="70%"
              />

              <AppSkeleton
                height="16px"
                width="45%"
                style={{
                  marginTop:
                    theme.spacing.md,
                }}
              />

              <AppSkeleton
                height="16px"
                width="35%"
                style={{
                  marginTop:
                    theme.spacing.md,
                }}
              />
            </AppCard>
          )
        )}
      </div>
    );
  }

  if (!filteredProducts.length) {
    return (
      <AppEmptyState
        title={t("products.noProducts")}
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fill,minmax(190px,1fr))",
        gap: theme.spacing.sm,
      }}
    >
      {filteredProducts.map((product) => (
        <AppProductCard
          key={product.id}
          product={product}
          onClick={() =>
            handleProductClick(product)
          }
        />
      ))}
    </div>
  );
}
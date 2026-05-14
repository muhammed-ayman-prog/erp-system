import { useMemo } from "react";

export function useVisibleProducts({
  productsWithStock,
  mainTab,
  subTab,
  search
}) {

  const normalizedSearch =
    search.trim().toLowerCase();

  return useMemo(() => {

    return productsWithStock

      .filter((p) => {

        const tab =
          (mainTab || "").toLowerCase();

        const cat =
          (p.category || "").toLowerCase();

        if (tab === "french") {
          return cat.includes("french");
        }

        if (tab === "oriental") {

          if (subTab) {

            const parts =
              cat.split("-");

            return (
              parts[0] === "oriental" &&
              parts[1] === subTab.toLowerCase()
            );
          }

          return cat.includes("oriental");
        }

        if (tab === "body") {

          if (subTab) {
            return cat.includes(
              subTab.toLowerCase()
            );
          }

          return cat.includes("body");
        }

        if (tab === "original") {

          return (
            cat.includes("original") ||
            p.type === "original"
          );
        }

        return false;
      })

      .sort((a, b) => {

        if (
          a.quantity > 5 &&
          b.quantity <= 5
        ) return -1;

        if (
          a.quantity <= 5 &&
          b.quantity > 5
        ) return 1;

        if (
          a.quantity > 0 &&
          a.quantity <= 5 &&
          b.quantity === 0
        ) return -1;

        if (
          a.quantity === 0 &&
          b.quantity > 0 &&
          b.quantity <= 5
        ) return 1;

        return (a.name || "")
          .localeCompare(
            b.name || ""
          );
      })

      .filter((p) =>

        (p.name || "")
          .toLowerCase()
          .includes(normalizedSearch)

        ||

        (p.category || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );

  }, [
    productsWithStock,
    mainTab,
    subTab,
    normalizedSearch
  ]);
}
export function groupContainers(items) {

  return items.reduce((acc, product) => {

    const sub =
      (
        product.subCategory || ""
      ).toLowerCase().trim();

    const normalizedSub =
      sub === "samples"
        ? "sample"
        : sub;

    if (
      normalizedSub !== "bottle" &&
      normalizedSub !== "box" &&
      normalizedSub !== "sample"
    ) {
      return acc;
    }

    if (!acc[normalizedSub]) {
      acc[normalizedSub] = [];
    }

    acc[normalizedSub].push(product);

    return acc;

  }, {});
}

export function groupOils(items) {

  return items.reduce((acc, product) => {

    const rawCategory =
      (
        product.category || ""
      ).trim().toLowerCase();

    const pricingTier =
      (
        product.pricingTier || ""
      ).trim().toUpperCase();

    const category =

      rawCategory.includes("french")
        ? "French"

      : rawCategory.includes("oriental-a")
        ? "Oriental-A"

      : rawCategory.includes("oriental-b")
        ? "Oriental-B"

      : rawCategory.includes("oriental-c")
        ? "Oriental-C"

      : rawCategory.includes("oriental") &&
        pricingTier === "A"
        ? "Oriental-A"

      : rawCategory.includes("oriental") &&
        pricingTier === "B"
        ? "Oriental-B"

      : rawCategory.includes("oriental") &&
        pricingTier === "C"
        ? "Oriental-C"

      : rawCategory.includes("musk")
        ? "Musk"

      : "Other";

    if (category === "Other") {
      return acc;
    }

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(product);

    return acc;

  }, {});
}
export const getPrice = (product, size, containerType, pricing) => {

  const cat = product.category?.toLowerCase() || "";

  const normalizeSize = (s) =>
    s?.toLowerCase().replace(/\s/g, "");

  // 🟣 READY PRODUCTS
  if (product.price > 0) return product.price;

  // 🟢 MUSK
  const isMusk =
    cat.includes("musk") ||
    product.subCategory?.toLowerCase() === "musk";

  if (isMusk) {
    const type = product.muskType || "tahara";

    const found = pricing.find(p =>
      p.category === `musk_${type}` &&
      p.container === "sample" &&
      normalizeSize(p.size) === normalizeSize(size)
    );

    return found?.price || 0;
  }

  // 🔴 ORIENTAL
  if (cat.includes("oriental")) {
    const grade =
      cat.includes("-a") ? "A" :
      cat.includes("-b") ? "B" :
      cat.includes("-c") ? "C" : null;

    if (!grade) return 0;

    const found = pricing.find(p =>
      p.category === "oriental" &&
      p.grade === grade &&
      p.container === containerType &&
      normalizeSize(p.size) === normalizeSize(size)
    );

    return found?.price || 0;
  }

  // 🔵 FRENCH
  if (cat === "french") {
    const found = pricing.find(p =>
      p.category === "french" &&
      p.container === containerType &&
      normalizeSize(p.size) === normalizeSize(size)
    );

    return found?.price || 0;
  }

  return 0;
};
import { useState, useEffect } from "react";
import { showToast } from "../../../utils/toast";
import { processCheckout } from "../services/checkoutService";
export function useSales(
  productsWithStock,
  discount,
  pricing,
  toast
)
 {
  const normalize = (value) =>
  value
    ?.toString()
    ?.trim()
    ?.toLowerCase();
  const {
  setToastText,
  setShowToast
} = toast;
  const [cart, setCart] = useState(() => {
  return JSON.parse(localStorage.getItem("cart") || "[]");
});
useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cart));
}, [cart]);
useEffect(() => {
  const returned = JSON.parse(localStorage.getItem("returnedCart") || "[]");

  if (returned.length > 0) {
    setCart(prev => {
      const updated = [...prev, ...returned];
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });

    localStorage.removeItem("returnedCart");
  }
}, []);

  const addToCart = (product) => {

  const originalProduct =
    productsWithStock.find(
      p => p.id === product.id
    );

  if (!originalProduct) return;

  if (originalProduct.quantity <= 0) {

    showToast(
  setToastText,
  setShowToast,
  "المنتج خلص ❌"
);

    return;
  }

  setCart(prev => {

    const existing = prev.find(
      (item) =>
        normalize(item.id) === normalize(product.id) &&
        normalize(item.size) === normalize(product.size) &&
        normalize(item.containerType) === normalize(product.containerType)
    );

    if (
      existing &&
      existing.qty >= originalProduct.quantity
    ) {

      showToast(
        setToastText,
        setShowToast,
        "وصلت لأقصى كمية ❌"
      );

      return prev;
    }

    if (existing) {

      return prev.map((item) =>
        normalize(item.id) === normalize(product.id) &&
        normalize(item.size) === normalize(product.size) &&
        normalize(item.containerType) === normalize(product.containerType)
          ? {
              ...item,
              qty: item.qty + 1
            }
          : item
      );
    }

    return [
      ...prev,
      {
        ...product,
        qty: 1,
        category: product.category
      }
    ];
  });

  return product.name;
};
const removeItem = (target) => {
  setCart(prev =>
    prev.filter(
      (item) =>
        !(
          normalize(item.id) === normalize(target.id) &&
          normalize(item.size) === normalize(target.size) &&
          normalize(item.containerType) === normalize(target.containerType)
        )
    )
  );
};
const increaseQty = (target) => {
  const product = productsWithStock.find(p => p.id === target.id);

if (!product || product.quantity <= 0) return;

if (target.qty >= product.quantity) {
  showToast(setToastText, setShowToast,"وصلت لأقصى كمية ❌");
  return;
}

  setCart(prev =>
    prev.map((item) =>
      normalize(item.id) === normalize(target.id) &&
      normalize(item.size) === normalize(target.size) &&
      normalize(item.containerType) === normalize(target.containerType)
        ? { ...item, qty: item.qty + 1 }
        : item
    )
  );
};
  const decreaseQty = (target) => {
  setCart(prev =>
    prev
      .map((item) =>
        normalize(item.id) === normalize(target.id) &&
        normalize(item.size) === normalize(target.size) &&
        normalize(item.containerType) === normalize(target.containerType)
          ? { ...item, qty: item.qty - 1 }
          : item
      )
      .filter((item) => item.qty > 0)
  );
};
const subtotal = cart.reduce((sum, item) => {
  return sum + (item.price || 0) * item.qty;
}, 0);

const total = Math.max(0, subtotal - discount);
const getPrice = (product, size, containerType) => {
  if (containerType === "oil") {

  const category =
    product.category?.toLowerCase() || "";

  const qty =
    product.oilQty || 0;

  // 🔵 French Oil
  if (category.includes("french")) {

    const found = pricing.find(
      p => p.category === "french_oil"
    );

    return qty * (found?.price || 0);
  }

  // 🔴 Oriental Oil
  if (
    category.includes("oriental")
  ) {

    const grade =
      category.includes("-a") ? "A"
      : category.includes("-b") ? "B"
      : category.includes("-c") ? "C"
      : null;

    if (!grade) return 0;

    const found = pricing.find(
      p =>
        p.category === "oriental_oil" &&
        p.grade === grade
    );

    return qty * (found?.price || 0);
  }

  // 🟢 Musk Oil
  if (
    category.includes("musk")
  ) {

    const found = pricing.find(
      p =>
        p.category === "oriental_oil" &&
        p.grade === "A"
    );

    return qty * (found?.price || 0);
  }

  return 0;
}
     const cat = product.category?.toLowerCase() || "";
    containerType = containerType?.toLowerCase().trim();
  

  const normalizeSize = (s) =>
    s?.toLowerCase().replace(/\s/g, "");
  const sizeValue = typeof size === "object"
  ? size.size || size.name
  : size;

  // 🟢 FIX container naming
  // 🟣 READY PRODUCTS (fixed price)
  

  // 🔥 MUSK (sample only)
  const isMuskProduct =
  cat.includes("musk") ||
  product.subCategory?.toLowerCase() === "musk";



if (isMuskProduct) {
  const type = product.muskType || "tahara"; // مهم

  const found = pricing.find(p =>
    p.category === `musk_${type}` &&
    p.container === "sample" &&
    normalizeSize(p.size) === normalizeSize(sizeValue)
  );

  if (!found) {
    console.warn("❌ Musk price not found:", {
      type,
      size,
      product
    });
  }

  return found?.price || 0;
}

  // 🔴 ORIENTAL (A / B / C)
  if (cat.includes("oriental")) {
    const grade = product.category
  ?.toLowerCase()
  ?.includes("-a") ? "A"
  : product.category?.toLowerCase()?.includes("-b") ? "B"
  : product.category?.toLowerCase()?.includes("-c") ? "C"
  : null;

if (!grade) return 0; // A / B / C

    // 🟡 Bottle / Sample
    if (containerType !== "box") {
      const found = pricing.find(p =>
  p.category === "oriental" &&
  p.grade === grade &&
  p.container === containerType &&
  normalizeSize(p.size) === normalizeSize(sizeValue)
);

      return found?.price || 0;
    }

    // 🔥 BOX = 100ml bottle + extra
   const base = pricing.find(p =>
  p.category === "oriental" &&
  p.grade === grade &&
  p.container === "bottle" &&
  normalizeSize(p.size) === "100ml"
);

    if (!base) return 0;

    const extraPricing = pricing.find(
  p =>
    p.category === "box_extra" &&
    p.grade === grade
);

return (
  base.price +
  (extraPricing?.price || 0)
);
  }

  // 🔵 FRENCH
  if (cat.includes("french")) {
    // 🔥 BOX → fixed product price
if (containerType === "box") {
  return product.price || 0;
}

  

  // 🟡 Bottle / Sample → من pricing
  const found = pricing.find(p =>
    p.category === "french" &&
    p.container === containerType &&
    normalizeSize(p.size) === normalizeSize(sizeValue)
  );

  return found?.price || 0;
}

  return 0;
};  

const handleCheckout = async (params) => {
  const {
    customerName,
    customerPhone,
    playCheckoutSound,
    salesName,
    user,
    paymentMethod,
    selectedBranch,
    setToastText,
    setShowToast,
    setLoadingCheckout,
    setContainerType,
    setSelectedSize,
    setSelectedProduct,
    setOilQty,
    setDiscount,
    setPaymentMethod,
    setCustomerName,
    setCustomerPhone,
  } = params;
  const sellerName =

  typeof salesName === "string"

    ? salesName

    : salesName?.name || "";
if (!paymentMethod) {
  showToast(setToastText, setShowToast,"اختار طريقة الدفع ❗");
  return;
}

if (cart.length === 0) {
  showToast(setToastText, setShowToast,"الكارت فاضي ❗");
  return;
}

if (!selectedBranch || selectedBranch === "all") {
  showToast(setToastText, setShowToast,"اختار فرع الأول ❗");
  return;
}

if (!customerPhone?.trim()) {
  showToast(setToastText, setShowToast,"ادخل رقم التليفون ❗");
  return;
}

if (!customerName?.trim()) {
  showToast(setToastText, setShowToast,"ادخل اسم العميل ❗");
  return;
}
if (!sellerName.trim()) {
  showToast(
    setToastText,
    setShowToast,
    "ادخل اسم البائع ❗"
  );
  return;
}
  setLoadingCheckout(true);

  try {
    const invoiceNumber = await processCheckout({
      cart,
      branchToUse: selectedBranch,
      total,
      paymentMethod,
      customerName,
      customerPhone,

      seller: salesName,

      user
    });

    showToast(setToastText, setShowToast, `Invoice: ${invoiceNumber} ✅`);
    playCheckoutSound?.();
    setCart([]);
    localStorage.removeItem("cart");
    setContainerType("bottle");
    setSelectedSize(null);
    setSelectedProduct(null);
    setOilQty(0);
    setDiscount(0);
    setPaymentMethod("");
    setCustomerName("");
    setCustomerPhone("");

  } catch (error) {
    console.error(error);
    setToastText(error.message || "حصل خطأ ❌");
    setShowToast(true);
  }

  setLoadingCheckout(false);
};


return {
  cart,
  setCart,
  addToCart,
  removeItem,
  increaseQty,
  decreaseQty,
  subtotal,
  total,
  getPrice,
  handleCheckout,
};
}
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
  const getOilCompositionKey = (item) => {
  if (
    (item?.containerType || "").toLowerCase().trim() === "oil"
  ) {
    return "";
  }

  const components =
    Array.isArray(item?.oilComponents) &&
    item.oilComponents.length > 0
      ? item.oilComponents
      : Number(item?.oilQty) > 0
      ? [{
          oilId: item.oilId || item.id,
          quantityML: item.oilQty
        }]
      : [];

  return components
    .map(component =>
      `${normalize(component.oilId || component.id || "")}:${Number(
        component.quantityML ?? component.oilQty ?? 0
      )}`
    )
    .sort()
    .join("|");
};

const isSameCartItem = (a, b) => {
  if (!a || !b) return false;

  const sameBase =
    normalize(a.id) === normalize(b.id) &&
    normalize(a.size) === normalize(b.size) &&
    normalize(a.containerType) === normalize(b.containerType);

  if (!sameBase) return false;

  if (Boolean(a.isReturned) !== Boolean(b.isReturned)) {
    return false;
  }

  if (
    a.isReturned &&
    String(a.returnedItemId || "") !== String(b.returnedItemId || "")
  ) {
    return false;
  }

  return (
    getOilCompositionKey(a) ===
    getOilCompositionKey(b)
  );
};
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
  const isReturned = Boolean(product?.isReturned);

  const originalProduct = productsWithStock.find(
    p => p.id === product.id
  );

  // المنتج العادي لازم يكون موجود ومتوفر في المخزون
  // المنتج المرتجع له مخزون مستقل في returned_items
  if (!isReturned) {
    if (!originalProduct) return;

    if (Number(originalProduct.quantity) <= 0) {
      showToast(
        setToastText,
        setShowToast,
        "المنتج خلص ❌"
      );

      return;
    }
  }

  setCart(prev => {
    const existing = prev.find(
      item => isSameCartItem(item, product)
    );

    // كل قطعة مرتجعة لها مستند مستقل
    if (existing && isReturned) {
      return prev;
    }

    if (
      existing &&
      existing.qty >= Number(originalProduct.quantity)
    ) {
      showToast(
        setToastText,
        setShowToast,
        "وصلت لأقصى كمية ❌"
      );

      return prev;
    }

    if (existing) {
      return prev.map(item =>
        isSameCartItem(item, product)
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
const updateCartItem = (originalItem, updatedItem) => {
  setCart(prev =>
    prev.map(item =>
      isSameCartItem(item, originalItem)
        ? {
            ...updatedItem,
            qty: originalItem.qty ?? 1
          }
        : item
    )
  );

  return updatedItem.name;
};
const removeItem = (target) => {
  setCart(prev =>
    prev.filter(
      (item) =>
        !(
          isSameCartItem(item, target)
        )
    )
  );
};
const increaseQty = (target) => {
  if (target.isReturned) return;
  const product = productsWithStock.find(p => p.id === target.id);

  if (!product || product.quantity <= 0) return;

  if (target.containerType !== "oil" && target.qty >= product.quantity) {
    showToast(setToastText, setShowToast, "وصلت لأقصى كمية ❌");
    return;
  }

  setCart(prev =>
    prev.map(item =>
      isSameCartItem(item, target)
        ? item.containerType === "oil"
          ? (() => {
    const newMl = (item.selectedMl ?? item.oilQty) + 1;

    return {
      ...item,
      selectedMl: newMl,
      price: (item.pricePerMl || 0) * newMl
    };
  })()
          : {
              ...item,
              qty: item.qty + 1
            }
        : item
    )
  );
};
const decreaseQty = (target) => {
  setCart(prev =>
    prev
      .map(item =>
        isSameCartItem(item, target)
          ? item.containerType === "oil"
            ? (() => {
  const newMl = (item.selectedMl ?? item.oilQty) - 1;

  return {
    ...item,
    selectedMl: newMl,
    price: (item.pricePerMl || 0) * newMl
  };
})()
            : {
                ...item,
                qty: item.qty - 1
              }
          : item
      )
      .filter(item =>
        item.containerType === "oil"
          ? (item.selectedMl ?? item.oilQty) > 0
          : item.qty > 0
      )
  );
};
const subtotal = cart.reduce((sum, item) => {
  if (item.containerType === "oil") {
    return (
      sum +
      (item.pricePerMl || 0) *
      (item.selectedMl ?? item.oilQty ?? 0)
    );
  }

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

// 🟢 Musk Oil = Oriental B Oil Price
if (
  category.includes("musk")
) {

  const found = pricing.find(
    p =>
      p.category === "oriental_oil" &&
      p.grade === "B"
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
  

 // 🔥 MUSK = Same Pricing as Oriental Grade B
const isMuskProduct =
  cat.includes("musk") ||
  product.subCategory?.toLowerCase() === "musk";

if (isMuskProduct) {

  // 📦 BOX = Selected French Box Price + Oriental B Extra
  if (containerType === "box") {

    const basePrice = Number(
      size?.sellingPrice ??
      size?.price ??
      0
    );

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return 0;
    }

    const extraPricing = pricing.find(
      p =>
        p.category === "box_extra" &&
        String(p.grade).toUpperCase() === "B"
    );

    const extraPrice = Number(extraPricing?.price ?? 0);

    return basePrice + (
      Number.isFinite(extraPrice) ? extraPrice : 0
    );
  }

  // 🧴 BOTTLE / SAMPLE = Oriental B Pricing
  const found = pricing.find(
    p =>
      p.category === "oriental" &&
      p.grade === "B" &&
      p.container === containerType &&
      normalizeSize(p.size) === normalizeSize(sizeValue)
  );

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


    // 🔥 Oriental BOX = Selected French Box Price + Grade Extra
    const basePrice = Number(
      size?.sellingPrice ??
      size?.price ??
      0
    );

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return 0;
    }

    const extraPricing = pricing.find(
      p =>
        p.category === "box_extra" &&
        String(p.grade).toUpperCase() === grade
    );

    const extraPrice = Number(extraPricing?.price ?? 0);

    return basePrice + (
      Number.isFinite(extraPrice) ? extraPrice : 0
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

const handleCheckout = async (
  params = {}
) => {
  const {
    customerName,
    customerPhone,
    saleDate,
    setSaleDate,
    playCheckoutSound,
    employeeId,
    employeeName,
    user,
    paymentMethod,

// Split Payment
    isSplitPayment = false,
    splitPayments = {},
    setIsSplitPayment,
    setSplitPayments,

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
// ====================================
// PAYMENT VALIDATION
// ====================================

let checkoutPayments = [];

let resolvedPaymentMethod = paymentMethod;

if (isSplitPayment) {

  const allowedMethods = [
    "cash",
    "visa",
    "instapay"
  ];

  const invalidAmount = Object.entries(
    splitPayments || {}
  ).some(([method, value]) => {
    return (
      allowedMethods.includes(method) &&
      value !== "" &&
      (
        !Number.isFinite(Number(value)) ||
        Number(value) < 0
      )
    );
  });

  if (invalidAmount) {
    showToast(
      setToastText,
      setShowToast,
      "راجع مبالغ الدفع ❗"
    );
    return;
  }

  checkoutPayments = allowedMethods
    .map(method => ({
      method,
      amount: Number(splitPayments?.[method] || 0)
    }))
    .filter(payment => payment.amount > 0);

  if (checkoutPayments.length === 0) {
    showToast(
      setToastText,
      setShowToast,
      "أدخل مبلغ دفع واحد على الأقل ❗"
    );
    return;
  }

  const paidCents = checkoutPayments.reduce(
    (sum, payment) =>
      sum + Math.round(payment.amount * 100),
    0
  );

  const totalCents = Math.round(
    Number(total || 0) * 100
  );

  if (paidCents < totalCents) {
    showToast(
      setToastText,
      setShowToast,
      "المبلغ المدفوع أقل من إجمالي الفاتورة ❗"
    );
    return;
  }

  if (paidCents > totalCents) {
    showToast(
      setToastText,
      setShowToast,
      "المبلغ المدفوع أكبر من إجمالي الفاتورة ❗"
    );
    return;
  }

  resolvedPaymentMethod =
    checkoutPayments.length > 1
      ? "mixed"
      : checkoutPayments[0].method;

} else {

  if (!paymentMethod) {
    showToast(
      setToastText,
      setShowToast,
      "اختار طريقة الدفع ❗"
    );
    return;
  }

  checkoutPayments = [
    {
      method: paymentMethod,
      amount: Number(total || 0)
    }
  ];
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
if (!employeeId || !employeeName?.trim()) {
  showToast(
    setToastText,
    setShowToast,
    "اختر الموظف ❗"
  );
  return;
}

  setLoadingCheckout(true);

  try {
    const invoiceNumber = await processCheckout({
  cart,
  branchToUse: selectedBranch,
  total,
  subtotal,
  discount,

  paymentMethod: resolvedPaymentMethod,
  payments: checkoutPayments,

  customerName,
  customerPhone,

  employeeId,
  employeeName,
  saleDate,
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
    setIsSplitPayment?.(false);

    setSplitPayments?.({
      cash: "",
      visa: "",
      instapay: ""
    });
    setCustomerName("");
    setCustomerPhone("");
    setSaleDate?.("");

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
  updateCartItem,
  removeItem,
  increaseQty,
  decreaseQty,
  subtotal,
  total,
  getPrice,
  handleCheckout,
};
}
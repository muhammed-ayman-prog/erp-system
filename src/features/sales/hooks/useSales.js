import { useState } from "react";
import { db } from "../../../firebase";
import {
  runTransaction,
  doc,
  addDoc,
  collection,
  serverTimestamp,
  increment,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,      
  deleteDoc    
} from "firebase/firestore";
import { processCheckout } from "../services/checkoutService";
import { showToast } from "../../../utils/toast";
export function useSales(productsWithStock, discount, pricing) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
  const originalProduct = productsWithStock.find(p => p.id === product.id);

if (!originalProduct) return;

if (originalProduct.quantity <= 0) {
  alert("المنتج خلص ❌");
  return; 
}

const existing = cart.find(
  (item) =>
    item.id === product.id &&
    item.size === product.size &&
    item.containerType === product.containerType
);

if (existing && existing.qty >= originalProduct.quantity) {
  showToast(setToastText, setShowToast,"وصلت لأقصى كمية ❌");
  return;
}

  if (existing) {
    setCart(prev =>
      prev.map((item) =>
        item.id === product.id &&
        item.size === product.size &&
        item.containerType === product.containerType
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  } else {
      setCart(prev => [
  ...prev,
  {
    ...product,
    qty: 1,
    category: product.category 
  }
]);
    }

  
  return product.name;

  
};
const removeItem = (target) => {
  setCart(prev =>
    prev.filter(
      (item) =>
        !(
          item.id === target.id &&
          item.size === target.size &&
          item.containerType === target.containerType
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
      item.id === target.id &&
      item.size === target.size &&
      item.containerType === target.containerType
        ? { ...item, qty: item.qty + 1 }
        : item
    )
  );
};
  const decreaseQty = (target) => {
    setCart(prev =>
      prev
        .map((item) =>
          item.id === target.id &&
          item.size === target.size &&
          item.containerType === target.containerType
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
     const cat = product.category?.toLowerCase() || "";
    containerType = containerType?.toLowerCase().trim();
  const normalize = (s) =>
    s?.toLowerCase().replace(/\s/g, "").trim();

  const normalizeSize = (s) =>
    s?.toLowerCase().replace(/\s/g, "");

  // 🟢 FIX container naming
  // 🟣 READY PRODUCTS (fixed price)
  if (product.price > 0) return product.price;

  // 🔥 MUSK (sample only)
  const isMuskProduct =
  cat.includes("musk") ||
  product.subCategory?.toLowerCase() === "musk";



if (isMuskProduct) {
  const type = product.muskType || "tahara"; // مهم

  const found = pricing.find(p =>
    p.category === `musk_${type}` &&
    p.container === "sample" &&
    normalizeSize(p.size) === normalizeSize(size)
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
  normalizeSize(p.size) === normalizeSize(size)
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

    const extra = grade === "A" ? 1000 : 600;

    return base.price + extra;
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
const handleCheckout = async (params) => {
  const {
    customerName,
    customerPhone,
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
    setCustomerPhone
  } = params;
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
  setLoadingCheckout(true);

  try {
    const invoiceNumber = await processCheckout({
    cart,
    branchToUse: selectedBranch,
    total,
    paymentMethod,
    customerName,
    customerPhone
  });

    showToast(setToastText, setShowToast, `Invoice: ${invoiceNumber} ✅`);
    setCart([]);
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
const handleCancelInvoice = async ({
  sale,
  setToastText,
  setShowToast
}) => {
  try {
    // 🟢 1) رجّع المخزون
    await Promise.all(
  sale.items.map(async (item) => {

    // 🧴 رجوع الكونتينر
    await addDoc(collection(db, "stock"), {
      productId: item.size,
      quantity: item.qty,
      type: "purchase",
      branchId: sale.branchId,
      createdAt: serverTimestamp()
    });

    await setDoc(
      doc(db, "inventory", `${sale.branchId}_${item.size}`),
      {
        quantity: increment(item.qty)
      },
      { merge: true }
    );

    // 🛢 رجوع الزيت
    if (item.oilQty > 0) {
      await addDoc(collection(db, "stock"), {
        productId: item.id,
        quantity: item.oilQty * item.qty,
        type: "purchase",
        branchId: sale.branchId,
        createdAt: serverTimestamp()
      });

      await setDoc(
        doc(db, "inventory", `${sale.branchId}_${item.id}`),
        {
          quantity: increment(item.oilQty * item.qty)
        },
        { merge: true }
      );
    }

  })
);

    // 🔴 2) تعديل الـ stats
    const statsRef = doc(db, "stats", "dashboard");
    const method = (sale.paymentMethod || "").toLowerCase();

    await setDoc(statsRef, {
  totalSales: increment(-sale.total),
  invoices: increment(-1),
  cash: increment(method === "cash" ? -sale.total : 0),
  visa: increment(method === "visa" ? -sale.total : 0),
  instapay: increment(method === "instapay" ? -sale.total : 0)
}, { merge: true });

    // ❌ 3) حذف الفاتورة
    await deleteDoc(doc(db, "sales", sale.id));

    showToast(setToastText, setShowToast,"تم إلغاء الفاتورة ✅");
    return;

    // 🔄 refresh

  } catch (err) {
    console.error(err);
    showToast(setToastText, setShowToast,"Error في الإلغاء");
    return;
  }
};
const handleRefundItem = async ({
  sale,
  item,
  setToastText,
  setShowToast
}) => {
  if (!item.qty || item.qty <= 0) {
  showToast(setToastText, setShowToast,"مفيش كمية تتعملها refund ❗");
  return;
}
  try {
    const cat = item.category?.toLowerCase() || "";
    const isComposed =
  cat === "french" ||
  cat.includes("oriental") ||
  cat.includes("musk");

    // 🔴 CASE 1: French / Oriental → Returned Items
    if (isComposed) {
      await addDoc(collection(db, "stock"), {
        productId: item.id,
        quantity: item.qty,
        type: "refund",
        branchId: sale.branchId,
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, "returned_items"), {
      productId: item.id,
      price: item.price,
      branchId: sale.branchId,
      size: item.size,
      containerType: item.containerType,
      containerName: item.containerName,
      status: "available",
      type: "perfume",
      createdAt: serverTimestamp()
    });
    }

    // 🟢 CASE 2: Ready Products
else {
  // 1. رجوع في stock (log)
  await addDoc(collection(db, "stock"), {
    productId: item.id,
    quantity: item.qty,
    type: "refund",
    branchId: sale.branchId,
    createdAt: serverTimestamp()
  });

  // 2. رجوع في inventory (real data)
  const ref = doc(db, "inventory", `${sale.branchId}_${item.id}`);

await setDoc(ref, {
  quantity: increment(item.qty)
}, { merge: true });
}

    // 🧾 تحديث الفاتورة (Partial Refund 🔥)
    const updatedItems = sale.items
      .map(i => {
        if (
          i.id === item.id &&
          i.containerType === item.containerType &&
          i.containerName === item.containerName
        ) {
          return { ...i, qty: i.qty - item.qty };
        }
        return i;
      })
      .filter(i => i.qty > 0);

    const newTotal = updatedItems.reduce(
      (sum, i) => sum + i.price * i.qty,
      0
    );

    await updateDoc(doc(db, "sales", sale.id), {
      items: updatedItems,
      total: newTotal,
      refunds: increment(item.qty)
    });

    showToast(setToastText, setShowToast,"تم Refund المنتج ✅");return;

  } catch (err) {
    console.error(err);
    showToast(setToastText, setShowToast,"Error في الريفاند ❌");return;
  }
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
  handleCancelInvoice,
  handleRefundItem
};
}
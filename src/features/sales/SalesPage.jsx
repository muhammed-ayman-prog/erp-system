import { db } from "../../firebase";
import { useEffect, useState } from "react";
import {
  collection,getDocs, query, where,
  doc, onSnapshot,
  orderBy, limit
} from "firebase/firestore";
import { useMemo } from "react";
import { useApp } from "../../store/useApp";
import { theme } from "../../theme";
import { useTranslate } from "../../useTranslate";
import { useNavigate } from "react-router-dom";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import ProductPopup from "./components/ProductPopup";
import { useSales } from "./hooks/useSales";
import { FlaskConical, Leaf, Sparkles, Star } from "lucide-react";
import { createPortal } from "react-dom";
const branchMap = {
  "Abbas Akkad 1": "abbasAkkad1",
  "Abbas Akkad 2": "abbasAkkad2",
  "Abbas Akkad 3": "abbasAkkad3",
  "City Stars": "cityStars",
  "El Obour": "elObour",
  "El Rehab": "elRehab"
};
export default function SalesPage() {
  const t = useTranslate();
  const translateBranch = (id) => {
  const name = getBranchName(id);
  return t(`branches.${branchMap[name]}`) || name;
};
  const [branches, setBranches] = useState([]);
  const getBranchName = (id) => {
  return branches.find(b => b.id === id)?.name || t("common.unknown");
};
  const [pricing, setPricing] = useState([]);
  useEffect(() => {
  const fetchPricing = async () => {
    const snap = await getDocs(collection(db, "pricing"));
    const data = snap.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
    setPricing(data);
  };

  fetchPricing();
}, []);
  const [user, setUser] = useState(null);
  const { selectedBranch } = useApp();
  const [sales, setSales] = useState([]);
  const [discount, setDiscount] = useState(0);
  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
if (storedUser) {
  setUser(storedUser);
}
}, []);
  
 
  

  
    const btnStyle = {
  padding: "12px 16px",
  margin: "6px",
  background: theme.colors.secondary,
  color: theme.colors.text,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: "12px",
  cursor: "pointer",
  transition: "0.2s"
};
  const [selectedProduct, setSelectedProduct] = useState(null);
  // ✅ ده متغير عادي
const isMusk =
  selectedProduct?.category?.toLowerCase()?.includes("musk") ||
  selectedProduct?.subCategory?.toLowerCase() === "musk";

// ✅ وده effect لوحده
useEffect(() => {
  if (isMusk) {
  setContainerType("sample");
  setSelectedSize(null);
}
}, [selectedProduct, isMusk]);
  const [showPopup, setShowPopup] = useState(false);
  const [containerType, setContainerType] = useState("bottle");
  const [oilQty, setOilQty] = useState(0);
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const productsWithStock = useMemo(() => {
  return products.map(p => ({
    ...p,
    quantity: inventoryMap[p.id] || 0
  }));
}, [products, inventoryMap]);
  const [search, setSearch] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");
  const [popupStep, setPopupStep] = useState(null);
  
  
 useEffect(() => {
  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

setProducts(data);
  };
  

  fetchProducts();
}, []); // 🔥 مرة واحدة بس

useEffect(() => {
  if (!selectedBranch) return;

  // 🟢 ALL → كل الفروع
  if (selectedBranch === "all") {
    const unsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const map = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.productId) return;

        map[data.productId] =
          (map[data.productId] || 0) + data.quantity;
      });

      setInventoryMap(map);
    });

    return () => unsub();
  }

  // 🔥 Branch معين
  const unsub = onSnapshot(
    query(
      collection(db, "inventory"),
      where("branchId", "==", selectedBranch)
    ),
    (snapshot) => {
      const map = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.productId) return;

        map[data.productId] = data.quantity;
      });

      setInventoryMap(map);
    }
  );

  return () => unsub();

}, [selectedBranch]);
useEffect(() => {
  const fetchBranches = async () => {
    const snap = await getDocs(collection(db, "branches"));

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setBranches(data);
  };

  fetchBranches();
}, []);

useEffect(() => {
  if (!showToast) return;

  const t = setTimeout(() => {
    setShowToast(false);
  }, 1500);

  return () => clearTimeout(t);
}, [showToast]);
useEffect(() => {
  if (selectedBranch === undefined || user === null) return;

  const branchToUse = selectedBranch;

  let q;

  if (branchToUse === "all") {
    q = query(
      collection(db, "sales"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  } else {
    q = query(
      collection(db, "sales"),
      where("branchId", "==", branchToUse),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setSales(data);
  });

  return () => unsubscribe();
}, [selectedBranch, user]);

const {
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
} = useSales(productsWithStock, discount, pricing);
  
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainTab, setMainTab] = useState("french");
  const [subTab, setSubTab] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  useEffect(() => {
  if (!customerPhone || customerPhone.length < 10) return;

  const fetchCustomer = async () => {
    try {
      const q = query(
        collection(db, "customers"),
        where("phone", "==", customerPhone.trim())
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setCustomerName(snapshot.docs[0].data().name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchCustomer();
}, [customerPhone]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
const cleanSize = selectedSize?.name
  ?.replace("Bottle ", "")
  ?.trim();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const isMobile = window.innerWidth < 768;
  return (
  <>
  
{showCart && (
  <div
    onClick={() => setShowCart(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.3)",
      zIndex: 999
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100%",
        width: isMobile ? "100%" : "360px",
        background: "#fff",
        padding: "10px",
        overflowY: "auto",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.2)"
      }}
    >

      {/* زرار قفل */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
      }}>
        <h3>{t("cart.title")} 🧾</h3>
        <button onClick={() => setShowCart(false)}>✖</button>
      </div>

      <Cart
        cart={cart}
        setCart={setCart}
        theme={theme}
        t={t}
        increaseQty={increaseQty}
        decreaseQty={decreaseQty}
        removeItem={removeItem}
        setSelectedProduct={setSelectedProduct}
        setSelectedSize={setSelectedSize}
        setContainerType={setContainerType}
        setOilQty={setOilQty}
        setShowPopup={setShowPopup}
        productsWithStock={productsWithStock}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        subtotal={subtotal}
        discount={discount}
        setDiscount={setDiscount}
        total={total}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handleCheckout={(salesName) =>
          handleCheckout({
            customerName,
            customerPhone,
            paymentMethod,
            selectedBranch,

            // 👇 الجديد
            salesName,
            user,

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
          })
        }
        loadingCheckout={loadingCheckout}
        selectedBranch={selectedBranch}
        user={user}
      />
    </div>
  </div>
)}
    <div className="sales-layout" style={{
  display: isMobile ? "block" : "grid",
  gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
  width: "100%",
  alignItems: "start"
}}>
  
    
      
      {/* المنتجات */}
      <div className="left-side" style={{
  marginBottom: isMobile ? "10px" : "0"
}}>

  {/* نخفي العنوان في الموبايل */}
  {!isMobile && (
    <div className="cat-title">
      📦 {t("products.categories")}
    </div>
  )}

  {/* 🔥 ده الجديد */}
  <div
    style={{
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      overflowX: isMobile ? "auto" : "visible",
      gap: "8px",
      scrollBehavior: "smooth"
    }}
  >

    <div
      className={`cat-item ${mainTab === "french" ? "active" : ""}`}
      onClick={() => { setMainTab("french"); setSubTab(null); }}
    >
      <FlaskConical size={16} />
      {t("products.french")}
    </div>

    <div
      className={`cat-item ${mainTab === "oriental" ? "active" : ""}`}
      onClick={() => {
        setPopupStep("oriental");
        setShowPopup(true);
      }}
    >
      <Leaf size={16} />
      {t("products.oriental")}
    </div>

    <div
      className={`cat-item ${mainTab === "body" ? "active" : ""}`}
      onClick={() => {
        setPopupStep("body");
        setShowPopup(true);
      }}
    >
      <Sparkles size={16} />
      {t("products.body")}
    </div>

    <div
      className={`cat-item ${mainTab === "original" ? "active" : ""}`}
      onClick={() => { setMainTab("original"); setSubTab(null); }}
    >
      <Star size={16} />
      {t("products.original")}
    </div>

  </div>
</div>
        <div style={{
  padding: isMobile ? "10px" : "12px 12px 12px 0",
  maxHeight: isMobile ? "none" : "calc(100vh - 140px)"
  
}}>
          <div className="middle-layout" style={{ width: "100%" }}>

  {/* 🔝 Top */}
  <div className="top-bar"
  style={{
  display: "flex",
  flexWrap: "wrap", // 🔥 مهم
  gap: "10px",
  alignItems: "center",
  marginBottom: "12px"
}}>

    {/* Header */}
    <div style={{
      flex: 1,
      padding: "12px 16px",
      borderRadius: "14px",
      background: theme.colors.card,
      border: `1px solid ${theme.colors.border}`
    }}>
      <div style={{ fontSize: "18px", fontWeight: "700" }}>
        🧾 {t("navigation.sales")}
      </div>

      <div style={{
        fontSize: "12px",
        color: theme.colors.textSecondary
      }}>
        {t("branches.title")}: {selectedBranch ? translateBranch(selectedBranch) : "—"}
      </div>
    </div>

    {/* زرار */}
    <div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  width: isMobile ? "100%" : "auto"
}}>

  {/* 📄 Invoices */}
  <button
    onClick={() => navigate("/invoices")}
    style={{
      padding: "10px 14px",
      borderRadius: "10px",
      background: theme.colors.primary,
      color: "#fff",
      border: "none",
      fontWeight: "600",
      cursor: "pointer"
    }}
  >
    📄 {t("invoices.title")}
  </button>

  {/* 🛒 Cart */}
  <div
  className="cart-btn"
    style={{
    width: isMobile ? "100%" : "auto",
    textAlign: "center",
    padding: "10px",
    borderRadius: "10px",
    background: theme.colors.secondary,
    border: `1px solid ${theme.colors.border}`,
    cursor: "pointer",
    fontWeight: "600"
  }}
  onClick={() => setShowCart(true)}
>
    🛒 {t("cart.title")}
<span style={{
  background: "#ef4444",
  borderRadius: "50%",
  padding: "2px 6px",
  fontSize: "11px",
  marginLeft: "6px"
}}>
  {cart.reduce((sum, item) => sum + item.qty, 0)}
</span>
  </div>

</div>

  </div>

  {/* 🔍 Search */}
  <input
    type="text"
    placeholder={`🔍 ${t("products.search")}`}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: "100%",
      maxWidth: "100%",
      padding: "14px 16px",
      borderRadius: "12px",
      background: theme.colors.card,
      border: `1px solid ${theme.colors.border}`,
      marginBottom: "12px"
    }}
  />

  {/* 🧴 Products */}
  


        
        <ProductGrid
  productsWithStock={productsWithStock}
  search={search}
  mainTab={mainTab}
  subTab={subTab}
  theme={theme}
  t={t}
  onSelectProduct={(p) => {
    if (mainTab === "original") {
  const name = addToCart({
    ...p,
    size: "Standard",
    containerType: "Original",
    containerName: "Original",   // 👈 أضف دي
    price: p.price
  });

if (name) {
  setToastText(`${name} ${t("cart.added")}`);
  setShowToast(true);
}
      return;
    }

    if (
      mainTab === "body" &&
      (subTab?.toLowerCase() === "cream" ||
       subTab?.toLowerCase() === "makhmaria")
    ) {
      addToCart({
  ...p,
  size: selectedSize?.name,
  containerType: containerType,
  containerName: selectedSize?.name, // 🔥 أهم سطر
})
      return;
    }

    setSelectedProduct(p);
    setPopupStep(null);
    setShowPopup(true);
  }}
/>
        
        <ProductPopup 
        setToastText={setToastText}
        setShowToast={setShowToast}
        showPopup={showPopup}
        selectedProduct={selectedProduct}
        popupStep={popupStep}
        setPopupStep={setPopupStep}
        setShowPopup={setShowPopup}
        theme={theme}
        btnStyle={btnStyle}
        t={t}
        setSubTab={setSubTab}
        setMainTab={setMainTab}
        isMusk={isMusk}
        containerType={containerType}
        setContainerType={setContainerType}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        productsWithStock={productsWithStock}
        inventoryMap={inventoryMap}
        oilQty={oilQty}
        setOilQty={setOilQty}
        addToCart={addToCart}
        getPrice={getPrice}
/>
      </div>
    </div>
      {/* الكارت */}

    {showToast &&
  createPortal(
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        background: theme.colors.primary,
        padding: "12px 20px",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.2)",
        zIndex: 9999,   // 👈 احتياطي بس
        animation: "fadeSlide 0.3s ease"
      }}
    >
      {toastText}
    </div>,
    document.body
  )
}
    </div>
    
    
  </>
  );
}

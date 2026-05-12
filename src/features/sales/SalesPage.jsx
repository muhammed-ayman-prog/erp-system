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
  const [loadingProducts, setLoadingProducts] = useState(true);
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

    const data = snap.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(product => !product.isArchived);

    setProducts(data);
    setLoadingProducts(false);
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

        map[data.productId] =
  (map[data.productId] || 0)
  + data.quantity;
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
  const [customerData, setCustomerData] = useState(null);
  useEffect(() => {

  const fetchCustomer = async () => {

    const normalizedPhone = customerPhone
      .replace(/\s/g, "")
      .replace("+2", "")
      .trim();

    if (!normalizedPhone || normalizedPhone.length < 10) {
      setCustomerData(null);
      return;
    }

    try {

      const q = query(
        collection(db, "customers"),
        where("phone", "==", normalizedPhone)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {

        const data = snapshot.docs[0].data();

        setCustomerName(data.name || "");

        setCustomerData(data);
        console.log("✅ Customer Found:", data.name);

      } else {

        setCustomerData(null);
        setCustomerName("");
      }

    } catch (err) {

      console.error(err);
    }
  };

  fetchCustomer();

}, [customerPhone]);
useEffect(() => {

  const raw =
    localStorage.getItem("returnedCart");

  if (!raw) return;

  localStorage.removeItem("returnedCart");

  const returned = JSON.parse(raw);

  if (!returned.length) return;

  setCart(prev => {

    const merged = [...prev];

    returned.forEach(item => {

      const exists = merged.find(
        i => i.returnedItemId === item.returnedItemId
      );

      if (!exists) {
        merged.push(item);
      }
    });

    return merged;
  });

  setShowCart(true);

}, []);
useEffect(() => {

  if (!selectedBranch) return;

  let q;

  if (selectedBranch === "all") {

    q = collection(db, "returned_items");

  } else {

    q = query(
      collection(db, "returned_items"),
      where("branchId", "==", selectedBranch)
    );
  }

  const unsub = onSnapshot(q, (snap) => {

    const data = snap.docs
      .map(d => ({
        id: d.id,
        ...d.data()
      }))
      .filter(i => i.status === "available");

    setReturnedItems(data);
  });

  return () => unsub();

}, [selectedBranch]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
const cleanSize = selectedSize?.name
  ?.replace("Bottle ", "")
  ?.trim();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [showReturned, setShowReturned] = useState(false);

const [returnedItems, setReturnedItems] = useState([]);

const [returnedSearch, setReturnedSearch] = useState("");
  const [isMobile, setIsMobile] =
  useState(window.innerWidth < 768);

useEffect(() => {

  const handleResize = () => {
    setIsMobile(
      window.innerWidth < 768
    );
  };

  window.addEventListener(
    "resize",
    handleResize
  );

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );

}, []);
  const getCustomerTier = (customer) => {

  const spent = customer?.totalSpent || 0;
  const orders = customer?.ordersCount || 0;

  if (spent >= 50000 && orders >= 25) {
    return {
      label: "Elite 👑",
      background: "#ede9fe"
    };
  }

  if (spent >= 15000 && orders >= 10) {
    return {
      label: "VIP 💎",
      background: "#fef3c7"
    };
  }

  if (orders >= 5 || spent >= 6000) {
    return {
      label: "Loyal 🔁",
      background: "#dbeafe"
    };
  }

  return {
    label: "New 🆕",
    background: "#e2e8f0"
  };
};
const visibleProducts = productsWithStock
  .filter(p => {

    const tab = (mainTab || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();

    if (tab === "french") {
      return cat.includes("french");
    }

    if (tab === "oriental") {

      if (subTab) {

        const parts = cat.split("-");

        return (
          parts[0] === "oriental" &&
          parts[1] === subTab.toLowerCase()
        );
      }

      return cat.includes("oriental");
    }

    if (tab === "body") {

      if (subTab) {
        return cat.includes(subTab.toLowerCase());
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
  .filter(p =>
    (p.name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase()) ||

    (p.category || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  const playCheckoutSound = () => {

  const audio = new Audio(
    "/sounds/success.mp3"
  );

  audio.volume = 0.7;

  audio.play();
};
  return (
  <>
{showReturned && (
  <div
    onClick={() => setShowReturned(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >

    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "95%",
        maxWidth: "900px",
        maxHeight: "90vh",
        overflowY: "auto",
        background: theme.colors.background,
        borderRadius: "20px",
        padding: "20px"
      }}
    >

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px"
      }}>
        <h2>📦 Returned Items</h2>

        <button
          onClick={() => setShowReturned(false)}
        >
          ✖
        </button>
      </div>

      <input
        placeholder="Search..."
        value={returnedSearch}
        onChange={(e) =>
          setReturnedSearch(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "12px",
          marginBottom: "15px",
          border: `1px solid ${theme.colors.border}`
        }}
      />

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "12px"
      }}>

        {returnedItems
          .filter(i =>
            (i.name || "")
              .toLowerCase()
              .includes(returnedSearch.toLowerCase())
          )
          .map(item => (

          <div
            key={item.id}
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "16px",
              padding: "14px",
              background: theme.colors.card
            }}
          >

            <div style={{
              fontWeight: "700",
              marginBottom: "6px"
            }}>
              {item.name}
            </div>

            <div style={{
              fontSize: "13px",
              opacity: 0.7,
              marginBottom: "10px"
            }}>
              {item.containerName}
            </div>

            <div style={{
              fontWeight: "700",
              color: theme.colors.primary,
              marginBottom: "10px"
            }}>
              {item.price} EGP
            </div>

            <button
              onClick={() => {
                if (
                  selectedBranch !== "all" &&
                  item.branchId !== selectedBranch
                ) {
                  return;
                }

                // ✅ منع التكرار
                const alreadyExists = cart.find(
                  c =>
                    c.returnedItemId === item.id
                );

                if (alreadyExists) {
                  return;
                }
                addToCart({
                  id: item.productId,
                  name: item.name,
                  price: item.price,
                  qty: 1,

                  containerType:
                    item.containerType || "",

                  containerName:
                    item.containerName || "",

                  isReturned: true,

                  returnedItemId: item.id,

                  returnId: item.returnId,

                  branchId: item.branchId
                });

                setShowReturned(false);

                setShowCart(true);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: theme.colors.primary,
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Add To Cart 🛒
            </button>

          </div>
        ))}

      </div>
    </div>
  </div>
)}
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
        background: theme.colors.background,
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
        customerData={customerData}
        getCustomerTier={getCustomerTier}
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
        handleCheckout={(params) =>
          handleCheckout({
            ...params,
            playCheckoutSound,
            customerName,
            customerPhone,

            paymentMethod,
            selectedBranch,

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
  <button
  onClick={() => setShowReturned(true)}
  style={{
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    fontWeight: "600",
    cursor: "pointer"
  }}
>
  📦 Returned ({returnedItems.length})
</button>
</div>

  </div>

  {/* 🔍 Search */}
  <div style={{
  position: "relative",
  marginBottom: "12px"
}}>

  <span style={{
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    opacity: 0.5,
    fontSize: "14px"
  }}>
    🔍
  </span>

  <input
    type="text"
    placeholder={t("products.search")}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: "100%",
      padding: "14px 16px 14px 40px",
      borderRadius: "12px",
      background: theme.colors.card,
      border: `1px solid ${theme.colors.border}`
    }}
  />

</div>

  {/* 🧴 Products */}
  


        <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "14px"
}}>

  <div>

    <div style={{
      fontSize: "18px",
      fontWeight: "700"
    }}>
      {mainTab === "french" && "French Perfumes "}

      {mainTab === "oriental" &&
        `Oriental ${subTab?.toUpperCase() || ""} 🌿`
      }

      {mainTab === "body" &&
        `${subTab || "Body Products"} ✨`
      }

      {mainTab === "original" && "Originals ⭐"}
    </div>

    <div style={{
      fontSize: "12px",
      color: theme.colors.textSecondary,
      marginTop: "3px"
    }}>
      {
        visibleProducts.filter(
          p => p.quantity > 0
        ).length
      } Products Available
    </div>

  </div>

</div>
        {loadingProducts ? (

  <div style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(160px,1fr))",
    gap: "14px"
  }}>

    {[...Array(8)].map((_, i) => (

      <div
        key={i}
        style={{
          height: "140px",
          borderRadius: "16px",
          background: "#f1f5f9",
          animation: "pulse 1.2s infinite"
        }}
      />

    ))}

  </div>

) : (

  <>
  
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
            containerName: "Original",
            price: p.price
          });

          if (name) {
            setToastText(`${name} ${t("cart.added")}`);
            setShowToast(true);
          }

          return;
        }

        const isReadyBodyProduct =
          mainTab === "body" &&
          !p.category?.toLowerCase()?.includes("musk");

        if (isReadyBodyProduct) {

          addToCart({
            ...p,

            size: "Ready",

            containerType:
              p.category?.toLowerCase()?.includes("cream")
                ? "Cream"
                : "مخمرية",

            containerName:
              p.category?.toLowerCase()?.includes("cream")
                ? "Cream"
                : "مخمرية",

            containerId: null,

            oilQty: 0
          });

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

  </>

)}
      </div>
    </div>
      {/* الكارت */}

    {cart.length > 0 && (
    <button
  onClick={() => setShowCart(true)}

  style={{
    position: "fixed",

    bottom: "24px",

    right: isMobile ? "16px" : "24px",

    zIndex: 999,

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    gap: "2px",

    minWidth: isMobile ? "68px" : "82px",
    minHeight: isMobile ? "68px" : "82px",

    borderRadius: "999px",

    background: theme.colors.primary,

    color: "#fff",

    border: "none",

    cursor: "pointer",

    boxShadow:
      `0 12px 30px ${theme.colors.primary}55`,

    transition: "0.2s ease",
    backdropFilter: "blur(10px)",
  }}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "translateY(-3px) scale(1.03)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "translateY(0) scale(1)";
  }}
>

  <div style={{
    fontSize: isMobile ? "22px" : "26px"
  }}>
    🛒
  </div>

  <div style={{
  position: "absolute",
  top: "-4px",
  right: "-4px",

  minWidth: "24px",
  height: "24px",

  borderRadius: "999px",

  background: "#ef4444",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: "11px",
  fontWeight: "700",

  color: "#fff",

  border: "2px solid white"
}}>
  {cart.reduce((sum, item) => sum + item.qty, 0)}
</div>

<div style={{
  fontSize: "11px",
  fontWeight: "700",
  marginTop: "2px"
}}>
  {Number(total).toLocaleString()} EGP
</div>

</button>
)}
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

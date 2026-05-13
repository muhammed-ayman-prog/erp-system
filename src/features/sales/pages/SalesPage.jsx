import {
  useEffect,
  useMemo,
  useState
} from "react";
import { useApp } from "../../../store/useApp";
import { theme } from "../../../theme";
import { useTranslate } from "../../../useTranslate";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";
import ProductPopup from "../components/ProductPopup";
import { useSales } from "../hooks/useSales";
import { useProducts } from "../hooks/useProducts";
import SalesCategories from "../components/SalesCategories";
import SalesSearch from "../components/SalesSearch";
import SalesHeader from "../components/SalesHeader";
import FloatingCart from "../components/FloatingCart";
import ReturnedModal from "../components/ReturnedModal";
import ProductsHeader from "../components/ProductsHeader";
import CartDrawer from "../components/CartDrawer";
import { useResponsive } from "../../../hooks/useResponsive";
import AppToast from "../../../components/AppToast";
import {
  useCustomerLookup
} from "../../customers/hooks/useCustomerLookup";
import { useToast } from "../../../hooks/useToast";
import { useAudio } from "../../../hooks/useAudio";
import { useMounted } from "../../../hooks/useMounted";
import {
  useReturnedItems
} from "../../returns/hooks/useReturnedItems";
const branchMap = {
  "Abbas Akkad 1": "abbasAkkad1",
  "Abbas Akkad 2": "abbasAkkad2",
  "Abbas Akkad 3": "abbasAkkad3",
  "City Stars": "cityStars",
  "El Obour": "elObour",
  "El Rehab": "elRehab"
};
export default function SalesPage() {
  const { t, tt, lang } = useTranslate();
  const translateBranch = (id) => {
  const name = getBranchName(id);
  return t(`branches.${branchMap[name]}`) || name;
};
  const getBranchName = (id) => {
  return branches.find(b => b.id === id)?.name || t("common.unknown");
};
  
  const [user, setUser] = useState(null);
  const { selectedBranch } = useApp();
  const {
  productsWithStock,
  loadingProducts,
  inventoryMap,
  branches,
  pricing
} = useProducts(selectedBranch);
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

  const [search, setSearch] = useState("");
  const [popupStep, setPopupStep] = useState(null);
  const {
    showToast,
    toastText,

    setShowToast,
    setToastText,

  } = useToast();

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
 } = useSales(
  productsWithStock,
  discount,
  pricing,
  {
    setToastText,
    setShowToast
  }
);
  
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainTab, setMainTab] = useState("french");
  const [subTab, setSubTab] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  
  
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
      if (!item.returnedItemId) return;
        merged.push(item);
      }
    });

    return merged;
  });

  setShowCart(true);

}, []);
const {
  returnedItems
} = useReturnedItems(
  selectedBranch
);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [showReturned, setShowReturned] = useState(false);
const [returnedSearch, setReturnedSearch] = useState("");
const { isMobile } = useResponsive();

const normalizedSearch =
  search.trim().toLowerCase();
const normalizedReturnedSearch =
  returnedSearch
    .trim()
    .toLowerCase();
const visibleProducts = useMemo(() => {
  return productsWithStock
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
  .sort((a, b) => {

  if (a.quantity > 5 && b.quantity <= 5) return -1;
  if (a.quantity <= 5 && b.quantity > 5) return 1;

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
    .localeCompare(b.name || "");
})
  .filter(p =>
    (p.name || "")
      .toLowerCase()
      .includes(normalizedSearch) ||

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

const {
  play: playCheckoutSound
} = useAudio(
  "/sounds/success.mp3"
);
const mounted = useMounted();
const cartCount = useMemo(
  () =>
    cart.reduce(
      (sum, item) => sum + item.qty,
      0
    ),
  [cart]
);
const {
  customerName,
  setCustomerName,

  customerPhone,
  setCustomerPhone,

  customerData,

  getCustomerTier
} = useCustomerLookup();
 

const popupState = {
  popupStep,
  setPopupStep,

  showPopup,
  setShowPopup,

  containerType,
  setContainerType,

  selectedSize,
  setSelectedSize,

  oilQty,
  setOilQty
};
const customerState = {
  customerName,
  setCustomerName,

  customerPhone,
  setCustomerPhone,

  customerData,

  getCustomerTier
};
const checkoutState = {
  subtotal,

  discount,
  setDiscount,

  total,

  paymentMethod,
  setPaymentMethod,

  loadingCheckout
};
const popupActions = {
  setSelectedProduct,
  setSelectedSize,
  setContainerType,
  setOilQty,
  setShowPopup
};

return (
  <>
<ReturnedModal
  showReturned={showReturned}
  setShowReturned={setShowReturned}
  lang={lang}
  returnedSearch={returnedSearch}
  setReturnedSearch={setReturnedSearch}
  returnedItems={returnedItems}
  normalizedReturnedSearch={normalizedReturnedSearch}
  selectedBranch={selectedBranch}
  cart={cart}
  addToCart={addToCart}
  setShowCart={setShowCart}
  theme={theme}
  t={t}
/>
<CartDrawer
  showCart={showCart}
  setShowCart={setShowCart}
  lang={lang}
  isMobile={isMobile}
  theme={theme}
  t={t}
>

  <Cart
    popupActions={popupActions}
    customerState={customerState}
    checkoutState={checkoutState}
    cart={cart}
    setCart={setCart}
    theme={theme}
    t={t}
    increaseQty={increaseQty}
    decreaseQty={decreaseQty}
    removeItem={removeItem}
    productsWithStock={productsWithStock}
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
    selectedBranch={selectedBranch}
    user={user}
  />

</CartDrawer>
    <div className="sales-layout" style={{
  direction:
  lang === "ar"
    ? "rtl"
    : "ltr",
  display: isMobile ? "block" : "grid",
  gridTemplateColumns:
  isMobile
    ? "1fr"
    : "220px 1fr",
  width: "100%",
  alignItems: "start"
}}>
  
    
      
      {/* المنتجات */}
      <div className="left-side" 
      style=
      {{order:
        lang === "ar" ? 1 : 1,
        marginBottom: isMobile ? "10px" : "0"
      }}>

  {/* نخفي العنوان في الموبايل */}
  {!isMobile && (
    <div className="cat-title">
      📦 {t("products.categories")}
    </div>
  )}

  <SalesCategories
  isMobile={isMobile}
  mainTab={mainTab}
  setMainTab={setMainTab}
  setSubTab={setSubTab}
  setPopupStep={setPopupStep}
  setShowPopup={setShowPopup}
  t={t}
/>
</div>
        <div style={{
          order:
            lang === "ar" ? 2 : 2,
          padding: isMobile ? "10px" : "12px 12px 12px 0",
          maxHeight: isMobile ? "none" : "calc(100vh - 140px)"
  
}}>
          <div className="middle-layout" style={{ width: "100%" }}>

  {/* 🔝 Top */}
  <SalesHeader
  isMobile={isMobile}
  selectedBranch={selectedBranch}
  translateBranch={translateBranch}
  navigate={navigate}
  setShowReturned={setShowReturned}
  returnedItems={returnedItems}
  theme={theme}
  t={t}
/>

  {/* 🔍 Search */}
  <SalesSearch
  lang={lang}
  search={search}
  setSearch={setSearch}
  theme={theme}
  t={t}
/>

<ProductsHeader
  mainTab={mainTab}
  subTab={subTab}
  visibleProducts={visibleProducts}
  theme={theme}
  t={t}
/>
  



        {loadingProducts ? (

  <div style={{
    display: "grid",
    gridTemplateColumns:
      isMobile
        ? "repeat(auto-fill,minmax(140px,1fr))"
        : "repeat(auto-fill,minmax(170px,1fr))",
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
      productsWithStock={visibleProducts}
      mainTab={mainTab}
      subTab={subTab}
      theme={theme}
      t={t}
      onSelectProduct={(p) => {

        if (mainTab === "original") {

          const name = addToCart({
            ...p,
            size: t("products.standard"),
            containerType: t("products.original"),
            containerName: t("products.original"),
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

            size: t("products.ready"),

            containerType:
              p.category?.toLowerCase()?.includes("cream")
                ? t("products.cream")
                : t("products.makhmaria"),

            containerName:
              p.category?.toLowerCase()?.includes("cream")
                ? t("products.cream")
                : t("products.makhmaria"),

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
  lang={lang}
  setToastText={setToastText}
  setShowToast={setShowToast}
  selectedProduct={selectedProduct}
  theme={theme}
  btnStyle={btnStyle}
  t={t}
  setSubTab={setSubTab}
  setMainTab={setMainTab}
  isMusk={isMusk}
  productsWithStock={productsWithStock}
  inventoryMap={inventoryMap}
  addToCart={addToCart}
  getPrice={getPrice}
  popupState={popupState}
/>

  </>

)}
      </div>
    </div>
      {/* الكارت */}

    <FloatingCart
  cart={cart}
  cartCount={cartCount}
  total={total}
  lang={lang}
  isMobile={isMobile}
  setShowCart={setShowCart}
  theme={theme}
/>
    <AppToast
  mounted={mounted}
  showToast={showToast}
  toastText={toastText}
  lang={lang}
  theme={theme}
/>
    </div>
    
    
  </>
  );
}

import {
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense
} from "react";
import { useApp } from "../../../store/useApp";
import { theme } from "../../../theme";
import { useTranslate } from "../../../useTranslate";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/cart/Cart";
import { useSales } from "../hooks/useSales";
import { useProducts } from "../hooks/useProducts";
import SalesCategories from "../components/SalesCategories";
import SalesSearch from "../components/SalesSearch";
import SalesHeader from "../components/SalesHeader";
import FloatingCart from "../components/cart/FloatingCart";
import ReturnedModal from "../components/ReturnedModal";
import ProductsHeader from "../components/ProductsHeader";
import CartDrawer from "../components/cart/CartDrawer";
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
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import {
  useVisibleProducts
} from "../hooks/useVisibleProducts";
import {
  useSelectProduct
} from "../hooks/useSelectProduct";
import {
  useCheckoutAction
} from "../hooks/useCheckoutAction";
import {
  useReturnedCart
} from "../hooks/useReturnedCart";
import {
  usePopupState
} from "../hooks/usePopupState";
import {
  SalesProvider
} from "../context/SalesContext";
import { useAuth }
from "../../../store/useAuth";
import {
  CartProvider
} from "../context/CartContext";

import "../style/sales.css";
import "../style/popup.css";
const ProductPopup = lazy(() =>
  import("../components/ProductPopup")
);
const branchMap = {
  "Abbas Akkad 1": "abbasAkkad1",
  "Abbas Akkad 2": "abbasAkkad2",
  "Abbas Akkad 3": "abbasAkkad3",
  "City Stars": "cityStars",
  "El Obour": "elObour",
  "El Rehab": "elRehab"
};

export default function SalesPage() {
  const { t,  lang } = useTranslate();
  const getBranchName = (id) => {

  if (
    !id ||
    id === "all"
  ) {
    return t("branches.all");
  }

  return (
    branches.find(
      b => b.id === id
    )?.name ||
    t("common.unknown")
  );
};
  const translateBranch = (id) => {

  const name =
    getBranchName(id);

  const key =
    branchMap[name];

  return key
    ? t(`branches.${key}`)
    : name;
};
  
  
  const { selectedBranch } = useApp();
  const {
  productsWithStock,
  loadingProducts,
  inventoryMap,
  branches,
  pricing
} = useProducts(selectedBranch);
const selectedBranchData =
  branches.find(
    branch => branch.id === selectedBranch
  ) || null;
  const [discount, setDiscount] = useState(0);
  const [saleDate, setSaleDate] = useState("");
  const {
  user,
  loading
} = useAuth();
const [selectedProduct, setSelectedProduct] = useState(null);
const [isSelectingSecondOil, setIsSelectingSecondOil] = useState(false);
  // ✅ ده متغير عادي
const isMusk = useMemo(() => {

  return (

    selectedProduct?.category
      ?.toLowerCase()
      ?.includes("musk") ||

    selectedProduct?.subCategory
      ?.toLowerCase() === "musk"

  );

}, [selectedProduct]);

// ✅ وده effect لوحده
useEffect(() => {
  if (isMusk) {
  setContainerType("sample");
  setSelectedSize(null);
}
}, [selectedProduct, isMusk]);
 

  const [search, setSearch] = useState("");
  const popupState =
   usePopupState();  
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
  updateCartItem,
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
  
  
  const [mainTab, setMainTab] = useState("french");
  const [subTab, setSubTab] = useState(null);
 const normalVisibleProducts = useVisibleProducts({
  productsWithStock,
  mainTab,
  subTab,
  search
});

// أثناء اختيار الزيت الثاني نعرض الزيوت فقط
const visibleProducts = isSelectingSecondOil
  ? productsWithStock.filter((product) => {
      const category = (product.category || "").toLowerCase();
      const subCategory = (product.subCategory || "").toLowerCase();

      const isOil =
        category.includes("french") ||
        category.includes("oriental") ||
        category.includes("musk") ||
        subCategory === "musk";

      const isDifferentOil =
        String(product.id) !== String(selectedProduct?.id);

      const hasStock = Number(product.quantity || 0) > 0;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        (product.name || "").toLowerCase().includes(searchText) ||
        category.includes(searchText);

      return isOil && isDifferentOil && hasStock && matchesSearch;
    })
  : normalVisibleProducts;
  const [paymentMethod, setPaymentMethod] = useState("");
  // Split Payment
const [isSplitPayment, setIsSplitPayment] = useState(false);

const [splitPayments, setSplitPayments] = useState({
  cash: "",
  visa: "",
  instapay: "",
});
  const [
  selectedSeller,
  setSelectedSeller
] = useState(null);
  
  

const {
  returnedItems
} = useReturnedItems(
  selectedBranch
);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  useReturnedCart({
  setCart,
  setShowCart
});
  const [showReturned, setShowReturned] = useState(false);
const [returnedSearch, setReturnedSearch] = useState("");
const { isMobile } = useResponsive();
const normalizedReturnedSearch =
  returnedSearch
    .trim()
    .toLowerCase();
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
 

const {
  popupStep,
  setPopupStep,

  showPopup,
  setShowPopup,

  containerType,
  setContainerType,

  selectedSize,
  setSelectedSize,

  oilQty,
  setOilQty,
  secondOil,
setSecondOil,
secondOilQty,
setSecondOilQty,

  editingItem,
  setEditingItem
} = popupState;
const customerState = useMemo(() => ({
  customerName,
  setCustomerName,

  customerPhone,
  setCustomerPhone,

  customerData,

  getCustomerTier
}), [
  customerName,
  customerPhone,
  customerData,
  getCustomerTier
]);
const checkoutState = useMemo(() => ({
  subtotal,
  discount,
  setDiscount,
  total,

  // Payment
  paymentMethod,
  setPaymentMethod,

  // Split Payment
  isSplitPayment,
  setIsSplitPayment,
  splitPayments,
  setSplitPayments,

  loadingCheckout
}), [
  subtotal,
  discount,
  total,
  paymentMethod,
  isSplitPayment,
  splitPayments,
  loadingCheckout
]);
const handleStartSecondOilSelection = () => {
  if (!selectedProduct) return;

  setSearch("");
  // نقفل النافذة دون تصفير اختيارات المنتج الأول
  setIsSelectingSecondOil(true);
  setShowPopup(false);
};

const handleCancelSecondOilSelection = () => {
  setIsSelectingSecondOil(false);
  setSearch("");

  // نرجع لنافذة المنتج الأول
  setShowPopup(true);
};
const popupActions = useMemo(() => ({
  setSelectedProduct,
  setSelectedSize,
  setContainerType,
  setOilQty,
  setSecondOil,
  setSecondOilQty,
  setShowPopup,
  setEditingItem
}), [
  setEditingItem,
  setSecondOil,
  setSecondOilQty
]);
const {
  handleSelectProduct
} = useSelectProduct({
  mainTab,
  addToCart,
  t,

  setToastText,
  setShowToast,

  setSelectedProduct,
  setPopupStep,
  setShowPopup,

  // Second Oil Selection
  isSelectingSecondOil,
  setIsSelectingSecondOil,
  setSecondOil,
  setSecondOilQty
});
const {
  handleCheckoutAction
} = useCheckoutAction({
  handleCheckout,

  playCheckoutSound,

  customerName,
  customerPhone,

  paymentMethod,
  isSplitPayment,
  splitPayments,
  setIsSplitPayment,
  setSplitPayments,
  selectedSeller,

  selectedBranch,
  saleDate,
  setSaleDate,
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
});
const salesContextValue = useMemo(() => ({
  theme,
  t,
  selectedBranch: selectedBranchData,
  lang,
  isMobile,
  showCart,
  setShowCart,
  productsWithStock,
  popupActions,
  customerState,
  checkoutState,
  selectedSeller,
  setSelectedSeller,
  handleCheckoutAction,
  user,
  saleDate,
  setSaleDate,
  loading,
  inventoryMap,

  addToCart,
  updateCartItem,

  getPrice,
  setToastText,
  setShowToast
}), [
 t,
 selectedBranchData,
 lang,
 isMobile,
 showCart,
 productsWithStock,
 popupActions,
 customerState,
 checkoutState,
 handleCheckoutAction,
 user,
 loading,
 inventoryMap,
 addToCart,
 updateCartItem,
 getPrice,
 saleDate
]);

const cartContextValue = useMemo(() => ({
  cart,
  setCart,

  cartCount,

  subtotal,
  total,

  increaseQty,
  decreaseQty,
  removeItem
}), [
  cart,
  cartCount,
  subtotal,
  total,
  increaseQty,
  decreaseQty,
  removeItem
]);

return (
  <SalesProvider
  value={salesContextValue}
>
    <CartProvider
  value={cartContextValue}
>
    
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

  <Cart />

</CartDrawer>
  <div className="sales-layout" style={{
  direction:
    lang === "ar"
      ? "rtl"
      : "ltr",

  display: isMobile ? "block" : "grid",

  gridTemplateColumns:
    isMobile || isSelectingSecondOil
      ? "1fr"
      : "220px 1fr",

  width: "100%",
  alignItems: "start"
}}>
  
    
      
      {/* المنتجات */}
      {!isSelectingSecondOil && (
  <div
    className="left-side"
    style={{
      order: lang === "ar" ? 1 : 1,
      marginBottom: isMobile ? "10px" : "0"
    }}
  >
    {!isMobile && (
      <div className="cat-title">
        📦 {t("products.categoriesLabel")}
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
)}
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

{isSelectingSecondOil ? (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      padding: "14px",
      marginBottom: "12px",
      borderRadius: "12px",
      background: theme.colors.secondary,
      border: `1px solid ${theme.colors.border}`
    }}
  >
    <div>
      <div style={{ fontWeight: 700 }}>
        {lang === "ar"
          ? "اختار الزيت الثاني"
          : "Choose the second oil"}
      </div>

      <div
        style={{
          fontSize: "12px",
          color: theme.colors.textSecondary,
          marginTop: "4px"
        }}
      >
        {lang === "ar"
          ? "اختار زيت مختلف من الزيوت المتاحة في المخزون"
          : "Choose another available oil"}
      </div>
    </div>

    <button
      type="button"
      onClick={handleCancelSecondOilSelection}
      style={{
        padding: "9px 14px",
        borderRadius: "9px",
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.background,
        color: theme.colors.text,
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      {lang === "ar" ? "رجوع" : "Back"}
    </button>
  </div>
) : (
  <ProductsHeader
    mainTab={mainTab}
    subTab={subTab}
    visibleProducts={visibleProducts}
    theme={theme}
    t={t}
  />
)}
  



        {loadingProducts ? (

  <ProductGridSkeleton />

) : (

  <>
  
    <ProductGrid
      productsWithStock={visibleProducts}
      theme={theme}
      t={t}
      onSelectProduct={handleSelectProduct}
    />

    <Suspense fallback={null}>
 <ProductPopup
  selectedProduct={selectedProduct}
  setSubTab={setSubTab}
  setMainTab={setMainTab}
  isMusk={isMusk}
  popupState={popupState}
  onAddSecondOil={handleStartSecondOilSelection}
/>
</Suspense>

  </>

)}
      </div>
    </div>
      {/* الكارت */}

    <FloatingCart />


    <AppToast
  mounted={mounted}
  showToast={showToast}
  toastText={toastText}
  lang={lang}
  theme={theme}
/>
    </div>
    
   </CartProvider> 
  </SalesProvider>
);
}

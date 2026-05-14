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
import Cart from "../components/cart/Cart";
import ProductPopup from "../components/ProductPopup";
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
import {
  CartProvider
} from "../context/CartContext";

import "../style/sales.css";
import "../style/popup.css";
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
  
  
  const [user, setUser] = useState(null);
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
  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
if (storedUser) {
  setUser(storedUser);
}
}, []);
const [selectedProduct, setSelectedProduct] = useState(null);
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
  const visibleProducts =
  useVisibleProducts({
    productsWithStock,
    mainTab,
    subTab,
    search
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  
  

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
  setOilQty
} = popupState;
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
  setShowPopup
});
const {
  handleCheckoutAction
} = useCheckoutAction({
  handleCheckout,

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
});

return (
  <SalesProvider
    value={{
      theme,
      t,
      selectedBranch: selectedBranchData,
      lang,
      isMobile,
      setShowCart,
      productsWithStock,
      popupActions,
      customerState,
      checkoutState,
      handleCheckoutAction,
      user,
      inventoryMap,
      addToCart,
      getPrice,
      setToastText,
      setShowToast
    }}
  >
    <CartProvider
    value={{
      cart,
      setCart,

      cartCount,

      subtotal,
      total,

      increaseQty,
      decreaseQty,
      removeItem
    }}
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

  <ProductGridSkeleton />

) : (

  <>
  
    <ProductGrid
      productsWithStock={visibleProducts}
      theme={theme}
      t={t}
      onSelectProduct={handleSelectProduct}
    />

    <ProductPopup
  selectedProduct={selectedProduct}
  setSubTab={setSubTab}
  setMainTab={setMainTab}
  isMusk={isMusk}
  popupState={popupState}
/>

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

import AppModal from "../../../components/ui/AppModal";
import PopupHeader from "./popup/PopupHeader";
import PopupPrice from "./popup/PopupPrice";
import PopupFooter from "./popup/PopupFooter";
import PopupOptionsGrid from "./popup/PopupOptionsGrid";
import PopupOilInput from "./popup/PopupOilInput";
import PopupContainerButtons
from "./popup/PopupContainerButtons";
import PopupStepOptions
from "./popup/PopupStepOptions";
import {
  popupButtonStyle
}
from "../constants/popupStyles";
import { useMemo } from "react";
import {
  useSalesContext
} from "../context/SalesContext";
export default function ProductPopup({
  selectedProduct,
  setSubTab,
  setMainTab,
  isMusk,
  popupState,
  onAddSecondOil
}) {
  const {
  isMobile,
  lang,

  theme,
  t,

  productsWithStock,
  inventoryMap,

  getPrice,
  addToCart,
  updateCartItem,

  setToastText,
  setShowToast
} = useSalesContext();
  const {
  popupStep,
  setPopupStep,

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

const isFrenchBox =
  selectedProduct?.category
    ?.toLowerCase()
    ?.includes("french") &&

  containerType === "box";
const productCategory =
  selectedProduct?.category?.toLowerCase() || "";

const needsOil =
  productCategory.includes("french") ||
  productCategory.includes("oriental") ||
  isMusk;

const price =
  isFrenchBox

    ? (
        selectedSize?.sellingPrice ??
        selectedSize?.price ??
        0
      )

    : containerType === "oil"

    ? getPrice(
        { ...selectedProduct, oilQty },
        null,
        containerType
      )

    : selectedSize

    ? getPrice(
        selectedProduct,
        selectedSize,
        containerType
      )

    : 0;
   const isValid =
  containerType === "oil"
    ? Number(oilQty) > 0 && price > 0
    : Boolean(
        selectedSize &&
        price > 0 &&
        (!needsOil || Number(oilQty) > 0) &&
        (!secondOil || Number(secondOilQty) > 0)
      );
const btnStyle =
  popupButtonStyle(theme);
const getContainerButtonStyle = (
  type
) => ({

  ...btnStyle,

  background:
    containerType === type
      ? theme.colors.primary
      : theme.colors.secondary,

  color:
    containerType === type
      ? "#fff"
      : theme.colors.text,

  transform:
    containerType === type
      ? "scale(1.05)"
      : "scale(1)"
});


const resetPopup = () => {
  setShowPopup(false);
  
  setSelectedSize(null);
  setPopupStep(null);

  setOilQty(0);

  setSecondOil(null);
  setSecondOilQty(0);

  setEditingItem(null);
};
const formatContainerName =
  useMemo(() => {

    return (name) => {

      const num =
        (
          name.match(/\d+/) ||
          [""]
        )[0];

      const text = name
        .replace(/\d+/g, "")
        .replace(/ml/gi, "")
        .trim();

      if (!num) return text;

      return `${num}ml ${text}`;
    };

  }, []);
if (!popupState.showPopup) return null;
  

  return (

<AppModal
  open={popupState.showPopup}
  onClose={resetPopup}
  width="700px"
>
  

      
              
              {selectedProduct && !popupStep && (
  <PopupHeader
    selectedProduct={
      selectedProduct
    }
    theme={theme}
  />
)}
      {popupStep === "oriental" && (

  <PopupStepOptions

    title={
      t("products.chooseGrade")
    }

    btnStyle={btnStyle}

    options={[

      {
        label: "A",

        onClick: () => {

          setSubTab("A");

          setMainTab("oriental");

          resetPopup();
        }
      },

      {
        label: "B",

        onClick: () => {

          setSubTab("B");

          setMainTab("oriental");

          resetPopup();
        }
      },

      {
        label: "C",

        onClick: () => {

          setSubTab("C");

          setMainTab("oriental");

          resetPopup();
        }
      }
    ]}
  />
)}
    {popupStep === "body" && (

  <PopupStepOptions

    title={
      t("products.chooseType")
    }

    btnStyle={btnStyle}

    options={[

      {
        label:
          t("products.musk"),

        onClick: () => {

          setSubTab("Musk");

          setMainTab("body");

          resetPopup();
        }
      },

      {
        label:
          t("products.cream"),

        onClick: () => {

          setSubTab("Cream");

          setMainTab("body");

          resetPopup();
        }
      },

      {
        label:
          t("products.makhmaria"),

        onClick: () => {

          setSubTab("Makhmaria");

          setMainTab("body");

          resetPopup();
        }
      }
    ]}
  />
)}
  {!popupStep && (
  <>
    <p>{t("products.chooseContainer")}</p>
    <PopupContainerButtons

      containerType={
        containerType
      }

      setContainerType={
        setContainerType
      }

      getContainerButtonStyle={
        getContainerButtonStyle
      }

      t={t}
    />

    <hr />
    
    {containerType !== "oil" && (
  <>
    <p>{t("products.availableOptions")}</p>

    <PopupOptionsGrid
      productsWithStock={
        productsWithStock
      }

      containerType={
        containerType
      }

      inventoryMap={
        inventoryMap
      }

      selectedSize={
        selectedSize
      }

      setSelectedSize={
        setSelectedSize
      }

      isMusk={isMusk}

      isMobile={isMobile}

      formatContainerName={
        formatContainerName
      }

      theme={theme}
      t={t}
    /> 
 </>
)}    
      <PopupPrice
  price={price}
  lang={lang}
  t={t}
/>

{/* 🔥 هنا تحط input الزيت */}
{needsOil && (
  <>
    {/* الزيت الأول */}
    <PopupOilInput
      oilQty={oilQty}
      setOilQty={setOilQty}
      theme={theme}
      t={t}
    />

   {/* الزيت الثاني - للعبوات فقط */}
{containerType !== "oil" && (
  <div
    style={{
      marginTop: "16px",
      padding: "14px",
      borderRadius: "12px",
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.background
    }}
  >
    <div
      style={{
        fontWeight: 700,
        marginBottom: "12px"
      }}
    >
      {lang === "ar"
        ? "الزيت الثاني"
        : "Second Oil"}
    </div>

    {!secondOil ? (
      <button
        type="button"
        onClick={onAddSecondOil}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: "10px",
          border: `1px dashed ${theme.colors.primary}`,
          background: theme.colors.secondary,
          color: theme.colors.primary,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "14px"
        }}
      >
        + {lang === "ar"
          ? "إضافة زيت تاني"
          : "Add Second Oil"}
      </button>
    ) : (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "12px"
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>
              {secondOil.name}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: theme.colors.textSecondary,
                marginTop: "4px"
              }}
            >
              {secondOil.category}
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={onAddSecondOil}
              style={{
                border: "none",
                background: theme.colors.secondary,
                color: theme.colors.primary,
                padding: "7px 10px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              {lang === "ar" ? "تغيير" : "Change"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSecondOil(null);
                setSecondOilQty(0);
              }}
              style={{
                border: "none",
                background: "#fee2e2",
                color: "#dc2626",
                padding: "7px 10px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              {lang === "ar" ? "إزالة" : "Remove"}
            </button>
          </div>
        </div>

        <p style={{ marginBottom: "7px" }}>
          {lang === "ar"
            ? "كمية الزيت الثاني بالملليلتر"
            : "Second oil quantity (ML)"}
        </p>

        <PopupOilInput
          oilQty={secondOilQty}
          setOilQty={setSecondOilQty}
          theme={theme}
          t={t}
        />
      </>
    )}
  </div>
)}
  </>
)}
        <br />

        <PopupFooter
          isValid={isValid}
          needsOil={needsOil}
          oilQty={oilQty}

          price={price}

          selectedProduct={
            selectedProduct
          }

          selectedSize={
            selectedSize
          }

          containerType={
            containerType
          }

          oilCostPerML={
            selectedProduct?.cost || 0
          }
          secondOil={secondOil}
          secondOilQty={secondOilQty}

          addToCart={addToCart}

          updateCartItem={updateCartItem}

          editingItem={editingItem}

          setToastText={
            setToastText
          }

          setShowToast={
            setShowToast
          }

          resetPopup={resetPopup}

          theme={theme}
          t={t}
        />
        </>
        )}          
</AppModal>
);
}
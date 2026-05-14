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
  popupState
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

  setToastText,
  setShowToast
} = useSalesContext();
  if (!popupState.showPopup) return null;
  const {
  popupStep,
  setPopupStep,

  setShowPopup,

  containerType,
  setContainerType,

  selectedSize,
  setSelectedSize,

  oilQty,
  setOilQty
} = popupState;

const isFrenchBox =
  selectedProduct?.category
    ?.toLowerCase()
    ?.includes("french") &&

  containerType === "box";
const needsOil =

  selectedProduct.category === "French" ||

  selectedProduct.category
    ?.toLowerCase()
    .includes("oriental") ||

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
    ? oilQty && oilQty > 0 && price > 0
    : selectedSize && price > 0;
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
      isMusk={isMusk}

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
{(
  needsOil
) && (
  <PopupOilInput
  oilQty={oilQty}
  setOilQty={setOilQty}
  theme={theme}
  t={t}
/>
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
            selectedProduct.cost || 0
          }

          addToCart={addToCart}

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
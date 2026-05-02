import { createPortal } from "react-dom";

export default function ProductPopup({
  showPopup,
  selectedProduct,
  popupStep,
  setPopupStep,
  setShowPopup,
  theme,
  btnStyle,
  t,
  setSubTab,
  setMainTab,
  isMusk,
  containerType,
  setContainerType,
  selectedSize,
  setSelectedSize,
  productsWithStock,
  inventoryMap,
  getPrice,
  oilQty,
  setOilQty,
  addToCart,
  setToastText,   
  setShowToast
}) {
  if (!showPopup) return null;
const selectedValue = selectedSize?.size || selectedSize?.name;
const isMobile = window.innerWidth < 768;
const price =
  containerType === "oil"
    ? getPrice(
        { ...selectedProduct, oilQty },
        null,
        containerType
      )
    : selectedSize
    ? getPrice(selectedProduct, selectedSize, containerType)
    : 0;
    const isValid =
  containerType === "oil"
    ? oilQty && oilQty > 0 && price > 0
    : selectedSize && price > 0;
  return createPortal(
  <div
      onClick={() => setShowPopup(false)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(15,23,42,0.6)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        animation: "fadeIn 0.25s ease-out"
      }}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          background: theme.colors.card,
          width: "90%",
          maxWidth: "420px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "16px"
        }}
      >
              
              {selectedProduct && !popupStep && (
                <h3 style={{ marginBottom: "10px" }}>
  {selectedProduct.name}
</h3>
              )}
      {popupStep === "oriental" && (
    <>
    <h3>Choose Grade</h3>

      <button style={btnStyle} onClick={() => {
        setSubTab("A");
        setMainTab("oriental");
        setPopupStep(null);
        setShowPopup(false);   // 👈 ده الحل
      }}>
        A
      </button>

      <button style={btnStyle} onClick={() => {
        setSubTab("B");
        setMainTab("oriental");
        setPopupStep(null);
        setShowPopup(false);   // 👈 ده الحل
      }}>
        B
      </button>

      <button style={btnStyle} onClick={() => {
        setSubTab("C");
        setMainTab("oriental");
        setPopupStep(null);
        setShowPopup(false);   // 👈 ده الحل
      }}>
        C
      </button>
    </>
  )}
    {popupStep === "body" && (
    <>
    <h3>Choose Type</h3>

      <button style={btnStyle} onClick={() => {
        setSubTab("Musk");
        setMainTab("body");
        setPopupStep(null);
        setShowPopup(false);
      }}>
        Musk
      </button>

      <button style={btnStyle} onClick={() => {
        setSubTab("Cream");
        setMainTab("body");
        setPopupStep(null);
        setShowPopup(false);
      }}>
        Cream
      </button>

      <button style={btnStyle} onClick={() => {
        setSubTab("Makhmaria");
        setMainTab("body");
        setPopupStep(null);
        setShowPopup(false);
      }}>
        مخمرية
      </button>
    </>
  )}
  {!popupStep && (
  <>
    <p>Choose Container:</p>
    <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  }}
>
  

{/* ❌ نخفيهم في حالة Musk */}
{!isMusk && (
  <>
    <button
      onClick={() => {
        setContainerType("bottle");
        setSelectedSize(null);
      }}
      style={{
        ...btnStyle,
        background: containerType === "bottle"
          ? theme.colors.primary
          : theme.colors.secondary,
        color: containerType === "bottle" ? "#fff" : theme.colors.text,
        transform: containerType === "bottle" ? "scale(1.05)" : "scale(1)",
      }}
    >
      Bottle
    </button>

    <button
      onClick={() => {
        setContainerType("box");
        setSelectedSize(null);
      }}
      style={{
        ...btnStyle,
        background: containerType === "box"
          ? theme.colors.primary
          : theme.colors.secondary,
        color: containerType === "box" ? "#fff" : theme.colors.text,
        transform: containerType === "box" ? "scale(1.05)" : "scale(1)",
      }}
    >
      Box
    </button>
  </>
)}


{/* ✅ Samples يفضل ظاهر دايماً */}
<button
  onClick={() => {
    setContainerType("sample");
    setSelectedSize(null);
  }}
  style={{
    ...btnStyle,
    background: containerType === "sample"
      ? theme.colors.primary
      : theme.colors.secondary,
    color: containerType === "sample" ? "#fff" : theme.colors.text,
    transform: containerType === "sample" ? "scale(1.05)" : "scale(1)",
  }}
>
  Samples
</button>
<button
  onClick={() => {
    setContainerType("oil");
    setSelectedSize(null);
  }}
  style={{
    ...btnStyle,
    background: containerType === "oil"
      ? theme.colors.primary
      : theme.colors.secondary,
    color: containerType === "oil" ? "#fff" : theme.colors.text,
  }}
>
   Pure Oil
</button>
</div>

    <hr />
    
    {containerType !== "oil" && (
  <>
    <p>Available Options:</p>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: "12px",
      marginTop: "15px"
    }}>
  {productsWithStock
    .filter(p => p.type === "container")
  .filter(p => {
    const sub = (p.subCategory || "").toLowerCase().trim();

    if (containerType === "bottle") return sub === "bottle";
    if (containerType === "box") return sub === "box";

     if (containerType === "sample") {
      // 🔥 لو Musk → نشيل Tester بس
      if (isMusk) {
        return (
          sub === "samples" &&
          !p.name?.toLowerCase().includes("tester") &&
          !p.name?.includes("تستر")
        );
      }

      // ✅ باقي المنتجات عادي
      return sub === "samples";
    }

    return false;
  })
    .sort((a, b) => {
      const getSize = (name) => {
        const match = name.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      return getSize(a.name) - getSize(b.name);
    })
    .map(p => {
      const stock = inventoryMap[p.id] || 0;
      
  
  return (
      <div
  key={p.id}
  onClick={() => {
    if (stock === 0) return; // ❌ يمنع الاختيار لو مفيش
    setSelectedSize(p);
  }}
  style={{
    padding: isMobile ? "12px" : "18px",
    background: selectedSize?.id === p.id
      ? theme.colors.primary
      : theme.colors.secondary,
    borderRadius: "14px",
    cursor: stock === 0 ? "not-allowed" : "pointer",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "14px",
    border: stock === 0
  ? `1px solid ${theme.colors.danger}`
  : `1px solid ${theme.colors.border}`,
    transition: "all 0.25s ease",
    opacity: stock === 0 ? 0.5 : 1
  }}
>
  {/* 🧴 اسم الكونتينر */}
  <div>
    {(() => {
      const num = (p.name.match(/\d+/) || [""])[0];
      const text = p.name
        .replace(/\d+/g, "")
        .replace(/ml/gi, "")
        .trim();

      if (!num) return text;

      return `${num}ml ${text}`;
    })()}
  </div>

  {/* 🔥 الكمية */}
  <div style={{
    marginTop: "6px",
    fontSize: "12px",
    color: stock > 0
      ? theme.colors.success
      : theme.colors.danger
  }}>
    {stock === 0
  ? "Out of stock"
  : stock < 5
  ? `Low (${stock})`
  : `${stock} available`}
  </div>
  </div>
      );
    })
  }
</div>    
 </>
)}    
      <p style={{ marginTop: "10px", fontWeight: "bold" }}>
  Price: {price} EGP
</p>

{/* 🔥 هنا تحط input الزيت */}
{(
  selectedProduct.category === "French" ||
  selectedProduct.category?.toLowerCase()?.includes("oriental") ||
  isMusk   // 👈 أهم إضافة
) && (
  <input
    type="number"
    placeholder="كمية الزيت (ml)"
    value={oilQty === 0 ? "" : oilQty}
    onChange={(e) => setOilQty(Number(e.target.value))}
    style={{
      width: "100%",
      padding: "10px",
      marginTop: "10px",
      borderRadius: "10px",
      border: `1px solid ${theme.colors.border}`,
      fontSize: "16px"
    }}
  />
)}
        <br />

        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "10px",
          marginTop: "20px"
        }}>

          <button
            onClick={() => setShowPopup(false)}
            style={{
              flex: 1,
              padding: "14px",
              background: theme.colors.secondary,
              borderRadius: "12px",
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text,
              cursor: "pointer"
            }}
          >
            {t("Close")}
          </button>
            
          <button
            onClick={() => {
              const needsOil =
                selectedProduct.category === "French" ||
                selectedProduct.category?.toLowerCase().includes("oriental") ||
                isMusk;

              if (needsOil && (!oilQty || oilQty <= 0)) {
                alert("⚠️ لازم تدخل كمية الزيت");
                return;
              }

              if (!price || price <= 0) {
                alert("❌ مفيش سعر متحدد للمنتج ده");
                return;
              }

              const name = addToCart({
                ...selectedProduct,
category:
  containerType === "oil"
    ? "pure_oil"
    : selectedProduct.category,
                size: selectedSize?.size || selectedSize?.name,
                containerType,
                containerName:
                  containerType === "oil"
                    ? `Pure Oil ${oilQty}ml`
                    : selectedSize?.name?.trim() || containerType,
                price: price,
                qty: 1,
                oilQty: oilQty || 0
              });

              if (name) {
                setToastText(`${name} added 🔥`);
                setShowToast(true);

                setShowPopup(false);
                setSelectedSize(null);
                setPopupStep(null);
                setOilQty(0);
              }
            }}

            disabled={!isValid}

            style={{
              flex: 1,
              padding: "14px",
              background: isValid
                ? theme.colors.primary
                : theme.colors.secondary,
              borderRadius: "12px",
              border: "none",
              color: isValid ? "#fff" : theme.colors.text,
              fontWeight: "bold",
              cursor: isValid ? "pointer" : "not-allowed",
              opacity: isValid ? 1 : 0.5
            }}
          >
            {t("Add To Cart")}
          </button>
          

        
        </div>
        </>
        )}
        
        

      </div>
    </div>,
  document.body
);
}
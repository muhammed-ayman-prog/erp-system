export default function EditProductModal({

  editingProduct,
  editProductData,
  setEditProductData,
  setEditingProduct,
  handleSaveProductEdit,
  t

}) {

  if (!editingProduct || !editProductData) return null;

  return (

    <div
      onClick={() => setEditingProduct(null)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "15px"
      }}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "550px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "20px"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}
        >

          <h3 style={{ margin: 0 }}>
            ✏️ {t("products.editProduct")}
          </h3>

          <button
            onClick={() => setEditingProduct(null)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "22px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>

        </div>

        {/* NAME */}

        <label
          style={{
            fontWeight: "600",
            display: "block",
            marginBottom: "6px"
          }}
        >
          {t("products.productName")}
        </label>

        <input
          type="text"
          value={editProductData.name || ""}
          onChange={(e) =>
            setEditProductData(prev => ({
              ...prev,
              name: e.target.value
            }))
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "12px"
          }}
        />

        {/* TYPE */}

        <label
          style={{
            fontWeight: "600",
            display: "block",
            marginBottom: "6px"
          }}
        >
          {t("products.productType")}
        </label>

        <select
          value={editProductData.type || ""}
          onChange={(e) => {
  const type = e.target.value;

  setEditProductData(prev => ({
    ...prev,
    type,
    category: type === "original"
      ? "Original"
      : prev.category
  }));
}}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "12px"
          }}
        >
          <option value="product">
            {t("products.types.product")}
          </option>

          <option value="original">
            {t("products.types.original")}
          </option>

          <option value="oil">
            {t("products.types.oil")}
          </option>

          <option value="container">
            {t("products.types.container")}
          </option>
        </select>

        {/* OIL */}

        {editProductData.type === "oil" && (

          <>

            <label
              style={{
                fontWeight: "600",
                display: "block",
                marginBottom: "6px"
              }}
            >
              {t("products.oilCategory")}
            </label>

            <select
              value={editProductData.oilCategory || ""}
              onChange={(e) =>
                setEditProductData(prev => ({
                  ...prev,
                  oilCategory: e.target.value
                }))
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginBottom: "12px"
              }}
            >
              <option value="French">
  {t("products.oilCategories.french")}
</option>

<option value="Oriental">
  {t("products.oilCategories.oriental")}
</option>

<option value="Musk">
  {t("products.oilCategories.musk")}
</option>

            </select>

            {(editProductData.oilCategory === "Oriental" ||
              editProductData.oilCategory === "Musk") && (

              <>
                <label
                  style={{
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px"
                  }}
                >
                  {t("products.pricingTier")}
                </label>

                <select
                  value={editProductData.pricingTier || ""}
                  onChange={(e) =>
                    setEditProductData(prev => ({
                      ...prev,
                      pricingTier: e.target.value
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    marginBottom: "12px"
                  }}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </>
            )}

          </>
        )}

        {/* CONTAINER */}

        {editProductData.type === "container" && (

          <>
            <label
              style={{
                fontWeight: "600",
                display: "block",
                marginBottom: "6px"
              }}
            >
              {t("products.containerType")}
            </label>

            <select
              value={editProductData.subCategory || ""}
              onChange={(e) =>
                setEditProductData(prev => ({
                  ...prev,
                  subCategory: e.target.value
                }))
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginBottom: "12px"
              }}
            >
              <option value="bottle">
                {t("products.subCategories.bottle")}
              </option>

              <option value="box">
                {t("products.subCategories.box")}
              </option>

              <option value="sample">
                {t("products.subCategories.sample")}
              </option>
            </select>
          </>
        )}

        {/* PRODUCT + ORIGINAL */}

        {editProductData.type === "product" && (
  <>
    <label
      style={{
        fontWeight: "600",
        display: "block",
        marginBottom: "6px"
      }}
    >
      {t("products.category")}
    </label>

    <select
      value={editProductData.category || ""}
      onChange={(e) =>
        setEditProductData(prev => ({
          ...prev,
          category: e.target.value
        }))
      }
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        marginBottom: "12px"
      }}
    >
      <option value="Cream">
        {t("products.categories.cream")}
      </option>

      <option value="Makhmaria">
        {t("products.categories.makhmaria")}
      </option>
    </select>
  </>
)}

        {/* COST */}

        <label
          style={{
            fontWeight: "600",
            display: "block",
            marginBottom: "6px"
          }}
        >
          {t("products.costPrice")}
        </label>

        <input
          type="number"
          value={editProductData.costPrice || ""}
          onChange={(e) =>
            setEditProductData(prev => ({
              ...prev,
              costPrice: Number(e.target.value)
            }))
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "12px"
          }}
        />

        {/* SELLING */}

        <label
          style={{
            fontWeight: "600",
            display: "block",
            marginBottom: "6px"
          }}
        >
          {t("products.sellingPrice")}
        </label>

        <input
          type="number"
          value={editProductData.sellingPrice || ""}
          onChange={(e) =>
            setEditProductData(prev => ({
              ...prev,
              sellingPrice: Number(e.target.value)
            }))
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "12px"
          }}
        />

        {/* MIN STOCK */}

        <label
          style={{
            fontWeight: "600",
            display: "block",
            marginBottom: "6px"
          }}
        >
          {t("products.minStock")}
        </label>

        <input
          type="number"
          value={editProductData.minStock || ""}
          onChange={(e) =>
            setEditProductData(prev => ({
              ...prev,
              minStock: Number(e.target.value)
            }))
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "20px"
          }}
        />

        <button
          onClick={handleSaveProductEdit}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          💾 {t("common.save")}
        </button>

      </div>

    </div>

  );
}
import { useTranslate } from "../../useTranslate";
export default function AddProductSection({

  activeAction,

  newProductName,
  setNewProductName,

  newProductType,
  setNewProductType,

  newProductCategory,
  setNewProductCategory,

  newOilCategory,
  setNewOilCategory,

  newProductSubCategory,
  setNewProductSubCategory,

  newPricingTier,
  setNewPricingTier,

  newProductCost,
  setNewProductCost,

  newProductPrice,
  setNewProductPrice,

  createLoading,

  handleCreateProduct

}) {
const t = useTranslate();
  return (

    <>
    
      <div
                  style={{
                    maxHeight:
                      activeAction === "addProduct"
                        ? "1200px"
                        : "0px",
      
                    opacity:
                      activeAction === "addProduct"
                        ? 1
                        : 0,
      
                    transform:
                       activeAction === "addProduct"
                        ? "translateY(0)"
                        : "translateY(-10px)",
      
                    overflow: "hidden",
      
                    transition:
                      "max-height 0.35s ease, opacity 0.25s ease, transform 0.3s ease"
                  }}
                >
      
                  <div style={{
                    background: "#ffffff",
                    padding: "25px",
                    borderRadius: "20px",
                    marginTop: "20px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    border: "1px solid #f1f5f9"
                  }}>
      
                    <h3>
  ➕ {t("products.addProduct")}
</h3>
      
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      marginTop: "15px"
                    }}>
      
                      <input
                        type="text"
                        placeholder={t("products.productName")}
                        value={newProductName}
                        onChange={(e) =>
                          setNewProductName(e.target.value)
                        }
      
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid #ddd"
                        }}
                      />
      
                      <select
                        value={newProductType}
                        onChange={(e) =>
                          setNewProductType(e.target.value)
                        }
      
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid #ddd"
                        }}
                      >
                        <option value="">
  {t("products.selectType")}
</option>

<option value="oil">
  {t("products.types.oil")}
</option>

<option value="container">
  {t("products.types.container")}
</option>

<option value="product">
  {t("products.types.product")}
</option>

<option value="original">
  {t("products.types.original")}
</option>

<option value="packaging">
  {t("products.types.packaging")}
</option>
                      </select>
      
                      {newProductType === "container" && (
      
                        <select
                          value={newProductSubCategory}
                          onChange={(e) =>
                            setNewProductSubCategory(
                              e.target.value
                            )
                          }
      
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            border: "1px solid #ddd"
                          }}
                        >
                          <option value="">
  {t("products.selectSubCategory")}
</option>

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
                      )}
      
                      {newProductType === "product" && (
      
        <select
          value={newProductCategory}
      
          onChange={(e) =>
            setNewProductCategory(
              e.target.value
            )
          }
      
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd"
          }}
        >
      
          <option value="">
  {t("products.selectCategory")}
</option>

<option value="Cream">
  {t("products.categories.cream")}
</option>

<option value="Makhmaria">
  {t("products.categories.makhmaria")}
</option>
      
        </select>
      )}
      
      {newProductType === "original" && (
      
        <select
          value={newProductCategory}
      
          onChange={(e) =>
            setNewProductCategory(
              e.target.value
            )
          }
      
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd"
          }}
        >
      
          <option value="">
  {t("products.selectCategory")}
</option>

<option value="Original">
  {t("products.categories.original")}
</option>
      
        </select>
      )}
                      {newProductType === "oil" && (
                        <>
      
                          <select
                            value={newOilCategory}
      
                            onChange={(e) =>
                              setNewOilCategory(
                                e.target.value
                              )
                            }
      
                            style={{
                              padding: "12px",
                              borderRadius: "10px",
                              border: "1px solid #ddd"
                            }}
                          >
                            <option value="">
  {t("products.selectOilCategory")}
</option>

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
      
                          <select
                            value={newPricingTier}
      
                            onChange={(e) =>
                              setNewPricingTier(e.target.value)
                            }
      
                            style={{
                              padding: "12px",
                              borderRadius: "10px",
                              border: "1px solid #ddd"
                            }}
                          >
      
                            <option value="">
  {t("products.selectPricingTier")}
</option>
      
                            {newOilCategory === "French" && (
                             <option value="French">
  {t("products.pricing.french")}
</option>
                            )}
      
                            {newOilCategory === "Oriental" && (
                              <>
                                <option value="A">
  {t("products.pricing.orientalA")}
</option>

<option value="B">
  {t("products.pricing.orientalB")}
</option>

<option value="C">
  {t("products.pricing.orientalC")}
</option>
                              </>
                            )}
      
                            {newOilCategory === "Musk" && (
                              <>
        <option value="tahara">
  {t("products.pricing.tahara")}
</option>

<option value="rumman">
  {t("products.pricing.rumman")}
</option>

<option value="crystal">
  {t("products.pricing.crystal")}
</option>
      </>
                            )}
      
                          </select>
      
                        </>
                      )}
      
                      <input
                        type="number"
                        placeholder={t("products.costPrice")}
                        value={newProductCost}
                        onChange={(e) =>
                          setNewProductCost(e.target.value)
                        }
      
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid #ddd"
                        }}
                      />
      
                      {(
                        newProductType === "product" ||
                        newProductType === "original"
                      ) && (
      
                        <input
                          type="number"
                          placeholder={t("products.sellingPrice")}
                          value={newProductPrice}
                          onChange={(e) =>
                            setNewProductPrice(e.target.value)
                          }
      
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            border: "1px solid #ddd"
                          }}
                        />
      
                      )}
      
                      <button
                        onClick={handleCreateProduct}
                        disabled={createLoading}
      
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: "none",
      
                          background:
                            createLoading
                              ? "#9ca3af"
                              : "#8b5cf6",
      
                          color: "#fff",
                          fontWeight: "600",
      
                          cursor:
                            createLoading
                              ? "wait"
                              : "pointer",
      
                          opacity:
                            createLoading
                              ? 0.7
                              : 1
                        }}
                      >
                        {createLoading
  ? t("common.creating")
  : `➕ ${t("products.createProduct")}`}
                      </button>
      
                    </div>
                  </div>
                </div>

    </>

  );

}
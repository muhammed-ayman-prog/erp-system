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
                      ➕ Add Product
                    </h3>
      
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      marginTop: "15px"
                    }}>
      
                      <input
                        type="text"
                        placeholder="Product Name"
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
                          Select Type
                        </option>
      
                        <option value="oil">
                          Oil
                        </option>
      
                        <option value="container">
                          Container
                        </option>
      
                        <option value="product">
                          Product
                        </option>
      
                        <option value="original">
                          Original
                        </option>
      
                        <option value="packaging">
                          Packaging
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
                            Select SubCategory
                          </option>
      
                          <option value="bottle">
                            Bottle
                          </option>
      
                          <option value="box">
                            Box
                          </option>
      
                          <option value="sample">
                            Sample
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
            Select Category
          </option>
      
          <option value="Cream">
            Cream
          </option>
      
          <option value="Makhmaria">
            Makhmaria
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
            Select Category
          </option>
      
          <option value="Original">
            Original
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
                              Select Oil Category
                            </option>
      
                            <option value="French">
                              French
                            </option>
      
                            <option value="Oriental">
                              Oriental
                            </option>
      
                            <option value="Musk">
                              Musk
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
                              Select Pricing Tier
                            </option>
      
                            {newOilCategory === "French" && (
                              <option value="French">
                                French
                              </option>
                            )}
      
                            {newOilCategory === "Oriental" && (
                              <>
                                <option value="A">
                                  Oriental A
                                </option>
      
                                <option value="B">
                                  Oriental B
                                </option>
      
                                <option value="C">
                                  Oriental C
                                </option>
                              </>
                            )}
      
                            {newOilCategory === "Musk" && (
                              <>
        <option value="tahara">
          Tahara
        </option>
      
        <option value="rumman">
          Rumman
        </option>
      
        <option value="crystal">
          Crystal
        </option>
      </>
                            )}
      
                          </select>
      
                        </>
                      )}
      
                      <input
                        type="number"
                        placeholder="Cost Price"
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
                          placeholder="Selling Price"
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
                          ? "Creating..."
                          : "➕ Create Product"}
                      </button>
      
                    </div>
                  </div>
                </div>

    </>

  );

}
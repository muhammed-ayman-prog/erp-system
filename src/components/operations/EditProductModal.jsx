import AppModal from "../ui/AppModal";
import AppInput from "../ui/AppInput";
import AppSelect from "../ui/AppSelect";
import AppButton from "../ui/AppButton";

export default function EditProductModal({
  editingProduct,

  editProductData,
  setEditProductData,

  setEditingProduct,

  handleSaveProductEdit,

  t,
}) {
  if (!editingProduct || !editProductData) {
    return null;
  }

  const closeModal = () => {
    setEditingProduct(null);
  };

  return (
    <AppModal
      open={!!editingProduct}
      onClose={closeModal}
      width="550px"
    >
      <div
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "4px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            ✏️ {t("products.editProduct")}
          </h3>
        </div>

        {/* NAME */}
        <AppInput
          type="text"
          placeholder={t("products.productName")}
          value={editProductData.name || ""}
          onChange={(e) =>
            setEditProductData((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />

        {/* TYPE */}
        <AppSelect
          value={editProductData.type || ""}
          onChange={(e) => {
            const type = e.target.value;

            setEditProductData((prev) => ({
              ...prev,
              type,
              category:
                type === "original"
                  ? "Original"
                  : prev.category,
            }));
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
        </AppSelect>

        {/* OIL */}
        {editProductData.type === "oil" && (
          <>
            <AppSelect
              value={
                editProductData.oilCategory || ""
              }
              onChange={(e) =>
                setEditProductData((prev) => ({
                  ...prev,
                  oilCategory: e.target.value,
                }))
              }
            >
              <option value="">
                {t("products.oilCategory")}
              </option>

              <option value="French">
                {t(
                  "products.oilCategories.french"
                )}
              </option>

              <option value="Oriental">
                {t(
                  "products.oilCategories.oriental"
                )}
              </option>

              <option value="Musk">
                {t(
                  "products.oilCategories.musk"
                )}
              </option>
            </AppSelect>

            {(editProductData.oilCategory ===
              "Oriental" ||
              editProductData.oilCategory ===
                "Musk") && (
              <AppSelect
                value={
                  editProductData.pricingTier ||
                  ""
                }
                onChange={(e) =>
                  setEditProductData((prev) => ({
                    ...prev,
                    pricingTier:
                      e.target.value,
                  }))
                }
              >
                <option value="">
                  {t(
                    "products.pricingTier"
                  )}
                </option>

                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </AppSelect>
            )}
          </>
        )}

        {/* CONTAINER */}
        {editProductData.type === "container" && (
          <AppSelect
            value={
              editProductData.subCategory || ""
            }
            onChange={(e) =>
              setEditProductData((prev) => ({
                ...prev,
                subCategory: e.target.value,
              }))
            }
          >
            <option value="">
              {t(
                "products.containerType"
              )}
            </option>

            <option value="bottle">
              {t(
                "products.subCategories.bottle"
              )}
            </option>

            <option value="box">
              {t(
                "products.subCategories.box"
              )}
            </option>

            <option value="sample">
              {t(
                "products.subCategories.sample"
              )}
            </option>
          </AppSelect>
        )}

        {/* PRODUCT */}
        {editProductData.type === "product" && (
          <AppSelect
            value={
              editProductData.category || ""
            }
            onChange={(e) =>
              setEditProductData((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
          >
            <option value="">
              {t("products.category")}
            </option>

            <option value="Cream">
              {t(
                "products.subCategories.cream"
              )}
            </option>

            <option value="Makhmaria">
              {t(
                "products.categories.makhmaria"
              )}
            </option>
          </AppSelect>
        )}

        {/* COST */}
        <AppInput
          type="number"
          placeholder={t("products.costPrice")}
          value={editProductData.costPrice ?? ""}
          onChange={(e) =>
            setEditProductData((prev) => ({
              ...prev,
              costPrice:
                Number(e.target.value),
            }))
          }
        />

        {/* SELLING PRICE */}
        <AppInput
          type="number"
          placeholder={t(
            "products.sellingPrice"
          )}
          value={
            editProductData.sellingPrice ?? ""
          }
          onChange={(e) =>
            setEditProductData((prev) => ({
              ...prev,
              sellingPrice:
                Number(e.target.value),
            }))
          }
        />

        {/* MIN STOCK */}
        <AppInput
          type="number"
          placeholder={t("products.minStock")}
          value={
            editProductData.minStock ?? ""
          }
          onChange={(e) =>
            setEditProductData((prev) => ({
              ...prev,
              minStock:
                Number(e.target.value),
            }))
          }
        />

        {/* SAVE */}
        <AppButton
          type="button"
          fullWidth
          size="lg"
          variant="primary"
          onClick={handleSaveProductEdit}
          style={{
            marginTop: "8px",
          }}
        >
          💾 {t("common.save")}
        </AppButton>
      </div>
    </AppModal>
  );
}
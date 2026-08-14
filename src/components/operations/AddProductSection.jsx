import { useTranslate } from "../../useTranslate";

import AppCard from "../ui/AppCard";
import AppInput from "../ui/AppInput";
import AppSelect from "../ui/AppSelect";
import AppButton from "../ui/AppButton";
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
const { t } = useTranslate();
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
      
                  <AppCard
  padding="lg"
  radius="lg"
  shadow="sm"
  style={{
    marginTop: "20px",
  }}
>
  <h3
    style={{
      margin: 0,
      marginBottom: "15px",
    }}
  >
    ➕ {t("products.addProduct")}
  </h3>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}
  >

    {/* Product Name */}
    <AppInput
      type="text"
      placeholder={t("products.productName")}
      value={newProductName}
      onChange={(e) =>
        setNewProductName(e.target.value)
      }
    />

    {/* Product Type */}
    <AppSelect
      value={newProductType}
      onChange={(e) =>
        setNewProductType(e.target.value)
      }
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
    </AppSelect>

    {/* Container Sub Category */}
    {newProductType === "container" && (
      <AppSelect
        value={newProductSubCategory}
        onChange={(e) =>
          setNewProductSubCategory(
            e.target.value
          )
        }
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
      </AppSelect>
    )}

    {/* Body Product Category */}
    {newProductType === "product" && (
      <AppSelect
        value={newProductCategory}
        onChange={(e) =>
          setNewProductCategory(
            e.target.value
          )
        }
      >
        <option value="">
          {t("products.selectCategory")}
        </option>

        <option value="Cream">
          {t("products.subCategories.cream")}
        </option>

        <option value="Makhmaria">
          {t("products.categories.makhmaria")}
        </option>
      </AppSelect>
    )}

    {/* Original Category */}
    {newProductType === "original" && (
      <AppSelect
        value={newProductCategory}
        onChange={(e) =>
          setNewProductCategory(
            e.target.value
          )
        }
      >
        <option value="">
          {t("products.selectCategory")}
        </option>

        <option value="Original">
          {t("products.categories.original")}
        </option>
      </AppSelect>
    )}

    {/* Oil Category */}
    {newProductType === "oil" && (
      <>
        <AppSelect
          value={newOilCategory}
          onChange={(e) =>
            setNewOilCategory(
              e.target.value
            )
          }
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
        </AppSelect>

        <AppSelect
          value={newPricingTier}
          onChange={(e) =>
            setNewPricingTier(
              e.target.value
            )
          }
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
        </AppSelect>
      </>
    )}

    {/* Cost */}
    <AppInput
      type="number"
      placeholder={t("products.costPrice")}
      value={newProductCost}
      onChange={(e) =>
        setNewProductCost(e.target.value)
      }
    />

    {/* Selling Price */}
    {(
      newProductType === "product" ||
      newProductType === "original"
    ) && (
      <AppInput
        type="number"
        placeholder={t("products.sellingPrice")}
        value={newProductPrice}
        onChange={(e) =>
          setNewProductPrice(e.target.value)
        }
      />
    )}

    {/* Create */}
    <AppButton
      type="button"
      fullWidth
      size="lg"
      loading={createLoading}
      onClick={handleCreateProduct}
      variant="primary"
    >
      {t("products.createProduct")}
    </AppButton>

  </div>
</AppCard>
                </div>

    </>

  );

}
import SectionCard from "../ui/layout/SectionCard";
import SearchInput from "../ui/forms/SearchInput";
import ProductRow from "./ProductRow";
import AccordionGroup from "../ui/layout/AccordionGroup";
import {
  groupContainers,
  groupOils
} from "../../utils/productGroups";
export default function ProductsManagement({
  openProductHistory,
  

  groupedProducts,

  openGroups,
  setOpenGroups,

  openContainerGroups,
  setOpenContainerGroups,

  openOilGroups,
  setOpenOilGroups,

  handleArchiveProduct,

  productSearch,
  setProductSearch,
  setEditingProduct,

setEditProductData
}) {
const renderProductRow = (product) => (
  <ProductRow
    key={product.id}

    product={product}

    openProductHistory={
      openProductHistory
    }

    handleArchiveProduct={
      handleArchiveProduct
    }

    setEditingProduct={
      setEditingProduct
    }

    setEditProductData={
      setEditProductData
    }
  />
);
  return (

    <>
      <SectionCard

  title="📦 Products Management"

  style={{
    marginTop: "25px",
  }}
>

  

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}
  >
    <SearchInput
  value={productSearch}

  onChange={(e) =>
    setProductSearch(e.target.value)
  }

  placeholder="Search products..."
/>
    {Object.entries(groupedProducts).map(
  ([groupName, items]) => (

    <div
      key={groupName}
      style={{
        marginBottom: "25px"
      }}
    >

      <AccordionGroup
  title={
    <>
      {groupName === "oil" &&
        `🛢 Oils (${items.length})`}

      {groupName === "container" &&
        `📦 Containers (${items.length})`}

      {groupName === "product" &&
        `🧴 Products (${items.length})`}

      {groupName === "original" &&
        `✨ Originals (${items.length})`}

      {groupName === "packaging" &&
        `📦 Packaging (${items.length})`}
    </>
  }

  isOpen={
    openGroups[groupName]
  }

  onToggle={() =>

    setOpenGroups(prev => ({
      ...prev,

      [groupName]:
        !prev[groupName]
    }))

  }
>

      

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}
  >

        {openGroups[groupName] && (

  groupName === "container"
  ? Object.entries(
  groupContainers(items)


    ).map(([subGroup, subItems]) => (

  <div
    key={subGroup}
          style={{
            marginBottom: "15px"
          }}
        >

          <AccordionGroup
  title={
    <>
      {subGroup === "bottle" &&
        `🧴 Bottles (${subItems.length})`}

      {subGroup === "box" &&
        `📦 Boxes (${subItems.length})`}

      {subGroup === "sample" &&
        `🧪 Samples (${subItems.length})`}
    </>
  }

  isOpen={
    openContainerGroups[subGroup]
  }

  onToggle={() =>

    setOpenContainerGroups(prev => ({
      ...prev,

      [subGroup]:
        !prev[subGroup]
    }))

  }

  background="#e5e7eb"

  buttonStyle={{
    padding: "10px 14px",
  }}
>

          
            

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >

              {subItems.map(renderProductRow)}

            </div>
            </AccordionGroup>
          </div>

        

      ))

    : groupName === "oil"

? Object.entries(
  groupOils(items)


  ).map(([oilGroup, oilItems]) => (

    <div
      key={oilGroup}
      style={{
        marginBottom: "15px"
      }}
    >

      <AccordionGroup
  title={
    <>
      {oilGroup === "French" &&
        `🇫🇷 French (${oilItems.length})`}

      {oilGroup === "Oriental-A" &&
        `🕌 Oriental A (${oilItems.length})`}

      {oilGroup === "Oriental-B" &&
        `🕌 Oriental B (${oilItems.length})`}

      {oilGroup === "Oriental-C" &&
        `🕌 Oriental C (${oilItems.length})`}

      {oilGroup === "Musk" &&
        `🧼 Musks (${oilItems.length})`}
    </>
  }

  isOpen={
    openOilGroups[oilGroup]
  }

  onToggle={() =>

    setOpenOilGroups(prev => ({
      ...prev,

      [oilGroup]:
        !prev[oilGroup]
    }))

  }

  background="#e0f2fe"

  buttonStyle={{
    padding: "10px 14px",
  }}
>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}
  >
          {oilItems.map(renderProductRow)}

        </div>
        
      </AccordionGroup>

    </div>

  ))

: items.map(renderProductRow)
)}
      </div>
      </AccordionGroup>
</div>
    
  )
)}
  </div>
</SectionCard>
    </>
  );
}
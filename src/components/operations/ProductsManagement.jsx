import SectionCard from "../ui/layout/SectionCard";
import SearchInput from "../ui/forms/SearchInput";
import AccordionGroup from "../ui/layout/AccordionGroup";

import ProductRow from "./ProductRow";

import {
  groupContainers,
  groupOils,
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
  setEditProductData,
}) {
  const renderProductRow = (product) => (
    <ProductRow
      key={product.id}
      product={product}
      openProductHistory={openProductHistory}
      handleArchiveProduct={handleArchiveProduct}
      setEditingProduct={setEditingProduct}
      setEditProductData={setEditProductData}
    />
  );

  const getGroupTitle = (groupName, count) => {
    const titles = {
      oil: `🛢 Oils (${count})`,
      container: `📦 Containers (${count})`,
      product: `🧴 Products (${count})`,
      original: `✨ Originals (${count})`,
      packaging: `📦 Packaging (${count})`,
    };

    return titles[groupName] || `${groupName} (${count})`;
  };

  const getContainerGroupTitle = (groupName, count) => {
    const titles = {
      bottle: `🧴 Bottles (${count})`,
      box: `📦 Boxes (${count})`,
      sample: `🧪 Samples (${count})`,
    };

    return titles[groupName] || `${groupName} (${count})`;
  };

  const getOilGroupTitle = (groupName, count) => {
    const titles = {
      French: `🇫🇷 French (${count})`,
      "Oriental-A": `🕌 Oriental A (${count})`,
      "Oriental-B": `🕌 Oriental B (${count})`,
      "Oriental-C": `🕌 Oriental C (${count})`,
      Musk: `🧼 Musks (${count})`,
    };

    return titles[groupName] || `${groupName} (${count})`;
  };

  return (
    <SectionCard
      title="📦 Products Management"
      style={{
        marginTop: "25px",
      }}
    >
      {/* Search */}
      <SearchInput
        value={productSearch}
        onChange={(e) => setProductSearch(e.target.value)}
        placeholder="Search products..."
      />

      {/* Product Groups */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {Object.entries(groupedProducts).map(
          ([groupName, items]) => (
            <AccordionGroup
              key={groupName}
              title={getGroupTitle(
                groupName,
                items.length
              )}
              isOpen={openGroups[groupName]}
              onToggle={() =>
                setOpenGroups((prev) => ({
                  ...prev,
                  [groupName]:
                    !prev[groupName],
                }))
              }
            >
              {openGroups[groupName] && (
                <>
                  {/* Containers */}
                  {groupName === "container" &&
                    Object.entries(
                      groupContainers(items)
                    ).map(
                      ([subGroup, subItems]) => (
                        <div
                          key={subGroup}
                          style={{
                            marginBottom: "14px",
                          }}
                        >
                          <AccordionGroup
                            title={getContainerGroupTitle(
                              subGroup,
                              subItems.length
                            )}
                            isOpen={
                              openContainerGroups[
                                subGroup
                              ]
                            }
                            onToggle={() =>
                              setOpenContainerGroups(
                                (prev) => ({
                                  ...prev,
                                  [subGroup]:
                                    !prev[
                                      subGroup
                                    ],
                                })
                              )
                            }
                            background="#e5e7eb"
                            buttonStyle={{
                              padding:
                                "10px 14px",
                            }}
                          >
                            {openContainerGroups[
                              subGroup
                            ] && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection:
                                    "column",
                                  gap: "10px",
                                  paddingTop:
                                    "10px",
                                }}
                              >
                                {subItems.map(
                                  renderProductRow
                                )}
                              </div>
                            )}
                          </AccordionGroup>
                        </div>
                      )
                    )}

                  {/* Oils */}
                  {groupName === "oil" &&
                    Object.entries(
                      groupOils(items)
                    ).map(
                      ([oilGroup, oilItems]) => (
                        <div
                          key={oilGroup}
                          style={{
                            marginBottom: "14px",
                          }}
                        >
                          <AccordionGroup
                            title={getOilGroupTitle(
                              oilGroup,
                              oilItems.length
                            )}
                            isOpen={
                              openOilGroups[
                                oilGroup
                              ]
                            }
                            onToggle={() =>
                              setOpenOilGroups(
                                (prev) => ({
                                  ...prev,
                                  [oilGroup]:
                                    !prev[
                                      oilGroup
                                    ],
                                })
                              )
                            }
                            background="#e0f2fe"
                            buttonStyle={{
                              padding:
                                "10px 14px",
                            }}
                          >
                            {openOilGroups[
                              oilGroup
                            ] && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection:
                                    "column",
                                  gap: "10px",
                                  paddingTop:
                                    "10px",
                                }}
                              >
                                {oilItems.map(
                                  renderProductRow
                                )}
                              </div>
                            )}
                          </AccordionGroup>
                        </div>
                      )
                    )}

                  {/* Normal Products */}
                  {groupName !== "container" &&
                    groupName !== "oil" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            "column",
                          gap: "10px",
                          paddingTop: "10px",
                        }}
                      >
                        {items.map(
                          renderProductRow
                        )}
                      </div>
                    )}
                </>
              )}
            </AccordionGroup>
          )
        )}
      </div>
    </SectionCard>
  );
}
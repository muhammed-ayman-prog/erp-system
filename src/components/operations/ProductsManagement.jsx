export default function ProductsManagement({
  openProductHistory,
  activeAction,
  COLORS,

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

  return (

    <>
      <div
  style={{
    background: "#fff",
    padding: "20px",
    borderRadius: "15px",
    marginTop: "25px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9"
  }}
>

  <h3
    style={{
      marginBottom: "15px",
      fontSize: "18px",
      fontWeight: "700"
    }}
  >
    📦 Products Management
  </h3>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}
  >
    <input
  type="text"
  placeholder="Search products..."

  value={productSearch}

  onChange={(e) =>
    setProductSearch(e.target.value)
  }

  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "15px"
  }}
/>
    {Object.entries(groupedProducts).map(
  ([groupName, items]) => (

    <div
      key={groupName}
      style={{
        marginBottom: "25px"
      }}
    >

      <button
  onClick={() =>

    setOpenGroups(prev => ({
      ...prev,

      [groupName]:
        !prev[groupName]
    }))

  }

  style={{
    width: "100%",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "12px 15px",

    borderRadius: "12px",

    border: "none",

    background: "#f3f4f6",

    cursor: "pointer",

    fontWeight: "700",

    fontSize: "16px",

    color: COLORS.dark,

    marginBottom: "10px"
  }}
>

  <span>

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

  </span>

  <span>

    {openGroups[groupName]
      ? "−"
      : "+"}

  </span>

</button>

      <div
  style={{
    maxHeight:
      openGroups[groupName]
        ? "9999px"
        : "0px",

    overflow: "hidden",

    transition:
      "max-height 0.3s ease"
  }}
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

      items.reduce((acc, product) => {

        const sub =
          (
            product.subCategory ||
            ""
          ).toLowerCase().trim();

        const normalizedSub =

          sub === "samples"
            ? "sample"
            : sub;

        if (
          normalizedSub !== "bottle" &&
          normalizedSub !== "box" &&
          normalizedSub !== "sample"
        ) {
          return acc;
        }

        if (!acc[normalizedSub]) {
          acc[normalizedSub] = [];
        }

        acc[normalizedSub].push(product);

        return acc;

      }, {})

    ).map(([subGroup, subItems]) => (

  <div
    key={subGroup}
          style={{
            marginBottom: "15px"
          }}
        >

          <button
            onClick={() =>

            setOpenContainerGroups(prev => ({
            ...prev,
            [subGroup]: !prev[subGroup]
          }))

          }

            style={{
              width: "100%",

              padding: "10px 14px",

              borderRadius: "10px",

              border: "none",

              background: "#e5e7eb",

              cursor: "pointer",

              fontWeight: "700",

              display: "flex",

              justifyContent: "space-between",

              alignItems: "center"
            }}
          >

            <span>

              {subGroup === "bottle" &&
                `🧴 Bottles (${subItems.length})`}

              {subGroup === "box" &&
                `📦 Boxes (${subItems.length})`}

              {subGroup === "sample" &&
                `🧪 Samples (${subItems.length})`}

            </span>

            <span>
              {openContainerGroups[subGroup]
                ? "−"
                : "+"}
            </span>

          </button>

          <div
            style={{
              maxHeight:
                openContainerGroups[subGroup]
                  ? "9999px"
                  : "0px",

              overflow: "hidden",

              transition:
                "max-height 0.3s ease",

              marginTop: "10px"
            }}
          >

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >

              {subItems.map(product => (

                <div
                  key={product.id}

                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-2px)";
                  }}

                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(0px)";
                  }}

                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    transition: "0.2s"
                  }}
                >

                  <div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "5px"
                      }}
                    >

                      <p style={{ fontWeight: "700" }}>
                        {product.name}
                      </p>

                      <span
                        style={{
                          background:
                            product.type === "oil"
                              ? "#dbeafe"
                              : product.type ===
                                "container"
                              ? "#fef3c7"
                              : "#dcfce7",

                          color: "#111827",

                          padding: "3px 8px",

                          borderRadius: "999px",

                          fontSize: "11px",

                          fontWeight: "700"
                        }}
                      >
                        {product.type}
                      </span>

                    </div>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280"
                      }}
                    >
                      {product.type}
                      {" • "}
                      {product.category ||
                        product.subCategory}
                    </p>

                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center"
                    }}
                  >
                  <button
                onClick={() => {

                  setEditingProduct(product);

                  setEditProductData({
                    name:
                      product.name || "",

                    costPrice:
                      product.costPrice || 0,

                    

                    minStock:
                      product.minStock || 0
                  });

                }}

                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f59e0b",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ✏️ Edit
              </button>
              <button
  onClick={() =>
    openProductHistory(product)
  }

  style={{
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  🕘 History
</button>
                  <button
                    onClick={() =>
                      handleArchiveProduct(product)
                    }

                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "none",
                      background: COLORS.danger,
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    📦 Archive
                  </button>
                    </div>
                </div>

              ))}

            </div>

          </div>

        </div>

      ))

    : groupName === "oil"

? Object.entries(

    items.reduce((acc, product) => {

  const rawCategory =
  (
    product.category || ""
  ).trim().toLowerCase();

const pricingTier =
  (
    product.pricingTier || ""
  ).trim().toUpperCase();

const category =

  rawCategory.includes("french")
    ? "French"

  // 🔥 OLD DATA SUPPORT
  : rawCategory.includes("oriental-a")
    ? "Oriental-A"

  : rawCategory.includes("oriental-b")
    ? "Oriental-B"

  : rawCategory.includes("oriental-c")
    ? "Oriental-C"

  // 🔥 NEW DATA SUPPORT
  : rawCategory.includes("oriental") &&
    pricingTier === "A"
    ? "Oriental-A"

  : rawCategory.includes("oriental") &&
    pricingTier === "B"
    ? "Oriental-B"

  : rawCategory.includes("oriental") &&
    pricingTier === "C"
    ? "Oriental-C"

  : rawCategory.includes("musk")
    ? "Musk"

  : "Other";

  if (category === "Other") {
    return acc;
  }

  if (!acc[category]) {
    acc[category] = [];
  }

  acc[category].push(product);

  return acc;

}, {})

  ).map(([oilGroup, oilItems]) => (

    <div
      key={oilGroup}
      style={{
        marginBottom: "15px"
      }}
    >

      <button
        onClick={() =>

        setOpenOilGroups(prev => ({
        ...prev,
        [oilGroup]: !prev[oilGroup]
      }))

      }

        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "none",
          background: "#e0f2fe",
          cursor: "pointer",
          fontWeight: "700",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >

        <span>

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

        </span>

        <span>
          {openOilGroups[oilGroup]
            ? "−"
            : "+"}
        </span>

      </button>

      <div
        style={{
          maxHeight:
            openOilGroups[oilGroup]
              ? "9999px"
              : "0px",

          overflow: "hidden",

          transition:
            "max-height 0.3s ease",

          marginTop: "10px"
        }}
      >

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >

          {oilItems.map(product => (

            <div
              key={product.id}

              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px"
              }}
            >

              <div>

                <p style={{ fontWeight: "700" }}>
                  {product.name}
                </p>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b7280"
                  }}
                >
                  {product.category}
                </p>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center"
                }}
              >
              <button
                onClick={() => {

                  setEditingProduct(product);

                  setEditProductData({
                    name:
                      product.name || "",

                    costPrice:
                      product.costPrice || 0,

                    

                    minStock:
                      product.minStock || 0
                  });

                }}

                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f59e0b",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ✏️ Edit
              </button>
              <button
  onClick={() =>
    openProductHistory(product)
  }

  style={{
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  🕘 History
</button>
              <button
                onClick={() =>
                  handleArchiveProduct(product)
                }

                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: COLORS.danger,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                📦 Archive
              </button>
                </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  ))

: items.map(product => (

        <div
          key={product.id}

          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-2px)";
          }}

          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0px)";
          }}

          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            transition: "0.2s"
          }}
        >

          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "5px"
              }}
            >

              <p style={{ fontWeight: "700" }}>
                {product.name}
              </p>

              <span
                style={{
                  background:
                    product.type === "oil"
                      ? "#dbeafe"
                      : product.type ===
                        "container"
                      ? "#fef3c7"
                      : "#dcfce7",

                  color: "#111827",

                  padding: "3px 8px",

                  borderRadius: "999px",

                  fontSize: "11px",

                  fontWeight: "700"
                }}
              >
                {product.type}
              </span>

            </div>

            <p
              style={{
                fontSize: "13px",
                color: "#6b7280"
              }}
            >
              {product.type}
              {" • "}
              {product.category ||
                product.subCategory}
            </p>

          </div>

          
          
  <div
  style={{
    display: "flex",
    gap: "10px",
    alignItems: "center"
  }}
>
  <button
  onClick={() => {

    setEditingProduct(product);

    setEditProductData({
      name:
        product.name || "",

      costPrice:
        product.costPrice || 0,

      

      minStock:
        product.minStock || 0
    });

  }}

  style={{
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    cursor: "pointer",
  }}
>
  ✏️ Edit
</button>
<button
  onClick={() =>
    openProductHistory(product)
  }

  style={{
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  🕘 History
</button>
          <button
            onClick={() =>
              handleArchiveProduct(product)
            }

            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              background: COLORS.danger,
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            📦 Archive
          </button>
          </div>
          </div>

        

      ))

)}

      </div>
</div>

    </div>

  )
)}

  </div>

</div>
    </>

  );

}
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { useTranslate } from "../useTranslate";
import { db } from "../firebase";
export default function Pricing() {
const { t, tt, lang } = useTranslate();
const [pricing, setPricing] = useState([]);
const [readyProducts, setReadyProducts] = useState([]);
const [openSections, setOpenSections] =
  useState({
    french: false,
    french_bottles: false,
    french_samples: false,
    french_oil: false,
    french_boxes: false,

    oriental: false,
    oriental_bottles: false,
    oriental_samples: false,
    oriental_oil: false,
    oriental_boxes: false,
    musk: false,

    originals: false,
    creams: false,
    makhmaria: false
  });   
  // 🔥 fetch pricing
  useEffect(() => {

    const fetchPricing = async () => {

      const snapshot = await getDocs(
        collection(db, "pricing")
      );

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPricing(
  data.sort((a, b) => {

    const aName =
      `${a.category}_${a.grade || ""}_${a.container || ""}_${a.size || ""}`;

    const bName =
      `${b.category}_${b.grade || ""}_${b.container || ""}_${b.size || ""}`;

    return aName.localeCompare(bName);
  })
);
// 🔥 Ready Products
const readySnapshot = await getDocs(
  collection(db, "products")
);

const readyData = readySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

setReadyProducts(
  readyData.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
);
    };

    fetchPricing();

  }, []);

  
  // 🔥 grouped pricing
  
  const frenchPricing = useMemo(() => {

    return pricing.filter(
      p => p.category === "french"
    );

  }, [pricing]);
  const frenchBottlePricing = useMemo(() => {

  return frenchPricing.filter(
    p => p.container === "bottle"
  );

}, [frenchPricing]);

const frenchSamplePricing = useMemo(() => {

  return frenchPricing.filter(
    p => p.container === "sample"
  );

}, [frenchPricing]);



  const orientalPricing = useMemo(() => {

    return pricing.filter(
      p => p.category === "oriental"
    );

  }, [pricing]);
  const orientalBottlePricing = useMemo(() => {

  return orientalPricing.filter(
    p => p.container === "bottle"
  );

}, [orientalPricing]);

const orientalSamplePricing = useMemo(() => {

  return orientalPricing.filter(
    p => p.container === "sample"
  );

}, [orientalPricing]);
const extrasPricing = useMemo(() => {

  return pricing.filter(
    p =>
      p.category === "french_oil" ||
      p.category === "oriental_oil" ||
      p.category === "box_extra" 
      
  );

}, [pricing]);
const orientalOilPricing = useMemo(() => {

  return extrasPricing.filter(
    p => p.category === "oriental_oil"
  );

}, [extrasPricing]);

const orientalBoxPricing = useMemo(() => {

  return extrasPricing.filter(
    p => p.category === "box_extra"
  );

}, [extrasPricing]);

  const muskPricing = useMemo(() => {

  return pricing.filter(
    p => p.category?.startsWith("musk_")
  );

}, [pricing]);


const frenchOilPricing = useMemo(() => {

  return extrasPricing.filter(
    p => p.category === "french_oil"
  );

}, [extrasPricing]);
const frenchBoxProducts = useMemo(() => {

  return readyProducts.filter(
    p => p.subCategory === "box"
  );

}, [readyProducts]);


const originalProducts = useMemo(() => {

  return readyProducts.filter(
    p => p.type === "original" &&
(
  p.price >= 0 ||
  p.sellingPrice >= 0
)
  );

}, [readyProducts]);

const creamProducts = useMemo(() => {

  return readyProducts.filter(
    p =>
      p.category?.toLowerCase() === "cream" &&
(
  p.price >= 0 ||
  p.sellingPrice >= 0
)
  );

}, [readyProducts]);

const makhmariaProducts = useMemo(() => {

  return readyProducts.filter(
    p =>
      p.category?.toLowerCase() === "makhmaria" &&
(
  p.price >= 0 ||
  p.sellingPrice >= 0
)
  );

}, [readyProducts]);
const packagingProducts = useMemo(() => {

  return readyProducts.filter(
    p =>
      p.type?.toLowerCase() === "packaging" &&
      (
        p.price >= 0 ||
        p.sellingPrice >= 0
      )
  );

}, [readyProducts]);

  // 🔥 update price
  const handlePriceChange = async (
    id,
    value
  ) => {

    const numeric = Math.max(0, Number(value));

    setPricing(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              price: numeric
            }
          : item
      )
    );

    try {

      await updateDoc(
        doc(db, "pricing", id),
        {
          price: numeric
        }
      );

    } catch (err) {

      console.error(err);

    }
  };
  const handleReadyPriceChange = async (
  id,
  value
) => {

  const numeric = Math.max(
  0,
  Number(value)
);

  setReadyProducts(prev =>
  prev.map(item =>
    item.id === id
      ? {
          ...item,
          sellingPrice: numeric,
          price: numeric
        }
      : item
  )
);

  try {

    await updateDoc(
        doc(db, "products", id),
        {
            sellingPrice: numeric,
            price: numeric
        }
    );

  } catch (err) {

    console.error(err);

  }
};
const toggleSection = (key) => {

  setOpenSections(prev => ({
    ...prev,
    [key]: !prev[key]
  }));

};

  const renderPricingTable = (
  key,
  title,
  data
) => (

    <div
      style={{
        background: "#f9fafb",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #e5e7eb"
      }}
    >

      <h2
  onClick={() => toggleSection(key)}

  style={{
  marginBottom: "20px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f3f4f6",
  padding: "14px 18px",
  borderRadius: "14px"
}}
>

  <span>{title}</span>

  <span>
    {openSections[key] ? "−" : "+"}
  </span>

</h2>
    {openSections[key] && (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr 1fr 120px",
    gap: "10px",
    marginBottom: "10px",
    fontWeight: "700",
    padding: "0 12px"
  }}
>

  <div>Size</div>

  <div>Container</div>

  <div>Category</div>

  <div>Price</div>

</div>

        {data.map(item => (

          <div
            key={item.id}

            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr 1fr 120px",

              gap: "10px",

              alignItems: "center",

              background: "#fff",

              padding: "12px",

              borderRadius: "12px"
            }}
          >

            <div>
            {item.size || "-"}
            </div>

            <div>
            {item.container || "-"}
            </div>

            <div>
            {item.grade ||
                item.category ||
                "-"}
            </div>

            <input
  type="number"
  min="0"

  value={item.price}

  onChange={(e) =>
    handlePriceChange(
      item.id,
      e.target.value
    )
  }

  style={{
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    width: "100%",
    boxSizing: "border-box"
  }}
/>

          </div>
        ))}

      </div>

)}
    </div>
  );
const renderReadyProductsTable = (
  key,
  title,
  data
) => (

  <div
    style={{
        background: "#f9fafb",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #e5e7eb"
    }}
  >

    <h2
  onClick={() => toggleSection(key)}

  style={{
  marginBottom: "20px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f3f4f6",
  padding: "14px 18px",
  borderRadius: "14px"
}}
>

  <span>{title}</span>

  <span>
    {openSections[key] ? "−" : "+"}
  </span>

</h2>
{openSections[key] && (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 140px",
          gap: "10px",
          marginBottom: "10px",
          fontWeight: "700",
          padding: "0 12px"
        }}
      >

        <div>Product</div>

        <div>Price</div>

      </div>

      {data.map(item => (

        <div
          key={item.id}

          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 140px",

            gap: "10px",

            alignItems: "center",

            background: "#fff",

            padding: "12px",

            borderRadius: "12px"
          }}
        >

          <div>
            {item.name}
          </div>

          <input
            type="number"
            min="0"

            value={
  item.sellingPrice ??
  item.price ??
  0
}

            onChange={(e) =>
              handleReadyPriceChange(
                item.id,
                e.target.value
              )
            }

            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              width: "100%",
              boxSizing: "border-box"
            }}
          />

        </div>
      ))}

    </div>

)}

  </div>
);
const renderExtrasTable = (
  key,
  title,
  data
) => (

  <div
    style={{
    background: "#f9fafb",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb"
    }}
  >

    <h2
  onClick={() => toggleSection(key)}

  style={{
  marginBottom: "20px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f3f4f6",
  padding: "14px 18px",
  borderRadius: "14px"
}}
>

  <span>{title}</span>

  <span>
    {openSections[key] ? "−" : "+"}
  </span>

</h2>
  {openSections[key] && (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 140px",
          gap: "10px",
          marginBottom: "10px",
          fontWeight: "700",
          padding: "0 12px"
        }}
      >

        <div>Type</div>

        <div>Price</div>

      </div>

      {data.map(item => {

        const label =
          item.category === "french_oil"
            ? "French Pure Oil"

          : item.category === "box_extra"
            ? `Oriental Box ${item.grade}`

          : item.category === "oriental_oil"
            ? `Oriental Oil ${item.grade}`

          : item.category;

        return (

          <div
            key={item.id}

            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 140px",

              gap: "10px",

              alignItems: "center",

              background: "#fff",

              padding: "12px",

              borderRadius: "12px"
            }}
          >

            <div>
              {label}
            </div>

            <input
              type="number"
              min="0"

              value={item.price}

              onChange={(e) =>
                handlePriceChange(
                  item.id,
                  e.target.value
                )
              }

              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                width: "100%",
                boxSizing: "border-box"
              }}
            />

          </div>
        );
      })}

    </div>

)}

  </div>
);

  return (

    <div
      style={{
        padding: "30px",
        maxWidth: "1100px",
        margin: "auto"
      }}
    >

      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "25px"
        }}
      >
        Pricing Management 💰
      </h1>
      

      <div
  style={{
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "25px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)"
  }}
>

  <h2
    onClick={() => toggleSection("french")}

    style={{
      marginBottom: "20px",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#f3f4f6",
      padding: "14px 18px",
      borderRadius: "14px"
    }}
  >

    <span>French</span>

    <span>
      {openSections.french ? "−" : "+"}
    </span>

  </h2>

  {openSections.french && (

    <>

      {renderPricingTable(
        "french_bottles",
        "French Bottles",
        frenchBottlePricing
      )}

      {renderPricingTable(
        "french_samples",
        "French Samples",
        frenchSamplePricing
      )}

      {renderReadyProductsTable(
        "french_boxes",
        "French Boxes",
        frenchBoxProducts
      )}

      {renderExtrasTable(
        "french_oil",
        "French Pure Oil",
        frenchOilPricing
      )}

    </>

  )}

</div>

      <div
  style={{
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "25px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)"
  }}
>

  <h2
    onClick={() => toggleSection("oriental")}

    style={{
      marginBottom: "20px",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#f3f4f6",
      padding: "14px 18px",
      borderRadius: "14px"
    }}
  >

    <span>Oriental</span>

    <span>
      {openSections.oriental ? "−" : "+"}
    </span>

  </h2>

  {openSections.oriental && (

    <>

      {renderPricingTable(
        "oriental_bottles",
        "Oriental Bottles",
        orientalBottlePricing
      )}

      {renderPricingTable(
        "oriental_samples",
        "Oriental Samples",
        orientalSamplePricing
      )}

      {renderExtrasTable(
        "oriental_boxes",
        "Oriental Box Extras",
        orientalBoxPricing
      )}

      {renderExtrasTable(
        "oriental_oil",
        "Oriental Pure Oil",
        orientalOilPricing
      )}

    </>

  )}

</div>

      {renderPricingTable(
        "musk",
        "Musk",
        muskPricing
        )}
{originalProducts.length > 0 &&
  renderReadyProductsTable(
  "originals",
  "Originals",
  originalProducts
)}

{creamProducts.length > 0 &&
  renderReadyProductsTable(
  "creams",
  "Creams",
  creamProducts
)}

{makhmariaProducts.length > 0 &&
  renderReadyProductsTable(
  "makhmaria",
  "Makhmaria",
  makhmariaProducts
)}
{packagingProducts.length > 0 &&
  renderReadyProductsTable(
    "packaging",
    "Packaging",
    packagingProducts
)}

    </div>
  );
}
export default function EditProductModal({

  editingProduct,

  editProductData,

  setEditProductData,

  setEditingProduct,

  handleSaveProductEdit

}) {

  if (!editingProduct) return null;

  return (

    <div
      onClick={() =>
        setEditingProduct(null)
      }

      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "rgba(0,0,0,0.4)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        zIndex: 9999
      }}
    >

      <div
        onClick={(e) =>
          e.stopPropagation()
        }

        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "20px",
          width: "400px"
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

  <h3>
    ✏️ Edit Product
  </h3>

  
  <button
    onClick={() =>
      setEditingProduct(null)
    }

    style={{
      border: "none",
      background: "transparent",
      fontSize: "20px",
      cursor: "pointer",
      color: "#6b7280",
      fontWeight: "700"
    }}
  >
    ✕
  </button>

</div>
        <p
            style={{
                fontWeight: "600",
                marginBottom: "6px"
            }}
            >
            Product Name
            </p>
        <input
          type="text"

          value={editProductData.name}

          onChange={(e) =>
            setEditProductData(prev => ({
              ...prev,
              name: e.target.value
            }))
          }

          placeholder="Name"

          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "10px"
          }}
        />
        <p
  style={{
    fontWeight: "600",
    marginBottom: "6px",
    marginTop: "10px"
  }}
>
  Cost Price
</p>
        <input
          type="number"

          value={
            editProductData.costPrice
          }

          onChange={(e) =>
            setEditProductData(prev => ({
              ...prev,
              costPrice:
                Number(e.target.value)
            }))
          }

          placeholder="Cost Price"

          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "10px"
          }}
        />
        
        <p
        style={{
            fontWeight: "600",
            marginBottom: "6px",
            marginTop: "10px"
        }}
        >
        Minimum Stock Alert
        </p>
        <input
          type="number"

          value={
            editProductData.minStock
          }

          onChange={(e) =>
            setEditProductData(prev => ({
              ...prev,
              minStock:
                Number(e.target.value)
            }))
          }

          placeholder="Min Stock"

          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginBottom: "20px"
          }}
        />

        <button
          onClick={
            handleSaveProductEdit
          }

          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          💾 Save
        </button>

      </div>

    </div>

  );

}
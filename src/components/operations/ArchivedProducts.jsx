export default function ArchivedProducts({

  archivedProducts,

  handleRestoreProduct

}) {

  return (

    <div
      style={{
        marginTop: "25px"
      }}
    >

      <h3
        style={{
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "20px"
        }}
      >
        ♻️ Archived Products
      </h3>

      {archivedProducts.length === 0 && (
        <p>No archived products</p>
      )}

      {archivedProducts.map(product => (

        <div
          key={product.id}

          style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #f1f5f9",
            marginBottom: "10px",
            boxShadow:
              "0 5px 15px rgba(0,0,0,0.05)"
          }}
        >

          <p
            style={{
              fontWeight: "700"
            }}
          >
            {product.name}
          </p>

          <p>
            {product.type}
          </p>

          <button
            onClick={() =>
              handleRestoreProduct(product)
            }

            style={{
              marginTop: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              background: "#10b981",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            ♻️ Restore
          </button>

        </div>

      ))}

    </div>

  );

}
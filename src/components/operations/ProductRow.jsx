import AppButton from "../ui/AppButton";
import Flex from "../ui/layout/Flex";

export default function ProductRow({
  product,

  openProductHistory,

  handleArchiveProduct,

  setEditingProduct,

  setEditProductData,
}) {

  return (

    <div

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

        transition: "0.2s",
      }}
    >

      <div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "5px",
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
                  : product.type === "container"
                  ? "#fef3c7"
                  : "#dcfce7",

              color: "#111827",

              padding: "3px 8px",

              borderRadius: "999px",

              fontSize: "11px",

              fontWeight: "700",
            }}
          >
            {product.type}
          </span>

        </div>

        <p
          style={{
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          {product.type}
          {" • "}
          {product.category ||
            product.subCategory}
        </p>

      </div>

      <Flex gap="10px">

        <AppButton
          size="sm"

          style={{
            background: "#f59e0b",
            color: "#fff",
          }}

          onClick={() => {

            setEditingProduct(product);

            setEditProductData({
              name:
                product.name || "",

              costPrice:
                product.costPrice || 0,

              minStock:
                product.minStock || 0,
            });

          }}
        >
          ✏️ Edit
        </AppButton>

        <AppButton
          size="sm"

          style={{
            background: "#6366f1",
            color: "#fff",
          }}

          onClick={() =>
            openProductHistory(product)
          }
        >
          🕘 History
        </AppButton>

        <AppButton
          variant="danger"

          size="sm"

          onClick={() =>
            handleArchiveProduct(product)
          }
        >
          📦 Archive
        </AppButton>

      </Flex>

    </div>

  );

}
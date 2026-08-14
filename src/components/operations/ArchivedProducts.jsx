import AppCard from "../ui/AppCard";
import AppButton from "../ui/AppButton";
import AppEmptyState from "../ui/AppEmptyState";

export default function ArchivedProducts({
  archivedProducts,
  handleRestoreProduct,
}) {
  return (
    <AppCard
      padding="lg"
      radius="lg"
      shadow="sm"
      style={{
        marginTop: "25px",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: "20px",
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        ♻️ Archived Products
      </h3>

      {archivedProducts.length === 0 ? (
        <AppEmptyState title="No archived products" />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {archivedProducts.map((product) => (
            <AppCard
              key={product.id}
              padding="md"
              radius="md"
              shadow="sm"
              bordered
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {product.name}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    {product.type}
                  </div>
                </div>

                <AppButton
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={() =>
                    handleRestoreProduct(product)
                  }
                >
                  ♻️ Restore
                </AppButton>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </AppCard>
  );
}
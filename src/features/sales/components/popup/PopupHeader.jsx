export default function PopupHeader({
  selectedProduct,
  theme
}) {

  if (!selectedProduct) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: "16px"
      }}
    >
      <div
        style={{
          fontSize: "22px",
          fontWeight: "700",
          color:
            theme.colors.textPrimary
        }}
      >
        {selectedProduct.name}
      </div>

      <div
        style={{
          marginTop: "4px",
          fontSize: "13px",
          color:
            theme.colors.textSecondary
        }}
      >
        {selectedProduct.category}
      </div>
    </div>
  );
}